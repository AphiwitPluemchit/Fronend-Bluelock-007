export interface Course {
  id?: string
  name: string
  link: string
  isHardSkill: boolean | null
  isActive: boolean
  issuer: string
  hour: number
  type: string
  description: string
  file?: string
}
