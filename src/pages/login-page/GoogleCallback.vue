<template>
  <q-page class="flex flex-center">
    <div class="text-center">
      <q-spinner-dots v-if="isProcessing" color="primary" size="50px" />
      <div v-if="isProcessing" class="text-h6 q-mt-md">กำลังประมวลผลการเข้าสู่ระบบ...</div>

      <div v-if="error" class="text-center">
        <q-icon name="error" color="negative" size="50px" />
        <div class="text-h6 q-mt-md text-negative">เกิดข้อผิดพลาด</div>
        <div class="text-body1 q-mt-sm">
          {{ error }}
        </div>
        <q-btn label="กลับไปหน้าเข้าสู่ระบบ" color="primary" class="q-mt-md" @click="goToLogin" />
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
    // Prefer accessToken param; fallback to legacy 'token'
    const accessTokenParam = (route.query.accessToken as string) || (route.query.token as string)
    const refreshTokenParam = route.query.refreshToken as string
    const errorParam = route.query.error as string

    // 1. Handle error from backend
    if (errorParam) {
      throw new Error(getErrorMessage(errorParam))
    }

    // 2. Validate token
    if (!accessTokenParam) {
      throw new Error('ไม่พบ token จากการเข้าสู่ระบบ')
    }

    // 3. Store token and parse JWT
    const success = auth.loginWithToken(accessTokenParam)
    if (!success) {
      throw new Error('ไม่สามารถประมวลผล token ได้')
    }

    // 3.a store refresh token if provided
    if (refreshTokenParam) {
      localStorage.setItem('refresh_token', refreshTokenParam)
    }

    // 4. Fetch full user profile from API
    const profileSuccess = await auth.fetchProfile()
    if (!profileSuccess) {
      console.warn('⚠️ Failed to fetch profile, using token data')
    }

    // 5. Get user data for redirect
    const userRole = auth.getRole
    const userName = auth.getName

    // 6. Show success message
    $q.notify({
      color: 'positive',
      message: `เข้าสู่ระบบสำเร็จ - ${userName}`,
      position: 'top',
      timeout: 3000,
    })

    // 7. Check for stored redirect
    const redirect = localStorage.getItem('redirectAfterLogin')
    if (redirect) {
      localStorage.removeItem('redirectAfterLogin')
      await router.push(redirect)
      return
    }

    // 8. Default redirects based on role
    if (userRole === EnumUserRole.ADMIN) {
      await router.push(`/${EnumUserRole.ADMIN}/home`)
    } else if (userRole === EnumUserRole.STUDENT) {
      await router.push(`/${EnumUserRole.STUDENT}/home`)
    } else {
      console.error('Unknown role:', userRole)
      await router.push('/login')
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
    access_denied: 'คุณได้ยกเลิกการเข้าสู่ระบบด้วย Google',
    invalid_request: 'คำขอไม่ถูกต้อง',
    unauthorized_client: 'ไคลเอนต์ไม่ได้รับอนุญาต',
    unsupported_response_type: 'ประเภทการตอบกลับไม่รองรับ',
    invalid_scope: 'ขอบเขตไม่ถูกต้อง',
    server_error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
    temporarily_unavailable: 'บริการไม่พร้อมใช้งานชั่วคราว',
    missing_code: 'ไม่พบรหัสการยืนยัน',
    token_generation_failed: 'ไม่สามารถสร้าง token ได้',
    'only university email addresses are allowed': 'อนุญาตเฉพาะอีเมลของมหาวิทยาลัยเท่านั้น',
  }

  return errorMessages[errorCode] || `เกิดข้อผิดพลาด: ${errorCode}`
}

const goToLogin = async () => {
  await router.push('/login')
}
</script>

<style scoped>
.q-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #4a5fbf 0%, #2e3f80 50%, #1a2b5c 100%);
}
</style>
