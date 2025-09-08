<template>
  <q-card flat>
    <div class="q-mb-md">
      <div class="row q-col-gutter-md">
        <!-- Rows -->
        <div class="col-6">
          <div class="text-subtitle2">Rows</div>
          <div
            v-for="(_, rowIndex) in localData.rows"
            :key="rowIndex"
            class="row items-center q-gutter-sm q-my-sm"
          >
            <div>{{ rowIndex + 1 }}.</div>
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

        <!-- Choices (Columns) -->
        <div class="col-6">
          <div class="text-subtitle2">choices</div>
          <div
            v-for="(_, colIndex) in localData.choices"
            :key="colIndex"
            class="row items-center q-gutter-sm q-my-sm"
          >
            <q-radio v-model="dummy" :val="colIndex" dense disable />
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

  </q-card>
</template>

<script setup lang="ts">
import { reactive, ref, watch, nextTick } from 'vue'

type OptionRow = { id?: string; title: string; sequence: number }

const props = defineProps<{
  modelValue: {
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
    title?: string
    description?: string
    isRequired: boolean
    type: string
    rows: OptionRow[]
    choices: OptionRow[]
    session: number
  }): void
}>()

const dummy = ref<number | null>(null)

const toOptionArray = (arr: (string | OptionRow)[] | undefined): OptionRow[] =>
  (arr ?? []).map((x, i) =>
    typeof x === 'string'
      ? { title: x, sequence: i + 1 }
      : { title: x.title ?? '', sequence: x.sequence ?? i + 1 }
  )

const localData = reactive({
  title: '' as string,
  description: '' as string,
  isRequired: false as boolean,
  type: 'grid_multiple_choice' as string,
  rows: [] as OptionRow[],
  choices: [] as OptionRow[],
  session: 1 as number,
})

/** ===== แกนหลัก: ป้องกันลูป watch <-> emit ===== */
let syncingFromProps = false

// 1) ซิงก์จาก props -> local "อย่างเดียว" (ห้าม emit)
watch(
  () => props.modelValue,
  async (v) => {
    syncingFromProps = true
    localData.title = v?.title ?? ''
    localData.description = v?.description ?? ''
    localData.isRequired = !!v?.isRequired
    localData.type = v?.type ?? 'grid_multiple_choice'
    localData.rows = toOptionArray(v?.rows ?? [])
    localData.choices = toOptionArray(v?.choices ?? [])
    localData.session = v?.session ?? 1

    // seed ถ้าว่าง
    if (localData.rows.length === 0) {
      localData.rows = [
        { title: '', sequence: 1 },
        { title: '', sequence: 2 },
        { title: '', sequence: 3 },
      ]
    }
    if (localData.choices.length === 0) {
      localData.choices = [
        { title: '5', sequence: 1 },
        { title: '4', sequence: 2 },
        { title: '3', sequence: 3 },
        { title: '2', sequence: 4 },
        { title: '1', sequence: 5 },
      ]
    }

    await nextTick(() => { syncingFromProps = false })
  },
  { immediate: true, deep: true }
)

// 2) เมื่อ local เปลี่ยน (จากการพิมพ์/กดปุ่ม) ค่อย emit ขึ้นไป
watch(
  () => ({ ...localData, rows: [...localData.rows], choices: [...localData.choices] }),
  () => {
    if (syncingFromProps) return // ถ้ากำลัง sync จาก props ห้าม emit กลับ
    emit('update:modelValue', {
      title: localData.title,
      description: localData.description,
      isRequired: localData.isRequired,
      type: localData.type,
      rows: localData.rows.map((r, i) => ({ title: r.title ?? '', sequence: i + 1 })),
      choices: localData.choices.map((c, i) => ({ title: c.title ?? '', sequence: i + 1 })),
      session: localData.session,
    })
  },
  { deep: true }
)

/** ===== handlers ===== */
function setRowTitle(index: number, val: string) {
  if (!localData.rows[index]) {
    localData.rows[index] = { title: '', sequence: index + 1 }
  }
  localData.rows[index].title = val
}

function setColTitle(index: number, val: string) {
  if (!localData.choices[index]) {
    localData.choices[index] = { title: '', sequence: index + 1 }
  }
  localData.choices[index].title = val
}

function addRow() {
  localData.rows.push({ title: '', sequence: localData.rows.length + 1 })
}
function removeRow(index: number) {
  localData.rows.splice(index, 1)
  localData.rows.forEach((r, i) => (r.sequence = i + 1))
}

function addColumn() {
  localData.choices.push({ title: '', sequence: localData.choices.length + 1 })
}
function removeColumn(index: number) {
  localData.choices.splice(index, 1)
  localData.choices.forEach((c, i) => (c.sequence = i + 1))
}
</script>

