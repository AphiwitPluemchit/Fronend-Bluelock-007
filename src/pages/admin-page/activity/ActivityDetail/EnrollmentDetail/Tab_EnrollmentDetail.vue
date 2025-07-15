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
  { majorName: 'ITDI', fullName: 'สาขาวิชาเทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจิทัล', color: '#eab308', theme: 'yellow' },
  { majorName: 'AAI', fullName: 'สาขาวิชาปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ', color: '#1d4ed8', theme: 'blue' },
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

const getProgressPercentage = (enrolled: number, max: number) => {
  return max > 0 ? (enrolled / max) * 100 : 0
}

onMounted(async () => {
  await fetchEnrollmentSummary()
  await fetchActivityDetail()
})
</script>

<template>
  <div>    <!-- Main Activity Section -->
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
              <div class="stat-number">{{ enrollmentSummary?.maxParticipants || 0 }}</div>
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
              <div class="stat-number">{{ enrollmentSummary?.totalRegistered || 0 }}</div>
              <div class="stat-label">จำนวนนิสิตที่ลงทะเบียน</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card remaining-card">
          <q-card-section class="stat-content">
            <div class="stat-icon">
              <q-icon name="event_available" size="40px" />
            </div>
            <div class="stat-details">
              <div class="stat-number">{{ enrollmentSummary?.remainingSlots || 0 }}</div>
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
        <q-card
          v-for="major in majorList"
          :key="major.majorName"
          class="major-card"
        >
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
          <q-card 
            v-for="(food, index) in foodRows" 
            :key="index" 
            class="food-card"
          >
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

    <!-- Sub Activities Section -->
    <div v-for="(row, index) in registrationRows" :key="index" class="sub-activity-card">
      <div class="sub-activity-header" @click="toggleExpanded(index)">
        <div class="sub-activity-title">
          <q-icon name="event_note" size="24px" class="text-secondary" />
          <h3>{{ row.activity }}</h3>
        </div>
        <q-btn
          flat
          round
          :icon="expandedIndices.includes(index) ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          size="md"
          class="expand-btn"
        >
          <q-tooltip>
            {{ expandedIndices.includes(index) ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด' }}
          </q-tooltip>
        </q-btn>

      </div>

      <div class="sub-stats-grid">
        <q-card class="stat-card capacity-card">
          <q-card-section class="stat-content">
            <div class="stat-icon">
              <q-icon name="group" size="36px" />
            </div>
            <div class="stat-details">
              <div class="stat-number">{{ row.max }}</div>
              <div class="stat-label">จำนวนที่รับ</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card enrolled-card">
          <q-card-section class="stat-content">
            <div class="stat-icon">
              <q-icon name="how_to_reg" size="36px" />
            </div>
            <div class="stat-details">
              <div class="stat-number">{{ row.enrolled }}</div>
              <div class="stat-label">ลงทะเบียนแล้ว</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card remaining-card">
          <q-card-section class="stat-content">
            <div class="stat-icon">
              <q-icon name="event_available" size="36px" />
            </div>
            <div class="stat-details">
              <div class="stat-number">{{ row.remaining }}</div>
              <div class="stat-label">จำนวนที่ว่าง</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <q-slide-transition>
        <div v-if="expandedIndices.includes(index)" class="expanded-content">
          <div class="expanded-header">
            <q-icon name="school" size="20px" class="text-secondary" />
            <span class="expanded-title">รายละเอียดตามสาขา</span>
          </div>
          
          <div class="expanded-major-grid">
            <q-card
              v-for="major in majorList"
              :key="major.majorName"
              class="expanded-major-card"
            >
              <q-card-section class="expanded-major-content">
                <div class="expanded-major-color" :style="{ backgroundColor: major.color }"></div>
                <div class="expanded-major-details">
                  <div class="expanded-major-code">{{ major.majorName }}</div>
                  <div class="expanded-major-count">{{ row[major.majorName] }} คน</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-slide-transition>
    </div></div>

</template>

<style scoped>
.main-activity-card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.08);
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
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
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
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
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
  font-size: 20px;
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
  font-size: 16px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 2px;
}

.major-name {
  font-size: 12px;
  color: #000000;
}

.major-count {
  font-size: 24px;
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
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.food-votes {
  font-size: 16px;
  font-weight: 700;
  color: #000000;
}

.sub-activity-card {
  background: white;
  border-radius: 24px; /* เปลี่ยนจาก 20px เป็น 24px ให้เหมือน .main-activity-card */
  padding: 32px;       /* เพิ่มจาก 24px ให้เท่ากัน */
  margin-bottom: 24px; /* ให้ระยะห่างเท่ากัน */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); /* เหมือนการ์ดหลัก */
  border: 1px solid rgba(0, 0, 0, 0.08);     /* เพิ่ม border แบบเดียวกับการ์ดหลัก */
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
  font-size: 18px;
  font-weight: 600;
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
  font-size: 16px;
  font-weight: 600;
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
  font-size: 14px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 2px;
}

.expanded-major-count {
  font-size: 14px;
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
    font-size: 24px;
  }
}
</style>