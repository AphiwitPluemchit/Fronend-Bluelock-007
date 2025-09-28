<script setup lang="ts">
import { computed, watch, ref, watchEffect } from 'vue'
import { useFormStore } from 'src/stores/forms'
import { useSubmissionStore } from 'src/stores/submission'
import type { BlockCountItem } from 'src/services/submission'
import BarChart from 'src/components/chart/BarChart.vue'
import type { Form } from 'src/types/form'

type Choice = { id?: string; title?: string }
type Row = { id?: string; title?: string }
type Block = {
  id?: string
  type?: string
  title?: string
  description?: string
  choices?: Choice[]
  rows?: Row[]
}
interface ProgramRow {
  _id: string
  name: string
  formId?: string | null
}

const props = defineProps<{ rows: ProgramRow[] }>()
const formStore = useFormStore()
const submissionStore = useSubmissionStore()

const loadingForms = ref(false)
const loadingAnalytics = ref(false)

function hasStringId(f: Form): f is Form & { id: string } {
  return typeof f.id === 'string' && f.id.length > 0
}
function isHex24(s: string) {
  return /^[0-9a-fA-F]{24}$/.test(s)
}

const neededFormIds = computed(() =>
  Array.from(
    new Set(
      (props.rows ?? [])
        .map((r) => (r.formId ?? '').trim())
        .filter((s): s is string => s.length > 0 && isHex24(s)), // ✅ กรอง 24-hex
    ),
  ),
)
watchEffect(() => {
  // rows ดิบ
  console.log('[rows]', JSON.parse(JSON.stringify(props.rows)))

  // map row -> formId
  console.log(
    '[rows→formIds]',
    (props.rows ?? []).map((r) => ({ row: r._id, formId: (r.formId ?? '').trim() })),
  )

  // ids ที่จะใช้จริง (unique + 24-hex)
  console.log('[neededFormIds (unique)]', neededFormIds.value)

  // แจ้งเตือนถ้าทุกกิจกรรมชี้ฟอร์มเดียวกัน
  if (neededFormIds.value.length === 1 && (props.rows?.length ?? 0) > 1) {
    console.warn('[Evaluation] All rows point to the same formId:', neededFormIds.value[0])
  }
})
const relatedForms = computed(() =>
  formStore.forms.filter((f) => hasStringId(f) && neededFormIds.value.includes(f.id)),
)

async function preloadFormsByIds(ids: string[]) {
  if (!ids.length) return
  const existing = new Set(formStore.forms.filter(hasStringId).map((f) => f.id))
  const missing = ids.filter((id) => !existing.has(id))
  if (!missing.length) return
  loadingForms.value = true
  try {
    await Promise.all(missing.map((id) => formStore.fetchFormById(id)))
  } finally {
    loadingForms.value = false
  }
}

async function preloadFormAnalytics(formIds: string[]) {
  if (!formIds.length) return
  loadingAnalytics.value = true
  try {
    await Promise.all(formIds.map((fid) => submissionStore.fetchFormBlocksAnalytics(fid)))
    formIds.forEach((fid) => {
      const items = submissionStore.getFormAnalytics(fid)
      console.log('[Evaluation] analytics data for', fid, JSON.parse(JSON.stringify(items))) // ✅ ดูค่าจริง
      console.log('[len]', items.length)
    })
  } finally {
    loadingAnalytics.value = false
  }
}

/* ----- chart helpers ----- */
type ChartPayload = {
  labels: string[]
  datasets: { label: string; data: number[] }[]
  empty: boolean
  stacked: boolean
}

function buildSingleChoiceChart(block: Block, items: BlockCountItem[]): ChartPayload {
  // ใช้ choices จากฟอร์มก่อน
  let choices = (block.choices ?? []).filter((c) => c?.id) as Required<Choice>[]
  // ถ้า choices ยังว่าง แต่มี analytics → สร้างชั่วคราวจาก analytics
  if (!choices.length && items.length) {
    const choiceIds = Array.from(new Set(items.map((x) => x.choiceId).filter(Boolean) as string[]))
    choices = choiceIds.map((id) => ({ id, title: id }))
  }

  const labels = choices.map((c) => c.title || c.id)
  const data = choices.map((c) => items.find((x) => x.choiceId === c.id && !x.rowId)?.count ?? 0)

  return {
    labels,
    datasets: [{ label: 'จำนวนผู้ตอบ', data }],
    empty: data.every((v) => v === 0),
    stacked: false,
  }
}

function buildGridChart(block: Block, items: BlockCountItem[]): ChartPayload {
  // rows/choices จากฟอร์มก่อน
  let rows = (block.rows ?? []).filter((r) => r?.id) as Required<Row>[]
  let choices = (block.choices ?? []).filter((c) => c?.id) as Required<Choice>[]

  // fallback ถ้า rows/choices ยังว่าง แต่ analytics มาแล้ว
  if (!rows.length && items.length) {
    const rowIds = Array.from(new Set(items.map((x) => x.rowId).filter(Boolean) as string[]))
    rows = rowIds.map((id) => ({ id, title: id }))
  }
  if (!choices.length && items.length) {
    const choiceIds = Array.from(new Set(items.map((x) => x.choiceId).filter(Boolean) as string[]))
    choices = choiceIds.map((id) => ({ id, title: id }))
  }

  const labels = rows.map((r) => r.title || r.id)
  const datasets = choices.map((c) => ({
    label: c.title || c.id,
    data: rows.map((r) => items.find((x) => x.rowId === r.id && x.choiceId === c.id)?.count ?? 0),
  }))
  const empty = datasets.every((ds) => ds.data.every((v) => v === 0))
  return { labels, datasets, empty, stacked: true }
}

