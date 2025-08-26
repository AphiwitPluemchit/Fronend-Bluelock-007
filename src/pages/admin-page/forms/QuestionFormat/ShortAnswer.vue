<template>
  <q-card>
    <!-- Preview short answer -->
    <q-input
      v-model="shortAnswer"
      readonly
      placeholder="ตัวอย่างคำตอบ"
      outlined
      dense
      class="q-mb-md"
    />


  </q-card>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: {
    questionText: string
    type: string
  }
}>()

const localData = reactive({ ...props.modelValue })
const shortAnswer = ref('')

watch(
  () => props.modelValue,
  (val) => Object.assign(localData, val),
  { deep: true }
)
</script>
