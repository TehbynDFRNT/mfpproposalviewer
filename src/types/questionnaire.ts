/**
 * File: src/app/lib/types/questionnaire.ts
 * Type definitions for question flows
 */

/**
 * Unique identifier for each question
 */
export type QuestionId = string;

/**
 * An option for choice questions
 */
export interface QuestionOption {
  /** Text displayed to the user */
  label: string;
  /** Value stored when selected */
  value: string;
}

/**
 * Represents a single step in a question flow.
 * - CHOICE_MULTI: Allows multiple selections
 * - CHOICE_SINGLE: Allows a single selection
 * - TEXT: Open-ended text input
 *
 * The optional `dependsOn` predicate controls visibility based on prior answers.
 */
export interface FlowQuestion {
  /** Unique ID for the question */
  id: QuestionId;
  /** Prompt text shown to the user */
  text: string;
  /** Type of input expected */
  type: 'CHOICE_MULTI' | 'CHOICE_SINGLE' | 'TEXT';
  /** Available options (for choice questions) */
  options?: QuestionOption[];
  /**
   * Only show this question if predicate returns true
   * @param answers Map of all answers provided so far
   */
  dependsOn?: (answers: Record<QuestionId, any>) => boolean;
}
