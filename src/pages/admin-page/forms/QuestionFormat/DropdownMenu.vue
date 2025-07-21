<template>
  <q-card>
    <!-- 🔽 Dropdown Options -->
    <div v-for="(opt, index) in localData.choices" :key="index" class="row items-center q-gutter-sm q-mb-sm">
      <div class="text-caption" style="width: 20px">{{ index + 1 }}.</div>
      <q-input
        v-model="localData.choices[index]"
        dense
        outlined
        placeholder="Option"
        class="col"
        @update:model-value="update"
      />
      <q-btn icon="close" dense flat round @click="removeOption(index)" />
    </div>

    <!-- ➕ Add Option -->
    <q-btn flat dense size="sm" icon="add" label="Add option" @click="addOption" />

    <q-separator spaced />

    <!-- Footer Actions -->
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
import { reactive, watch } from 'vue'

const props = defineProps<{
  modelValue: {
    questionText: string
    choices: string[]
    isRequired: boolean
    type: string
  }
}>()

const emit = defineEmits(['update:modelValue'])

const localData = reactive({ ...props.modelValue })

function update() {
  emit('update:modelValue', { ...localData })
}

function addOption() {
  localData.choices.push(`Option ${localData.choices.length + 1}`)
  update()
}

function removeOption(index: number) {
  localData.choices.splice(index, 1)
  update()
}

watch(() => props.modelValue, (val) => {
  Object.assign(localData, val)
}, { deep: true })
</script>

<style scoped>
.title-card {
  max-width: 1000px;
  width: 100%;
  border-radius: 15px;
  border: 1px solid #e0e0e0;
}
</style>
