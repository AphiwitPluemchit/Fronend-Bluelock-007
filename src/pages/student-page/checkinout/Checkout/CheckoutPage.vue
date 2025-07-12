<script setup lang="ts">
import { useCheckinoutStore } from 'src/stores/checkinout'

const checkinoutStore = useCheckinoutStore()
const props = defineProps<{
  studentId: string
  evaluationId: string
  uuid: string
}>()
async function Checkout() {
  await checkinoutStore.checkout(props.studentId, props.evaluationId, props.uuid)
}
console.log('studentId:', props.studentId)
console.log('uuid:', props.evaluationId)
console.log('uuid:', props.uuid)
</script>

<template>
  <q-page class="q-pa-md">
    <div>Check-in</div>
    <div>Student ID: {{ props.studentId }}</div>
    <div>UUID: {{ props.uuid }}</div>
    <q-btn @click="Checkout">Checkout</q-btn>
  </q-page>
</template>
