import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from '@xyflow/react';
import { LayoutOptions, LayoutAlgorithm } from '../types';

const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 100;

class ElkLayoutAlgorithm implements LayoutAlgorithm {
  name = 'ELK';
  private elk = new ELK();

  async apply(
    nodes: Node[], 
    edges: Edge[], 
    options: Partial<LayoutOptions> = {}
  ): Promise<{ nodes: Node[]; edges: Edge[] }> {
    const elkGraph = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'org.eclipse.elk.layered',
        'elk.direction': this.mapDirection(options.direction || 'TB'),
        'elk.layered.spacing.nodeNodeBetweenLayers': String(options.rankSpacing || 150),
        'elk.spacing.nodeNode': String(options.nodeSpacing || 100),
        'elk.alignment': this.mapAlignment(options.align || 'UL'),
        'elk.padding': '[top=25,left=25,bottom=25,right=25]',
      },
      children: nodes.map((node) => ({
        id: node.id,
        width: node.measured?.width || node.width || DEFAULT_NODE_WIDTH,
        height: node.measured?.height || node.height || DEFAULT_NODE_HEIGHT,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target],
      })),
    };

    try {
      const layoutedGraph = await this.elk.layout(elkGraph);
      
      const layoutedNodes = nodes.map((node) => {
        const elkNode = layoutedGraph.children?.find((n) => n.id === node.id);
        
        return {
          ...node,
          position: {
            x: elkNode?.x || 0,
            y: elkNode?.y || 0,
          },
        };
      });

      return {
        nodes: layoutedNodes,
        edges,
      };
    } catch (error) {
      console.error('ELK layout failed:', error);
      // Fallback to original positions
      return { nodes, edges };
    }
  }

  private mapDirection(direction: string): string {
    switch (direction) {
      case 'TB': return 'DOWN';
      case 'BT': return 'UP';
      case 'LR': return 'RIGHT';
      case 'RL': return 'LEFT';
      default: return 'DOWN';
    }
  }

  private mapAlignment(align: string): string {
    switch (align) {
      case 'UL': return 'LEFT';
      case 'UR': return 'RIGHT';
      case 'DL': return 'LEFT';
      case 'DR': return 'RIGHT';
      default: return 'LEFT';
    }
  }
}

export const elkLayoutAlgorithm = new ElkLayoutAlgorithm(); 