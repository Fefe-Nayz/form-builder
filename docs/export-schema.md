# Export Schema for Real App Integration

## Current vs Required Export Format

### Current Graph Builder Export

The current implementation exports a "template" format suitable for the graph builder:

```json
{
  "template": {
    "id": "template_1234567890",
    "name": "My Card Template",
    "version": "1.0.0",
    "description": "Description",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "metrics": [
      {
        "id": "metric_1",
        "name": "Mean Calculation",
        "nodes": [
          {
            "id": "node_1",
            "key": "scope",
            "label_json": { "fr": "Périmètre", "en": "Scope" },
            "type_id": 4,
            "parent_id": null,
            "condition": null,
            "order": 0,
            "meta_json": {
              "enumOptions": [
                {
                  "id": "global",
                  "label_json": { "fr": "Global", "en": "Global" }
                },
                {
                  "id": "subject",
                  "label_json": { "fr": "Matière", "en": "Subject" }
                }
              ]
            },
            "position": { "x": 100, "y": 100 }
          }
        ],
        "connections": [
          {
            "id": "edge_1",
            "source": "node_1",
            "target": "node_2",
            "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}"
          }
        ],
        "position": { "x": 0, "y": 0, "zoom": 1 }
      }
    ]
  }
}
```

### Required Database Schema Export for Real App

For the real application, we need to export in a format that matches the relational database schema:

```json
{
  "version": "1.0",
  "exported_at": "2024-01-01T00:00:00.000Z",
  "param_types": [
    { "id": 1, "code": "integer", "storage": "INT", "widget": "number" },
    { "id": 2, "code": "float", "storage": "REAL", "widget": "number" },
    { "id": 4, "code": "enum", "storage": "TEXT", "widget": "select" },
    {
      "id": 7,
      "code": "reference",
      "storage": "INT FK",
      "widget": "autocomplete"
    }
  ],
  "param_nodes": [
    {
      "id": "param_node_1",
      "key": "scope",
      "label_json": { "fr": "Périmètre", "en": "Scope" },
      "type_id": 4,
      "parent_id": null,
      "condition": null,
      "order": 0,
      "help_json": {
        "fr": "Choisissez le périmètre des données",
        "en": "Choose data scope"
      },
      "meta_json": {
        "enumOptions": [
          { "id": "global", "label_json": { "fr": "Global", "en": "Global" } },
          {
            "id": "subject",
            "label_json": { "fr": "Matière", "en": "Subject" }
          },
          {
            "id": "custom_subject",
            "label_json": {
              "fr": "Matières personnalisées",
              "en": "Custom subjects"
            }
          }
        ]
      }
    },
    {
      "id": "param_node_2",
      "key": "subject_id",
      "label_json": { "fr": "Matière", "en": "Subject" },
      "type_id": 7,
      "parent_id": "param_node_1",
      "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}",
      "order": 1,
      "meta_json": {
        "referenceEntity": "Subject"
      }
    },
    {
      "id": "param_node_3",
      "key": "window_type",
      "label_json": { "fr": "Fenêtre temporelle", "en": "Time window" },
      "type_id": 4,
      "parent_id": "param_node_1",
      "condition": null,
      "order": 2,
      "meta_json": {
        "enumOptions": [
          {
            "id": "all_time",
            "label_json": { "fr": "Toutes périodes", "en": "All time" }
          },
          { "id": "period", "label_json": { "fr": "Période", "en": "Period" } },
          {
            "id": "last_n_days",
            "label_json": { "fr": "N derniers jours", "en": "Last N days" }
          }
        ]
      }
    },
    {
      "id": "param_node_4",
      "key": "n_days",
      "label_json": { "fr": "Nombre de jours", "en": "Number of days" },
      "type_id": 1,
      "parent_id": "param_node_3",
      "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}",
      "order": 1,
      "meta_json": { "min": 1, "max": 365 }
    }
  ],
  "card_templates": [
    {
      "id": 1,
      "code": "mean_basic",
      "root_id": "param_node_1",
      "metric": "mean",
      "version": 1,
      "title_template": "Moyenne {{#if subjectLabel}}de {{subjectLabel}}{{else}}générale{{/if}}",
      "description_template": "Votre moyenne est de {{value}}/20 sur {{windowLabel}}",
      "icon_default": "mdi:calculator"
    }
  ]
}
```

