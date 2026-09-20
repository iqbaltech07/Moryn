import { BaseEdge, getBezierPath, Position, type EdgeProps } from "@xyflow/react";

export function ColoredEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
  style,
  markerEnd,
}: EdgeProps) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
    curvature: 0.5,
  });

  return (
    <BaseEdge
      id={id}
      path={path}
      style={{
        strokeLinecap: "round",
        strokeLinejoin: "round",
        transition: "stroke 0.3s ease, opacity 0.3s ease",
        ...style,
      }}
      markerEnd={markerEnd}
    />
  );
}
