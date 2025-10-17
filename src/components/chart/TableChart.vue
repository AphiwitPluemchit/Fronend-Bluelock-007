<template>
  <q-markup-table flat bordered dense class="table-chart">
    <thead>
      <tr>
        <th class="left sticky">ข้อมูลทั่วไป</th>
        <th class="center sticky">
          จำนวนผู้ตอบแบบประเมิน<br />(n={{ grandTotal }})
        </th>
        <th class="center sticky">ร้อยละ (%)</th>
        <th class="center sticky">อันดับ</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(row, i) in rows" :key="`row-${i}`">
        <td class="left">{{ row.label }}</td>
        <td class="center">{{ row.count }}</td>
        <td class="center">{{ formatPct2(row.percent) }}</td>
        <td class="center">{{ row.rank }}</td>
      </tr>
    </tbody>

    <!-- ✅ แถวสรุปรวมทั้งหมด -->
    <tfoot v-if="grandTotal > 0">
      <tr class="summary-row">
        <td class="left strong">รวมทั้งหมด</td>
        <td class="center strong">{{ grandTotal }}</td>
        <td class="center strong">100.00%</td>
        <td class="center strong"></td>
      </tr>
    </tfoot>
  </q-markup-table>

  <div v-if="grandTotal === 0" class="hint">ยังไม่มีคำตอบ</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Dataset = { label: string; data: number[] }

const props = defineProps<{
  labels: string[]
  datasets: Dataset[]
}>()

function getValue(arr: number[] | undefined, i: number): number {
  const n = Number(arr?.[i] ?? 0)
  return Number.isFinite(n) ? n : 0
}

const rowTotals = computed<number[]>(() =>
  props.labels.map((_, i) =>
    props.datasets.reduce((sum, ds) => sum + getValue(ds.data, i), 0),
  ),
)

const grandTotal = computed<number>(() =>
  rowTotals.value.reduce((s, v) => s + v, 0),
)

const percentages = computed<number[]>(() => {
  const total = grandTotal.value || 0
  return rowTotals.value.map((v) => (total > 0 ? (v / total) * 100 : 0))
})

const ranks = computed<number[]>(() => {
  const counts = rowTotals.value
  const uniqueDesc = Array.from(new Set(counts)).sort((a, b) => b - a)
  return counts.map((c) => uniqueDesc.indexOf(c) + 1)
})

const rows = computed(() =>
  props.labels.map((label, i) => ({
    label,
    count: rowTotals.value[i] ?? 0,
    percent: percentages.value[i] ?? 0,
    rank: ranks.value[i] ?? 0,
  })),
)

function formatPct2(n: number | undefined): string {
  const v = Math.max(0, Number.isFinite(n as number) ? (n as number) : 0)
  return v.toFixed(2).replace(/^0\.00$/, '0.00')
}
</script>

<style scoped>
.table-chart {
  width: 80%;
  margin: 0 auto;
  table-layout: fixed;
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
  color: white;
  font-weight: 600;
}
.summary-row {
  background: #1a237e;
  color: white;
  border-top: 2px solid #ccc;
}
</style>