import React from "react";
import { ColorToken, AccordionSection } from "../types";

export const DEFAULT_COLOR_TOKENS: ColorToken[] = [
  { token: "bg-base", hex: "#f8fafc", role: "Primary page background surface (clean off-white)" },
  { token: "bg-surface", hex: "#ffffff", role: "Pure white card, sidebar, and container background" },
  { token: "bg-elevated", hex: "#f1f5f9", role: "Hover states, popovers, and elevated panels" },
  { token: "border-subtle", hex: "#e2e8f0", role: "Crisp subtle hairline borders" },
  { token: "border-focus", hex: "#3b82f6", role: "Active state & input focus rings" },
  { token: "accent-primary", hex: "#2563eb", role: "Primary action buttons & active indicators" },
  { token: "accent-hover", hex: "#1d4ed8", role: "Primary button hover & interactive state" },
  { token: "fg-primary", hex: "#0f172a", role: "Deep slate high-emphasis text & headings (WCAG AAA)" },
  { token: "fg-muted", hex: "#64748b", role: "Muted secondary text, metadata & helper copy" },
  { token: "brand-primary", hex: "#141817", role: "Primary brand anchor & dark element surface" },
  { token: "brand-secondary", hex: "#737b78", role: "Secondary brand tone & neutral accent" },
  { token: "brand-accent", hex: "#2563eb", role: "Vibrant accent for highlights and active tabs" },
];

export interface PaletteInfo {
  paletteName: string;
  theme: string;
  swatches: string[];
}

export function extractPaletteInfo(input: string): PaletteInfo | null {
  if (!input || !input.trim()) return null;
  try {
    let jsonStr = input;
    if (jsonStr.startsWith("{") && jsonStr.includes("rawMarkdown")) {
      const parsed = JSON.parse(jsonStr);
      if (parsed.rawMarkdown && parsed.rawMarkdown.startsWith("{")) {
        jsonStr = parsed.rawMarkdown;
      }
    }
    if (jsonStr.startsWith("{") && (jsonStr.includes("paletteName") || jsonStr.includes("swatches"))) {
      const parsed = JSON.parse(jsonStr);
      return {
        paletteName: parsed.paletteName || "Custom Palette",
        theme: parsed.theme || "Neutral / Balanced",
        swatches: Array.isArray(parsed.swatches) ? parsed.swatches : ["#141817", "#737b78", "#2563eb"],
      };
    }
  } catch {
    // Not valid JSON
  }
  return null;
}

export function synthesizeTokensFromPalette(palette: PaletteInfo | null): ColorToken[] {
  if (!palette || !palette.swatches || palette.swatches.length === 0) {
    return DEFAULT_COLOR_TOKENS;
  }
  const s0 = palette.swatches[0] || "#141817";
  const s1 = palette.swatches[1] || "#737b78";
  const s2 = palette.swatches[2] || "#2563eb";

  return [
    { token: "bg-base", hex: "#f8fafc", role: "Primary page background surface (clean off-white)" },
    { token: "bg-surface", hex: "#ffffff", role: "Pure white card, sidebar, and container background" },
    { token: "bg-elevated", hex: "#f1f5f9", role: "Hover states, popovers, and elevated panels" },
    { token: "border-subtle", hex: "#e2e8f0", role: "Crisp subtle hairline borders" },
    { token: "border-focus", hex: s2, role: "Active state & input focus rings" },
    { token: "accent-primary", hex: s2, role: "Primary action buttons & active indicators" },
    { token: "accent-hover", hex: s2 === "#2563eb" ? "#1d4ed8" : s2, role: "Primary button hover state" },
    { token: "fg-primary", hex: s0.startsWith("#1") || s0.startsWith("#0") ? s0 : "#0f172a", role: "Deep high-contrast text & headings (WCAG AAA)" },
    { token: "fg-muted", hex: s1, role: "Muted secondary text, metadata & helper copy" },
    { token: "brand-primary", hex: s0, role: "Primary brand anchor & contrast base" },
    { token: "brand-secondary", hex: s1, role: "Secondary brand tone & neutral anchor" },
    { token: "brand-accent", hex: s2, role: "Active brand accent & interactive focus" },
  ];
}

