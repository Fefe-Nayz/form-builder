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
        <ResizablePanelGroup direction="horizontal">
          {/* Left Sidebar - Split for NodeToolbox and TemplateManager - Only show when template is active */}
          {activeTemplateId && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel defaultSize={50}>
                    <div className="h-full p-4 border-r border-b overflow-auto">
                      <NodeToolbox tabMode={true} />
                    </div>
                  </ResizablePanel>

                  <ResizableHandle />

                  <ResizablePanel defaultSize={50}>
                    <div className="h-full p-4 border-r overflow-auto">
                      <TemplateManager />
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>

              <ResizableHandle />
            </>
          )}

          {/* Center and Right - Multi-tab area */}
          <ResizablePanel
            defaultSize={activeTemplateId ? 80 : 100}
            minSize={70}
          >
            <MetricTabs />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
