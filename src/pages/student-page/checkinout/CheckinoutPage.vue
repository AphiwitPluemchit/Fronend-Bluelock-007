<script setup lang="ts">
import { useRoute } from 'vue-router'
import Checkinpage from 'src/pages/student-page/checkinout/Checkin/CheckinPage.vue'
import Checkoutpage from 'src/pages/student-page/checkinout/Checkout/CheckoutPage.vue'
import { ref, onMounted } from 'vue'
import CheckinoutService from 'src/services/checkinout'
import { useStudentProgramstore } from 'src/stores/program'

const route = useRoute()
const uuid = route.params.uuid?.toString() || ''
const claimToken = route.params.claimToken?.toString() || '' // 🆕 Claim Token
const tokenInfo = ref<{
  type: string
  programId: string
  token: string
  claimToken?: string
} | null>(null)
const loading = ref(true)
const error = ref('')
const programStore = useStudentProgramstore()

/** ---------- Helpers ---------- */
const isNotRegisteredErr = (msg: string) => /ไม่ได้ลงทะเบียน/i.test(msg)

const isExpiredErr = (msg: string) => /หมดอายุ/i.test(msg)

const isInvalidQrErr = (msg: string) =>
  /qr\s*ไม่ถูกต้อง/i.test(msg) || /qr\s*ไม่ถูกต้องหรือหมดอายุ/i.test(msg)

/** โหลดข้อมูลโครงการแบบปลอดภัย */
const loadProgramSafe = async (programId: string) => {
  console.log('📚 [CheckinoutPage] Loading program data:', programId)
  try {
    await programStore.fetchOneData(programId)
    console.log('✅ [CheckinoutPage] Program data loaded successfully')
  } catch (e) {
    console.error('❌ [CheckinoutPage] Failed to load program data:', e)
    error.value = 'ไม่สามารถโหลดข้อมูลโครงการได้'
    throw e
  }
}

