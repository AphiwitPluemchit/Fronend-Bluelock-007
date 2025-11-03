<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CheckinoutService from 'src/services/checkinout'
import { useAuthStore } from 'src/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const token = route.params.token as string
const loading = ref(true)
const error = ref('')
const claimToken = ref('')
const programId = ref('')
const qrType = ref('')

onMounted(async () => {
  if (!token) {
    error.value = 'ไม่พบ QR Token'
    loading.value = false
    return
  }

  try {
    // 🔄 Auto Claim Token (ไม่ต้อง Login)
    const res = await CheckinoutService.claimQRAnonymous(token)

    if (!res || !res.claimToken) {
      throw new Error('ไม่สามารถ Claim Token ได้')
    }

    claimToken.value = res.claimToken
    programId.value = res.programId
    qrType.value = res.type

    // บันทึก Claim Token ไว้ใน localStorage
    localStorage.setItem('temp_claim_token', res.claimToken)
    localStorage.setItem('temp_program_id', res.programId)
    localStorage.setItem('temp_qr_type', res.type)

    // ✅ ตรวจสอบว่า Login หรือยัง
    if (authStore.getIsAuthenticated) {
      // ✅ Login แล้ว → ไปหน้าเช็คชื่อ
      await router.push({
        name: 'qr-checkinout-claim',
        params: { claimToken: res.claimToken },
      })
    } else {
      // ❌ ยัง Login ไม่ได้ → ไป Login พร้อม redirect กลับมา
      await router.push({
        name: 'Login', // ✅ ตัว L ใหญ่
        query: {
          redirect: `/qr/claim/${res.claimToken}`,
        },
      })
    }
  } catch (e: unknown) {
    console.error('Claim QR Token failed:', e)
    error.value = (e as Error).message || 'เกิดข้อผิดพลาด'
    loading.value = false
  }
})
</script>

<template>
  <q-page class="flex flex-center q-pa-md qr-claim-page">
    <q-card class="q-pa-xl text-center qr-claim-container">
      <div v-if="loading">
        <q-spinner-dots color="primary" size="80px" />
        <div class="text-h6 q-mt-md text-white">กำลังประมวลผล QR Code...</div>
        <div class="text-body2 q-mt-sm text-grey-4">กรุณารอสักครู่</div>
      </div>
      <div v-else-if="error" class="text-center">
        <q-icon name="error_outline" size="64px" color="negative" />
        <div class="text-h6 q-mt-md text-negative">{{ error }}</div>
      </div>
    </q-card>
  </q-page>
</template>

<style scoped>
.qr-claim-page {
  background: linear-gradient(135deg, #4a5fbf 0%, #2e3f80 50%, #1a2b5c 100%);
  min-height: 100vh;
}

.qr-claim-container {
  width: 400px;
  max-width: 95vw;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
