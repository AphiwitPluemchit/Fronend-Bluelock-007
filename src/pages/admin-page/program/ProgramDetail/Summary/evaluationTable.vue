<script setup lang="ts">
import { computed, ref, watch, toRaw } from 'vue'
import type { Program, ProgramItem } from 'src/types/program'
import type { Block as FormBlock } from 'src/types/form'
import type { Form } from 'src/types/form'
import { useFormStore } from 'src/stores/forms'
import { useSubmissionStore } from 'src/stores/submission'
import type { BlockCountItem } from 'src/services/submission'
import type { Submission } from 'src/types/submission'
import type { Choice } from 'src/types/form'
import type { Component } from 'vue'
// Chart
import BarChart from 'src/components/chart/BarChart.vue'
import PieChart from 'src/components/chart/PieChart.vue'
import TableChart from 'src/components/chart/TableChart.vue'
import GridBarChart from 'src/components/chart/GridBarChart.vue'
import GridPieChart from 'src/components/chart/GridPieChart.vue'
import GridTableChart from 'src/components/chart/GridTableChart.vue'

type GridItem = { id: string; title: string; sequence: number }

function isGrid(block: FormBlock) {
  return block.type === 'grid_multiple_choice' || block.type === 'grid_checkbox'
}
const props = defineProps<{ program: Program | null | undefined }>()
const viewModes = ref<Record<string, 'bar' | 'pie' | 'table'>>({})

const loadingForm = ref(false)
const checkedOnce = ref(false)
const formStore = useFormStore()
const submissionStore = useSubmissionStore()
const safeBlocks = computed(() => currentForm.value?.blocks ?? [])

const chartMap: Record<'bar' | 'pie' | 'table', Component> = {
  bar: BarChart,
  pie: PieChart,
  table: TableChart,
}

function changeViewMode(blockId: string, mode: 'bar' | 'pie' | 'table') {
  viewModes.value[blockId] = mode
}

function resolveChart(blockId?: string): Component {
  const mode = (blockId ? viewModes.value[blockId] : undefined) ?? 'bar'
  const safeMode: 'bar' | 'pie' | 'table' =
    mode === 'pie' ? 'pie' : mode === 'table' ? 'table' : 'bar'
  return chartMap[safeMode]
}

const submissionsForCurrentForm = computed<Submission[]>(() => {
  const id = formIdHex.value
  if (!id) return []
  return submissionStore.getFormSubmissions(id)
})

function pickHex24(v: unknown): string | null {
  if (typeof v === 'string') {
    const m = v.match(/[0-9a-fA-F]{24}/)
    return m ? m[0] : null
  }
  if (typeof v === 'object' && v !== null) {
    const r = v as Record<string, unknown>
    if (typeof r.$oid === 'string') {
      const m = r.$oid.match(/[0-9a-fA-F]{24}/)
      return m ? m[0] : null
    }
  }
  return null
}
function getProp<T>(obj: unknown, key: string): T | null {
  if (typeof obj === 'object' && obj !== null && key in (obj as Record<string, unknown>)) {
    return (obj as Record<string, unknown>)[key] as T
  }
  return null
}
const currentForm = computed<Form | null>(() => {
  const id = formIdHex.value
  if (!id) return null
  return formStore.forms.find((f) => typeof f.id === 'string' && f.id === id) ?? null
})
function isGridItemFull(x: unknown): x is GridItem {
  if (!x || typeof x !== 'object') return false
  const r = x as Record<string, unknown>
  return typeof r.id === 'string' && typeof r.title === 'string' && typeof r.sequence === 'number'
}