function chartFor(formId: string, block: Block): ChartPayload {
  const analytics = submissionStore.getFormAnalytics(formId)
  const items = analytics.filter((a) => a.blockId === block.id)
  return !block?.rows?.length ? buildSingleChoiceChart(block, items) : buildGridChart(block, items)
}
// helper ดึง blocks จาก Form แบบไม่ใช้ any
function getBlocksFromForm(f: Form): Block[] {
  const maybe = (f as unknown as { blocks?: unknown }).blocks
  return Array.isArray(maybe) ? (maybe as Block[]) : []
}
const rowFormIds = computed(() =>
  (props.rows ?? []).map(r => ({
    rowId: r._id,
    name: r.name,
    formId: (r.formId ?? '').trim(),
    valid: isHex24((r.formId ?? '').trim()),
  }))
)
async function preloadPerRow() {
  const valid = rowFormIds.value.filter(x => x.valid)

  // โหลดฟอร์มเฉพาะที่ยังไม่มีใน store
  const existing = new Set(formStore.forms.map(f => f.id).filter(Boolean) as string[])
  const missingFormIds = valid.map(x => x.formId)
    .filter(id => !existing.has(id))

  if (missingFormIds.length) {
    loadingForms.value = true
    try {
      await Promise.all(missingFormIds.map(id => formStore.fetchFormById(id)))
    } finally {
      loadingForms.value = false
    }
  }

  // โหลด analytics ต่อ formId ที่ valid
  if (valid.length) {
    loadingAnalytics.value = true
    try {
      await Promise.all(
        Array.from(new Set(valid.map(x => x.formId)))
          .map(fid => submissionStore.fetchFormBlocksAnalytics(fid))
      )
    } finally {
      loadingAnalytics.value = false
    }
  }
}

function makeStubFromAnalytics(formId: string): Form {
  const items = submissionStore.getFormAnalytics(formId)
  const blockIds = Array.from(new Set(items.map(a => a.blockId).filter(Boolean)))
  const blocks = blockIds.map((bid, i) => ({
    id: bid, title: `Block ${i + 1}`, session: 0, type: 'multiple_choice',
    description: '', isRequired: false, sequence: i, choices: [], rows: []
  }))
  return {
    id: formId,
    title: '(ฟอร์มไม่พบในระบบ)',
    description: '',
    isOrigin: false,
    blocks
  }
}

function getFormForId(formId: string | null | undefined): Form | null {
  if (!formId || !isHex24(formId)) return null
  const f = formStore.forms.find(x => x.id === formId)
  if (f) return f
  const items = submissionStore.getFormAnalytics(formId)
  return items.length ? makeStubFromAnalytics(formId) : null
}
watch(() => props.rows, async () => { await preloadPerRow() }, { immediate: true })

watch(
  neededFormIds,
  async () => {
    const ids = neededFormIds.value
    await preloadFormsByIds(ids)
    await preloadFormAnalytics(ids)

    // DEBUG: list block ids from form vs analytics (no any)
    for (const f of relatedForms.value) {
      // ป้องกันกรณี id ไม่ใช่ string (ถึงแม้ relatedForms คัดมาแล้ว)
      if (!hasStringId(f)) continue

      const blocks = getBlocksFromForm(f)
        .map((b) => b.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0)

      const analyticsIds = submissionStore.getFormAnalytics(f.id).map((a) => a.blockId)

      console.log('[DEBUG] form blocks:', blocks)
      console.log('[DEBUG] analytics blockIds:', Array.from(new Set<string>(analyticsIds)))
    }
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="loadingForms || loadingAnalytics" class="q-my-md text-grey">กำลังโหลดข้อมูล…</div>
  <div v-else>
    <div v-if="relatedForms.length === 0" class="q-my-md text-grey">
      ไม่พบแบบฟอร์มที่เชื่อมกับกิจกรรม
    </div>

    <div class="q-pa-md">
      <div v-for="(r, rIndex) in rowFormIds" :key="r.rowId || rIndex" class="q-mb-xl">
        <h3 class="evaluation-title">ผลการประเมิน ({{ r.name }})</h3>

        <div v-if="!r.valid" class="text-grey-7">กิจกรรมนี้ยังไม่มีฟอร์มที่ผูกไว้</div>

        <template v-else>
          <div v-if="!getFormForId(r.formId)" class="text-grey-7">
            ไม่พบฟอร์มหรือยังไม่มีข้อมูลการประเมิน (formId: {{ r.formId }})
          </div>

          <template v-else>
            <div
              v-for="(block, bIndex) in getFormForId(r.formId)?.blocks || []"
              :key="block.id || `block-${bIndex}`"
              class="q-mb-lg"
            >
              <q-card class="answer-card">
                <q-card-section class="q-pb-sm">
                  <div class="text-h6">{{ block.title || '—' }}</div>
                  <div v-if="block.description" class="text-caption text-grey-7 q-mt-xs">
                    {{ block.description }}
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-section>
                  <template v-if="block.id">
                    <BarChart
                      :key="`${r.formId}-${block.id}`"
                      v-bind="chartFor(r.formId as string, block)"
                    />
                    <div
                      v-if="chartFor(r.formId as string, block).empty"
                      class="text-grey-7 q-mt-sm"
                    >
                      ยังไม่มีคำตอบสำหรับบล็อกนี้
                    </div>
                  </template>
                  <div v-else class="text-grey-7">
                    บล็อกนี้ไม่มีรหัส (id) จึงไม่สามารถแสดงกราฟได้
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.evaluation-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}
.answer-card {
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}
.title-block {
  height: 50px;
  min-height: 50px;
  display: flex;
  align-items: center;
}
.title-block .q-card__section {
  padding-top: 8px;
  padding-bottom: 8px;
  width: 100%;
}
</style>
