export interface ParamType {
  id: number;
  code: string;
  storage: string;
  widget: string;
}

export interface EnumOption {
  id: string; // ID universel (ex: "global", "subject", "custom_subject")
  label_json: Record<string, string>; // Localisation {"fr": "Global", "en": "Global"}
  value?: string; // Valeur technique optionnelle
}

// Meta JSON types for different parameter types
export interface EnumMeta {
  enumOptions?: EnumOption[];
}

export interface NumberMeta {
  min?: number;
  max?: number;
  step?: number;
}

export interface ReferenceMeta {
  referenceEntity?: string;
}

export interface StringMeta {
  maxLength?: number;
  pattern?: string;
  multiline?: boolean;
}

export interface ValidationMeta {
  required?: boolean;
  defaultValue?: string;
  placeholder?: {
    fr?: string;
    en?: string;
  };
}

export type ParamMetaJson = EnumMeta & NumberMeta & ReferenceMeta & StringMeta & ValidationMeta & Record<string, unknown>;

export interface ParamNode {
  id: string;
  key: string;
  label_json: Record<string, string>;
  type_id: number;
  variableKey?: string;
  parent_id?: string;
  condition?: string; // JSON-Logic
  order: number; // Ordre d'affichage dans le formulaire (0 = premier)
  help_json?: Record<string, string>;
  meta_json?: ParamMetaJson;
  position: { x: number; y: number };
}

export interface CardTemplate {
  id?: number;
  code: string;
  root_id: string;
  metric: string;
  version: number;
}

export interface GraphBuilderState {
  nodes: ParamNode[];
  selectedNodeId?: string;
  template?: CardTemplate;
}

export interface NodeConnection {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export const PARAM_TYPES: ParamType[] = [
  { id: 1, code: 'integer', storage: 'INT', widget: 'number' },
  { id: 2, code: 'float', storage: 'REAL', widget: 'number' },
  { id: 3, code: 'string', storage: 'TEXT', widget: 'text' },
  { id: 4, code: 'enum', storage: 'TEXT', widget: 'select' },
  { id: 5, code: 'date', storage: 'DATE', widget: 'date-picker' },
  { id: 6, code: 'boolean', storage: 'INT(1)', widget: 'switch' },
  { id: 7, code: 'reference', storage: 'INT FK', widget: 'autocomplete' },
  { id: 8, code: 'range', storage: 'JSON', widget: 'double-slider' },
  { id: 9, code: 'color', storage: 'TEXT', widget: 'color-picker' },
  { id: 10, code: 'icon', storage: 'TEXT', widget: 'icon-picker' },
];

export const CATALOG_EXAMPLE = {
  metrics: {
    mean: {
      labels: { fr: "Moyenne", en: "Mean" },
      allowedScopes: ["global", "subject", "custom_subject"],
      allowedWindows: ["all_time", "period", "last_n_days", "last_n_notes"],
      qualifiers: ["min", "max", "positive"],
      extraParams: []
    },
    count_gt: {
      labels: { fr: "Nb de notes > seuil", en: "Count > threshold" },
      allowedScopes: ["global", "subject", "custom_subject"],
      allowedWindows: ["all_time", "period", "last_n_days"],
      qualifiers: ["cumulative", "consecutive"],
      extraParams: [
        { key: "threshold", type: "float", label: { fr: "Seuil", en: "Threshold" } }
      ]
    }
  },
  windows: {
    period: {
      labels: { fr: "Période", en: "Period" },
      fields: [
        { key: "start", type: "date" },
        { key: "end", type: "date" }
      ]
    },
    last_n_days: {
      labels: { fr: "N derniers jours", en: "Last N days" },
      fields: [{ key: "n", type: "integer", min: 1 }]
    }
  },
  scopes: {
    subject: {
      labels: { fr: "Matière", en: "Subject" },
      fields: [{ key: "subject_id", type: "reference:Subject" }]
    }
  }
};
