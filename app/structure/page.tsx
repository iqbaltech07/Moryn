"use client";

import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  BackgroundVariant,
} from "@xyflow/react";
import { apiClient } from "@/lib/utils/apiClient";
import { useProjectStore } from "@/stores/useProjectStore";
import "@xyflow/react/dist/style.css";
import StepNavbar from "../components/layout/StepNavbar";
import ProjectHeaderBrand from "../components/layout/ProjectHeaderBrand";
import { StructureSkeleton } from "../components/shared";

import { RootNode } from "./components/RootNode";
import { CategoryNode } from "./components/CategoryNode";
import { SubFeatureGroupNode } from "./components/SubFeatureGroupNode";
import { TasksGroupNode } from "./components/TasksGroupNode";
import { ColoredEdge } from "./components/ColoredEdge";
import { buildGraph } from "./components/graphBuilder";
import type { StrukturData, StrukturNode, StrukturChild, TaskItem } from "./components/types";

const nodeTypes = {
  root: RootNode,
  category: CategoryNode,
  subfeature: SubFeatureGroupNode,
  tasks: TasksGroupNode,
};
const edgeTypes = { colored: ColoredEdge };

function StrukturPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [rawData, setRawData] = useState<StrukturData | null>(null);
  const [tasksList, setTasksList] = useState<TaskItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const rawDataRef = useRef<StrukturData | null>(null);
  rawDataRef.current = rawData;

  const handleNodeLabelChange = useCallback(
    (id: string, field: string, value: string) => {
      setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n)));
    },
    [setNodes]
  );

  const handleNodeDelete = useCallback(
    (id: string) => {
      setEdges((currentEdges) => {
        // Collect direct downstream targets (e.g. SubFeature node)
        const directTargets = currentEdges.filter((e) => e.source === id).map((e) => e.target);
        // Collect indirect downstream targets (e.g. Tasks node from SubFeature)
        const indirectTargets = currentEdges
          .filter((e) => directTargets.includes(e.source))
          .map((e) => e.target);

        // Pattern-based fallback (e.g. cat-0 -> sub-0, task-node-0 or cat-new-X -> sub-new-X)
        const patternSubId = id.startsWith("cat-") ? id.replace(/^cat-/, "sub-") : null;
        const patternTaskId = id.startsWith("cat-") ? id.replace(/^cat-/, "task-node-") : null;

        const allIdsToDelete = new Set([
          id,
          ...directTargets,
          ...indirectTargets,
          ...(patternSubId ? [patternSubId] : []),
          ...(patternTaskId ? [patternTaskId] : []),
        ]);

        // Remove all associated nodes from canvas
        setNodes((nds) => nds.filter((n) => !allIdsToDelete.has(n.id)));

        // Remove all edges connected to any deleted node
        return currentEdges.filter(
          (e) => !allIdsToDelete.has(e.source) && !allIdsToDelete.has(e.target)
        );
      });
    },
    [setNodes, setEdges]
  );

  const customOnNodesChange = useCallback(
    (changes: any) => {
      const removedCategory = changes.find(
        (c: any) => c.type === "remove" && nodes.some((n) => n.id === c.id && n.type === "category")
      );
      if (removedCategory) {
        handleNodeDelete(removedCategory.id);
        return;
      }
      onNodesChange(changes);
    },
    [nodes, onNodesChange, handleNodeDelete]
  );

  const toggleEditMode = (mode: boolean) => {
    setIsEditing(mode);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isEditing: mode,
          onChange: mode ? handleNodeLabelChange : undefined,
          onDelete: mode ? handleNodeDelete : undefined,
        },
      }))
    );
  };

  const handleAddCategory = () => {
    const timestamp = Date.now();
    const id = `cat-new-${timestamp}`;
    const subId = `sub-new-${timestamp}`;
    const newY = 40 + Math.random() * 200;

    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "category",
        position: { x: 360, y: newY },
        data: {
          label: "New Category",
          phase: 1,
          isEditing: true,
          onChange: handleNodeLabelChange,
          onDelete: handleNodeDelete,
        },
      },
      {
        id: subId,
        type: "subfeature",
        position: { x: 670, y: newY },
        data: {
          children: [{ id: `c-${timestamp}-1`, label: "New Capability" }],
        },
      },
    ]);

    setEdges((eds) => [
      ...eds,
      {
        id: `e-root-${id}`,
        source: "root",
        target: id,
        type: "colored",
        style: { stroke: "var(--color-signal)", strokeWidth: 1.5, opacity: 0.6 },
      },
      {
        id: `e-${id}-${subId}`,
        source: id,
        target: subId,
        type: "colored",
        style: { stroke: "var(--color-circuit)", strokeWidth: 1.5, opacity: 0.5 },
      },
    ]);
  };

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: "colored", style: { stroke: "var(--color-signal)", strokeWidth: 1.5, opacity: 0.6 } },
          eds
        )
      ),
    [setEdges]
  );

  // Helper to parse all tasks across all phases with live statuses
  const extractAllTasks = (projectDetail: any): TaskItem[] => {
    if (!projectDetail?.taskData) return [];
    try {
      const parsedTasks =
        typeof projectDetail.taskData === "string" ? JSON.parse(projectDetail.taskData) : projectDetail.taskData;
      const checkedStatuses: Record<string, string> =
        typeof projectDetail.checkedTasks === "string"
          ? JSON.parse(projectDetail.checkedTasks)
          : projectDetail.checkedTasks || {};

      const list: TaskItem[] = [];

      if (parsedTasks && Array.isArray(parsedTasks.phases)) {
        parsedTasks.phases.forEach((phase: any) => {
          (phase.tasks || []).forEach((t: any) => {
            list.push({
              id: t.id,
              title: t.title,
              description: t.description,
              estimasi: t.estimasi,
              tags: t.tags || [],
              isCheckpoint: Boolean(t.isCheckpoint),
              phaseName: phase.name || "",
              definitionOfDone: t.definitionOfDone,
              status: checkedStatuses[t.id] || "todo",
            });
          });
        });
      }
      return list;
    } catch {
      return [];
    }
  };

  // Initial Load: Fetch structure & project tasks
  useEffect(() => {
    if (hasStarted || !projectId) return;
    setHasStarted(true);

    const initData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch structure
        const json = await apiClient.generate.struktur(projectId);
        if (json.error) {
          setError(json.error);
          return;
        }

        setRawData(json);

        // 2. Fetch project detail to check if taskData & checkedTasks are available
        let allTasksList: TaskItem[] = [];
        try {
          const detailRes = await apiClient.projects.getDetail(projectId);
          if (detailRes && detailRes.project) {
            allTasksList = extractAllTasks(detailRes.project);
            setTasksList(allTasksList);
          }
        } catch {
          // If tasks are not yet generated, allTasksList remains empty (Gambar 1 mode)
        }

        const { nodes: n, edges: e } = buildGraph(json, allTasksList);
        setNodes(n);
        setEdges(e);
      } catch {
        setError("Failed to connect to the server.");
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [hasStarted, projectId, setNodes, setEdges]);

  // Real-Time Live Sync Polling (Smart adaptive polling to prevent log flooding)
  useEffect(() => {
    if (!projectId || isEditing) return;

    let timeoutId: NodeJS.Timeout;
    let currentInterval = 30000; // Start at 30s instead of aggressive 4s
    let isSubscribed = true;

    const pollDetail = async () => {
      if (document.hidden || isEditing) {
        scheduleNext(currentInterval);
        return;
      }

      try {
        const detailRes = await apiClient.projects.getDetail(projectId);
        if (detailRes && detailRes.project && rawDataRef.current) {
          const newTasks = extractAllTasks(detailRes.project);
          if (newTasks.length > 0) {
            setTasksList(newTasks);
            setNodes((prevNodes) => {
              const prevPosMap = new Map(prevNodes.map((n) => [n.id, n.position]));
              const { nodes: newNodes } = buildGraph(rawDataRef.current!, newTasks);
              return newNodes.map((n) => ({
                ...n,
                position: prevPosMap.get(n.id) || n.position,
              }));
            });
          }
        }
        currentInterval = Math.min(currentInterval + 10000, 60000);
      } catch {
        // Background sync error suppression
        currentInterval = Math.min(currentInterval + 15000, 60000);
      }

      if (isSubscribed) {
        scheduleNext(currentInterval);
      }
    };

    const scheduleNext = (delay: number) => {
      clearTimeout(timeoutId);
      if (isSubscribed) {
        timeoutId = setTimeout(pollDetail, delay);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && !isEditing) {
        currentInterval = 30000;
        pollDetail();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    scheduleNext(currentInterval);

    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [projectId, isEditing, setNodes]);

  // Handle project title updates
  useEffect(() => {
    const handleProjectUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.appName) {
        const newName = customEvent.detail.appName;
        setNodes((prevNodes) =>
          prevNodes.map((node) => (node.type === "root" ? { ...node, data: { ...node.data, label: newName } } : node))
        );
        setRawData((prev) => (prev ? { ...prev, title: newName } : prev));
      }
    };
    window.addEventListener("projectUpdated", handleProjectUpdate);
    return () => window.removeEventListener("projectUpdated", handleProjectUpdate);
  }, [setNodes]);

  const handleSave = async () => {
    if (!projectId) return;
    const rootNode = nodes.find((n) => n.type === "root");
    if (!rootNode) {
      toast.error("Root node is missing!");
      return;
    }
    const categoryNodes = nodes.filter((n) => n.type === "category");
    const parsedData: StrukturData = {
      title: String(rootNode.data.label || ""),
      description: String(rootNode.data.description || ""),
      nodes: categoryNodes.map((cat, idx): StrukturNode => {
        const subEdge = edges.find((e) => e.source === cat.id);
        const subNodeFromEdge = subEdge ? nodes.find((n) => n.id === subEdge.target && n.type === "subfeature") : null;
        const subIdFromPattern = cat.id.startsWith("cat-") ? cat.id.replace(/^cat-/, "sub-") : null;
        const subNodeFromPattern = subIdFromPattern ? nodes.find((n) => n.id === subIdFromPattern && n.type === "subfeature") : null;
        const subNodeFromIndex = nodes.find((n) => n.type === "subfeature" && n.id === `sub-${idx}`);

        const subNode = subNodeFromEdge || subNodeFromPattern || subNodeFromIndex;
        const children = (Array.isArray(subNode?.data?.children) ? subNode.data.children : []) as StrukturChild[];
        return {
          id: cat.id,
          label: String(cat.data.label || ""),
          phase: Number(cat.data.phase || 1),
          children,
        };
      }),
    };
    setIsSaving(true);
    try {
      await apiClient.projects.update({ projectId, strukturData: parsedData, tasksOutdated: true });
      useProjectStore.getState().updateProjectLocally({ strukturData: JSON.stringify(parsedData) });
      setRawData(parsedData);
      setNodes((prevNodes) => {
        const prevPosMap = new Map(prevNodes.map((pn) => [pn.id, pn.position]));
        const { nodes: n, edges: e } = buildGraph(parsedData, tasksList);
        setEdges(e);
        return n.map((item) => ({
          ...item,
          position: prevPosMap.get(item.id) || item.position,
        }));
      });
      setIsEditing(false);
      toast.success("Structure saved!");
    } catch {
      toast.error("Failed to save structure.");
    } finally {
      setIsSaving(false);
    }
  };

  /* Shared button base */
  const btn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: "var(--radius-md, 6px)",
    fontFamily: "var(--font-body)",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    textTransform: "none",
    cursor: "pointer",
    border: "1px solid var(--border-hairline)",
    background: "var(--bg-elevated)",
    color: "var(--fg-secondary)",
    transition: "opacity 0.15s",
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--color-background)", color: "var(--fg-primary)" }}>
      {/* â”€â”€ Topbar â”€â”€ */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: 56,
          flexShrink: 0,
          borderBottom: "1px solid var(--border-hairline)",
          background: "rgba(252, 251, 248, 0.92)",
          backdropFilter: "blur(12px)",
          zIndex: 50,
          position: "relative",
        }}
      >
        {/* Left: Brand & Project Name */}
        <ProjectHeaderBrand projectId={projectId} />

        {/* Step nav */}
        <StepNavbar currentStep="struktur" projectId={projectId} />

        {/* Actions */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
          {isEditing ? (
            <>
              <button
                onClick={() => toggleEditMode(false)}
                style={{ ...btn, color: "#f87171", borderColor: "rgba(248,113,113,0.35)", background: "rgba(248,113,113,0.08)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{ ...btn, color: "var(--color-circuit)", borderColor: "rgba(79,209,197,0.35)", background: "rgba(79,209,197,0.08)" }}
              >
                {isSaving ? "Savingâ€¦" : "Save & Render"}
              </button>
            </>
          ) : (
            <button
              onClick={() => toggleEditMode(true)}
              disabled={isLoading || !rawData}
              style={{ ...btn, color: "var(--color-mist)", opacity: isLoading || !rawData ? 0.4 : 1 }}
            >
              Edit Mode
            </button>
          )}
          <button
            onClick={() => router.push(`/prd${projectId ? `?projectId=${projectId}` : ""}`)}
            disabled={isLoading || !projectId || isEditing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: "8px",
              background: "#e15b39",
              color: "#ffffff",
              border: "none",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.02em",
              cursor: isLoading || !projectId || isEditing ? "not-allowed" : "pointer",
              opacity: isLoading || !projectId || isEditing ? 0.4 : 1,
              transition: "opacity 0.15s, transform 0.1s",
            }}
          >
            <span>Next Step</span>
            <ArrowRight size={14} strokeWidth={2.2} />
          </button>
        </div>
      </header>

      {/* â”€â”€ Canvas â”€â”€ */}
      <div style={{ flex: 1, position: "relative" }}>
        {/* Loading overlay */}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              background: "var(--color-background)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "var(--radius-lg, 8px)",
                border: "1px solid var(--color-signal)",
                background: "rgba(255,182,39,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
                animation: "spin 0.8s linear infinite",
              }}
            >
              <Loader2 size={22} style={{ color: "var(--color-signal)" }} strokeWidth={2} />
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--fg-muted)" }}>
              AI is analyzing architectureâ€¦
            </p>
          </div>
        )}

        {/* Error overlay */}
        {error && !isLoading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#f87171", marginBottom: 16 }}>{error}</p>
            <button onClick={() => { setHasStarted(false); setError(null); }} style={{ ...btn, color: "var(--fg-secondary)" }}>
              Try Again
            </button>
          </div>
        )}

        {/* Edit toolbar */}
        {isEditing && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 8,
              zIndex: 10,
              background: "var(--bg-elevated)",
              padding: "10px 16px",
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--radius-lg, 8px)",
              boxShadow: "var(--shadow-raised)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--fg-muted)",
                alignSelf: "center",
                marginRight: 4,
              }}
            >
              Add Node:
            </span>
            <button
              onClick={handleAddCategory}
              style={{ ...btn, color: "var(--color-signal)", borderColor: "rgba(255,182,39,0.35)", background: "rgba(255,182,39,0.06)" }}
            >
              + Category
            </button>
          </div>
        )}

        {/* React Flow Canvas */}
        {!isLoading && !error && (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={customOnNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            minZoom={0.2}
            nodesConnectable={isEditing}
            elementsSelectable={isEditing}
            deleteKeyCode={["Backspace", "Delete"]}
          >
            {/* Original Blueprint dot grid */}
            <Background variant={BackgroundVariant.Dots} gap={40} size={1.5} color="rgba(20, 24, 23, 0.12)" />
            <Controls style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hairline)" }} />
          </ReactFlow>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .react-flow__controls-button {
          background: var(--bg-elevated) !important;
          border-color: var(--border-hairline) !important;
          color: var(--fg-muted) !important;
          fill: var(--fg-muted) !important;
        }
        .react-flow__controls-button:hover {
          background: var(--bg-base) !important;
          color: var(--fg-primary) !important;
          fill: var(--fg-primary) !important;
        }
        .react-flow__attribution { display: none; }
        .react-flow__panel { font-family: var(--font-body); }
      `}</style>
    </div>
  );
}

export default function StrukturPage() {
  return (
    <Suspense fallback={<StructureSkeleton />}>
      <StrukturPageContent />
    </Suspense>
  );
}





