import { useState } from "react";
import { Position, Handle } from "@xyflow/react";
import { LayoutGrid, ChevronRight } from "lucide-react";
import type { StrukturChild } from "./types";

export function SubFeatureGroupNode({ id, data }: { id: string; data: any }) {
  if (data.isSkeleton) {
    return (
      <>
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={false}
          style={{
            background: "var(--border-strong)",
            border: "2px solid var(--bg-elevated)",
            width: 8,
            height: 8,
            left: -4,
          }}
        />
        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px dashed var(--border-strong)",
            borderRadius: 12,
            padding: "14px 16px",
            minWidth: 230,
            maxWidth: 260,
            boxShadow: "var(--shadow-card)",
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "var(--fg-muted)",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            SUB FITUR
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { width: data.index === 0 ? "82%" : data.index === 1 ? "75%" : "80%" },
              { width: data.index === 0 ? "65%" : data.index === 1 ? "70%" : "62%" },
              { width: data.index === 0 ? "54%" : data.index === 1 ? "60%" : "50%" },
            ].map((pill, pIdx) => (
              <div
                key={pIdx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 10px",
                  borderRadius: 9999,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--bg-surface)",
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--fg-muted)",
                    opacity: 0.4,
                    flexShrink: 0,
                  }}
                />
                <div
                  className="moryn-skeleton-bar"
                  style={{
                    width: pill.width,
                    height: 6,
                    borderRadius: 3,
                    background: "var(--border-hairline)",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  const children: StrukturChild[] = data.children || [];
  const color = data.color || "var(--color-circuit)";
  const [expanded, setExpanded] = useState(false);
  const maxDisplay = 3;
  const displayedChildren = expanded ? children : children.slice(0, maxDisplay);

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={data.isEditing}
        style={{
          background: color,
          border: "2px solid var(--bg-elevated)",
          width: 8,
          height: 8,
          left: -4,
          cursor: data.isEditing ? "crosshair" : "default",
        }}
      />

      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-hairline)",
          borderRadius: 8,
          padding: "14px 16px",
          minWidth: 220,
          maxWidth: 260,
          boxShadow: "var(--shadow-raised)",
          position: "relative",
        }}
      >
        {/* Header: Icon + SUB FITUR */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10,
            fontFamily: "var(--font-body)",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "var(--color-mist)",
            textTransform: "uppercase",
          }}
        >
          <LayoutGrid size={11} strokeWidth={2.2} color="var(--color-circuit)" />
          <span style={{ color: "var(--fg-secondary)" }}>SUB FITUR</span>
        </div>

        {/* Stacked Sub-features list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {displayedChildren.map((child, cIdx) => (
            <div
              key={child.id || cIdx}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-hairline)",
                borderRadius: "var(--radius-sm)",
                padding: "7px 10px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0, opacity: 0.9 }} />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 11.5,
                  color: "var(--fg-primary)",
                  fontWeight: 500,
                  lineHeight: 1.35,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flex: 1,
                }}
              >
                {child.label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer count toggle */}
        {children.length > maxDisplay && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              marginTop: 8,
              background: "transparent",
              border: "none",
              color: "var(--color-circuit)",
              fontFamily: "var(--font-body)",
              fontSize: 9,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 3,
              padding: 0,
              width: "100%",
              justifyContent: "flex-end",
            }}
          >
            <span>{expanded ? "Sembunyikan" : `Lihat semua (${children.length})`}</span>
            <ChevronRight size={10} />
          </button>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={data.isEditing}
        style={{
          background: color,
          border: "2px solid var(--bg-elevated)",
          width: 8,
          height: 8,
          right: -4,
          cursor: data.isEditing ? "crosshair" : "default",
        }}
      />
    </>
  );
}

