import { Template } from "@/types/template";

/**
 * Template « Moyenne » entièrement paramétrable.
 * – scope  : global / subject / custom_subject
 * – window : all_time / period / last_n_days / last_n_notes
 * – qualifier : none / min / max  (=> “Pire” ou “Meilleure” moyenne)
 */
export const SAMPLE_MEAN_TEMPLATE: Template = {
  "id": "template_mean_v1",
  "name": "Forumulaires de base",
  "version": "1.0.0",
  "createdAt": new Date().toISOString(),
  "updatedAt": new Date().toISOString(),
  "metrics": [
    {
      "id": "metric_mean",
      "name": "Mean",
      "nodes": [
        {
          "id": "mean_scope",
          "key": "scope",
          "label_json": {
            "fr": "Périmètre",
            "en": "Scope"
          },
          "type_id": 4,
          "order": 0,
          "help_json": {
            "fr": "Choisissez le périmètre à analyser",
            "en": "Choose the scope to analyse"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "global",
                "label_json": {
                  "fr": "Toutes matières",
                  "en": "All subjects"
                }
              },
              {
                "id": "subject",
                "label_json": {
                  "fr": "Une matière",
                  "en": "Single subject"
                }
              },
              {
                "id": "custom_subject",
                "label_json": {
                  "fr": "Matières personnalisées",
                  "en": "Custom subjects"
                }
              }
            ]
          },
          "position": {
            "x": 650,
            "y": 50
          }
        },
        {
          "id": "mean_subject_id",
          "key": "subject_id",
          "label_json": {
            "fr": "Matière",
            "en": "Subject"
          },
          "type_id": 7,
          "parent_id": "mean_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}",
          "order": 1,
          "help_json": {
            "fr": "Sélectionnez la matière concernée",
            "en": "Select the subject"
          },
          "meta_json": {
            "referenceEntity": "Subject"
          },
          "position": {
            "x": 50,
            "y": 350
          }
        },
        {
          "id": "mean_subject_ids",
          "key": "subject_ids",
          "label_json": {
            "fr": "Matières personnalisées",
            "en": "Custom subjects"
          },
          "type_id": 7,
          "parent_id": "mean_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}",
          "order": 2,
          "help_json": {
            "fr": "Choisissez une liste de matières",
            "en": "Select multiple subjects"
          },
          "meta_json": {
            "referenceEntity": "Subject",
            "multiple": true
          },
          "position": {
            "x": 450,
            "y": 350
          }
        },
        {
          "id": "mean_qualifier",
          "key": "qualifier",
          "label_json": {
            "fr": "Qualificateur",
            "en": "Qualifier"
          },
          "type_id": 4,
          "parent_id": "mean_scope",
          "order": 3,
          "help_json": {
            "fr": "Optionnel : choisir Pire (min) ou Meilleure (max) moyenne",
            "en": "Optional : choose Worst (min) or Best (max) mean"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "none",
                "label_json": {
                  "fr": "Aucun",
                  "en": "None"
                }
              },
              {
                "id": "min",
                "label_json": {
                  "fr": "Pire moyenne",
                  "en": "Worst mean"
                }
              },
              {
                "id": "max",
                "label_json": {
                  "fr": "Meilleure moyenne",
                  "en": "Best mean"
                }
              }
            ]
          },
          "position": {
            "x": 850,
            "y": 350
          }
        },
        {
          "id": "mean_window_type",
          "key": "window_type",
          "label_json": {
            "fr": "Fenêtre temporelle",
            "en": "Time window"
          },
          "type_id": 4,
          "parent_id": "mean_scope",
          "order": 4,
          "help_json": {
            "fr": "Période d'analyse",
            "en": "Analysis window"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "all_time",
                "label_json": {
                  "fr": "Toutes périodes",
                  "en": "All time"
                }
              },
              {
                "id": "period",
                "label_json": {
                  "fr": "Période",
                  "en": "Period"
                }
              },
              {
                "id": "last_n_days",
                "label_json": {
                  "fr": "N derniers jours",
                  "en": "Last N days"
                }
              },
              {
                "id": "last_n_notes",
                "label_json": {
                  "fr": "N dernières notes",
                  "en": "Last N notes"
                }
              }
            ]
          },
          "position": {
            "x": 1250,
            "y": 350
          }
        },
        {
          "id": "mean_period_start",
          "key": "period_start",
          "label_json": {
            "fr": "Date de début",
            "en": "Start date"
          },
          "type_id": 5,
          "parent_id": "mean_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 1,
          "help_json": {},
          "meta_json": {},
          "position": {
            "x": 650,
            "y": 650
          }
        },
        {
          "id": "mean_period_end",
          "key": "period_end",
          "label_json": {
            "fr": "Date de fin",
            "en": "End date"
          },
          "type_id": 5,
          "parent_id": "mean_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 2,
          "help_json": {},
          "meta_json": {},
          "position": {
            "x": 1050,
            "y": 650
          }
        },
        {
          "id": "mean_n_days",
          "key": "n_days",
          "label_json": {
            "fr": "Nombre de jours",
            "en": "Number of days"
          },
          "type_id": 1,
          "parent_id": "mean_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}",
          "order": 3,
          "help_json": {},
          "meta_json": {
            "min": 1,
            "max": 365
          },
          "position": {
            "x": 1450,
            "y": 650
          }
        },
        {
          "id": "mean_n_notes",
          "key": "n_notes",
          "label_json": {
            "fr": "Nombre de notes",
            "en": "Number of notes"
          },
          "type_id": 1,
          "parent_id": "mean_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_notes\"]}",
          "order": 4,
          "help_json": {},
          "meta_json": {
            "min": 1,
            "max": 100
          },
          "position": {
            "x": 1850,
            "y": 650
          }
        }
      ],
      "connections": [
        {
          "id": "edge_scope_subject",
          "source": "mean_scope",
          "target": "mean_subject_id",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}"
        },
        {
          "id": "edge_scope_subjects",
          "source": "mean_scope",
          "target": "mean_subject_ids",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}"
        },
        {
          "id": "edge_scope_qualifier",
          "source": "mean_scope",
          "target": "mean_qualifier"
        },
        {
          "id": "edge_scope_window",
          "source": "mean_scope",
          "target": "mean_window_type"
        },
        {
          "id": "edge_window_start",
          "source": "mean_window_type",
          "target": "mean_period_start",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_window_end",
          "source": "mean_window_type",
          "target": "mean_period_end",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_window_n_days",
          "source": "mean_window_type",
          "target": "mean_n_days",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}"
        },
        {
          "id": "edge_window_n_notes",
          "source": "mean_window_type",
          "target": "mean_n_notes",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_notes\"]}"
        }
      ],
      "position": {
        "x": 0,
        "y": 0,
        "zoom": 1
      }
    },
    {
      "id": "metric_median",
      "name": "Median",
      "nodes": [
        {
          "id": "median_scope",
          "key": "scope",
          "label_json": {
            "fr": "Périmètre",
            "en": "Scope"
          },
          "type_id": 4,
          "order": 0,
          "help_json": {
            "fr": "Choisissez le périmètre à analyser",
            "en": "Choose the scope to analyse"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "global",
                "label_json": {
                  "fr": "Toutes matières",
                  "en": "All subjects"
                }
              },
              {
                "id": "subject",
                "label_json": {
                  "fr": "Une matière",
                  "en": "Single subject"
                }
              },
              {
                "id": "custom_subject",
                "label_json": {
                  "fr": "Matières personnalisées",
                  "en": "Custom subjects"
                }
              }
            ]
          },
          "position": {
            "x": 650,
            "y": 50
          }
        },
        {
          "id": "median_subject_id",
          "key": "subject_id",
          "label_json": {
            "fr": "Matière",
            "en": "Subject"
          },
          "type_id": 7,
          "parent_id": "median_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}",
          "order": 1,
          "help_json": {},
          "meta_json": {
            "referenceEntity": "Subject"
          },
          "position": {
            "x": 50,
            "y": 350
          }
        },
        {
          "id": "median_subject_ids",
          "key": "subject_ids",
          "label_json": {
            "fr": "Matières personnalisées",
            "en": "Custom subjects"
          },
          "type_id": 7,
          "parent_id": "median_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}",
          "order": 2,
          "help_json": {},
          "meta_json": {
            "referenceEntity": "Subject",
            "multiple": true
          },
          "position": {
            "x": 450,
            "y": 350
          }
        },
        {
          "id": "median_qualifier",
          "key": "qualifier",
          "label_json": {
            "fr": "Qualificateur",
            "en": "Qualifier"
          },
          "type_id": 4,
          "parent_id": "median_scope",
          "order": 3,
          "help_json": {
            "fr": "Optionnel : Pire (min) ou Meilleure (max) médiane",
            "en": "Optional: Worst (min) or Best (max) median"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "none",
                "label_json": {
                  "fr": "Aucun",
                  "en": "None"
                }
              },
              {
                "id": "min",
                "label_json": {
                  "fr": "Pire médiane",
                  "en": "Worst median"
                }
              },
              {
                "id": "max",
                "label_json": {
                  "fr": "Meilleure médiane",
                  "en": "Best median"
                }
              }
            ]
          },
          "position": {
            "x": 850,
            "y": 350
          }
        },
        {
          "id": "median_window_type",
          "key": "window_type",
          "label_json": {
            "fr": "Fenêtre temporelle",
            "en": "Time window"
          },
          "type_id": 4,
          "parent_id": "median_scope",
          "order": 4,
          "help_json": {},
          "meta_json": {
            "enumOptions": [
              {
                "id": "all_time",
                "label_json": {
                  "fr": "Toutes périodes",
                  "en": "All time"
                }
              },
              {
                "id": "period",
                "label_json": {
                  "fr": "Période",
                  "en": "Period"
                }
              },
              {
                "id": "last_n_days",
                "label_json": {
                  "fr": "N derniers jours",
                  "en": "Last N days"
                }
              },
              {
                "id": "last_n_notes",
                "label_json": {
                  "fr": "N dernières notes",
                  "en": "Last N notes"
                }
              }
            ]
          },
          "position": {
            "x": 1250,
            "y": 350
          }
        },
        {
          "id": "median_period_start",
          "key": "period_start",
          "label_json": {
            "fr": "Date de début",
            "en": "Start date"
          },
          "type_id": 5,
          "parent_id": "median_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 1,
          "help_json": {},
          "meta_json": {},
          "position": {
            "x": 650,
            "y": 650
          }
        },
        {
          "id": "median_period_end",
          "key": "period_end",
          "label_json": {
            "fr": "Date de fin",
            "en": "End date"
          },
          "type_id": 5,
          "parent_id": "median_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 2,
          "help_json": {},
          "meta_json": {},
          "position": {
            "x": 1050,
            "y": 650
          }
        },
        {
          "id": "median_n_days",
          "key": "n_days",
          "label_json": {
            "fr": "Nombre de jours",
            "en": "Number of days"
          },
          "type_id": 1,
          "parent_id": "median_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}",
          "order": 3,
          "help_json": {},
          "meta_json": {
            "min": 1,
            "max": 365
          },
          "position": {
            "x": 1450,
            "y": 650
          }
        },
        {
          "id": "median_n_notes",
          "key": "n_notes",
          "label_json": {
            "fr": "Nombre de notes",
            "en": "Number of notes"
          },
          "type_id": 1,
          "parent_id": "median_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_notes\"]}",
          "order": 4,
          "help_json": {},
          "meta_json": {
            "min": 1,
            "max": 100
          },
          "position": {
            "x": 1850,
            "y": 650
          }
        }
      ],
      "connections": [
        {
          "id": "edge_scope_subject_median",
          "source": "median_scope",
          "target": "median_subject_id",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}"
        },
        {
          "id": "edge_scope_subjects_median",
          "source": "median_scope",
          "target": "median_subject_ids",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}"
        },
        {
          "id": "edge_scope_qualifier_median",
          "source": "median_scope",
          "target": "median_qualifier"
        },
        {
          "id": "edge_scope_window_median",
          "source": "median_scope",
          "target": "median_window_type"
        },
        {
          "id": "edge_window_start_median",
          "source": "median_window_type",
          "target": "median_period_start",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_window_end_median",
          "source": "median_window_type",
          "target": "median_period_end",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_window_n_days_median",
          "source": "median_window_type",
          "target": "median_n_days",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}"
        },
        {
          "id": "edge_window_n_notes_median",
          "source": "median_window_type",
          "target": "median_n_notes",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_notes\"]}"
        }
      ],
      "position": {
        "x": 0,
        "y": 0,
        "zoom": 1
      }
    },
    {
      "id": "metric_note",
      "name": "Note",
      "nodes": [
        {
          "id": "note_scope",
          "key": "scope",
          "label_json": {
            "fr": "Périmètre",
            "en": "Scope"
          },
          "type_id": 4,
          "order": 0,
          "help_json": {
            "fr": "Choisissez le périmètre à analyser",
            "en": "Choose the scope to analyse"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "global",
                "label_json": {
                  "fr": "Toutes matières",
                  "en": "All subjects"
                }
              },
              {
                "id": "subject",
                "label_json": {
                  "fr": "Une matière",
                  "en": "Single subject"
                }
              },
              {
                "id": "custom_subject",
                "label_json": {
                  "fr": "Matières personnalisées",
                  "en": "Custom subjects"
                }
              }
            ]
          },
          "position": {
            "x": 450,
            "y": 50
          }
        },
        {
          "id": "note_subject_id",
          "key": "subject_id",
          "label_json": {
            "fr": "Matière",
            "en": "Subject"
          },
          "type_id": 7,
          "parent_id": "note_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}",
          "order": 1,
          "help_json": {},
          "meta_json": {
            "referenceEntity": "Subject"
          },
          "position": {
            "x": 50,
            "y": 350
          }
        },
        {
          "id": "note_subject_ids",
          "key": "subject_ids",
          "label_json": {
            "fr": "Matières personnalisées",
            "en": "Custom subjects"
          },
          "type_id": 7,
          "parent_id": "note_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}",
          "order": 2,
          "help_json": {},
          "meta_json": {
            "referenceEntity": "Subject",
            "multiple": true
          },
          "position": {
            "x": 450,
            "y": 350
          }
        },
        {
          "id": "note_variant",
          "key": "note_variant",
          "label_json": {
            "fr": "Type de note",
            "en": "Note variant"
          },
          "type_id": 4,
          "parent_id": "note_scope",
          "order": 3,
          "help_json": {
            "fr": "Choisissez la variante : dernière, plus haute, etc.",
            "en": "Choose the note variant"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "last",
                "label_json": {
                  "fr": "Dernière note",
                  "en": "Last note"
                }
              },
              {
                "id": "highest",
                "label_json": {
                  "fr": "Note la plus haute",
                  "en": "Highest note"
                }
              },
              {
                "id": "lowest",
                "label_json": {
                  "fr": "Note la plus basse",
                  "en": "Lowest note"
                }
              },
              {
                "id": "most_frequent",
                "label_json": {
                  "fr": "Note la plus fréquente",
                  "en": "Most frequent note"
                }
              },
              {
                "id": "impact",
                "label_json": {
                  "fr": "Note à plus fort impact",
                  "en": "Highest impact note"
                }
              }
            ]
          },
          "position": {
            "x": 850,
            "y": 350
          }
        },
        {
          "id": "note_impact_polarity",
          "key": "impact_polarity",
          "label_json": {
            "fr": "Polarité d'impact",
            "en": "Impact polarity"
          },
          "type_id": 4,
          "parent_id": "note_variant",
          "condition": "{\"===\":[{\"var\":\"note_variant\"},\"impact\"]}",
          "order": 1,
          "help_json": {
            "fr": "Global, positive ou négative",
            "en": "Global, positive or negative"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "global",
                "label_json": {
                  "fr": "Global",
                  "en": "Global"
                }
              },
              {
                "id": "positive",
                "label_json": {
                  "fr": "Positive",
                  "en": "Positive"
                }
              },
              {
                "id": "negative",
                "label_json": {
                  "fr": "Négative",
                  "en": "Negative"
                }
              }
            ]
          },
          "position": {
            "x": 650,
            "y": 650
          }
        },
        {
          "id": "note_window_type",
          "key": "window_type",
          "label_json": {
            "fr": "Fenêtre temporelle",
            "en": "Time window"
          },
          "type_id": 4,
          "parent_id": "note_variant",
          "condition": "{\"!=\":[{\"var\":\"note_variant\"},\"last\"]}",
          "order": 2,
          "help_json": {},
          "meta_json": {
            "enumOptions": [
              {
                "id": "all_time",
                "label_json": {
                  "fr": "Toutes périodes",
                  "en": "All time"
                }
              },
              {
                "id": "period",
                "label_json": {
                  "fr": "Période",
                  "en": "Period"
                }
              },
              {
                "id": "last_n_days",
                "label_json": {
                  "fr": "N derniers jours",
                  "en": "Last N days"
                }
              },
              {
                "id": "last_n_notes",
                "label_json": {
                  "fr": "N dernières notes",
                  "en": "Last N notes"
                }
              }
            ]
          },
          "position": {
            "x": 1050,
            "y": 650
          }
        },
        {
          "id": "note_period_start",
          "key": "period_start",
          "label_json": {
            "fr": "Date de début",
            "en": "Start date"
          },
          "type_id": 5,
          "parent_id": "note_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 1,
          "help_json": {},
          "meta_json": {},
          "position": {
            "x": 450,
            "y": 950
          }
        },
        {
          "id": "note_period_end",
          "key": "period_end",
          "label_json": {
            "fr": "Date de fin",
            "en": "End date"
          },
          "type_id": 5,
          "parent_id": "note_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 2,
          "help_json": {},
          "meta_json": {},
          "position": {
            "x": 850,
            "y": 950
          }
        },
        {
          "id": "note_n_days",
          "key": "n_days",
          "label_json": {
            "fr": "Nombre de jours",
            "en": "Number of days"
          },
          "type_id": 1,
          "parent_id": "note_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}",
          "order": 3,
          "help_json": {},
          "meta_json": {
            "min": 1,
            "max": 365
          },
          "position": {
            "x": 1250,
            "y": 950
          }
        },
        {
          "id": "note_n_notes",
          "key": "n_notes",
          "label_json": {
            "fr": "Nombre de notes",
            "en": "Number of notes"
          },
          "type_id": 1,
          "parent_id": "note_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_notes\"]}",
          "order": 4,
          "help_json": {},
          "meta_json": {
            "min": 1,
            "max": 100
          },
          "position": {
            "x": 1650,
            "y": 950
          }
        }
      ],
      "connections": [
        {
          "id": "edge_scope_subject_note",
          "source": "note_scope",
          "target": "note_subject_id",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}"
        },
        {
          "id": "edge_scope_subjects_note",
          "source": "note_scope",
          "target": "note_subject_ids",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}"
        },
        {
          "id": "edge_scope_variant_note",
          "source": "note_scope",
          "target": "note_variant"
        },
        {
          "id": "edge_variant_impact_note",
          "source": "note_variant",
          "target": "note_impact_polarity",
          "condition": "{\"===\":[{\"var\":\"note_variant\"},\"impact\"]}"
        },
        {
          "id": "edge_variant_window_note",
          "source": "note_variant",
          "target": "note_window_type",
          "condition": "{\"!=\":[{\"var\":\"note_variant\"},\"last\"]}"
        },
        {
          "id": "edge_window_start_note",
          "source": "note_window_type",
          "target": "note_period_start",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_window_end_note",
          "source": "note_window_type",
          "target": "note_period_end",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_window_n_days_note",
          "source": "note_window_type",
          "target": "note_n_days",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}"
        },
        {
          "id": "edge_window_n_notes_note",
          "source": "note_window_type",
          "target": "note_n_notes",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_notes\"]}"
        }
      ],
      "position": {
        "x": 0,
        "y": 0,
        "zoom": 1
      }
    },
    {
      "id": "metric_impact",
      "name": "Impact",
      "nodes": [
        {
          "id": "impact_source_type",
          "key": "source_type",
          "label_json": {
            "fr": "Type de source",
            "en": "Source type"
          },
          "type_id": 4,
          "order": 0,
          "meta_json": {
            "enumOptions": [
              {
                "id": "subject",
                "label_json": {
                  "fr": "Matière",
                  "en": "Subject"
                }
              },
              {
                "id": "custom_subject",
                "label_json": {
                  "fr": "Groupe matières",
                  "en": "Custom subjects"
                }
              },
              {
                "id": "note",
                "label_json": {
                  "fr": "Note",
                  "en": "Note"
                }
              }
            ]
          },
          "help_json": {
            "fr": "Choisissez la source de l’impact",
            "en": "Select the source to evaluate impact from"
          },
          "position": {
            "x": 650,
            "y": 50
          }
        },
        {
          "id": "impact_subject_id",
          "key": "subject_id",
          "label_json": {
            "fr": "Matière",
            "en": "Subject"
          },
          "type_id": 7,
          "parent_id": "impact_source_type",
          "condition": "{\"===\":[{\"var\":\"source_type\"},\"subject\"]}",
          "order": 1,
          "meta_json": {
            "referenceEntity": "Subject"
          },
          "position": {
            "x": 50,
            "y": 350
          }
        },
        {
          "id": "impact_subject_ids",
          "key": "subject_ids",
          "label_json": {
            "fr": "Matières personnalisées",
            "en": "Custom subjects"
          },
          "type_id": 7,
          "parent_id": "impact_source_type",
          "condition": "{\"===\":[{\"var\":\"source_type\"},\"custom_subject\"]}",
          "order": 2,
          "meta_json": {
            "referenceEntity": "Subject",
            "multiple": true
          },
          "position": {
            "x": 450,
            "y": 350
          }
        },
        {
          "id": "impact_note_id",
          "key": "note_id",
          "label_json": {
            "fr": "Note",
            "en": "Note"
          },
          "type_id": 7,
          "parent_id": "impact_source_type",
          "condition": "{\"and\":[{\"===\":[{\"var\":\"source_type\"},\"note\"]},{\"===\":[{\"var\":\"variant\"},\"specific\"]}]}",
          "order": 3,
          "meta_json": {
            "referenceEntity": "Note"
          },
          "position": {
            "x": 850,
            "y": 350
          }
        },
        {
          "id": "impact_variant",
          "key": "variant",
          "label_json": {
            "fr": "Variante",
            "en": "Variant"
          },
          "type_id": 4,
          "parent_id": "impact_source_type",
          "order": 4,
          "meta_json": {
            "enumOptions": [
              {
                "id": "specific",
                "label_json": {
                  "fr": "Spécifique",
                  "en": "Specific"
                }
              },
              {
                "id": "last_note",
                "label_json": {
                  "fr": "Dernière note",
                  "en": "Last note"
                }
              },
              {
                "id": "max_impact",
                "label_json": {
                  "fr": "Plus d'impact",
                  "en": "Max impact"
                }
              }
            ]
          },
          "position": {
            "x": 1250,
            "y": 350
          }
        },
        {
          "id": "impact_polarity",
          "key": "polarity",
          "label_json": {
            "fr": "Polarité",
            "en": "Polarity"
          },
          "type_id": 4,
          "parent_id": "impact_variant",
          "condition": "{\"===\":[{\"var\":\"variant\"},\"max_impact\"]}",
          "order": 5,
          "meta_json": {
            "enumOptions": [
              {
                "id": "global",
                "label_json": {
                  "fr": "Global",
                  "en": "Global"
                }
              },
              {
                "id": "positive",
                "label_json": {
                  "fr": "Positive",
                  "en": "Positive"
                }
              },
              {
                "id": "negative",
                "label_json": {
                  "fr": "Négative",
                  "en": "Negative"
                }
              }
            ]
          },
          "position": {
            "x": 250,
            "y": 650
          }
        },
        {
          "id": "impact_target_metric",
          "key": "target_metric",
          "label_json": {
            "fr": "Cible impactée",
            "en": "Target metric"
          },
          "type_id": 4,
          "parent_id": "impact_variant",
          "order": 6,
          "meta_json": {
            "enumOptions": [
              {
                "id": "mean_global",
                "label_json": {
                  "fr": "Moyenne générale",
                  "en": "Global mean"
                }
              },
              {
                "id": "mean_subject",
                "label_json": {
                  "fr": "Moyenne d'une matière",
                  "en": "Subject mean"
                }
              },
              {
                "id": "mean_custom_subject",
                "label_json": {
                  "fr": "Moyenne matières custom",
                  "en": "Custom subjects mean"
                }
              },
              {
                "id": "median_global",
                "label_json": {
                  "fr": "Médiane générale",
                  "en": "Global median"
                }
              },
              {
                "id": "median_subject",
                "label_json": {
                  "fr": "Médiane d'une matière",
                  "en": "Subject median"
                }
              },
              {
                "id": "median_custom_subject",
                "label_json": {
                  "fr": "Médiane matières custom",
                  "en": "Custom subjects median"
                }
              }
            ]
          },
          "position": {
            "x": 650,
            "y": 650
          }
        },
        {
          "id": "impact_window_type",
          "key": "window_type",
          "label_json": {
            "fr": "Fenêtre temporelle",
            "en": "Time window"
          },
          "type_id": 4,
          "parent_id": "impact_variant",
          "order": 7,
          "meta_json": {
            "enumOptions": [
              {
                "id": "all_time",
                "label_json": {
                  "fr": "Toutes périodes",
                  "en": "All time"
                }
              },
              {
                "id": "period",
                "label_json": {
                  "fr": "Période",
                  "en": "Period"
                }
              },
              {
                "id": "last_n_days",
                "label_json": {
                  "fr": "N derniers jours",
                  "en": "Last N days"
                }
              },
              {
                "id": "last_n_notes",
                "label_json": {
                  "fr": "N dernières notes",
                  "en": "Last N notes"
                }
              }
            ]
          },
          "position": {
            "x": 2250,
            "y": 650
          }
        },
        {
          "id": "impact_target_subject_id",
          "key": "target_subject_id",
          "label_json": {
            "fr": "Matière impactée",
            "en": "Impacted subject"
          },
          "type_id": 7,
          "parent_id": "impact_target_metric",
          "condition": "{\"in\":[{\"var\":\"target_metric\"},[\"mean_subject\",\"median_subject\"]]}",
          "order": 7,
          "meta_json": {
            "referenceEntity": "Subject"
          },
          "position": {
            "x": 450,
            "y": 950
          }
        },
        {
          "id": "impact_target_subject_ids",
          "key": "target_subject_ids",
          "label_json": {
            "fr": "Matières impactées",
            "en": "Impacted subjects"
          },
          "type_id": 7,
          "parent_id": "impact_target_metric",
          "condition": "{\"in\":[{\"var\":\"target_metric\"},[\"mean_custom_subject\",\"median_custom_subject\"]]}",
          "order": 8,
          "meta_json": {
            "referenceEntity": "Subject",
            "multiple": true
          },
          "position": {
            "x": 850,
            "y": 950
          }
        },
        {
          "id": "impact_period_start",
          "key": "period_start",
          "label_json": {
            "fr": "Date de début",
            "en": "Start date"
          },
          "type_id": 5,
          "parent_id": "impact_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 1,
          "meta_json": {},
          "position": {
            "x": 1650,
            "y": 950
          }
        },
        {
          "id": "impact_period_end",
          "key": "period_end",
          "label_json": {
            "fr": "Date de fin",
            "en": "End date"
          },
          "type_id": 5,
          "parent_id": "impact_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 2,
          "meta_json": {},
          "position": {
            "x": 2050,
            "y": 950
          }
        },
        {
          "id": "impact_n_days",
          "key": "n_days",
          "label_json": {
            "fr": "Nombre de jours",
            "en": "Number of days"
          },
          "type_id": 1,
          "parent_id": "impact_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}",
          "order": 3,
          "meta_json": {
            "min": 1,
            "max": 365
          },
          "position": {
            "x": 2450,
            "y": 950
          }
        },
        {
          "id": "impact_n_notes",
          "key": "n_notes",
          "label_json": {
            "fr": "Nombre de notes",
            "en": "Number of notes"
          },
          "type_id": 1,
          "parent_id": "impact_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_notes\"]}",
          "order": 4,
          "meta_json": {
            "min": 1,
            "max": 100
          },
          "position": {
            "x": 2850,
            "y": 950
          }
        }
      ],
      "connections": [
        {
          "id": "edge_source_subject_impact",
          "source": "impact_source_type",
          "target": "impact_subject_id",
          "condition": "{\"===\":[{\"var\":\"source_type\"},\"subject\"]}"
        },
        {
          "id": "edge_source_subjects_impact",
          "source": "impact_source_type",
          "target": "impact_subject_ids",
          "condition": "{\"===\":[{\"var\":\"source_type\"},\"custom_subject\"]}"
        },
        {
          "id": "edge_source_note_impact",
          "source": "impact_source_type",
          "target": "impact_note_id",
          "condition": "{\"and\":[{\"===\":[{\"var\":\"source_type\"},\"note\"]},{\"===\":[{\"var\":\"variant\"},\"specific\"]}]}"
        },
        {
          "id": "edge_source_variant_impact",
          "source": "impact_source_type",
          "target": "impact_variant"
        },
        {
          "id": "edge_variant_polarity_impact",
          "source": "impact_variant",
          "target": "impact_polarity",
          "condition": "{\"===\":[{\"var\":\"variant\"},\"max_impact\"]}"
        },
        {
          "id": "edge_variant_target_impact",
          "source": "impact_variant",
          "target": "impact_target_metric"
        },
        {
          "id": "edge_variant_window_impact",
          "source": "impact_variant",
          "target": "impact_window_type"
        },
        {
          "id": "edge_window_start_impact",
          "source": "impact_window_type",
          "target": "impact_period_start",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_window_end_impact",
          "source": "impact_window_type",
          "target": "impact_period_end",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_window_n_days_impact",
          "source": "impact_window_type",
          "target": "impact_n_days",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}"
        },
        {
          "id": "edge_window_n_notes_impact",
          "source": "impact_window_type",
          "target": "impact_n_notes",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_notes\"]}"
        },
        {
          "id": "edge_target_subj_impact",
          "source": "impact_target_metric",
          "target": "impact_target_subject_id",
          "condition": "{\"in\":[{\"var\":\"target_metric\"},[\"mean_subject\",\"median_subject\"]]}"
        },
        {
          "id": "edge_target_subjs_impact",
          "source": "impact_target_metric",
          "target": "impact_target_subject_ids",
          "condition": "{\"in\":[{\"var\":\"target_metric\"},[\"mean_custom_subject\",\"median_custom_subject\"]]}"
        }
      ],
      "position": {
        "x": 0,
        "y": 0,
        "zoom": 1
      }
    },
    {
      "id": "metric_stddev",
      "name": "Standard Deviation",
      "nodes": [
        {
          "id": "std_scope",
          "key": "scope",
          "label_json": {
            "fr": "Périmètre",
            "en": "Scope"
          },
          "type_id": 4,
          "order": 0,
          "meta_json": {
            "enumOptions": [
              {
                "id": "global",
                "label_json": {
                  "fr": "Toutes matières",
                  "en": "All subjects"
                }
              },
              {
                "id": "subject",
                "label_json": {
                  "fr": "Une matière",
                  "en": "Single subject"
                }
              },
              {
                "id": "custom_subject",
                "label_json": {
                  "fr": "Matières personnalisées",
                  "en": "Custom subjects"
                }
              }
            ]
          },
          "help_json": {},
          "position": {
            "x": 650,
            "y": 50
          }
        },
        {
          "id": "std_subject_id",
          "key": "subject_id",
          "label_json": {
            "fr": "Matière",
            "en": "Subject"
          },
          "type_id": 7,
          "parent_id": "std_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}",
          "order": 1,
          "meta_json": {
            "referenceEntity": "Subject"
          },
          "help_json": {},
          "position": {
            "x": 50,
            "y": 350
          }
        },
        {
          "id": "std_subject_ids",
          "key": "subject_ids",
          "label_json": {
            "fr": "Matières personnalisées",
            "en": "Custom subjects"
          },
          "type_id": 7,
          "parent_id": "std_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}",
          "order": 2,
          "meta_json": {
            "referenceEntity": "Subject",
            "multiple": true
          },
          "help_json": {},
          "position": {
            "x": 450,
            "y": 350
          }
        },
        {
          "id": "std_qualifier",
          "key": "qualifier",
          "label_json": {
            "fr": "Qualificateur",
            "en": "Qualifier"
          },
          "type_id": 4,
          "parent_id": "std_scope",
          "order": 3,
          "meta_json": {
            "enumOptions": [
              {
                "id": "none",
                "label_json": {
                  "fr": "Aucun",
                  "en": "None"
                }
              },
              {
                "id": "min",
                "label_json": {
                  "fr": "Plus petit",
                  "en": "Smallest"
                }
              },
              {
                "id": "max",
                "label_json": {
                  "fr": "Plus grand",
                  "en": "Largest"
                }
              }
            ]
          },
          "help_json": {},
          "position": {
            "x": 850,
            "y": 350
          }
        },
        {
          "id": "std_window_type",
          "key": "window_type",
          "label_json": {
            "fr": "Fenêtre temporelle",
            "en": "Time window"
          },
          "type_id": 4,
          "parent_id": "std_scope",
          "order": 4,
          "meta_json": {
            "enumOptions": [
              {
                "id": "all_time",
                "label_json": {
                  "fr": "Toutes périodes",
                  "en": "All time"
                }
              },
              {
                "id": "period",
                "label_json": {
                  "fr": "Période",
                  "en": "Period"
                }
              },
              {
                "id": "last_n_days",
                "label_json": {
                  "fr": "N derniers jours",
                  "en": "Last N days"
                }
              }
            ]
          },
          "help_json": {},
          "position": {
            "x": 1250,
            "y": 350
          }
        },
        {
          "id": "std_period_start",
          "key": "period_start",
          "label_json": {
            "fr": "Date de début",
            "en": "Start date"
          },
          "type_id": 5,
          "parent_id": "std_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 1,
          "meta_json": {},
          "help_json": {},
          "position": {
            "x": 850,
            "y": 650
          }
        },
        {
          "id": "std_period_end",
          "key": "period_end",
          "label_json": {
            "fr": "Date de fin",
            "en": "End date"
          },
          "type_id": 5,
          "parent_id": "std_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 2,
          "meta_json": {},
          "help_json": {},
          "position": {
            "x": 1250,
            "y": 650
          }
        },
        {
          "id": "std_n_days",
          "key": "n_days",
          "label_json": {
            "fr": "Nombre de jours",
            "en": "Number of days"
          },
          "type_id": 1,
          "parent_id": "std_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}",
          "order": 3,
          "meta_json": {
            "min": 1,
            "max": 365
          },
          "help_json": {},
          "position": {
            "x": 1650,
            "y": 650
          }
        }
      ],
      "connections": [
        {
          "id": "edge_scope_subject_std",
          "source": "std_scope",
          "target": "std_subject_id",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}"
        },
        {
          "id": "edge_scope_subjects_std",
          "source": "std_scope",
          "target": "std_subject_ids",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}"
        },
        {
          "id": "edge_scope_qual_std",
          "source": "std_scope",
          "target": "std_qualifier"
        },
        {
          "id": "edge_scope_window_std",
          "source": "std_scope",
          "target": "std_window_type"
        },
        {
          "id": "edge_window_start_std",
          "source": "std_window_type",
          "target": "std_period_start",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_window_end_std",
          "source": "std_window_type",
          "target": "std_period_end",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_window_ndays_std",
          "source": "std_window_type",
          "target": "std_n_days",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}"
        }
      ],
      "position": {
        "x": 0,
        "y": 0,
        "zoom": 1
      }
    },
    {
      "id": "metric_variance",
      "name": "Variance",
      "nodes": [
        {
          "id": "var_scope",
          "key": "scope",
          "label_json": {
            "fr": "Périmètre",
            "en": "Scope"
          },
          "type_id": 4,
          "order": 0,
          "meta_json": {
            "enumOptions": [
              {
                "id": "global",
                "label_json": {
                  "fr": "Toutes matières",
                  "en": "All subjects"
                }
              },
              {
                "id": "subject",
                "label_json": {
                  "fr": "Une matière",
                  "en": "Single subject"
                }
              },
              {
                "id": "custom_subject",
                "label_json": {
                  "fr": "Matières personnalisées",
                  "en": "Custom subjects"
                }
              }
            ]
          },
          "help_json": {},
          "position": {
            "x": 650,
            "y": 50
          }
        },
        {
          "id": "var_subject_id",
          "key": "subject_id",
          "label_json": {
            "fr": "Matière",
            "en": "Subject"
          },
          "type_id": 7,
          "parent_id": "var_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}",
          "order": 1,
          "meta_json": {
            "referenceEntity": "Subject"
          },
          "help_json": {},
          "position": {
            "x": 50,
            "y": 350
          }
        },
        {
          "id": "var_subject_ids",
          "key": "subject_ids",
          "label_json": {
            "fr": "Matières personnalisées",
            "en": "Custom subjects"
          },
          "type_id": 7,
          "parent_id": "var_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}",
          "order": 2,
          "meta_json": {
            "referenceEntity": "Subject",
            "multiple": true
          },
          "help_json": {},
          "position": {
            "x": 450,
            "y": 350
          }
        },
        {
          "id": "var_qualifier",
          "key": "qualifier",
          "label_json": {
            "fr": "Qualificateur",
            "en": "Qualifier"
          },
          "type_id": 4,
          "parent_id": "var_scope",
          "order": 3,
          "meta_json": {
            "enumOptions": [
              {
                "id": "none",
                "label_json": {
                  "fr": "Aucun",
                  "en": "None"
                }
              },
              {
                "id": "min",
                "label_json": {
                  "fr": "Plus petite variance",
                  "en": "Smallest variance"
                }
              },
              {
                "id": "max",
                "label_json": {
                  "fr": "Plus grande variance",
                  "en": "Largest variance"
                }
              }
            ]
          },
          "help_json": {},
          "position": {
            "x": 850,
            "y": 350
          }
        },
        {
          "id": "var_window_type",
          "key": "window_type",
          "label_json": {
            "fr": "Fenêtre temporelle",
            "en": "Time window"
          },
          "type_id": 4,
          "parent_id": "var_scope",
          "order": 4,
          "meta_json": {
            "enumOptions": [
              {
                "id": "all_time",
                "label_json": {
                  "fr": "Toutes périodes",
                  "en": "All time"
                }
              },
              {
                "id": "period",
                "label_json": {
                  "fr": "Période",
                  "en": "Period"
                }
              },
              {
                "id": "last_n_days",
                "label_json": {
                  "fr": "N derniers jours",
                  "en": "Last N days"
                }
              }
            ]
          },
          "help_json": {},
          "position": {
            "x": 1250,
            "y": 350
          }
        },
        {
          "id": "var_period_start",
          "key": "period_start",
          "label_json": {
            "fr": "Date de début",
            "en": "Start date"
          },
          "type_id": 5,
          "parent_id": "var_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 1,
          "meta_json": {},
          "help_json": {},
          "position": {
            "x": 850,
            "y": 650
          }
        },
        {
          "id": "var_period_end",
          "key": "period_end",
          "label_json": {
            "fr": "Date de fin",
            "en": "End date"
          },
          "type_id": 5,
          "parent_id": "var_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 2,
          "meta_json": {},
          "help_json": {},
          "position": {
            "x": 1250,
            "y": 650
          }
        },
        {
          "id": "var_n_days",
          "key": "n_days",
          "label_json": {
            "fr": "Nombre de jours",
            "en": "Number of days"
          },
          "type_id": 1,
          "parent_id": "var_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}",
          "order": 3,
          "meta_json": {
            "min": 1,
            "max": 365
          },
          "help_json": {},
          "position": {
            "x": 1650,
            "y": 650
          }
        }
      ],
      "connections": [
        {
          "id": "edge_scope_subject_var",
          "source": "var_scope",
          "target": "var_subject_id",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}"
        },
        {
          "id": "edge_scope_subjects_var",
          "source": "var_scope",
          "target": "var_subject_ids",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}"
        },
        {
          "id": "edge_scope_qual_var",
          "source": "var_scope",
          "target": "var_qualifier"
        },
        {
          "id": "edge_scope_window_var",
          "source": "var_scope",
          "target": "var_window_type"
        },
        {
          "id": "edge_window_start_var",
          "source": "var_window_type",
          "target": "var_period_start",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_window_end_var",
          "source": "var_window_type",
          "target": "var_period_end",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_window_ndays_var",
          "source": "var_window_type",
          "target": "var_n_days",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}"
        }
      ],
      "position": {
        "x": 0,
        "y": 0,
        "zoom": 1
      }
    },
    {
      "id": "metric_cov",
      "name": "Coefficient of Variation",
      "nodes": [
        {
          "id": "cov_scope",
          "key": "scope",
          "label_json": {
            "fr": "Périmètre",
            "en": "Scope"
          },
          "type_id": 4,
          "order": 0,
          "meta_json": {
            "enumOptions": [
              {
                "id": "global",
                "label_json": {
                  "fr": "Toutes matières",
                  "en": "All subjects"
                }
              },
              {
                "id": "subject",
                "label_json": {
                  "fr": "Une matière",
                  "en": "Single subject"
                }
              },
              {
                "id": "custom_subject",
                "label_json": {
                  "fr": "Matières personnalisées",
                  "en": "Custom subjects"
                }
              }
            ]
          },
          "help_json": {},
          "position": {
            "x": 650,
            "y": 50
          }
        },
        {
          "id": "cov_subject_id",
          "key": "subject_id",
          "label_json": {
            "fr": "Matière",
            "en": "Subject"
          },
          "type_id": 7,
          "parent_id": "cov_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}",
          "order": 1,
          "meta_json": {
            "referenceEntity": "Subject"
          },
          "position": {
            "x": 50,
            "y": 350
          }
        },
        {
          "id": "cov_subject_ids",
          "key": "subject_ids",
          "label_json": {
            "fr": "Matières personnalisées",
            "en": "Custom subjects"
          },
          "type_id": 7,
          "parent_id": "cov_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}",
          "order": 2,
          "meta_json": {
            "referenceEntity": "Subject",
            "multiple": true
          },
          "position": {
            "x": 450,
            "y": 350
          }
        },
        {
          "id": "cov_qualifier",
          "key": "qualifier",
          "label_json": {
            "fr": "Qualificateur",
            "en": "Qualifier"
          },
          "type_id": 4,
          "parent_id": "cov_scope",
          "order": 3,
          "meta_json": {
            "enumOptions": [
              {
                "id": "none",
                "label_json": {
                  "fr": "Aucun",
                  "en": "None"
                }
              },
              {
                "id": "min",
                "label_json": {
                  "fr": "Plus petit CV",
                  "en": "Smallest CV"
                }
              },
              {
                "id": "max",
                "label_json": {
                  "fr": "Plus grand CV",
                  "en": "Largest CV"
                }
              }
            ]
          },
          "position": {
            "x": 850,
            "y": 350
          }
        },
        {
          "id": "cov_window_type",
          "key": "window_type",
          "label_json": {
            "fr": "Fenêtre temporelle",
            "en": "Time window"
          },
          "type_id": 4,
          "parent_id": "cov_scope",
          "order": 4,
          "meta_json": {
            "enumOptions": [
              {
                "id": "all_time",
                "label_json": {
                  "fr": "Toutes périodes",
                  "en": "All time"
                }
              },
              {
                "id": "period",
                "label_json": {
                  "fr": "Période",
                  "en": "Period"
                }
              },
              {
                "id": "last_n_days",
                "label_json": {
                  "fr": "N derniers jours",
                  "en": "Last N days"
                }
              }
            ]
          },
          "position": {
            "x": 1250,
            "y": 350
          }
        },
        {
          "id": "cov_period_start",
          "key": "period_start",
          "label_json": {
            "fr": "Date de début",
            "en": "Start date"
          },
          "type_id": 5,
          "parent_id": "cov_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 1,
          "meta_json": {},
          "position": {
            "x": 850,
            "y": 650
          }
        },
        {
          "id": "cov_period_end",
          "key": "period_end",
          "label_json": {
            "fr": "Date de fin",
            "en": "End date"
          },
          "type_id": 5,
          "parent_id": "cov_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 2,
          "meta_json": {},
          "position": {
            "x": 1250,
            "y": 650
          }
        },
        {
          "id": "cov_n_days",
          "key": "n_days",
          "label_json": {
            "fr": "Nombre de jours",
            "en": "Number of days"
          },
          "type_id": 1,
          "parent_id": "cov_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}",
          "order": 3,
          "meta_json": {
            "min": 1,
            "max": 365
          },
          "position": {
            "x": 1650,
            "y": 650
          }
        }
      ],
      "connections": [
        {
          "id": "edge_scope_subject_cov",
          "source": "cov_scope",
          "target": "cov_subject_id",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}"
        },
        {
          "id": "edge_scope_subjects_cov",
          "source": "cov_scope",
          "target": "cov_subject_ids",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}"
        },
        {
          "id": "edge_scope_qual_cov",
          "source": "cov_scope",
          "target": "cov_qualifier"
        },
        {
          "id": "edge_scope_window_cov",
          "source": "cov_scope",
          "target": "cov_window_type"
        },
        {
          "id": "edge_window_start_cov",
          "source": "cov_window_type",
          "target": "cov_period_start",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_window_end_cov",
          "source": "cov_window_type",
          "target": "cov_period_end",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_window_ndays_cov",
          "source": "cov_window_type",
          "target": "cov_n_days",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}"
        }
      ],
      "position": {
        "x": 0,
        "y": 0,
        "zoom": 1
      }
    },
    {
      "id": "metric_streak",
      "name": "Streak",
      "nodes": [
        {
          "id": "streak_scope",
          "key": "scope",
          "label_json": {
            "fr": "Périmètre",
            "en": "Scope"
          },
          "type_id": 4,
          "order": 0,
          "meta_json": {
            "enumOptions": [
              {
                "id": "global",
                "label_json": {
                  "fr": "Toutes matières",
                  "en": "All subjects"
                }
              },
              {
                "id": "subject",
                "label_json": {
                  "fr": "Une matière",
                  "en": "Single subject"
                }
              },
              {
                "id": "custom_subject",
                "label_json": {
                  "fr": "Matières personnalisées",
                  "en": "Custom subjects"
                }
              }
            ]
          },
          "help_json": {},
          "position": {
            "x": 450,
            "y": 50
          }
        },
        {
          "id": "streak_subject_id",
          "key": "subject_id",
          "label_json": {
            "fr": "Matière",
            "en": "Subject"
          },
          "type_id": 7,
          "parent_id": "streak_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}",
          "order": 1,
          "meta_json": {
            "referenceEntity": "Subject"
          },
          "position": {
            "x": 50,
            "y": 350
          }
        },
        {
          "id": "streak_subject_ids",
          "key": "subject_ids",
          "label_json": {
            "fr": "Matières personnalisées",
            "en": "Custom subjects"
          },
          "type_id": 7,
          "parent_id": "streak_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}",
          "order": 2,
          "meta_json": {
            "referenceEntity": "Subject",
            "multiple": true
          },
          "position": {
            "x": 450,
            "y": 350
          }
        },
        {
          "id": "streak_window_type",
          "key": "window_type",
          "label_json": {
            "fr": "Fenêtre temporelle",
            "en": "Time window"
          },
          "type_id": 4,
          "parent_id": "streak_scope",
          "order": 3,
          "meta_json": {
            "enumOptions": [
              {
                "id": "all_time",
                "label_json": {
                  "fr": "Toutes périodes",
                  "en": "All time"
                }
              },
              {
                "id": "period",
                "label_json": {
                  "fr": "Période",
                  "en": "Period"
                }
              }
            ]
          },
          "position": {
            "x": 850,
            "y": 350
          }
        },
        {
          "id": "streak_period_start",
          "key": "period_start",
          "label_json": {
            "fr": "Date de début",
            "en": "Start date"
          },
          "type_id": 5,
          "parent_id": "streak_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 1,
          "meta_json": {},
          "position": {
            "x": 650,
            "y": 650
          }
        },
        {
          "id": "streak_period_end",
          "key": "period_end",
          "label_json": {
            "fr": "Date de fin",
            "en": "End date"
          },
          "type_id": 5,
          "parent_id": "streak_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 2,
          "meta_json": {},
          "position": {
            "x": 1050,
            "y": 650
          }
        }
      ],
      "connections": [
        {
          "id": "edge_scope_subject_streak",
          "source": "streak_scope",
          "target": "streak_subject_id",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}"
        },
        {
          "id": "edge_scope_subjects_streak",
          "source": "streak_scope",
          "target": "streak_subject_ids",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}"
        },
        {
          "id": "edge_scope_window_streak",
          "source": "streak_scope",
          "target": "streak_window_type"
        },
        {
          "id": "edge_window_start_streak",
          "source": "streak_window_type",
          "target": "streak_period_start",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_window_end_streak",
          "source": "streak_window_type",
          "target": "streak_period_end",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        }
      ],
      "position": {
        "x": 0,
        "y": 0,
        "zoom": 1
      }
    },
    {
      "id": "metric_trend",
      "name": "Trend",
      "nodes": [
        {
          "id": "trend_scope",
          "key": "scope",
          "label_json": {
            "fr": "Périmètre",
            "en": "Scope"
          },
          "type_id": 4,
          "order": 0,
          "meta_json": {
            "enumOptions": [
              {
                "id": "global",
                "label_json": {
                  "fr": "Toutes matières",
                  "en": "All subjects"
                }
              },
              {
                "id": "subject",
                "label_json": {
                  "fr": "Une matière",
                  "en": "Single subject"
                }
              },
              {
                "id": "custom_subject",
                "label_json": {
                  "fr": "Matières personnalisées",
                  "en": "Custom subjects"
                }
              }
            ]
          },
          "help_json": {},
          "position": {
            "x": 450,
            "y": 50
          }
        },
        {
          "id": "trend_subject_id",
          "key": "subject_id",
          "label_json": {
            "fr": "Matière",
            "en": "Subject"
          },
          "type_id": 7,
          "parent_id": "trend_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}",
          "order": 1,
          "meta_json": {
            "referenceEntity": "Subject"
          },
          "position": {
            "x": 50,
            "y": 350
          }
        },
        {
          "id": "trend_subject_ids",
          "key": "subject_ids",
          "label_json": {
            "fr": "Matières personnalisées",
            "en": "Custom subjects"
          },
          "type_id": 7,
          "parent_id": "trend_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}",
          "order": 2,
          "meta_json": {
            "referenceEntity": "Subject",
            "multiple": true
          },
          "position": {
            "x": 450,
            "y": 350
          }
        },
        {
          "id": "trend_window_type",
          "key": "window_type",
          "label_json": {
            "fr": "Fenêtre temporelle",
            "en": "Time window"
          },
          "type_id": 4,
          "parent_id": "trend_scope",
          "order": 3,
          "meta_json": {
            "enumOptions": [
              {
                "id": "all_time",
                "label_json": {
                  "fr": "Toutes périodes",
                  "en": "All time"
                }
              },
              {
                "id": "period",
                "label_json": {
                  "fr": "Période",
                  "en": "Period"
                }
              },
              {
                "id": "last_n_days",
                "label_json": {
                  "fr": "N derniers jours",
                  "en": "Last N days"
                }
              }
            ]
          },
          "position": {
            "x": 850,
            "y": 350
          }
        },
        {
          "id": "trend_period_start",
          "key": "period_start",
          "label_json": {
            "fr": "Date de début",
            "en": "Start date"
          },
          "type_id": 5,
          "parent_id": "trend_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 1,
          "meta_json": {},
          "position": {
            "x": 450,
            "y": 650
          }
        },
        {
          "id": "trend_period_end",
          "key": "period_end",
          "label_json": {
            "fr": "Date de fin",
            "en": "End date"
          },
          "type_id": 5,
          "parent_id": "trend_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 2,
          "meta_json": {},
          "position": {
            "x": 850,
            "y": 650
          }
        },
        {
          "id": "trend_n_days",
          "key": "n_days",
          "label_json": {
            "fr": "Nombre de jours",
            "en": "Number of days"
          },
          "type_id": 1,
          "parent_id": "trend_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}",
          "order": 3,
          "meta_json": {
            "min": 1,
            "max": 365
          },
          "position": {
            "x": 1250,
            "y": 650
          }
        }
      ],
      "connections": [
        {
          "id": "edge_scope_subject_trend",
          "source": "trend_scope",
          "target": "trend_subject_id",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}"
        },
        {
          "id": "edge_scope_subjects_trend",
          "source": "trend_scope",
          "target": "trend_subject_ids",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}"
        },
        {
          "id": "edge_scope_window_trend",
          "source": "trend_scope",
          "target": "trend_window_type"
        },
        {
          "id": "edge_window_start_trend",
          "source": "trend_window_type",
          "target": "trend_period_start",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_window_end_trend",
          "source": "trend_window_type",
          "target": "trend_period_end",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_window_ndays_trend",
          "source": "trend_window_type",
          "target": "trend_n_days",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}"
        }
      ],
      "position": {
        "x": 0,
        "y": 0,
        "zoom": 1
      }
    },
    {
      "id": "metric_count_gt",
      "name": "Count > X",
      "nodes": [
        {
          "id": "gt_scope",
          "key": "scope",
          "type_id": 4,
          "label_json": {
            "fr": "Périmètre",
            "en": "Scope"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "global",
                "label_json": {
                  "fr": "Toutes matières",
                  "en": "All subjects"
                }
              },
              {
                "id": "subject",
                "label_json": {
                  "fr": "Une matière",
                  "en": "Single subject"
                }
              },
              {
                "id": "custom_subject",
                "label_json": {
                  "fr": "Matières personnalisées",
                  "en": "Custom subjects"
                }
              }
            ]
          },
          "order": 0,
          "position": {
            "x": 450,
            "y": 50
          }
        },
        {
          "id": "gt_subject_id",
          "key": "subject_id",
          "type_id": 7,
          "label_json": {
            "fr": "Matière",
            "en": "Subject"
          },
          "parent_id": "gt_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}",
          "order": 1,
          "meta_json": {
            "referenceEntity": "Subject"
          },
          "position": {
            "x": 50,
            "y": 350
          }
        },
        {
          "id": "gt_subject_ids",
          "key": "subject_ids",
          "type_id": 7,
          "label_json": {
            "fr": "Matières personnalisées",
            "en": "Custom subjects"
          },
          "parent_id": "gt_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}",
          "order": 2,
          "meta_json": {
            "referenceEntity": "Subject",
            "multiple": true
          },
          "position": {
            "x": 450,
            "y": 350
          }
        },
        {
          "id": "gt_threshold",
          "key": "threshold",
          "type_id": 2,
          "label_json": {
            "fr": "Seuil X",
            "en": "Threshold X"
          },
          "parent_id": "gt_scope",
          "order": 3,
          "meta_json": {
            "min": 0,
            "max": 20,
            "step": 0.1
          },
          "position": {
            "x": 703.2315396017306,
            "y": -162.84186223311337
          }
        },
        {
          "id": "gt_mode",
          "key": "mode",
          "type_id": 4,
          "label_json": {
            "fr": "Mode de comptage",
            "en": "Counting mode"
          },
          "parent_id": "gt_scope",
          "order": 4,
          "meta_json": {
            "enumOptions": [
              {
                "id": "cumulative",
                "label_json": {
                  "fr": "Cumulée",
                  "en": "Cumulative"
                }
              },
              {
                "id": "consecutive",
                "label_json": {
                  "fr": "D'affilée",
                  "en": "Consecutive"
                }
              }
            ]
          },
          "position": {
            "x": 449.8970135542995,
            "y": -164.1874425315944
          }
        },
        {
          "id": "gt_window_type",
          "key": "window_type",
          "type_id": 4,
          "label_json": {
            "fr": "Fenêtre temporelle",
            "en": "Time window"
          },
          "parent_id": "gt_scope",
          "order": 5,
          "meta_json": {
            "enumOptions": [
              {
                "id": "all_time",
                "label_json": {
                  "fr": "Toutes périodes",
                  "en": "All time"
                }
              },
              {
                "id": "period",
                "label_json": {
                  "fr": "Période",
                  "en": "Period"
                }
              },
              {
                "id": "last_n_days",
                "label_json": {
                  "fr": "N derniers jours",
                  "en": "Last N days"
                }
              }
            ]
          },
          "position": {
            "x": 850,
            "y": 350
          }
        },
        {
          "id": "gt_period_start",
          "key": "period_start",
          "type_id": 5,
          "label_json": {
            "fr": "Date de début",
            "en": "Start date"
          },
          "parent_id": "gt_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 1,
          "meta_json": {},
          "position": {
            "x": 450,
            "y": 650
          }
        },
        {
          "id": "gt_period_end",
          "key": "period_end",
          "type_id": 5,
          "label_json": {
            "fr": "Date de fin",
            "en": "End date"
          },
          "parent_id": "gt_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 2,
          "meta_json": {},
          "position": {
            "x": 850,
            "y": 650
          }
        },
        {
          "id": "gt_n_days",
          "key": "n_days",
          "type_id": 1,
          "label_json": {
            "fr": "Nombre de jours",
            "en": "Number of days"
          },
          "parent_id": "gt_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}",
          "order": 3,
          "meta_json": {
            "min": 1,
            "max": 365
          },
          "position": {
            "x": 1250,
            "y": 650
          }
        }
      ],
      "connections": [
        {
          "id": "edge_gt_subject",
          "source": "gt_scope",
          "target": "gt_subject_id",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}"
        },
        {
          "id": "edge_gt_subjects",
          "source": "gt_scope",
          "target": "gt_subject_ids",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}"
        },
        {
          "id": "edge_gt_window",
          "source": "gt_scope",
          "target": "gt_window_type"
        },
        {
          "id": "edge_gt_start",
          "source": "gt_window_type",
          "target": "gt_period_start",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_gt_end",
          "source": "gt_window_type",
          "target": "gt_period_end",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_gt_ndays",
          "source": "gt_window_type",
          "target": "gt_n_days",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}"
        }
      ],
      "position": {
        "x": 0,
        "y": 0,
        "zoom": 1
      }
    },
    {
      "id": "metric_mean_delay",
      "name": "Mean delay between notes",
      "nodes": [
        {
          "id": "md_scope",
          "key": "scope",
          "type_id": 4,
          "order": 0,
          "label_json": {
            "fr": "Périmètre",
            "en": "Scope"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "global",
                "label_json": {
                  "fr": "Toutes matières",
                  "en": "All subjects"
                }
              },
              {
                "id": "subject",
                "label_json": {
                  "fr": "Une matière",
                  "en": "Single subject"
                }
              },
              {
                "id": "custom_subject",
                "label_json": {
                  "fr": "Matières personnalisées",
                  "en": "Custom subjects"
                }
              }
            ]
          },
          "position": {
            "x": 450,
            "y": 50
          }
        },
        {
          "id": "md_subject_id",
          "key": "subject_id",
          "type_id": 7,
          "label_json": {
            "fr": "Matière",
            "en": "Subject"
          },
          "parent_id": "md_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}",
          "order": 1,
          "meta_json": {
            "referenceEntity": "Subject"
          },
          "position": {
            "x": 50,
            "y": 350
          }
        },
        {
          "id": "md_subject_ids",
          "key": "subject_ids",
          "type_id": 7,
          "label_json": {
            "fr": "Matières personnalisées",
            "en": "Custom subjects"
          },
          "parent_id": "md_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}",
          "order": 2,
          "meta_json": {
            "referenceEntity": "Subject",
            "multiple": true
          },
          "position": {
            "x": 450,
            "y": 350
          }
        },
        {
          "id": "md_window_type",
          "key": "window_type",
          "type_id": 4,
          "order": 3,
          "label_json": {
            "fr": "Fenêtre temporelle",
            "en": "Time window"
          },
          "parent_id": "md_scope",
          "meta_json": {
            "enumOptions": [
              {
                "id": "all_time",
                "label_json": {
                  "fr": "Toutes périodes",
                  "en": "All time"
                }
              },
              {
                "id": "period",
                "label_json": {
                  "fr": "Période",
                  "en": "Period"
                }
              },
              {
                "id": "last_n_days",
                "label_json": {
                  "fr": "N derniers jours",
                  "en": "Last N days"
                }
              }
            ]
          },
          "position": {
            "x": 850,
            "y": 350
          }
        },
        {
          "id": "md_period_start",
          "key": "period_start",
          "type_id": 5,
          "label_json": {
            "fr": "Date de début",
            "en": "Start date"
          },
          "parent_id": "md_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 1,
          "position": {
            "x": 450,
            "y": 650
          },
          "meta_json": {}
        },
        {
          "id": "md_period_end",
          "key": "period_end",
          "type_id": 5,
          "label_json": {
            "fr": "Date de fin",
            "en": "End date"
          },
          "parent_id": "md_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 2,
          "position": {
            "x": 850,
            "y": 650
          },
          "meta_json": {}
        },
        {
          "id": "md_n_days",
          "key": "n_days",
          "type_id": 1,
          "label_json": {
            "fr": "Nombre de jours",
            "en": "Number of days"
          },
          "parent_id": "md_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}",
          "order": 3,
          "meta_json": {
            "min": 1,
            "max": 365
          },
          "position": {
            "x": 1250,
            "y": 650
          }
        }
      ],
      "connections": [
        {
          "id": "edge_md_subject",
          "source": "md_scope",
          "target": "md_subject_id",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}"
        },
        {
          "id": "edge_md_subjects",
          "source": "md_scope",
          "target": "md_subject_ids",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}"
        },
        {
          "id": "edge_md_window",
          "source": "md_scope",
          "target": "md_window_type"
        },
        {
          "id": "edge_md_start",
          "source": "md_window_type",
          "target": "md_period_start",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_md_end",
          "source": "md_window_type",
          "target": "md_period_end",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_md_ndays",
          "source": "md_window_type",
          "target": "md_n_days",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}"
        }
      ],
      "position": {
        "x": 0,
        "y": 0,
        "zoom": 1
      }
    },
    {
      "id": "metric_mean_count",
      "name": "Mean number of notes",
      "nodes": [
        {
          "id": "mc_scope",
          "key": "scope",
          "type_id": 4,
          "order": 0,
          "label_json": {
            "fr": "Périmètre",
            "en": "Scope"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "global",
                "label_json": {
                  "fr": "Général",
                  "en": "Global"
                }
              },
              {
                "id": "subject",
                "label_json": {
                  "fr": "Matière",
                  "en": "Subject"
                }
              },
              {
                "id": "custom_subject",
                "label_json": {
                  "fr": "Matières personnalisées",
                  "en": "Custom subjects"
                }
              }
            ]
          },
          "position": {
            "x": 450,
            "y": 50
          }
        },
        {
          "id": "mc_subject_id",
          "key": "subject_id",
          "type_id": 7,
          "parent_id": "mc_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}",
          "order": 1,
          "label_json": {
            "fr": "Matière",
            "en": "Subject"
          },
          "meta_json": {
            "referenceEntity": "Subject"
          },
          "position": {
            "x": 50,
            "y": 350
          }
        },
        {
          "id": "mc_subject_ids",
          "key": "subject_ids",
          "type_id": 7,
          "parent_id": "mc_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}",
          "order": 2,
          "label_json": {
            "fr": "Matières personnalisées",
            "en": "Custom subjects"
          },
          "meta_json": {
            "referenceEntity": "Subject",
            "multiple": true
          },
          "position": {
            "x": 450,
            "y": 350
          }
        },
        {
          "id": "mc_variant",
          "key": "variant",
          "type_id": 4,
          "parent_id": "mc_scope",
          "order": 3,
          "label_json": {
            "fr": "Mode de calcul",
            "en": "Calculation mode"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "per_day",
                "label_json": {
                  "fr": "Par jour",
                  "en": "Per day"
                }
              },
              {
                "id": "per_subject",
                "label_json": {
                  "fr": "Par matière",
                  "en": "Per subject"
                }
              }
            ]
          },
          "position": {
            "x": 451.1408414241968,
            "y": -155.3574511775896
          }
        },
        {
          "id": "mc_window_type",
          "key": "window_type",
          "type_id": 4,
          "parent_id": "mc_scope",
          "order": 4,
          "label_json": {
            "fr": "Fenêtre temporelle",
            "en": "Time window"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "all_time",
                "label_json": {
                  "fr": "Toutes périodes",
                  "en": "All time"
                }
              },
              {
                "id": "period",
                "label_json": {
                  "fr": "Période",
                  "en": "Period"
                }
              },
              {
                "id": "last_n_days",
                "label_json": {
                  "fr": "N derniers jours",
                  "en": "Last N days"
                }
              }
            ]
          },
          "position": {
            "x": 850,
            "y": 350
          }
        },
        {
          "id": "mc_period_start",
          "key": "period_start",
          "type_id": 5,
          "parent_id": "mc_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 1,
          "label_json": {
            "fr": "Date de début",
            "en": "Start date"
          },
          "position": {
            "x": 450,
            "y": 650
          },
          "meta_json": {}
        },
        {
          "id": "mc_period_end",
          "key": "period_end",
          "type_id": 5,
          "parent_id": "mc_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 2,
          "label_json": {
            "fr": "Date de fin",
            "en": "End date"
          },
          "position": {
            "x": 850,
            "y": 650
          },
          "meta_json": {}
        },
        {
          "id": "mc_n_days",
          "key": "n_days",
          "type_id": 1,
          "parent_id": "mc_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}",
          "order": 3,
          "label_json": {
            "fr": "Nombre de jours",
            "en": "Number of days"
          },
          "meta_json": {
            "min": 1,
            "max": 365
          },
          "position": {
            "x": 1250,
            "y": 650
          }
        }
      ],
      "connections": [
        {
          "id": "edge_mc_subject",
          "source": "mc_scope",
          "target": "mc_subject_id",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}"
        },
        {
          "id": "edge_mc_subjects",
          "source": "mc_scope",
          "target": "mc_subject_ids",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}"
        },
        {
          "id": "edge_mc_window",
          "source": "mc_scope",
          "target": "mc_window_type"
        },
        {
          "id": "edge_mc_start",
          "source": "mc_window_type",
          "target": "mc_period_start",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_mc_end",
          "source": "mc_window_type",
          "target": "mc_period_end",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_mc_ndays",
          "source": "mc_window_type",
          "target": "mc_n_days",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}"
        }
      ],
      "position": {
        "x": 0,
        "y": 0,
        "zoom": 1
      }
    },
    {
      "id": "metric_exams",
      "name": "Exams count",
      "nodes": [
        {
          "id": "ex_variant",
          "key": "variant",
          "type_id": 4,
          "order": 0,
          "label_json": {
            "fr": "Type",
            "en": "Type"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "upcoming",
                "label_json": {
                  "fr": "Examens à venir",
                  "en": "Upcoming exams"
                }
              },
              {
                "id": "past",
                "label_json": {
                  "fr": "Examens passés",
                  "en": "Past exams"
                }
              }
            ]
          },
          "position": {
            "x": 50,
            "y": 50
          }
        },
        {
          "id": "ex_horizon",
          "key": "horizon_days",
          "type_id": 1,
          "parent_id": "ex_variant",
          "order": 1,
          "label_json": {
            "fr": "Horizon (jours)",
            "en": "Horizon (days)"
          },
          "meta_json": {
            "min": 1,
            "max": 365,
            "defaultValue": "30"
          },
          "position": {
            "x": 296,
            "y": 51
          }
        }
      ],
      "connections": [],
      "position": {
        "x": 0,
        "y": 0,
        "zoom": 1
      }
    },
    {
      "id": "metric_threshold_check",
      "name": "Threshold check",
      "nodes": [
        {
          "id": "tc_scope",
          "key": "scope",
          "type_id": 4,
          "order": 0,
          "label_json": {
            "fr": "Périmètre",
            "en": "Scope"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "global",
                "label_json": {
                  "fr": "Toutes matières",
                  "en": "All subjects"
                }
              },
              {
                "id": "subject",
                "label_json": {
                  "fr": "Une matière",
                  "en": "Single subject"
                }
              },
              {
                "id": "custom_subject",
                "label_json": {
                  "fr": "Matières personnalisées",
                  "en": "Custom subjects"
                }
              }
            ]
          },
          "position": {
            "x": 250,
            "y": 50
          }
        },
        {
          "id": "tc_subject_id",
          "key": "subject_id",
          "type_id": 7,
          "parent_id": "tc_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}",
          "order": 1,
          "label_json": {
            "fr": "Matière",
            "en": "Subject"
          },
          "meta_json": {
            "referenceEntity": "Subject"
          },
          "position": {
            "x": 50,
            "y": 350
          }
        },
        {
          "id": "tc_subject_ids",
          "key": "subject_ids",
          "type_id": 7,
          "parent_id": "tc_scope",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}",
          "order": 2,
          "label_json": {
            "fr": "Matières personnalisées",
            "en": "Custom subjects"
          },
          "meta_json": {
            "referenceEntity": "Subject",
            "multiple": true
          },
          "position": {
            "x": 450,
            "y": 350
          }
        },
        {
          "id": "tc_metric",
          "key": "metric",
          "type_id": 4,
          "order": 3,
          "parent_id": "tc_scope",
          "label_json": {
            "fr": "Indicateur",
            "en": "Metric"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "mean",
                "label_json": {
                  "fr": "Moyenne",
                  "en": "Mean"
                }
              },
              {
                "id": "median",
                "label_json": {
                  "fr": "Médiane",
                  "en": "Median"
                }
              }
            ]
          },
          "position": {
            "x": 250.5242913192988,
            "y": -160.27189385928125
          }
        },
        {
          "id": "tc_operator",
          "key": "operator",
          "type_id": 4,
          "order": 4,
          "parent_id": "tc_scope",
          "label_json": {
            "fr": "Comparaison",
            "en": "Comparison"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "gt",
                "label_json": {
                  "fr": ">",
                  "en": ">"
                }
              },
              {
                "id": "lt",
                "label_json": {
                  "fr": "<",
                  "en": "<"
                }
              }
            ]
          },
          "position": {
            "x": 473.229821750776,
            "y": -161.00976579513863
          }
        },
        {
          "id": "tc_threshold",
          "key": "threshold",
          "type_id": 2,
          "order": 5,
          "parent_id": "tc_scope",
          "label_json": {
            "fr": "Seuil",
            "en": "Threshold"
          },
          "meta_json": {
            "min": 0,
            "max": 20,
            "step": 0.1
          },
          "position": {
            "x": 698.5761292229427,
            "y": -160.86737871743293
          }
        }
      ],
      "connections": [
        {
          "id": "edge_tc_subject",
          "source": "tc_scope",
          "target": "tc_subject_id",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"subject\"]}"
        },
        {
          "id": "edge_tc_subjects",
          "source": "tc_scope",
          "target": "tc_subject_ids",
          "condition": "{\"===\":[{\"var\":\"scope\"},\"custom_subject\"]}"
        }
      ],
      "position": {
        "x": 0,
        "y": 0,
        "zoom": 1
      }
    },
    {
      "id": "metric_risk_subject",
      "name": "Subject at risk",
      "nodes": [
        {
          "id": "risk_threshold",
          "key": "threshold",
          "type_id": 2,
          "order": 0,
          "label_json": {
            "fr": "Seuil critique",
            "en": "Critical threshold"
          },
          "meta_json": {
            "min": 0,
            "max": 20,
            "step": 0.1,
            "defaultValue": "10"
          },
          "position": {
            "x": 619.8144695921051,
            "y": -177.7099490226026
          }
        },
        {
          "id": "risk_window_type",
          "key": "window_type",
          "type_id": 4,
          "order": 1,
          "parent_id": "risk_threshold",
          "label_json": {
            "fr": "Fenêtre temporelle",
            "en": "Time window"
          },
          "meta_json": {
            "enumOptions": [
              {
                "id": "all_time",
                "label_json": {
                  "fr": "Toutes périodes",
                  "en": "All time"
                }
              },
              {
                "id": "period",
                "label_json": {
                  "fr": "Période",
                  "en": "Period"
                }
              },
              {
                "id": "last_n_days",
                "label_json": {
                  "fr": "N derniers jours",
                  "en": "Last N days"
                }
              }
            ]
          },
          "position": {
            "x": 620,
            "y": 20
          }
        },
        {
          "id": "risk_period_start",
          "key": "period_start",
          "type_id": 5,
          "parent_id": "risk_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 2,
          "label_json": {
            "fr": "Date de début",
            "en": "Start date"
          },
          "meta_json": {},
          "position": {
            "x": 237.12470676588748,
            "y": 366.7321594556748
          }
        },
        {
          "id": "risk_period_end",
          "key": "period_end",
          "type_id": 5,
          "parent_id": "risk_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}",
          "order": 3,
          "label_json": {
            "fr": "Date de fin",
            "en": "End date"
          },
          "meta_json": {},
          "position": {
            "x": 617.9730858242971,
            "y": 368.5134856357201
          }
        },
        {
          "id": "risk_n_days",
          "key": "n_days",
          "type_id": 1,
          "parent_id": "risk_window_type",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}",
          "order": 4,
          "label_json": {
            "fr": "Nombre de jours",
            "en": "Number of days"
          },
          "meta_json": {
            "min": 1,
            "max": 365
          },
          "position": {
            "x": 1013.6511560699196,
            "y": 363.32834356189056
          }
        }
      ],
      "connections": [
        {
          "id": "edge_risk_start",
          "source": "risk_window_type",
          "target": "risk_period_start",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_risk_end",
          "source": "risk_window_type",
          "target": "risk_period_end",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"period\"]}"
        },
        {
          "id": "edge_risk_ndays",
          "source": "risk_window_type",
          "target": "risk_n_days",
          "condition": "{\"===\":[{\"var\":\"window_type\"},\"last_n_days\"]}"
        }
      ],
      "position": {
        "x": 0,
        "y": 0,
        "zoom": 1
      }
    }
  ],
  "description": "Formulaires avec les différents metrics pour les datacards"
}