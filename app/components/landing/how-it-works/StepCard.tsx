"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { StepType } from "./HowItWorksData";

export function StepCard({ step, index }: { step: StepType; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isEven = index % 2 === 1;

  return (
    <div
      ref={ref}
      className={`hiw-step ${visible ? "hiw-step--visible" : ""} ${isEven ? "hiw-step--flip" : ""}`}
      style={{
        "--hiw-accent": step.accentVar,
        "--hiw-delay": `${index * 100}ms`,
      } as React.CSSProperties}
    >
      {/* Large background number */}
      <div className="hiw-step-num" aria-hidden="true">{step.number}</div>

      {/* Card */}
      <div className="hiw-card">
        {/* Step header */}
        <div className="hiw-card-header">
          <div className="hiw-card-icon" aria-hidden="true">{step.icon}</div>
          <div className="hiw-card-meta">
            <span className="hiw-card-badge">{step.number}</span>
            <span className="hiw-card-detail">{step.detail}</span>
          </div>
        </div>

        <h3 className="hiw-card-title">{step.title}</h3>
        <p className="hiw-card-desc">{step.desc}</p>

        {/* Inline mockup visuals */}
        {step.chips && (
          <div className="hiw-mockup hiw-mockup--chips">
            {step.chips.map((t) => (
              <span key={t} className="hiw-chip">{t}</span>
            ))}
          </div>
        )}

        {step.progress !== undefined && (
          <div className="hiw-mockup hiw-mockup--progress" aria-label={`Step ${step.progress} of 7 complete`}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div
                key={n}
                className={`hiw-progress-dot ${n <= step.progress! ? "hiw-progress-dot--done" : ""}`}
              >
                {n <= step.progress! ? (
                  <Check size={9} strokeWidth={3} />
                ) : n}
              </div>
            ))}
          </div>
        )}

        {/* Bottom accent rule */}
        <div className="hiw-card-line" aria-hidden="true" />
      </div>

      {/* Timeline connector dot */}
      <div className="hiw-connector-dot" aria-hidden="true" />
    </div>
  );
}