export function generateRichDesignSections(
  appName: string,
  appIdea: string,
  palette?: PaletteInfo | null
): AccordionSection[] {
  const pName = palette?.paletteName || "Swiss Grid";
  const pSwatches = palette?.swatches || ["#141817", "#737b78", "#2563eb"];
  const accentHex = pSwatches[2] || "#2563eb";

  return [
    {
      id: "aesthetic-direction",
      title: "1. Aesthetic Direction & Brief Inference",
      content: `
- **Design Read**: Reading as a modern, high-contrast, visual-first workspace for ${appName || "the application"}.
- **Product Context**: ${appIdea || "AI-powered workflow product."}
- **Active Palette**: ${pName} (${pSwatches.join(" | ")})
- **The Three Dials Configuration**:
  - \`DESIGN_VARIANCE: 8\` (Asymmetric Bento Grid rhythm & distinctive hierarchy)
  - \`MOTION_INTENSITY: 6\` (Tactile 150ms cubic-bezier state transitions)
  - \`VISUAL_DENSITY: 4\` (Airy 4px-grid spacing with comfortable bounds)
- **Design Locks**:
  - \`Color Consistency Lock\`: Unified single primary accent (\`${accentHex}\`) across all page surfaces.
  - \`Shape Consistency Lock\`: Uniform 8px (\`rounded.md\`) for inputs/buttons, 12-16px (\`rounded.lg\`) for cards.
  - \`Page Theme Lock\`: Locked crisp light mode root surface (\`#f8fafc\`), dark slate text (\`#0f172a\`), zero glare.
      `.trim(),
    },
    {
      id: "color-tokens",
      title: "2. Design Tokens & Color System",
      content: `
| Token Name | HEX / HSL Value | Role & Purpose |
| :--- | :--- | :--- |
| \`bg-base\` | \`#f8fafc\` | Primary page background surface (Clean off-white) |
| \`bg-surface\` | \`#ffffff\` | Pure white card, sidebar, and container background |
| \`bg-elevated\` | \`#f1f5f9\` | Hover states, popovers, and elevated panels |
| \`border-subtle\` | \`#e2e8f0\` | Crisp subtle hairline borders |
| \`border-focus\` | \`${accentHex}\` | Active state & input focus rings |
| \`accent-primary\` | \`${accentHex}\` | Primary action buttons & active indicators |
| \`fg-primary\` | \`${pSwatches[0] || "#0f172a"}\` | Deep slate high emphasis text & headings (WCAG AAA) |
| \`fg-muted\` | \`${pSwatches[1] || "#64748b"}\` | Muted secondary text, metadata & helper copy |
| \`brand-accent\` | \`${accentHex}\` | Active brand accent & interactive focus |
      `.trim(),
    },
    {
      id: "typography",
      title: "3. Typography & Font Pairing",
      content: `
- **Display Font**: Plus Jakarta Sans / Outfit (paired display font for headings & visual punch)
- **Body Font**: Inter / system-ui (highly readable, neutral body font)
- **Mono Font**: JetBrains Mono / Geist Mono (for code, tokens, and technical identifiers)
- **Heading 1**: 2rem (32px), Font-weight 800, Color \`#0f172a\`, Letter-spacing -0.025em
- **Heading 2**: 1.3rem (20.8px), Font-weight 700, Color \`#1e293b\`, Letter-spacing -0.015em
- **Body Text**: 14px, Line-height 1.6, Color \`#334155\`, Font-weight 400
- **Code Token**: Background \`rgba(37,99,235,0.08)\`, Border \`rgba(37,99,235,0.2)\`, Text \`${accentHex}\`
      `.trim(),
    },
    {
      id: "layout-grid",
      title: "4. Layout, 4px Grid & Spacing Scale",
      content: `
- **Container Max-Width**: 1280px with 24px/32px responsive inline padding.
- **Grid Scale**: 12-column responsive layout adhering strictly to 4px spacing scale (4px, 8px, 12px, 16px, 24px, 32px, 48px).
- **Component Gutters**: 16px to 24px gap between cards in bento grids.
- **Section Spacing**: Generous separation of 40px to 64px between major functional sections.
      `.trim(),
    },
    {
      id: "elevation",
      title: "5. Elevation & Layered Shadow Tokens",
      content: `
- **Subtle Elevation**: Multi-layered shadow \`0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)\`.
- **Card Containers**: 1px crisp border stroke (\`#e2e8f0\`) on pure white background (\`#ffffff\`).
- **Elevated Popovers**: Soft shadow \`0 10px 25px -3px rgba(15,23,42,0.08)\` for dropdowns, tooltips, and modals.
- **Interactive Hover**: Gentle -1px translateY translation on hover with smooth 150ms transition.
      `.trim(),
    },
    {
      id: "border-radius",
      title: "6. Border Radius & Shape Consistency",
      content: `
- **Buttons & Inputs**: 8px (\`rounded.md\`) — uniform corner radius across all form inputs and interactive buttons.
- **Card Containers**: 12px (\`rounded.lg\`) to 16px (\`rounded.xl\`) for main content cards and preview panels.
- **Badges & Status Tags**: Full pill (\`rounded-full\` / 9999px) strictly reserved for status indicators.
      `.trim(),
    },
    {
      id: "component-guidelines",
      title: "7. Component Guidelines & Curated React Bits",
      content: `
- **Modular Architecture**: Self-contained, reusable React components with zero ad-hoc inline styles.
- **React Bits (reactbits.dev) Standard**:
  - **Variant Standard**: ALWAYS use the \`TS-TW\` (TypeScript + Tailwind CSS) variant.
  - **Approved Hero Backgrounds**: Subtle background FX (e.g. \`Aurora Background\` in HSL muted mode, \`Animated Grid / Dot Pattern\` with 1px hairline stroke).
  - **Approved UI Micro-Interactions**: Restrained, tactile components (e.g. \`Spotlight Card\` with subtle hover stroke, \`Magnet Button\`, \`Blur Text\` reveal).
  - **Banned Effects**: NO custom mouse cursors, NO oversaturated neon glows, NO unreadable text glitch/jitter FX.
      `.trim(),
    },
    {
      id: "accessibility",
      title: "8. Accessibility & WCAG AA Contrast",
      content: `
- **Text Contrast**: High contrast (minimum 4.5:1 for body copy, 14:1 for headings) against background surfaces.
- **Focus Rings**: 2px visible focus ring (\`border-focus\`) with 2px offset for keyboard navigation.
- **Semantic HTML**: HTML5 semantic markup (\`<header>\`, \`<main>\`, \`<section>\`, \`<article>\`) with valid ARIA attributes.
      `.trim(),
    },
    {
      id: "dos_and_donts",
      title: "9. Do's and Don'ts (Anti-Slop Directives)",
      content: `
### Do
- Maintain strict color and shape consistency across all page sections.
- Pair display font with body font for strong visual hierarchy.
- Use spatial negative space and surface contrast instead of heavy line dividers.
- Ensure WCAG AA contrast compliance for all text against light surfaces.

### Don't
- Do not use purple-to-blue gradient, gradient text, or neon glows (AI Slop Tell #1).
- Do not use plain static browser-default backgrounds for Hero Section.
- Do not repeat identical 3-card grid loops without visual weight variation.
- Do not use arbitrary hairline dividers under every header and card row.
      `.trim(),
    },
  ];
}

