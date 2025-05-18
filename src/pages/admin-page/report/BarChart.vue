<template>
  <div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'

const canvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  if (canvas.value) {
    const ctx = canvas.value.getContext('2d')
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['CS', 'SE', 'ITDI', 'AAI'],
          datasets: [
            {
              label: 'ครบชั่วโมง',
              backgroundColor: 'green',
              data: [150, 250, 300, 450],
            },
            {
              label: 'ไม่ครบชั่วโมง',
              backgroundColor: 'red',
              data: [20, 50, 50, 75],
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 50,
              },
            },
          },
        },
      })
    }
  }
})
</script>