function pickArray(obj: Record<string, unknown>, key: string): unknown[] {
  const v = obj[key]
  return Array.isArray(v) ? v : []
}
type GridDataset = {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
}
function buildGridBarChart(block: FormBlock) {
  const formId = formIdHex.value
  if (!formId || !block?.id) {
    return {
      labels: [] as string[],
      datasets: [] as GridDataset[],
      stacked: false,
      empty: true,
    }
  }
  const dict = block as unknown as Record<string, unknown>

  const rawRows = pickArray(dict, 'rows')
  const rawChoices = pickArray(dict, 'choices')
  const rawColumns = pickArray(dict, 'columns')

  const rows = rawRows.filter(isGridItemFull).sort((a, b) => a.sequence - b.sequence)
  // ใช้ choices ก่อน ถ้าไม่มีค่อย fallback เป็น columns
  const cols = (rawChoices.length ? rawChoices : rawColumns)
    .filter(isGridItemFull)
    .sort((a, b) => a.sequence - b.sequence)

  if (!rows.length || !cols.length) {
    return {
      labels: [] as string[],
      datasets: [] as GridDataset[],
      stacked: false,
      empty: true,
    }
  }

  const items = analyticsForCurrentForm.value.filter((a) => a.blockId === block.id)
  const labels = rows.map((r) => r.title)

  const palette = [
    '#2E3192',
    '#6A36B0',
    '#A34FD6',
    '#D474F0',
    '#F29CF9',
    '#7E57C2',
    '#26A69A',
    '#42A5F5',
    '#FF7043',
  ]

  const datasets: GridDataset[] = cols.map((c, ci) => {
    const data = rows.map((r) => {
      const it = items.find((x) => x.rowId === r.id && x.choiceId === c.id)
      return it?.count ?? 0
    })
    // ✅ ให้เป็น string ชัดเจน ไม่ใช่ string | undefined
    const color: string = palette[ci % palette.length] ?? '#1A237E'
    return {
      label: c.title,
      data,
      backgroundColor: color,
      borderColor: color,
    }
  })

  const empty = datasets.every((ds) => ds.data.every((v) => v === 0))
  return { labels, datasets, stacked: false, empty }
}

const formIdHex = computed(() => {
  const p = toRaw(props.program)
  const raw =
    getProp<string | Record<string, unknown>>(p, 'formId') ??
    getProp<string | Record<string, unknown>>(p, 'formsId')
  return pickHex24(raw)
})

const formTitle = computed(() => {
  const id = formIdHex.value
  if (!id) return ''
  const f = formStore.forms.find((x: Form) => typeof x.id === 'string' && x.id === id)
  return f?.title ?? ''
})

const textAnswersByBlock = computed<Record<string, string[]>>(() => {
  const id = formIdHex.value
  if (!id) return {}
  const subs = submissionStore.getFormSubmissions(id)
  const out: Record<string, string[]> = {}
  for (const sub of subs) {
    for (const r of sub.responses ?? []) {
      // เฉพาะคำตอบข้อความ
      if (r.blockId && typeof r.answerText === 'string' && r.answerText.trim() !== '') {
        ;(out[r.blockId] ??= []).push(r.answerText.trim())
      }
    }
  }
  return out
})

const analyticsForCurrentForm = computed<BlockCountItem[]>(() => {
  const id = formIdHex.value
  if (!id) return []
  return submissionStore.getFormAnalytics(id)
})

function isAllZero(arr: number[]) {
  return arr.length === 0 || arr.every((v) => v === 0)
}
function isChoiceFull(c: unknown): c is Choice & { id: string } {
  if (!c || typeof c !== 'object') return false
  const r = c as Partial<Choice>
  return typeof r.id === 'string' && typeof r.title === 'string' && typeof r.sequence === 'number'
}

