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

    return (
      <div
        className={cn(
          "min-w-[200px] transition-all duration-200",
          selected && "ring-2 ring-blue-500"
        )}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-gray-400 border-2 border-white"
        />

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm truncate" title={data.key}>
                {data.key}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {paramType?.code || "unknown"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {data.label_json?.fr || data.label_json?.en || "No label"}
              </p>

              {data.condition && (
                <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                  <p
                    className="text-xs text-yellow-700 font-mono truncate"
                    title={data.condition}
                  >
                    {data.condition}
                  </p>
                </div>
              )}

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Order: {data.order}</span>
                {data.parent_id && <span className="text-blue-600">Child</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-gray-400 border-2 border-white"
        />
      </div>
    );
  }
);

ParamNodeComponent.displayName = "ParamNodeComponent";

export default ParamNodeComponent;
