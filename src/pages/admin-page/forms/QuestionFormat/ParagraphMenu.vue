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

    <q-separator spaced />

    <!-- Footer -->
    <div class="row justify-between items-center">
      <q-btn flat icon="assignment" size="sm" label="Answer key" />
      <div class="row items-center q-gutter-sm">
        <q-toggle
          v-model="localData.isRequired"
          label="Required"
          left-label
          dense
          @update:model-value="update"
        />
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Block } from 'src/types/form'

const props = defineProps<{ modelValue: Block }>()
const emit = defineEmits(['update:modelValue'])
const answer = ref('')
const localData = reactive({ ...props.modelValue })

function update() {
  emit('update:modelValue', { ...localData })
}

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(localData, val)
  },
  { immediate: true, deep: true },
)
</script>
