<template>
  <q-page class="q-py-lg q-px-md" style="max-width: 1200px; margin: auto">
    <div class="text-h4 q-mb-md text-weight-medium">รายงานข้อมูลนิสิต</div>
    <!-- Summary Cards -->
    <div class="row q-col-gutter-md q-mb-lg justify-start">
      <div v-for="item in summaryCards" :key="item.title" class="col-xs-12 col-sm-6 col-md-4">
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

    <!-- Progress Section -->
    <div class="q-mb-lg">
      <q-card class="progress-overview" flat bordered>
        <q-card-section class="bg-blue-9 text-white">
          <div class="text-h6">ภาพรวมความคืบหน้า</div>
          <div class="text-caption q-mt-xs">อัพเดทล่าสุด: 18 พฤษภาคม 2568</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-lg">
            <!-- Academic Skills Progress -->
            <div class="col-xs-12 col-md-6">
              <div class="text-subtitle1 text-center text-weight-medium q-mb-md">
                ชั่วโมงทักษะทางวิชาการ
              </div>
              <div class="row justify-center q-mb-md">
                <q-circular-progress
                  show-value
                  rounded
                  font-size="16px"
                  :value="(academicSkillHours / 2500) * 100"
                  size="180px"
                  :thickness="0.22"
                  color="green-8"
                  track-color="red-3"
                  class="q-ma-md"
                  :angle="180"
                  rotate="180"
                >
                  {{ Math.round((academicSkillHours / 2500) * 100) }}%
                </q-circular-progress>
              </div>
              <div class="text-center">
                <div class="text-subtitle1 text-weight-medium">{{ academicSkillHours }} / 2500</div>
                <div class="row justify-center q-mt-sm text-caption">
                  <q-chip size="md" color="green" text-color="white" icon="check_circle">
                    ครบแล้ว 2400 คน
                  </q-chip>
                  <q-chip size="md" color="red" text-color="white" icon="warning">
                    ไม่ครบ 100 คน
                  </q-chip>
                </div>
              </div>
            </div>

            <!-- Readiness Hours Progress -->
            <div class="col-xs-12 col-md-6">
              <div class="text-subtitle1 text-center text-weight-medium q-mb-md">
                ชั่วโมงเตรียมความพร้อม
              </div>
              <div class="row justify-center q-mb-md">
                <q-circular-progress
                  show-value
                  rounded
                  font-size="16px"
                  :value="(readinessHours / 2500) * 100"
                  size="180px"
                  :thickness="0.22"
                  color="green-8"
                  track-color="red-3"
                  class="q-ma-md"
                  :angle="180"
                  :rotate="180"
                >
                  {{ Math.round((readinessHours / 2500) * 100) }}%
                </q-circular-progress>
              </div>
              <div class="text-center">
                <div class="text-subtitle1 text-weight-medium">{{ readinessHours }} / 2500</div>
                <div class="row justify-center q-mt-sm text-caption">
                  <q-chip size="md" color="green" text-color="white" icon="check_circle">
                    ครบแล้ว 2400 คน
                  </q-chip>
                  <q-chip size="md" color="red" text-color="white" icon="warning">
                    ไม่ครบ 100 คน
                  </q-chip>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Department Chart -->
    <div class="row q-col-gutter-md">
      <div class="col-xs-12">
        <q-card flat bordered class="chart-card">
          <q-card-section class="bg-blue-9 text-white">
            <div class="text-h6">สถิติแยกตามสาขา</div>
          </q-card-section>
          <q-card-section class="q-pa-lg">
            <BarChart />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BarChart from './BarChart.vue'

const academicSkillHours = ref(2400)
const readinessHours = ref(2400)

const summaryCards = [
  {
    title: 'จำนวนนิสิตทั้งหมด',
    value: '3,000 คน',
    icon: 'people',
    color: 'primary',
    bg: 'blue-1',
  },
  {
    title: 'นิสิตที่ชั่วโมงครบแล้ว',
    value: '2,500 คน',
    icon: 'task_alt',
    color: 'positive',
    bg: 'green-1',
  },
  {
    title: 'นิสิตที่ชั่วโมงยังไม่ครบ',
    value: '500 คน',
    icon: 'warning',
    color: 'negative',
    bg: 'red-1',
  },
]

// const columns = [
//   {
//     name: 'totalStudents',
//     align: 'center',
//     label: 'จำนวนนิสิต',
//     field: 'totalStudents',
//     sortable: true,
//   },
//   {
//     name: 'completed',
//     align: 'center',
//     label: 'ครบชั่วโมงแล้ว',
//     field: 'completed',
//     sortable: true,
//   },
//   { name: 'incomplete', align: 'center', label: 'ยังไม่ครบ', field: 'incomplete', sortable: true },
//   {
//     name: 'completion',
//     align: 'center',
//     label: 'ความคืบหน้า',
//     field: 'completion',
//     sortable: true,
//   },
// ]
</script>

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

.q-table {
  border-radius: 8px;
}

.q-circular-progress {
  transition: all 0.3s;
}

.q-circular-progress:hover {
  transform: scale(1.05);
}
</style>
