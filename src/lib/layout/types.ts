import { Node, Edge } from '@xyflow/react';

export interface LayoutOptions {
  direction: 'TB' | 'BT' | 'LR' | 'RL';
  nodeSpacing: number;
  rankSpacing: number;
  align?: 'UL' | 'UR' | 'DL' | 'DR';
}

export interface LayoutAlgorithm {
  name: string;
  apply: (nodes: Node[], edges: Edge[], options?: Partial<LayoutOptions>) => Promise<{ nodes: Node[]; edges: Edge[] }>;
}

export interface AutoLayoutState {
  algorithm: string;
  options: LayoutOptions;
  isApplying: boolean;
}

export interface NodeDimensions {
  width: number;
  height: number;
}

export const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
  direction: 'TB',
  nodeSpacing: 100,
  rankSpacing: 150,
  align: 'UL'
}; 