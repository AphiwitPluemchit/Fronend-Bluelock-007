// Form Types for Google Forms-like system

export type QuestionType =
  | 'short_answer'
  | 'paragraph'
  | 'multiple_choice'
  | 'checkbox'
  | 'dropdown'
  | 'grid_multiple_choice'
  | 'grid_checkbox'
  | 'rating'

export interface Question {
  id?: string
  formId?: string
  type: QuestionType
  questionText: string
  isRequired: boolean
  choices?: string[]
  rows?: string[]
  columns?: string[]
  order?: number
}
export type TitleCard = {
  isTitleCard: true
  title: string
  description?: string
  showDescription?: boolean
}
export type FormElement = Question | TitleCard

export interface Form {
  id?: string
  title: string
  description: string
  createdAt?: string
  updatedAt?: string
}

export interface FormWithQuestions {
  form: Form
  questions: FormElement[]
}
// Answer value types for better type safety
export type AnswerValue =
  | string // for short_answer, paragraph, multiple_choice, dropdown
  | string[] // for checkbox
  | Record<string, string> // for grid_multiple_choice: { row: column }
  | Record<string, string[]> // for grid_checkbox: { row: [columns] }

export interface Answer {
  questionId: string
  value: AnswerValue
}

export interface Submission {
  id?: string
  formId: string
  submittedAt?: string
  answers: Answer[]
}

export interface CreateFormRequest {
  title: string
  description: string
  questions: Question[]
}

export interface SubmitFormRequest {
  answers: Answer[]
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedFormsResponse {
  forms: Form[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedSubmissionsResponse {
  submissions: Submission[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form Builder Types
export interface FormBuilderState {
  title: string
  description: string
  questions: Question[]
  currentQuestionIndex: number | null
}

export type FormBuilderActionType =
  | 'SET_TITLE'
  | 'SET_DESCRIPTION'
  | 'ADD_QUESTION'
  | 'UPDATE_QUESTION'
  | 'DELETE_QUESTION'
  | 'REORDER_QUESTIONS'
  | 'SET_CURRENT_QUESTION'

export interface FormBuilderAction {
  type: FormBuilderActionType
  payload: string | Question | number | Question[]
}

// Form Response Types
export interface ApiResponse<T> {
  status: number
  message: string
  data: T
}

export interface ErrorResponse {
  status: number
  message: string
}

// Question Type Utilities
export interface QuestionTypeConfig {
  value: QuestionType
  label: string
  description: string
  icon: string
  hasChoices: boolean
  hasGrid: boolean
}

export const QUESTION_TYPES: Record<QuestionType, QuestionTypeConfig> = {
  short_answer: {
    value: 'short_answer',
    label: 'Short Answer',
    description: 'Single line text input',
    icon: 'short_text',
    hasChoices: false,
    hasGrid: false
  },
  paragraph: {
    value: 'paragraph',
    label: 'Paragraph',
    description: 'Multi-line text input',
    icon: 'subject',
    hasChoices: false,
    hasGrid: false
  },
  multiple_choice: {
    value: 'multiple_choice',
    label: 'Multiple Choice',
    description: 'Single selection from options',
    icon: 'radio_button_checked',
    hasChoices: true,
    hasGrid: false
  },
  checkbox: {
    value: 'checkbox',
    label: 'Checkbox',
    description: 'Multiple selections allowed',
    icon: 'check_box',
    hasChoices: true,
    hasGrid: false
  },
  dropdown: {
    value: 'dropdown',
    label: 'Dropdown',
    description: 'Select from dropdown menu',
    icon: 'arrow_drop_down_circle',
    hasChoices: true,
    hasGrid: false
  },
  grid_multiple_choice: {
    value: 'grid_multiple_choice',
    label: 'Grid (Multiple Choice)',
    description: 'Matrix with single selection per row',
    icon: 'grid_on',
    hasChoices: false,
    hasGrid: true
  },
  grid_checkbox: {
    value: 'grid_checkbox',
    label: 'Grid (Checkbox)',
    description: 'Matrix with multiple selections per row',
    icon: 'grid_4x4',
    hasChoices: false,
    hasGrid: true
  },
  rating: {
    value: 'rating',
    label: 'Rating',
    description: 'Rate on a scale',
    icon: 'star',
    hasChoices: false,
    hasGrid: false
  }

}

// Type guards for better type safety
export const isChoiceQuestion = (type: QuestionType): boolean => {
  return ['multiple_choice', 'checkbox', 'dropdown'].includes(type)
}

export const isGridQuestion = (type: QuestionType): boolean => {
  return ['grid_multiple_choice', 'grid_checkbox'].includes(type)
}

export const isTextQuestion = (type: QuestionType): boolean => {
  return ['short_answer', 'paragraph'].includes(type)
}

// Answer value type guards
export const isStringAnswer = (value: AnswerValue): value is string => {
  return typeof value === 'string'
}

export const isArrayAnswer = (value: AnswerValue): value is string[] => {
  return Array.isArray(value)
}

export const isGridAnswer = (value: AnswerValue): value is Record<string, string> | Record<string, string[]> => {
  return typeof value === 'object' && !Array.isArray(value) && value !== null
}

export const isGridMultipleChoiceAnswer = (value: AnswerValue): value is Record<string, string> => {
  return isGridAnswer(value) && Object.values(value).every(v => typeof v === 'string')
}

export const isGridCheckboxAnswer = (value: AnswerValue): value is Record<string, string[]> => {
  return isGridAnswer(value) && Object.values(value).every(v => Array.isArray(v))
}

// Utility functions for safe property access
export const getQuestionId = (question: Question): string => {
  return question.id || `temp-${Date.now()}`
}

export const getQuestionText = (question: Question): string => {
  return question.questionText || ''
}

export const getQuestionChoices = (question: Question): string[] => {
  return question.choices || []
}

export const getQuestionRows = (question: Question): string[] => {
  return question.rows || []
}

export const getQuestionColumns = (question: Question): string[] => {
  return question.columns || []
}

export const getQuestionOrder = (question: Question): number => {
  return question.order || 0
}

// Utility functions for form validation
export const validateQuestion = (question: Question): boolean => {
  if (!question.questionText?.trim()) return false

  if (isChoiceQuestion(question.type)) {
    return (question.choices?.length || 0) >= 2
  }

  if (isGridQuestion(question.type)) {
    return (question.rows?.length || 0) >= 1 && (question.columns?.length || 0) >= 1
  }

  return true
}

export const validateForm = (form: CreateFormRequest): boolean => {
  if (!form.title?.trim()) return false
  if (!form.questions?.length) return false

  return form.questions.every(validateQuestion)
}

// Utility functions for answer validation
export const validateAnswer = (answer: Answer, question: Question): boolean => {
  if (!question.isRequired) return true

  if (isStringAnswer(answer.value)) {
    return answer.value.trim() !== ''
  }

  if (isArrayAnswer(answer.value)) {
    return answer.value.length > 0
  }

  if (isGridAnswer(answer.value)) {
    return Object.values(answer.value).some(v => {
      if (Array.isArray(v)) return v.length > 0
      return v !== null && v !== undefined && v !== ''
    })
  }

  return false
}
