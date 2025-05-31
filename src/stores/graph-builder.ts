import { create } from "zustand";
import { temporal } from 'zundo';
import { ParamNode, CardTemplate } from "@/types/graph-builder";

interface GraphState {
  nodes: ParamNode[];
  selectedNodeId: string | null;
  template: CardTemplate | null;
}

interface GraphBuilderStore extends GraphState {
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
  
  // Undo/redo operations
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
}

const useGraphBuilderStore = create<GraphBuilderStore>()(
  temporal(
    (set, get) => ({
      nodes: [] as ParamNode[],
      selectedNodeId: null,
      template: null,

      addNode: (node: Omit<ParamNode, 'id'>) => {
        const newNodeId = `node_${Date.now()}`;
        const newNode: ParamNode = { id: newNodeId, ...node };

        set((state) => ({
          nodes: [...state.nodes, newNode],
        }));

        return newNodeId;
      },

      updateNode: (id: string, updates: Partial<ParamNode>) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id ? { ...node, ...updates } : node
          ),
        }));
      },

      deleteNode: (id: string) => {
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== id),
        }));
      },

      connectNodes: (sourceId: string, targetId: string, condition?: string) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === targetId
              ? { ...node, parent_id: sourceId, condition }
              : node
          ),
        }));
      },

      disconnectNodes: (childId: string) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === childId 
              ? { ...node, parent_id: undefined, condition: undefined }
              : node
          ),
        }));
      },

      selectNode: (id) => {
        // Don't track selection changes in history
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

      // Undo/redo operations using zundo
      canUndo: (): boolean => {
        try {
          return useGraphBuilderStore.temporal.getState().pastStates.length > 0;
        } catch {
          return false;
        }
      },

      canRedo: (): boolean => {
        try {
          return useGraphBuilderStore.temporal.getState().futureStates.length > 0;
        } catch {
          return false;
        }
      },

      undo: () => {
        try {
          useGraphBuilderStore.temporal.getState().undo();
        } catch (error) {
          console.warn('Undo failed:', error);
        }
      },

      redo: () => {
        try {
          useGraphBuilderStore.temporal.getState().redo();
        } catch (error) {
          console.warn('Redo failed:', error);
        }
      },
    }),
    {
      limit: 50,
      partialize: (state: GraphBuilderStore) => {
        // Only track nodes and template, not selection
        const { nodes, template } = state;
        return { nodes, template };
      },
      onSave: (pastState: GraphBuilderStore, currentState: GraphBuilderStore) => {
        // Don't create history entries for identical states
        if (pastState && currentState) {
          const pastNodes = JSON.stringify(pastState.nodes);
          const pastTemplate = JSON.stringify(pastState.template);
          const currentNodes = JSON.stringify(currentState.nodes);
          const currentTemplate = JSON.stringify(currentState.template);
          
          return pastNodes !== currentNodes || pastTemplate !== currentTemplate;
        }
        return true;
      }
    }
  )
);

export { useGraphBuilderStore };
