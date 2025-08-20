<template>
  <q-card flat>
    <!-- Grid Table -->
    <div class="q-mb-md">
      <div class="row q-col-gutter-md">
        <!-- 🟩 Rows -->
        <div class="col-6">
          <div class="text-subtitle2">Rows</div>
          <div
            v-for="(row, rowIndex) in localData.rows"
            :key="rowIndex"
            class="row items-center q-gutter-sm q-my-sm"
          >
            <div>{{ rowIndex + 1 }}.</div>
            <q-input
              dense
              outlined
              :model-value="row"
               @update:model-value="val => updateRow(rowIndex, String(val ?? ''))"
              placeholder="Row label"
              class="col"
            />
            <q-btn icon="close" color="negative" flat round dense @click="removeRow(rowIndex)" />
          </div>
          <q-btn flat dense icon="add" label="Add row" size="sm" @click="addRow" />
        </div>

        <!-- 🟦 choices -->
        <div class="col-6">
          <div class="text-subtitle2">choices</div>
          <div
            v-for="(col, colIndex) in localData.choices"
            :key="colIndex"
            class="row items-center q-gutter-sm q-my-sm"
          >
            <q-radio v-model="dummy" :val="colIndex" dense disable />
            <q-input
              dense
              outlined
              :model-value="col"
             @update:model-value="val => updateColumn(colIndex, String(val ?? ''))"
              placeholder="Column label"
              class="col"
            />
            <q-btn icon="close" color="negative" flat round dense @click="removeColumn(colIndex)" />
          </div>
          <q-btn flat dense icon="add" label="Add column" size="sm" @click="addColumn" />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <q-separator spaced />
    <div class="row justify-between items-center">
      <q-btn flat icon="assignment" size="sm" label="Answer key" />
      <q-toggle
        v-model="localData.isRequired"
        label="Require a response in each row"
        left-label
        dense
        @update:model-value="update"
      />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

// Props
const props = defineProps<{
  modelValue: {
    questionText: string
    isRequired: boolean
    type: string
    rows: string[]
    choices: string[]
  }
}>()

const emit = defineEmits(['update:modelValue'])

// Dummy สำหรับ radio disable
const dummy = ref(null)

// Local reactive data (deep clone จาก props)
const localData = reactive({
  questionText: '',
  isRequired: false,
  type: '',
  rows: [] as string[],
  choices: [] as string[]
})

// Watch sync data เข้า localData
watch(
  () => props.modelValue,
  (val) => Object.assign(localData, val),
  { immediate: true, deep: true }
)

// Emit ออกไปทุกครั้งที่มีการเปลี่ยน
function update() {
  emit('update:modelValue', { ...localData })
}

// 🔧 Row / Column Handler
function updateRow(index: number, val: string) {
  localData.rows[index] = val
  update()
}
function addRow() {
  localData.rows.push('')
  update()
}
function removeRow(index: number) {
  localData.rows.splice(index, 1)
  update()
}

function updateColumn(index: number, val: string) {
  localData.choices[index] = val
  update()
}
function addColumn() {
  localData.choices.push('')
  update()
}
function removeColumn(index: number) {
  localData.choices.splice(index, 1)
  update()
}
</script>

<style scoped>
/* Optional Style */
</style>
