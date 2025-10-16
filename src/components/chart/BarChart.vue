<template>
  <canvas ref="cv" class="graph-canvas"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import {
  Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import type { Context as DataLabelsContext } from 'chartjs-plugin-datalabels'

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels, 
)

const props = defineProps<{
  labels: string[]
  datasets: { label: string; data: number[] }[]
  stacked?: boolean
}>()

const cv = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

// Calculate the next multiple of 5 for the Y-axis max
const yAxisMax = computed(() => {
  if (!props.datasets?.length) return 5
  const maxValue = Math.max(...props.datasets.flatMap((dataset) => dataset.data))
  if (maxValue <= 0) return 5
  return Math.ceil(maxValue / 5) * 5
})

function render() {
  if (!cv.value) return
  if (chart) {
    chart.destroy()
    chart = null
  }


  const totalAll = props.datasets.reduce((sum, ds) => {
    return sum + ds.data.reduce((s, v) => {
      const n = Number(v ?? 0)
      return s + (Number.isFinite(n) ? n : 0)
    }, 0)
  }, 0)

  const datasets = props.datasets.map((ds) => ({
    ...ds,
    backgroundColor: '#1A237E',
    borderColor: '#1A237E',
    borderWidth: 1,
    datalabels: {
  anchor: 'end' as const,
  align: 'top' as const,
  color: '#000',
  font: { weight: 'bold' as const, size: 20 },
  formatter: (value: number, context: DataLabelsContext) => {
    void context 
    const pct = totalAll > 0 ? (Number(value) / totalAll) * 100 : 0
    const pctStr = (Math.round(pct * 10) / 10).toString().replace(/\.0$/, '')
    return `${Number(value) || 0} (${pctStr}%)`
  },
},
  }))

  chart = new Chart(cv.value, {
    type: 'bar',
    data: { labels: props.labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { display: props.stacked ? true : props.datasets.length > 1 },
        datalabels: { display: true },
      },
      scales: {
        x: {
          stacked: !!props.stacked,
          grid: { display: false },
          ticks: { font: { size: 10, weight: 'bold' } },
        },
        y: {
          stacked: !!props.stacked,
          beginAtZero: true,
          max: yAxisMax.value,
          ticks: {
            precision: 0,
            stepSize: 1,
            font: { size: 16, weight: 'bold' },
            callback(value) {
              const n = typeof value === 'string' ? parseFloat(value) : value
              return Number.isInteger(n) ? String(n) : ''
            },
          },
          grid: { drawOnChartArea: false, drawTicks: false },
        },
      },
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
  min-height: 300px;
}
</style>
