<script setup lang="ts">
import { useCheckinoutStore } from 'src/stores/checkinout'

const checkinoutStore = useCheckinoutStore()
const props = defineProps<{
  token: string
}>()
async function checkout() {
  await checkinoutStore.checkout(props.token)
}
console.log('studentId:', props.token)
</script>

<template>
  <div class="q-pa-md">
    <div>Check-in</div>
    <div>Token: {{ props.token }}</div>
    <q-btn @click="checkout">Checkout</q-btn>
  </div>
</template>
