"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar, Footer } from "../components/layout";
import { RELEASES, type Category, type ReleaseItem } from "@/lib/utils/changelogData";
import { useTranslation } from "@/lib/i18n";

const TYPE_LABEL: Record<ReleaseItem["type"], string> = {
  feat: "New",
  improvement: "Improved",
  fix: "Fixed",
};

const TYPE_COLOR: Record<ReleaseItem["type"], string> = {
  feat: "text-[#e85d3f]",
  improvement: "text-[#0d9488]",
  fix: "text-[#8b6914]",
};

const FILTERS: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "feat", label: "New" },
  { id: "improvement", label: "Improved" },
  { id: "fix", label: "Fixed" },
];

export default function ChangelogPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const { t } = useTranslation();

  const filteredReleases = RELEASES.map((release) => ({
    ...release,
    highlights: release.highlights.filter((item) =>
      activeCategory === "all" ? true : item.type === activeCategory
    ),
  })).filter((release) => release.highlights.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf8] text-[#141817]">
      <Navbar />

      <main className="flex-1 w-full max-w-[760px] mx-auto px-6 pt-32 pb-24">

        {/* ── Page Header ── */}
        <div className="mb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#737b78] hover:text-[#141817] transition-colors mb-8 group"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="group-hover:-translate-x-0.5 transition-transform">
              <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </Link>

          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <h1 className="text-[32px] md:text-[38px] font-bold tracking-[-0.025em] text-[#141817] leading-tight">
              Changelog
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-[#737b78] font-medium">
                {RELEASES[0].version} · Latest
              </span>
            </div>
          </div>

          <p className="text-[15px] text-[#737b78] leading-relaxed mt-3 max-w-[520px]">
            {t.changelog.description}
          </p>

          {/* Filter tabs — underline style, no pills */}
          <div className="flex items-center gap-1 mt-8 border-b border-[#141817]/8 pb-0">
            {FILTERS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-[1.5px] -mb-px transition-colors ${
                  activeCategory === tab.id
                    ? "border-[#141817] text-[#141817]"
                    : "border-transparent text-[#737b78] hover:text-[#141817]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Release Timeline ── */}
        <div className="space-y-0">
          {filteredReleases.map((release, releaseIdx) => (
            <article
              key={release.version}
              className={releaseIdx > 0 ? "pt-16 border-t border-[#141817]/6" : ""}
            >
              {/* Release meta */}
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <span className="text-[13px] font-mono font-semibold text-[#141817]">
                  {release.version}
                </span>
                <span className="text-[12px] text-[#9aa09d]">{release.date}</span>
                {releaseIdx === 0 && (
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                    Latest
                  </span>
                )}
              </div>

              {/* Release title */}
              <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-[#141817] leading-snug mb-3">
                {release.title}
              </h2>

              {/* Summary */}
              <p className="text-[14px] text-[#737b78] leading-relaxed mb-8 max-w-[600px]">
                {release.summary}
              </p>

              {/* Code snippet — minimal terminal */}
              {release.codeSnippet && (
                <div className="mb-8 rounded-xl bg-[#141817] overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]/60" />
                    </div>
                    <span className="font-mono text-[11px] text-white/25 ml-1.5">
                      Terminal
                    </span>
                  </div>
                  <pre className="px-5 py-4 font-mono text-[13px] text-[#c8c4bc] leading-relaxed overflow-x-auto">
                    <code>{release.codeSnippet.code}</code>
                  </pre>
                </div>
              )}

              {/* Highlight items — two-column label + content, no cards */}
              <div className="divide-y divide-[#141817]/5">
                {release.highlights.map((item, idx) => (
                  <div key={idx} className="py-4 flex items-start gap-4 first:pt-0 last:pb-0">
                    {/* Fixed-width type label */}
                    <span className={`text-[11px] font-semibold uppercase tracking-wide shrink-0 mt-[3px] w-[60px] ${TYPE_COLOR[item.type]}`}>
                      {TYPE_LABEL[item.type]}
                    </span>
                    {/* Content */}
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-[#141817] leading-snug mb-1">
                        {item.title}
                      </p>
                      <p className="text-[13px] text-[#737b78] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* ── Footer note ── */}
        <div className="mt-20 pt-8 border-t border-[#141817]/8">
          <p className="text-[13px] text-[#737b78]">
            Showing {filteredReleases.length} releases ·{" "}
            <Link href="/" className="text-[#141817] hover:underline underline-offset-2 decoration-[#141817]/30">
              Back to Moryn
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

