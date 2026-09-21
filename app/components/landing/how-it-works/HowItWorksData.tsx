import React from "react";
import { MessageSquare, Layers, ClipboardList, Cpu } from "lucide-react";

export const STEPS = [
  {
    number: "01",
    title: "Describe Product Concept",
    desc: "Input your raw app idea and target scope to kick off the synthesis process.",
    detail: "No lengthy briefs required.",
    accentVar: "var(--color-signal)",
    icon: <MessageSquare size={20} strokeWidth={1.5} />,
  },
  {
    number: "02",
    title: "Configure Tech Stack",
    desc: "Select your preferred frontend, backend, database, and deployment layers, or accept AI-recommended defaults.",
    detail: "4 architectural categories.",
    accentVar: "var(--color-circuit)",
    icon: <Layers size={20} strokeWidth={1.5} />,
    chips: ["React", "Node.js", "PostgreSQL", "Vercel"],
  },
  {
    number: "03",
    title: "Answer 7 Precision Prompts",
    desc: "Targeted prompts lock in user personas, core features, monetization, and success metrics to eliminate AI drift.",
    detail: "Zero AI hallucination.",
    accentVar: "var(--color-circuit)",
    icon: <ClipboardList size={20} strokeWidth={1.5} />,
    progress: 3,
  },
  {
    number: "04",
    title: "Provision AI Skill & Sync",
    desc: "Run 'npx moryn init' in your workspace. Provisions the Agent Skill and syncs Kanban tasks live as your AI Agent codes.",
    detail: "10ms native realtime sync.",
    accentVar: "var(--color-signal)",
    icon: <Cpu size={20} strokeWidth={1.5} />,
  },
];

export type StepType = (typeof STEPS)[number];
