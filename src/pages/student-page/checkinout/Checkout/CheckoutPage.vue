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
const formSubmitted = ref(route.query.formSubmitted === 'true')

// Watch for route changes
watch(() => route.query.formSubmitted, (newVal) => {
  formSubmitted.value = newVal === 'true'
}, { immediate: true })
const props = defineProps<{
  token: string
  program?: Partial<Program>
}>()

onMounted(() => {
  if (localStorage.getItem('formSubmissionSuccess') === 'true') {
    formSubmitted.value = true
    localStorage.removeItem('formSubmissionSuccess')
  }
})

async function goToForm() {
  errorMessage.value = ''
  loading.value = true

  try {
    // ดึงข้อมูล program เพื่อหา formId
    if (!props.program?.id) {
      errorMessage.value = 'ไม่พบข้อมูลโครงการ'
      return
    }

    // ดึง formId จาก API
    const formData = await checkinoutStore.getProgramForm(props.program.id)
    if (!formData?.formId) {
      errorMessage.value = 'โครงการนี้ไม่มีแบบฟอร์มให้ทำ'
      return
    }

    // นำทางไปยังหน้า form พร้อมส่ง token และ formId
    await router.push({
      name: 'student-form-fill',
      params: { id: formData.formId },
      query: {
        checkoutToken: props.token,
        programId: props.program.id,
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

async function goHome() {
  if (props.program?.id) {
    await router.push(`/Student/Program/MyProgramDetail/${props.program.id}/checkInOut`)
  } else {
    await router.push('/Student/Home')
  }
}
</script>

<template>
  <div class="q-pa-md">
    <div>
      <div v-if="props.program?.name" class="q-mb-sm">โครงการ: {{ props.program?.name }}</div>
      <div v-if="formSubmitted" class="text-positive q-mb-md">
        เช็คชื่อออกและทำแบบประเมินสำเร็จ
      </div>
      <div class="q-pa-md">
        <q-btn
          class="btnconfirm"
          @click="formSubmitted ? goHome() : goToForm()"
          :loading="loading"
          :disable="loading"
        >
          {{ formSubmitted ? 'ดูรายละเอียด' : 'ทำแบบประเมิน' }}
        </q-btn>
      </div>
      <div v-if="errorMessage" class="text-negative q-mt-md">{{ errorMessage }}</div>
    </div>
  </div>
</template>
