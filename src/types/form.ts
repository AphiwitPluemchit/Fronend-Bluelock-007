// types/form.ts

export interface Form {
  id?: string
  activityId: string
  title: string
  description: string
  isOrigin: boolean
  // category: string
  blocks: Block[]
}

export interface Block {
  id?: string
  title: string
  session: number
  type: string // เช่น "short_answer", "multiple_choice"
  description: string
  isRequired: boolean
  sequence: number
  choices: Choice[] 
  rows?: Row[]

  max?: number        // สำหรับ rating scale เช่น 1-5, 1-10
  icon?: string       // สำหรับไอคอน rating เช่น 'star', 'thumb_up'
}

export interface Choice {
  id?: string
  title: string
  sequence: number
}

export interface Row {
  id?: string
  title: string
  sequence: number
}
