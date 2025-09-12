// src/utils/security.ts
import { useAuthStore } from 'src/stores/auth'

/**
 * Security utility functions for authorization and access control
 */

// ✅ ตรวจสอบว่า path ปลอดภัยหรือไม่
export const isPathSecure = (path: string): boolean => {
  // Paths ที่ปลอดภัย (ไม่ต้องตรวจสอบสิทธิ์)
  const securePaths = ['/', '/unauthorized', '/login', '/recover-password']

  if (securePaths.includes(path)) return true

  // ตรวจสอบว่า path ตรงกับ role หรือไม่
  const authStore = useAuthStore()
  return authStore.canAccessPath(path)
}

// ✅ ตรวจสอบว่า user สามารถเข้าถึง admin area ได้หรือไม่
export const canAccessAdminArea = (): boolean => {
  const authStore = useAuthStore()
  return authStore.isAdmin && authStore.validateSession()
}

// ✅ ตรวจสอบว่า user สามารถเข้าถึง student area ได้หรือไม่
export const canAccessStudentArea = (): boolean => {
  const authStore = useAuthStore()
  return authStore.isStudent && authStore.validateSession()
}

// ✅ ตรวจสอบสิทธิ์การเข้าถึง resource
export const canAccessResource = (resourceType: string): boolean => {
  const authStore = useAuthStore()

  if (!authStore.validateSession()) return false

  // ตรวจสอบสิทธิ์ตาม resource type
  switch (resourceType) {
    case 'program':
      // Admin สามารถเข้าถึงได้ทุก program
      if (authStore.isAdmin) return true
      // Student สามารถเข้าถึงได้เฉพาะ program ที่ตัวเองลงทะเบียน
      if (authStore.isStudent) return true // TODO: เพิ่มการตรวจสอบ enrollment
      break

    case 'student':
      // Admin สามารถเข้าถึงข้อมูล student ได้
      if (authStore.isAdmin) return true
      // Student สามารถเข้าถึงข้อมูลของตัวเองได้
      if (authStore.isStudent) return true // TODO: เพิ่มการตรวจสอบ student ID
      break

    case 'admin':
      // เฉพาะ Admin เท่านั้น
      return authStore.isAdmin

    default:
      return false
  }

  return false
}

// ✅ สร้าง security context สำหรับ component
export const createSecurityContext = () => {
  const authStore = useAuthStore()

  return {
    // ข้อมูล user
    user: authStore.getUser,
    role: authStore.getRole,
    isAdmin: authStore.isAdmin,
    isStudent: authStore.isStudent,

    // สถานะการตรวจสอบ
    isAuthenticated: authStore.getIsAuthenticated,
    isSessionValid: authStore.validateSession(),

    // การตรวจสอบสิทธิ์
    canAccessPath: (path: string) => authStore.canAccessPath(path),
    canAccessScope: (scope: string) => authStore.canAccessScope(scope),
    canAccessResource,

    // Security report
    securityReport: authStore.getSecurityReport(),

    // Actions
    logout: () => authStore.logout(),
    clearLocalStorage: () => authStore.clearLocalStorage()
  }
}

// ✅ ตรวจสอบความปลอดภัยของ URL parameters
export const validateUrlParams = (params: Record<string, string>): boolean => {
  // ตรวจสอบว่า parameters ไม่มี script หรือ malicious content
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
    /on\w+\s*=/i
  ]

  for (const [key, value] of Object.entries(params)) {
    for (const pattern of dangerousPatterns) {
      if (pattern.test(value)) {
        console.warn(`Dangerous URL parameter detected: ${key}=${value}`)
        return false
      }
    }
  }

  return true
}

// ✅ ตรวจสอบความปลอดภัยของ query string
export const validateQueryString = (query: string): boolean => {
  try {
    const params = new URLSearchParams(query)
    const paramObj: Record<string, string> = {}

    for (const [key, value] of params.entries()) {
      paramObj[key] = value
    }

    return validateUrlParams(paramObj)
  } catch {
    return false
  }
}