## Implementation Steps

### 1. Add Database Export Function

Create a new export function that converts the graph builder format to database schema format:

```typescript
// In stores/template-store.ts
exportForDatabase: (templateId: string) => DatabaseExport | null => {
  const template = get().templates.find(t => t.id === templateId);
  if (!template) return null;

  const dbExport: DatabaseExport = {
    version: "1.0",
    exported_at: new Date().toISOString(),
    param_types: PARAM_TYPES,
    param_nodes: [],
    card_templates: []
  };

  // Convert each metric to a card template
  template.metrics.forEach((metric, index) => {
    // Flatten nodes and remove position data
    const paramNodes = metric.nodes.map(node => ({
      id: node.id,
      key: node.key,
      label_json: node.label_json,
      type_id: node.type_id,
      parent_id: node.parent_id || null,
      condition: node.condition || null,
      order: node.order,
      help_json: node.help_json,
      meta_json: node.meta_json
    }));

    dbExport.param_nodes.push(...paramNodes);

    // Create card template
    const rootNode = paramNodes.find(n => !n.parent_id);
    if (rootNode) {
      dbExport.card_templates.push({
        id: index + 1,
        code: metric.name.toLowerCase().replace(/\s+/g, '_'),
        root_id: rootNode.id,
        metric: metric.name.toLowerCase(),
        version: 1,
        title_template: `{{metricLabel}}`,
        description_template: "Valeur: {{value}}",
        icon_default: "mdi:chart-line"
      });
    }
  });

  return dbExport;
}
```

### 2. Add Card Instance Generation

For the real app, we also need to be able to generate example `card_instance` and `card_param_value` data:

```json
{
  "card_instances": [
    {
      "id": 42,
      "template_id": 1,
      "user_id": 123,
      "name": "Ma moyenne de maths",
      "created_at": "2024-01-01T00:00:00.000Z",
      "favorite": false
    }
  ],
  "card_param_values": [
    {
      "card_id": 42,
      "param_node_id": "param_node_1",
      "value": "subject"
    },
    {
      "card_id": 42,
      "param_node_id": "param_node_2",
      "value": "17"
    },
    {
      "card_id": 42,
      "param_node_id": "param_node_3",
      "value": "last_n_days"
    },
    {
      "card_id": 42,
      "param_node_id": "param_node_4",
      "value": "30"
    }
  ]
}
```

### 3. Validation Schema

Add Zod schemas to validate the export format:

```typescript
import { z } from "zod";

export const DatabaseExportSchema = z.object({
  version: z.string(),
  exported_at: z.string(),
  param_types: z.array(
    z.object({
      id: z.number(),
      code: z.string(),
      storage: z.string(),
      widget: z.string(),
    })
  ),
  param_nodes: z.array(
    z.object({
      id: z.string(),
      key: z.string(),
      label_json: z.record(z.string()),
      type_id: z.number(),
      parent_id: z.string().nullable(),
      condition: z.string().nullable(),
      order: z.number(),
      help_json: z.record(z.string()).optional(),
      meta_json: z.record(z.unknown()).optional(),
    })
  ),
  card_templates: z.array(
    z.object({
      id: z.number(),
      code: z.string(),
      root_id: z.string(),
      metric: z.string(),
      version: z.number(),
      title_template: z.string().optional(),
      description_template: z.string().optional(),
      icon_default: z.string().optional(),
    })
  ),
});

export type DatabaseExport = z.infer<typeof DatabaseExportSchema>;
```

## Usage in Real App

The exported data can then be imported into the real application's database:

1. **Migration script** reads the JSON and inserts into Turso/SQLite
2. **API endpoints** serve the param_nodes and card_templates
3. **Form generator** reads from database and renders forms using the same logic
4. **Card instances** are created by users and stored with proper foreign keys

This ensures the form builder tool and the real application share the same data model and rendering logic.
