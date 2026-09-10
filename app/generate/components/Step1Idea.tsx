import React from "react";

interface Step1IdeaProps {
  appName: string;
  appIdea: string;
  setAppName: (val: string) => void;
  setAppIdea: (val: string) => void;
}

export default function Step1Idea({
  appName,
  appIdea,
  setAppName,
  setAppIdea,
}: Step1IdeaProps) {
  const ideaValid = appIdea.length >= 20;

  return (
    <div>
      {/* Step badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 10px",
          borderRadius: "var(--radius-xs)",
          background: "var(--color-accent-soft)",
          border: "1px solid rgba(232,93,63,0.2)",
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--color-accent)",
          marginBottom: 16,
        }}
      >
        01. Define Project Concept
      </div>

      {/* Title */}
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.6rem",
          fontWeight: 800,
          color: "var(--color-foreground)",
          marginBottom: 6,
          letterSpacing: "-0.02em",
          lineHeight: 1.25,
        }}
      >
        Define Project Concept
      </h2>

      {/* Description */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          color: "var(--color-foreground-muted)",
          marginBottom: 28,
          lineHeight: 1.6,
        }}
      >
        Articulate the core problem and solution. Moryn AI begins parsing your
        app concept, structuring ideas, and setting up your journey with an
        industry-standard blueprint model.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Project Name */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <label
              htmlFor="input-app-name"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: appName
                  ? "var(--color-accent)"
                  : "var(--color-foreground-muted)",
              }}
            >
              PROJECT NAME *
            </label>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: "var(--color-foreground-subtle)",
                letterSpacing: "0.04em",
              }}
            >
              {appName.length} / 60
            </span>
          </div>
          <input
            id="input-app-name"
            type="text"
            placeholder="e.g. TaskFlow, BudgetBuddy, LearnAI..."
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: "var(--radius-md)",
              fontSize: "14px",
              fontFamily: "var(--font-body)",
              outline: "none",
              background: "var(--color-surface-raised)",
              border: `1px solid ${
                appName ? "var(--color-accent)" : "var(--color-border)"
              }`,
              color: "var(--color-foreground)",
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
          />
        </div>

        {/* Problem Statement / Describe Idea */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <label
              htmlFor="input-app-idea"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: ideaValid
                  ? "var(--color-info)"
                  : "var(--color-foreground-muted)",
              }}
            >
              PROBLEM STATEMENT *
            </label>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: ideaValid
                  ? "var(--color-info)"
                  : "var(--color-foreground-subtle)",
                letterSpacing: "0.04em",
              }}
            >
              {appIdea.length} / 500
            </span>
          </div>
          <textarea
            id="input-app-idea"
            rows={5}
            placeholder="e.g. An AI-powered task manager that helps developers prioritize their daily work, track progress across projects, and generate automated standup reports..."
            value={appIdea}
            onChange={(e) => setAppIdea(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: "var(--radius-md)",
              fontSize: "13.5px",
              fontFamily: "var(--font-body)",
              outline: "none",
              resize: "none",
              background: "var(--color-surface-raised)",
              border: `1px solid ${
                ideaValid ? "var(--color-info)" : "var(--color-border)"
              }`,
              color: "var(--color-foreground)",
              lineHeight: 1.65,
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 5,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: ideaValid
                  ? "var(--color-info)"
                  : "var(--color-foreground-subtle)",
                letterSpacing: "0.04em",
              }}
            >
              {ideaValid
                ? "✓ Great description!"
                : `${20 - appIdea.length} more chars needed`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
