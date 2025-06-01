import React, { useMemo } from "react";
import {
  useNodes,
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { getEdgeParams } from "./utils";

// Type for JSON Logic variables
interface JsonLogicVar {
  var: string;
}

// Type for JSON Logic operators
interface JsonLogicOperation {
  "==": [JsonLogicVar | string | number, string | number];
}

// Type for JSON Logic condition
type JsonLogicCondition = JsonLogicOperation | JsonLogicVar | string | number;

function renderJsonLogic(condition: string): string {
  try {
    const parsed: JsonLogicCondition = JSON.parse(condition);

    function formatCondition(cond: JsonLogicCondition): string {
      if (typeof cond === "string" || typeof cond === "number") {
        return String(cond);
      }

      if (typeof cond === "object" && cond !== null) {
        if ("var" in cond) {
          return cond.var;
        }

        if ("==" in cond) {
          const [left, right] = cond["=="];
          const leftStr =
            typeof left === "object" && left !== null && "var" in left
              ? left.var
              : String(left);
          return `${leftStr} = ${right}`;
        }

        // Handle other operators
        const operator = Object.keys(cond)[0];
        const operands = (cond as Record<string, JsonLogicCondition[]>)[operator];

        if (Array.isArray(operands) && operands.length === 2) {
          const [left, right] = operands;
          const leftStr =
            typeof left === "object" && left !== null && "var" in left
              ? left.var
              : String(left);
          const rightStr =
            typeof right === "object" && right !== null && "var" in right
              ? right.var
              : String(right);

          const operatorMap: Record<string, string> = {
            "!=": "≠",
            "<": "<",
            ">": ">",
            "<=": "≤",
            ">=": "≥",
            and: "ET",
            or: "OU",
          };

          return `${leftStr} ${operatorMap[operator] || operator} ${rightStr}`;
        }
      }

      return condition;
    }

    return formatCondition(parsed);
  } catch (error) {
    console.error("Error parsing condition:", error);
    return condition;
  }
}

export default function SmartEdge({
  source,
  target,
  markerEnd,
  style,
  data,
}: EdgeProps) {
  const nodes = useNodes();
  const sourceNode = nodes.find((node) => node.id === source);
  const targetNode = nodes.find((node) => node.id === target);

  const { edgePath, labelX, labelY } = useMemo(() => {
    if (!sourceNode || !targetNode) {
      return { edgePath: "", labelX: 0, labelY: 0 };
    }

    // Get edge parameters for bezier path
    const {
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    } = getEdgeParams(sourceNode, targetNode);

    // Create smooth bezier path
    const [path, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    return {
      edgePath: path,
      labelX,
      labelY,
    };
  }, [sourceNode, targetNode]);

  const condition = data?.condition as string | undefined;
  const renderedCondition = condition ? renderJsonLogic(condition) : null;

  if (!sourceNode || !targetNode) {
    return null;
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: 2,
          stroke: "#3b82f6",
          ...style,
        }}
      />
      {renderedCondition && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute bg-white/95 border border-gray-200 rounded-md px-2 py-1 text-xs font-mono text-gray-700 backdrop-blur-sm pointer-events-auto max-w-48 text-center shadow-sm"
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
