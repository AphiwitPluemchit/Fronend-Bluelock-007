<script setup lang="ts">
import { computed, ref, watch, toRaw } from 'vue'
import type { Program, ProgramItem } from 'src/types/program'
import type { Block as FormBlock } from 'src/types/form'
import type { Form } from 'src/types/form'
import { useFormStore } from 'src/stores/forms'
import { useSubmissionStore } from 'src/stores/submission'
import BarChart from 'src/components/chart/BarChart.vue'
import type { BlockCountItem } from 'src/services/submission'
import type { Submission } from 'src/types/submission'
import type { Choice } from 'src/types/form'

const props = defineProps<{ program: Program | null | undefined }>()

const loadingForm = ref(false)
const checkedOnce = ref(false)
const formStore = useFormStore()
const submissionStore = useSubmissionStore()

const submissionsForCurrentForm = computed<Submission[]>(() => {
  const id = formIdHex.value
  if (!id) return []
  return submissionStore.getFormSubmissions(id)
})
type MaybeItem = string | number | { id?: string; title?: unknown; label?: unknown; name?: unknown }

type GridBlockLite = Partial<FormBlock> & {
  rows?: MaybeItem[]
  choices?: MaybeItem[]
  columns?: MaybeItem[]
}

const isObj = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object'


const toTitle = (v: unknown): string => {
  if (typeof v === 'number') return String(v)
  if (typeof v === 'string') return v.trim()
  if (isObj(v)) {
    const t = v.title
    const l = v.label
    const n = v.name
    if (typeof t === 'string') return t.trim()
    if (typeof l === 'string') return l.trim()
    if (typeof n === 'string') return n.trim()
  }
  return ''
}

const normList = (arr?: MaybeItem[]) =>
  Array.isArray(arr) ? arr.map((x) => ({ title: toTitle(x) })).filter((o) => o.title !== '') : []

const getCols = (block: GridBlockLite) =>
  normList((block.choices && block.choices.length ? block.choices : block.columns) ?? [])
const getRows = (block: GridBlockLite) => normList(block.rows)

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

const safeBlocks = computed(() => currentForm.value?.blocks ?? [])

const formIdHex = computed(() => {
  const p = toRaw(props.program)
  const raw =
    getProp<string | Record<string, unknown>>(p, 'formId') ??
    getProp<string | Record<string, unknown>>(p, 'formsId')
  return pickHex24(raw)
})


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

const formTitle = computed(() => {
  const id = formIdHex.value
  if (!id) return ''
  const f = formStore.forms.find((x: Form) => typeof x.id === 'string' && x.id === id)
  return f?.title ?? ''
})

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
  { immediate: true }
)


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
// ดึง analytics ของฟอร์มนี้ (อ่านจาก cache ของ store)
const analyticsForCurrentForm = computed<BlockCountItem[]>(() => {
  const id = formIdHex.value
  if (!id) return []
  return submissionStore.getFormAnalytics(id) // ต้องแน่ใจว่าที่อื่นมีเรียก fetchFormBlocksAnalytics แล้ว หรือจะเรียกที่นี่ก็ได้
})

// helper: ตรวจว่าข้อมูลเป็นศูนย์หมดไหม
function isAllZero(arr: number[]) {
  return arr.length === 0 || arr.every((v) => v === 0)
}
function isChoiceFull(c: unknown): c is Choice & { id: string } {
  if (!c || typeof c !== 'object') return false
  const r = c as Partial<Choice>
  return (
    typeof r.id === 'string' &&
    typeof r.title === 'string' &&
    typeof r.sequence === 'number'
  )
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
watch(
  formIdHex,
  async (id) => {
    if (!id) return
    await submissionStore.fetchFormBlocksAnalytics(id)
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
            <!-- success -->
            <template v-if="block.type === 'title'">
              <div class="textTitle">
                {{ block.title }}
                <span v-if="block.isRequired" class="text-red" style="margin-left: 2px">*</span>
              </div>
              <div v-if="block.description" class="text-subtitle2 text-grey-7 q-mt-sm">
                {{ block.description }}
              </div>
            </template>

            <!-- Short Answer -->
            <!-- success -->
            <template v-else-if="block.type === 'short_answer'">
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

            <!-- Paragraph -->
            <!-- success -->
            <template v-else-if="block.type === 'paragraph'">
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
                {{ block.title }}
                <span v-if="block.isRequired" class="text-red" style="margin-left: 2px">*</span>
              </div>

              <!-- กราฟ -->
              <BarChart v-bind="buildChoiceChart(block)" />

              <!-- กรณีไม่มีคำตอบ -->
              <div v-if="buildChoiceChart(block).empty" class="text-grey-6 text-italic q-mt-sm">
                ยังไม่มีคำตอบ
              </div>
            </template>

            <!-- Grid: Multiple Choice -->
            <template v-else-if="block.type === 'grid_multiple_choice'">
              <div class="text-subtitle1 q-mb-sm">
                {{ block.title }}
                <span v-if="block.isRequired" class="text-red" style="margin-left: 2px">*</span>
              </div>
              <q-markup-table flat bordered dense class="grid-table">
                <thead>
                  <tr>
                    <th class="row-header"></th>
                    <th v-for="(col, i) in getCols(block)" :key="i" class="col-choice">
                      {{ col.title }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, r) in getRows(block)" :key="r">
                    <td class="row-header">{{ row.title }}</td>
                    <td v-for="(col, c) in getCols(block)" :key="c" class="col-choice">
                      <q-radio :val="col.title" :model-value="undefined" disable />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </template>

            <!-- Grid: Checkbox -->
            <template v-else-if="block.type === 'grid_checkbox'">
              <div class="text-subtitle1 q-mb-sm">
                {{ block.title }}
                <span v-if="block.isRequired" class="text-red" style="margin-left: 2px">*</span>
              </div>
              <q-markup-table flat bordered dense class="grid-table">
                <thead>
                  <tr>
                    <th class="row-header"></th>
                    <th v-for="(col, i) in getCols(block)" :key="i" class="col-choice">
                      {{ col.title }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, r) in getRows(block)" :key="r">
                    <td class="row-header">{{ row.title }}</td>
                    <td v-for="(col, c) in getCols(block)" :key="c" class="col-choice">
                      <q-checkbox :val="col.title" :model-value="undefined" disable />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
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
