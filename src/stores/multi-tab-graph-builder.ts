import { create } from 'zustand';
import { temporal } from 'zundo';
import { ParamNode, NodeConnection } from '@/types/graph-builder';
import { scheduleAutoSave } from '@/lib/localStorage';

export interface GraphTab {
  id: string;
  name: string;
  nodes: ParamNode[];
  connections: NodeConnection[];
  selectedNodeId: string | null;
  position: { x: number; y: number; zoom: number };
}

// Separate store for each tab's canvas state with undo/redo
interface TabCanvasState {
  nodes: ParamNode[];
  connections: NodeConnection[];
  selectedNodeId: string | null;
  position: { x: number; y: number; zoom: number };
}

// Define the type for temporal canvas store - use any since temporal store has complex internal structure
// that is difficult to type properly without causing compatibility issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TabCanvasStore = any;

// Main store without undo/redo for tab management
interface MultiTabGraphBuilderStore {
  tabs: GraphTab[];
  activeTabId: string | null;
  tabCanvasStores: Map<string, TabCanvasStore>; // Map of tab ID to temporal store
  
  // Add flag to prevent auto-save during undo/redo
  isUndoRedoOperation: boolean;
  
  // Add flag to prevent multiple simultaneous template loads
  isLoadingTemplate: boolean;
  
  // Tab management (no undo/redo for these)
  createTab: (name?: string) => string;
  createTabWithId: (tabId: string, tabData: Partial<GraphTab>) => string;
  deleteTab: (tabId: string) => void;
  renameTab: (tabId: string, name: string) => void;
  setActiveTab: (tabId: string) => void;
  setActiveTabById: (tabId: string) => boolean;
  importGraph: (tabId: string, data: { nodes: ParamNode[], connections: NodeConnection[], position?: { x: number; y: number; zoom: number } }) => void;
  
  // Template-related tab operations
  getTabsForTemplate: (templateId: string) => GraphTab[];
  filterTabsByTemplate: (templateId: string) => void;
  loadTabsFromTemplate: (templateId: string) => void;
  
  // Active tab operations
  getActiveTab: () => GraphTab | null;
  updateActiveTab: (updates: Partial<Omit<GraphTab, 'id'>>) => void;
  
  // Canvas operations with undo/redo support
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getActiveTabCanvasStore: () => any;
  
  // Node operations for active tab
  addNodeToActiveTab: (node: Omit<ParamNode, 'id'>) => string;
  updateNodeInActiveTab: (nodeId: string, updates: Partial<ParamNode>) => void;
  deleteNodeFromActiveTab: (nodeId: string) => void;
  
  // Connection operations for active tab
  addConnectionToActiveTab: (connection: Omit<NodeConnection, 'id'>) => string;
  deleteConnectionFromActiveTab: (connectionId: string) => void;
  
  // View operations for active tab
  setSelectedNodeInActiveTab: (nodeId: string | null) => void;
  updateViewportInActiveTab: (position: { x: number; y: number; zoom: number }) => void;
  
  // Auto-save functionality
  scheduleAutoSaveToTemplate: () => void;
  
  // Undo/redo operations for active tab only
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
}

