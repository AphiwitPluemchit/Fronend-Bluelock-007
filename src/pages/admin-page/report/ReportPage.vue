<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { StudentService } from 'src/services/student'
import type { SummaryReport } from 'src/types/student'
import Chart from 'chart.js/auto'
import type { Pagination } from 'src/types/pagination'

interface ExtendedSummaryReport extends SummaryReport {
  perMajor?: {
    [major: string]: {
      completed: number
      notCompleted: number
    }
  }
}

const summaryReport = ref<ExtendedSummaryReport | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

const canvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const yearOptions = [
  { label: 'ทั้งหมด', value: null },
  { label: 'ปี 1', value: 1 },
  { label: 'ปี 2', value: 2 },
  { label: 'ปี 3', value: 3 },
  { label: 'ปี 4', value: 4 },
]
const selectedYear = ref<number | null>(null)

const majorOptions = [
  { label: 'CS', value: 'CS' },
  { label: 'SE', value: 'SE' },
  { label: 'ITDI', value: 'ITDI' },
  { label: 'AAI', value: 'AAI' },
]
const selectedMajors = ref<string[]>([])

const query = ref<Pagination>({
  major: [],
  studentYear: [],
})

const totalstudent = computed(() => summaryReport.value?.total ?? 0)
const academicSkillHours = computed(() => summaryReport.value?.hardSkill.completed ?? 0)
const readinessHours = computed(() => summaryReport.value?.softSkill.completed ?? 0)

const summaryCards = computed(() => {
  if (!summaryReport.value) return []
  return [
    {
      title: 'จำนวนนิสิตทั้งหมด',
      value: `${summaryReport.value.total.toLocaleString()} คน`,
      icon: 'people',
      color: 'primary',
      bg: 'blue-1',
    },
    {
      title: 'นิสิตที่ชั่วโมงครบแล้ว',
      value: `${summaryReport.value.completed.toLocaleString()} คน`,
      icon: 'task_alt',
      color: 'positive',
      bg: 'green-1',
    },
    {
      title: 'นิสิตที่ชั่วโมงยังไม่ครบ',
      value: `${summaryReport.value.notCompleted.toLocaleString()} คน`,
      icon: 'warning',
      color: 'negative',
      bg: 'red-1',
    },
    {
      title: 'เปอร์เซ็นต์ความสำเร็จ',
      value: `${summaryReport.value.completionRate}%`,
      icon: 'percent',
      color: 'amber',
      bg: 'amber-1',
    },
  ]
})

// Watch filters
watch([selectedMajors, selectedYear], async ([majors, year]) => {
  query.value.major = majors
  query.value.studentYear = year ? [year.toString()] : []
  await data()
})

