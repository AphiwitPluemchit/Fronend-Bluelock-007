<template>
  <q-card flat>
    <!-- Grid Table -->
    <div class="q-mb-md">
      <div class="row q-col-gutter-md">
        <!-- 🔹 Rows -->
        <div class="col-6">
          <div class="text-subtitle2">Rows</div>
          <div
            v-for="(row, rowIndex) in localData.rows"
            :key="'row-' + rowIndex"
            class="row items-center q-gutter-sm q-my-sm"
          >
            <div>{{ rowIndex + 1 }}.</div>
            <q-input
              :model-value="row"
              @update:model-value="val => updateRow(rowIndex, String(val ?? ''))"
              placeholder="Row label"
              dense
              outlined
              class="col"
            />
            <q-btn icon="close" color="negative" flat round dense @click="removeRow(rowIndex)" />
          </div>
          <q-btn flat dense icon="add" label="Add row" size="sm" @click="addRow" />
        </div>

        <!-- 🔸 Columns -->
        <div class="col-6">
          <div class="text-subtitle2">Columns</div>
          <div
            v-for="(col, colIndex) in localData.columns"
            :key="'col-' + colIndex"
            class="row items-center q-gutter-sm q-my-sm"
          >
            <q-checkbox dense disable v-model="dummy[colIndex]" />
            <q-input
              :model-value="col"
              @update:model-value="val => updateColumn(colIndex, String(val ?? ''))"
              placeholder="Column label"
              dense
              outlined
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

const dummy = ref<boolean[]>([])

const props = defineProps<{
  modelValue: {
    questionText: string
    isRequired: boolean
    type: string
    rows: string[]
    columns: string[]
  }
}>()

const emit = defineEmits(['update:modelValue'])

const localData = reactive({
  questionText: '',
  isRequired: false,
  type: 'checkboxGrid',
  rows: [] as string[],
  columns: [] as string[]
})

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(localData, val)
    // ให้ dummy มีขนาดเท่ากับ columns เสมอ
    dummy.value = val.columns.map(() => false)
  },
  { immediate: true, deep: true }
)

function update() {
  emit('update:modelValue', { ...localData })
}

function updateRow(index: number, val: string) {
  localData.rows[index] = val
  update()
}

function updateColumn(index: number, val: string) {
  localData.columns[index] = val
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

function addColumn() {
  localData.columns.push('')
  dummy.value.push(false)
  update()
}

function removeColumn(index: number) {
  localData.columns.splice(index, 1)
  dummy.value.splice(index, 1)
  update()
}
</script>
