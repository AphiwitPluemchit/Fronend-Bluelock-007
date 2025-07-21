<script setup lang="ts">
import { useCheckinoutStore } from 'src/stores/checkinout'

const checkinoutStore = useCheckinoutStore()
const props = defineProps<{
  token: string
}>()
async function checkin() {
  await checkinoutStore.checkin(props.token)
}
console.log('token:', props.token)
</script>

<template>
  <div class="q-pa-md">
    <div>Check-in</div>
    <div>Token: {{ props.token }}</div>
    <q-btn @click="checkin">Checkin</q-btn>
  </div>
</template>
