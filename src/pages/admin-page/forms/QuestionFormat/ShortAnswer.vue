<template>
  <q-card >
    <q-input
      v-model="shortAnswer"
      readonly
      placeholder="Short answer text"
      outlined
      dense
      class="q-mb-md"
    />

    <q-separator spaced />

    <div class="row justify-between items-center">
      <q-btn flat size="sm" icon="assignment" label="Answer key" />
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
  }
}>()

const emit = defineEmits(['update:modelValue'])

const localData = reactive({ ...props.modelValue })
const shortAnswer = ref('')

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
.title-card {
  max-width: 1000px;
  width: 100%;
  min-height: 150px;
  border-radius: 15px;
  border: 1px solid #e0e0e0;
}
</style>
