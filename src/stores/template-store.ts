import { create } from 'zustand';
import { Template, MetricTab } from '@/types/template';
import { GraphTab } from '@/stores/multi-tab-graph-builder';
import { DatabaseExport, CompleteExport, CardInstance, CardParamValue } from '@/types/database-export';
import { PARAM_TYPES } from '@/types/graph-builder';

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
  exportCompleteExample: (templateId: string, includeExamples?: boolean) => CompleteExport | null;
  
  // Active template operations
  getActiveTemplate: () => Template | null;
  setActiveTemplate: (templateId: string) => void;
  
  // Metrics in template
  addMetricToTemplate: (templateId: string, metric: GraphTab) => void;
  updateMetricInTemplate: (templateId: string, metricId: string, updates: Partial<MetricTab>) => void;
  deleteMetricFromTemplate: (templateId: string, metricId: string) => void;

  // Convert between GraphTab and MetricTab
  convertGraphTabToMetricTab: (graphTab: GraphTab) => MetricTab;
  convertMetricTabToGraphTab: (metricTab: MetricTab) => GraphTab;
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

  exportCompleteExample: (templateId: string, includeExamples = false): CompleteExport | null => {
    const dbExport = get().exportForDatabase(templateId);
    if (!dbExport) return null;

    const completeExport: CompleteExport = {
      ...dbExport
    };

    if (includeExamples && dbExport.card_templates.length > 0) {
      // Generate example card instances and param values
      const cardInstances: CardInstance[] = [];
      const cardParamValues: CardParamValue[] = [];

      dbExport.card_templates.forEach((template, templateIndex) => {
        const cardId = templateIndex + 1;
        
        // Create example card instance
        cardInstances.push({
          id: cardId,
          template_id: template.id,
          user_id: 123, // Example user ID
          name: `Exemple ${template.code}`,
          created_at: new Date().toISOString(),
          favorite: false
        });

        // Create example param values for this card
        const templateNodes = dbExport.param_nodes.filter(node => 
          node.id === template.root_id || 
          dbExport.param_nodes.some(n => n.parent_id === template.root_id && n.id === node.id)
        );

        templateNodes.forEach(node => {
          let exampleValue = "";
          
          // Generate example values based on param type
          switch (node.type_id) {
            case 1: // integer
              exampleValue = "30";
              break;
            case 2: // float
              exampleValue = "15.5";
              break;
            case 3: // string
              exampleValue = "exemple";
              break;
            case 4: // enum
              const options = node.meta_json?.enumOptions as { id: string; label_json: Record<string, string> }[];
              if (options && options.length > 0) {
                exampleValue = options[0].id;
              }
              break;
            case 5: // date
              exampleValue = new Date().toISOString().split('T')[0];
              break;
            case 6: // boolean
              exampleValue = "true";
              break;
            case 7: // reference
              exampleValue = "17"; // Example reference ID
              break;
          }

          if (exampleValue) {
            cardParamValues.push({
              card_id: cardId,
              param_node_id: node.id,
              value: exampleValue
            });
          }
        });
      });

      completeExport.card_instances = cardInstances;
      completeExport.card_param_values = cardParamValues;
    }

    return completeExport;
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
  }
}));
