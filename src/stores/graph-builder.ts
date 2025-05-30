import { create } from "zustand";
import { ParamNode, CardTemplate } from "@/types/graph-builder";

interface GraphState {
  nodes: ParamNode[];
  selectedNodeId: string | null;
  template: CardTemplate | null;
}

interface GraphBuilderStore extends GraphState {
  // History for undo/redo
  history: GraphState[];
  historyIndex: number;
  
  // History actions
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
    // Actions
  addNode: (node: Omit<ParamNode, 'id'>) => string;
  updateNode: (id: string, updates: Partial<ParamNode>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  setTemplate: (template: CardTemplate) => void;
  importGraph: (data: { nodes: ParamNode[]; template: CardTemplate }) => void;
  exportGraph: () => { nodes: ParamNode[]; template: CardTemplate | null };
  clearGraph: () => void;
  connectNodes: (sourceId: string, targetId: string, condition?: string) => void;
  disconnectNodes: (childId: string) => void;
}

export const useGraphBuilderStore = create<GraphBuilderStore>((set, get) => ({
  nodes: [],
  selectedNodeId: null,
  template: null,
  history: [],
  historyIndex: -1,

  // Helper function to save state to history
  saveToHistory: () => {
    const state = get();
    const currentState: GraphState = {
      nodes: state.nodes,
      selectedNodeId: state.selectedNodeId,
      template: state.template,
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
  addNode: (nodeData) => {
    get().saveToHistory();
    
    const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNode: ParamNode = {
      id,
      ...nodeData,
    };
    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
    return id;
  },

  updateNode: (id, updates) => {
    get().saveToHistory();
    
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    }));
  },

  deleteNode: (id) => {
    get().saveToHistory();
    
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id && node.parent_id !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
  },

  connectNodes: (sourceId: string, targetId: string, condition?: string) => {
    get().saveToHistory();
    
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === targetId 
          ? { ...node, parent_id: sourceId, condition: condition }
          : node
      ),
    }));
  },

  disconnectNodes: (childId: string) => {
    get().saveToHistory();
    
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === childId 
          ? { ...node, parent_id: undefined, condition: undefined }
          : node
      ),
    }));
  },

  selectNode: (id) => {
    set({ selectedNodeId: id });
  },

  setTemplate: (template) => {
    set({ template });
  },

  importGraph: (data) => {
    set({
      nodes: data.nodes,
      template: data.template,
      selectedNodeId: null,
    });
  },

  exportGraph: () => {
    const { nodes, template } = get();
    return { nodes, template };
  },

  clearGraph: () => {
    set({
      nodes: [],
      selectedNodeId: null,
      template: null,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const previousState = state.history[state.historyIndex - 1];
      set({
        ...previousState,
        historyIndex: state.historyIndex - 1,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const nextState = state.history[state.historyIndex + 1];
      set({
        ...nextState,
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
}));
