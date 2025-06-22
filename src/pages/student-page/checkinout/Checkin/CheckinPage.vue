<script setup lang="ts">
import { useCheckinoutStore } from 'src/stores/checkinout'

const checkinoutStore = useCheckinoutStore()
const props = defineProps<{
  studentId: string
  uuid: string
}>()
async function checkin() {
  await checkinoutStore.checkin(props.studentId, props.uuid)
}
console.log('studentId:', props.studentId)
console.log('uuid:', props.uuid)
</script>

<template>
  <q-page class="q-pa-md">
    <div>Check-in</div>
    <div>Student ID: {{ props.studentId }}</div>
    <div>UUID: {{ props.uuid }}</div>
    <q-btn @click="checkin">Checkin</q-btn>
  </q-page>
</template>
