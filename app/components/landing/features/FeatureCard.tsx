"use client";

import { useEffect, useRef, useState } from "react";
import { Feature } from "./FeaturesData";

export function FeatureCard({ f, index }: { f: Feature; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isSignal = f.accent === "var(--color-signal)";

  return (
    <div
      ref={ref}
      className={`feat-card feat-card--${f.size} ${visible ? "feat-card--visible" : ""}`}
      style={{ "--feat-delay": `${index * 60}ms`, "--feat-accent": f.accent } as React.CSSProperties}
    >
      {/* Top annotation row */}
      <div className="feat-top-row">
        <span className="feat-label">{f.label}</span>
        {f.tag && <span className="feat-tag">{f.tag}</span>}
      </div>

      {/* Icon */}
      <div className="feat-icon-wrap" aria-hidden="true">{f.icon}</div>

      {/* Body */}
      <div className="feat-body">
        <h3 className="feat-title">{f.title}</h3>
        <p className="feat-desc">{f.desc}</p>
      </div>

      {/* Stat */}
      <div className="feat-stat-badge">
        <span className="feat-stat-num">{f.stat}</span>
        <span className="feat-stat-label">{f.statLabel}</span>
      </div>

      {/* Bottom accent rule */}
      <div className="feat-accent-rule" />
    </div>
  );
}
