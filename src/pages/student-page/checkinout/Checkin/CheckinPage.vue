<script setup lang="ts">
import { useCheckinoutStore } from 'src/stores/checkinout'
import { ref } from 'vue';

const checkinoutStore = useCheckinoutStore()
const isChecked = ref(false)
const props = defineProps<{
  token: string
}>()
async function checkin() {
  try {
    await checkinoutStore.checkin(props.token)
    isChecked.value = true
  } catch (error) {
    console.error(error)
    isChecked.value = false
  }
}
console.log('token:', props.token)
</script>

<template>
  <div v-if="!isChecked" class="q-pa-md">
    <div>Check-in</div>
    <div>Token: {{ props.token }}</div>
    <q-btn @click="checkin">Checkin</q-btn>
  </div>
  <div v-if="isChecked">
    <div>Checkin success</div>
  </div>
</template>
