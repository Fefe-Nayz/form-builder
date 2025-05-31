import { useEffect, useRef } from 'react';
import { useGraphBuilderStore } from '@/stores/graph-builder';
import { useMultiTabGraphBuilderStore } from '@/stores/multi-tab-graph-builder';
import { useTemplateStore } from '@/stores/template-store';
import { initializeAutoSave, scheduleAutoSave } from '@/lib/localStorage';
import { useTheme } from 'next-themes';

export const useAutoSave = (tabMode: boolean = false) => {
  const { theme } = useTheme();
  const initializedRef = useRef(false);
  const restorationInProgressRef = useRef(false);

  // Initialize and restore state on mount - only run ONCE
  useEffect(() => {
    // Prevent multiple initializations or concurrent restoration
    if (initializedRef.current || restorationInProgressRef.current) return;
    
    // Mark as in progress immediately
    restorationInProgressRef.current = true;
    initializedRef.current = true;
    
    const result = initializeAutoSave();
    if (result?.success && result.data) {
      try {
        // Set loading flags first to prevent auto-save during restoration
        useMultiTabGraphBuilderStore.setState({
          isUndoRedoOperation: true,
          isLoadingTemplate: true
        });
        
        // Restore stores with minimal state changes
        useTemplateStore.setState(result.data.templates);
        
        // Handle multi-tab store restoration with proper Map conversion
        const multiTabData = result.data.multiTabGraph;
        if (multiTabData) {
          useMultiTabGraphBuilderStore.setState({
            ...multiTabData,
            tabCanvasStores: new Map(), // Always start with empty Map
            isUndoRedoOperation: true, // Keep flag during restoration
            isLoadingTemplate: true // Keep template loading flag
          });
        }
        
        useGraphBuilderStore.setState(result.data.singleTabGraph);

        // Clear flags after state settles
        setTimeout(() => {
          useMultiTabGraphBuilderStore.setState({
            isUndoRedoOperation: false,
            isLoadingTemplate: false
          });
          restorationInProgressRef.current = false;
        }, 300); // Longer delay to ensure state settles
        
        console.log('Auto-save initialized and state restored for tabMode:', tabMode);
      } catch (error) {
        console.error("Error restoring app state:", error);
        // Reset to safe state if restoration fails
        useMultiTabGraphBuilderStore.setState({
          tabs: [],
          activeTabId: null,
          tabCanvasStores: new Map(),
          isUndoRedoOperation: false,
          isLoadingTemplate: false,
        });
        restorationInProgressRef.current = false;
      }
    } else {
      // Even if no saved state, mark as initialized to prevent re-runs
      restorationInProgressRef.current = false;
    }

    // Setup periodic auto-save with more conservative guards
    const interval = setInterval(() => {
      // Skip if still initializing
      if (restorationInProgressRef.current) return;
      
      // Only auto-save if not in restoration or undo/redo
      const multiTabState = useMultiTabGraphBuilderStore.getState();
      if (multiTabState.isUndoRedoOperation || multiTabState.isLoadingTemplate) {
        return;
      }
      
      try {
        const templateStore = useTemplateStore.getState();
        const singleTabStore = useGraphBuilderStore.getState();

        scheduleAutoSave(
          { getState: () => templateStore },
          { getState: () => multiTabState },
          { getState: () => singleTabStore },
          { theme: theme || 'system' }
        );
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 45000); // Longer interval to reduce frequency

    return () => {
      clearInterval(interval);
    };
  }, []); // Only run once on mount - never re-run

  // Note: Template switching is now handled directly in the GraphToolbar
  // to avoid duplication issues
}; 