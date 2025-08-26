<template>
  <q-card>
    <!-- 🔵 รายการตัวเลือก checkbox -->
    <div class="q-mb-md">
      <div
        v-for="(choice, index) in localData.choices"
        :key="index"
        class="row items-center q-gutter-sm q-mb-sm"
      >
        <q-checkbox
          :model-value="!!choice.title"
          checked-icon="check_box"
          unchecked-icon="check_box_outline_blank"
          disable
        />
        <q-input
          :model-value="choice.title"
          @update:model-value="val => updateOption(index, String(val ?? ''))"
          placeholder="Option"
          outlined
          dense
          class="col"
        />
        <q-btn
          icon="close"
          color="negative"
          dense
          flat
          round
          @click="removeOption(index)"
        />
      </div>
      <q-btn
        flat
        dense
        size="sm"
        icon="add"
        label="Add option"
        @click="addOption"
      />
    </div>

  </q-card>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Block } from 'src/types/form'

const props = defineProps<{
  modelValue: Block
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Block): void
}>()

const localData = reactive<Block>({
  ...props.modelValue,
  choices: [...props.modelValue.choices] // ensure reactivity
})

// Sync จาก props → local
watch(
  () => props.modelValue,
  (val) => Object.assign(localData, { ...val, choices: [...val.choices] }),
  { deep: true, immediate: true }
)

function update() {
  emit('update:modelValue', { ...localData })
}

function addOption() {
  const nextSeq = localData.choices.length
  localData.choices.push({
    title: `Option ${nextSeq + 1}`,
    sequence: nextSeq
  })
  update()
}

function removeOption(index: number) {
  localData.choices.splice(index, 1)
  // อัปเดต sequence ใหม่ให้ถูกต้อง
  localData.choices.forEach((c, i) => (c.sequence = i))
  update()
}

function updateOption(index: number, value: string) {
  if (localData.choices[index]) {
    localData.choices[index].title = value
    update()
  }
}

</script>

<style scoped>
.q-card {
  max-width: 1000px;
  width: 100%;
  border-radius: 15px;
  border: 1px solid #e0e0e0;
}
</style>
