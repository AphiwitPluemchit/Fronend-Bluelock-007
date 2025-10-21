<template>
  <div class="grid-table">
    <q-markup-table flat bordered dense class="table-card">
      <thead>
        <tr>
          <th class="left sticky">หัวข้อ</th>
          <th class="center sticky" colspan="5">ระดับความคิดเห็น</th>
          <th class="center sticky">%</th>
          <th class="center sticky">x̄</th>
          <th class="center sticky">SD</th>
          <th class="center sticky">อันดับ</th>
          <th class="center sticky">แปลความ</th>
        </tr>
        <tr>
          <th class="left substicky"></th>
          <th class="center substicky">มากที่สุด</th>
          <th class="center substicky">มาก</th>
          <th class="center substicky">ปานกลาง</th>
          <th class="center substicky">น้อย</th>
          <th class="center substicky">น้อยที่สุด</th>
          <th class="center substicky"></th>
          <th class="center substicky"></th>
          <th class="center substicky"></th>
          <th class="center substicky"></th>
          <th class="center substicky"></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(rowLabel, i) in labels" :key="`row-${i}`">
          <td class="left">{{ rowLabel }}</td>

          <!-- นับจำนวนและร้อยละรายระดับ -->
          <td class="center">
            {{ getCount(i, 4) }}
            <div class="muted">({{ getPctStr(i, 4) }})</div>
          </td>
          <td class="center">
            {{ getCount(i, 3) }}
            <div class="muted">({{ getPctStr(i, 3) }})</div>
          </td>
          <td class="center">
            {{ getCount(i, 2) }}
            <div class="muted">({{ getPctStr(i, 2) }})</div>
          </td>
          <td class="center">
            {{ getCount(i, 1) }}
            <div class="muted">({{ getPctStr(i, 1) }})</div>
          </td>
          <td class="center">
            {{ getCount(i, 0) }}
            <div class="muted">({{ getPctStr(i, 0) }})</div>
          </td>

          <!-- % รวม (จากคะแนนถ่วงน้ำหนักเทียบเต็ม 5) -->
          <td class="center strong">{{ pct2(getPercent(i)) }}</td>
          <td class="center strong">{{ getMean(i).toFixed(2) }}</td>
          <td class="center">{{ getSd(i).toFixed(2) }}</td>
          <td class="center">{{ getRankVal(i) }}</td>
          <td class="center">{{ getInterpret(i) }}</td>
        </tr>
      </tbody>

      <tfoot v-if="labels.length">
        <tr class="summary-row">
          <td class="left strong">รวม</td>
          <td class="center strong" colspan="5">n = {{ totals.reduce((a, b) => a + b, 0) }}</td>
          <td class="center strong">
            {{ pct2(percentScore.reduce((a, b) => a + b, 0) / labels.length) }}
          </td>
          <td class="center strong">
            {{ (mean.reduce((a, b) => a + b, 0) / labels.length).toFixed(2) }}
          </td>
          <td class="center strong">
            {{ (sd.reduce((a, b) => a + b, 0) / labels.length).toFixed(2) }}
          </td>
          <td class="center strong"></td>
          <td class="center strong"></td>
        </tr>
      </tfoot>
    </q-markup-table>

    <div v-if="labels.length === 0 || datasets.length === 0" class="hint">ยังไม่มีข้อมูล</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type DS = { label: string; data: number[] }

function get2D(arr: number[][], i: number, j: number, fb = 0): number {
  const row = arr[i]
  const v = row?.[j]
  return Number.isFinite(v) ? (v as number) : fb
}

// สำหรับ template
function getCount(i: number, level: number) {
  return get2D(countsByRow.value, i, level, 0)
}
function getPctStr(i: number, level: number) {
  return pct2(get2D(pctsByRow.value, i, level, 0))
}

function get1D(arr: number[], i: number, fb = 0): number {
  const v = arr?.[i]
  return Number.isFinite(v) ? (v as number) : fb
}

// 1D safe getter (string)
function get1DStr(arr: string[], i: number, fb = ''): string {
  const v = arr?.[i]
  return typeof v === 'string' ? v : fb
}

