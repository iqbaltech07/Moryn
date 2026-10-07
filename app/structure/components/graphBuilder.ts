import type { Node, Edge } from "@xyflow/react";
import type { StrukturData, TaskItem, StrukturNode } from "./types";
import { PHASE_COLORS } from "./CategoryNode";

// Extract keywords from string (ignoring common words)
function extractKeywords(text: string): string[] {
  if (!text) return [];
  const stopWords = new Set([
    "dan", "yang", "di", "ke", "dari", "untuk", "pada", "dengan", "adalah", "ini", "itu", "atau",
    "the", "and", "of", "to", "in", "for", "with", "on", "at", "by", "from", "as", "is", "a", "an",
    "fase", "phase", "core", "growth", "future", "fitur", "sub", "task", "tasks", "ui", "api"
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));
}

// Calculate similarity score between task and category (including its sub-features)
function calculateMatchScore(task: TaskItem, category: StrukturNode): number {
  const catKeywords = extractKeywords(category.label);
  const subKeywords = (category.children || []).flatMap((c) => extractKeywords(c.label));
  const allCatKeywords = [...new Set([...catKeywords, ...subKeywords])];

  const taskTitleKeywords = extractKeywords(task.title);
  const taskDescKeywords = extractKeywords(task.description || "");
  const taskTagsKeywords = (task.tags || []).flatMap((t) => extractKeywords(t));
  const allTaskKeywords = [...new Set([...taskTitleKeywords, ...taskDescKeywords, ...taskTagsKeywords])];

  let score = 0;
  for (const cw of allCatKeywords) {
    for (const tw of allTaskKeywords) {
      if (cw === tw) {
        score += 3;
      } else if (cw.includes(tw) || tw.includes(cw)) {
        score += 1.5;
      }
    }
  }

  const taskTitleLower = task.title.toLowerCase();
  const catLabelLower = category.label.toLowerCase();
  if (taskTitleLower.includes(catLabelLower) || catLabelLower.includes(taskTitleLower)) {
    score += 6;
  }
  for (const sub of category.children || []) {
    const subLower = sub.label.toLowerCase();
    if (taskTitleLower.includes(subLower) || subLower.includes(taskTitleLower)) {
      score += 5;
    }
  }

  return score;
}

export function matchTasksToCategories(
  categories: StrukturNode[],
  allTasks: TaskItem[]
): Record<string, TaskItem[]> {
  const result: Record<string, TaskItem[]> = {};
  categories.forEach((cat, idx) => {
    const key = cat.id || `cat-${idx}`;
    result[key] = [];
  });

  const assignedTaskIds = new Set<string>();

  // Pass 1: Semantic keyword score matching
  const scoredPairs: Array<{ task: TaskItem; catKey: string; score: number }> = [];

  for (const task of allTasks) {
    // Skip generic checkpoint / root token review tasks unless matched
    if (task.isCheckpoint) continue;

    categories.forEach((cat, idx) => {
      const catKey = cat.id || `cat-${idx}`;
      const score = calculateMatchScore(task, cat);
      if (score > 0) {
        scoredPairs.push({ task, catKey, score });
      }
    });
  }

  // Sort by highest score first
  scoredPairs.sort((a, b) => b.score - a.score);

  for (const pair of scoredPairs) {
    if (!assignedTaskIds.has(pair.task.id)) {
      result[pair.catKey].push(pair.task);
      assignedTaskIds.add(pair.task.id);
    }
  }

  // Pass 2: Distribute remaining feature tasks (Phase 3 UI, Phase 4 API) if any category is empty
  const unassignedFeatureTasks = allTasks.filter(
    (t) =>
      !assignedTaskIds.has(t.id) &&
      !t.isCheckpoint &&
      !t.title.toLowerCase().includes("desain sistem tokens") &&
      !t.title.toLowerCase().includes("inisialisasi project workspace")
  );

  let unassignedIdx = 0;
  categories.forEach((cat, idx) => {
    const catKey = cat.id || `cat-${idx}`;
    if (result[catKey].length === 0 && unassignedIdx < unassignedFeatureTasks.length) {
      result[catKey].push(unassignedFeatureTasks[unassignedIdx]);
      assignedTaskIds.add(unassignedFeatureTasks[unassignedIdx].id);
      unassignedIdx++;
    }
  });

  return result;
}

