# Real App Integration Guide

## Overview

The form builder now exports data in multiple formats to facilitate integration with your real grades management application. This guide explains how to use each export format and implement the dynamic form system in your production app.

## Export Formats Available

### 1. **App Integration Export** (🟢 Recommended for Production)

- **File**: `app_integration_[template_name]_v[version].json`
- **Contents**: Complete package for real app integration
- **Use Case**: Full production deployment

### 2. **Database Export**

- **File**: `db_export_[template_name]_v[version].json`
- **Contents**: Relational database schema
- **Use Case**: Database migration only

### 3. **Complete Example Export**

- **File**: `complete_example_[template_name]_v[version].json`
- **Contents**: Database schema + sample data
- **Use Case**: Testing and development

## App Integration Export Structure

```json
{
  "database_export": {
    "version": "1.0",
    "exported_at": "2024-01-15T10:30:00.000Z",
    "param_types": [...],
    "param_nodes": [...],
    "card_templates": [...]
  },
  "form_definitions": [
    {
      "id": "form_mean_basic",
      "template_id": 1,
      "form_steps": [...],
      "validation_rules": [...]
    }
  ],
  "sample_instances": [...],
  "sample_values": [...],
  "migration_notes": "..."
}
```

## Implementation Steps

### Step 1: Database Setup

```sql
-- Create the core tables
CREATE TABLE param_type (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  storage TEXT NOT NULL,
  widget TEXT NOT NULL
);

CREATE TABLE param_node (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,
  label_json TEXT NOT NULL, -- JSON object
  type_id INTEGER NOT NULL,
  parent_id TEXT NULL,
  condition TEXT NULL, -- JSON-Logic condition
  order_field INTEGER NOT NULL,
  help_json TEXT NULL,
  meta_json TEXT NULL,
  FOREIGN KEY (type_id) REFERENCES param_type(id),
  FOREIGN KEY (parent_id) REFERENCES param_node(id) ON DELETE CASCADE
);

CREATE TABLE card_template (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  root_id TEXT NOT NULL,
  metric TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  title_template TEXT,
  description_template TEXT,
  icon_default TEXT,
  FOREIGN KEY (root_id) REFERENCES param_node(id)
);

CREATE TABLE card_instance (
  id INTEGER PRIMARY KEY,
  template_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  favorite BOOLEAN DEFAULT FALSE,
  ui_json TEXT, -- JSON object for custom UI settings
  FOREIGN KEY (template_id) REFERENCES card_template(id) ON DELETE CASCADE
);

CREATE TABLE card_param_value (
  card_id INTEGER NOT NULL,
  param_node_id TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (card_id, param_node_id),
  FOREIGN KEY (card_id) REFERENCES card_instance(id) ON DELETE CASCADE,
  FOREIGN KEY (param_node_id) REFERENCES param_node(id) ON DELETE CASCADE
);
```

### Step 2: Import Data

```typescript
// Example using Drizzle ORM
async function importFormBuilderData(appIntegrationData: AppIntegration) {
  const { database_export } = appIntegrationData;

  // 1. Import param_types
  await db.insert(paramTypeTable).values(database_export.param_types);

  // 2. Import param_nodes (order matters due to parent_id references)
  const sortedNodes = topologicalSort(database_export.param_nodes);
  await db.insert(paramNodeTable).values(sortedNodes);

  // 3. Import card_templates
  await db.insert(cardTemplateTable).values(database_export.card_templates);

  console.log("Form builder data imported successfully!");
}

function topologicalSort(nodes: ParamNode[]): ParamNode[] {
  const sorted: ParamNode[] = [];
  const visited = new Set<string>();

  function visit(nodeId: string | null) {
    if (!nodeId || visited.has(nodeId)) return;

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Visit parent first
    if (node.parent_id) {
      visit(node.parent_id);
    }

    visited.add(nodeId);
    sorted.push(node);
  }

  // Start with root nodes
  nodes.filter((n) => !n.parent_id).forEach((n) => visit(n.id));

  return sorted;
}
```

