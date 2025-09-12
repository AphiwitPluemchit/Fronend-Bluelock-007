<script setup lang="ts">
import { useCheckinoutStore } from 'src/stores/checkinout'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import type { AxiosError } from 'axios'
import type { ErrorResponse } from 'src/types/pagination'
import type { Program } from 'src/types/program'

const checkinoutStore = useCheckinoutStore()
const router = useRouter()
const errorMessage = ref('')
// const isChecked = ref(false)
// const isSubmitted = ref(false)
const loading = ref(false)
const props = defineProps<{
  token: string
  program?: Partial<Program>
}>()

async function goToForm() {
  errorMessage.value = ''
  loading.value = true

  try {
    // ดึงข้อมูล program เพื่อหา formId
    if (!props.program?.id) {
      errorMessage.value = 'ไม่พบข้อมูลกิจกรรม'
      return
    }

    // ดึง formId จาก API
    const formData = await checkinoutStore.getProgramForm(props.program.id)
    if (!formData?.formId) {
      errorMessage.value = 'กิจกรรมนี้ไม่มีแบบฟอร์มให้ทำ'
      return
    }

    // นำทางไปยังหน้า form พร้อมส่ง token และ formId
    await router.push({
      name: 'student-form-fill',
      params: { id: formData.formId },
      query: {
        checkoutToken: props.token,
        programId: props.program.id
      }
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

console.log('studentId:', props.token)
</script>

<template>
  <div class="q-pa-md">
    <div>
      <div v-if="props.program?.name" class="q-mb-sm">กิจกรรม: {{ props.program?.name }}</div>
      <div class="q-pa-md">
        <q-btn
          class="btnconfirm"
          @click="goToForm"
          :loading="loading"
          :disable="loading"
        >
          ทำแบบฟอร์ม
        </q-btn>
      </div>
      <div v-if="errorMessage" class="text-negative q-mt-md">{{ errorMessage }}</div>
    </div>
  </div>
</template>
