import React from "react";
import { ConnectionLineComponentProps, getBezierPath } from "@xyflow/react";

export default function FloatingConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  connectionStatus,
}: ConnectionLineComponentProps) {
  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
  });

  // Grey when pending/invalid, blue when ready to connect
  const strokeColor = connectionStatus === "valid" ? "#3b82f6" : "#6b7280"; // blue vs grey
  const fillColor = connectionStatus === "valid" ? "#3b82f6" : "#6b7280"; // blue vs grey

  return (
    <g>
      <path
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeDasharray="4 4"
        strokeLinecap="round"
        d={edgePath}
      />
      <circle cx={toX} cy={toY} fill={fillColor} r={4} />
    </g>
  );
}
