<template>
  <q-card>
    <!-- Editable question text -->
    <q-input
      v-model="localData.questionText"
      label="คำถาม"
      outlined
      dense
      class="q-mb-sm"
      @update:model-value="update"
    />

    <!-- Preview short answer -->
    <q-input
      v-model="shortAnswer"
      readonly
      placeholder="ตัวอย่างคำตอบ"
      outlined
      dense
      class="q-mb-md"
    />

    <q-separator spaced />

    <!-- Footer actions -->
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

// sync external props
watch(
  () => props.modelValue,
  (val) => Object.assign(localData, val),
  { deep: true }
)
</script>
