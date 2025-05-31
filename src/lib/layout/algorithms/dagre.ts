import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';
import { LayoutOptions, LayoutAlgorithm } from '../types';

const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 100;

class DagreLayoutAlgorithm implements LayoutAlgorithm {
  name = 'Dagre';

  async apply(
    nodes: Node[], 
    edges: Edge[], 
    options: Partial<LayoutOptions> = {}
  ): Promise<{ nodes: Node[]; edges: Edge[] }> {
    const dagreGraph = new dagre.graphlib.Graph();
    
    // Set graph options
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
      rankdir: options.direction || 'TB',
      align: options.align || 'UL',
      nodesep: options.nodeSpacing || 100,
      ranksep: options.rankSpacing || 150,
      marginx: 20,
      marginy: 20,
    });

    // Add nodes to dagre graph
    nodes.forEach((node) => {
      const width = node.measured?.width || node.width || DEFAULT_NODE_WIDTH;
      const height = node.measured?.height || node.height || DEFAULT_NODE_HEIGHT;
      
      dagreGraph.setNode(node.id, {
        width,
        height,
      });
    });

    // Add edges to dagre graph
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // Apply layout
    dagre.layout(dagreGraph);

    // Update node positions based on dagre layout
    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - (nodeWithPosition.width || DEFAULT_NODE_WIDTH) / 2,
          y: nodeWithPosition.y - (nodeWithPosition.height || DEFAULT_NODE_HEIGHT) / 2,
        },
      };
    });

    return {
      nodes: layoutedNodes,
      edges,
    };
  }
}

export const dagreLayoutAlgorithm = new DagreLayoutAlgorithm(); 