import { hierarchy, tree } from 'd3-hierarchy';
import { Node, Edge } from '@xyflow/react';
import { LayoutOptions, LayoutAlgorithm } from '../types';


interface TreeNode {
  id: string;
  children?: TreeNode[];
  data: Node;
}

class D3HierarchyLayoutAlgorithm implements LayoutAlgorithm {
  name = 'D3 Hierarchy';

  async apply(
    nodes: Node[], 
    edges: Edge[], 
    options: Partial<LayoutOptions> = {}
  ): Promise<{ nodes: Node[]; edges: Edge[] }> {
    if (nodes.length === 0) {
      return { nodes, edges };
    }

    // Build tree structure from nodes and edges
    const treeData = this.buildTreeStructure(nodes, edges);
    
    if (!treeData) {
      // Fallback: arrange in a simple grid if no tree structure
      return this.fallbackGridLayout(nodes, edges, options);
    }

    // Create D3 hierarchy
    const root = hierarchy(treeData);

    // Apply tree layout
    const treeLayout = tree<TreeNode>()
      .nodeSize([
        options.nodeSpacing || 250,
        options.rankSpacing || 150
      ]);

    const layoutedRoot = treeLayout(root);

    // Extract positions and update nodes
    const positionMap = new Map<string, { x: number; y: number }>();
    
    layoutedRoot.each((d) => {
      let x = d.x;
      let y = d.y;

      // Transform coordinates based on direction
      if (options.direction === 'LR' || options.direction === 'RL') {
        [x, y] = [y, x]; // Swap for horizontal layout
      }
      
      if (options.direction === 'BT') {
        y = -y; // Flip for bottom-to-top
      }
      
      if (options.direction === 'RL') {
        x = -x; // Flip for right-to-left
      }

      positionMap.set(d.data.id, { x, y });
    });

    // Find bounding box and adjust to positive coordinates
    let minX = Infinity, minY = Infinity;
    positionMap.forEach(({ x, y }) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
    });

    const layoutedNodes = nodes.map((node) => {
      const position = positionMap.get(node.id);
      if (!position) {
        return node; // Keep original position if not found
      }

      return {
        ...node,
        position: {
          x: position.x - minX + 50, // Add padding
          y: position.y - minY + 50,
        },
      };
    });

    return {
      nodes: layoutedNodes,
      edges,
    };
  }

  private buildTreeStructure(nodes: Node[], edges: Edge[]): TreeNode | null {
    // Create a map of node id to node
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    
    // Create a map of parent to children
    const childrenMap = new Map<string, string[]>();
    const hasParent = new Set<string>();

    edges.forEach((edge) => {
      const parentId = edge.source;
      const childId = edge.target;
      
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(childId);
      hasParent.add(childId);
    });

    // Find root nodes (nodes with no parents)
    const rootNodes = nodes.filter(node => !hasParent.has(node.id));
    
    if (rootNodes.length === 0) {
      return null; // No tree structure found
    }

    // Use the first root node as the main root
    const rootNode = rootNodes[0];

    const buildTree = (nodeId: string): TreeNode => {
      const node = nodeMap.get(nodeId)!;
      const children = childrenMap.get(nodeId) || [];
      
      return {
        id: nodeId,
        data: node,
        children: children.length > 0 ? children.map(buildTree) : undefined,
      };
    };

    return buildTree(rootNode.id);
  }

  private async fallbackGridLayout(
    nodes: Node[], 
    edges: Edge[], 
    options: Partial<LayoutOptions>
  ): Promise<{ nodes: Node[]; edges: Edge[] }> {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const spacing = options.nodeSpacing || 250;

    const layoutedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % cols) * spacing,
        y: Math.floor(index / cols) * spacing,
      },
    }));

    return { nodes: layoutedNodes, edges };
  }
}

export const d3HierarchyLayoutAlgorithm = new D3HierarchyLayoutAlgorithm(); 