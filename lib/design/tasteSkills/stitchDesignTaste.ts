export const stitchDesignTasteSkill = `---
name: stitch-design-taste
description: Semantic Design System Skill for Google Stitch. Generates agent-friendly DESIGN.md files that enforce premium, anti-generic UI standards — strict typography, calibrated color, asymmetric layouts, perpetual micro-motion, and hardware-accelerated performance.
---

# Stitch Design Taste — Semantic Design System Skill

## Overview
This skill generates \`DESIGN.md\` files optimized for Google Stitch screen generation. It translates the battle-tested anti-slop frontend engineering directives into Stitch's native semantic design language — descriptive, natural-language rules paired with precise values that Stitch's AI agent can interpret to produce premium, non-generic interfaces.

The generated \`DESIGN.md\` serves as the **single source of truth** for prompting Stitch to generate new screens that align with a curated, high-agency design language. Stitch interprets design through **"Visual Descriptions"** supported by specific color values, typography specs, and component behaviors.

## Prerequisites
- Access to Google Stitch via [labs.google/stitch](https://labs.google/stitch)
- Optionally: Stitch MCP Server for programmatic integration with Cursor, Antigravity, or Gemini CLI

## The Goal
Generate a \`DESIGN.md\` file that encodes:
1. **Visual atmosphere** — the mood, density, and design philosophy
2. **Color calibration** — neutrals, accents, and banned patterns with hex codes
3. **Typographic architecture** — font stacks, scale hierarchy, and anti-patterns
4. **Component behaviors** — buttons, cards, inputs with interaction states
5. **Layout principles** — grid systems, spacing philosophy, responsive strategy
6. **Motion philosophy** — animation engine specs, spring physics, perpetual micro-interactions
7. **Anti-patterns** — explicit list of banned AI design clichés

## Analysis & Synthesis Instructions

### 1. Define the Atmosphere
Evaluate the target project's intent. Use evocative adjectives from the taste spectrum:
- **Density:** "Art Gallery Airy" (1–3) → "Daily App Balanced" (4–7) → "Cockpit Dense" (8–10)
- **Variance:** "Predictable Symmetric" (1–3) → "Offset Asymmetric" (4–7) → "Artsy Chaotic" (8–10)
- **Motion:** "Static Restrained" (1–3) → "Fluid CSS" (4–7) → "Cinematic Choreography" (8–10)

Default baseline: Variance 8, Motion 6, Density 4. Adapt dynamically based on user's vibe description.

### 2. Map the Color Palette & Ground Truth Binding
For each color provide: **Descriptive Name** + **Hex Code** + **Functional Role**.

**Mandatory constraints & Anti-Slop Rules:**
- **\`design.md\` Ground Truth Binding**: Always map colors directly to the project's \`design.md\` token variables (\`bg-base\`, \`bg-surface\`, \`accent-primary\`, \`border-subtle\`, \`fg-primary\`).
- **React Bits (reactbits.dev) Component Integration**: Mandate curated React Bits components for Hero background FX (\`Aurora Background\`, \`Animated Grid\`) and UI components (\`Spotlight Card\`, \`Blur Text\`, \`Magnet Button\`) using \`TS-TW\` variant standards.
- Maximum 1 accent color. Saturation below 80%
- The "AI Purple/Blue Neon" aesthetic is strictly BANNED — no purple button glows, no neon gradients
- NEVER use navy blue \`#0F172A\` slop containers or muddy tinted background boxes
- NEVER use cheap meta-labels ("SECTION 01", "QUESTION 05")
- Use absolute neutral bases (Zinc/Slate) with high-contrast singular accents
- Stick to one palette for the entire output — no warm/cool gray fluctuation
- Never use pure black (\`#000000\`) — use Off-Black, Zinc-950, or Charcoal

### 3. Establish Typography Rules
- **Display/Headlines:** Track-tight, controlled scale. Not screaming. Hierarchy through weight and color, not just massive size
- **Body:** Relaxed leading, max 65 characters per line
- **Font Selection:** \`Inter\` is BANNED for premium/creative contexts. Force unique character: \`Geist\`, \`Outfit\`, \`Cabinet Grotesk\`, or \`Satoshi\`
- **Serif Ban:** Generic serif fonts (\`Times New Roman\`, \`Georgia\`, \`Garamond\`, \`Palatino\`) are BANNED. If serif is needed for editorial/creative contexts, use only distinctive modern serifs: \`Fraunces\`, \`Gambarino\`, \`Editorial New\`, or \`Instrument Serif\`. Serif is always BANNED in dashboards or software UIs
- **Dashboard Constraint:** Use Sans-Serif pairings exclusively (\`Geist\` + \`Geist Mono\` or \`Satoshi\` + \`JetBrains Mono\`)
- **High-Density Override:** When density exceeds 7, all numbers must use Monospace

### 4. Define the Hero Section
The Hero is the first impression and must be creative, striking, and never generic:
- **Inline Image Typography:** Embed small, contextual photos or visuals directly between words or letters in the headline. Images sit inline at type-height, rounded, acting as visual punctuation. This is the signature creative technique
- **No Overlapping:** Text must never overlap images or other text. Every element occupies its own clean spatial zone
- **No Filler Text:** "Scroll to explore", "Swipe down", scroll arrow icons, bouncing chevrons are BANNED. The content should pull users in naturally
- **Asymmetric Structure:** Centered Hero layouts BANNED when variance exceeds 4
- **CTA Restraint:** Maximum one primary CTA. No secondary "Learn more" links

### 5. Describe Component Stylings
For each component type, describe shape, color, shadow depth, and interaction behavior:
- **Buttons:** Tactile push feedback on active state. No neon outer glows. No custom mouse cursors
- **Cards:** Use ONLY when elevation communicates hierarchy. Tint shadows to background hue. For high-density layouts, replace cards with border-top dividers or negative space
- **Inputs/Forms:** Label above input, helper text optional, error text below. Standard gap spacing
- **Loading States:** Skeletal loaders matching layout dimensions — no generic circular spinners
- **Empty States:** Composed compositions indicating how to populate data
- **Error States:** Clear, inline error reporting
`;
