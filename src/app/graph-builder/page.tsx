"use client";

import React, { useEffect } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { GraphToolbar } from "@/components/graph-builder/GraphToolbar";
import { NodeToolbox } from "@/components/graph-builder/NodeToolbox";
import { MetricTabs } from "@/components/graph-builder/MetricTabs";
import { TemplateManager } from "@/components/graph-builder/TemplateManager";
import { useMultiTabGraphBuilderStore } from "@/stores/multi-tab-graph-builder";
import { useTemplateStore } from "@/stores/template-store";

export default function GraphBuilderWithTabsPage() {
  const { undo, redo, canUndo, canRedo } = useMultiTabGraphBuilderStore();
  const { activeTemplateId } = useTemplateStore();

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl (or Cmd on Mac) is pressed
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "z" && !event.shiftKey) {
          event.preventDefault();
          if (canUndo()) {
            undo();
          }
        } else if (event.key === "y" || (event.key === "z" && event.shiftKey)) {
          event.preventDefault();
          if (canRedo()) {
            redo();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <GraphToolbar tabMode={true} />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full"
          id="main-horizontal-group"
        >
          {/* Left Sidebar - Split for NodeToolbox and TemplateManager - Only show when template is active */}
          {activeTemplateId && (
            <>
              <ResizablePanel
                defaultSize={25}
                minSize={20}
                maxSize={40}
                className="min-w-0"
                id="left-sidebar-panel"
                order={1}
              >
                <ResizablePanelGroup
                  direction="vertical"
                  className="h-full"
                  id="left-sidebar-vertical-group"
                >
                  <ResizablePanel
                    defaultSize={50}
                    minSize={25}
                    className="min-h-0"
                    id="node-toolbox-panel"
                    order={1}
                  >
                    <div className="h-full border-r border-b overflow-hidden">
                      <div className="h-full p-4 overflow-auto">
                        <NodeToolbox tabMode={true} />
                      </div>
                    </div>
                  </ResizablePanel>

                  <ResizableHandle id="vertical-resize-handle" />

                  <ResizablePanel
                    defaultSize={25}
                    minSize={25}
                    className="min-h-0"
                    id="template-manager-panel"
                    order={2}
                  >
                    <div className="h-full border-r overflow-hidden">
                      <div className="h-full p-4 overflow-auto">
                        <TemplateManager />
                      </div>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>

              <ResizableHandle id="main-horizontal-resize-handle" />
            </>
          )}

          {/* Center and Right - Multi-tab area */}
          <ResizablePanel
            defaultSize={activeTemplateId ? 75 : 100}
            minSize={50}
            className="min-w-0"
            id="metric-tabs-panel"
            order={2}
          >
            <MetricTabs />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
