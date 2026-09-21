export default function HowItWorksStyles() {
  return (
    <style>{`
      /* ── Section ── */
      .hiw-section {
        padding: 112px 32px 128px;
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
      }

      /* Grid background */
      .hiw-section::before {
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
      .hiw-header {
        text-align: center;
        margin-bottom: 72px;
        position: relative;
        z-index: 1;
      }
      .hiw-header-pill {
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
        color: var(--color-signal);
        margin-bottom: 18px;
      }
      .hiw-pulse-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--color-signal);
        flex-shrink: 0;
      }
      .hiw-heading {
        font-family: var(--font-display);
        font-size: clamp(1.875rem, 3.5vw, 2.75rem);
        font-weight: 800;
        line-height: 1.12;
        color: var(--fg-primary);
        letter-spacing: -0.02em;
        margin-bottom: 14px;
      }
      .hiw-heading-accent { color: var(--color-signal); }
      .hiw-subheading {
        font-family: var(--font-body);
        font-size: 15px;
        color: var(--color-mist);
        max-width: 460px;
        margin: 0 auto;
        line-height: 1.7;
      }

      /* ── Track (zigzag) ── */
      .hiw-track {
        max-width: 960px;
        margin: 0 auto;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0;
        z-index: 1;
      }

      /* Vertical spine */
      .hiw-spine {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 1px;
        background: var(--border-hairline);
        pointer-events: none;
      }

      /* ── Individual step ── */
      .hiw-step {
        display: grid;
        grid-template-columns: 1fr 48px 1fr;
        align-items: start;
        padding: 28px 0;
        opacity: 0;
        transform: translateY(24px);
      }
      .hiw-step--visible {
        opacity: 1;
        transform: translateY(0);
        transition:
          opacity 0.5s ease var(--hiw-delay),
          transform 0.5s cubic-bezier(0.22,1,0.36,1) var(--hiw-delay);
      }

      /* Default: card on right, number on left */
      .hiw-step .hiw-card          { grid-column: 3; grid-row: 1; }
      .hiw-step .hiw-step-num      { grid-column: 1; grid-row: 1; text-align: right; padding-right: 52px; }
      .hiw-step .hiw-connector-dot { grid-column: 2; grid-row: 1; justify-self: center; align-self: start; margin-top: 24px; }

      /* Flip: card on left */
      .hiw-step--flip .hiw-card     { grid-column: 1; grid-row: 1; }
      .hiw-step--flip .hiw-step-num { grid-column: 3; grid-row: 1; text-align: left; padding-right: 0; padding-left: 52px; }

      /* ── Background step number ── */
      .hiw-step-num {
        font-family: var(--font-mono);
        font-size: 88px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: -0.05em;
        color: rgba(255,255,255,0.03);
        padding-top: 18px;
        user-select: none;
        pointer-events: none;
        transition: color 0.3s;
      }
      .hiw-step--visible:hover .hiw-step-num {
        color: rgba(255,255,255,0.06);
      }

      /* ── Connector dot ── */
      .hiw-connector-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--hiw-accent);
        border: 2px solid var(--bg-base);
        box-shadow: 0 0 0 1px var(--hiw-accent);
        flex-shrink: 0;
      }

      /* ── Card ── */
      .hiw-card {
        position: relative;
        background: var(--bg-elevated);
        border: 1px solid var(--border-hairline);
        border-radius: var(--radius-lg);
        padding: 22px;
        overflow: hidden;
        transition: border-color 0.2s, background 0.2s;
      }
      .hiw-card:hover {
        border-color: var(--hiw-accent);
        background: var(--bg-surface);
      }

      /* ── Card header ── */
      .hiw-card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
      }
      .hiw-card-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-md);
        background: rgba(255,255,255,0.03);
        border: 1px solid var(--border-hairline);
        color: var(--hiw-accent);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: border-color 0.2s;
      }
      .hiw-card:hover .hiw-card-icon { border-color: var(--hiw-accent); }

      .hiw-card-meta {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .hiw-card-badge {
        font-family: var(--font-mono);
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--hiw-accent);
        opacity: 0.8;
      }
      .hiw-card-detail {
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 500;
        color: var(--color-mist);
        letter-spacing: 0.04em;
      }

      /* ── Card text ── */
      .hiw-card-title {
        font-family: var(--font-body);
        font-size: 16px;
        font-weight: 700;
        color: var(--fg-primary);
        letter-spacing: -0.01em;
        line-height: 1.3;
        margin-bottom: 8px;
      }
      .hiw-card-desc {
        font-family: var(--font-body);
        font-size: 13px;
        line-height: 1.7;
        color: var(--color-mist);
        margin-bottom: 14px;
      }

      /* ── Mockup: chips ── */
      .hiw-mockup {
        margin-top: 4px;
        border: 1px solid var(--border-hairline);
        border-radius: var(--radius-md);
        padding: 12px;
        background: var(--bg-base);
      }
      .hiw-mockup--chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .hiw-chip {
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: var(--radius-xs);
        border: 1px solid var(--border-hairline);
        color: var(--color-circuit);
        letter-spacing: 0.06em;
      }

      /* ── Mockup: progress dots ── */
      .hiw-mockup--progress {
        display: flex;
        gap: 5px;
        align-items: center;
      }
      .hiw-progress-dot {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 1px solid var(--border-hairline);
        color: var(--fg-muted);
        font-family: var(--font-mono);
        font-size: 9px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        letter-spacing: 0;
      }
      .hiw-progress-dot--done {
        border-color: var(--color-circuit);
        color: var(--color-circuit);
        background: rgba(79,209,197,0.08);
      }

      /* ── Bottom accent rule ── */
      .hiw-card-line {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--hiw-accent);
        opacity: 0;
        transition: opacity 0.2s;
      }
      .hiw-card:hover .hiw-card-line { opacity: 0.6; }

      /* ── Responsive ── */
      @media (max-width: 768px) {
        .hiw-section { padding: 72px 20px 96px; }
        .hiw-spine { display: none; }
        .hiw-step {
          grid-template-columns: 1fr;
          padding: 0 0 20px;
        }
        .hiw-step .hiw-card,
        .hiw-step--flip .hiw-card { grid-column: 1; grid-row: 1; }
        .hiw-step .hiw-step-num,
        .hiw-step--flip .hiw-step-num { display: none; }
        .hiw-connector-dot { display: none; }
      }
    `}</style>
  );
}
