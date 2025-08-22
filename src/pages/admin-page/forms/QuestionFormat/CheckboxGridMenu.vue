<template>
  <q-card flat>
    <!-- Grid Table -->
    <div class="q-mb-md">
      <div class="row q-col-gutter-md">
        <!-- 🔹 Rows -->
        <div class="col-6">
          <div class="text-subtitle2">Rows</div>
          <div
            v-for="(_, rowIndex) in localData.rows"
            :key="'row-' + rowIndex"
            class="row items-center q-gutter-sm q-my-sm"
          >
            <div>{{ rowIndex + 1 }}.</div>
            <!-- ใช้ :model-value + setter กัน undefined -->
            <q-input
              dense
              outlined
              :model-value="localData.rows?.[rowIndex]?.title ?? ''"
              @update:model-value="val => setRowTitle(rowIndex, String(val ?? ''))"
              placeholder="Row label"
              class="col"
            />
            <q-btn icon="close" color="negative" flat round dense @click="removeRow(rowIndex)" />
          </div>
          <q-btn flat dense icon="add" label="Add row" size="sm" @click="addRow" />
        </div>

        <!-- 🔸 Choices -->
        <div class="col-6">
          <div class="text-subtitle2">choices</div>
          <div
            v-for="(_, colIndex) in localData.choices"
            :key="'col-' + colIndex"
            class="row items-center q-gutter-sm q-my-sm"
          >
            <q-checkbox dense disable v-model="dummy[colIndex]" />
            <q-input
              dense
              outlined
              :model-value="localData.choices?.[colIndex]?.title ?? ''"
              @update:model-value="val => setColTitle(colIndex, String(val ?? ''))"
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
        @update:model-value="emitUpdate"
      />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

type OptionRow = { title: string; sequence: number }

const props = defineProps<{
  modelValue: {
    
    questionText?: string
    title?: string
    description?: string
    isRequired: boolean
    type: string
    rows: (string | OptionRow)[]
    choices: (string | OptionRow)[]
    session?: number
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: {
    questionText?: string
    title?: string
    description?: string
    isRequired: boolean
    type: string
    rows: OptionRow[]
    choices: OptionRow[]
    session: number
  }): void
}>()

const dummy = ref<boolean[]>([])

const toOptionArray = (arr: (string | OptionRow)[] | undefined): OptionRow[] =>
  (arr ?? []).map((x, i) =>
    typeof x === 'string'
      ? { title: x, sequence: i + 1 }
      : { title: x.title ?? '', sequence: x.sequence ?? i + 1 }
  )

/** เก็บสถานะภายในให้เป็น OptionRow[] เสมอ */
const localData = reactive({
  questionText: '' as string,
  title: '' as string,
  description: '' as string,
  isRequired: false as boolean,
  type: 'grid_checkbox' as string, // ชื่อ type ที่สอดคล้องฝั่ง Builder
  rows: [] as OptionRow[],
  choices: [] as OptionRow[],
  session: 1 as number,
})

watch(
  () => props.modelValue,
  (v) => {
    localData.questionText = v?.questionText ?? ''
    localData.title = v?.title ?? ''
    localData.description = v?.description ?? ''
    localData.isRequired = !!v?.isRequired
    localData.type = v?.type ?? 'grid_checkbox'
    localData.rows = toOptionArray(v?.rows ?? [])
    localData.choices = toOptionArray(v?.choices ?? [])
    localData.session = v?.session ?? 1

    if (localData.rows.length === 0) {
      localData.rows = [
        { title: '', sequence: 1 },
        { title: '', sequence: 2 },
        { title: '', sequence: 3 },
      ]
    }
    if (localData.choices.length === 0) {
      // Likert 5→1 ตัวอย่าง
      localData.choices = [
        { title: '5', sequence: 1 },
        { title: '4', sequence: 2 },
        { title: '3', sequence: 3 },
        { title: '2', sequence: 4 },
        { title: '1', sequence: 5 },
      ]
    }

    // sync dummy ให้ยาวเท่ากับ choices
    dummy.value = Array.from({ length: localData.choices.length }, () => false)

    emitUpdate()
  },
  { immediate: true, deep: true }
)

function emitUpdate() {
  emit('update:modelValue', {
    questionText: localData.questionText,
    title: localData.title,
    description: localData.description,
    isRequired: localData.isRequired,
    type: localData.type,
    rows: localData.rows.map((r, i) => ({ title: r.title ?? '', sequence: i + 1 })),
    choices: localData.choices.map((c, i) => ({ title: c.title ?? '', sequence: i + 1 })),
    session: localData.session, // ให้เป็น number เสมอ (กัน exactOptionalPropertyTypes)
  })
}

/** setters แบบปลอดภัย (กัน undefined) */
function setRowTitle(index: number, val: string) {
  if (!localData.rows[index]) {
    localData.rows[index] = { title: '', sequence: index + 1 }
  }
  localData.rows[index].title = val
  emitUpdate()
}

function setColTitle(index: number, val: string) {
  if (!localData.choices[index]) {
    localData.choices[index] = { title: '', sequence: index + 1 }
  }
  localData.choices[index].title = val
  emitUpdate()
}

/** handlers */
function addRow() {
  localData.rows.push({ title: '', sequence: localData.rows.length + 1 })
  emitUpdate()
}
function removeRow(index: number) {
  localData.rows.splice(index, 1)
  localData.rows.forEach((r, i) => (r.sequence = i + 1))
  emitUpdate()
}

function addColumn() {
  localData.choices.push({ title: '', sequence: localData.choices.length + 1 })
  dummy.value.push(false)
  emitUpdate()
}
function removeColumn(index: number) {
  localData.choices.splice(index, 1)
  dummy.value.splice(index, 1)
  localData.choices.forEach((c, i) => (c.sequence = i + 1))
  emitUpdate()
}
</script>
