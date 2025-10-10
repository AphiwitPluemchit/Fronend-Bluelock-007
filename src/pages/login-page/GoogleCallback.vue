<template>
  <q-page class="flex flex-center">
    <div class="text-center">
      <q-spinner-dots
        v-if="isProcessing"
        color="primary"
        size="50px"
      />
      <div v-if="isProcessing" class="text-h6 q-mt-md">
        กำลังประมวลผลการเข้าสู่ระบบ...
      </div>
      
      <div v-if="error" class="text-center">
        <q-icon name="error" color="negative" size="50px" />
        <div class="text-h6 q-mt-md text-negative">
          เกิดข้อผิดพลาด
        </div>
        <div class="text-body1 q-mt-sm">
          {{ error }}
        </div>
        <q-btn
          label="กลับไปหน้าเข้าสู่ระบบ"
          color="primary"
          class="q-mt-md"
          @click="goToLogin"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'
import { EnumUserRole } from 'src/data/roles'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const isProcessing = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const token = route.query.token as string
    const errorParam = route.query.error as string
    
    console.log('🔍 Google Callback - Token:', token ? 'Present' : 'Missing')
    console.log('🔍 Google Callback - Error:', errorParam)
    
    if (errorParam) {
      throw new Error(getErrorMessage(errorParam))
    }
    
    if (!token) {
      throw new Error('ไม่พบ token จากการเข้าสู่ระบบ')
    }
    
    // Store the token and get user info
    console.log('🔄 Processing Google login token...')
    console.log('🔍 Token preview:', token.substring(0, 100) + '...')
    
    const success = auth.loginWithToken(token)
    console.log('🔍 loginWithToken result:', success)
    
    if (success) {
      console.log('✅ Google login successful')
      
      // ✅ ดึงข้อมูล user ล่าสุดจาก API
      console.log('🔄 Fetching user profile from API...')
      const profileSuccess = await auth.fetchProfile()
      
      if (!profileSuccess) {
        console.warn('⚠️ Failed to fetch profile, using token data')
      } else {
        console.log('✅ User profile updated from API')
      }
      
      // Get fresh user data after login
      const userRole = auth.getRole
      const userName = auth.getName
      const userObj = auth.getUser
      
      console.log('🔍 Debug user info:')
      console.log('  - Full user object:', userObj)
      console.log('  - User role:', userRole)
      console.log('  - User name:', userName)
      console.log('  - EnumUserRole.ADMIN:', EnumUserRole.ADMIN)
      console.log('  - EnumUserRole.STUDENT:', EnumUserRole.STUDENT)
      console.log('  - Role comparison Admin:', userRole === EnumUserRole.ADMIN)
      console.log('  - Role comparison Student:', userRole === EnumUserRole.STUDENT)
      console.log('  - Role type:', typeof userRole)
      console.log('  - Expected Student type:', typeof EnumUserRole.STUDENT)
      
      $q.notify({
        color: 'positive',
        message: `เข้าสู่ระบบด้วย Google สำเร็จ - ${userName}`,
        position: 'top',
        timeout: 3000,
      })
      
      // Check for stored redirect
      const redirect = localStorage.getItem('redirectAfterLogin')
      if (redirect) {
        console.log('🔄 Redirecting to stored path:', redirect)
        localStorage.removeItem('redirectAfterLogin')
        await router.push(redirect)
        return
      }
      
      // Default redirects based on role
      console.log('🎯 Determining redirect path for role:', userRole)
      
      if (userRole === EnumUserRole.ADMIN) {
        const adminPath = `/${EnumUserRole.ADMIN}/ProgramCalendar`
        console.log('🔄 Redirecting Admin to:', adminPath)
        await router.push(adminPath)
      } else if (userRole === EnumUserRole.STUDENT) {
        const studentPath = `/${EnumUserRole.STUDENT}/ProgramCalendar`
        console.log('🔄 Redirecting Student to:', studentPath)
        await router.push(studentPath)
      } else {
        console.warn('⚠️ Unknown role, redirecting to login. Role:', userRole)
        console.warn('⚠️ Available roles:', Object.values(EnumUserRole))
        await router.push('/login')
      }
    } else {
      throw new Error('ไม่สามารถเข้าสู่ระบบได้')
    }
  } catch (err) {
    console.error('Google callback error:', err)
    error.value = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
    
    $q.notify({
      color: 'negative',
      message: error.value,
      position: 'top',
      timeout: 5000,
    })
  } finally {
    isProcessing.value = false
  }
})

const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'access_denied': 'คุณได้ยกเลิกการเข้าสู่ระบบด้วย Google',
    'invalid_request': 'คำขอไม่ถูกต้อง',
    'unauthorized_client': 'ไคลเอนต์ไม่ได้รับอนุญาต',
    'unsupported_response_type': 'ประเภทการตอบกลับไม่รองรับ',
    'invalid_scope': 'ขอบเขตไม่ถูกต้อง',
    'server_error': 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
    'temporarily_unavailable': 'บริการไม่พร้อมใช้งานชั่วคราว',
    'missing_code': 'ไม่พบรหัสการยืนยัน',
    'token_generation_failed': 'ไม่สามารถสร้าง token ได้',
    'only university email addresses are allowed': 'อนุญาตเฉพาะอีเมลของมหาวิทยาลัยเท่านั้น'
  }
  
  return errorMessages[errorCode] || `เกิดข้อผิดพลาด: ${errorCode}`
}

const goToLogin = async() => {
  await router.push('/login')
}
</script>

<style scoped>
.q-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #4a5fbf 0%, #2e3f80 50%, #1a2b5c 100%);
}
</style>