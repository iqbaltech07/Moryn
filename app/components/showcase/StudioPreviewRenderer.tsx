import React from "react";
import { HeroSection } from "@/packages/cli/src/templates/hero";
import { BentoGrid } from "@/packages/cli/src/templates/bento";
import { MetricCards } from "@/packages/cli/src/templates/card";
import { DataTable } from "@/packages/cli/src/templates/table";
import { ConfigForm } from "@/packages/cli/src/templates/form";
import { ConfirmModal } from "@/packages/cli/src/templates/modal";

export interface StudioPreviewRendererProps {
  componentId: string;
}

export function StudioPreviewRenderer({ componentId }: StudioPreviewRendererProps) {
  switch (componentId) {
    case "hero":
      return <HeroSection />;
    case "bento":
      return <BentoGrid />;
    case "card":
      return <MetricCards />;
    case "table":
      return <DataTable />;
    case "form":
      return <ConfigForm />;
    case "modal":
      return <ConfirmModal />;
    default:
      return (
        <div className="p-8 text-center text-slate-400 font-mono text-xs">
          Interactive preview loading…
        </div>
      );
  }
}
