import { create } from 'zustand';
import { Template, MetricTab } from '@/types/template';
import { GraphTab } from '@/stores/multi-tab-graph-builder';
import { DatabaseExport, CompleteExport, CardInstance, CardParamValue, AppIntegration, FormDefinition } from '@/types/database-export';
import { PARAM_TYPES } from '@/types/graph-builder';
import JsonLogic from 'json-logic-js';

interface TemplateStore {
  templates: Template[];
  activeTemplateId: string | null;

  // Template management
  createTemplate: (name: string, version: string, description?: string) => string;
  updateTemplate: (templateId: string, updates: Partial<Omit<Template, 'id'>>) => void;
  deleteTemplate: (templateId: string) => void;
  importTemplate: (templateData: Partial<Template>) => string;
  exportTemplate: (templateId: string) => Template | null;
  
  // NEW: Database export for real app
  exportForDatabase: (templateId: string) => DatabaseExport | null;
  exportCompleteExample: (templateId: string, includeInstances?: boolean) => CompleteExport | null;
  
  // Active template operations
  getActiveTemplate: () => Template | null;
  setActiveTemplate: (templateId: string) => void;
  
  // Metrics in template
  addMetricToTemplate: (templateId: string, metric: GraphTab) => void;
  updateMetricInTemplate: (templateId: string, metricId: string, updates: Partial<MetricTab>) => void;
  deleteMetricFromTemplate: (templateId: string, metricId: string) => void;
  saveMetricToTemplate: (templateId: string, metric: GraphTab) => void;
  transferMetricsToTemplate: (sourceTemplateId: string, targetTemplateId: string, metricIds: string[]) => void;

  // Convert between GraphTab and MetricTab
  convertGraphTabToMetricTab: (graphTab: GraphTab) => MetricTab;
  convertMetricTabToGraphTab: (metricTab: MetricTab) => GraphTab;

  generateSampleFormData: (rootNodeId: string, allNodes: any[]) => Record<string, any>;
  exportForRealApp: (templateId: string) => AppIntegration | null;
  buildFormSteps: (rootNodeId: string, allNodes: any[]) => any[];
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  activeTemplateId: null,

  createTemplate: (name: string, version: string, description?: string) => {
    const id = `template_${Date.now()}`;
    const newTemplate: Template = {
      id,
      name,
      version,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: []
    };

    set(state => ({
      templates: [...state.templates, newTemplate],
      activeTemplateId: id
    }));

    return id;
  },

  updateTemplate: (templateId: string, updates: Partial<Omit<Template, 'id'>>) => {
    set(state => ({
      templates: state.templates.map(template => 
        template.id === templateId 
          ? { 
              ...template, 
              ...updates, 
              updatedAt: new Date().toISOString() 
            } 
          : template
      )
    }));
  },

  deleteTemplate: (templateId: string) => {
    set(state => {
      const newTemplates = state.templates.filter(template => template.id !== templateId);
      const newActiveTemplateId = state.activeTemplateId === templateId 
        ? (newTemplates.length > 0 ? newTemplates[0].id : null)
        : state.activeTemplateId;

      return {
        templates: newTemplates,
        activeTemplateId: newActiveTemplateId
      };
    });
  },

  importTemplate: (templateData: Partial<Template>) => {
    try {
      const template: Template = {
        id: `template_${Date.now()}`,
        name: '',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metrics: [],
        ...templateData
      };
      
      set(state => ({
        templates: [...state.templates, template],
        activeTemplateId: template.id
      }));
      
      return template.id;
    } catch (error) {
      console.error('Failed to import template:', error);
      throw new Error('Invalid template format');
    }
  },

  exportTemplate: (templateId: string): Template | null => {
    const template = get().templates.find(t => t.id === templateId);
    if (!template) return null;
    
    return JSON.parse(JSON.stringify(template));
  },

