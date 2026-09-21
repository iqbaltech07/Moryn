// ─── Gamification System ───────────────────────────────────────────────────
// All EXP logic is server-side to prevent manipulation.
// Rank thresholds are keyed to Lucide icon names (no emoji).

export interface Rank {
  id: number;
  name: string;
  icon: string;          // Lucide icon component name
  minExp: number;
  color: string;         // gradient / solid color for badge
  textColor: string;
  description: string;
}

export const RANKS: Rank[] = [
  {
    id: 1,
    name: "Idea Sprout",
    icon: "Sprout",
    minExp: 0,
    color: "linear-gradient(135deg, #4ade80, #22c55e)",
    textColor: "#052e16",
    description: "Just starting the journey of building products.",
  },
  {
    id: 2,
    name: "Blueprint Maker",
    icon: "Compass",
    minExp: 100,
    color: "linear-gradient(135deg, #67e8f9, #06b6d4)",
    textColor: "#083344",
    description: "Beginning to lay the foundation for big ideas.",
  },
  {
    id: 3,
    name: "Spec Writer",
    icon: "PenLine",
    minExp: 300,
    color: "linear-gradient(135deg, #93c5fd, #3b82f6)",
    textColor: "#1e3a5f",
    description: "Proficient in writing clear and structured specifications.",
  },
  {
    id: 4,
    name: "Feature Planner",
    icon: "LayoutList",
    minExp: 600,
    color: "linear-gradient(135deg, #a78bfa, #7c3aed)",
    textColor: "#ede9fe",
    description: "Understands how to break down a vision into tangible features.",
  },
  {
    id: 5,
    name: "Product Thinker",
    icon: "Lightbulb",
    minExp: 1000,
    color: "linear-gradient(135deg, #f0abfc, #c026d3)",
    textColor: "#fdf4ff",
    description: "Thinks like a true product manager.",
  },
  {
    id: 6,
    name: "Roadmap Architect",
    icon: "Map",
    minExp: 1600,
    color: "linear-gradient(135deg, #fb923c, #ea580c)",
    textColor: "#fff7ed",
    description: "Builds complex roadmaps with ease.",
  },
  {
    id: 7,
    name: "Sprint Master",
    icon: "Timer",
    minExp: 2500,
    color: "linear-gradient(135deg, #fbbf24, #d97706)",
    textColor: "#451a03",
    description: "Masters speed and precision in product delivery.",
  },
  {
    id: 8,
    name: "Tech Strategist",
    icon: "Telescope",
    minExp: 4000,
    color: "linear-gradient(135deg, #f87171, #dc2626)",
    textColor: "#fef2f2",
    description: "Sees the future of technology and plans strategically.",
  },
  {
    id: 9,
    name: "PRD Champion",
    icon: "Trophy",
    minExp: 6000,
    color: "linear-gradient(135deg, #fde68a, #f59e0b)",
    textColor: "#422006",
    description: "A legend in the world of Product Requirement Documents.",
  },
  {
    id: 10,
    name: "Legendary Builder",
    icon: "Wrench",
    minExp: 10000,
    color: "linear-gradient(135deg, #c084fc, #818cf8, #38bdf8)",
    textColor: "#f8fafc",
    description: "The absolute pinnacle — a true builder who has surpassed it all.",
  },
];

/** EXP awarded per completed project. Fixed server-side, not client-controlled. */
export const EXP_PER_PROJECT = 100;

/** Returns the current rank for a given EXP value. */
export function getRank(exp: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (exp >= RANKS[i].minExp) return RANKS[i];
  }
  return RANKS[0];
}

/** Returns the next rank, or null if already at max rank. */
export function getNextRank(exp: number): Rank | null {
  const current = getRank(exp);
  const nextRank = RANKS.find((r) => r.id === current.id + 1);
  return nextRank ?? null;
}

/** Returns progress (0–100) towards the next rank. */
export function getRankProgress(exp: number): number {
  const current = getRank(exp);
  const next = getNextRank(exp);
  if (!next) return 100;
  const range = next.minExp - current.minExp;
  const gained = exp - current.minExp;
  return Math.min(Math.round((gained / range) * 100), 100);
}

/** Returns EXP remaining to reach the next rank. */
export function getExpToNextRank(exp: number): number {
  const next = getNextRank(exp);
  if (!next) return 0;
  return next.minExp - exp;
}
