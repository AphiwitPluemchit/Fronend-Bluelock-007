import type { User } from './user'

export interface Auth {
  // Legacy support (for old API responses)
  token?: string

  // New token pair (for new API responses)
  accessToken?: string
  refreshToken?: string

  expiresIn?: number // Token expiration in seconds
  user?: Partial<User>
  message?: string
}
