<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ActivityService } from 'src/services/activity'
import type { Activity, EnrollmentSummary } from 'src/types/activity'

const route = useRoute()
const activityId = route.params.id as string
const expandedIndices = ref<number[]>([])

const toggleExpanded = (index: number) => {
  if (expandedIndices.value.includes(index)) {
    expandedIndices.value = expandedIndices.value.filter((i) => i !== index)
  } else {
    expandedIndices.value.push(index)
  }
}

const enrollmentSummary = ref<EnrollmentSummary | null>(null)

const majorList = [
  { majorName: 'CS', fullName: 'สาขาวิชาวิทยาการคอมพิวเตอร์', color: '#2563eb', theme: 'blue' },
  { majorName: 'SE', fullName: 'สาขาวิชาวิศวกรรมซอฟต์แวร์', color: '#dc2626', theme: 'red' },
  {
    majorName: 'ITDI',
    fullName: 'สาขาวิชาเทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจิทัล',
    color: '#eab308',
    theme: 'yellow',
  },
  {
    majorName: 'AAI',
    fullName: 'สาขาวิชาปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ',
    color: '#1d4ed8',
    theme: 'blue',
  },
]

const registrationRows = computed(() => {
  return (enrollmentSummary.value?.activityItemSums ?? []).map((item, index) => {
    const activity = activityDetail.value?.activityItems?.[index]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseRow: Record<string, any> = {
      activity: activity?.name ?? '-',
      max: activity?.maxParticipants ?? 0,
      enrolled: activity?.enrollmentCount ?? 0,
      remaining: (activity?.maxParticipants ?? 0) - (activity?.enrollmentCount ?? 0),
    }

    majorList.forEach((m) => {
      baseRow[m.majorName] =
        item.registeredByMajor?.find((x) => x.majorName === m.majorName)?.count || 0
    })

    return baseRow
  })
})

const foodRows = computed(() => activityDetail.value?.foodVotes ?? [])

const fetchEnrollmentSummary = async () => {
  try {
    const response = await ActivityService.getEnrollmentSummary(activityId)
    enrollmentSummary.value = response
  } catch (error) {
    console.error('Error fetching enrollment summary:', error)
  }
}

const activityDetail = ref<Activity | null>(null)

const fetchActivityDetail = async () => {
  try {
    const response = await ActivityService.getOne(activityId)
    activityDetail.value = response.data
  } catch (error) {
    console.error('Error fetching activity detail:', error)
  }
}

const totalByMajor = computed(() => {
  const result: Record<string, number> = {}
  majorList.forEach((m) => {
    result[m.majorName] = 0
  })

  enrollmentSummary.value?.activityItemSums?.forEach((item) => {
    if (Array.isArray(item.registeredByMajor)) {
      item.registeredByMajor.forEach((major) => {
        result[major.majorName] = (result[major.majorName] ?? 0) + major.count
      })
    }
  })

  return result
})

onMounted(async () => {
  await fetchEnrollmentSummary()
  await fetchActivityDetail()
})
</script>

