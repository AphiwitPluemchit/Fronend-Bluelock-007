import type { User } from './user'

export interface Auth {
  token: string
  messages?: string
  refreshToken?: string
  statusCode?: number
  user?: Partial<User>
}
