import { useEffect, useRef, useState } from 'react';
import { useGraphBuilderStore } from '@/stores/graph-builder';
import { useMultiTabGraphBuilderStore } from '@/stores/multi-tab-graph-builder';
import { useTemplateStore } from '@/stores/template-store';
import { initializeAutoSave, scheduleAutoSave } from '@/lib/localStorage';
import { useTheme } from 'next-themes';
import { ParamNode, NodeConnection, CardTemplate } from '@/types/graph-builder';

// Global restoration status that components can check
let isRestorationInProgress = false;

export const getRestorationStatus = () => isRestorationInProgress;

export const useAutoSave = () => {
  const { theme } = useTheme();
  const initializedRef = useRef(false);
  const restorationInProgressRef = useRef(false);
  const lastAutoSaveTime = useRef(0);
  const [restorationComplete, setRestorationComplete] = useState(false);

  // Initialize and restore state on mount - only run ONCE
  useEffect(() => {
    // Prevent multiple initializations or concurrent restoration
    if (initializedRef.current || restorationInProgressRef.current) return;
    
    // Mark as in progress immediately
    restorationInProgressRef.current = true;
    isRestorationInProgress = true;
    initializedRef.current = true;
    
    const result = initializeAutoSave();
    if (result?.success && result.data) {
      try {
        console.log('Starting app state restoration...');
        
        // Set loading flags first to prevent auto-save during restoration
        useMultiTabGraphBuilderStore.setState({
          isUndoRedoOperation: true,
          isLoadingTemplate: true
        });

        // Add a small delay to let the loading state propagate
        setTimeout(() => {
          // Restore stores with minimal state changes and proper type casting
          const templateData = result.data?.templates;
          if (templateData) {
            // Cast the stored data to match expected types
            const typedTemplateData = {
              ...templateData,
              templates: templateData.templates.map(template => ({
                ...template,
                metrics: template.metrics.map(metric => ({
                  ...metric,
                  nodes: metric.nodes as ParamNode[],
                  connections: metric.connections as NodeConnection[]
                }))
              }))
            };
            useTemplateStore.setState(typedTemplateData);
            console.log('Template store restored');
          }
          
          // Handle single-tab store restoration with proper type casting
          const singleTabData = result.data?.singleTabGraph;
          if (singleTabData) {
            const typedSingleTabData = {
              ...singleTabData,
              nodes: singleTabData.nodes as ParamNode[],
              template: singleTabData.template as CardTemplate | null
            };
            useGraphBuilderStore.setState(typedSingleTabData);
            console.log('Single tab store restored');
          }

          // DO NOT restore tabs directly - let the template loading mechanism handle it
          // This prevents the restoration from getting stuck
          console.log('Skipping direct tab restoration - will use template loading mechanism');

          // Clear flags after state settles with an even longer delay
          setTimeout(() => {
            useMultiTabGraphBuilderStore.setState({
              isUndoRedoOperation: false,
              isLoadingTemplate: false
            });
            
            // Final delay to ensure all components have settled
            setTimeout(() => {
              restorationInProgressRef.current = false;
              isRestorationInProgress = false;
              setRestorationComplete(true);
              console.log('App state restoration completed successfully');
            }, 500);
            
          }, 1000); // Shorter delay since we're not restoring tabs
        }, 100); // Initial delay to let loading state propagate
        
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
        isRestorationInProgress = false;
        setRestorationComplete(true);
      }
    } else {
      // Even if no saved state, mark as initialized to prevent re-runs
      restorationInProgressRef.current = false;
      isRestorationInProgress = false;
      setRestorationComplete(true);
      console.log('No saved state to restore');
    }

    // Setup periodic auto-save with more conservative guards
    const interval = setInterval(() => {
      // Skip if still initializing
      if (restorationInProgressRef.current || isRestorationInProgress) return;
      
      // Rate limiting: don't auto-save more than once every 30 seconds
      const now = Date.now();
      if (now - lastAutoSaveTime.current < 30000) {
        return;
      }
      
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
        
        lastAutoSaveTime.current = now;
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 60000); // Even longer interval to reduce frequency

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - never re-run

  // Return restoration status for components to use
  return { restorationComplete };
}; 