function getPercent(i: number) {
  return get1D(percentScore.value, i, 0)
}
function getMean(i: number) {
  return get1D(mean.value, i, 0)
}
function getSd(i: number) {
  return get1D(sd.value, i, 0)
}
function getRankVal(i: number) {
  return get1D(rank.value, i, 0)
}
function getInterpret(i: number) {
  return get1DStr(interpret.value, i, '')
}
const props = defineProps<{
  labels: string[]
  datasets: DS[]
}>()

/** ดึงค่าน้ำหนัก 1..5 ตามลำดับ datasets (พยายามอ่านจาก label; ถ้าอ่านไม่ได้จะใช้ลำดับ index+1) */
const weights = computed<number[]>(() => {
  return props.datasets.map((ds, idx) => {
    const m = String(ds.label).match(/(\d+)/)?.[1]
    const w = Number(m)
    return Number.isFinite(w) && w >= 1 && w <= 5 ? w : idx + 1
  })
})

/** จำนวนทั้งหมดต่อแถว (n) */
const totals = computed<number[]>(() =>
  props.labels.map((_, i) =>
    props.datasets.reduce(
      (s, ds) => s + (Number.isFinite(ds.data?.[i]) ? Number(ds.data[i]) : 0),
      0,
    ),
  ),
)

type FiveIndex = 0 | 1 | 2 | 3 | 4
const clampIdx = (n: number): FiveIndex => (n < 0 ? 0 : n > 4 ? 4 : n) as FiveIndex

const countsByRow = computed<number[][]>(() =>
  props.labels.map((_, i): number[] => {
    const out: [number, number, number, number, number] = [0, 0, 0, 0, 0]

    props.datasets.forEach((ds, k) => {
      const w = getWeight(k) ?? 0
      const idx = clampIdx(w - 1) // FiveIndex
      const raw = ds.data?.[i]
      const v = Number.isFinite(raw) ? Number(raw) : 0
      out[idx] = out[idx] + v // ตอนนี้เป็น number ชัวร์
    })

    return [out[4], out[3], out[2], out[1], out[0]]
  }),
)

/** ร้อยละรายระดับต่อแถว (ฐาน = n ของแถวนั้น) */
const pctsByRow = computed<number[][]>(() =>
  countsByRow.value.map((arr, i) => {
    const n = totals.value[i] || 0
    return arr.map((v) => (n > 0 ? (v / n) * 100 : 0))
  }),
)
const getWeight = (k: number): number => {
  const w = weights.value[k]
  const ww = Number.isFinite(w as number) ? (w as number) : k + 1
  // ป้องกันเลยขอบ
  return Math.min(5, Math.max(1, ww))
}

/** ค่าเฉลี่ยถ่วงน้ำหนักต่อแถว */
const mean = computed<number[]>(() =>
  props.labels.map((_, i) => {
    const n = totals.value[i] ?? 0
    if (!n) return 0

    let sum = 0
    props.datasets.forEach((ds, k) => {
      const w = getWeight(k) // ✅ ไม่เป็น undefined แล้ว
      const v = Number(ds.data?.[i] ?? 0)
      sum += (Number.isFinite(v) ? v : 0) * w
    })
    return sum / n
  }),
)

/** ส่วนเบี่ยงเบนมาตรฐาน (ของคะแนนแบบถ่วงน้ำหนัก) */
const sd = computed<number[]>(() =>
  props.labels.map((_, i) => {
    const n = totals.value[i] ?? 0
    if (n <= 1) return 0

    const m = mean.value[i] ?? 0 // ⬅️ กัน undefined
    let sum = 0
    props.datasets.forEach((ds, k) => {
      const w = weights.value[k] ?? k + 1 // ⬅️ กัน undefined
      const v = Number(ds.data?.[i] ?? 0)
      sum += (Number.isFinite(v) ? v : 0) * Math.pow(w - m, 2)
    })
    const variance = sum / (n - 1)
    return Math.sqrt(Math.max(0, variance))
  }),
)

