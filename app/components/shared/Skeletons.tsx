"use client";

import React from "react";

/**
 * Reusable Atomic Skeleton Box
 */
export function Skeleton({
  width = "100%",
  height = "16px",
  borderRadius = "var(--radius-md)",
  style,
  className = "",
}: {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

/**
 * Topbar Shell Skeleton
 */
export function TopbarSkeleton() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        height: 52,
        flexShrink: 0,
        borderBottom: "1px solid var(--border-hairline)",
        background: "rgba(252, 251, 248, 0.92)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Skeleton width={32} height={32} borderRadius="var(--radius-md)" />
        <Skeleton width={140} height={18} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Skeleton width={80} height={28} />
        <Skeleton width={80} height={28} />
        <Skeleton width={80} height={28} />
        <Skeleton width={80} height={28} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Skeleton width={70} height={28} />
        <Skeleton width={120} height={28} />
      </div>
    </header>
  );
}

/**
 * Structure (Mindmap Tree) Skeleton Page
 */
export function StructureSkeleton() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--color-background)" }}>
      <TopbarSkeleton />
      <div
        className="bg-grid"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          padding: 40,
          position: "relative",
        }}
      >
        {/* Root Node Skeleton */}
        <Skeleton width={260} height={70} borderRadius="var(--radius-lg)" />

        {/* Category Nodes Skeleton */}
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Skeleton width={180} height={52} borderRadius="var(--radius-md)" />
            <Skeleton width={150} height={38} borderRadius="var(--radius-sm)" />
            <Skeleton width={150} height={38} borderRadius="var(--radius-sm)" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Skeleton width={180} height={52} borderRadius="var(--radius-md)" />
            <Skeleton width={150} height={38} borderRadius="var(--radius-sm)" />
            <Skeleton width={150} height={38} borderRadius="var(--radius-sm)" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Skeleton width={180} height={52} borderRadius="var(--radius-md)" />
            <Skeleton width={150} height={38} borderRadius="var(--radius-sm)" />
            <Skeleton width={150} height={38} borderRadius="var(--radius-sm)" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PRD Preview & AI Chat Skeleton Page
 */
