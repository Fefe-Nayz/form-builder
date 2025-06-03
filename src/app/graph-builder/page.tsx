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
import { VariableManager } from "@/components/graph-builder/VariableManager";
import { useMultiTabGraphBuilderStore } from "@/stores/multi-tab-graph-builder";
import { useTemplateStore } from "@/stores/template-store";
import { getRestorationStatus } from "@/hooks/useAutoSave";

export default function GraphBuilderWithTabsPage() {
  const { undo, redo, canUndo, canRedo, isUndoRedoOperation } =
    useMultiTabGraphBuilderStore();
  const { activeTemplateId } = useTemplateStore();

  // Check if restoration is in progress
  const isRestoring = getRestorationStatus();

  // Remove auto-save initialization to prevent conflicts with GraphToolbar
  // Auto-save is now handled only in GraphToolbar to prevent infinite loops

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl (or Cmd on Mac) is pressed
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "z" && !event.shiftKey) {
          event.preventDefault();
          // Add safety check to prevent multiple rapid undo calls
          if (canUndo() && !isUndoRedoOperation) {
            undo();
          }
        } else if (event.key === "y" || (event.key === "z" && event.shiftKey)) {
          event.preventDefault();
          // Add safety check to prevent multiple rapid redo calls
          if (canRedo() && !isUndoRedoOperation) {
            redo();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, canUndo, canRedo, isUndoRedoOperation]);

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <GraphToolbar tabMode={true} />

      {/* Main Content */}
      {isRestoring ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-medium">Chargement...</div>
            <div className="text-sm text-muted-foreground mt-2">
              Restauration de l&apos;état de l&apos;application
            </div>
          </div>
        </div>
      ) : (
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
                  defaultSize={20}
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

                    <ResizableHandle id="vertical-resize-handle-2" />

                    <ResizablePanel
                      defaultSize={25}
                      minSize={25}
                      className="min-h-0"
                      id="variable-manager-panel"
                      order={3}
                    >
                      <div className="h-full border-r overflow-hidden">
                        <div className="h-full p-4 overflow-auto">
                          <VariableManager />
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
      )}
    </div>
  );
}
