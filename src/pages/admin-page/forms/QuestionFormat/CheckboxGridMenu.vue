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

        <!-- 🔸 choices -->
        <div class="col-6">
          <div class="text-subtitle2">choices</div>
          <div
            v-for="(col, colIndex) in localData.choices"
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
    choices: string[]
  }
}>()

const emit = defineEmits(['update:modelValue'])

const localData = reactive({
  questionText: '',
  isRequired: false,
  type: 'checkboxGrid',
  rows: [] as string[],
  choices: [] as string[]
})

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(localData, val)
    // ให้ dummy มีขนาดเท่ากับ choices เสมอ
    dummy.value = val.choices.map(() => false)
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
  localData.choices[index] = val
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
  localData.choices.push('')
  dummy.value.push(false)
  update()
}

function removeColumn(index: number) {
  localData.choices.splice(index, 1)
  dummy.value.splice(index, 1)
  update()
}
</script>