function buildChoiceChart(block: FormBlock) {
  const formId = formIdHex.value
  if (!formId || !block?.id) {
    return {
      labels: [],
      datasets: [{ label: 'จำนวนผู้ตอบ', data: [] }],
      stacked: false,
      empty: true,
    }
  }

  const items = analyticsForCurrentForm.value.filter((a) => a.blockId === block.id)
  const hasChoices = Array.isArray(block.choices) && block.choices.length > 0

  // ----- rating: ถ้าไม่มี choices ให้ fallback ไปนับจาก submissions (answerText เป็นตัวเลข 1..max)
  if (block.type === 'rating' && !hasChoices) {
    const max = Number(block.max ?? 5)
    const labels = Array.from({ length: max }, (_, i) => String(i + 1))
    const counts = new Array(max).fill(0)

    const subs = submissionsForCurrentForm.value
    for (const sub of subs) {
      for (const r of sub.responses ?? []) {
        if (r.blockId === block.id && typeof r.answerText === 'string') {
          const n = Number(r.answerText)
          if (Number.isFinite(n) && n >= 1 && n <= max) {
            counts[n - 1]++
          }
        }
      }
    }
    return {
      labels,
      datasets: [{ label: 'จำนวนผู้ตอบ', data: counts }],
      stacked: false,
      empty: isAllZero(counts),
    }
  }

  const choices = (block.choices ?? []).filter(isChoiceFull)
  // ถ้าไม่มี choices จริง ๆ (เช่น dropdown ยังไม่เซ็ต) ให้เด้งว่าง
  if (!choices.length) {
    return {
      labels: [],
      datasets: [{ label: 'จำนวนผู้ตอบ', data: [] }],
      stacked: false,
      empty: true,
    }
  }

  const labels = choices.map((c) => c.title || c.id)
  const counts = choices.map((c) => items.find((x) => x.choiceId === c.id && !x.rowId)?.count ?? 0)

  return {
    labels,
    datasets: [{ label: 'จำนวนผู้ตอบ', data: counts }],
    stacked: false,
    empty: isAllZero(counts),
  }
}
const gridCache = new Map<
  string,
  { labels: string[]; datasets: GridDataset[]; stacked: boolean; empty: boolean }
>()

function getGridData(block: FormBlock) {
  const id = block.id
  if (!id) return { labels: [], datasets: [], stacked: false, empty: true }

  const cached = gridCache.get(id)
  if (cached) return cached

  const built = buildGridBarChart(block)
  gridCache.set(id, built)
  return built
}

