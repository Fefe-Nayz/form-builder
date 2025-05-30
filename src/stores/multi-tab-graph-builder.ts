import { create } from 'zustand';
import { ParamNode, NodeConnection } from '@/types/graph-builder';

export interface GraphTab {
  id: string;
  name: string;
  nodes: ParamNode[];
  connections: NodeConnection[];
  selectedNodeId: string | null;
  position: { x: number; y: number; zoom: number };
}

interface TabHistory {
  tabStates: GraphTab[];
  historyIndex: number;
}

interface MultiTabGraphBuilderStore {
  tabs: GraphTab[];
  activeTabId: string | null;
  history: TabHistory[];
  historyIndex: number;
  
  // History actions
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Tab management
  createTab: (name?: string) => string;
  deleteTab: (tabId: string) => void;
  renameTab: (tabId: string, name: string) => void;
  setActiveTab: (tabId: string) => void;
  importGraph: (tabId: string, data: { nodes: ParamNode[], connections: NodeConnection[], position?: { x: number; y: number; zoom: number } }) => void;
  
  // Active tab operations
  getActiveTab: () => GraphTab | null;
  updateActiveTab: (updates: Partial<Omit<GraphTab, 'id'>>) => void;
  
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
}

export const useMultiTabGraphBuilderStore = create<MultiTabGraphBuilderStore>((set, get) => ({
  tabs: [],
  activeTabId: null,
  history: [],
  historyIndex: -1,

  // Helper function to save state to history
  saveToHistory: () => {
    const state = get();
    const currentState = {
      tabStates: [...state.tabs],
      historyIndex: -1
    };
    
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(currentState);
    
    // Limit history to 50 items
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      set({ historyIndex: state.historyIndex + 1 });
    }
    
    set({ history: newHistory });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const previousState = state.history[state.historyIndex - 1];
      set({
        tabs: [...previousState.tabStates],
        historyIndex: state.historyIndex - 1,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const nextState = state.history[state.historyIndex + 1];
      set({
        tabs: [...nextState.tabStates],
        historyIndex: state.historyIndex + 1,
      });
    }
  },

  canUndo: () => {
    const state = get();
    return state.historyIndex > 0;
  },

  canRedo: () => {
    const state = get();
    return state.historyIndex < state.history.length - 1;
  },

  createTab: (name?: string) => {
    get().saveToHistory();
    
    const newTabId = `tab_${Date.now()}`;
    const newTab: GraphTab = {
      id: newTabId,
      name: name || `Métrique ${get().tabs.length + 1}`,
      nodes: [],
      connections: [],
      selectedNodeId: null,
      position: { x: 0, y: 0, zoom: 1 }
    };

    set(state => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTabId
    }));

    return newTabId;
  },

  deleteTab: (tabId: string) => {
    get().saveToHistory();
    
    set(state => {
      const newTabs = state.tabs.filter(tab => tab.id !== tabId);
      const newActiveTabId = state.activeTabId === tabId 
        ? (newTabs.length > 0 ? newTabs[0].id : null)
        : state.activeTabId;

      return {
        tabs: newTabs,
        activeTabId: newActiveTabId
      };
    });
  },

  renameTab: (tabId: string, name: string) => {
    get().saveToHistory();
    
    // Ensure name is always a string
    const safeName = String(name || '');
    
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === tabId ? { ...tab, name: safeName } : tab
      )
    }));
  },

  setActiveTab: (tabId: string) => {
    set({ activeTabId: tabId });
  },

  importGraph: (tabId: string, data: { nodes: ParamNode[], connections: NodeConnection[], position?: { x: number; y: number; zoom: number } }) => {
    get().saveToHistory();
    
    set(state => ({
      tabs: state.tabs.map(tab =>
        tab.id === tabId ? {
          ...tab,
          nodes: data.nodes,
          connections: data.connections,
          position: data.position || tab.position
        } : tab
      )
    }));
  },

  getActiveTab: () => {
    const state = get();
    return state.tabs.find(tab => tab.id === state.activeTabId) || null;
  },

  updateActiveTab: (updates: Partial<Omit<GraphTab, 'id'>>) => {
    const state = get();
    if (!state.activeTabId) return;

    set(state => ({
      tabs: state.tabs.map(tab =>
        tab.id === state.activeTabId ? { ...tab, ...updates } : tab
      )
    }));
  },

  addNodeToActiveTab: (node: Omit<ParamNode, 'id'>) => {
    get().saveToHistory();
    
    const nodeId = `node_${Date.now()}`;
    const newNode: ParamNode = { ...node, id: nodeId };

    get().updateActiveTab({
      nodes: [...(get().getActiveTab()?.nodes || []), newNode]
    });

    return nodeId;
  },

  updateNodeInActiveTab: (nodeId: string, updates: Partial<ParamNode>) => {
    get().saveToHistory();
    
    const activeTab = get().getActiveTab();
    if (!activeTab) return;

    get().updateActiveTab({
      nodes: activeTab.nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    });
  },

  deleteNodeFromActiveTab: (nodeId: string) => {
    get().saveToHistory();
    
    const activeTab = get().getActiveTab();
    if (!activeTab) return;

    get().updateActiveTab({
      nodes: activeTab.nodes.filter(node => node.id !== nodeId),
      connections: activeTab.connections.filter(
        conn => conn.source !== nodeId && conn.target !== nodeId
      ),
      selectedNodeId: activeTab.selectedNodeId === nodeId ? null : activeTab.selectedNodeId
    });
  },

  addConnectionToActiveTab: (connection: Omit<NodeConnection, 'id'>) => {
    get().saveToHistory();
    
    const connectionId = `conn_${Date.now()}`;
    const newConnection: NodeConnection = { ...connection, id: connectionId };

    get().updateActiveTab({
      connections: [...(get().getActiveTab()?.connections || []), newConnection]
    });

    return connectionId;
  },

  deleteConnectionFromActiveTab: (connectionId: string) => {
    get().saveToHistory();
    
    const activeTab = get().getActiveTab();
    if (!activeTab) return;

    get().updateActiveTab({
      connections: activeTab.connections.filter(conn => conn.id !== connectionId)
    });
  },

  setSelectedNodeInActiveTab: (nodeId: string | null) => {
    get().updateActiveTab({ selectedNodeId: nodeId });
  },

  updateViewportInActiveTab: (position: { x: number; y: number; zoom: number }) => {
    get().updateActiveTab({ position });
  }
}));