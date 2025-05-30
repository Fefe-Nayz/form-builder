'use client';

import { useEffect } from 'react';
import { useMultiTabGraphBuilderStore } from '@/stores/multi-tab-graph-builder';
import { useTemplateStore } from '@/stores/template-store';

/**
 * This hook synchronizes changes between the multi-tab store and the template store
 * It listens for changes in tabs and updates the template store accordingly
 */
export function useSyncTabsWithTemplate() {
  const {
    tabs,
    activeTabId,
    getActiveTab
  } = useMultiTabGraphBuilderStore();

  const {
    activeTemplateId,
    updateMetricInTemplate
  } = useTemplateStore();
  // Sync active tab changes with template
  useEffect(() => {
    if (!activeTemplateId || !activeTabId) return;

    const activeTab = getActiveTab();
    if (!activeTab) return;

    // Use debouncing to prevent too many updates
    const debounceTimer = setTimeout(() => {
      // Update the template with the latest tab data
      updateMetricInTemplate(
        activeTemplateId,
        activeTabId,
        {
          id: activeTab.id,
          name: activeTab.name,
          nodes: activeTab.nodes,
          connections: activeTab.connections,
          position: activeTab.position
        }
      );
      
      console.log(`Synchronized tab ${activeTabId} with template ${activeTemplateId}`);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [
    activeTemplateId,
    activeTabId,
    getActiveTab,
    updateMetricInTemplate,
    // We intentionally exclude tabs from dependencies to avoid infinite loops
  ]);

  return {
    hasSyncedTabs: Boolean(activeTemplateId && tabs.length > 0)
  };
}