export function buildGraph(
  data: StrukturData,
  allTasks?: TaskItem[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Sort categories strictly and stably by Phase (Phase 1 on top, Phase 2, Phase 3, etc.)
  const sortedCategories = [...(data.nodes || [])]
    .map((catNode, originalIndex) => {
      const phaseNum = typeof catNode.phase === "number" && !isNaN(catNode.phase) ? catNode.phase : 1;
      return { catNode, originalIndex, phaseNum };
    })
    .sort((a, b) => {
      if (a.phaseNum !== b.phaseNum) {
        return a.phaseNum - b.phaseNum;
      }
      return a.originalIndex - b.originalIndex;
    })
    .map((item) => item.catNode);

  const hasTasks = Boolean(allTasks && allTasks.length > 0);
  const matchedTasksMap = hasTasks ? matchTasksToCategories(sortedCategories, allTasks!) : {};

  const ROOT_X = 40;
  const CAT_X = hasTasks ? 400 : 420;
  const SUB_X = hasTasks ? 760 : 780;
  const TASK_X = 1140;

  const ROW_HEIGHT = 180;
  const GAP_Y = 48;

  const totalCategories = sortedCategories.length;
  const totalH = totalCategories * ROW_HEIGHT + Math.max(0, totalCategories - 1) * GAP_Y;

  // 1. Root Node
  const rootY =
    totalCategories % 2 === 1
      ? ((totalCategories - 1) / 2) * (ROW_HEIGHT + GAP_Y)
      : Math.max(0, (totalH - ROW_HEIGHT) / 2);

  nodes.push({
    id: "root",
    type: "root",
    position: { x: ROOT_X, y: rootY },
    data: {
      label: data.title || "App Blueprint",
      description: data.description,
      nodeCount: totalCategories,
    },
  });

  // 2. Build Category, SubFeature, & Task Nodes per row
  sortedCategories.forEach((catNode, idx) => {
    const catId = `cat-${idx}`;
    const subId = `sub-${idx}`;
    const taskId = `task-node-${idx}`;

    const posY = idx * (ROW_HEIGHT + GAP_Y);
    const phaseNum = catNode.phase || (idx % 3) + 1;
    const phase = PHASE_COLORS[phaseNum] || PHASE_COLORS[1];
    const color = catNode.color || phase.border;

    // Category Node
    nodes.push({
      id: catId,
      type: "category",
      position: { x: CAT_X, y: posY },
      data: {
        label: catNode.label,
        phase: phaseNum,
        color,
        index: idx,
        childCount: catNode.children?.length || 0,
      },
    });

    // Edge: Root -> Category
    edges.push({
      id: `e-root-${catId}`,
      source: "root",
      target: catId,
      type: "colored",
      style: { stroke: color, strokeWidth: 1.5, opacity: 0.6 },
    });

    // SubFeature Group Node
    nodes.push({
      id: subId,
      type: "subfeature",
      position: { x: SUB_X, y: posY },
      data: {
        categoryLabel: catNode.label,
        children: catNode.children || [],
        color,
      },
    });

    // Edge: Category -> SubFeature
    edges.push({
      id: `e-${catId}-${subId}`,
      source: catId,
      target: subId,
      type: "colored",
      style: { stroke: color, strokeWidth: 1.5, opacity: 0.5 },
    });

    // 4th Column: Tasks Group Node (Gambar 2: matching tasks specifically for this feature)
    if (hasTasks) {
      const catKey = catNode.id || catId;
      const matchingTasks = matchedTasksMap[catKey] || matchedTasksMap[catId] || [];

      if (matchingTasks && matchingTasks.length > 0) {
        nodes.push({
          id: taskId,
          type: "tasks",
          position: { x: TASK_X, y: posY },
          data: {
            tasks: matchingTasks,
          },
        });

        // Edge: SubFeature -> Tasks
        edges.push({
          id: `e-${subId}-${taskId}`,
          source: subId,
          target: taskId,
          type: "colored",
          style: { stroke: "var(--color-circuit)", strokeWidth: 1.5, opacity: 0.6, strokeDasharray: "4 4" },
        });
      }
    }
  });

  return { nodes, edges };
}

export function buildSkeletonGraph(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const ROOT_X = 40;
  const CAT_X = 420;
  const SUB_X = 760;

  const ROW_HEIGHT = 180;
  const GAP_Y = 48;

  const totalCategories = 3;
  const totalH = totalCategories * ROW_HEIGHT + Math.max(0, totalCategories - 1) * GAP_Y;

  // Root Node
  nodes.push({
    id: "root-skeleton",
    type: "root",
    position: { x: ROOT_X, y: 1 * (ROW_HEIGHT + GAP_Y) },
    data: {
      isSkeleton: true,
    },
  });

  // 3 Category & Subfeature pairs
  [0, 1, 2].forEach((idx) => {
    const catId = `cat-skeleton-${idx}`;
    const subId = `sub-skeleton-${idx}`;
    const posY = idx * (ROW_HEIGHT + GAP_Y);

    nodes.push({
      id: catId,
      type: "category",
      position: { x: CAT_X, y: posY },
      data: {
        isSkeleton: true,
        index: idx,
      },
    });

    edges.push({
      id: `e-root-${catId}`,
      source: "root-skeleton",
      target: catId,
      type: "colored",
      style: { stroke: "var(--border-strong)", strokeWidth: 1.8, opacity: 0.6 },
    });

    nodes.push({
      id: subId,
      type: "subfeature",
      position: { x: SUB_X, y: posY },
      data: {
        isSkeleton: true,
        index: idx,
      },
    });

    edges.push({
      id: `e-${catId}-${subId}`,
      source: catId,
      target: subId,
      type: "colored",
      style: { stroke: "var(--border-strong)", strokeWidth: 1.8, opacity: 0.6 },
    });
  });

  return { nodes, edges };
}
