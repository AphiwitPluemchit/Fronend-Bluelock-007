<script setup lang="ts">
import { useCheckinoutStore } from 'src/stores/checkinout'
import { ref } from 'vue';
import type { AxiosError } from 'axios'
import type{ ErrorResponse } from 'src/types/pagination';

const checkinoutStore = useCheckinoutStore()
const errorMessage = ref('')
const isChecked = ref(false)
const isSubmitted = ref(false)
const props = defineProps<{
  token: string
}>()
async function checkout() {
  errorMessage.value = ''
  isChecked.value = false
  isSubmitted.value = false
  try {
    await checkinoutStore.checkout(props.token)
    isChecked.value = true
  }  catch (error: unknown) {
    console.error(error)
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
console.log('studentId:', props.token)
</script>

<template>
  <div class="q-pa-md">
    <div>
      <div>Check-out</div>
      <div>Token: {{ props.token }}</div>
      <q-btn @click="checkout">Checkout</q-btn>
      <div v-if="isSubmitted">
        <div v-if="isChecked" class="text-positive">Checkout success</div>
        <div v-else-if="errorMessage" class="text-negative q-mt-md">{{ errorMessage }}</div>
      </div>
    </div>
  </div>
</template>
