<template>
  <canvas ref="cv" class="graph-canvas"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps<{
  labels: string[]
  datasets: { label: string; data: number[] }[]
  stacked?: boolean
}>()

const cv = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

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
  }))
  chart = new Chart(cv.value, {
    type: 'bar',
    data: { labels: props.labels, datasets },
    options: {
      responsive: true,
      scales: {
        x: { stacked: !!props.stacked },
        y: { stacked: !!props.stacked, beginAtZero: true, ticks: { precision: 0 } },
      },
      plugins: {
        legend: { display: props.stacked ? true : props.datasets.length > 1 },
      },
    },
  })
}

onMounted(render)
onBeforeUnmount(() => {
  if (chart) chart.destroy()
})
watch(() => [props.labels, props.datasets, props.stacked], render, { deep: true })
</script>
<style scoped>
.graph-canvas {
  padding: 50px; 
  box-sizing: border-box;
}
</style>
