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

  const blue = '#2196f3'
  const datasets = props.datasets.map((ds) => ({
  ...ds,
  backgroundColor: blue,
  borderColor: blue,
  borderWidth: 1,
  datalabels: {
    anchor: 'end' as const,
    align: 'top' as const,
    formatter: (value: number) => (Number.isInteger(value) ? value.toString() : ''),
    color: '#000',
    font: {
      weight: 'bold' as const,
      size: 15, 
    },
  }
}))

  chart = new Chart(cv.value, {
    type: 'bar',
    data: { labels: props.labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: props.stacked ? true : props.datasets.length > 1,
        },
        datalabels: {
          display: true,
        },
      },
      scales: {
        x: {
        stacked: !!props.stacked,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10, // Adjust the font size for X-axis labels
            weight: 'bold' // Optional: make the text bold
          }
        }
      },
        y: {
          stacked: !!props.stacked,
          beginAtZero: true,
          max: yAxisMax.value,
          ticks: {
            precision: 0,
            stepSize: 1,
            font: {
            size: 16, 
             weight: 'bold'
            
          },
            callback: function (value: string | number) {
              const numValue = typeof value === 'string' ? parseFloat(value) : value
              if (Number.isInteger(numValue)) {
                return numValue.toString()
              }
              return ''
            },
          },
          grid: {
            drawOnChartArea: false,
            drawTicks: false,
          },
          
          },
      },
    },
    plugins: [ChartDataLabels], // Add the plugin to the chart instance
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