### Step 3: Dynamic Form Rendering

```typescript
// Form renderer component
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as JsonLogic from "json-logic-js";

interface DynamicFormProps {
  templateId: number;
  onSubmit: (data: Record<string, any>) => void;
}

export function DynamicForm({ templateId, onSubmit }: DynamicFormProps) {
  const { nodes, template } = useCardTemplate(templateId);
  const form = useForm({
    resolver: zodResolver(buildValidationSchema(nodes)),
  });

  const formData = form.watch();

  // Get visible nodes based on conditions
  const getVisibleNodes = (parentId: string | null = null) => {
    return nodes
      .filter((node) => node.parent_id === parentId)
      .filter((node) => {
        if (!node.condition) return true;
        try {
          const condition = JSON.parse(node.condition);
          return JsonLogic.apply(condition, formData);
        } catch {
          return true;
        }
      })
      .sort((a, b) => a.order - b.order);
  };

  const renderField = (node: ParamNode) => {
    const widget = getWidgetForType(node.type_id);
    const label =
      JSON.parse(node.label_json).fr || JSON.parse(node.label_json).en;

    return (
      <div key={node.id} className="space-y-2">
        <FormField
          control={form.control}
          name={node.key}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>{widget({ ...field, node })}</FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Render children */}
        <div className="ml-4 space-y-4">
          {getVisibleNodes(node.id).map(renderField)}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {getVisibleNodes().map(renderField)}
      <Button type="submit">Create Card</Button>
    </form>
  );
}
```

### Step 4: Widget Implementations

```typescript
function getWidgetForType(typeId: number) {
  const widgets = {
    1: NumberInput, // integer
    2: NumberInput, // float
    3: TextInput, // string
    4: SelectInput, // enum
    5: DatePicker, // date
    6: Checkbox, // boolean
    7: ReferenceSelect, // reference
    8: RangeSlider, // range
    9: ColorPicker, // color
    10: IconPicker, // icon
  };

  return widgets[typeId] || TextInput;
}

// Example widget implementations
function SelectInput({ value, onChange, node }: WidgetProps) {
  const options = node.meta_json?.enumOptions || [];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Sélectionnez..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((option: any) => (
          <SelectItem key={option.id} value={option.id}>
            {option.label_json.fr || option.label_json.en}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ReferenceSelect({ value, onChange, node }: WidgetProps) {
  const entity = node.meta_json?.referenceEntity;
  const { data: options } = useQuery({
    queryKey: ["reference", entity],
    queryFn: () => fetchReferenceOptions(entity),
  });

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={`Sélectionner ${entity}...`} />
      </SelectTrigger>
      <SelectContent>
        {options?.map((option: any) => (
          <SelectItem key={option.id} value={option.id.toString()}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### Step 5: Card Instance Management

```typescript
// API endpoints for card management
export async function createCardInstance(data: {
  templateId: number;
  userId: number;
  name: string;
  formData: Record<string, any>;
  uiSettings?: Record<string, any>;
}) {
  // 1. Create card instance
  const [cardInstance] = await db
    .insert(cardInstanceTable)
    .values({
      template_id: data.templateId,
      user_id: data.userId,
      name: data.name,
      ui_json: JSON.stringify(data.uiSettings || {}),
    })
    .returning();

  // 2. Save form values
  const paramValues = Object.entries(data.formData).map(([key, value]) => ({
    card_id: cardInstance.id,
    param_node_id: key, // Assuming key matches node.key
    value: String(value),
  }));

  await db.insert(cardParamValueTable).values(paramValues);

  return cardInstance;
}

