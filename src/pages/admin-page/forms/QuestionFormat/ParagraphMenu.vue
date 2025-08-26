<template>
  <q-card>
    <q-input
      v-model="answer"
      type="textarea"
      placeholder="Long answer text"
      outlined
      dense
      autogrow
      class="q-mb-md"
    />

  </q-card>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Block } from 'src/types/form'

const props = defineProps<{ modelValue: Block }>()
const answer = ref('')
const localData = reactive({ ...props.modelValue })


watch(
  () => props.modelValue,
  (val) => {
    Object.assign(localData, val)
  },
  { immediate: true, deep: true },
)
</script>
