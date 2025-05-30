import React from "react";
import {
  useNodes,
  getBezierPath,
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
} from "@xyflow/react";
import { getEdgeParams } from "./utils";

// Type for JSON Logic variables
interface JsonLogicVar {
  var: string;
}

// Function to render JSON logic in a more readable format
function renderJsonLogic(condition: string): string {
  try {
    const parsed = JSON.parse(condition);

    // Handle common JSON logic operators
    if (typeof parsed === "object" && parsed !== null) {
      const keys = Object.keys(parsed);
      if (keys.length === 1) {
        const operator = keys[0];
        const value = parsed[operator];

        switch (operator) {
          case "==":
            if (Array.isArray(value) && value.length === 2) {
              return `${formatValue(value[0])} = ${formatValue(value[1])}`;
            }
            break;
          case "!=":
            if (Array.isArray(value) && value.length === 2) {
              return `${formatValue(value[0])} ≠ ${formatValue(value[1])}`;
            }
            break;
          case ">":
            if (Array.isArray(value) && value.length === 2) {
              return `${formatValue(value[0])} > ${formatValue(value[1])}`;
            }
            break;
          case "<":
            if (Array.isArray(value) && value.length === 2) {
              return `${formatValue(value[0])} < ${formatValue(value[1])}`;
            }
            break;
          case ">=":
            if (Array.isArray(value) && value.length === 2) {
              return `${formatValue(value[0])} ≥ ${formatValue(value[1])}`;
            }
            break;
          case "<=":
            if (Array.isArray(value) && value.length === 2) {
              return `${formatValue(value[0])} ≤ ${formatValue(value[1])}`;
            }
            break;
          case "and":
            if (Array.isArray(value)) {
              return value
                .map((v) => `(${renderJsonLogic(JSON.stringify(v))})`)
                .join(" AND ");
            }
            break;
          case "or":
            if (Array.isArray(value)) {
              return value
                .map((v) => `(${renderJsonLogic(JSON.stringify(v))})`)
                .join(" OR ");
            }
            break;
          case "var":
            return typeof value === "string" ? value : JSON.stringify(value);
          case "in":
            if (Array.isArray(value) && value.length === 2) {
              return `${formatValue(value[0])} in ${formatValue(value[1])}`;
            }
            break;
        }
      }
    }

    // If we can't simplify, return a shortened version
    return condition.length > 30
      ? `${condition.substring(0, 30)}...`
      : condition;
  } catch {
    // If it's not valid JSON, return as is (truncated if too long)
    return condition.length > 30
      ? `${condition.substring(0, 30)}...`
      : condition;
  }
}

function formatValue(value: unknown): string {
  if (typeof value === "object" && value !== null) {
    // Check if it's a JsonLogicVar
    if ("var" in value && typeof (value as JsonLogicVar).var === "string") {
      return (value as JsonLogicVar).var;
    }
    return JSON.stringify(value);
  }
  if (typeof value === "string") {
    return `"${value}"`;
  }
  return String(value);
}

export default function FloatingEdge({
  source,
  target,
  markerEnd,
  style,
  data,
}: EdgeProps) {
  const nodes = useNodes();
  const sourceNode = nodes.find((node) => node.id === source);
  const targetNode = nodes.find((node) => node.id === target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } =
    getEdgeParams(sourceNode, targetNode);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const condition = data?.condition as string | undefined;
  const renderedCondition = condition ? renderJsonLogic(condition) : null;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: 2,
          ...style,
        }}
      />
      {renderedCondition && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute bg-white/90 border border-gray-200 rounded px-2 py-1 text-xs font-mono text-gray-700 backdrop-blur-sm pointer-events-auto max-w-48 text-center"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
            title={condition || undefined}
          >
            {renderedCondition}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