onMounted(async () => {
  console.log('🎬 [CheckinoutPage] Mounted with:', { uuid, claimToken })

  // 🆕 ถ้ามี Claim Token → ใช้ Claim Token (มาจากหน้า QRClaimPage)
  if (claimToken) {
    console.log('🔐 [CheckinoutPage] Using claim token:', claimToken)

    // 1️⃣ ลองดึงจาก localStorage ก่อน (สำหรับกรณีปกติ)
    const storedProgramId = localStorage.getItem('temp_program_id')
    const storedType = localStorage.getItem('temp_qr_type')

    if (storedProgramId && storedType) {
      console.log('✅ [CheckinoutPage] Found data in localStorage')
      tokenInfo.value = {
        type: storedType,
        programId: storedProgramId,
        token: claimToken,
        claimToken: claimToken,
      }
      await loadProgramSafe(storedProgramId)
      loading.value = false
      return
    }

    // 2️⃣ ถ้าไม่มีใน localStorage (เช่น refresh หน้า) → เรียก API validate claim token
    console.log('⚠️  [CheckinoutPage] No data in localStorage, validating claim token...')
    try {
      const validationResult = await CheckinoutService.validateClaimToken(claimToken)
      console.log('✅ [CheckinoutPage] Claim token validated:', validationResult)

      if (validationResult?.programId && validationResult?.type) {
        tokenInfo.value = {
          type: validationResult.type,
          programId: validationResult.programId,
          token: claimToken,
          claimToken: claimToken,
        }
        // เก็บกลับไปใน localStorage เพื่อใช้ครั้งถัดไป
        localStorage.setItem('temp_program_id', validationResult.programId)
        localStorage.setItem('temp_qr_type', validationResult.type)

        await loadProgramSafe(validationResult.programId)
        loading.value = false
        return
      } else {
        throw new Error('ข้อมูล claim token ไม่ครบถ้วน')
      }
    } catch (e: unknown) {
      console.error('❌ [CheckinoutPage] Failed to validate claim token:', e)
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg || 'session หมดอายุ กรุณาสแกน QR ใหม่'
      loading.value = false
      return
    }
  }

  // Legacy: ใช้ UUID
  if (!uuid) {
    error.value = 'ไม่พบ QR Token'
    loading.value = false
    return
  }

  // 1) พยายาม Claim ก่อนด้วย getTokenInfo
  try {
    const res = await CheckinoutService.getTokenInfo(uuid)

    if (!res || !res.type) {
      // ข้อมูล claim แปลก → ลองไป validate ต่อ
      throw new Error('QR ไม่ถูกต้องหรือหมดอายุ')
    }

    tokenInfo.value = res
    await loadProgramSafe(res.programId)
    return
  } catch (e: unknown) {
    // วิเคราะห์ error จาก getTokenInfo
    const msg = e instanceof Error ? e.message : String(e)

    // กรณีสำคัญ: ไม่ได้ลงทะเบียน → จบที่นี่ ไม่ไป validate ต่อ
    if (isNotRegisteredErr(msg)) {
      error.value = 'คุณไม่ได้ลงทะเบียนโครงการนี้'
      loading.value = false
      return
    }

    // กรณีอื่น ๆ (เช่น เคยเคลมแล้ว/QR หมดอายุ หรือข้อความไม่ชัด)
    // อนุญาตให้ลองใช้ validateToken เพื่อใช้ token เดิมที่เคย claim
    try {
      const valid = await CheckinoutService.validateToken(uuid)

      if (valid && valid.type) {
        tokenInfo.value = valid
        await loadProgramSafe(valid.programId)
        return
      } else {
        error.value = 'QR ไม่ถูกต้องหรือหมดอายุ'
        loading.value = false
        return
      }
    } catch (ve: unknown) {
      const vmsg = ve instanceof Error ? ve.message : String(ve)

      if (isNotRegisteredErr(vmsg)) {
        error.value = 'คุณไม่ได้ลงทะเบียนโครงการนี้'
      } else if (isExpiredErr(vmsg)) {
        error.value = 'QR Code หมดอายุแล้ว'
      } else if (isInvalidQrErr(vmsg)) {
        error.value = 'QR ไม่ถูกต้องหรือหมดอายุ'
      } else {
        error.value = vmsg || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      }
      loading.value = false
      return
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <q-page class="flex flex-center q-pa-md checkinout-page">
    <q-card class="q-pa-xl text-center checkinout-container">
      <q-btn
        flat
        class="text-primary q-mb-md under-line"
        style="text-decoration: underline"
        label="กลับไปหน้าหลัก"
        to="/home"
        align="left"
      />
      <div>
        <q-icon name="how_to_reg" size="64px" color="primary" />
      </div>
      <div
        class="text-h6 q-mt-md"
        :class="
          tokenInfo?.type === 'checkin'
            ? 'text-green'
            : tokenInfo?.type === 'checkout'
              ? 'text-brown'
              : ''
        "
      >
        {{
          tokenInfo?.type === 'checkin'
            ? 'เช็คชื่อเข้า'
            : tokenInfo?.type === 'checkout'
              ? 'เช็คชื่อออก'
              : 'เช็คชื่อเข้าโครงการ'
        }}
      </div>

      <!-- <div class="text-h6 q-mt-md">เช็คชื่อเข้าโครงการ</div> -->
      <div v-if="loading" class="q-mt-md">กำลังโหลด...</div>
      <div v-else-if="error" class="text-negative q-mt-md">{{ error }}</div>
      <template v-else>
        <Checkinpage
          v-if="tokenInfo?.type === 'checkin'"
          :token="tokenInfo?.token || uuid"
          :program="programStore.form"
          v-bind="tokenInfo?.claimToken ? { claimToken: tokenInfo.claimToken } : {}"
        />
        <Checkoutpage
          v-else-if="tokenInfo?.type === 'checkout'"
          :token="tokenInfo?.token || uuid"
          :program="programStore.form"
          v-bind="tokenInfo?.claimToken ? { claimToken: tokenInfo.claimToken } : {}"
        />
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
