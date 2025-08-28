export interface Response {
  id?: string
  answerText?: string | null   // สำหรับ short/paragraph
  blockId: string              // อ้างอิงไปยังคำถาม/บล็อก
  choiceId?: string | null     // multiple choice/checkbox
  rowId?: string | null        // grid
}

export interface Submission {
  id?: string
  formId: string
  userId: string
  responses: Response[]
  createdAt?: string
  updatedAt?: string
}