// Create a temporal store for tab canvas state
const createTabCanvasStore = (initialState: TabCanvasState): TabCanvasStore => {
  return create(
    temporal(
      (set: (fn: (state: TabCanvasState) => TabCanvasState) => void) => ({
        nodes: initialState.nodes,
        connections: initialState.connections,
        selectedNodeId: initialState.selectedNodeId,
        position: initialState.position,
        
        // Canvas operations that will be tracked by undo/redo
        setNodes: (nodes: ParamNode[]) => set((state: TabCanvasState) => ({ ...state, nodes })),
        setConnections: (connections: NodeConnection[]) => set((state: TabCanvasState) => ({ ...state, connections })),
        setSelectedNodeId: (selectedNodeId: string | null) => set((state: TabCanvasState) => ({ ...state, selectedNodeId })),
        setPosition: (position: { x: number; y: number; zoom: number }) => set((state: TabCanvasState) => ({ ...state, position })),
        
        addNode: (node: Omit<ParamNode, 'id'>) => {
          const newNodeId = `node_${Date.now()}`;
          const newNode: ParamNode = { id: newNodeId, ...node };
          set((state: TabCanvasState) => ({ ...state, nodes: [...state.nodes, newNode] }));
          return newNodeId;
        },
        
        updateNode: (nodeId: string, updates: Partial<ParamNode>) => {
          set((state: TabCanvasState) => ({
            ...state,
            nodes: state.nodes.map((node: ParamNode) => 
              node.id === nodeId ? { ...node, ...updates } : node
            )
          }));
        },
        
        deleteNode: (nodeId: string) => {
          set((state: TabCanvasState) => ({
            ...state,
            nodes: state.nodes.filter((node: ParamNode) => node.id !== nodeId),
            connections: state.connections.filter((conn: NodeConnection) => 
              conn.source !== nodeId && conn.target !== nodeId
            )
          }));
        },
        
        addConnection: (connection: Omit<NodeConnection, 'id'>) => {
          const newConnectionId = `connection_${Date.now()}`;
          const newConnection: NodeConnection = { id: newConnectionId, ...connection };
          set((state: TabCanvasState) => ({ ...state, connections: [...state.connections, newConnection] }));
          return newConnectionId;
        },
        
        deleteConnection: (connectionId: string) => {
          set((state: TabCanvasState) => ({
            ...state,
            connections: state.connections.filter((conn: NodeConnection) => conn.id !== connectionId)
          }));
        },
      }),
      {
        limit: 50,
        partialize: (state: TabCanvasState) => {
          // Only track canvas operations, not selection or viewport
          const { nodes, connections } = state;
          return { nodes, connections };
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSave: (pastState: any, currentState: any) => {
          // Don't create history entries for identical states
          if (pastState && currentState) {
            const pastNodes = JSON.stringify(pastState.nodes);
            const pastConnections = JSON.stringify(pastState.connections);
            const currentNodes = JSON.stringify(currentState.nodes);
            const currentConnections = JSON.stringify(currentState.connections);
            
            return pastNodes !== currentNodes || pastConnections !== currentConnections;
          }
          return true;
        }
      }
    )
  );
};

// Helper function to trigger auto-save of current tab to template
const autoSaveTabToTemplate = async () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Import stores dynamically to avoid circular dependencies
    const { useTemplateStore } = await import('@/stores/template-store');
    const { useMultiTabGraphBuilderStore } = await import('@/stores/multi-tab-graph-builder');
    const { useGraphBuilderStore } = await import('@/stores/graph-builder');
    
    const templateStore = useTemplateStore.getState();
    const multiTabStore = useMultiTabGraphBuilderStore.getState();
    const singleTabStore = useGraphBuilderStore.getState();
    
    // Don't auto-save during undo/redo operations
    if (multiTabStore.isUndoRedoOperation) {
      return;
    }
    
    const activeTab = multiTabStore.getActiveTab();
    const activeTemplateId = templateStore.activeTemplateId;
    
    if (activeTab && activeTemplateId) {
      // Save current tab to template
      templateStore.saveMetricToTemplate(activeTemplateId, activeTab);
    }
    
    // Schedule localStorage auto-save
    scheduleAutoSave(
      { getState: () => templateStore },
      { getState: () => multiTabStore },
      { getState: () => singleTabStore },
      { theme: 'system' }
    );
  } catch (error) {
    console.error('Auto-save error:', error);
  }
};

