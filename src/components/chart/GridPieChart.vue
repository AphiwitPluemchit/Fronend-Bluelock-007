<template>
  <div class="grid-pie">
    <!-- 1 แถว = 1 Pie -->
    <div v-for="(rowLabel, i) in labels" :key="`pie-${i}`" class="pie-card">
      <div class="pie-title">{{ rowLabel }}</div>
      <canvas :ref="(el) => setCanvasRef(el, i)" class="pie-canvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { Chart, ArcElement, Tooltip, Legend, PieController, type ChartOptions } from 'chart.js'
import type { ChartData, ChartDataset, ChartType } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import type { ComponentPublicInstance } from 'vue'
import type { Plugin } from 'chart.js'
Chart.register(ArcElement, Tooltip, Legend, PieController, ChartDataLabels)

type DS = { label: string; data: number[] }
type InlineLegendOpts = {
  labels?: string[]
  colors?: string[]
  boxSize?: number
  gap?: number
  padding?: number
  fontSize?: number
}
declare module 'chart.js' {
  // เพิ่ม property inlineLegend เข้าไปใน options ของทุก chart type
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PluginOptionsByType<TType extends ChartType> {
    inlineLegend?: InlineLegendOpts
  }
}
// We mutate its elements but neverreassign the array itself
// eslint-disable-next-line prefer-const
let canvases: (HTMLCanvasElement | null)[] = []

const props = defineProps<{
  labels: string[] // rows
  datasets: DS[] // columns
}>()

const legendLabels = computed<string[]>(() => (props.datasets ?? []).map((d) => d.label))

function makeColors(n: number) {
  const baseColor = [26, 35, 126] // #1A237E
  const colors: string[] = []
  for (let i = 0; i < n; i++) {
    const factor = Math.pow(0.55 + (0.45 * i) / Math.max(1, n - 1), 1.2)
    const [r, g, b] = baseColor.map((v) => Math.min(255, Math.round(v / factor)))
    colors.push(`rgb(${r}, ${g}, ${b})`)
  }
  return colors
}
const colors = computed(() => makeColors(legendLabels.value.length))

function setCanvasRef(el: Element | ComponentPublicInstance | null, idx: number) {
  const node = (el as ComponentPublicInstance | null)?.$el ?? el
  canvases[idx] = node instanceof HTMLCanvasElement ? node : null
}

let charts: Array<Chart<'pie', number[], string> | null> = []

function destroyAll() {
  charts.forEach((c) => c?.destroy())
  charts = []
}

const InlineLegend: Plugin<'pie', InlineLegendOpts> = {
  id: 'inlineLegend',

  afterDatasetsDraw(chart, _args, opts) {
    const {
      labels = [],
      colors = [],
      boxSize = 20, // 🔹 ขนาดกล่องใหญ่ขึ้น
      gap = 10, // 🔹 ระยะห่างระหว่างแถว
      padding = 20, // 🔹 ระยะขอบรอบ ๆ
      fontSize = 20, // 🔹 ขนาดตัวอักษรใหญ่ขึ้น
    } = opts ?? {}
    if (!labels.length || !colors.length) return

    const { ctx, chartArea } = chart
    const font = `${fontSize}px Arial`

    // Position legend on the right side of the chart
    const x = chartArea.right - 150 // Adjust this value to control horizontal position
    let y = chartArea.top + padding + boxSize / 2

    ctx.save()
    ctx.font = font
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#333'

    // 🔹 วาดเรียงแนวตั้ง
    for (let i = 0, n = Math.min(labels.length, colors.length); i < n; i++) {
      const fill = colors[i] ?? 'rgba(0,0,0,0.1)'
      ctx.fillStyle = fill
      ctx.fillRect(x, y - boxSize / 2, boxSize, boxSize)
      ctx.strokeStyle = 'rgba(0,0,0,.15)'
      ctx.strokeRect(x, y - boxSize / 2, boxSize, boxSize)

      const text = labels[i] ?? ''
      ctx.fillStyle = '#333'
      ctx.fillText(text, x + boxSize + 10, y)

      y += boxSize + gap
    }
    ctx.restore()
  },
}

function renderAll() {
  const rowCount = props.labels?.length ?? 0
  const colCount = props.datasets?.length ?? 0
  if (!rowCount || !colCount) return

  // ลบกราฟเกิน
  for (let i = rowCount; i < charts.length; i++) charts[i]?.destroy()
  charts.length = rowCount

  for (let i = 0; i < rowCount; i++) {
    const cv = canvases[i]
    if (!cv) {
      charts[i] = null
      continue
    }
    const rowValues = props.datasets.map((ds) => Number(ds.data?.[i] ?? 0))
    const total = rowValues.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0)

    const data: ChartData<'pie', number[], string> = {
      labels: legendLabels.value,
      datasets: [
        {
          label: '',
          data: rowValues,
          backgroundColor: colors.value,
          borderColor: '#fff',
          borderWidth: 1,
        } satisfies ChartDataset<'pie', number[]>,
      ],
    }

    const options: ChartOptions<'pie'> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      layout: { padding: { top: 24, right: 8, bottom: 8, left: 8 } },
      plugins: {
        legend: { display: false },
        datalabels: {
          display: () => total > 0,
          color: '#fff',
          anchor: 'center',
          align: 'center',
          clamp: true,
          font: { weight: 'bold', size: 20 },
          formatter(v: number) {
            const pct = total > 0 ? (Number(v) / total) * 100 : 0
            const pctStr = (Math.round(pct * 10) / 10).toString().replace(/\.0$/, '')
            return `${pctStr}%`
          },
        },
        inlineLegend: {
          labels: legendLabels.value,
          colors: colors.value,
          boxSize: 18,
          gap: 20,
          padding: 10,
          fontSize: 15,
        },
      },
    }

    if (!charts[i]) {
      charts[i] = new Chart(cv, { type: 'pie', data, options, plugins: [InlineLegend] })
    } else {
      const inst = charts[i]!
      inst.options = { ...inst.options, ...options }
      inst.data.labels = legendLabels.value
      const ds = inst.data.datasets[0] as ChartDataset<'pie', number[]>
      ds.data = rowValues
      ds.backgroundColor = [...colors.value]
      inst.update('none')
    }
  }
}

let lastSig = ''
let pending = false

function makeSignature() {
  const dsSig = (props.datasets ?? [])
    .map((d) => `${d.label}|${(d.data ?? []).join(',')}`)
    .join('||')
  const lbSig = (props.labels ?? []).join('|')
  return lbSig + '###' + dsSig
}

async function safeRender() {
  if (pending) return
  pending = true
  await nextTick()

  const sig = makeSignature()
  if (sig !== lastSig) {
    lastSig = sig
    renderAll()
  }
  pending = false
}

onMounted(safeRender)
onBeforeUnmount(destroyAll)
watch([() => props.labels, () => props.datasets], safeRender)
</script>

<style scoped>
.grid-pie {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-height: 550px;
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-width: thin;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  align-items: center;
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  display: inline-block;
  border: 1px solid rgba(0, 0, 0, 0.15);
}
.legend-text {
  white-space: nowrap;
}

/* พื้นที่กราฟย่อย */
.pie-card {
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
}

.pie-card {
  overflow: hidden;
}

.pie-canvas {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 250px;
  max-height: 400px;
  padding: 20px;
  display: block;
}

.pie-title {
  font-size: 18px;
  margin-bottom: 8px;
  line-height: 1.3;
}
</style>
