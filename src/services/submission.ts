import type { Submission } from 'src/types/submission'
import { api } from 'boot/axios'

// ---------- Create / Read ----------
export async function createSubmission(sub: Submission) {
  const { data } = await api.post<Submission>('/submissions', sub)
  return data
}

export async function getSubmission(id: string) {
  const { data } = await api.get<Submission>(`/submissions/${id}`)
  return data
}

// submissions (ทั้งหมดหรือล่าสุดด้วย opts)
export async function getSubmissionsByForm(
  formId: string,
  opts?: { limit?: number; sort?: string }
) {
  const { data } = await api.get<Submission[]>(
    `/forms/${formId}/submissions`,
    { params: opts }
  )
  return data
}

// ---------- Analytics ----------
export type BlockCountItem = {
  blockId: string
  choiceId?: string
  rowId?: string
  count: number
}

// ทั้งฟอร์ม
export async function getFormBlocksAnalytics(formId: string) {
  const { data } = await api.get<BlockCountItem[]>(
    `/analytics/forms/${formId}/blocks`
  )
  return data
}

// บล็อกเดียว
export async function getBlockAnalytics(formId: string, blockId: string) {
  const { data } = await api.get<BlockCountItem[]>(
    `/analytics/forms/${formId}/blocks/${blockId}`
  )
  return data
}

// ---------- Local helpers ----------
export function buildChoiceCountIndex(submissions: Submission[]) {
  const idx: Record<string, Record<string, number>> = {}
  for (const sub of submissions) {
    for (const r of sub.responses ?? []) {
      if (!r.blockId || !r.choiceId) continue
      const bId = r.blockId
      const cId = r.choiceId
      idx[bId] ??= {}
      idx[bId][cId] = (idx[bId][cId] ?? 0) + 1
    }
  }
  return idx
}

type ChoiceLike = { id?: string; title?: string } | string | number
export function getChoiceId(c: ChoiceLike): string | undefined {
  return typeof c === 'object' && c !== null && 'id' in c && typeof c.id === 'string' && c.id
    ? c.id
    : undefined
}

// เหมาะกับ single-choice เท่านั้น
export function toBarChartData(
  analytics: { choiceId?: string; count: number }[],
  choices: { id: string; title: string }[]
) {
  const labels = choices.map((c) => c.title)
  const counts = choices.map((c) => analytics.find((a) => a.choiceId === c.id)?.count ?? 0)
  return {
    labels,
    datasets: [
      { label: 'จำนวนผู้ตอบ', data: counts },
    ],
  }
}
export function toStackedBarDataForGrid(
  analytics: BlockCountItem[],
  rows: { id: string; title: string }[],
  choices: { id: string; title: string }[]
) {
  const labels = rows.map(r => r.title)
  const datasets = choices.map(c => ({
    label: c.title,
    data: rows.map(r => {
      const item = analytics.find(a => a.rowId === r.id && a.choiceId === c.id)
      return item?.count ?? 0
    })
  }))
  return { labels, datasets, stacked: true }
}
