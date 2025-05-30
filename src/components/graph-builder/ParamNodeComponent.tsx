"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParamNode, PARAM_TYPES } from "@/types/graph-builder";
import { cn } from "@/lib/utils";
import { useGraphBuilderStore } from "@/stores/graph-builder";
import { useMultiTabGraphBuilderStore } from "@/stores/multi-tab-graph-builder";

interface ParamNodeComponentProps {
  data: ParamNode;
  selected?: boolean;
}

const ParamNodeComponent = memo(
  ({ data, selected }: ParamNodeComponentProps) => {
    const singleTabStore = useGraphBuilderStore();
    const multiTabStore = useMultiTabGraphBuilderStore();

    const paramType = PARAM_TYPES.find((t) => t.id === data.type_id);

    // Determine if we're in tab mode and get the appropriate data
    const isTabMode = !!multiTabStore.getActiveTab();
    const nodes = isTabMode
      ? multiTabStore.getActiveTab()?.nodes || []
      : singleTabStore.nodes;
    const connections = isTabMode
      ? multiTabStore.getActiveTab()?.connections || []
      : [];

    // Find parent information
    let parentInfo = null;
    if (isTabMode) {
      // Multi-tab mode: use connections
      const parentConnection = connections.find(
        (conn) => conn.target === data.id
      );
      if (parentConnection) {
        const parentNode = nodes.find((n) => n.id === parentConnection.source);
        if (parentNode) {
          parentInfo = {
            name:
              parentNode.label_json?.fr ||
              parentNode.label_json?.en ||
              parentNode.key,
            hasCondition: !!parentConnection.condition,
          };
        }
      }
    } else {
      // Single-tab mode: use parent_id
      if (data.parent_id) {
        const parentNode = nodes.find((n) => n.id === data.parent_id);
        if (parentNode) {
          parentInfo = {
            name:
              parentNode.label_json?.fr ||
              parentNode.label_json?.en ||
              parentNode.key,
            hasCondition: !!data.condition,
          };
        }
      }
    }

    const handleStyle =
      "w-3 h-3 !bg-gray-500 border-2 border-white hover:!bg-gray-600 transition-colors";

    return (
      <div
        className={cn(
          "min-w-[200px] transition-all duration-200 relative",
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

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm truncate" title={data.key}>
                {data.key}
              </h3>
              <div className="flex items-center gap-1 ml-2">
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

          <CardContent className="pt-0">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {data.label_json?.fr || data.label_json?.en || "No label"}
              </p>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Order: {data.order}</span>
                {parentInfo && (
                  <span
                    className="text-blue-600"
                    title={`Child of: ${parentInfo.name}`}
                  >
                    Child of {parentInfo.name}
                  </span>
                )}
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
