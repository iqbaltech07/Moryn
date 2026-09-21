import { Position, Handle } from "@xyflow/react";
import { Trash2, LayoutGrid, Search, Users, Target, Bell, Shield, Zap, Layers } from "lucide-react";

export const PHASE_COLORS: Record<number, { border: string; badge: string; text: string }> = {
  1: { border: "var(--color-signal)",  badge: "FASE 1 · Core",   text: "#ffffff" },
  2: { border: "var(--color-circuit)", badge: "FASE 2 · Growth", text: "#ffffff" },
  3: { border: "#6b7280",              badge: "FASE 3 · Future", text: "#ffffff" },
};

export function getCategoryIcon(label: string, idx: number) {
  const l = (label || "").toLowerCase();
  if (l.includes("tugas") || l.includes("task") || l.includes("papan") || l.includes("board")) return LayoutGrid;
  if (l.includes("ai") || l.includes("asisten") || l.includes("bot") || l.includes("search") || l.includes("cari")) return Search;
  if (l.includes("auth") || l.includes("user") || l.includes("akun") || l.includes("profil") || l.includes("member")) return Users;
  if (l.includes("level") || l.includes("gamif") || l.includes("xp") || l.includes("target") || l.includes("skor")) return Target;
  if (l.includes("notif") || l.includes("deadline") || l.includes("pesan") || l.includes("bell") || l.includes("alert")) return Bell;
  if (l.includes("keamanan") || l.includes("security") || l.includes("shield")) return Shield;
  if (l.includes("integrasi") || l.includes("api") || l.includes("service")) return Zap;
  const defaults = [LayoutGrid, Search, Users, Target, Bell, Zap, Layers];
  return defaults[idx % defaults.length];
}

export function CategoryNode({ id, data }: { id: string; data: any }) {
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
            width: 9,
            height: 9,
            left: -4.5,
          }}
        />
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
              letterSpacing: "0.14em",
              color: "var(--fg-muted)",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            . FITUR .
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <div
              className="moryn-skeleton-bar"
              style={{
                width: data.index === 1 ? "78%" : "68%",
                height: 7,
                borderRadius: 4,
                background: "var(--border-hairline)",
              }}
            />
            <div
              className="moryn-skeleton-bar"
              style={{
                width: data.index === 1 ? "42%" : "50%",
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
            width: 9,
            height: 9,
            right: -4.5,
          }}
        />
      </>
    );
  }

  const phase = PHASE_COLORS[data.phase] || PHASE_COLORS[1];
  const color = data.color || phase.border;
  const IconComponent = getCategoryIcon(data.label || "", data.index || 0);

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={data.isEditing}
        style={{
          background: color,
          border: "2px solid var(--bg-elevated)",
          width: 9,
          height: 9,
          left: -4.5,
          cursor: data.isEditing ? "crosshair" : "default",
        }}
      />
      <div
        style={{
          background: "var(--bg-elevated)",
          border: `1px solid ${color}`,
          borderRadius: 8,
          padding: "12px 16px",
          minWidth: 200,
          maxWidth: 240,
          position: "relative",
          boxShadow: "var(--shadow-raised)",
        }}
      >
        {/* Phase annotation */}
        <div
          style={{
            position: "absolute",
            top: -10,
            left: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: phase.text,
              background: color,
              padding: "2px 8px",
              borderRadius: 3,
            }}
          >
            {phase.badge}
          </span>
          {data.isEditing && (
            <div
              onClick={() => data.onDelete(id)}
              style={{
                background: "#f87171",
                color: "white",
                width: 16,
                height: 16,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                pointerEvents: "auto",
              }}
              title="Hapus Kategori"
            >
              <Trash2 size={9} strokeWidth={2.5} />
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 5,
              border: `1px solid ${color}44`,
              background: `${color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconComponent size={13} strokeWidth={2} color={color} />
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 700,
              color: "var(--fg-primary)",
              lineHeight: 1.3,
              flex: 1,
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
                  borderBottom: `1px solid ${color}`,
                  width: "100%",
                  padding: 0,
                }}
                autoFocus
              />
            ) : (
              data.label
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: 8,
            fontFamily: "var(--font-body)",
            fontSize: 9,
            color: "var(--fg-muted)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            letterSpacing: "0.06em",
          }}
        >
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: color, opacity: 0.8 }} />
          <span>Direncanakan</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={data.isEditing}
        style={{
          background: color,
          border: "2px solid var(--bg-elevated)",
          width: 9,
          height: 9,
          right: -4.5,
          cursor: data.isEditing ? "crosshair" : "default",
        }}
      />
    </>
  );
}

