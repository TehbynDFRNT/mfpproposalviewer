/**
 * File: src/app/lib/flows.ts
 * Type definitions for question flows, keyed by CATEGORY_IDS
 */
import { FlowQuestion } from "@/app/lib/types/questionnaire";
import { CATEGORY_IDS } from "@/app/lib/constants";

export const flows: Record<string, FlowQuestion[]> = {
  [CATEGORY_IDS.POOL_SELECTION]: [
    {
      id: 'poolSelection_start',
      text: 'What would you like to change about the Pool Selection?',
      type: 'CHOICE_MULTI',
      options: [
        { label: 'Change the selected pool model', value: 'change_pool_model' },
        { label: 'Change the pool colour',       value: 'change_pool_colour' },
        { label: 'Change pool position/layout',  value: 'change_pool_position' },
      ],
    },
    {
      id: 'poolSelection_select_model',
      text: 'Which pool model would you like instead?',
      type: 'CHOICE_SINGLE',
      options: [
        // Piazza Range
        { label: 'Sheffield (Piazza)',     value: 'sheffield_model'    },
        { label: 'Westminster (Piazza)',   value: 'westminster_model'  },
        { label: 'Valentina (Piazza)',     value: 'valentina_model'    },
        { label: 'Avellino (Piazza)',      value: 'avellino_model'     },
        { label: 'Palazzo (Piazza)',       value: 'palazzo_model'      },
        { label: 'Kensington (Piazza)',    value: 'kensington_model'   },
        { label: 'Latina (Piazza)',        value: 'latina_model'       },
        { label: 'Sovereign (Piazza)',     value: 'sovereign_model'    },
        { label: 'Oxford (Piazza)',        value: 'oxford_model'       },
        { label: 'Empire (Piazza)',        value: 'empire_model'       },
        
        // Latin Range
        { label: 'Portofino (Latin)',      value: 'portofino_model'    },
        { label: 'Florentina (Latin)',     value: 'florentina_model'   },
        { label: 'Bellagio (Latin)',       value: 'bellagio_model'     },
        { label: 'Verona (Latin)',         value: 'verona_model'       },
        
        // Contemporary Range
        { label: 'Bellino (Contemporary)', value: 'bellino_model'      },
        { label: 'Imperial (Contemporary)', value: 'imperial_model'    },
        { label: 'Castello (Contemporary)', value: 'castello_model'    },
        { label: 'Grandeur (Contemporary)', value: 'grandeur_model'    },
        { label: 'Amalfi (Contemporary)',  value: 'amalfi_model'       },
        
        // Vogue Range
        { label: 'Serenity (Vogue)',       value: 'serenity_model'     },
        { label: 'Allure (Vogue)',         value: 'allure_model'       },
        { label: 'Harmony (Vogue)',        value: 'harmony_model'      },
        
        // Villa Range
        { label: 'Istana (Villa)',         value: 'istana_model'       },
        { label: 'Terazza (Villa)',        value: 'terazza_model'      },
        { label: 'Elysian (Villa)',        value: 'elysian_model'      },
        
        // Entertainer Range
        { label: 'Bedarra (Entertainer)',  value: 'bedarra_model'      },
        { label: 'Hayman (Entertainer)',   value: 'hayman_model'       },
        
        // Round Pools
        { label: 'Infinity 3 (Round)',     value: 'infinity_3_model'   },
        { label: 'Infinity 4 (Round)',     value: 'infinity_4_model'   },
        { label: 'Terrace 3 (Round)',      value: 'terrace_3_model'    },
      ],
      dependsOn: answers =>
        Array.isArray(answers['poolSelection_start']) &&
        answers['poolSelection_start'].includes('change_pool_model'),
    },
    {
      id: 'poolSelection_select_colour',
      text: 'Which pool colour would you prefer?',
      type: 'CHOICE_SINGLE',
      options: [
        { label: 'Silver Mist', value: 'silver_mist_colour' },
        { label: 'Horizon',     value: 'horizon_colour'      },
        { label: 'Twilight',    value: 'twilight_colour'     },
      ],
      dependsOn: answers =>
        Array.isArray(answers['poolSelection_start']) &&
        answers['poolSelection_start'].includes('change_pool_colour'),
    },
    {
      id: 'poolSelection_position_details',
      text: 'Please describe the desired changes to the pool position or layout:',
      type: 'TEXT',
      dependsOn: answers =>
        Array.isArray(answers['poolSelection_start']) &&
        answers['poolSelection_start'].includes('change_pool_position'),
    },
    {
      id: 'poolSelection_notes',
      text: 'Any additional notes for the Pool Selection changes?',
      type: 'TEXT',
    },
  ],

  [CATEGORY_IDS.CONCRETE_PAVING]: [
    {
      id: 'concretePaving_feedback_text',
      text: 'What changes or feedback do you have for Concrete & Paving?',
      type: 'TEXT',
    },
  ],

  [CATEGORY_IDS.FENCING]: [
    {
      id: 'fencing_feedback_text',
      text: 'What changes or feedback do you have for Fencing?',
      type: 'TEXT',
    },
  ],

  [CATEGORY_IDS.RETAINING_WALLS]: [
    {
      id: 'retainingWalls_feedback_text',
      text: 'What changes or feedback do you have for Retaining Walls?',
      type: 'TEXT',
    },
  ],

  [CATEGORY_IDS.WATER_FEATURE]: [
    {
      id: 'waterFeature_feedback_text',
      text: 'What changes or feedback do you have for the Water Feature?',
      type: 'TEXT',
    },
  ],

  [CATEGORY_IDS.ADD_ONS]: [
    {
      id: 'addOns_remove',
      text: 'Select the add-ons you want to KEEP (unselect to remove)',
      type: 'CHOICE_MULTI',
      options: [
        { label: 'Pool Cleaner', value: 'pool_cleaner' },
        { label: 'Heat Pump', value: 'heat_pump' },
        { label: 'Pool Blanket & Roller', value: 'blanket_roller' },
      ],
    },
    {
      id: 'addOns_feedback_text',
      text: 'Any additional notes for add-on changes?',
      type: 'TEXT',
    },
  ],
};