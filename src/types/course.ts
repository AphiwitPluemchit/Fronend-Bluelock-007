export interface Course {
  id?: string
  name: string
  certificateName?: string
  certificateNameEng?: string
  link: string
  isHardSkill: boolean | null
  isActive: boolean
  issuer: string
  hour: number
  type: string
  file?: string
  videoUrl?: string // Tutorial video URL for certificate claiming
}
