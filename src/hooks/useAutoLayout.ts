import { useCallback, useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useGraphBuilderStore } from '@/stores/graph-builder';
import { useMultiTabGraphBuilderStore } from '@/stores/multi-tab-graph-builder';
import { 
  LayoutOptions, 
  AutoLayoutState, 
  DEFAULT_LAYOUT_OPTIONS 
} from '@/lib/layout/types';
import { 
  getLayoutAlgorithm, 
  getDefaultAlgorithm 
} from '@/lib/layout/algorithms';
import { toast } from 'sonner';

interface UseAutoLayoutProps {
  tabMode?: boolean;
}

export function useAutoLayout({ tabMode = false }: UseAutoLayoutProps = {}) {
  const singleTabStore = useGraphBuilderStore();
  const multiTabStore = useMultiTabGraphBuilderStore();

  const [layoutState, setLayoutState] = useState<AutoLayoutState>({
    algorithm: 'dagre',
    options: DEFAULT_LAYOUT_OPTIONS,
    isApplying: false,
  });

  // Get current nodes and edges based on tab mode
  const getCurrentData = useCallback((): { nodes: Node[]; edges: Edge[] } => {
    if (tabMode) {
      const activeTab = multiTabStore.getActiveTab();
      const nodes = (activeTab?.nodes || []).map(node => ({
        id: node.id,
        type: 'paramNode',
        position: node.position,
        data: node as unknown as Record<string, unknown>,
        measured: {
          width: 200, // Default width since ParamNode doesn't have width/height
          height: 100, // Default height
        },
      })) as Node[];

      const edges = (activeTab?.connections || []).map(connection => ({
        id: connection.id,
        source: connection.source,
        target: connection.target,
        type: 'floating',
        animated: true,
        data: { condition: connection.condition },
      })) as Edge[];

      return { nodes, edges };
    } else {
      const nodes = singleTabStore.nodes.map(node => ({
        id: node.id,
        type: 'paramNode',
        position: node.position,
        data: node as unknown as Record<string, unknown>,
        measured: {
          width: 200, // Default width since ParamNode doesn't have width/height
          height: 100, // Default height
        },
      })) as Node[];

      const edges = singleTabStore.nodes
        .filter(node => node.parent_id)
        .map(node => ({
          id: `edge-${node.parent_id}-${node.id}`,
          source: node.parent_id!,
          target: node.id,
          type: 'floating',
          animated: true,
          data: { condition: node.condition },
        })) as Edge[];

      return { nodes, edges };
    }
  }, [tabMode, singleTabStore.nodes, multiTabStore.tabs, multiTabStore.activeTabId]);

  // Update node positions in the appropriate store
  const updateNodePositions = useCallback((layoutedNodes: Node[]) => {
    if (tabMode) {
      layoutedNodes.forEach(node => {
        multiTabStore.updateNodeInActiveTab(node.id, { 
          position: node.position 
        });
      });
    } else {
      layoutedNodes.forEach(node => {
        singleTabStore.updateNode(node.id, { 
          position: node.position 
        });
      });
    }
  }, [tabMode, singleTabStore.updateNode, multiTabStore.updateNodeInActiveTab]);

  // Apply auto layout
  const applyLayout = useCallback(async (
    algorithmName?: string,
    options?: Partial<LayoutOptions>
  ) => {
    const { nodes, edges } = getCurrentData();
    
    if (nodes.length === 0) {
      toast.info('No nodes to layout');
      return;
    }

    setLayoutState(prev => ({ ...prev, isApplying: true }));

    try {
      const algorithm = algorithmName 
        ? getLayoutAlgorithm(algorithmName) || getDefaultAlgorithm()
        : getDefaultAlgorithm();

      const mergedOptions = { ...layoutState.options, ...options };
      
      const { nodes: layoutedNodes } = await algorithm.apply(
        nodes,
        edges,
        mergedOptions
      );

      updateNodePositions(layoutedNodes);
      
      setLayoutState(prev => ({
        ...prev,
        algorithm: algorithm.name.toLowerCase(),
        options: mergedOptions,
        isApplying: false,
      }));

      toast.success(`Applied ${algorithm.name} layout`);
    } catch (error) {
      console.error('Layout failed:', error);
      toast.error('Failed to apply layout');
      setLayoutState(prev => ({ ...prev, isApplying: false }));
    }
  }, [getCurrentData, layoutState.options, updateNodePositions]);

  // Update layout options
  const updateLayoutOptions = useCallback((newOptions: Partial<LayoutOptions>) => {
    setLayoutState(prev => ({
      ...prev,
      options: { ...prev.options, ...newOptions },
    }));
  }, []);

  // Auto arrange nodes in a simple grid (fallback)
  const autoArrange = useCallback((spacing = 250) => {
    const { nodes } = getCurrentData();
    
    if (nodes.length === 0) return;

    const cols = Math.ceil(Math.sqrt(nodes.length));
    
    const arrangedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % cols) * spacing,
        y: Math.floor(index / cols) * spacing,
      },
    }));

    updateNodePositions(arrangedNodes);
    toast.success('Nodes arranged in grid');
  }, [getCurrentData, updateNodePositions]);

  return {
    layoutState,
    applyLayout,
    updateLayoutOptions,
    autoArrange,
    isApplying: layoutState.isApplying,
  };
} 