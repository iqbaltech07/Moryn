import { Position, Handle } from "@xyflow/react";
import { FileText } from "lucide-react";

export function RootNode({ id, data }: { id: string; data: any }) {
  if (data.isSkeleton) {
    return (
      <>
        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px dashed var(--border-strong)",
            borderRadius: 12,
            padding: "16px 20px",
            minWidth: 210,
            maxWidth: 240,
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
              marginBottom: 12,
            }}
          >
            PERENCANAAN
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <div
              className="moryn-skeleton-bar"
              style={{
                width: "72%",
                height: 7,
                borderRadius: 4,
                background: "var(--border-hairline)",
              }}
            />
            <div
              className="moryn-skeleton-bar"
              style={{
                width: "48%",
                height: 7,
                borderRadius: 4,
                background: "var(--border-subtle)",
              }}
            />
          </div>
        </div>
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={false}
          style={{
            background: "var(--border-strong)",
            border: "2px solid var(--bg-elevated)",
            width: 10,
            height: 10,
            right: -5,
          }}
        />
      </>
    );
  }

  return (
    <>
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--color-signal)",
          borderRadius: 8,
          padding: "16px 20px",
          minWidth: 200,
          maxWidth: 250,
          boxShadow: "var(--shadow-raised)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              border: "1px solid rgba(255,182,39,0.35)",
              background: "rgba(255,182,39,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileText size={15} strokeWidth={2} color="var(--color-signal)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--fg-primary)",
                lineHeight: 1.25,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {data.isEditing ? (
                <input
                  value={data.label}
                  onChange={(e) => data.onChange(id, "label", e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "inherit",
                    fontWeight: "inherit",
                    fontSize: "inherit",
                    outline: "none",
                    borderBottom: "1px solid var(--color-signal)",
                    width: "100%",
                    padding: 0,
                  }}
                  autoFocus
                />
              ) : (
                data.label || "App Blueprint"
              )}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-signal)",
                opacity: 0.8,
                marginTop: 2,
              }}
            >
              Perencanaan
            </div>
          </div>
        </div>

        {data.description && (
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              color: "var(--fg-muted)",
              lineHeight: 1.5,
              borderTop: "1px solid rgba(255,182,39,0.15)",
              paddingTop: 8,
              marginTop: 4,
            }}
          >
            {data.description}
          </div>
        )}

        <div style={{ marginTop: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-mist)",
              border: "1px solid var(--border-hairline)",
              borderRadius: 3,
              padding: "2px 7px",
            }}
          >
            {data.nodeCount} modul
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={data.isEditing}
        style={{
          background: "var(--color-signal)",
          border: "2px solid var(--bg-elevated)",
          width: 10,
          height: 10,
          right: -5,
          cursor: data.isEditing ? "crosshair" : "default",
        }}
      />
    </>
  );
}

