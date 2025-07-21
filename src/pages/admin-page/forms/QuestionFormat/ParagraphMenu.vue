<template>
  <q-card>
    <q-input
      type="textarea"
      v-model="previewValue"
      readonly
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

const props = defineProps<{
  modelValue: {
    questionText: string
    isRequired: boolean
    type: string
    choices: string[]
  }
}>()

const emit = defineEmits(['update:modelValue'])
const previewValue = ref('')
const localData = reactive({ ...props.modelValue })

function update() {
  emit('update:modelValue', { ...localData })
}

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(localData, val)
  },
  { deep: true },
)
</script>

<style scoped>

</style>
