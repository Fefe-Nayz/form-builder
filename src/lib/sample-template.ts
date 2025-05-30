import { Template } from '@/types/template';
// Sample template that demonstrates a "Mean Calculation" card following the specifications
export const SAMPLE_MEAN_TEMPLATE: Template = {
  id: 'sample_mean_template',
  name: 'Moyenne modulaire',
  version: '1.0.0',
  description: 'Template d\'exemple pour calculer une moyenne avec différents paramètres',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  metrics: [
    {
      id: 'metric_mean',
      name: 'Mean Calculation',
      nodes: [
        // Root node: Scope selection
        {
          id: 'node_scope',
          key: 'scope',
          label_json: {
            fr: 'Périmètre',
            en: 'Scope'
          },
          type_id: 4, // enum
          parent_id: undefined,
          condition: undefined,
          order: 0,
          help_json: {
            fr: 'Choisissez le périmètre des données à analyser',
            en: 'Choose the data scope to analyze'
          },
          meta_json: {
            enumOptions: [
              {
                id: 'global',
                label_json: { fr: 'Toutes matières', en: 'All subjects' }
              },
              {
                id: 'subject',
                label_json: { fr: 'Une matière', en: 'Single subject' }
              },
              {
                id: 'custom_subject',
                label_json: { fr: 'Matières personnalisées', en: 'Custom subjects' }
              }
            ]
          },
          position: { x: 100, y: 100 }
        },

        // Subject selection (shown when scope = subject)
        {
          id: 'node_subject_id',
          key: 'subject_id',
          label_json: {
            fr: 'Matière',
            en: 'Subject'
          },
          type_id: 7, // reference
          parent_id: 'node_scope',
          condition: '{"===":[{"var":"scope"},"subject"]}',
          order: 1,
          help_json: {
            fr: 'Sélectionnez la matière à analyser',
            en: 'Select the subject to analyze'
          },
          meta_json: {
            referenceEntity: 'Subject'
          },
          position: { x: 300, y: 150 }
        },

        // Multi-subject selection (shown when scope = custom_subject)
        {
          id: 'node_subject_ids',
          key: 'subject_ids',
          label_json: {
            fr: 'Matières personnalisées',
            en: 'Custom subjects'
          },
          type_id: 7, // reference (multi)
          parent_id: 'node_scope',
          condition: '{"===":[{"var":"scope"},"custom_subject"]}',
          order: 2,
          help_json: {
            fr: 'Sélectionnez plusieurs matières à analyser',
            en: 'Select multiple subjects to analyze'
          },
          meta_json: {
            referenceEntity: 'Subject',
            multiple: true
          },
          position: { x: 300, y: 200 }
        },

        // Time window selection
        {
          id: 'node_window_type',
          key: 'window_type',
          label_json: {
            fr: 'Fenêtre temporelle',
            en: 'Time window'
          },
          type_id: 4, // enum
          parent_id: 'node_scope',
          condition: undefined,
          order: 3,
          help_json: {
            fr: 'Choisissez la période d\'analyse',
            en: 'Choose the analysis period'
          },
          meta_json: {
            enumOptions: [
              {
                id: 'all_time',
                label_json: { fr: 'Toutes périodes', en: 'All time' }
              },
              {
                id: 'period',
                label_json: { fr: 'Période personnalisée', en: 'Custom period' }
              },
              {
                id: 'last_n_days',
                label_json: { fr: 'N derniers jours', en: 'Last N days' }
              },
              {
                id: 'last_n_notes',
                label_json: { fr: 'N dernières notes', en: 'Last N notes' }
              }
            ]
          },
          position: { x: 100, y: 300 }
        },

        // Period start date (shown when window_type = period)
        {
          id: 'node_period_start',
          key: 'period_start',
          label_json: {
            fr: 'Date de début',
            en: 'Start date'
          },
          type_id: 5, // date
          parent_id: 'node_window_type',
          condition: '{"===":[{"var":"window_type"},"period"]}',
          order: 1,
          help_json: {
            fr: 'Date de début de la période',
            en: 'Period start date'
          },
          meta_json: {},
          position: { x: 300, y: 350 }
        },

        // Period end date (shown when window_type = period)
        {
          id: 'node_period_end',
          key: 'period_end',
          label_json: {
            fr: 'Date de fin',
            en: 'End date'
          },
          type_id: 5, // date
          parent_id: 'node_window_type',
          condition: '{"===":[{"var":"window_type"},"period"]}',
          order: 2,
          help_json: {
            fr: 'Date de fin de la période',
            en: 'Period end date'
          },
          meta_json: {},
          position: { x: 500, y: 350 }
        },

        // N days (shown when window_type = last_n_days)
        {
          id: 'node_n_days',
          key: 'n_days',
          label_json: {
            fr: 'Nombre de jours',
            en: 'Number of days'
          },
          type_id: 1, // integer
          parent_id: 'node_window_type',
          condition: '{"===":[{"var":"window_type"},"last_n_days"]}',
          order: 3,
          help_json: {
            fr: 'Nombre de jours à analyser',
            en: 'Number of days to analyze'
          },
          meta_json: {
            min: 1,
            max: 365
          },
          position: { x: 300, y: 400 }
        },

        // N notes (shown when window_type = last_n_notes)
        {
          id: 'node_n_notes',
          key: 'n_notes',
          label_json: {
            fr: 'Nombre de notes',
            en: 'Number of notes'
          },
          type_id: 1, // integer
          parent_id: 'node_window_type',
          condition: '{"===":[{"var":"window_type"},"last_n_notes"]}',
          order: 4,
          help_json: {
            fr: 'Nombre de notes à analyser',
            en: 'Number of notes to analyze'
          },
          meta_json: {
            min: 1,
            max: 100
          },
          position: { x: 500, y: 400 }
        },

        // Optional qualifier
        {
          id: 'node_qualifier',
          key: 'qualifier',
          label_json: {
            fr: 'Qualificateur (optionnel)',
            en: 'Qualifier (optional)'
          },
          type_id: 4, // enum
          parent_id: 'node_scope',
          condition: undefined,
          order: 4,
          help_json: {
            fr: 'Ajoutez un qualificateur à votre moyenne',
            en: 'Add a qualifier to your mean'
          },
          meta_json: {
            enumOptions: [
              {
                id: 'none',
                label_json: { fr: 'Aucun', en: 'None' }
              },
              {
                id: 'positive',
                label_json: { fr: 'Notes positives uniquement', en: 'Positive grades only' }
              },
              {
                id: 'above_threshold',
                label_json: { fr: 'Au-dessus d\'un seuil', en: 'Above threshold' }
              }
            ]
          },
          position: { x: 100, y: 500 }
        },

        // Threshold value (shown when qualifier = above_threshold)
        {
          id: 'node_threshold',
          key: 'threshold',
          label_json: {
            fr: 'Seuil',
            en: 'Threshold'
          },
          type_id: 2, // float
          parent_id: 'node_qualifier',
          condition: '{"===":[{"var":"qualifier"},"above_threshold"]}',
          order: 1,
          help_json: {
            fr: 'Valeur minimale des notes à inclure',
            en: 'Minimum grade value to include'
          },
          meta_json: {
            min: 0,
            max: 20,
            step: 0.1
          },
          position: { x: 300, y: 550 }
        }
      ],
      connections: [
        {
          id: 'edge_scope_to_subject',
          source: 'node_scope',
          target: 'node_subject_id',
          condition: '{"===":[{"var":"scope"},"subject"]}'
        },
        {
          id: 'edge_scope_to_subjects',
          source: 'node_scope',
          target: 'node_subject_ids',
          condition: '{"===":[{"var":"scope"},"custom_subject"]}'
        },
        {
          id: 'edge_scope_to_window',
          source: 'node_scope',
          target: 'node_window_type'
        },
        {
          id: 'edge_window_to_start',
          source: 'node_window_type',
          target: 'node_period_start',
          condition: '{"===":[{"var":"window_type"},"period"]}'
        },
        {
          id: 'edge_window_to_end',
          source: 'node_window_type',
          target: 'node_period_end',
          condition: '{"===":[{"var":"window_type"},"period"]}'
        },
        {
          id: 'edge_window_to_n_days',
          source: 'node_window_type',
          target: 'node_n_days',
          condition: '{"===":[{"var":"window_type"},"last_n_days"]}'
        },
        {
          id: 'edge_window_to_n_notes',
          source: 'node_window_type',
          target: 'node_n_notes',
          condition: '{"===":[{"var":"window_type"},"last_n_notes"]}'
        },
        {
          id: 'edge_scope_to_qualifier',
          source: 'node_scope',
          target: 'node_qualifier'
        },
        {
          id: 'edge_qualifier_to_threshold',
          source: 'node_qualifier',
          target: 'node_threshold',
          condition: '{"===":[{"var":"qualifier"},"above_threshold"]}'
        }
      ],
      position: { x: 0, y: 0, zoom: 1 }
    }
  ]
}; 