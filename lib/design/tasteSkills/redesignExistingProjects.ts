export const redesignExistingProjectsSkill = `---
name: redesign-existing-projects
description: Upgrades existing websites and apps to premium quality. Audits current design, identifies generic AI patterns, and applies high-end design standards without breaking functionality. Works with any CSS framework or vanilla CSS.
---

# Redesign Skill

## How This Works

When applied to an existing project, follow this sequence:

1. **Scan** — Read the codebase. Identify the framework, styling method (Tailwind, vanilla CSS, styled-components, etc.), and current design patterns.
2. **Diagnose** — Run through the audit below. List every generic pattern, weak point, and missing state you find.
3. **Fix** — Apply targeted upgrades working with the existing stack. Do not rewrite from scratch. Improve what's there.

## Design Audit

### Typography

Check for these problems and fix them:

- **Browser default fonts or Inter everywhere.** Replace with a font that has character. Good options: \`Geist\`, \`Outfit\`, \`Cabinet Grotesk\`, \`Satoshi\`. For editorial/creative projects, pair a serif header with a sans-serif body.
- **Headlines lack presence.** Increase size for display text, tighten letter-spacing, reduce line-height. Headlines should feel heavy and intentional.
- **Body text too wide.** Limit paragraph width to roughly 65 characters. Increase line-height for readability.
- **Only Regular (400) and Bold (700) weights used.** Introduce Medium (500) and SemiBold (600) for more subtle hierarchy.
- **Numbers in proportional font.** Use a monospace font or enable tabular figures (\`font-variant-numeric: tabular-nums\`) for data-heavy interfaces.
- **Missing letter-spacing adjustments.** Use negative tracking for large headers, positive tracking for small caps or labels.
- **All-caps subheaders everywhere.** Try lowercase italics, sentence case, or small-caps instead.
- **Orphaned words.** Single words sitting alone on the last line. Fix with \`text-wrap: balance\` or \`text-wrap: pretty\`.

### Color and Surfaces (Ground Truth & Anti-Slop Enforced)

- **\`design.md\` Ground Truth Binding**: Always map colors directly to the project's \`design.md\` token variables (\`bg-base\`, \`bg-surface\`, \`accent-primary\`, \`border-subtle\`, \`fg-primary\`).
- **React Bits (reactbits.dev) Component Integration**: Mandate curated React Bits components for Hero background FX (\`Aurora Background\`, \`Animated Grid\`) and UI components (\`Spotlight Card\`, \`Blur Text\`, \`Magnet Button\`) using \`TS-TW\` variant standards (\`npx shadcn@latest add @react-bits/<ComponentName>-TS-TW\`).
- **Pure \`#000000\` background.** Replace with off-black, dark charcoal, or tinted dark (\`#0a0a0a\`, \`#121212\`, or a dark navy).
- **Default Navy Blue Slop Containers (\`#0F172A\`).** BANNED. Replace with neutral slate/zinc base surfaces matching \`design.md\`.
- **Cheap Meta-Labels ("SECTION 01", "QUESTION 05").** BANNED. Remove all un-styled badge tags and cheap meta labels.
- **Oversaturated accent colors.** Keep saturation below 80%. Desaturate accents so they blend with neutrals instead of screaming.
- **More than one accent color.** Pick one. Remove the rest. Consistency beats variety.
- **Mixing warm and cool grays.** Stick to one gray family. Tint all grays with a consistent hue (warm or cool, not both).
- **Purple/blue "AI gradient" aesthetic.** This is the most common AI design fingerprint. Replace with neutral bases and a single, considered accent.
- **Generic \`box-shadow\`.** Tint shadows to match the background hue. Use colored shadows (e.g., dark blue shadow on a blue background) instead of pure black at low opacity.
- **Flat design with zero texture.** Add subtle noise, grain, or micro-patterns to backgrounds. Pure flat vectors feel sterile.
- **Perfectly even gradients.** Break the uniformity with radial gradients, noise overlays, or mesh gradients instead of standard linear 45-degree fades.
- **Inconsistent lighting direction.** Audit all shadows to ensure they suggest a single, consistent light source.
- **Random dark sections in a light mode page (or vice versa).** A single dark-background section breaking an otherwise light page looks like a copy-paste accident. Either commit to a full dark mode or keep a consistent background tone throughout. If contrast is needed, use a slightly darker shade of the same palette — not a sudden jump to \`#111\` in the middle of a cream page.
- **Empty, flat sections with no visual depth.** Sections that are just text on a plain background feel unfinished. Add high-quality background imagery (blurred, overlaid, or masked), subtle patterns, or ambient gradients. Use reliable placeholder sources like \`https://picsum.photos/seed/{name}/1920/1080\` when real assets are not available. Experiment with background images behind hero sections, feature blocks, or CTAs — even a subtle full-width photo at low opacity adds presence.

### Layout

- **Everything centered and symmetrical.** Break symmetry with offset margins, mixed aspect ratios, or left-aligned headers over centered content.
- **Three equal card columns as feature row.** This is the most generic AI layout. Replace with a 2-column zig-zag, asymmetric grid, horizontal scroll, or masonry layout.
- **Using \`height: 100vh\` for full-screen sections.** Replace with \`min-height: 100dvh\` to prevent layout jumping on mobile browsers (iOS Safari viewport bug).
- **Complex flexbox percentage math.** Replace with CSS Grid for reliable multi-column structures.
`;
