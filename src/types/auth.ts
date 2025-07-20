import type { User } from './user'

export interface Auth {
  token: string
  expiresIn?: number // เพิ่มจาก backend
  user?: Partial<User>
  message?: string // เพิ่มจาก backend
  // messages?: string
  // refreshToken?: string
  // statusCode?: number
}
