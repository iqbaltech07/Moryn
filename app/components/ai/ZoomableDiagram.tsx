"use client";

import React, { useState, useCallback } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ZoomableDiagramProps {
  svgHtml: string;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  /** Tailwind classes for the outer wrapper */
  wrapperClassName?: string;
  /** Tailwind classes for the inner SVG container */
  contentClassName?: string;
  /** Style for TransformComponent wrapper */
  wrapperStyle?: React.CSSProperties;
  minScale?: number;
  maxScale?: number;
}

export default function ZoomableDiagram({
  svgHtml,
  containerRef,
  wrapperClassName = "relative w-full",
  contentClassName = "w-full flex justify-center p-6 cursor-grab active:cursor-grabbing [&>svg]:max-w-full [&>svg]:h-auto",
  wrapperStyle,
  minScale = 0.2,
  maxScale = 6,
}: ZoomableDiagramProps) {
  const [scale, setScale] = useState(1);

  const handleTransformed = useCallback(
    (_ref: any, newState: { scale: number }) => {
      setScale(newState.scale);
    },
    []
  );

  return (
    <TransformWrapper
      centerOnInit={true}
      initialScale={1}
      minScale={minScale}
      maxScale={maxScale}
      wheel={{ disabled: true }}
      pinch={{ disabled: false }}
      doubleClick={{ disabled: false }}
      onTransform={handleTransformed}
    >
      {({ zoomIn, zoomOut, resetTransform }) => (
        <div className={wrapperClassName} data-mermaid-viewer>
          {/* Floating Zoom Controls */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-[#121318]/90 border border-slate-800 rounded-lg px-2 py-1 shadow-lg backdrop-blur-md opacity-80 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-mono text-slate-400 font-medium mr-1 select-none">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => zoomIn()}
              className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => zoomOut()}
              className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => { resetTransform(); }}
              className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <TransformComponent
            wrapperClass="!w-full !h-auto"
            wrapperStyle={wrapperStyle}
          >
            <div
              ref={containerRef}
              dangerouslySetInnerHTML={{ __html: svgHtml }}
              className={contentClassName}
              style={{ color: "#ffffff" }}
            />
          </TransformComponent>
        </div>
      )}
    </TransformWrapper>
  );
}
