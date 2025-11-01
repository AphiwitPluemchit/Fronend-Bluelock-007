<script setup lang="ts">
import { useCheckinoutStore } from 'src/stores/checkinout'
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, watch } from 'vue'
import type { AxiosError } from 'axios'
import type { ErrorResponse } from 'src/types/pagination'
import type { Program } from 'src/types/program'

const checkinoutStore = useCheckinoutStore()
const router = useRouter()
const errorMessage = ref('')
const loading = ref(false)
const route = useRoute()

// --- สถานะเดิม ---
const formSubmitted = ref(route.query.formSubmitted === 'true')
const isSubmitted = ref(false) // เพิ่ม isSubmitted เพื่อให้สอดคล้องกับ CheckinPage

// --- สถานะใหม่สำหรับแยก flow ---
const hasForm = ref<boolean | null>(null) // โครงการนี้มีแบบประเมินไหม
const checkedOut = ref(false) // เคสไม่มีแบบประเมิน: เช็คชื่อออกแล้วหรือยัง

// Watch for route changes เพื่อ sync query
watch(
  () => route.query.formSubmitted,
  (newVal) => {
    formSubmitted.value = newVal === 'true'
    if (formSubmitted.value) {
      isSubmitted.value = true
    }
  },
  { immediate: true },
)

const props = defineProps<{
  token: string
  program?: Partial<Program>
  claimToken?: string // 🆕
}>()

onMounted(async () => {
  // รับ flag กลับมาจากหน้าแบบฟอร์ม (เดิม)
  if (localStorage.getItem('formSubmissionSuccess') === 'true') {
    formSubmitted.value = true
    isSubmitted.value = true
    localStorage.removeItem('formSubmissionSuccess')
  }

  // ✅ ตรวจว่ามีแบบประเมินหรือไม่ตั้งแต่ต้นหน้า
  try {
    if (!props.program?.id) {
      hasForm.value = null
      return
    }
    const res = await checkinoutStore.getProgramForm(props.program.id)
    hasForm.value = !!res?.formId
  } catch {
    // ถ้าเรียกดู formId แล้ว error ให้ถือว่า "ไม่มีแบบประเมิน"
    hasForm.value = false
  }
})

/** ------- ฟังก์ชันเดิม: ไปทำแบบประเมิน ------- */
async function goToForm() {
  errorMessage.value = ''
  loading.value = true
  try {
    if (!props.program?.id) {
      errorMessage.value = 'ไม่พบข้อมูลโครงการ'
      return
    }

    // ✅ ตรวจสอบ claimToken ก่อนไปทำฟอร์ม
    if (props.claimToken) {
      try {
        await checkinoutStore.validateClaimToken(props.claimToken)
      } catch (validationError: unknown) {
        // ถ้า claimToken หมดอายุหรือไม่ถูกต้อง
        let msg = 'session หมดอายุ กรุณาสแกน QR ใหม่'
        if (validationError instanceof Error) {
          msg = validationError.message
        }
        errorMessage.value = msg
        return
      }
    }

    const formData = await checkinoutStore.getProgramForm(props.program.id)
    if (!formData?.formId) {
      errorMessage.value = 'โครงการนี้ไม่มีแบบฟอร์มให้ทำ'
      return
    }
    await router.push({
      name: 'student-form-fill',
      params: { id: formData.formId },
      query: {
        checkoutToken: props.token,
        programId: props.program.id,
        claimToken: props.claimToken, // ส่ง claimToken ไปด้วย
      },
    })
  } catch (error: unknown) {
    console.error(error)
    let msg = 'เกิดข้อผิดพลาด'
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      const axiosErr = error as AxiosError
      const errData = axiosErr.response?.data as ErrorResponse
      if (errData && typeof errData === 'object' && typeof errData.error === 'string') {
        msg = errData.error
      } else if (axiosErr.message) {
        msg = axiosErr.message
      }
    } else if (error instanceof Error) {
      msg = error.message
    }
    errorMessage.value = msg
  } finally {
    loading.value = false
  }
}

/** ------- ฟังก์ชันใหม่: เช็คชื่อออก (กรณีไม่มีแบบประเมิน) ------- */
async function checkoutOnly() {
  errorMessage.value = ''
  loading.value = true
  try {
    // ถ้ามี claimToken ให้ใช้ claimToken แทน
    if (props.claimToken) {
      await checkinoutStore.checkoutWithClaim(props.claimToken)
    } else {
      await checkinoutStore.checkout(props.token)
    }
    checkedOut.value = true
    isSubmitted.value = true
  } catch (error: unknown) {
    console.error(error)
    let msg = 'เช็คชื่อออกไม่สำเร็จ'
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      const axiosErr = error as AxiosError
      const errData = axiosErr.response?.data as ErrorResponse
      if (errData && typeof errData === 'object' && typeof errData.error === 'string') {
        msg = errData.error
      } else if (axiosErr.message) {
        msg = axiosErr.message
      }
    } else if (error instanceof Error) {
      msg = error.message
    }
    errorMessage.value = msg
  } finally {
    loading.value = false
  }
}

/** ------- กลับหน้ารายละเอียดโครงการ/หน้าแรก ------- */
async function goHome() {
  if (props.program?.id) {
    await router.push(`/Student/Program/MyProgramDetail/${props.program.id}/checkInOut`)
  } else {
    await router.push('/Student/Home')
  }
}

async function onPrimaryClick() {
  if (hasForm.value === true) {
    // เดิม: ไปทำแบบประเมิน หรือถ้าทำแล้วก็กลับรายละเอียด
    if (formSubmitted.value) {
      await goHome()
    } else {
      await goToForm()
    }
    return
  }
  if (hasForm.value === false) {
    // ใหม่: ไม่มีแบบประเมิน → เช็คชื่อออกก่อน แล้วค่อยดูรายละเอียด
    if (checkedOut.value) {
      await goHome()
    } else {
      await checkoutOnly()
    }
    return
  }
  // ยังไม่รู้สถานะก็ลองโหลดอีกครั้ง หรือ disable ปุ่มไว้
}
</script>

<template>
  <div class="q-pa-md">
    <div>
      <div v-if="props.program?.name" class="q-mb-sm">โครงการ: {{ props.program?.name }}</div>

      <div class="q-pa-md">
        <!-- ปุ่มหลัก -->
        <q-btn
          v-if="!formSubmitted && !checkedOut"
          class="btnconfirm"
          :label="hasForm ? 'ทำแบบประเมิน' : 'เช็คชื่อออก'"
          color="primary"
          :loading="loading"
          :disable="loading || hasForm === null"
          @click="onPrimaryClick"
        />
        <q-btn v-else class="btnconfirm" label="กลับหน้าหลัก" color="secondary" @click="goHome" />

        <!-- ✅ ข้อความสำเร็จ: ย้ายมาไว้ใต้ปุ่ม -->
        <div
          v-if="(hasForm === true && formSubmitted) || (hasForm === false && checkedOut)"
          class="text-positive q-mt-md"
        >
          {{ hasForm ? 'เช็คชื่อออกและทำแบบประเมินสำเร็จ' : 'เช็คชื่อออกสำเร็จ' }}
        </div>

        <!-- ข้อความผิดพลาด (ถ้ามีและยังไม่สำเร็จ) -->
        <div v-else-if="errorMessage" class="text-negative q-mt-md">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>