  exportForDatabase: (templateId: string): DatabaseExport | null => {
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
          title_template: `{{metricLabel}}{{#if subjectLabel}} de {{subjectLabel}}{{/if}}`,
          description_template: "Valeur: {{value}}{{#if windowLabel}} sur {{windowLabel}}{{/if}}",
          icon_default: "mdi:chart-line"
        });
      }
    });

    return dbExport;
  },

  exportCompleteExample: (templateId: string, includeInstances?: boolean): CompleteExport | null => {
    const dbExport = get().exportForDatabase(templateId);
    if (!dbExport) return null;

    const completeExport: CompleteExport = {
      ...dbExport,
      card_instances: undefined,
      card_param_values: undefined
    };

    if (includeInstances) {
      // Generate sample card instances and values
      const sampleInstances: CardInstance[] = [];
      const sampleValues: CardParamValue[] = [];

      dbExport.card_templates.forEach((template, templateIndex) => {
        // Create 2 sample instances per template
        for (let i = 0; i < 2; i++) {
          const cardId = templateIndex * 2 + i + 1;
          const instance: CardInstance = {
            id: cardId,
            template_id: template.id,
            user_id: 123 + i,
            name: `Exemple ${template.metric} ${i + 1}`,
            created_at: new Date().toISOString(),
            favorite: i === 0,
            ui_json: {
              title: `${template.metric} personnalisée`,
              description: "Description générée automatiquement",
              icon: template.icon_default || "mdi:chart-line",
              variant: "info"
            }
          };
          sampleInstances.push(instance);

          // Generate sample param values for visible nodes
          const rootNode = dbExport.param_nodes.find(n => n.id === template.root_id);
          if (rootNode) {
            const sampleData = get().generateSampleFormData(template.root_id, dbExport.param_nodes);
            Object.entries(sampleData).forEach(([key, value]) => {
              const node = dbExport.param_nodes.find(n => n.key === key);
              if (node) {
                sampleValues.push({
                  card_id: cardId,
                  param_node_id: node.id,
                  value: String(value)
                });
              }
            });
          }
        }
      });

      completeExport.card_instances = sampleInstances;
      completeExport.card_param_values = sampleValues;
    }

    return completeExport;
  },

  generateSampleFormData: (rootNodeId: string, allNodes: any[]): Record<string, any> => {
    const sampleData: Record<string, any> = {};
    
    const processNode = (nodeId: string, currentData: Record<string, any>) => {
      const node = allNodes.find(n => n.id === nodeId);
      if (!node) return;

      // Generate sample value based on type
      let sampleValue: any;
      switch (node.type_id) {
        case 1: // integer
          sampleValue = node.meta_json?.min || 1;
          break;
        case 2: // float
          sampleValue = 12.5;
          break;
        case 3: // string
          sampleValue = `Sample ${node.key}`;
          break;
        case 4: // enum
          const options = node.meta_json?.enumOptions || [];
          sampleValue = options[0]?.id || options[0]?.value || "default";
          break;
        case 5: // date
          sampleValue = new Date().toISOString().split('T')[0];
          break;
        case 6: // boolean
          sampleValue = true;
          break;
        case 7: // reference
          sampleValue = "17"; // Sample subject ID
          break;
        default:
          sampleValue = "sample";
      }

      currentData[node.key] = sampleValue;

      // Process children if they would be visible
      const children = allNodes.filter(n => n.parent_id === nodeId);
      children.forEach(child => {
        if (child.condition) {
          try {
            const condition = JSON.parse(child.condition);
            const isVisible = JsonLogic.apply(condition, currentData);
            if (isVisible) {
              processNode(child.id, currentData);
            }
          } catch (e) {
            // If condition fails, include the node anyway
            processNode(child.id, currentData);
          }
        } else {
          processNode(child.id, currentData);
        }
      });
    };

    processNode(rootNodeId, sampleData);
    return sampleData;
  },

  getActiveTemplate: () => {
    const state = get();
    return state.templates.find(template => template.id === state.activeTemplateId) || null;
  },

  setActiveTemplate: (templateId: string) => {
    set({ activeTemplateId: templateId });
  },

  addMetricToTemplate: (templateId: string, graphTab: GraphTab) => {
    const metricTab = get().convertGraphTabToMetricTab(graphTab);
    
    set(state => ({
      templates: state.templates.map(template => 
        template.id === templateId 
          ? { 
              ...template, 
              metrics: [...template.metrics, metricTab],
              updatedAt: new Date().toISOString() 
            } 
          : template
      )
    }));
  },

  updateMetricInTemplate: (templateId: string, metricId: string, updates: Partial<MetricTab>) => {
    set(state => ({
      templates: state.templates.map(template => 
        template.id === templateId 
          ? { 
              ...template, 
              metrics: template.metrics.map(metric => 
                metric.id === metricId 
                  ? { ...metric, ...updates } 
                  : metric
              ),
              updatedAt: new Date().toISOString() 
            } 
          : template
      )
    }));
  },

  deleteMetricFromTemplate: (templateId: string, metricId: string) => {
    set(state => ({
      templates: state.templates.map(template => 
        template.id === templateId 
          ? { 
              ...template, 
              metrics: template.metrics.filter(metric => metric.id !== metricId),
              updatedAt: new Date().toISOString() 
            } 
          : template
      )
    }));
  },

  saveMetricToTemplate: (templateId: string, graphTab: GraphTab) => {
    const metricTab = get().convertGraphTabToMetricTab(graphTab);
    
    set(state => ({
      templates: state.templates.map(template => 
        template.id === templateId 
          ? { 
              ...template, 
              metrics: template.metrics.map(existing => 
                existing.id === metricTab.id 
                  ? metricTab  // Replace existing metric
                  : existing
              ).concat(
                template.metrics.find(existing => existing.id === metricTab.id) 
                  ? [] // Don't add if it already exists
                  : [metricTab] // Add if it's new
              ),
              updatedAt: new Date().toISOString() 
            } 
          : template
      )
    }));
  },

  transferMetricsToTemplate: (sourceTemplateId: string, targetTemplateId: string, metricIds: string[]) => {
    const state = get();
    const sourceTemplate = state.templates.find(t => t.id === sourceTemplateId);
    const targetTemplate = state.templates.find(t => t.id === targetTemplateId);
    
    if (!sourceTemplate || !targetTemplate) return;
    
    const metricsToTransfer = sourceTemplate.metrics.filter(metric => 
      metricIds.includes(metric.id)
    );
    
    set(state => ({
      templates: state.templates.map(template => {
        if (template.id === targetTemplateId) {
          // Add metrics to target template, avoiding duplicates
          const existingIds = template.metrics.map(m => m.id);
          const newMetrics = metricsToTransfer.filter(m => !existingIds.includes(m.id));
          return {
            ...template,
            metrics: [...template.metrics, ...newMetrics],
            updatedAt: new Date().toISOString()
          };
        }
        if (template.id === sourceTemplateId) {
          // Remove metrics from source template
          return {
            ...template,
            metrics: template.metrics.filter(metric => !metricIds.includes(metric.id)),
            updatedAt: new Date().toISOString()
          };
        }
        return template;
      })
    }));
  },

  convertGraphTabToMetricTab: (graphTab: GraphTab): MetricTab => {
    return {
      id: graphTab.id,
      name: graphTab.name,
      nodes: graphTab.nodes,
      connections: graphTab.connections,
      position: graphTab.position
    };
  },

  convertMetricTabToGraphTab: (metricTab: MetricTab): GraphTab => {
    return {
      id: metricTab.id,
      name: metricTab.name,
      nodes: metricTab.nodes,
      connections: metricTab.connections,
      selectedNodeId: null,
      position: metricTab.position
    };
  },

  exportForRealApp: (templateId: string): AppIntegration | null => {
    const dbExport = get().exportForDatabase(templateId);
    if (!dbExport) return null;

    const template = get().templates.find(t => t.id === templateId);
    if (!template) return null;

    // Generate form definitions for each card template
    const formDefinitions: FormDefinition[] = dbExport.card_templates.map(cardTemplate => {
      const rootNode = dbExport.param_nodes.find(n => n.id === cardTemplate.root_id);
      if (!rootNode) {
        throw new Error(`Root node not found for template ${cardTemplate.code}`);
      }

      // Build form steps based on node hierarchy
      const formSteps = get().buildFormSteps(cardTemplate.root_id, dbExport.param_nodes);
      
      // Generate validation rules
      const validationRules = dbExport.param_nodes
        .filter(node => node.meta_json?.required || node.meta_json?.min || node.meta_json?.max)
        .map(node => ({
          node_id: node.id,
          rule_type: node.meta_json?.required ? 'required' as const : 
                    node.meta_json?.min ? 'min' as const : 'max' as const,
          rule_value: node.meta_json?.required ? true : 
                     node.meta_json?.min || node.meta_json?.max,
          error_message: {
            fr: `Le champ ${node.label_json?.fr || node.key} est invalide`,
            en: `Field ${node.label_json?.en || node.key} is invalid`
          }
        }));

      return {
        id: `form_${cardTemplate.code}`,
        template_id: cardTemplate.id,
        form_steps: formSteps,
        validation_rules: validationRules
      };
    });

    // Generate sample instances and values
    const completeExport = get().exportCompleteExample(templateId, true);

    return {
      database_export: dbExport,
      form_definitions: formDefinitions,
      sample_instances: completeExport?.card_instances || [],
      sample_values: completeExport?.card_param_values || [],
      migration_notes: `
Template: ${template.name} v${template.version}
Generated: ${new Date().toISOString()}

Integration steps:
1. Import param_types and param_nodes into your database
2. Import card_templates 
3. Use form_definitions to render dynamic forms
4. Reference sample_instances and sample_values for testing

Note: Ensure your app handles JSON-Logic evaluation for conditional field display.
      `
    };
  },

  buildFormSteps: (rootNodeId: string, allNodes: any[]): any[] => {
    const steps: any[] = [];
    const visited = new Set<string>();

    const buildStep = (nodeId: string, stepTitle: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = allNodes.find(n => n.id === nodeId);
      if (!node) return;

      const children = allNodes.filter(n => n.parent_id === nodeId);
      const directFields = children.filter(child => 
        !allNodes.some(n => n.parent_id === child.id)
      );

      const step = {
        id: `step_${nodeId}`,
        title: node.label_json || { fr: stepTitle, en: stepTitle },
        description: node.help_json,
        fields: [
          {
            node_id: nodeId,
            widget_type: PARAM_TYPES.find(t => t.id === node.type_id)?.widget || 'text',
            validation: node.meta_json,
            dependencies: []
          },
          ...directFields.map(field => ({
            node_id: field.id,
            widget_type: PARAM_TYPES.find(t => t.id === field.type_id)?.widget || 'text',
            validation: field.meta_json,
            dependencies: field.condition ? [nodeId] : []
          }))
        ]
      };

      steps.push(step);

      // Process children that have their own children (sub-steps)
      children.filter(child => 
        allNodes.some(n => n.parent_id === child.id)
      ).forEach(child => {
        buildStep(child.id, child.label_json?.fr || child.key);
      });
    };

    const rootNode = allNodes.find(n => n.id === rootNodeId);
    buildStep(rootNodeId, rootNode?.label_json?.fr || 'Configuration');

    return steps;
  }
}));