export const DEFAULT_ACCORDION_SECTIONS: AccordionSection[] = generateRichDesignSections("", "");

// Universal dynamic parser for markdown sections (#, ##)
export function parseMarkdownSections(mdText: string): AccordionSection[] {
  if (!mdText || !mdText.trim()) return [];

  const lines = mdText.split("\n");
  const sections: AccordionSection[] = [];
  let currentTitle = "";
  let currentContentLines: string[] = [];

  lines.forEach((line) => {
    // Detect top-level markdown heading: # or ##
    const headingMatch = line.match(/^#{1,2}\s+(.+)$/);
    if (headingMatch) {
      if (currentTitle && currentContentLines.join("").trim()) {
        sections.push({
          id: currentTitle.toLowerCase().replace(/[^\w]+/g, "-"),
          title: currentTitle,
          content: currentContentLines.join("\n").trim(),
        });
      }
      currentTitle = headingMatch[1].trim();
      currentContentLines = [];
    } else if (currentTitle) {
      currentContentLines.push(line);
    }
  });

  if (currentTitle && currentContentLines.join("").trim()) {
    sections.push({
      id: currentTitle.toLowerCase().replace(/[^\w]+/g, "-"),
      title: currentTitle,
      content: currentContentLines.join("\n").trim(),
    });
  }

  // Post-process: Merge separate "Do" and "Don't" sections into a unified "Do's and Don'ts" accordion panel
  const mergedSections: AccordionSection[] = [];
  let dosAndDontsSection: AccordionSection | null = null;

  sections.forEach((sec) => {
    const cleanTitle = sec.title.toLowerCase().trim();
    const isDo = cleanTitle === "do" || cleanTitle === "dos" || cleanTitle === "do's";
    const isDont = cleanTitle === "don't" || cleanTitle === "dont" || cleanTitle === "donts" || cleanTitle === "don'ts";
    const isMergedAlready = cleanTitle.includes("do") && cleanTitle.includes("don");

    if (isDo || isDont) {
      if (!dosAndDontsSection) {
        dosAndDontsSection = {
          id: "dos_and_donts",
          title: "Do's and Don'ts",
          content: "",
        };
        mergedSections.push(dosAndDontsSection);
      }

      const headingPrefix = isDo ? "### Do\n" : "### Don't\n";
      dosAndDontsSection.content = (dosAndDontsSection.content ? dosAndDontsSection.content + "\n\n" : "") + headingPrefix + sec.content;
    } else if (isMergedAlready) {
      sec.id = "dos_and_donts";
      sec.title = "Do's and Don'ts";
      mergedSections.push(sec);
    } else {
      mergedSections.push(sec);
    }
  });

  return mergedSections.length > 0 ? mergedSections : [];
}

// Parser for Color Tokens table and YAML key-value pairs
export function parseColorTokens(mdText: string): ColorToken[] {
  if (!mdText || !mdText.trim()) return [];

  const tokens: ColorToken[] = [];
  const seen = new Set<string>();

  const lines = mdText.split("\n");
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("|")) {
      const cells = trimmed
        .split("|")
        .map((c) => c.trim().replace(/^`|`$/g, ""))
        .filter((c, idx, arr) => !(idx === 0 && c === "") && !(idx === arr.length - 1 && c === ""));

      if (cells.length >= 3) {
        const rawToken = cells[0].trim();
        const hexMatch = cells[1].match(/#(?:[0-9a-fA-F]{3,4}){1,2}\b/);
        const role = cells[2].trim();

        if (
          rawToken &&
          hexMatch &&
          !rawToken.toLowerCase().includes("token") &&
          !rawToken.toLowerCase().includes("name") &&
          !seen.has(rawToken)
        ) {
          const hex = hexMatch[0];
          tokens.push({ token: rawToken, hex, role });
          seen.add(rawToken);
        }
      }
    }
  });

  // Key-value format: token: "#hex" or token: #hex
  const kvRegex = /^\s*([\w-]+):\s*["']?(#[0-9a-fA-F]{3,8})["']?/gm;
  let match;
  while ((match = kvRegex.exec(mdText)) !== null) {
    const token = match[1].trim();
    const hex = match[2].trim();
    if (token && hex && !seen.has(token)) {
      tokens.push({ token, hex, role: "Color Token" });
      seen.add(token);
    }
  }

  return tokens;
}

