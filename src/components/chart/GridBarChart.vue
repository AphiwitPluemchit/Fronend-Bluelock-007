<template>
  <canvas ref="cv" class="graph-canvas"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels,
)
type GridDataset = {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
}

const props = defineProps<{
  labels: string[]
  datasets: GridDataset[]
  stacked?: boolean
}>()

const cv = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

/** คำนวณ max ของแกน Y ปัดขึ้นเป็นจำนวนเต็มที่หาร 5 ลงตัว */
const yAxisMax = computed(() => {
  if (!props.datasets?.length) return 5
  const all = props.datasets.flatMap((ds) => ds.data ?? [])
  const maxValue = Math.max(0, ...all.map((n) => Number(n ?? 0)))
  if (maxValue <= 0) return 5
  return Math.ceil(maxValue / 5) * 5
})

/** palette สีสำหรับหลายคอลัมน์ในกริด */
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

function render() {
  if (!cv.value) return
  if (chart) {
    chart.destroy()
    chart = null
  }

  // รวมทุกค่า เพื่อคำนวณ %
  const totalAll = props.datasets.reduce((sum, ds) => {
    return (
      sum +
      (ds.data ?? []).reduce((s, v) => {
        const n = Number(v ?? 0)
        return s + (Number.isFinite(n) ? n : 0)
      }, 0)
    )
  }, 0)

  // เตรียม datasets: เคารพสีที่ส่งมา ถ้าไม่ระบุใช้ palette
  const datasets = props.datasets.map((ds, i) => {
    const bg =
      (Array.isArray(ds.backgroundColor) ? ds.backgroundColor[0] : ds.backgroundColor) ??
      palette[i % palette.length]
    const bd = (Array.isArray(ds.borderColor) ? ds.borderColor[0] : ds.borderColor) ?? bg
    return {
      ...ds,
      backgroundColor: bg,
      borderColor: bd,
      borderWidth: 1,
      datalabels: {
        anchor: 'end' as const,
        align: 'top' as const,
        color: '#000',
        font: { weight: 'bold' as const, size: 14 },
      },
    }
  })

  chart = new Chart(cv.value, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets,
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true, // ในกริดควรเห็น legend ของแต่ละคอลัมน์
          position: 'top',
          labels: {
            font: { size: 12, weight: 'bold' },
          },
        },
        datalabels: { display: true },
        tooltip: {
          callbacks: {
            label(ctx) {
              const v = Number(ctx.parsed.y)
              const pct = totalAll > 0 ? (v / totalAll) * 100 : 0
              const pctStr = (Math.round(pct * 10) / 10).toString().replace(/\.0$/, '')
              const dsLabel = ctx.dataset?.label ?? ''
              return `${dsLabel}: ${v} (${pctStr}%)`
            },
          },
        },
      },
    scales: {
  x: {
    stacked: !!props.stacked,
    grid: {
      display: true,           
      drawOnChartArea: true,  
      drawTicks: false,
      color: 'rgba(0,0,0,0.08)',
      lineWidth: 1,
    
    },
    ticks: {
      font: { size: 11, weight: 'bold' },
      autoSkip: false,
      padding: 6,
    },
  },
  y: {
    stacked: !!props.stacked,
    beginAtZero: true,
    max: yAxisMax.value,
    ticks: {
      precision: 0,
      stepSize: 1,
      font: { size: 12, weight: 'bold' },
      callback(value) {
        const n = typeof value === 'string' ? parseFloat(value) : value
        return Number.isInteger(n) ? String(n) : ''
      },
    },
    grid: { drawOnChartArea: false, drawTicks: false },
  },
}
    },
    plugins: [ChartDataLabels],
  })
}

onMounted(render)
onBeforeUnmount(() => {
  if (chart) chart.destroy()
})
watch([() => props.labels, () => props.datasets, () => props.stacked], render, { deep: true })
</script>

<style scoped>
.graph-canvas {
  padding: 20px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 320px;
}
</style>
