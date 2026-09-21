"use client";

import React, { useState } from "react";

export interface ConfigFormProps {
  title?: string;
  onSubmit?: (data: Record<string, string>) => void;
}

/**
 * ConfigForm - Accessible Input Form (Anti-Slop Compliant)
 */
export function ConfigForm({
  title = "Project Configuration",
  onSubmit,
}: ConfigFormProps) {
  const [formData, setFormData] = useState({ appName: "Moryn Engine", environment: "production" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto bg-[#121318] border border-[#222634] p-6 rounded-md space-y-4 font-sans text-left">
      <h3 className="text-lg font-bold tracking-tight text-[#F3F4F6]">{title}</h3>

      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
          Application Name
        </label>
        <input
          type="text"
          value={formData.appName}
          onChange={(e) => setFormData({ ...formData, appName: e.currentTarget.value })}
          placeholder="e.g. Moryn Engine"
          className="w-full px-3 py-2 bg-[#090A0C] border border-[#222634] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#6366F1] transition-colors"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
          Target Environment
        </label>
        <select
          value={formData.environment}
          onChange={(e) => setFormData({ ...formData, environment: e.currentTarget.value })}
          className="w-full px-3 py-2 bg-[#090A0C] border border-[#222634] rounded-md text-xs text-[#F3F4F6] focus:outline-none focus:border-[#6366F1] transition-colors"
        >
          <option value="production">Production Edge</option>
          <option value="staging">Staging Sandbox</option>
          <option value="development">Local Development</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium text-xs rounded-md transition-all"
      >
        Save Configuration
      </button>
    </form>
  );
}

export default ConfigForm;
