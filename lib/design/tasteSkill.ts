import { ALL_TASTE_SKILLS, codeSkeletons } from "./tasteSkills/index";

// ============================================================================
// SINGLE SOURCE OF TRUTH: Skill Routing Rules
// Used BOTH by the automated router (getFilteredTasteSkill) and by the
// designSkillRouter payload injected into directives — so they can never
// drift apart. Matching uses word-boundary scoring (a brief mentioning
// "motion" as part of "MOTION_INTENSITY" does NOT trigger gptTaste).
// ============================================================================
interface SkillRoutingRule {
  keywords: string[];
  targetSkill: string;
}

export const SKILL_ROUTING_RULES: SkillRoutingRule[] = [
  {
    keywords: ["minimalist", "minimalism", "minimal", "editorial", "calm", "document", "journal", "monochrome", "swiss", "warm-monochrome", "whitespace"],
    targetSkill: "minimalistUi",
  },
  {
    keywords: ["luxury", "luxurious", "high-end", "high end", "vanguard", "agency", "premium", "opulence", "expensive", "apple", "150k"],
    targetSkill: "highEndVisualDesign",
  },
  {
    keywords: ["awwwards", "gsap", "kinetic", "cinematic", "physics", "scrolltrigger", "scrubbing", "junkyard"],
    targetSkill: "gptTaste",
  },
  {
    keywords: ["stitch", "semantic design-system", "tokens-first", "design-system"],
    targetSkill: "stitchDesignTaste",
  },
  {
    keywords: ["redesign", "overhaul", "legacy", "preserve-existing"],
    targetSkill: "redesignExistingProjects",
  },
  {
    keywords: ["unabridged", "full-output", "exhaustive", "no-truncation"],
    targetSkill: "fullOutputEnforcement",
  },
  {
    keywords: ["landing page", "landing", "marketing site", "portfolio", "saas"],
    targetSkill: "designTasteFrontend",
  },
];

export const DEFAULT_TASTE_SKILL_KEY = "designTasteFrontend";

/** Number of skill-file lines embedded into .moryn/context.md (token budget). */
const CONTEXT_TASTE_SKILL_MAX_LINES = 140;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function scoreDesignText(text: string, rule: SkillRoutingRule): number {
  const normalized = ` ${text.toLowerCase()} `;
  let score = 0;
  for (const keyword of rule.keywords) {
    const re = new RegExp(`\\b${escapeRegex(keyword.toLowerCase())}\\b`, "g");
    score += (normalized.match(re) || []).length;
  }
  return score;
}

function selectSkillKey(designTextOrVibe?: string): { key: string; reasons: string[] } {
  const text = designTextOrVibe || "";
  let best: { rule: SkillRoutingRule; score: number; hits: string[] } | null = null;

  for (const rule of SKILL_ROUTING_RULES) {
    const score = scoreDesignText(text, rule);
    if (score <= 0) continue;
    // Strictly-greater wins → earlier rules break ties predictably.
    if (!best || score > best.score) {
      const hits = rule.keywords.filter((keyword) =>
        (text.toLowerCase().match(new RegExp(`\\b${escapeRegex(keyword.toLowerCase())}\\b`)) || []).length > 0
      );
      best = { rule, score, hits };
    }
  }

  if (!best) {
    return { key: DEFAULT_TASTE_SKILL_KEY, reasons: ["no strong design-style keyword detected; using general-purpose default"] };
  }
  return { key: best.rule.targetSkill, reasons: [`matched keyword(s): ${best.hits.join(", ")}`] };
}

/** Truncate a full skill file for token-efficient context embedding. */
function excerptSkill(content: string, maxLines: number): string {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  if (lines.length <= maxLines) return content;
  return `${lines.slice(0, maxLines).join("\n")}

>>> [CONTEXT OPTIMIZED] This skill file has ${lines.length} lines total (partially embedded to save tokens). Before complex UI work, fetch the COMPLETE skill:
    - npx moryn project taste-skill --skill <active_key>
    - or API: section=taste-skill&skill=<active_key>`;
}

