export default function FeaturesStyles() {
  return (
    <style>{`
      /* ── Section ── */
      .feat-section {
        padding: 112px 32px 128px;
        position: relative;
        background: var(--bg-surface);
      }

      /* Subtle grid overlay on section */
      .feat-section::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(var(--grid-line) 1px, transparent 1px),
          linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
        background-size: 40px 40px;
        pointer-events: none;
      }

      /* ── Header ── */
      .feat-header {
        max-width: 1200px;
        margin: 0 auto 48px;
        position: relative;
        z-index: 1;
      }
      .feat-header-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        border: 1px solid var(--border-hairline);
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--color-circuit);
        margin-bottom: 20px;
      }
      .feat-header-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--color-circuit);
        flex-shrink: 0;
      }
      .feat-heading {
        font-family: var(--font-display);
        font-size: clamp(2rem, 3.5vw, 2.75rem);
        font-weight: 800;
        line-height: 1.12;
        color: var(--fg-primary);
        letter-spacing: -0.02em;
        margin-bottom: 14px;
      }
      .feat-heading-accent { color: var(--color-signal); }
      .feat-subheading {
        font-family: var(--font-body);
        font-size: 15px;
        color: var(--color-mist);
        max-width: 560px;
        line-height: 1.7;
      }

      /* ── Bento grid ── */
      .feat-bento {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        grid-auto-rows: 230px;
        gap: 1px;
        border: 1px solid var(--border-hairline);
        border-radius: var(--radius-lg);
        overflow: hidden;
        position: relative;
        z-index: 1;
      }

      /* ── Card base ── */
      .feat-card {
        position: relative;
        padding: 20px 22px 18px;
        background: var(--bg-base);
        border-right: 1px solid var(--border-hairline);
        border-bottom: 1px solid var(--border-hairline);
        display: flex;
        flex-direction: column;
        gap: 0;
        cursor: default;
        transition: background 0.2s ease;
        opacity: 0;
        transform: translateY(16px);
      }
      .feat-card--visible {
        opacity: 1;
        transform: translateY(0);
        transition:
          opacity 0.45s ease var(--feat-delay),
          transform 0.45s cubic-bezier(0.22,1,0.36,1) var(--feat-delay),
          background 0.2s ease;
      }
      .feat-card:hover {
        background: var(--bg-elevated);
      }

      /* Grid placement */
      .feat-card--large  { grid-column: span 5; grid-row: span 2; padding: 28px 28px 22px; }
      .feat-card--tall   { grid-column: span 3; grid-row: span 2; padding: 22px 20px 18px; }
      .feat-card--normal { grid-column: span 4; grid-row: span 1; }

      /* ── Top annotation row ── */
      .feat-top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 12px;
        flex-shrink: 0;
      }
      .feat-label {
        font-family: var(--font-mono);
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--feat-accent);
        opacity: 0.8;
      }
      .feat-tag {
        font-family: var(--font-mono);
        font-size: 9px;
        font-weight: 600;
        padding: 2px 7px;
        border-radius: var(--radius-xs);
        border: 1px solid var(--border-hairline);
        color: var(--color-mist);
        white-space: nowrap;
        letter-spacing: 0.06em;
      }

      /* ── Icon ── */
      .feat-icon-wrap {
        width: 38px;
        height: 38px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-hairline);
        color: var(--feat-accent);
        flex-shrink: 0;
        margin-bottom: 14px;
        transition: border-color 0.2s;
        background: rgba(255,255,255,0.02);
      }
      .feat-card:hover .feat-icon-wrap {
        border-color: var(--feat-accent);
      }
      .feat-card--large .feat-icon-wrap { width: 48px; height: 48px; margin-bottom: 18px; }
      .feat-card--tall  .feat-icon-wrap { width: 42px; height: 42px; }

      /* ── Body ── */
      .feat-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-height: 0;
      }
      .feat-title {
        font-family: var(--font-body);
        font-size: 13px;
        font-weight: 700;
        color: var(--fg-primary);
        line-height: 1.3;
        letter-spacing: -0.01em;
      }
      .feat-card--large .feat-title { font-size: 18px; }
      .feat-card--tall  .feat-title { font-size: 14px; }

      .feat-desc {
        font-family: var(--font-body);
        font-size: 12px;
        line-height: 1.65;
        color: var(--color-mist);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .feat-card--large .feat-desc {
        font-size: 13px;
        line-height: 1.7;
        -webkit-line-clamp: 4;
      }
      .feat-card--tall .feat-desc { -webkit-line-clamp: 4; }

      /* ── Stat badge ── */
      .feat-stat-badge {
        display: inline-flex;
        align-items: baseline;
        gap: 6px;
        margin-top: auto;
        padding-top: 12px;
        flex-shrink: 0;
      }
      .feat-stat-num {
        font-family: var(--font-mono);
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.03em;
        color: var(--feat-accent);
        line-height: 1;
      }
      .feat-card--large .feat-stat-num { font-size: 36px; }
      .feat-card--tall  .feat-stat-num { font-size: 28px; }

      .feat-stat-label {
        font-family: var(--font-mono);
        font-size: 9px;
        color: var(--fg-muted);
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      /* ── Bottom accent rule ── */
      .feat-accent-rule {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--feat-accent);
        opacity: 0;
        transition: opacity 0.2s;
      }
      .feat-card:hover .feat-accent-rule { opacity: 0.5; }

      /* ── Responsive ── */
      @media (max-width: 1024px) {
        .feat-bento {
          grid-template-columns: repeat(6, 1fr);
          grid-auto-rows: 220px;
        }
        .feat-card--large  { grid-column: span 6; grid-row: span 2; }
        .feat-card--tall   { grid-column: span 3; grid-row: span 2; }
        .feat-card--normal { grid-column: span 3; grid-row: span 1; }
      }
      @media (max-width: 640px) {
        .feat-section { padding: 72px 16px 88px; }
        .feat-bento {
          grid-template-columns: 1fr;
          grid-auto-rows: auto;
          gap: 0;
        }
        .feat-card--large,
        .feat-card--tall,
        .feat-card--normal {
          grid-column: span 1;
          grid-row: span 1;
        }
        .feat-card { padding: 20px; }
      }
    `}</style>
  );
}