export async function calculateCardValue(cardId: number) {
  // 1. Load card instance and values
  const card = await db.query.cardInstanceTable.findFirst({
    where: eq(cardInstanceTable.id, cardId),
    with: {
      template: true,
      paramValues: true,
    },
  });

  if (!card) throw new Error("Card not found");

  // 2. Parse form data
  const formData = card.paramValues.reduce((acc, pv) => {
    acc[pv.param_node_id] = pv.value;
    return acc;
  }, {} as Record<string, string>);

  // 3. Execute calculation based on metric
  const result = await executeMetricCalculation(card.template.metric, formData);

  return {
    ...card,
    calculatedValue: result.value,
    displayText: result.displayText,
  };
}
```

### Step 6: Metric Calculation Engine

```typescript
async function executeMetricCalculation(
  metric: string,
  params: Record<string, string>
) {
  const calculators = {
    mean: calculateMean,
    median: calculateMedian,
    count_gt: calculateCountGreaterThan,
    streak: calculateStreak,
    impact: calculateImpact,
  };

  const calculator = calculators[metric];
  if (!calculator) {
    throw new Error(`Unknown metric: ${metric}`);
  }

  return await calculator(params);
}

async function calculateMean(params: Record<string, string>) {
  const { scope, subject_id, window_type, n } = params;

  let query = db
    .select({ grade: gradesTable.grade })
    .from(gradesTable)
    .where(eq(gradesTable.userId, getCurrentUserId()));

  // Apply scope filter
  if (scope === "subject" && subject_id) {
    query = query.where(eq(gradesTable.subjectId, parseInt(subject_id)));
  }

  // Apply time window
  if (window_type === "last_n_days" && n) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(n));
    query = query.where(gte(gradesTable.date, cutoff));
  }

  const grades = await query;
  const average = grades.reduce((sum, g) => sum + g.grade, 0) / grades.length;

  return {
    value: average,
    displayText: `${average.toFixed(2)}/20`,
  };
}
```

## Testing with Sample Data

Use the exported `sample_instances` and `sample_values` to test your implementation:

```typescript
async function loadSampleData(appIntegrationData: AppIntegration) {
  const { sample_instances, sample_values } = appIntegrationData;

  if (sample_instances && sample_values) {
    // Insert sample card instances
    await db.insert(cardInstanceTable).values(sample_instances);

    // Insert sample param values
    await db.insert(cardParamValueTable).values(sample_values);

    console.log(`Loaded ${sample_instances.length} sample cards`);
  }
}
```

## Validation and Error Handling

```typescript
import { z } from "zod";

function buildValidationSchema(nodes: ParamNode[]) {
  const schema: Record<string, z.ZodType> = {};

  nodes.forEach((node) => {
    let fieldSchema: z.ZodType = z.string();

    switch (node.type_id) {
      case 1: // integer
        fieldSchema = z.coerce.number().int();
        if (node.meta_json?.min)
          fieldSchema = fieldSchema.min(node.meta_json.min);
        if (node.meta_json?.max)
          fieldSchema = fieldSchema.max(node.meta_json.max);
        break;
      case 2: // float
        fieldSchema = z.coerce.number();
        break;
      case 4: // enum
        const options = node.meta_json?.enumOptions?.map((o) => o.id) || [];
        fieldSchema = z.enum(options as [string, ...string[]]);
        break;
      case 5: // date
        fieldSchema = z.string().datetime();
        break;
      case 6: // boolean
        fieldSchema = z.boolean();
        break;
    }

    if (node.meta_json?.required) {
      schema[node.key] = fieldSchema;
    } else {
      schema[node.key] = fieldSchema.optional();
    }
  });

  return z.object(schema);
}
```

## Migration Strategy

1. **Phase 1**: Import templates and basic structure
2. **Phase 2**: Implement form rendering for one template
3. **Phase 3**: Add metric calculation engine
4. **Phase 4**: Full UI integration with cards dashboard
5. **Phase 5**: Performance optimization and caching

## Performance Considerations

- **Cache** param_nodes and card_templates in memory/Redis
- **Index** frequently queried fields (user_id, template_id, etc.)
- **Batch** form validations to avoid N+1 queries
- **Lazy load** reference options in select widgets

## Security Notes

- Validate all JSON-Logic conditions server-side
- Sanitize user input in custom titles/descriptions
- Apply proper access controls to card instances
- Rate limit card creation per user

This integration approach ensures your real app maintains the same flexibility and modularity as the form builder while providing production-ready performance and security.
