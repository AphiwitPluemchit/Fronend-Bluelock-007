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
  type: QuestionType
  questionText: string
  isRequired: boolean
  choices?: string[]
  rows?: string[]
  columns?: string[]
  titleCard?: null
}

export type TitleCard = {
  title: string
  description?: string
  showDescription?: boolean
  question?: null
}
export type FormElement ={
  question?: Question | null
  titleCard?: TitleCard | null
  order: number
}

export interface Form {
  id?: string
  title: string
  description: string
  createdAt?: string
  updatedAt?: string
  formElements: FormElement[]
}

