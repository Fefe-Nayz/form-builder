"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParamNode, PARAM_TYPES } from "@/types/graph-builder";
import { cn } from "@/lib/utils";

interface ParamNodeComponentProps {
  data: ParamNode;
  selected?: boolean;
}

const ParamNodeComponent = memo(
  ({ data, selected }: ParamNodeComponentProps) => {
    const paramType = PARAM_TYPES.find((t) => t.id === data.type_id);

    const handleStyle =
      "w-3 h-3 !bg-gray-500 border-2 border-white hover:!bg-gray-600 transition-colors";

    return (
      <div
        className={cn(
          "min-w-[200px] max-w-[300px] transition-all duration-200 relative",
          selected && "ring-2 ring-blue-500"
        )}
      >
        {/* Top Handle */}
        <Handle
          type="source"
          position={Position.Top}
          id="top"
          className={handleStyle}
          style={{
            top: -6,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        />
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          className={handleStyle}
          style={{
            top: -6,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        />

        {/* Right Handle */}
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className={handleStyle}
          style={{
            right: -6,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
          }}
        />
        <Handle
          type="target"
          position={Position.Right}
          id="right"
          className={handleStyle}
          style={{
            right: -6,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
          }}
        />

        <Card className="shadow-md w-full">
          <CardHeader className="pb-2 px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="font-medium text-sm break-words flex-1 min-w-0 leading-tight"
                title={data.key}
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  hyphens: "auto",
                }}
              >
                {data.key}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                {data.condition && (
                  <Badge
                    variant="outline"
                    className="text-xs h-5 px-1.5 text-yellow-700 border-yellow-300 bg-yellow-50"
                  >
                    C
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {paramType?.code || "unknown"}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 px-3 pb-3">
            <div className="space-y-2">
              <p
                className="text-xs text-muted-foreground break-words leading-relaxed"
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {data.label_json?.fr || data.label_json?.en || "No label"}
              </p>

              <div className="flex justify-between items-center text-xs text-muted-foreground gap-2">
                <span className="flex-shrink-0">Order: {data.order}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Handle */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className={handleStyle}
          style={{
            bottom: -6,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        />
        <Handle
          type="target"
          position={Position.Bottom}
          id="bottom"
          className={handleStyle}
          style={{
            bottom: -6,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        />

        {/* Left Handle */}
        <Handle
          type="source"
          position={Position.Left}
          id="left"
          className={handleStyle}
          style={{
            left: -6,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          className={handleStyle}
          style={{
            left: -6,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
          }}
        />
      </div>
    );
  }
);

ParamNodeComponent.displayName = "ParamNodeComponent";

export default ParamNodeComponent;