watch(analyticsForCurrentForm, () => gridCache.clear())
watch(
  formIdHex,
  async (id) => {
    if (!id) return
    await submissionStore.fetchFormBlocksAnalytics(id)
  },
  { immediate: true },
)
watch(
  () => safeBlocks.value.map((b) => b.id).filter(Boolean),
  (ids) => {
    for (const id of ids as string[]) {
      if (!viewModes.value[id]) viewModes.value[id] = 'bar'
    }
  },
  { immediate: true },
)
watch(
  () => props.program,
  (p) => {
    const items = getProp<ProgramItem[]>(p, 'programItems') ?? []
    console.log(
      '[EvaluationTable] programItems:',
      items.map((x) => x.name),
    )
  },
  { immediate: true },
)
watch(
  formIdHex,
  async (id) => {
    if (!id) return
    await Promise.all([
      submissionStore.fetchSubmissionsByForm(id, { limit: 500 }),
      submissionStore.fetchFormBlocksAnalytics(id),
    ])
  },
  { immediate: true },
)
watch(
  formIdHex,
  async (id) => {
    checkedOnce.value = false
    if (!id) return
    const exists = formStore.forms.some((f: Form) => typeof f.id === 'string' && f.id === id)
    if (!exists) {
      loadingForm.value = true
      try {
        await formStore.fetchFormById(id)
      } finally {
        loadingForm.value = false
        checkedOnce.value = true
      }
    } else {
      checkedOnce.value = true
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="container">
    <!-- Form Name Section -->
    <div class="form-header q-mb-lg" style="margin-top: 50px">
      <span class="formName">{{ formTitle }}</span>
    </div>

    <div class="answer-cards-container">
      <div
        v-for="(block, bIndex) in safeBlocks"
        :key="block.id || `block-${bIndex}`"
        class="q-mb-lg"
      >
        <q-card class="answer-card">
          <q-card-section>
            <!-- Title Card -->
            <template v-if="block.type === 'title'">
              <div class="textTitle">
                {{ block.title }}
                <span v-if="block.isRequired" class="text-red" style="margin-left: 2px">*</span>
              </div>
              <div v-if="block.description" class="text-subtitle2 text-grey-7 q-mt-sm">
                {{ block.description }}
              </div>
            </template>

            <!-- Short Answer and Paragraph -->
            <template v-else-if="['short_answer', 'paragraph'].includes(block.type)">
              <div class="textQuestion">
                {{ block.title }}
                <span v-if="block.isRequired" class="text-red" style="margin-left: 2px">*</span>
              </div>

              <div v-if="block.id && textAnswersByBlock[block.id]?.length" class="answer-container">
                <div class="answer-wrapper">
                  <div
                    v-for="(ans, idx) in textAnswersByBlock[block.id]"
                    :key="idx"
                    class="answer-item"
                  >
                    <span class="bullet">-</span>
                    <div class="answer-text">{{ ans }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="text-grey-6 text-italic">ยังไม่มีคำตอบ</div>
            </template>

            <!-- multiple_choice, checkbox, dropdown, rating -->
            <template
              v-else-if="['multiple_choice', 'checkbox', 'dropdown', 'rating'].includes(block.type)"
            >
              <div class="textQuestion">
                <div class="row items-center justify-between">
                  <div>
                    {{ block.title }}
                    <span v-if="block.isRequired" class="text-red" style="margin-left: 2px">*</span>
                  </div>

                  <q-select
                    v-model="viewModes[block.id || '']"
                    :options="[
                      { label: 'กราฟแท่ง', value: 'bar' },
                      { label: 'กราฟวงกลม', value: 'pie' },
                      { label: 'ตาราง', value: 'table' },
                    ]"
                    option-label="label"
                    option-value="value"
                    emit-value
                    map-options
                    outlined
                    dense
                    options-dense
                    label="เลือกกราฟ"
                    placeholder="เลือกรูปแบบ"
                    class="q-ml-sm"
                    style="min-width: 180px"
                    @update:model-value="(val) => block.id && changeViewMode(block.id, val)"
                  />
                </div>
              </div>

              <component :is="resolveChart(block.id)" v-bind="buildChoiceChart(block)" />

              <!-- กรณีไม่มีคำตอบ -->
              <div v-if="buildChoiceChart(block).empty" class="text-grey-6 text-italic q-mt-sm">
                ยังไม่มีคำตอบ
              </div>
            </template>

            <!-- Grid: Multiple Choice / Checkbox -->
            <template v-else-if="isGrid(block)">
              <div class="textQuestion">
                <div class="row items-center justify-between">
                  <div>
                    {{ block.title }}
                    <span v-if="block.isRequired" class="text-red" style="margin-left: 2px">*</span>
                  </div>

                  <q-select
                    v-model="viewModes[block.id || '']"
                    :options="[
                      { label: 'กราฟแท่ง', value: 'bar' },
                      { label: 'กราฟวงกลม', value: 'pie' },
                      { label: 'ตาราง', value: 'table' },
                    ]"
                    option-label="label"
                    option-value="value"
                    emit-value
                    map-options
                    outlined
                    dense
                    options-dense
                    label="เลือกกราฟ"
                    class="q-ml-sm"
                    style="min-width: 180px"
                    @update:model-value="(val) => block.id && changeViewMode(block.id, val)"
                  />
                </div>
              </div>

              <GridBarChart
                v-if="viewModes[block.id || ''] === 'bar'"
                v-bind="getGridData(block)"
              />
              <GridPieChart
                v-else-if="viewModes[block.id || ''] === 'pie'"
                v-bind="getGridData(block)"
              />
              <GridTableChart
                v-else-if="viewModes[block.id || ''] === 'table'"
                v-bind="getGridData(block)"
              />

              <div v-if="buildGridBarChart(block).empty" class="text-grey-6 text-italic q-mt-sm">
                ยังไม่มีคำตอบ
              </div>
            </template>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.form-header {
  width: 100%;
  text-align: center;
}

.formName {
  font-weight: bold;
  font-size: 25px;
  display: block;
}

.answer-cards-container {
  width: 100%;
}

.answer-container {
  width: 100%;
  margin-bottom: 16px;
}

.answer-wrapper {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  background-color: #f9f9f9;
  max-height: 200px;
  overflow-y: auto;
}

.answer-wrapper::-webkit-scrollbar {
  width: 6px;
}

.answer-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.answer-wrapper::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.answer-wrapper::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.answer-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 0;
}

.bullet {
  flex-shrink: 0;
  margin-top: 2px;
}

.answer-text {
  flex: 1;
  font-size: 16px;
}

.textQuestion {
  flex: 1;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 10px;
}

.textTitle {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
}
</style>
