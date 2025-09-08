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
            :key="row.id"
            class="row items-center q-gutter-sm q-my-sm"
          >
            <div>{{ rowIndex + 1 }}.</div>
            <q-input
              dense
              outlined
              :model-value="row.title"
              @update:model-value="(val) => setRowTitle(rowIndex, String(val ?? ''))"
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
            v-for="(col, colIndex) in localData.choices"
            :key="col.id"
            class="row items-center q-gutter-sm q-my-sm"
          >
            <q-checkbox dense disable v-model="dummy[colIndex]" />
            <q-input
              dense
              outlined
              :model-value="col.title"
              @update:model-value="(val) => setColTitle(colIndex, String(val ?? ''))"
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
  </q-card>
</template>

<script setup lang="ts">
import { reactive, ref, watch, nextTick } from 'vue'
import { v4 as uuidv4 } from 'uuid'

type OptionRow = { id: string; title: string; sequence: number }

const props = defineProps<{
  modelValue: {
    questionText?: string
    title?: string
    description?: string
    isRequired: boolean
    type: string
    rows: (string | Omit<OptionRow, 'id'> | Partial<OptionRow>)[]
    choices: (string | Omit<OptionRow, 'id'> | Partial<OptionRow>)[]
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

// ---- helpers ----
const toOptionArray = (arr: (string | Partial<OptionRow>)[] | undefined): OptionRow[] =>
  (arr ?? []).map((x, i) => {
    if (typeof x === 'string') {
      return { id: uuidv4(), title: x, sequence: i + 1 }
    }
    return {
      id: x.id ?? uuidv4(),
      title: x.title ?? '',
      sequence: typeof x.sequence === 'number' ? x.sequence : i + 1,
    }
  })

const localData = reactive({
  questionText: '' as string,
  title: '' as string,
  description: '' as string,
  isRequired: false as boolean,
  type: 'grid_checkbox' as string,
  rows: [] as OptionRow[],
  choices: [] as OptionRow[],
  session: 1 as number,
})

// ====== anti-recursion guard ======
let syncingFromProps = false

// 1) props -> local (ไม่ emit)
watch(
  () => props.modelValue,
  async (v) => {
    syncingFromProps = true

    localData.questionText = v?.questionText ?? ''
    localData.title = v?.title ?? ''
    localData.description = v?.description ?? ''
    localData.isRequired = !!v?.isRequired
    localData.type = v?.type ?? 'grid_checkbox'
    localData.rows = toOptionArray(v?.rows ?? [])
    localData.choices = toOptionArray(v?.choices ?? [])
    localData.session = v?.session ?? 1

    // seed ถ้าว่าง
    if (localData.rows.length === 0) {
      localData.rows = [
        { id: uuidv4(), title: '', sequence: 1 },
        { id: uuidv4(), title: '', sequence: 2 },
        { id: uuidv4(), title: '', sequence: 3 },
      ]
    }
    if (localData.choices.length === 0) {
      localData.choices = [
        { id: uuidv4(), title: '5', sequence: 1 },
        { id: uuidv4(), title: '4', sequence: 2 },
        { id: uuidv4(), title: '3', sequence: 3 },
        { id: uuidv4(), title: '2', sequence: 4 },
        { id: uuidv4(), title: '1', sequence: 5 },
      ]
    }

    // sync dummy ให้ยาวเท่า choices
    dummy.value = Array.from({ length: localData.choices.length }, () => false)

    await nextTick(() => { syncingFromProps = false })
  },
  { immediate: true } 
)

// 2) local -> emit (เฉพาะเมื่อไม่ใช่ช่วง sync จาก props)
watch(
  () => ({
    questionText: localData.questionText,
    title: localData.title,
    description: localData.description,
    isRequired: localData.isRequired,
    type: localData.type,
    rows: localData.rows.map(r => ({ ...r })),        // shallow copy
    choices: localData.choices.map(c => ({ ...c })),  // shallow copy
    session: localData.session,
  }),
  () => {
    if (syncingFromProps) return
    emit('update:modelValue', {
      questionText: localData.questionText,
      title: localData.title,
      description: localData.description,
      isRequired: localData.isRequired,
      type: localData.type,
      rows: localData.rows.map((r, i) => ({ id: r.id, title: r.title ?? '', sequence: i + 1 })),
      choices: localData.choices.map((c, i) => ({ id: c.id, title: c.title ?? '', sequence: i + 1 })),
      session: localData.session,
    })
  },
  { deep: true }
)

// ---- setters ----
function setRowTitle(index: number, val: string) {
  if (!localData.rows[index]) {
    localData.rows[index] = { id: uuidv4(), title: '', sequence: index + 1 }
  }
  localData.rows[index].title = val
}

function setColTitle(index: number, val: string) {
  if (!localData.choices[index]) {
    localData.choices[index] = { id: uuidv4(), title: '', sequence: index + 1 }
  }
  localData.choices[index].title = val
}

// ---- handlers ----
function addRow() {
  localData.rows.push({ id: uuidv4(), title: '', sequence: localData.rows.length + 1 })
}
function removeRow(index: number) {
  localData.rows.splice(index, 1)
  localData.rows.forEach((r, i) => (r.sequence = i + 1))
}

function addColumn() {
  localData.choices.push({ id: uuidv4(), title: '', sequence: localData.choices.length + 1 })
  dummy.value.push(false)
}
function removeColumn(index: number) {
  localData.choices.splice(index, 1)
  dummy.value.splice(index, 1)
  localData.choices.forEach((c, i) => (c.sequence = i + 1))
}
</script>

