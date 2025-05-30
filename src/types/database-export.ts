import { z } from 'zod';

// Database export schema that matches the relational database structure
export const DatabaseExportSchema = z.object({
  version: z.string(),
  exported_at: z.string(),
  param_types: z.array(z.object({
    id: z.number(),
    code: z.string(),
    storage: z.string(),
    widget: z.string()
  })),
  param_nodes: z.array(z.object({
    id: z.string(),
    key: z.string(),
    label_json: z.record(z.string()),
    type_id: z.number(),
    parent_id: z.string().nullable(),
    condition: z.string().nullable(),
    order: z.number(),
    help_json: z.record(z.string()).optional(),
    meta_json: z.record(z.unknown()).optional()
  })),
  card_templates: z.array(z.object({
    id: z.number(),
    code: z.string(),
    root_id: z.string(),
    metric: z.string(),
    version: z.number(),
    title_template: z.string().optional(),
    description_template: z.string().optional(),
    icon_default: z.string().optional()
  }))
});

export type DatabaseExport = z.infer<typeof DatabaseExportSchema>;

// Card instance data structure for complete examples
export const CardInstanceSchema = z.object({
  id: z.number(),
  template_id: z.number(),
  user_id: z.number(),
  name: z.string(),
  created_at: z.string(),
  favorite: z.boolean()
});

export const CardParamValueSchema = z.object({
  card_id: z.number(),
  param_node_id: z.string(),
  value: z.string()
});

export const CompleteExportSchema = DatabaseExportSchema.extend({
  card_instances: z.array(CardInstanceSchema).optional(),
  card_param_values: z.array(CardParamValueSchema).optional()
});

export type CardInstance = z.infer<typeof CardInstanceSchema>;
export type CardParamValue = z.infer<typeof CardParamValueSchema>;
export type CompleteExport = z.infer<typeof CompleteExportSchema>; 