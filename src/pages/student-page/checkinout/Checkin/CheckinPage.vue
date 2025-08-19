<script setup lang="ts">
import { useCheckinoutStore } from 'src/stores/checkinout'
import { ref } from 'vue';
import type { AxiosError } from 'axios'
import type{ ErrorResponse } from 'src/types/pagination';
import type { Activity } from 'src/types/activity'

const checkinoutStore = useCheckinoutStore()
const errorMessage = ref('')
const isChecked = ref(false)
const isSubmitted = ref(false)
const props = defineProps<{
  token: string
  activity?: Partial<Activity>
}>()
async function checkin() {
  // reset state ก่อนทุกครั้ง
  errorMessage.value = ''
  isChecked.value = false
  isSubmitted.value = false
  try {
    await checkinoutStore.checkin(props.token)
    isChecked.value = true
  } catch (error: unknown) {
    console.log(error);

    let msg = 'เกิดข้อผิดพลาด';
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      const axiosErr = error as AxiosError;
      const errData = axiosErr.response?.data as ErrorResponse;
      if (errData && typeof errData === 'object' && typeof errData.error === 'string') {
        msg = errData.error;
      } else if (axiosErr.message) {
        msg = axiosErr.message;
      }
    } else if (error instanceof Error) {
      msg = error.message;
    }
    errorMessage.value = msg;
  } finally {
    isSubmitted.value = true;
  }
}
console.log('token:', props.token)
</script>

<template>
  <div class="q-pa-md">
    <div>
      <div v-if="props.activity?.name" class="text-grey-8 q-mb-sm">กิจกรรม: {{ props.activity?.name }}</div>
      <div class="q-pa-md">
        <q-btn class="btngrey" @click="checkin">Checkin</q-btn>
      </div>
      <div v-if="isSubmitted">
        <div v-if="isChecked" class="text-positive">Checkin success</div>
        <div v-else-if="errorMessage" class="text-negative q-mt-md">{{ errorMessage }}</div>
      </div>
    </div>
  </div>

</template>