export interface TasteSkillFilterOptions {
  /** Include the full skill file (true for section=taste-skill) or an excerpt (false for context embedding). */
  fullContent?: boolean;
  /** Max lines of the skill file when fullContent is false. */
  maxLines?: number;
}

export const TASTE_SKILL_DIRECTIVES = {
  name: "taste-skill-v2",
  version: "2.1.0-modular",
  description: "Modular Taste Skill Library from Knowledge OS Second Brain",

  // ==========================================
  // AUTOMATED SKILL ROUTER (AH-011)
  // Derived from SKILL_ROUTING_RULES — the SAME canonical list used by
  // getFilteredTasteSkill, so the payload and the runtime logic can't drift.
  // ==========================================
  designSkillRouter: {
    rule: "AI Agent MUST match project design style from <design_data> in .moryn/context.md to the exact skill key in <system_directives> taste_skill",
    skillMapping: SKILL_ROUTING_RULES.map(({ keywords, targetSkill }) => ({ keywords, targetSkill })),
    mandatoryDeclaration: "AI Agent MUST output '🎨 Design Skill Active: <targetSkill>' before generating any Frontend UI components."
  },

  // ==========================================
  // CATEGORY 1: CORE DIRECTIVES & STORYTELLING FRAMEWORK
  // ==========================================
  tasteSkillDirectives: {
    briefInference: {
      rule: "Sebelum menulis kode UI, analisa konteks produk & deklarasikan satu arah desain yang eksplisit (misal: Minimalist Editorial, High-Density Technical SaaS, Swiss Brutalist, Soft Calming Workspace, atau Warm Industrial).",
      forbiddenDefaults: "Dilarang keras memakai safe default otomatis (misal: background ungu-cyan gradient + 3 card simetris + hero centered)."
    },
    threeDials: {
      variance: "DESIGN_VARIANCE: 8 (1 = Perfect Symmetry, 10 = Artsy Chaos)",
      motion: "MOTION_INTENSITY: 6 (1 = Static, 10 = Cinematic / Physics)",
      density: "VISUAL_DENSITY: 4 (1 = Art Gallery / Airy, 10 = Cockpit / Packed Data)"
    },
    designLocks: {
      colorConsistencyLock: "Gunakan 1 sistem warna aksen utama untuk seluruh halaman.",
      shapeConsistencyLock: "Gunakan 1 sistem corner-radius konsisten per halaman.",
      pageThemeLock: "Tetapkan tema (light atau dark mode) pada root halaman."
    },
    antiSlopRules: {
      colors: "Dilarang keras memakai neon glow (blur-3xl bg-blue-600/10), default navy blue slop containers, atau muddy tinted background boxes (bg-rose-500/10, bg-amber-500/10). Wajib gunakan matte Obsidian Charcoal (#090A0C / #121318), clean monochrome typography, dan status natural muted.",
      lineDividers: "Dilarang keras memakai hairline dividers berulang (border-t, border-b, divide-y di bawah setiap header & card item). Manfaatkan spatial negative space (space-y-8) dan elevasi permukaan kontras.",
      badgeAlignment: "Badge dan status pills WAJIB sejajar in-line dengan shrink-0 agar tidak tumpang tindih (overlap) menutupi teks judul kategori.",
      commandDiscipline: "AI Agent WAJIB mematuhi instruksi khusus terminal dari pengguna. Jika pengguna melarang build (e.g. 'jika sudah beres fix jangan build'), AI Agent DILARANG KERAS menjalankan npm run build."
    },
    heroDiscipline: {
      headline: "Maksimal 2 baris pada tampilan desktop dengan value proposition yang spesifik.",
      subtext: "Maksimal 20 kata / 4 baris.",
      primaryCTA: "Wajib terlihat langsung tanpa perlu scroll (above the fold).",
      navigation: "Tinggi navbar maksimal 80px, single-line pada desktop.",
      badgeRules: "Badge di atas hero H1 diperbolehkan HANYA jika hero membutuhkan visual anchor."
    },
    storytellingLandingPageFramework: {
      minimumSections: 10,
      targetSections: "10-15 sections",
      narrativeFlow: [
        "1. Hero Section & Primary CTA",
        "2. User Pain Points",
        "3. Why Traditional Solutions Fail",
        "4. Product Reveal & Core Promise",
        "5. Step-by-Step How It Works",
        "6. Interactive Preview / UI Showcase",
        "7. Key Outcomes & Value Impact",
        "8. Social Proof & Testimonials",
        "9. Detailed Bento Grid Features",
        "10. Interactive Calculator / Use Cases",
        "11. FAQ Accordion",
        "12. Final High-Impact CTA"
      ]
    }
  },

  // ==========================================
  // CATEGORY 2: MODULAR TASTE SKILLS (IMPORTED FROM lib/tasteSkills/)
  // ==========================================
  skills: ALL_TASTE_SKILLS,

  // ==========================================
  // CATEGORY 3: CANONICAL CODE SKELETONS
  // ==========================================
  codeSkeletons,

  // ==========================================
  // CATEGORY 4: CODE EXAMPLES
  // ==========================================
  examples: {
    slopVsGood: {
      card_slop: `\n// ❌ AI SLOP: Side-tab border + glassmorphism + over-rounded\n<div className='bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border-l-4 border-purple-500 p-6 hover:scale-105 transition-all duration-500'>\n  <div className='rounded-xl bg-purple-500/10 p-3 mb-3'>\n    <Icon className='w-6 h-6 text-purple-500' />\n  </div>\n  <h3 className='text-lg font-semibold'>Feature</h3>\n</div>\n`,
      card_good: `\n// ✅ GOOD: Subtle shadow, consistent radius, no accent border, icon inline\n<div className='bg-surface rounded-lg shadow-sm border border-border p-4 md:p-6 hover:shadow-md hover:-translate-y-px transition-shadow duration-200'>\n  <div className='flex items-center gap-3 mb-2'>\n    <Icon className='w-5 h-5 text-primary' />\n    <h3 className='text-base font-semibold'>Feature</h3>\n  </div>\n  <p className='text-sm text-secondary'>Description</p>\n</div>\n`,
      hero_slop: `\n// ❌ AI SLOP: Eyebrow pill + gradient text + metric row + abstract shape\n<section className='relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400'>\n  <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]' />\n  <span className='inline-block px-3 py-1 rounded-full bg-white/20 text-xs uppercase tracking-widest mb-4'>Introducing</span>\n  <h1 className='text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent'>Build the Future of Work</h1>\n</section>\n`,
      hero_good: `\n// ✅ GOOD: Solid bg, no eyebrow, solid text, clear hierarchy\n<section className='bg-surface border-b border-border'>\n  <div className='max-w-3xl mx-auto px-4 py-16 md:py-24'>\n    <h1 className='text-3xl md:text-4xl font-bold text-primary tracking-tight'>Project management for fast-moving teams</h1>\n    <p className='mt-4 text-lg text-secondary max-w-xl'>Ship features faster with less chaos.</p>\n  </div>\n</section>\n`,
      button_slop: `\n// ❌ AI SLOP: Gradient, bounce, excessive glow, pill shape everywhere\n<button className='bg-gradient-to-r from-purple-500 to-blue-600 rounded-full px-8 py-4 text-white font-bold hover:scale-110 hover:shadow-purple-500/50 shadow-lg transition-all duration-500 animate-pulse'>\n  🚀 Supercharge Your Workflow\n</button>\n`,
      button_good: `\n// ✅ GOOD: Solid color, subtle hover, consistent radius, no emoji, no buzzword\n<button className='bg-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-primary-hover transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'>\n  Start free trial\n</button>\n`,
      section_slop: `\n// ❌ AI SLOP: Repeated kicker + numbered markers + identical cards\n<section>\n  <p className='text-xs uppercase tracking-widest text-purple-500 mb-2'>01 — Features</p>\n  <h2>What You Get</h2>\n  <div className='grid grid-cols-3 gap-6'>\n    {[1,2,3].map(i => (\n      <div className='border-l-4 border-purple-500 rounded-xl p-6'>\n        <div className='rounded-lg bg-purple-50 p-3 w-fit mb-4'><Icon /></div>\n        <h3>Feature {i}</h3>\n        <p>Description</p>\n      </div>\n    ))}\n  </div>\n</section>\n`,
      section_good: `\n// ✅ GOOD: No kicker, no numbers, varied card layout, no accent border\n<section>\n  <h2 className='text-2xl font-bold'>Features</h2>\n  <div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-4'>\n    <div className='bg-surface rounded-lg border border-border p-6 md:row-span-2'>\n      <Icon className='w-5 h-5 text-primary mb-3' />\n      <h3 className='font-semibold'>Feature one</h3>\n      <p className='text-sm text-secondary mt-1'>Detailed description for the primary feature that gets more space.</p>\n    </div>\n    <div className='bg-surface rounded-lg border border-border p-6'>\n      <Icon className='w-5 h-5 text-primary mb-3' />\n      <h3 className='font-semibold'>Feature two</h3>\n      <p className='text-sm text-secondary mt-1'>Brief description.</p>\n    </div>\n  </div>\n</section>\n`
    }
  }
};