export function PrdPreviewSkeleton() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--color-background)" }}>
      <TopbarSkeleton />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* TOC Sidebar */}
        <aside style={{ width: 220, borderRight: "1px solid var(--border-hairline)", background: "var(--bg-surface)", padding: 20 }}>
          <Skeleton width={100} height={12} style={{ marginBottom: 20 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Skeleton width="90%" height={14} />
            <Skeleton width="75%" height={14} />
            <Skeleton width="85%" height={14} />
            <Skeleton width="80%" height={14} />
            <Skeleton width="70%" height={14} />
            <Skeleton width="85%" height={14} />
            <Skeleton width="65%" height={14} />
          </div>
        </aside>

        {/* Main Document Content */}
        <main style={{ flex: 1, padding: "36px 48px", overflowY: "auto" }}>
          <div style={{ maxWidth: 840, margin: "0 auto" }}>
            <Skeleton width={180} height={14} style={{ marginBottom: 12 }} />
            <Skeleton width={420} height={36} style={{ marginBottom: 28 }} />
            <Skeleton width="100%" height={18} style={{ marginBottom: 10 }} />
            <Skeleton width="95%" height={18} style={{ marginBottom: 10 }} />
            <Skeleton width="90%" height={18} style={{ marginBottom: 28 }} />

            <Skeleton width={260} height={24} style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height={100} borderRadius="var(--radius-md)" style={{ marginBottom: 28 }} />

            <Skeleton width={300} height={24} style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height={120} borderRadius="var(--radius-md)" style={{ marginBottom: 28 }} />
          </div>
        </main>

        {/* AI Chat Sidebar */}
        <aside style={{ width: 340, borderLeft: "1px solid var(--border-hairline)", background: "var(--bg-surface)", padding: 20 }}>
          <Skeleton width={140} height={16} style={{ marginBottom: 20 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Skeleton width="85%" height={45} borderRadius="var(--radius-md)" />
            <Skeleton width="70%" height={55} borderRadius="var(--radius-md)" style={{ alignSelf: "flex-end" }} />
            <Skeleton width="90%" height={65} borderRadius="var(--radius-md)" />
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Project Detail & Design System Skeleton Page
 */
export function ProjectDetailSkeleton() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-background)" }}>
      <TopbarSkeleton />
      <main style={{ maxWidth: 1200, margin: "0 auto", width: "100%", padding: "32px 24px" }}>
        {/* Header card skeleton */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-hairline)",
            borderRadius: "var(--radius-lg)",
            padding: 32,
            marginBottom: 28,
          }}
        >
          <Skeleton width={120} height={12} style={{ marginBottom: 12 }} />
          <Skeleton width={320} height={32} style={{ marginBottom: 12 }} />
          <Skeleton width="80%" height={18} style={{ marginBottom: 20 }} />
          <div style={{ display: "flex", gap: 12 }}>
            <Skeleton width={100} height={28} />
            <Skeleton width={100} height={28} />
            <Skeleton width={100} height={28} />
          </div>
        </div>

        {/* Color Tokens & Design Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
          <div style={{ background: "var(--bg-surface)", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-hairline)" }}>
            <Skeleton width={180} height={20} style={{ marginBottom: 16 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Skeleton width="100%" height={36} />
              <Skeleton width="100%" height={36} />
              <Skeleton width="100%" height={36} />
            </div>
          </div>
          <div style={{ background: "var(--bg-surface)", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-hairline)" }}>
            <Skeleton width={180} height={20} style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height={120} borderRadius="var(--radius-md)" />
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Kanban Tasks Skeleton Page
 */
export function TaskKanbanSkeleton() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--color-background)" }}>
      <TopbarSkeleton />
      {/* Phase Tabs */}
      <div style={{ display: "flex", gap: 12, padding: "12px 24px", borderBottom: "1px solid var(--border-hairline)", background: "var(--bg-surface)" }}>
        <Skeleton width={120} height={32} />
        <Skeleton width={120} height={32} />
        <Skeleton width={120} height={32} />
        <Skeleton width={120} height={32} />
      </div>

      {/* 3 Column Kanban Board */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, padding: 24, overflow: "hidden" }}>
        {[1, 2, 3].map((col) => (
          <div
            key={col}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--radius-lg)",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <Skeleton width={90} height={18} />
              <Skeleton width={30} height={18} />
            </div>
            <Skeleton width="100%" height={74} borderRadius="var(--radius-md)" />
            <Skeleton width="100%" height={74} borderRadius="var(--radius-md)" />
            <Skeleton width="100%" height={74} borderRadius="var(--radius-md)" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * User Profile Skeleton Page
 */
export function UserProfileSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background)", color: "var(--fg-primary)" }}>
      {/* Navbar Skeleton */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: 60,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border-hairline)",
          background: "rgba(16, 24, 43, 0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Skeleton width={32} height={32} borderRadius="var(--radius-md)" />
          <Skeleton width={110} height={20} />
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <Skeleton width={70} height={16} />
          <Skeleton width={70} height={16} />
          <Skeleton width={70} height={16} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Skeleton width={90} height={34} borderRadius="var(--radius-md)" />
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "88px 24px 80px" }}>
        {/* Profile header card */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-hairline)",
            borderRadius: "var(--radius-lg)",
            padding: "28px 32px",
            display: "flex",
            alignItems: "flex-start",
            gap: 28,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <Skeleton width={80} height={80} borderRadius="var(--radius-lg)" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Skeleton width={180} height={28} />
              <Skeleton width={60} height={20} borderRadius="var(--radius-xs)" />
            </div>
            <Skeleton width={220} height={14} style={{ marginBottom: 12 }} />
            <Skeleton width={140} height={12} />
          </div>
          <div style={{ background: "var(--bg-elevated)", padding: "18px 22px", borderRadius: "var(--radius-lg)", width: 240 }}>
            <Skeleton width={90} height={12} style={{ marginBottom: 14 }} />
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <Skeleton width={40} height={40} borderRadius="var(--radius-md)" />
              <div>
                <Skeleton width={100} height={18} style={{ marginBottom: 4 }} />
                <Skeleton width={60} height={12} />
              </div>
            </div>
            <Skeleton width="100%" height={6} borderRadius={3} />
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)", padding: 20, borderRadius: "var(--radius-lg)" }}>
              <Skeleton width={90} height={12} style={{ marginBottom: 10 }} />
              <Skeleton width={120} height={28} />
            </div>
          ))}
        </div>

        {/* Project Cards Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Skeleton width={160} height={24} />
            <Skeleton width={120} height={32} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)", padding: 24, borderRadius: "var(--radius-lg)" }}>
                <Skeleton width={180} height={22} style={{ marginBottom: 10 }} />
                <Skeleton width="100%" height={14} style={{ marginBottom: 6 }} />
                <Skeleton width="70%" height={14} style={{ marginBottom: 18 }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Skeleton width={80} height={20} />
                  <Skeleton width={90} height={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Dashboard Top Header Skeleton
 */
export function DashboardHeaderSkeleton() {
  return (
    <header className="h-16 border-b border-transparent flex items-center justify-between px-6 lg:px-14">
      <div className="flex items-center gap-3">
        <div className="lg:hidden w-9 h-9 rounded-lg skeleton-shimmer" />
      </div>
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        <div className="w-9 h-9 rounded-xl skeleton-shimmer" />
        <div className="ml-1 h-9 w-28 rounded-lg skeleton-shimmer" />
      </div>
    </header>
  );
}

/**
 * Dashboard Overview Tab Skeleton Page
 */
export function DashboardOverviewSkeleton() {
  return (
    <div className="animate-in fade-in duration-200">
      {/* Greeting Skeleton */}
      <div className="mb-8">
        <div className="h-9 w-64 max-w-full rounded-xl skeleton-shimmer mb-2.5" />
        <div className="h-4 w-96 max-w-full rounded-md skeleton-shimmer" />
      </div>

      {/* Hero Card Skeleton */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-8 mb-10 shadow-xs">
        <div className="h-6 w-36 rounded-full skeleton-shimmer mb-3.5" />
        <div className="h-8 w-72 max-w-full rounded-xl skeleton-shimmer mb-3" />
        <div className="space-y-2 mb-6 max-w-lg">
          <div className="h-4 w-full rounded-md skeleton-shimmer" />
          <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
        </div>
        <div className="h-10 w-44 rounded-xl skeleton-shimmer" />
      </div>

      {/* All Projects Section Skeleton */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <div className="h-3.5 w-28 rounded-md skeleton-shimmer" />
          <div className="h-3.5 w-16 rounded-md skeleton-shimmer" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-neutral-200/70 p-6 flex flex-col justify-between h-56 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 w-16 rounded-md skeleton-shimmer" />
                  <div className="w-5 h-5 rounded-md skeleton-shimmer" />
                </div>
                <div className="h-5 w-36 rounded-md skeleton-shimmer mb-2.5" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-full rounded-md skeleton-shimmer" />
                  <div className="h-3.5 w-4/5 rounded-md skeleton-shimmer" />
                </div>
              </div>
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <div className="h-3.5 w-24 rounded-md skeleton-shimmer" />
                <div className="h-8 w-28 rounded-lg skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * Dashboard Projects Tab Skeleton Page
 */
export function DashboardProjectsSkeleton() {
  return (
    <div className="animate-in fade-in duration-200">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="h-9 w-44 max-w-full rounded-xl skeleton-shimmer mb-2.5" />
          <div className="h-4 w-80 max-w-full rounded-md skeleton-shimmer" />
        </div>
        <div className="h-10 w-36 rounded-xl skeleton-shimmer shrink-0" />
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="h-11 flex-1 rounded-xl skeleton-shimmer" />
        <div className="h-11 w-64 rounded-xl skeleton-shimmer shrink-0" />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-neutral-200/80 p-6 flex flex-col justify-between h-56 shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-20 rounded-full skeleton-shimmer" />
                <div className="w-8 h-8 rounded-lg skeleton-shimmer" />
              </div>
              <div className="h-5 w-40 rounded-md skeleton-shimmer mb-2.5" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-full rounded-md skeleton-shimmer" />
                <div className="h-3.5 w-2/3 rounded-md skeleton-shimmer" />
              </div>
            </div>
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <div className="h-4 w-28 rounded-md skeleton-shimmer" />
              <div className="h-8 w-28 rounded-lg skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Dashboard Settings Tab Skeleton Page
 */
export function DashboardSettingsSkeleton() {
  return (
    <div className="animate-in fade-in duration-200">
      {/* Header */}
      <div className="mb-8">
        <div className="h-9 w-40 max-w-full rounded-xl skeleton-shimmer mb-2.5" />
        <div className="h-4 w-96 max-w-full rounded-md skeleton-shimmer" />
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 mb-8 border-b border-neutral-200/60 pb-3 overflow-x-auto">
        <div className="h-9 w-36 rounded-xl skeleton-shimmer shrink-0" />
        <div className="h-9 w-44 rounded-xl skeleton-shimmer shrink-0" />
        <div className="h-9 w-36 rounded-xl skeleton-shimmer shrink-0" />
        <div className="h-9 w-32 rounded-xl skeleton-shimmer shrink-0" />
      </div>

      {/* Card Content Skeleton */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs">
        <div className="h-6 w-48 rounded-md skeleton-shimmer mb-2" />
        <div className="h-4 w-96 max-w-full rounded-md skeleton-shimmer mb-6" />

        <div className="space-y-4 max-w-2xl">
          <div className="h-12 w-full rounded-xl skeleton-shimmer" />
          <div className="flex gap-3">
            <div className="h-10 w-32 rounded-xl skeleton-shimmer" />
            <div className="h-10 w-28 rounded-xl skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}


