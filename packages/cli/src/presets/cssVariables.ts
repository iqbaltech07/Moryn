/**
 * CSS Variables Boilerplate Generator (Anti-Slop Compliant)
 */
export function getCssVariablesContent(target: string = "web"): string {
  return `/* Moryn Anti-Slop Theme Boilerplate */
@theme inline {
  --color-brand-ink: #141817;
  --color-brand-orange: #e85d3f;

  --color-background: #fcfbf8;
  --color-surface: #f5f2ea;
  --color-surface-raised: #ffffff;

  --color-foreground: #141817;
  --color-foreground-secondary: #4d5552;
  --color-foreground-muted: #737b78;
  --color-foreground-subtle: #9ca3a0;

  --color-border: #d9ddd9;
  --color-border-subtle: #e8ebe8;
  --color-border-strong: #b9bfbc;

  --color-primary: #141817;
  --color-primary-foreground: #fcfbf8;

  --color-accent: #e85d3f;
  --color-accent-foreground: #ffffff;

  --color-accent-soft: #fbe4de;

  --color-success: #2f7d5c;
  --color-warning: #b7791f;
  --color-error: #c63d3d;
  --color-info: #416b8d;
}

:root {
  --moryn-bg: var(--color-background, #fcfbf8);
  --moryn-surface-1: var(--color-surface, #f5f2ea);
  --moryn-surface-2: var(--color-surface-raised, #ffffff);
  --moryn-border: var(--color-border, #d9ddd9);
  --moryn-accent: var(--color-accent, #e85d3f);
  --moryn-text: var(--color-foreground, #141817);
  --moryn-text-muted: var(--color-foreground-muted, #737b78);
}

body {
  background-color: var(--moryn-bg);
  color: var(--moryn-text);
  font-family: 'Inter', system-ui, sans-serif;
  min-height: 100dvh;
}

/* Anti-Slop Helper Classes */
.bg-moryn-dark { background-color: var(--moryn-bg); }
.bg-moryn-surface { background-color: var(--moryn-surface-1); }
.bg-moryn-elevated { background-color: var(--moryn-surface-2); }
.border-moryn-subtle { border-color: var(--moryn-border); }
.text-moryn-primary { color: var(--moryn-text); }
.text-moryn-muted { color: var(--moryn-text-muted); }
`;
}
