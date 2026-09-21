import { SAAS_WEBAPP_DESIGN_MD, LANDING_PAGE_DESIGN_MD } from "@/lib/design/designTemplatesContent";

export interface DesignTemplateMetadata {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  badge: string;
  filename: string;
  theme: string;
  primary: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  rawMarkdown: string;
  tags: string[];
  features: string[];
  recommendedFor: string[];
}

export const DESIGN_TEMPLATES_METADATA: DesignTemplateMetadata[] = [
  {
    id: "saas-webapp",
    name: "SaaS Web App",
    subtitle: "Full Product App Shell",
    category: "Full-Stack SaaS / Dashboard",
    badge: "Recommended for Web Apps",
    filename: "saas-webapp-design.md",
    theme: "Dark Obsidian & Cobalt",
    primary: "#4F6BFF",
    bg: "#0B0C0E",
    surface: "#131417",
    border: "rgba(255, 255, 255, 0.10)",
    text: "#F5F5F4",
    muted: "#A1A1AA",
    rawMarkdown: SAAS_WEBAPP_DESIGN_MD,
    tags: ["App Shell", "TanStack Table", "cmdk (⌘K)", "Radix UI", "Framer Motion", "Obsidian Theme"],
    features: [
      "Persistent left sidebar (260px / 64px) with Radix Tooltip & mobile sheet dialog",
      "TanStack Data Table with sticky header, sorting, row hover & kebab action menu",
      "Global ⌘K Command Palette (cmdk) with category groupings and keyboard navigation",
      "Radix Toast notifications, slide-over detail panels, & skeleton shimmer loading",
      "Strict app density spacing (--space-app-1 to 8), --color-sidebar-bg, WCAG AA contrast",
      "Companion marketing landing page design tokens included for seamless brand continuity",
    ],
    recommendedFor: ["Next.js", "React", "Vue.js", "Svelte", "Next.js (API Routes)", "Python (FastAPI/Django)", "Node.js"],
  },
  {
    id: "landing-page",
    name: "Landing Page",
    subtitle: "High-Converting Spec",
    category: "Marketing / Landing Page",
    badge: "High-Converting",
    filename: "landing-page-design.md",
    theme: "Linear & Stripe Spec",
    primary: "#4F6BFF",
    bg: "#0B0C0E",
    surface: "#1B1D21",
    border: "rgba(255, 255, 255, 0.10)",
    text: "#F5F5F4",
    muted: "#A1A1AA",
    rawMarkdown: LANDING_PAGE_DESIGN_MD,
    tags: ["Hero Visual Mockup", "Asymmetric Bento Grid", "Logo Cloud", "Radix Accordion", "Motion Tokens", "Zero-Slop"],
    features: [
      "Linear, Vercel & Stripe design standard with considered restraint and zero-slop copy rules",
      "Real product screenshot in browser-chrome frame with load choreography stagger",
      "Asymmetric Bento Grid (span-4 / span-2) with inline mini-visuals and micro-interactions",
      "Logo cloud, masonry testimonials, and animated stats band count-up on scroll",
      "Radix Accordion FAQ, Framer Motion sliding tab indicator, and Radix Switch toggle",
      "Complete dark/light mode token system, 8pt spacing system, and motion easing tokens",
    ],
    recommendedFor: ["Next.js", "React", "HTML5 / Vanilla JS", "Astro", "None (Client-Side Only)"],
  },
];
