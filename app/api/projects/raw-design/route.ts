import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return new NextResponse("Missing projectId", { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: {
        id_userId: {
          id: projectId,
          userId: session.user.id,
        },
      },
      select: { appName: true, appIdea: true, designData: true },
    });

    if (!project) {
      return new NextResponse("Project not found or unauthorized", { status: 404 });
    }

    let markdownText = project.designData || "";

    if (markdownText.startsWith("{") && markdownText.includes("rawMarkdown")) {
      try {
        const parsed = JSON.parse(markdownText);
        markdownText = parsed.rawMarkdown || markdownText;
      } catch {}
    }

    // If raw markdown is a JSON string (e.g. palette JSON) or has no markdown headings, synthesize rich markdown
    const isJsonOnly = markdownText.trim().startsWith("{") && markdownText.trim().endsWith("}");
    if (isJsonOnly || !markdownText.includes("#")) {
      let paletteName = "Custom Palette";
      let swatches = ["#141817", "#737b78", "#2563eb"];
      try {
        const pObj = JSON.parse(markdownText);
        if (pObj.paletteName) paletteName = pObj.paletteName;
        if (Array.isArray(pObj.swatches)) swatches = pObj.swatches;
      } catch {}

      const s0 = swatches[0] || "#141817";
      const s1 = swatches[1] || "#737b78";
      const s2 = swatches[2] || "#2563eb";

      markdownText = `# Design Guidelines & System Specifications: ${project.appName || "Project"}

## 1. Aesthetic Direction & Brief Inference
- **Design Read**: Reading as a modern, high-contrast, visual-first workspace for ${project.appName}.
- **Product Context**: ${project.appIdea || "Application workspace and workflows."}
- **Active Palette**: ${paletteName} (${swatches.join(" | ")})
- **The Three Dials Configuration**:
  - \`DESIGN_VARIANCE: 8\` (Asymmetric Bento Grid rhythm & distinctive hierarchy)
  - \`MOTION_INTENSITY: 6\` (Tactile 150ms cubic-bezier state transitions)
  - \`VISUAL_DENSITY: 4\` (Airy 4px-grid spacing with comfortable bounds)
- **Design Locks**:
  - \`Color Consistency Lock\`: Unified single primary accent (\`${s2}\`) across all surfaces.
  - \`Shape Consistency Lock\`: Uniform 8px (\`rounded.md\`) for inputs/buttons, 12-16px (\`rounded.lg\`) for cards.
  - \`Page Theme Lock\`: Locked crisp light mode root surface (\`#f8fafc\`), dark slate text (\`#0f172a\`), zero glare.

## 2. Design Tokens & Color System
| Token Name | HEX / HSL Value | Role & Purpose |
| :--- | :--- | :--- |
| \`bg-base\` | \`#f8fafc\` | Primary page background surface (Clean off-white) |
| \`bg-surface\` | \`#ffffff\` | Pure white card, sidebar, and container background |
| \`bg-elevated\` | \`#f1f5f9\` | Hover states, popovers, and elevated panels |
| \`border-subtle\` | \`#e2e8f0\` | Crisp subtle hairline borders |
| \`border-focus\` | \`${s2}\` | Active state & input focus rings |
| \`accent-primary\` | \`${s2}\` | Primary action buttons & active indicators |
| \`fg-primary\` | \`${s0}\` | Deep slate high emphasis text & headings (WCAG AAA) |
| \`fg-muted\` | \`${s1}\` | Muted secondary text, metadata & helper copy |
| \`brand-accent\` | \`${s2}\` | Active brand accent & interactive focus |

## 3. Typography & Font Pairing
- **Display Font**: Plus Jakarta Sans / Outfit (paired display font for headings & visual hierarchy)
- **Body Font**: Inter / system-ui (highly readable, neutral body font)
- **Mono Font**: JetBrains Mono / Geist Mono (for code, tokens, and technical identifiers)
- **Heading 1**: 2rem (32px), Font-weight 800, Color \`#0f172a\`, Letter-spacing -0.025em
- **Heading 2**: 1.3rem (20.8px), Font-weight 700, Color \`#1e293b\`, Letter-spacing -0.015em
- **Body Text**: 14px, Line-height 1.6, Color \`#334155\`, Font-weight 400

## 4. Layout, 4px Grid & Spacing Scale
- **Container Max-Width**: 1280px with 24px/32px responsive inline padding.
- **Grid Scale**: 12-column responsive layout adhering strictly to 4px spacing scale (4px, 8px, 12px, 16px, 24px, 32px, 48px).
- **Component Gutters**: 16px to 24px gap between cards in bento grids.
- **Section Spacing**: Generous separation of 40px to 64px between major functional sections.

## 5. Elevation & Layered Shadow Tokens
- **Subtle Elevation**: Multi-layered shadow \`0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)\`.
- **Card Containers**: 1px crisp border stroke (\`#e2e8f0\`) on pure white background (\`#ffffff\`).
- **Elevated Popovers**: Soft shadow \`0 10px 25px -3px rgba(15,23,42,0.08)\` for dropdowns, tooltips, and modals.

## 6. Border Radius & Shape Consistency
- **Buttons & Inputs**: 8px (\`rounded.md\`) — uniform corner radius across all form inputs and interactive buttons.
- **Card Containers**: 12px (\`rounded.lg\`) to 16px (\`rounded.xl\`) for main content cards and preview panels.
- **Badges & Status Tags**: Full pill (\`rounded-full\` / 9999px) strictly reserved for status indicators.

## 7. Component Guidelines & Curated React Bits
- **Modular Architecture**: Self-contained, reusable React components with zero ad-hoc inline styles.
- **React Bits Standard**: Use \`TS-TW\` variants only. Approved subtle background effects (e.g. \`Aurora Background\` in muted mode, \`Animated Grid\` with 1px stroke). Tactile components (\`Spotlight Card\`, \`Magnet Button\`, \`Blur Text\`).

## 8. Accessibility & WCAG AA Contrast
- **Text Contrast**: High contrast (minimum 4.5:1 for body copy, 14:1 for headings) against background surfaces.
- **Focus Rings**: 2px visible focus ring with 2px offset for keyboard navigation.
- **Semantic HTML**: HTML5 semantic markup (\`<header>\`, \`<main>\`, \`<section>\`, \`<article>\`) with valid ARIA attributes.

## 9. Do's and Don'ts (Anti-Slop Directives)
### Do
- Maintain strict color and shape consistency across all page surfaces.
- Pair display font with body font for strong visual hierarchy.
- Use spatial negative space and surface contrast instead of heavy line dividers.
- Ensure WCAG AA contrast compliance for all text against light surfaces.

### Don't
- Do not use purple-to-blue gradient, gradient text, or neon glows (AI Slop Tell #1).
- Do not use plain static browser-default backgrounds for Hero Section.
- Do not repeat identical 3-card grid loops without visual weight variation.
- Do not use arbitrary hairline dividers under every header and card row.
`;
    }

    return new NextResponse(markdownText, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": "inline",
      },
    });
  } catch (error: any) {
    console.error("Error serving raw design.md:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