/** เปอร์เซ็นต์คะแนนเทียบเต็ม 5 (นิยมใช้สรุปแถว) */
const percentScore = computed<number[]>(() =>
  props.labels.map((_, i) => {
    const n = totals.value[i] ?? 0
    if (!n) return 0
    const m = mean.value[i] ?? 0
    return (m / 5) * 100
  }),
)

/** อันดับ (มาก → น้อย) ใช้ตาม percentScore หรือ mean ก็ได้ */
const rank = computed<number[]>(() => {
  const vals = percentScore.value
  const uniq = Array.from(new Set(vals)).sort((a, b) => b - a)
  return vals.map((v) => uniq.indexOf(v) + 1)
})

/** แปลความตามช่วงค่าเฉลี่ย 5 ระดับ */
function interpretFromMean(m: number): string {
  if (m >= 4.21) return 'มากที่สุด'
  if (m >= 3.41) return 'มาก'
  if (m >= 2.61) return 'ปานกลาง'
  if (m >= 1.81) return 'น้อย'
  return 'น้อยที่สุด'
}
const interpret = computed<string[]>(() => mean.value.map(interpretFromMean))

/** util แสดงร้อยละ 2 ตำแหน่ง */
function pct2(n: number): string {
  const v = Number.isFinite(n) ? n : 0
  return v.toFixed(2) + '%'
}
</script>

<style scoped>
.grid-table {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
}

.table-card {
  width: 100%;
  min-width: 800px; /* Minimum width to ensure all columns are visible */
  table-layout: fixed;
  border-collapse: collapse;
}

