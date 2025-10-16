<template>
    <canvas ref="cv" class="graph-canvas"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import {
    Chart,
    ArcElement,
    Tooltip,
    Legend,
    PieController,
} from 'chart.js'
import type { LegendItem, ChartOptions } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
Chart.register(ArcElement, Tooltip, Legend, PieController, ChartDataLabels)

const props = defineProps<{
    labels: string[]
    datasets: { label: string; data: number[] }[]
}>()

const cv = ref<HTMLCanvasElement | null>(null)
let chart: Chart<'pie'> | null = null

function combineData(labels: string[], datasets: { label: string; data: number[] }[]) {
    const sums = new Array(labels.length).fill(0)
    for (const ds of datasets) {
        ds.data.forEach((v, i) => {
            const n = Number(v ?? 0)
            sums[i] += Number.isFinite(n) ? n : 0
        })
    }
    return sums
}


function makeColors(n: number) {
    const baseColor = [26, 35, 126] // RGB ของ #1A237E
    const colors: string[] = []
    for (let i = 0; i < n; i++) {
        const factor = Math.pow(0.55 + (0.45 * i) / Math.max(1, n - 1), 1.2)
        const [r, g, b] = baseColor.map(v => Math.min(255, Math.round(v / factor)))
        colors.push(`rgb(${r}, ${g}, ${b})`)
    }
    return colors
}

function render() {
    if (!cv.value) return
    if (chart) {
        chart.destroy()
        chart = null
    }

    const dataValues = combineData(props.labels ?? [], props.datasets ?? [])
    const totalAll = dataValues.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0)
    const colors = makeColors(dataValues.length)


    const options: ChartOptions<'pie'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    font: {
                        size: 14,        
                        weight: 'normal',  
                        family: 'Arial',
                    },
                    color: '#333',     

                    generateLabels(chart): LegendItem[] {
                        const ds = chart.data.datasets?.[0] as {
                            data: (number | null | undefined)[]
                            backgroundColor?: string | string[]
                            borderColor?: string | string[]
                            borderWidth?: number | number[]
                        }
                        const labels = (chart.data.labels ?? []) as string[]

                        const getColor = (c: string | string[] | undefined, i: number) =>
                            Array.isArray(c) ? c[i] : c

                        return (ds?.data ?? []).map((_, i) => {
                            const v = Number(ds.data[i] ?? 0)
                            const pct = totalAll > 0 ? (v / totalAll) * 100 : 0
                            const pctStr = (Math.round(pct * 10) / 10).toString().replace(/\.0$/, '')

                            const fill = getColor(ds.backgroundColor, i) ?? 'rgba(0,0,0,0.1)'
                            const stroke = getColor(ds.borderColor, i) ?? '#fff'
                            const lw =
                                (Array.isArray(ds.borderWidth)
                                    ? (ds.borderWidth[i] as number)
                                    : ds.borderWidth) ?? 1

                            return {
                                text: `${labels[i] ?? ''}  ${v} (${pctStr}%)`,
                                fillStyle: fill,
                                strokeStyle: stroke,
                                lineWidth: lw,
                                hidden: !chart.getDataVisibility(i),
                                index: i,
                            } as LegendItem
                        })
                    },
                },
            },


            datalabels: {
                color: '#fff',
                anchor: 'center',
                align: 'center',
                clamp: true,
                font: { weight: 'bold', size: 20 },
                formatter: (value: number) => {
                    const pct = totalAll > 0 ? (Number(value) / totalAll) * 100 : 0
                    const pctStr = (Math.round(pct * 10) / 10).toString().replace(/\.0$/, '')
                    return `${pctStr}%`
                },
            },
        },
    }

    chart = new Chart(cv.value, {
        type: 'pie',
        data: {
            labels: props.labels,
            datasets: [
                {
                    label: '',
                    data: dataValues,
                    backgroundColor: colors,
                    borderColor: '#fff',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            ...options,
            plugins: {
                ...options.plugins,
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const value = Number(ctx.parsed)
                            const total = dataValues.reduce((a, b) => a + b, 0)
                            const pct = total > 0 ? (value / total) * 100 : 0
                            const pctStr = (Math.round(pct * 10) / 10).toString().replace(/\.0$/, '')
                            return ` ${value} (${pctStr}%)`
                        },
                    },
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

watch([() => props.labels, () => props.datasets], render, { deep: true })
</script>

<style scoped>
.graph-canvas {
    padding: 20px;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-height: 300px;
    max-height: 500px;
}
</style>