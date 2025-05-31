import { LayoutAlgorithm } from '../types';
import { dagreLayoutAlgorithm } from './dagre';
import { elkLayoutAlgorithm } from './elk';
import { d3HierarchyLayoutAlgorithm } from './d3-hierarchy';

export const AVAILABLE_ALGORITHMS: LayoutAlgorithm[] = [
  dagreLayoutAlgorithm,
  elkLayoutAlgorithm,
  d3HierarchyLayoutAlgorithm,
];

export const ALGORITHM_MAP = new Map<string, LayoutAlgorithm>(
  AVAILABLE_ALGORITHMS.map(algorithm => [algorithm.name.toLowerCase(), algorithm])
);

export function getLayoutAlgorithm(name: string): LayoutAlgorithm | undefined {
  return ALGORITHM_MAP.get(name.toLowerCase());
}

export function getDefaultAlgorithm(): LayoutAlgorithm {
  return dagreLayoutAlgorithm;
}

export * from './dagre';
export * from './elk';
export * from './d3-hierarchy'; 