export const useMultiTabGraphBuilderStore = create<MultiTabGraphBuilderStore>((set, get) => ({
  tabs: [],
  activeTabId: null,
  tabCanvasStores: new Map(),
  
  // Add flag to prevent auto-save during undo/redo
  isUndoRedoOperation: false,

  // Add flag to prevent multiple simultaneous template loads
  isLoadingTemplate: false,
  
  createTab: (name?: string) => {
    const newTabId = `tab_${Date.now()}`;
    const newTab: GraphTab = {
      id: newTabId,
      name: name || `Métrique ${get().tabs.length + 1}`,
      nodes: [],
      connections: [],
      selectedNodeId: null,
      position: { x: 0, y: 0, zoom: 1 }
    };

    // Create a new canvas store for this tab
    const canvasStore = createTabCanvasStore({
      nodes: newTab.nodes,
      connections: newTab.connections,
      selectedNodeId: newTab.selectedNodeId,
      position: newTab.position
    });

    set(state => {
      const newTabCanvasStores = new Map(state.tabCanvasStores);
      newTabCanvasStores.set(newTabId, canvasStore);
      
      return {
        tabs: [...state.tabs, newTab],
        activeTabId: newTabId,
        tabCanvasStores: newTabCanvasStores
      };
    });

    // Schedule auto-save after creating tab (only if not in undo/redo)
    if (!get().isUndoRedoOperation) {
      setTimeout(() => get().scheduleAutoSaveToTemplate(), 500);
    }

    return newTabId;
  },

  createTabWithId: (tabId: string, tabData: Partial<GraphTab>) => {
    const newTab: GraphTab = {
      id: tabId,
      name: tabData.name || `Métrique ${get().tabs.length + 1}`,
      nodes: tabData.nodes || [],
      connections: tabData.connections || [],
      selectedNodeId: tabData.selectedNodeId || null,
      position: tabData.position || { x: 0, y: 0, zoom: 1 }
    };

    // Create a new canvas store for this tab
    const canvasStore = createTabCanvasStore({
      nodes: newTab.nodes,
      connections: newTab.connections,
      selectedNodeId: newTab.selectedNodeId,
      position: newTab.position
    });

    set(state => {
      const newTabCanvasStores = new Map(state.tabCanvasStores);
      newTabCanvasStores.set(tabId, canvasStore);
      
      return {
        tabs: [...state.tabs, newTab],
        activeTabId: tabId,
        tabCanvasStores: newTabCanvasStores
      };
    });

    // Schedule auto-save after creating tab (only if not in undo/redo)
    if (!get().isUndoRedoOperation) {
      setTimeout(() => get().scheduleAutoSaveToTemplate(), 500);
    }

    return tabId;
  },

  deleteTab: (tabId: string) => {
    set(state => {
      const newTabs = state.tabs.filter(tab => tab.id !== tabId);
      const newActiveTabId = state.activeTabId === tabId 
        ? (newTabs.length > 0 ? newTabs[0].id : null)
        : state.activeTabId;

      // Remove the canvas store for this tab
      const newTabCanvasStores = new Map(state.tabCanvasStores);
      newTabCanvasStores.delete(tabId);

      return {
        tabs: newTabs,
        activeTabId: newActiveTabId,
        tabCanvasStores: newTabCanvasStores
      };
    });
    
    // Schedule auto-save after deleting tab (only if not in undo/redo)
    if (!get().isUndoRedoOperation) {
      setTimeout(() => get().scheduleAutoSaveToTemplate(), 500);
    }
  },

  renameTab: (tabId: string, name: string) => {
    // Ensure name is always a string
    const safeName = String(name || '');
    
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === tabId ? { ...tab, name: safeName } : tab
      )
    }));
    
    // Schedule auto-save after renaming tab (only if not in undo/redo)
    if (!get().isUndoRedoOperation) {
      setTimeout(() => get().scheduleAutoSaveToTemplate(), 500);
    }
  },

  setActiveTab: (tabId: string) => {
    // Save current tab before switching (only if not in undo/redo)
    if (!get().isUndoRedoOperation) {
      const currentTab = get().getActiveTab();
      if (currentTab) {
        setTimeout(() => get().scheduleAutoSaveToTemplate(), 500);
      }
    }
    
    set({ activeTabId: tabId });
  },

  setActiveTabById: (tabId: string) => {
    const state = get();
    const tabExists = state.tabs.find(tab => tab.id === tabId);
    if (tabExists) {
      // Save current tab before switching (only if not in undo/redo)
      if (!get().isUndoRedoOperation) {
        const currentTab = get().getActiveTab();
        if (currentTab) {
          setTimeout(() => get().scheduleAutoSaveToTemplate(), 500);
        }
      }
      
      set({ activeTabId: tabId });
      return true;
    }
    return false;
  },

  getTabsForTemplate: () => {
    // For now, we'll assume all tabs belong to the active template
    // In a more complex setup, tabs would have a templateId property
    const state = get();
    return state.tabs;
  },

  filterTabsByTemplate: () => {
    // This will be called when switching templates
    // For now, we show all tabs since tabs don't have templateId yet
    // In a future version, we could add templateId to GraphTab
  },

  loadTabsFromTemplate: (templateId: string) => {
    // Prevent concurrent calls
    const currentState = get();
    if (currentState.isLoadingTemplate) {
      console.log('Template loading already in progress, skipping:', templateId);
      return;
    }
    
    // Set loading flag
    set({ isLoadingTemplate: true });
    
    const loadTabsAsync = async () => {
      try {
        // Import template store dynamically to avoid circular dependencies
        const { useTemplateStore } = await import('@/stores/template-store');
        const templateStore = useTemplateStore.getState();
        
        const template = templateStore.templates.find((t) => t.id === templateId);
        if (!template) {
          console.log('Template not found:', templateId);
          set({ isLoadingTemplate: false });
          return;
        }
        
        // Check if we're already showing tabs for this template to prevent duplicates
        const state = get();
        
        // Convert template metrics to tabs
        const newTabs = template.metrics.map((metric) => 
          templateStore.convertMetricTabToGraphTab(metric)
        );
        
        // Improved check for same tabs - also compare content, not just IDs
        const currentTabIds = new Set(state.tabs.map((tab: GraphTab) => tab.id));
        const newTabIds = new Set(newTabs.map((tab: GraphTab) => tab.id));
        
        // Check if tabs are exactly the same (same IDs and same content)
        const tabsAreSame = currentTabIds.size === newTabIds.size && 
                           [...currentTabIds].every(id => newTabIds.has(id));
        
        // More robust content comparison for tabs
        const tabContentSame = tabsAreSame && state.tabs.length === newTabs.length &&
          state.tabs.every((currentTab) => {
            const newTab = newTabs.find(t => t.id === currentTab.id);
            return newTab && 
                   currentTab.name === newTab.name &&
                   currentTab.nodes.length === newTab.nodes.length &&
                   currentTab.connections.length === newTab.connections.length;
          });
        
        if (tabsAreSame && tabContentSame && state.tabs.length > 0) {
          console.log('Same tabs with same content already loaded for template:', templateId);
          // Ensure we have an active tab even if tabs are the same
          if (!state.activeTabId && newTabs.length > 0) {
            set({ activeTabId: newTabs[0].id });
          }
          set({ isLoadingTemplate: false });
          return;
        }
        
        console.log('Loading tabs from template:', templateId, 'metrics:', template.metrics.length, 'tabs:', newTabs.length);
        console.log('Current tabs:', state.tabs.length, 'New tabs:', newTabs.length);
        
        // Clear existing canvas stores before creating new ones to prevent memory leaks
        state.tabCanvasStores.clear();
        
        // Create canvas stores for each tab
        const newTabCanvasStores = new Map<string, TabCanvasStore>();
        newTabs.forEach((tab: GraphTab) => {
          const canvasStore = createTabCanvasStore({
            nodes: tab.nodes,
            connections: tab.connections,
            selectedNodeId: tab.selectedNodeId,
            position: tab.position
          });
          newTabCanvasStores.set(tab.id, canvasStore);
        });
        
        // Force clear existing tabs and load new ones
        // Always set the first tab as active, even if there are no tabs (null in that case)
        const firstTabId = newTabs.length > 0 ? newTabs[0].id : null;
        
        set({
          tabs: [...newTabs], // Create a new array to ensure React sees the change
          activeTabId: firstTabId,
          tabCanvasStores: newTabCanvasStores,
          isLoadingTemplate: false // Clear loading flag
        });
        
        // Log the final state for debugging
        console.log('Template loaded successfully. Active tab:', firstTabId, 'Total tabs:', newTabs.length);
        
      } catch (error) {
        console.error('Error loading tabs from template:', error);
        // Make sure to clear loading flag even on error
        set({ isLoadingTemplate: false });
      }
    };
    
    loadTabsAsync();
  },

  importGraph: (tabId: string, data: { nodes: ParamNode[], connections: NodeConnection[], position?: { x: number; y: number; zoom: number } }) => {
    // Update the tab
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === tabId 
          ? { 
              ...tab, 
              nodes: data.nodes || [],
              connections: data.connections || [],
              position: data.position || { x: 0, y: 0, zoom: 1 }
            } 
          : tab
      )
    }));
    
    // Update the canvas store for this tab
    const canvasStore = get().tabCanvasStores.get(tabId);
    if (canvasStore) {
      const { setNodes, setConnections, setPosition } = canvasStore.getState();
      setNodes(data.nodes || []);
      setConnections(data.connections || []);
      setPosition(data.position || { x: 0, y: 0, zoom: 1 });
    } else {
      // Create new canvas store if it doesn't exist
      const newCanvasStore = createTabCanvasStore({
        nodes: data.nodes || [],
        connections: data.connections || [],
        selectedNodeId: null,
        position: data.position || { x: 0, y: 0, zoom: 1 }
      });
      
      set(state => {
        const newTabCanvasStores = new Map(state.tabCanvasStores);
        newTabCanvasStores.set(tabId, newCanvasStore);
        return { tabCanvasStores: newTabCanvasStores };
      });
    }
    
    // Schedule auto-save after importing (only if not in undo/redo)
    if (!get().isUndoRedoOperation) {
      setTimeout(() => get().scheduleAutoSaveToTemplate(), 500);
    }
  },

  getActiveTab: () => {
    const state = get();
    if (!state.activeTabId) return null;
    
    // Get base tab data
    const baseTab = state.tabs.find(tab => tab.id === state.activeTabId);
    if (!baseTab) return null;
    
    // Get current canvas state from the temporal store
    const canvasStore = state.tabCanvasStores.get(state.activeTabId);
    if (!canvasStore) return baseTab;
    
    const canvasState = canvasStore.getState();
    return {
      ...baseTab,
      nodes: canvasState.nodes,
      connections: canvasState.connections,
      selectedNodeId: canvasState.selectedNodeId,
      position: canvasState.position
    };
  },

  updateActiveTab: (updates: Partial<Omit<GraphTab, 'id'>>) => {
    const state = get();
    if (!state.activeTabId) return;

    // Update base tab data
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === state.activeTabId 
          ? { ...tab, ...updates } 
          : tab
      )
    }));
    
    // Update canvas store if canvas-related updates
    const canvasStore = state.tabCanvasStores.get(state.activeTabId);
    if (canvasStore) {
      const { setNodes, setConnections, setSelectedNodeId, setPosition } = canvasStore.getState();
      
      if (updates.nodes !== undefined) setNodes(updates.nodes);
      if (updates.connections !== undefined) setConnections(updates.connections);
      if (updates.selectedNodeId !== undefined) setSelectedNodeId(updates.selectedNodeId);
      if (updates.position !== undefined) setPosition(updates.position);
    }
    
    // Schedule auto-save after updating tab (only if not in undo/redo)
    if (!get().isUndoRedoOperation) {
      setTimeout(() => get().scheduleAutoSaveToTemplate(), 500);
    }
  },

  getActiveTabCanvasStore: () => {
    const state = get();
    if (!state.activeTabId) return null;
    return state.tabCanvasStores.get(state.activeTabId) || null;
  },

  addNodeToActiveTab: (node: Omit<ParamNode, 'id'>) => {
    const state = get();
    if (!state.activeTabId) return '';

    const canvasStore = state.tabCanvasStores.get(state.activeTabId);
    if (!canvasStore) return '';

    const newNodeId = canvasStore.getState().addNode(node);
    
    // Sync with base tab
    const updatedNodes = canvasStore.getState().nodes;
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === state.activeTabId 
          ? { ...tab, nodes: updatedNodes } 
          : tab
      )
    }));
    
    // Schedule auto-save after adding node (only if not in undo/redo)
    if (!get().isUndoRedoOperation) {
      setTimeout(() => get().scheduleAutoSaveToTemplate(), 500);
    }

    return newNodeId;
  },

  updateNodeInActiveTab: (nodeId: string, updates: Partial<ParamNode>) => {
    const state = get();
    if (!state.activeTabId) return;

    const canvasStore = state.tabCanvasStores.get(state.activeTabId);
    if (!canvasStore) return;

    canvasStore.getState().updateNode(nodeId, updates);
    
    // Sync with base tab
    const updatedNodes = canvasStore.getState().nodes;
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === state.activeTabId 
          ? { ...tab, nodes: updatedNodes } 
          : tab
      )
    }));
    
    // Schedule auto-save after updating node (only if not in undo/redo)
    if (!get().isUndoRedoOperation) {
      setTimeout(() => get().scheduleAutoSaveToTemplate(), 500);
    }
  },

  deleteNodeFromActiveTab: (nodeId: string) => {
    const state = get();
    if (!state.activeTabId) return;

    const canvasStore = state.tabCanvasStores.get(state.activeTabId);
    if (!canvasStore) return;

    canvasStore.getState().deleteNode(nodeId);
    
    // Sync with base tab
    const canvasState = canvasStore.getState();
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === state.activeTabId 
          ? { 
              ...tab, 
              nodes: canvasState.nodes,
              connections: canvasState.connections 
            } 
          : tab
      )
    }));
    
    // Schedule auto-save after deleting node (only if not in undo/redo)
    if (!get().isUndoRedoOperation) {
      setTimeout(() => get().scheduleAutoSaveToTemplate(), 500);
    }
  },

  addConnectionToActiveTab: (connection: Omit<NodeConnection, 'id'>) => {
    const state = get();
    if (!state.activeTabId) return '';

    const canvasStore = state.tabCanvasStores.get(state.activeTabId);
    if (!canvasStore) return '';

    const newConnectionId = canvasStore.getState().addConnection(connection);
    
    // Sync with base tab
    const updatedConnections = canvasStore.getState().connections;
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === state.activeTabId 
          ? { ...tab, connections: updatedConnections } 
          : tab
      )
    }));
    
    // Schedule auto-save after adding connection (only if not in undo/redo)
    if (!get().isUndoRedoOperation) {
      setTimeout(() => get().scheduleAutoSaveToTemplate(), 500);
    }

    return newConnectionId;
  },

  deleteConnectionFromActiveTab: (connectionId: string) => {
    const state = get();
    if (!state.activeTabId) return;

    const canvasStore = state.tabCanvasStores.get(state.activeTabId);
    if (!canvasStore) return;

    canvasStore.getState().deleteConnection(connectionId);
    
    // Sync with base tab
    const updatedConnections = canvasStore.getState().connections;
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === state.activeTabId 
          ? { ...tab, connections: updatedConnections } 
          : tab
      )
    }));
    
    // Schedule auto-save after deleting connection (only if not in undo/redo)
    if (!get().isUndoRedoOperation) {
      setTimeout(() => get().scheduleAutoSaveToTemplate(), 500);
    }
  },

  setSelectedNodeInActiveTab: (nodeId: string | null) => {
    const state = get();
    if (!state.activeTabId) return;

    // Update canvas store
    const canvasStore = state.tabCanvasStores.get(state.activeTabId);
    if (canvasStore) {
      canvasStore.getState().setSelectedNodeId(nodeId);
    }

    // Update base tab
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === state.activeTabId 
          ? { ...tab, selectedNodeId: nodeId } 
          : tab
      )
    }));
    
    // No auto-save for selection changes to avoid excessive saving
  },

  updateViewportInActiveTab: (position: { x: number; y: number; zoom: number }) => {
    const state = get();
    if (!state.activeTabId) return;

    // Update canvas store
    const canvasStore = state.tabCanvasStores.get(state.activeTabId);
    if (canvasStore) {
      canvasStore.getState().setPosition(position);
    }

    // Update base tab
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === state.activeTabId 
          ? { ...tab, position } 
          : tab
      )
    }));
    
    // Schedule auto-save for viewport changes (debounced, only if not in undo/redo)
    if (!get().isUndoRedoOperation) {
      setTimeout(() => get().scheduleAutoSaveToTemplate(), 1000);
    }
  },

  scheduleAutoSaveToTemplate: () => {
    autoSaveTabToTemplate();
  },

  // Undo/redo operations for the active tab only
  canUndo: () => {
    const state = get();
    const canvasStore = state.tabCanvasStores.get(state.activeTabId || '');
    if (!canvasStore) return false;
    return canvasStore.temporal.getState().pastStates.length > 0;
  },

  canRedo: () => {
    const state = get();
    const canvasStore = state.tabCanvasStores.get(state.activeTabId || '');
    if (!canvasStore) return false;
    return canvasStore.temporal.getState().futureStates.length > 0;
  },

  undo: () => {
    const state = get();
    const canvasStore = state.tabCanvasStores.get(state.activeTabId || '');
    if (!canvasStore) return;

    // Set flag to prevent auto-save during undo
    set({ isUndoRedoOperation: true });

    // Perform undo
    canvasStore.temporal.getState().undo();
    
    // Sync with base tab
    const canvasState = canvasStore.getState();
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === state.activeTabId 
          ? { 
              ...tab, 
              nodes: canvasState.nodes,
              connections: canvasState.connections 
            } 
          : tab
      )
    }));

    // Clear flag after operation with longer delay to ensure stability
    setTimeout(() => {
      set({ isUndoRedoOperation: false });
    }, 100);
  },

  redo: () => {
    const state = get();
    const canvasStore = state.tabCanvasStores.get(state.activeTabId || '');
    if (!canvasStore) return;

    // Set flag to prevent auto-save during redo
    set({ isUndoRedoOperation: true });

    // Perform redo
    canvasStore.temporal.getState().redo();
    
    // Sync with base tab
    const canvasState = canvasStore.getState();
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === state.activeTabId 
          ? { 
              ...tab, 
              nodes: canvasState.nodes,
              connections: canvasState.connections 
            } 
          : tab
      )
    }));

    // Clear flag after operation with longer delay to ensure stability
    setTimeout(() => {
      set({ isUndoRedoOperation: false });
    }, 100);
  }
}));