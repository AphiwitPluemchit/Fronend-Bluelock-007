<script setup lang="ts">
import { useCheckinoutStore } from 'src/stores/checkinout'
import { ref } from 'vue';

const checkinoutStore = useCheckinoutStore()
const isChecked = ref(false)
const props = defineProps<{
  token: string
}>()
async function checkout() {
  try {
    await checkinoutStore.checkout(props.token)
    isChecked.value = true
  } catch (error) {
    console.error(error)
  }
}
console.log('studentId:', props.token)
</script>

<template>
  <div v-if="!isChecked" class="q-pa-md">
    <div>Check-in</div>
    <div>Token: {{ props.token }}</div>
    <q-btn @click="checkout">Checkout</q-btn>
  </div>
  <div v-if="isChecked">
    <div>Checkout success</div>
  </div>
</template>
