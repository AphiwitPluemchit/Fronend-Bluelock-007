<template>
  <q-card>
    <!-- 🔽 Dropdown Options -->
    <div
      v-for="(opt, index) in localData.choices"
      :key="index"
      class="row items-center q-gutter-sm q-mb-sm"
    >
      <div class="text-caption" style="width: 20px">{{ index + 1 }}.</div>
      <q-input
        dense
        outlined
        :model-value="opt"
        @update:model-value="val => updateOption(index, String(val ?? ''))"
        placeholder="Option"
        class="col"
      />
      <q-btn icon="close" color="negative" dense flat round @click="removeOption(index)" />
    </div>

    <!-- ➕ Add Option -->
    <q-btn flat dense size="sm" icon="add" label="Add option" @click="addOption" />


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

const localData = reactive({
  questionText: '',
  choices: [] as string[],
  isRequired: false,
  type: ''
})

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(localData, val)
  },
  { immediate: true, deep: true }
)

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

function updateOption(index: number, val: string) {
  localData.choices[index] = val
  update()
}
</script>