export function parseOrSynthesizeDesignData(
  rawDesignData: string,
  appName: string = "Stratum AI",
  appIdea: string = ""
): {
  sections: AccordionSection[];
  colorTokens: ColorToken[];
  paletteInfo: PaletteInfo | null;
  rawMarkdown: string;
} {
  const paletteInfo = extractPaletteInfo(rawDesignData);
  let rawMarkdown = rawDesignData || "";

  if (rawMarkdown.startsWith("{") && rawMarkdown.includes("rawMarkdown")) {
    try {
      const parsed = JSON.parse(rawMarkdown);
      rawMarkdown = parsed.rawMarkdown || rawMarkdown;
    } catch {}
  }

  const trimmed = rawMarkdown.trim();
  const isJsonOnly = trimmed.startsWith("{") && trimmed.endsWith("}");

  let sections = isJsonOnly ? [] : parseMarkdownSections(rawMarkdown);
  let colorTokens = isJsonOnly ? [] : parseColorTokens(rawMarkdown);

  if (sections.length === 0) {
    sections = generateRichDesignSections(appName, appIdea, paletteInfo);
  }

  if (colorTokens.length === 0) {
    colorTokens = synthesizeTokensFromPalette(paletteInfo);
  }

  if (isJsonOnly || !rawMarkdown.includes("#")) {
    rawMarkdown = `# Design Guidelines & System Specifications: ${appName || "Project"}\n\n` +
      sections.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n");
  }

  return { sections, colorTokens, paletteInfo, rawMarkdown };
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Format bold (**text**), italic (*text*), backtick code (`code`), and live visual color swatches
export function formatMarkdownText(text: string, colorMap: Record<string, string>): string {
  if (!text) return "";
  let html = text;

  // Convert **bold** -> <strong>bold</strong>
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="color: var(--fg-primary); font-weight: 600;">$1</strong>');

  // Convert *italic* -> <em>italic</em>
  html = html.replace(/\*([^*]+)\*/g, '<em style="color: var(--color-mist);">$1</em>');

  // Convert backtick code (`code`) or `{token}` into live color swatches or styled code pills
  html = html.replace(/(`([^`]+)`|\{([^}]+)\})/g, (fullMatch, _g1, codeInside, braceInside) => {
    const rawContent = (codeInside || braceInside || "").trim();

    // Check if rawContent is an explicit Hex Color Code e.g. #f8fafc or #4f46e5
    const hexMatch = rawContent.match(/^#(?:[0-9a-fA-F]{3,4}){1,2}$/);
    if (hexMatch) {
      const hex = hexMatch[0];
      return `<span style="display: inline-flex; align-items: center; gap: 6px; padding: 2px 7px; border-radius: 4px; background: var(--bg-surface); border: 1px solid var(--border-hairline); vertical-align: middle; margin: 0 2px;">
        <span style="width: 12px; height: 12px; border-radius: 3px; background: ${hex}; border: 1px solid rgba(0,0,0,0.15); box-shadow: 0 1px 3px rgba(0,0,0,0.12); display: inline-block;"></span>
        <code style="font-family: var(--font-mono); font-size: 11px; color: var(--fg-primary); font-weight: 700;">${hex}</code>
      </span>`;
    }

    // Check if rawContent matches a known Color Token e.g. bg-base or accent-primary
    const cleanToken = rawContent.replace(/^colors\./, "").trim();
    const tokenHex = colorMap[cleanToken] || colorMap[rawContent];
    if (tokenHex && tokenHex.startsWith("#")) {
      return `<span style="display: inline-flex; align-items: center; gap: 6px; padding: 2px 7px; border-radius: 4px; background: var(--bg-surface); border: 1px solid var(--border-hairline); vertical-align: middle; margin: 0 2px;">
        <span style="width: 12px; height: 12px; border-radius: 3px; background: ${tokenHex}; border: 1px solid rgba(0,0,0,0.15); box-shadow: 0 1px 3px rgba(0,0,0,0.12); display: inline-block;"></span>
        <code style="font-family: var(--font-mono); font-size: 11px; color: var(--color-signal); font-weight: 700;">${escapeHtml(rawContent)}</code>
      </span>`;
    }

    // Default code pill with primary yellow highlighting
    return `<code style="background: rgba(255,182,39,0.12); color: var(--color-signal); border: 1px solid rgba(255,182,39,0.3); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 11px; font-weight: 700;">${escapeHtml(rawContent)}</code>`;
  });


  return html;
}


// Block-based Hybrid Renderer for Accordion Content (Cards, Tables, & Badges)
export function renderStructuredAccordionContent(content: string, colorMap: Record<string, string>) {
  if (!content || !content.trim()) return null;

  const rawLines = content.split("\n");
  const blocks: Array<
    | { type: "subheader"; text: string; isDo?: boolean; isDont?: boolean }
    | { type: "list"; items: { title: string; token: string; desc: string; subItems?: { title: string; desc: string }[] }[] }
    | { type: "properties"; items: { key: string; val: string }[] }
    | { type: "table"; headers: string[]; rows: string[][] }
    | { type: "paragraph"; text: string }
  > = [];

  let currentListItems: { title: string; token: string; desc: string; subItems?: { title: string; desc: string }[] }[] = [];
  let currentKvItems: { key: string; val: string }[] = [];
  let currentTableRows: string[][] = [];

  const flushList = () => {
    if (currentListItems.length > 0) {
      blocks.push({ type: "list", items: [...currentListItems] });
      currentListItems = [];
    }
  };

  const flushKv = () => {
    if (currentKvItems.length > 0) {
      blocks.push({ type: "properties", items: [...currentKvItems] });
      currentKvItems = [];
    }
  };

  const flushTable = () => {
    if (currentTableRows.length > 0) {
      const headers = currentTableRows[0];
      const rows = currentTableRows.slice(1);
      blocks.push({ type: "table", headers, rows });
      currentTableRows = [];
    }
  };

  const flushAll = () => {
    flushList();
    flushKv();
    flushTable();
  };

  rawLines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushAll();
      return;
    }

    const indent = line.search(/\S/);

    // 1. Check Subheader line e.g. ### Do or ### Don't or ### Section
    if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
      flushAll();
      const text = trimmed.replace(/^#{2,3}\s+/, "").trim();
      const isDo = text.toLowerCase() === "do";
      const isDont = text.toLowerCase() === "don't" || text.toLowerCase() === "dont";
      blocks.push({ type: "subheader", text, isDo, isDont });
      return;
    }

    // 2. Check explicit markdown table row e.g. | col1 | col2 |
    if (trimmed.startsWith("|")) {
      flushList();
      flushKv();
      const cells = trimmed
        .split("|")
        .map((c) => c.trim())
        .filter((c, idx, arr) => !(idx === 0 && c === "") && !(idx === arr.length - 1 && c === ""));
      if (cells.length > 0 && !cells.every((c) => /^:?-+:?$/.test(c))) {
        currentTableRows.push(cells);
      }
      return;
    }

    // 3. Check Bullet List Item: - or * or bullet
    const bulletMatch = trimmed.match(/^[-*\u2022]\s+(.+)$/);
    if (bulletMatch) {
      flushKv();
      flushTable();
      const itemText = bulletMatch[1].trim();

      let title = "";
      let desc = itemText;
      let token = "";

      const boldMatch = itemText.match(/^\*\*([^*]+)\*\*\s*(.*)$/);
      if (boldMatch) {
        title = boldMatch[1].trim();
        desc = boldMatch[2].trim();
      } else {
        const splitParts = itemText.split(/[:\u2014\u2013]\s*(.+)/);
        if (splitParts.length >= 2) {
          title = splitParts[0].trim();
          desc = splitParts[1] ? splitParts[1].trim() : "";
        } else {
          title = itemText;
          desc = "";
        }
      }

      const tokenMatch = (title + " " + desc).match(/\{([^}]+)\}/);
      if (tokenMatch) {
        token = tokenMatch[0];
      }

      desc = desc.replace(/^[:\u2014\u2013]\s*/, "");

      if (indent >= 2 && currentListItems.length > 0) {
        const parent = currentListItems[currentListItems.length - 1];
        if (!parent.subItems) parent.subItems = [];
        parent.subItems.push({ title, desc });
      } else {
        currentListItems.push({ title, token, desc, subItems: [] });
      }
      return;
    }

    // 4. Check Key-Value line e.g. fontFamily: Notion Sans or fontSize: 80px
    const kvMatch = trimmed.match(/^([\w-]+):\s*(.+)$/);
    if (kvMatch && !trimmed.startsWith("http")) {
      flushList();
      flushTable();
      currentKvItems.push({
        key: kvMatch[1].trim(),
        val: kvMatch[2].trim(),
      });
      return;
    }

    // 5. Regular paragraph text
    flushAll();
    blocks.push({ type: "paragraph", text: trimmed });
  });

  flushAll();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
      {blocks.map((block, bIdx) => {
        if (block.type === "subheader") {
          if (block.isDo || block.isDont) {
            return (
              <div
                key={bIdx}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: "var(--radius-sm)",
                  background: block.isDo ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  border: `1px solid ${block.isDo ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                  color: block.isDo ? "#4ade80" : "#f87171",
                  fontFamily: "var(--font-body)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginTop: 8,
                  alignSelf: "flex-start",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: block.isDo ? "#22c55e" : "#ef4444",
                  }}
                />
                {block.text}
              </div>
            );
          }

          return (
            <div
              key={bIdx}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--fg-primary)",
                marginTop: 10,
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ width: 3, height: 12, borderRadius: 2, background: "var(--color-signal)" }} />
              {block.text}
            </div>
          );
        }

        if (block.type === "list") {
          return (
            <div key={bIdx} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {block.items.map((item, rIdx) => (
                <div
                  key={rIdx}
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-hairline)",
                    borderRadius: "var(--radius-md)",
                    padding: "12px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-signal)", flexShrink: 0 }} />
                    <span
                      style={{ fontWeight: 700, fontSize: 13, color: "var(--fg-primary)" }}
                      dangerouslySetInnerHTML={{ __html: formatMarkdownText(item.title, colorMap) }}
                    />
                    {item.token && (
                      <span dangerouslySetInnerHTML={{ __html: formatMarkdownText(item.token, colorMap) }} />
                    )}
                  </div>
                  {item.desc && (
                    <div
                      style={{ paddingLeft: 14, fontSize: 12.5, color: "var(--color-mist)", lineHeight: 1.55 }}
                      dangerouslySetInnerHTML={{ __html: formatMarkdownText(item.desc, colorMap) }}
                    />
                  )}
                  {item.subItems && item.subItems.length > 0 && (
                    <div style={{ marginLeft: 14, marginTop: 6, paddingLeft: 10, borderLeft: "2px solid var(--border-hairline)", display: "flex", flexDirection: "column", gap: 6 }}>
                      {item.subItems.map((sub, sIdx) => (
                        <div key={sIdx} style={{ fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.5, display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--fg-muted)", flexShrink: 0 }} />
                          <span dangerouslySetInnerHTML={{ __html: formatMarkdownText(sub.title + (sub.desc ? `: ${sub.desc}` : ""), colorMap) }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        }

        if (block.type === "properties") {
          return (
            <div key={bIdx} style={{ border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-hairline)", background: "rgba(255,255,255,0.03)" }}>
                    <th style={{ padding: "10px 14px", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", width: "40%" }}>PROPERTY</th>
                    <th style={{ padding: "10px 14px", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase" }}>VALUE</th>
                  </tr>
                </thead>
                <tbody>
                  {block.items.map((kv, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: rIdx < block.items.length - 1 ? "1px solid var(--border-hairline)" : "none" }}>
                      <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--fg-secondary)" }}>
                        {kv.key}
                      </td>
                      <td
                        style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-signal)" }}
                        dangerouslySetInnerHTML={{ __html: formatMarkdownText(kv.val, colorMap) }}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === "table") {
          return (
            <div key={bIdx} style={{ border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-hairline)", background: "rgba(255,255,255,0.03)" }}>
                    {block.headers.map((cell, cIdx) => (
                      <th key={cIdx} style={{ padding: "10px 14px", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase" }}>
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: rIdx < block.rows.length - 1 ? "1px solid var(--border-hairline)" : "none" }}>
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          style={{ padding: "10px 14px", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--fg-primary)" }}
                          dangerouslySetInnerHTML={{ __html: formatMarkdownText(cell, colorMap) }}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <div
            key={bIdx}
            dangerouslySetInnerHTML={{ __html: formatMarkdownText(block.text, colorMap) }}
            style={{ color: "var(--color-mist)", lineHeight: 1.6 }}
          />
        );
      })}
    </div>
  );
}

