<script setup lang="ts">
import { useCheckinoutStore } from 'src/stores/checkinout'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { AxiosError } from 'axios'
import type { ErrorResponse } from 'src/types/pagination'
import type { Program } from 'src/types/program'

const router = useRouter()
const checkinoutStore = useCheckinoutStore()
const errorMessage = ref('')
const isChecked = ref(false)
const isSubmitted = ref(false)

const props = defineProps<{
  token: string
  program?: Partial<Program>
  claimToken?: string // 🆕
}>()

async function checkin() {
  // reset state ก่อนทุกครั้ง
  errorMessage.value = ''
  isChecked.value = false
  isSubmitted.value = false

  try {
    // ถ้ามี claimToken ให้ใช้ claimToken แทน
    if (props.claimToken) {
      await checkinoutStore.checkinWithClaim(props.claimToken)
    } else {
      await checkinoutStore.checkin(props.token)
    }
    isChecked.value = true
  } catch (error: unknown) {
    console.log(error)

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
    isSubmitted.value = true
  }
}

async function goHome() {
  if (props.program?.id) {
    await router.push(`/Student/Program/MyProgramDetail/${props.program.id}/checkInOut`)
  } else {
    await router.push('/Student/Home')
  }
}

console.log('token:', props.token)
</script>

<template>
  <div class="q-pa-md">
    <div>
      <div v-if="props.program?.name" class="q-mb-sm">{{ props.program?.name }}</div>
      <div class="q-pa-md">
        <!-- 🔹 ปุ่มเปลี่ยนตามสถานะ -->
        <q-btn
          v-if="!isChecked"
          class="btnconfirm"
          label="เช็คชื่อ"
          color="primary"
          @click="checkin"
        />
        <q-btn v-else class="btnconfirm" label="ดูรายละเอียด" color="secondary" @click="goHome" />
      </div>
      <div v-if="isSubmitted">
        <div v-if="isChecked" class="text-positive">เช็คชื่อเข้าร่วมสำเร็จ</div>
        <div v-else-if="errorMessage" class="text-negative q-mt-md">{{ errorMessage }}</div>
      </div>
    </div>
  </div>
</template>
