import { ParamNode, NodeConnection } from './graph-builder';

export interface Template {
  id: string;
  name: string;
  version: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  metrics: MetricTab[];
}

export interface MetricTab {
  id: string;
  name: string;
  nodes: ParamNode[];
  connections: NodeConnection[];
  position: { x: number; y: number; zoom: number };
}

export interface TemplateExport {
  template: Template;
}