/**
 * Selective Taste Skill Filter (Modular Import)
 *
 * - `requestedSkillKey` (if valid) always wins — explicit user/CLI choice.
 * - Otherwise the design text (design.md + designPreference hints) is scored
 *   against SKILL_ROUTING_RULES using word-boundary matching (no false
 *   positives from words like "MOTION_INTENSITY" or "clean architecture").
 * - `fullContent: false` returns an excerpt of the active skill to keep
 *   .moryn/context.md token-efficient (the default skill is ~89 KB).
 */
export function getFilteredTasteSkill(
  designTextOrVibe?: string,
  requestedSkillKey?: string,
  options: TasteSkillFilterOptions = {}
): {
  name: string;
  version: string;
  activeSkillKey: string;
  activeSkillContent: string;
  routerInfo: { selectedReason: string; availableSkills: string[]; fetchOtherSkillInstruction: string };
  tasteSkillDirectives: typeof TASTE_SKILL_DIRECTIVES.tasteSkillDirectives;
  codeSkeletons: typeof TASTE_SKILL_DIRECTIVES.codeSkeletons;
  examples: typeof TASTE_SKILL_DIRECTIVES.examples;
} {
  const allSkills = ALL_TASTE_SKILLS as Record<string, string>;

  let selectedKey: string;
  let selectedReason: string;

  if (requestedSkillKey && allSkills[requestedSkillKey]) {
    selectedKey = requestedSkillKey;
    selectedReason = `Skill explicitly requested: '${requestedSkillKey}'`;
  } else if (designTextOrVibe) {
    const selection = selectSkillKey(designTextOrVibe);
    selectedKey = selection.key;
    selectedReason = `Auto-selected '${selection.key}' — ${selection.reasons.join("; ")}`;
  } else {
    selectedKey = DEFAULT_TASTE_SKILL_KEY;
    selectedReason = `Auto-selected '${DEFAULT_TASTE_SKILL_KEY}' (default; no design text provided)`;
  }

  if (!allSkills[selectedKey]) {
    selectedKey = DEFAULT_TASTE_SKILL_KEY;
  }

  const fullContent = options.fullContent !== false;
  const activeSkillContent = fullContent
    ? allSkills[selectedKey]
    : excerptSkill(allSkills[selectedKey], options.maxLines || CONTEXT_TASTE_SKILL_MAX_LINES);

  return {
    name: "taste-skill-v2",
    version: "2.1.0-selective-modular",
    activeSkillKey: selectedKey,
    activeSkillContent,
    routerInfo: {
      selectedReason,
      availableSkills: Object.keys(allSkills),
      fetchOtherSkillInstruction:
        "To fetch another specific skill on demand, request section=taste-skill&skill=<skillName> (or run: npx moryn project taste-skill --skill <skillName>)"
    },
    tasteSkillDirectives: TASTE_SKILL_DIRECTIVES.tasteSkillDirectives,
    codeSkeletons: TASTE_SKILL_DIRECTIVES.codeSkeletons,
    examples: TASTE_SKILL_DIRECTIVES.examples
  };
}