// Chart rendering
function renderChart() {
  if (!canvas.value || !summaryReport.value?.perMajor) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  const majors =
    selectedMajors.value.length > 0
      ? selectedMajors.value
      : Object.keys(summaryReport.value.perMajor)

  const completed = majors.map((m) => summaryReport.value?.perMajor?.[m]?.completed ?? 0)
  const notCompleted = majors.map((m) => summaryReport.value?.perMajor?.[m]?.notCompleted ?? 0)

  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: majors,
      datasets: [
        {
          label: 'ครบชั่วโมง',
          backgroundColor: 'green',
          data: completed,
        },
        {
          label: 'ไม่ครบชั่วโมง',
          backgroundColor: 'red',
          data: notCompleted,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // ✅ ยืดเต็ม container
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

// Get data from API and create perMajor data
const data = async () => {
  isLoading.value = true
  error.value = null
  try {
    const apiData = await StudentService.getSummaryReport(query.value)

    const majorsToShow =
      selectedMajors.value.length > 0
        ? selectedMajors.value
        : ['CS', 'SE', 'ITDI', 'AAI']

    const perMajorData: { [key: string]: { completed: number; notCompleted: number } } = {}

    const promises = majorsToShow.map(async (major) => {
      const majorQuery = {
        ...query.value,
        major: [major]
      }
      try {
        const majorData = await StudentService.getSummaryReport(majorQuery)
        return {
          major,
          data: majorData
        }
      } catch (error) {
        console.error(`Error fetching data for ${major}:`, error)
        return {
          major,
          data: { completed: 0, notCompleted: 0 }
        }
      }
    })

    const majorResults = await Promise.all(promises)
    
    majorResults.forEach(({ major, data }) => {
      perMajorData[major] = {
        completed: data.completed,
        notCompleted: data.notCompleted
      }
    })

    summaryReport.value = {
      ...apiData,
      perMajor: perMajorData,
    }

    await nextTick()
    renderChart()
  } catch (e) {
    error.value = 'ไม่สามารถโหลดข้อมูล summary ได้'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await data()
})
</script>

<template>
  <q-page class="q-py-lg q-px-md" style="max-width: 1200px; margin: auto">
    <div class="text-h4 q-mb-md text-weight-medium">รายงานข้อมูลนิสิต</div>

    <!-- Filters -->
    <div class="q-mb-md row items-center q-gutter-sm">
      <div class="text-subtitle1">ตรวจสอบตาม ชั้นปี:</div>
      <q-select
        v-model="selectedYear"
        :options="yearOptions"
        option-label="label"
        option-value="value"
        emit-value
        map-options
        outlined
        dense
        style="min-width: 150px"
      />

      <div class="text-subtitle1 q-ml-md">สาขา:</div>
      <q-select
        v-model="selectedMajors"
        :options="majorOptions"
        option-label="label"
        option-value="value"
        emit-value
        map-options
        multiple
        outlined
        dense
        style="min-width: 200px"
      />
    </div>

    <!-- Error Message -->
    <q-banner v-if="error" class="bg-red-2 text-red-9 q-mb-md">
      {{ error }}
    </q-banner>

    <!-- Loading Spinner -->
    <q-spinner v-if="isLoading" color="primary" size="40px" class="q-my-xl flex flex-center" />

    <!-- Summary Cards -->
    <div v-if="!isLoading && summaryReport" class="row q-col-gutter-md q-mb-lg">
      <div v-for="item in summaryCards" :key="item.title" class="col-xs-12 col-sm-6 col-md-3">
        <q-card flat bordered class="dashboard-card">
          <q-card-section :class="`bg-${item.bg} q-pa-md rounded-borders`">
            <div class="row items-center no-wrap">
              <q-avatar :color="item.color" text-color="white" size="56px" class="q-mr-md">
                <q-icon :name="item.icon" size="32px" />
              </q-avatar>
              <div>
                <div class="text-subtitle1 text-weight-bold">{{ item.title }}</div>
                <div class="text-h5 text-weight-medium q-mt-xs">{{ item.value }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Progress Overview -->
    <div v-if="!isLoading && summaryReport" class="q-mb-lg">
      <q-card class="progress-overview" flat bordered>
        <q-card-section class="custom-header-section">
          <div class="text-h6">สรุปผลตามประเภทชั่วโมง</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-lg">
            <!-- Academic Skill -->
            <div class="col-xs-12 col-md-6 text-center">
              <div class="text-subtitle1 text-weight-medium q-mb-md">ชั่วโมงทักษะทางวิชาการ</div>
              <q-circular-progress
                show-value
                :value="(academicSkillHours / totalstudent) * 100"
                size="180px"
                :thickness="0.22"
                color="green-8"
                track-color="red-3"
                class="q-ma-md"
                :angle="180"
                rotate="180"
              >
                {{ Math.round((academicSkillHours / totalstudent) * 100) }}%
              </q-circular-progress>
              <div class="text-subtitle1">{{ academicSkillHours }} / {{ totalstudent }} คน</div>
              <div class="row justify-center q-mt-sm text-caption">
                <q-chip size="md" color="green" text-color="white" icon="check_circle">
                  ครบแล้ว {{ summaryReport.hardSkill.completed.toLocaleString() }} คน
                </q-chip>
                <q-chip size="md" color="red" text-color="white" icon="warning">
                  ไม่ครบ {{ summaryReport.hardSkill.notCompleted.toLocaleString() }} คน
                </q-chip>
              </div>
            </div>

            <!-- Readiness -->
            <div class="col-xs-12 col-md-6 text-center">
              <div class="text-subtitle1 text-weight-medium q-mb-md">ชั่วโมงเตรียมความพร้อม</div>
              <q-circular-progress
                show-value
                :value="(readinessHours / totalstudent) * 100"
                size="180px"
                :thickness="0.22"
                color="green-8"
                track-color="red-3"
                class="q-ma-md"
                :angle="180"
                rotate="180"
              >
                {{ Math.round((readinessHours / totalstudent) * 100) }}%
              </q-circular-progress>
              <div class="text-subtitle1">{{ readinessHours }} / {{ totalstudent }} คน</div>
              <div class="row justify-center q-mt-sm text-caption">
                <q-chip size="md" color="green" text-color="white" icon="check_circle">
                  ครบแล้ว {{ summaryReport.softSkill.completed.toLocaleString() }} คน
                </q-chip>
                <q-chip size="md" color="red" text-color="white" icon="warning">
                  ไม่ครบ {{ summaryReport.softSkill.notCompleted.toLocaleString() }} คน
                </q-chip>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Chart Comparison -->
    <q-card class="chart-card q-mb-lg" flat bordered v-if="summaryReport?.perMajor">
      <q-card-section class="custom-header-section">
        <div class="text-h6">สรุปผลตามสาขา</div>
      </q-card-section>

      <q-card-section>
        <div class="chart-container">
          <canvas ref="canvas"></canvas>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped>
.dashboard-card {
  transition: all 0.3s;
  border-radius: 8px;
  overflow: hidden;
}
.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
.progress-overview,
.chart-card {
  border-radius: 8px;
  overflow: hidden;
}
.q-circular-progress {
  transition: all 0.3s;
}
.q-circular-progress:hover {
  transform: scale(1.05);
}
.custom-header-section {
  background-color: #162aae;
  color: white;
}

.chart-card {
  transition: all 0.3s;
}
.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* ✅ ปรับความสูงของพื้นที่กราฟ */
.chart-card .q-card-section:last-child {
  height: 400px;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
