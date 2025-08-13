<script setup lang="ts">
import { useRoute } from 'vue-router'
import Checkinpage from 'src/pages/student-page/checkinout/Checkin/CheckinPage.vue'
import Checkoutpage from 'src/pages/student-page/checkinout/Checkout/CheckoutPage.vue'
import { ref, onMounted } from 'vue'
import CheckinoutService from 'src/services/checkinout'
// import { useAuthStore } from 'src/stores/auth'
const route = useRoute()
// const authStore = useAuthStore()
const uuid = route.params.uuid?.toString() || ''
const tokenInfo = ref<{ type: string } | null>(null)
const loading = ref(true)
const error = ref('')
onMounted(async () => {
  if (!uuid) {
    error.value = 'ไม่พบ QR Token'
    loading.value = false
    return
  }
  try {
    const res = await CheckinoutService.getTokenInfo(uuid)
    console.log('res', res);

    if (!res || !res.type) {
      error.value = 'QR ไม่ถูกต้องหรือหมดอายุ 1'
    } else {
      tokenInfo.value = res
    }
  } catch {
    // ถ้า claim ไม่สำเร็จ (เช่น QR หมดอายุ) → fallback ไป validate
    try {
      const valid = await CheckinoutService.validateToken(uuid)
      console.log('valid', valid);
      if (valid && valid.type) {
        tokenInfo.value = valid
      } else {
        error.value = 'QR ไม่ถูกต้องหรือหมดอายุ 2'
      }
    } catch {
      error.value = 'QR ไม่ถูกต้องหรือหมดอายุ 3'
    }
  }
  loading.value = false
})
</script>

<template>
    <q-page class="flex flex-center q-pa-md checkinout-page">
      <q-card class="q-pa-xl text-center checkinout-container">
        <div>
          <q-icon name="question_mark" size="64px" style="color: #162aae" />
        </div>
        <div class="text-h6 text-green-7 q-mt-md">QR {{ tokenInfo?.type }}</div>
        <div v-if="loading" class="q-mt-md">กำลังโหลด...</div>
        <div v-else-if="error" class="text-negative q-mt-md">{{ error }}</div>
        <template v-else>
          <Checkinpage v-if="tokenInfo?.type === 'checkin'" :token="uuid" />
          <Checkoutpage v-else-if="tokenInfo?.type === 'checkout'" :token="uuid" />
          <div v-else class="text-negative">QR ไม่ถูกต้อง</div>
        </template>
      </q-card>
    </q-page>
</template>

<style scoped>
.checkinout-page {
  background: linear-gradient(135deg, #4a5fbf 0%, #2e3f80 50%, #1a2b5c 100%);
  min-height: 100vh;
  padding: 2rem;
}

.checkinout-container {
  width: 500px;
  height: 400px;
  max-width: 95vw;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.8s ease-out;
}
</style>
