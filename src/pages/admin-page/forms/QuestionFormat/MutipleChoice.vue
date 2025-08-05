<template>
  <q-card>
    <div v-if="localData.choices && localData.choices.length > 0">
      <div
        v-for="(opt, index) in localData.choices"
        :key="index"
        class="row items-center q-gutter-sm q-mb-sm"
      >
        <q-radio disable :model-value="null" :val="opt.title" />
        <q-input
          v-if="localData.choices[index]"
          v-model="localData.choices[index].title"
          dense
          outlined
          placeholder="Option"
          class="col"
          @update:model-value="update"
        />
        <q-btn icon="close" color="negative" dense flat round @click="removeOption(index)" />
      </div>
    </div>

    <q-btn dense flat size="sm" icon="add" label="Add option" class="q-mb-sm" @click="addOption" />

    <q-separator spaced />

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
import type { Block } from 'src/types/form'

const props = defineProps<{
  modelValue: Block
}>()

const emit = defineEmits(['update:modelValue'])
const localData = reactive({ ...props.modelValue })

function update() {
  emit('update:modelValue', { ...localData })
}

function addOption() {
  localData.choices.push({
    title: `Option ${localData.choices.length + 1}`,
    sequence: localData.choices.length + 1,
  })
  update()
}

function removeOption(index: number) {
  localData.choices.splice(index, 1)
  update()
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
  border-radius: 15px;
  border: 1px solid #e0e0e0;
}
</style>