/* Optional: Add horizontal scroll for small screens */
@media (max-width: 1024px) {
  .table-card {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}

.left {
  text-align: left;
}
.center {
  text-align: center;
  vertical-align: middle;
}

.sticky {
  background: #1a237e;
  color: #fff;
  font-weight: 600;
}
.substicky {
  background: #e9edf9;
  color: #1a237e;
  font-weight: 600;
}
.summary-row {
  background: #1a237e;
  color: #fff;
  border-top: 2px solid #ccc;
}
.strong {
  font-weight: 700;
}

.muted {
  color: #666;
  font-size: 12px;
}
</style>

<template>
  <div class="grid-table">
    <q-markup-table flat bordered dense class="table-card">
      <thead>
        <tr>
          <th class="left sticky">หัวข้อ</th>
          <th class="center sticky" colspan="5">ระดับความคิดเห็น</th>
          <th class="center sticky">%</th>
          <th class="center sticky">x̄</th>
          <th class="center sticky">SD</th>
          <th class="center sticky">อันดับ</th>
          <th class="center sticky">แปลความ</th>
        </tr>
        <tr>
          <th class="left substicky"></th>
          <th class="center substicky">มากที่สุด</th>
          <th class="center substicky">มาก</th>
          <th class="center substicky">ปานกลาง</th>
          <th class="center substicky">น้อย</th>
          <th class="center substicky">น้อยที่สุด</th>
          <th class="center substicky"></th>
          <th class="center substicky"></th>
          <th class="center substicky"></th>
          <th class="center substicky"></th>
          <th class="center substicky"></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(rowLabel, i) in labels" :key="`row-${i}`">
          <td class="left">{{ rowLabel }}</td>

          <!-- นับจำนวนและร้อยละรายระดับ -->
          <td class="center">
            {{ getCount(i, 4) }}
            <div class="muted">({{ getPctStr(i, 4) }})</div>
          </td>
          <td class="center">
            {{ getCount(i, 3) }}
            <div class="muted">({{ getPctStr(i, 3) }})</div>
          </td>
          <td class="center">
            {{ getCount(i, 2) }}
            <div class="muted">({{ getPctStr(i, 2) }})</div>
          </td>
          <td class="center">
            {{ getCount(i, 1) }}
            <div class="muted">({{ getPctStr(i, 1) }})</div>
          </td>
          <td class="center">
            {{ getCount(i, 0) }}
            <div class="muted">({{ getPctStr(i, 0) }})</div>
          </td>

          <!-- % รวม (จากคะแนนถ่วงน้ำหนักเทียบเต็ม 5) -->
          <td class="center strong">{{ pct2(getPercent(i)) }}</td>
          <td class="center strong">{{ getMean(i).toFixed(2) }}</td>
          <td class="center">{{ getSd(i).toFixed(2) }}</td>
          <td class="center">{{ getRankVal(i) }}</td>
          <td class="center">{{ getInterpret(i) }}</td>
        </tr>
      </tbody>

      <tfoot v-if="labels.length">
        <tr class="summary-row">
          <td class="left strong">รวม</td>
          <td class="center strong" colspan="5">n = {{ totals.reduce((a, b) => a + b, 0) }}</td>
          <td class="center strong">
            {{ pct2(percentScore.reduce((a, b) => a + b, 0) / labels.length) }}
          </td>
          <td class="center strong">
            {{ (mean.reduce((a, b) => a + b, 0) / labels.length).toFixed(2) }}
          </td>
          <td class="center strong">
            {{ (sd.reduce((a, b) => a + b, 0) / labels.length).toFixed(2) }}
          </td>
          <td class="center strong"></td>
          <td class="center strong"></td>
        </tr>
      </tfoot>
    </q-markup-table>

    <div v-if="labels.length === 0 || datasets.length === 0" class="hint">ยังไม่มีข้อมูล</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type DS = { label: string; data: number[] }

function get2D(arr: number[][], i: number, j: number, fb = 0): number {
  const row = arr[i]
  const v = row?.[j]
  return Number.isFinite(v) ? (v as number) : fb
}

// สำหรับ template
function getCount(i: number, level: number) {
  return get2D(countsByRow.value, i, level, 0)
}
function getPctStr(i: number, level: number) {
  return pct2(get2D(pctsByRow.value, i, level, 0))
}

function get1D(arr: number[], i: number, fb = 0): number {
  const v = arr?.[i]
  return Number.isFinite(v) ? (v as number) : fb
}

// 1D safe getter (string)
function get1DStr(arr: string[], i: number, fb = ''): string {
  const v = arr?.[i]
  return typeof v === 'string' ? v : fb
}

function getPercent(i: number) {
  return get1D(percentScore.value, i, 0)
}
function getMean(i: number) {
  return get1D(mean.value, i, 0)
}
function getSd(i: number) {
  return get1D(sd.value, i, 0)
}
function getRankVal(i: number) {
  return get1D(rank.value, i, 0)
}
function getInterpret(i: number) {
  return get1DStr(interpret.value, i, '')
}
const props = defineProps<{
  labels: string[]
  datasets: DS[]
}>()

/** ดึงค่าน้ำหนัก 1..5 ตามลำดับ datasets (พยายามอ่านจาก label; ถ้าอ่านไม่ได้จะใช้ลำดับ index+1) */
const weights = computed<number[]>(() => {
  return props.datasets.map((ds, idx) => {
    const m = String(ds.label).match(/(\d+)/)?.[1]
    const w = Number(m)
    return Number.isFinite(w) && w >= 1 && w <= 5 ? w : idx + 1
  })
})

/** จำนวนทั้งหมดต่อแถว (n) */
const totals = computed<number[]>(() =>
  props.labels.map((_, i) =>
    props.datasets.reduce(
      (s, ds) => s + (Number.isFinite(ds.data?.[i]) ? Number(ds.data[i]) : 0),
      0,
    ),
  ),
)

type FiveIndex = 0 | 1 | 2 | 3 | 4
const clampIdx = (n: number): FiveIndex => (n < 0 ? 0 : n > 4 ? 4 : n) as FiveIndex

const countsByRow = computed<number[][]>(() =>
  props.labels.map((_, i): number[] => {
    const out: [number, number, number, number, number] = [0, 0, 0, 0, 0]

    props.datasets.forEach((ds, k) => {
      const w = getWeight(k) ?? 0
      const idx = clampIdx(w - 1) // FiveIndex
      const raw = ds.data?.[i]
      const v = Number.isFinite(raw) ? Number(raw) : 0
      out[idx] = out[idx] + v // ตอนนี้เป็น number ชัวร์
    })

    return [out[4], out[3], out[2], out[1], out[0]]
  }),
)

/** ร้อยละรายระดับต่อแถว (ฐาน = n ของแถวนั้น) */
const pctsByRow = computed<number[][]>(() =>
  countsByRow.value.map((arr, i) => {
    const n = totals.value[i] || 0
    return arr.map((v) => (n > 0 ? (v / n) * 100 : 0))
  }),
)
const getWeight = (k: number): number => {
  const w = weights.value[k]
  const ww = Number.isFinite(w as number) ? (w as number) : k + 1
  // ป้องกันเลยขอบ
  return Math.min(5, Math.max(1, ww))
}

/** ค่าเฉลี่ยถ่วงน้ำหนักต่อแถว */
const mean = computed<number[]>(() =>
  props.labels.map((_, i) => {
    const n = totals.value[i] ?? 0
    if (!n) return 0

    let sum = 0
    props.datasets.forEach((ds, k) => {
      const w = getWeight(k) // ✅ ไม่เป็น undefined แล้ว
      const v = Number(ds.data?.[i] ?? 0)
      sum += (Number.isFinite(v) ? v : 0) * w
    })
    return sum / n
  }),
)

/** ส่วนเบี่ยงเบนมาตรฐาน (ของคะแนนแบบถ่วงน้ำหนัก) */
const sd = computed<number[]>(() =>
  props.labels.map((_, i) => {
    const n = totals.value[i] ?? 0
    if (n <= 1) return 0

    const m = mean.value[i] ?? 0 // ⬅️ กัน undefined
    let sum = 0
    props.datasets.forEach((ds, k) => {
      const w = weights.value[k] ?? k + 1 // ⬅️ กัน undefined
      const v = Number(ds.data?.[i] ?? 0)
      sum += (Number.isFinite(v) ? v : 0) * Math.pow(w - m, 2)
    })
    const variance = sum / (n - 1)
    return Math.sqrt(Math.max(0, variance))
  }),
)

/** เปอร์เซ็นต์คะแนนเทียบเต็ม 5 (นิยมใช้สรุปแถว) */
const percentScore = computed<number[]>(() =>
  props.labels.map((_, i) => {
    const n = totals.value[i] ?? 0
    if (!n) return 0
    const m = mean.value[i] ?? 0
    return (m / 5) * 100
  }),
)

/** อันดับ (มาก → น้อย) ใช้ตาม percentScore หรือ mean ก็ได้ */
const rank = computed<number[]>(() => {
  const vals = percentScore.value
  const uniq = Array.from(new Set(vals)).sort((a, b) => b - a)
  return vals.map((v) => uniq.indexOf(v) + 1)
})

/** แปลความตามช่วงค่าเฉลี่ย 5 ระดับ */
function interpretFromMean(m: number): string {
  if (m >= 4.21) return 'มากที่สุด'
  if (m >= 3.41) return 'มาก'
  if (m >= 2.61) return 'ปานกลาง'
  if (m >= 1.81) return 'น้อย'
  return 'น้อยที่สุด'
}
const interpret = computed<string[]>(() => mean.value.map(interpretFromMean))

/** util แสดงร้อยละ 2 ตำแหน่ง */
function pct2(n: number): string {
  const v = Number.isFinite(n) ? n : 0
  return v.toFixed(2) + '%'
}
</script>

<style scoped>
.grid-table {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
}

.table-card {
  width: 100%;
  min-width: 800px; /* Minimum width to ensure all columns are visible */
  table-layout: fixed;
  border-collapse: collapse;
}

/* Optional: Add horizontal scroll for small screens */
@media (max-width: 1024px) {
  .table-card {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}

.left {
  text-align: left;
}
.center {
  text-align: center;
  vertical-align: middle;
}

.sticky {
  background: #1a237e;
  color: #fff;
  font-weight: 600;
}
.substicky {
  background: #e9edf9;
  color: #1a237e;
  font-weight: 600;
}
.summary-row {
  background: #1a237e;
  color: #fff;
  border-top: 2px solid #ccc;
}
.strong {
  font-weight: 700;
}

.muted {
  color: #666;
  font-size: 12px;
}
</style>
