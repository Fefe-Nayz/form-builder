import { useEffect, useRef } from 'react';
import { useGraphBuilderStore } from '@/stores/graph-builder';
import { useMultiTabGraphBuilderStore } from '@/stores/multi-tab-graph-builder';
import { useTemplateStore } from '@/stores/template-store';
import { initializeAutoSave, scheduleAutoSave } from '@/lib/localStorage';
import { useTheme } from 'next-themes';

export const useAutoSave = (tabMode: boolean = false) => {
  const { theme } = useTheme();
  const initializedRef = useRef(false);

  // Initialize and restore state on mount
  useEffect(() => {
    // Prevent multiple initializations
    if (initializedRef.current) return;
    
    const result = initializeAutoSave();
    if (result?.success && result.data) {
      try {
        // Restore stores
        useTemplateStore.setState(result.data.templates);
        
        // Handle multi-tab store restoration with proper Map conversion
        const multiTabData = result.data.multiTabGraph;
        if (multiTabData) {
          // Convert tabCanvasStores from plain object back to Map
          const restoredTabCanvasStores = new Map();
          
          // If tabCanvasStores exists but is not a Map (from localStorage), recreate as empty Map
          // We'll recreate the canvas stores when loading tabs from template
          if (multiTabData.tabCanvasStores) {
            // Don't try to restore the canvas stores from localStorage as they contain functions
            // They will be recreated when tabs are loaded from template
          }
          
          useMultiTabGraphBuilderStore.setState({
            ...multiTabData,
            tabCanvasStores: restoredTabCanvasStores, // Always start with empty Map
            isUndoRedoOperation: false, // Ensure this is reset
            isLoadingTemplate: false // Ensure template loading flag is reset
          });
        }
        
        useGraphBuilderStore.setState(result.data.singleTabGraph);

        // DO NOT call loadTabsFromTemplate here - let GraphToolbar's useEffect handle it
        // This prevents duplicate calls and infinite re-renders during initialization
        
        console.log('Auto-save initialized for tabMode:', tabMode);
        initializedRef.current = true;
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
        initializedRef.current = true;
      }
    } else {
      // Even if no saved state, mark as initialized to prevent re-runs
      initializedRef.current = true;
    }

    // Setup periodic auto-save
    const interval = setInterval(() => {
      const templateStore = useTemplateStore.getState();
      const multiTabStore = useMultiTabGraphBuilderStore.getState();
      const singleTabStore = useGraphBuilderStore.getState();

      scheduleAutoSave(
        { getState: () => templateStore },
        { getState: () => multiTabStore },
        { getState: () => singleTabStore },
        { theme: theme || 'system' }
      );
    }, 30000); // Auto-save every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []); // Only run once on mount

  // Note: Template switching is now handled directly in the GraphToolbar
  // to avoid duplication issues
}; 