<template>
  <div>
    <!-- Main Activity Section -->
    <div class="main-activity-card">
      <div class="activity-header">
        <div class="activity-title">
          <q-icon name="event" size="32px" class="text-primary" />
          <h1>{{ activityDetail?.name || 'Loading...' }}</h1>
        </div>
      </div>

      <!-- Main Statistics Cards -->
      <div class="stats-grid">
        <q-card class="stat-card capacity-card">
          <q-card-section class="stat-content">
            <div class="stat-icon">
              <q-icon name="group" size="40px" />
            </div>
            <div class="stat-details">
              <div class="stat-number">{{ enrollmentSummary?.maxParticipants || 0 }} คน</div>
              <div class="stat-label">จำนวนที่รับ</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card enrolled-card">
          <q-card-section class="stat-content">
            <div class="stat-icon">
              <q-icon name="how_to_reg" size="40px" />
            </div>
            <div class="stat-details">
              <div class="stat-number">{{ enrollmentSummary?.totalRegistered || 0 }} คน</div>
              <div class="stat-label">จำนวนนิสิตที่ลงทะเบียน</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card remaining-card">
          <q-card-section class="stat-content">
            <div class="stat-icon">
              <q-icon name="event_seat" size="40px" />
            </div>
            <div class="stat-details">
              <div class="stat-number">{{ enrollmentSummary?.remainingSlots || 0 }} คน</div>
              <div class="stat-label">จำนวนที่ว่าง</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Major Distribution -->
      <div class="section-divider">
        <q-icon name="school" size="24px" class="text-primary" />
        <h3>รายละเอียดตามสาขา</h3>
      </div>

      <div class="major-grid">
        <q-card v-for="major in majorList" :key="major.majorName" class="major-card">
          <q-card-section class="major-content">
            <div class="major-header">
              <div class="major-color" :style="{ backgroundColor: major.color }"></div>
              <div class="major-info">
                <div class="major-code">{{ major.majorName }}</div>
                <div class="major-name">{{ major.fullName }}</div>
              </div>
            </div>
            <div class="major-count">{{ totalByMajor[major.majorName] || 0 }} คน</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Food Votes Section -->
      <div v-if="activityDetail?.foodVotes?.length" class="food-section">
        <div class="section-divider">
          <q-icon name="restaurant" size="24px" class="text-primary" />
          <h3>ผลการเลือกอาหาร</h3>
        </div>

        <div class="food-grid">
          <q-card v-for="(food, index) in foodRows" :key="index" class="food-card">
            <q-card-section class="food-content">
              <div class="food-icon">
                <q-icon name="restaurant_menu" size="24px" />
              </div>
              <div class="food-details">
                <div class="food-name">{{ food.foodName }}</div>
                <div class="food-votes">{{ food.vote }} คน</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <q-separator spaced="xl" />

    <!-- Sub Activities Section -->
    <div>
      <div class="sub-activity-card">
        <div class="activity-header">
          <div class="activity-title">
            <q-icon name="event_note" size="32px" class="text-primary" />
            <h1>กิจกรรมย่อย</h1>
          </div>
        </div>
        <div
          v-for="(row, index) in registrationRows"
          :key="index"
          class="q-mb-md q-pa-md bg-white rounded-borders shadow-1"
          @click="toggleExpanded(index)"
          style="cursor: pointer"
        >
          <!-- Header: ชื่อกิจกรรมย่อย + จำนวน -->
          <div class="row items-center justify-between q-gutter-sm">
            <!-- ชื่อกิจกรรมย่อย -->
            <div class="text-h6 text-primary q-mb-xs">
              {{ row.activity }}
            </div>

            <!-- จำนวนที่รับ / ลง / เหลือ -->
            <div class="text-h7 text-weight-bold">
              รับ {{ row.max }} / ลงทะเบียนแล้ว {{ row.enrolled }} / เหลือ {{ row.remaining }}
            </div>

            <q-btn
              flat
              dense
              round
              color="primary"
              :icon="expandedIndices.includes(index) ? 'expand_less' : 'expand_more'"
              class="q-ml-sm"
              @click.stop="toggleExpanded(index)"
            />
          </div>

          <!-- Expanded Content -->
          <q-slide-transition>
            <div v-if="expandedIndices.includes(index)" class="q-mt-sm q-pt-sm q-border-top">
              <div class="text-subtitle2 q-mb-sm">
                <q-icon name="school" class="q-mr-xs" />
                จำนวนนิสิตจากแต่ละสาขา
              </div>
              <div class="row q-col-gutter-md q-row-gutter-sm">
                <div
                  v-for="major in majorList"
                  :key="major.majorName"
                  class="col-12 col-sm-6 col-md-6"
                >
                  <q-card flat bordered class="q-pa-sm">
                    <div class="row items-center">
                      <div
                        class="q-mr-sm"
                        :style="{ width: '10px', height: '30px', backgroundColor: major.color }"
                      ></div>
                      <div class="text-body2">
                        {{ major.fullName }}: {{ row[major.majorName] || 0 }} คน
                      </div>
                    </div>
                  </q-card>
                </div>
              </div>
            </div>
          </q-slide-transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-activity-card {
  margin-bottom: 48px; /* เพิ่ม margin-bottom ให้ช่องว่างก่อนกิจกรรมย่อย */
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.activity-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.activity-title h1 {
  font-size: 32px; /* เพิ่มขนาดตัวอักษร */
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  word-break: break-word;
  line-height: 1.3;
}

.activity-badge {
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.capacity-card {
  background: rgb(56, 149, 255);
  color: white;
}

.enrolled-card {
  background: #10b981;
  color: white;
}

.remaining-card {
  background: #f59e0b;
  color: white;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
}

.stat-icon {
  opacity: 0.9;
}

.stat-details {
  flex: 1;
}

.stat-number {
  font-size: 36px; /* เพิ่มขนาด */
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 16px; /* เพิ่มขนาด */
  opacity: 0.9;
  font-weight: 600;
}

.progress-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #f1f5f9;
  border-radius: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.progress-percentage {
  font-size: 18px;
  font-weight: 700;
  color: #3b82f6;
}

.progress-bar {
  border-radius: 10px;
  overflow: hidden;
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.section-divider h3 {
  font-size: 20px; /* เพิ่มขนาด */
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.major-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.major-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.major-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.major-content {
  padding: 20px;
}

.major-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.major-color {
  width: 12px;
  height: 40px;
  border-radius: 6px;
}

.major-info {
  flex: 1;
}

.major-code {
  font-size: 18px; /* เพิ่มขนาด */
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 2px;
}

.major-name {
  font-size: 14px; /* เพิ่มขนาด */
  color: #000000;
}

.major-count {
  font-size: 28px; /* เพิ่มขนาด */
  font-weight: 700;
  color: #4a5568;
  text-align: right;
}

.food-section {
  margin-top: 32px;
}

.food-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.food-card {
  border-radius: 12px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.food-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.food-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.food-icon {
  color: #ed8936;
}

.food-details {
  flex: 1;
}

.food-name {
  font-size: 16px; /* เพิ่มขนาด */
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.food-votes {
  font-size: 18px; /* เพิ่มขนาด */
  font-weight: 700;
  color: #000000;
}

.sub-activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  cursor: pointer;
  padding: 8px 0;
}

.sub-activity-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sub-activity-title h3 {
  font-size: 20px; /* เพิ่มขนาด */
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.expand-btn {
  transition: transform 0.3s ease;
}

.sub-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.sub-stat-card {
  border-radius: 12px;
  background: #f8fafc;
  color: #2d3748;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.sub-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.sub-stat-content {
  padding: 20px;
  text-align: center;
}

.sub-stat-number {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.sub-stat-label {
  font-size: 12px;
  opacity: 0.9;
  font-weight: 500;
}

.sub-progress-section {
  margin-bottom: 16px;
}

.sub-progress-bar {
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.sub-progress-text {
  text-align: center;
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

.expanded-content {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.expanded-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.expanded-title {
  font-size: 18px; /* เพิ่มขนาด */
  font-weight: 700;
  color: #2d3748;
}

.expanded-major-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.expanded-major-card {
  border-radius: 10px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.expanded-major-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.expanded-major-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.expanded-major-color {
  width: 8px;
  height: 32px;
  border-radius: 4px;
}

.expanded-major-details {
  flex: 1;
}

.expanded-major-code {
  font-size: 16px; /* เพิ่มขนาด */
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 2px;
}

.expanded-major-count {
  font-size: 16px; /* เพิ่มขนาด */
  color: #000000;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .main-activity-card {
    padding: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .major-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .activity-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  .activity-title h1 {
    font-size: 24px; /* ลดขนาดบนมือถือ */
    text-align: center;
    word-break: break-word;
  }

  .activity-title {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}

.sub-activity-wrapper {
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin-bottom: 16px;
}

.sub-activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  cursor: pointer;
}

.sub-activity-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #2d3748;
  flex-grow: 1;
  word-break: break-word;
}

.sub-activity-numbers {
  font-size: 14px;
  color: #4b5563;
  font-weight: 500;
}

.sub-major-expanded {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.expanded-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
}

.expanded-major-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.expanded-major-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f9fafb;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
}

.color-indicator {
  width: 8px;
  height: 24px;
  border-radius: 4px;
}

.major-label {
  font-weight: 600;
}

.major-count {
  margin-left: auto;
  font-weight: 500;
}
</style>

