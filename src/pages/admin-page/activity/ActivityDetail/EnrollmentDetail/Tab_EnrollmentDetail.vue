<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ActivityService } from 'src/services/activity'
import type { Activity, EnrollmentSummary } from 'src/types/activity'

const route = useRoute()
const activityId = route.params.id as string
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 830
}
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

const enrollmentSummary = ref<EnrollmentSummary | null>(null)
const majorList = [
  { majorName: 'CS' },
  { majorName: 'SE' },
  { majorName: 'AAI' },
  { majorName: 'ITDI' },
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

// rows สำหรับ q-table
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

onMounted(async () => {
  await fetchEnrollmentSummary()
  await fetchActivityDetail()
})
</script>

<template>
  <div class="registration-content-scroll">
    <!-- Header ข้อมูลกิจกรรม -->
    <div class="info-group-header">
      <div class="activity-name-wrapper">
        <div class="ActivityName">{{ activityDetail?.name }}</div>
      </div>
      <div v-if="!isMobile" class="info-row-header">
        <span class="label">จำนวนที่รับ / จำนวนนิสิตที่ลงทะเบียน / จำนวนที่ว่าง :</span>
        <span class="value">
          {{ enrollmentSummary?.maxParticipants || 0 }} /
          {{ enrollmentSummary?.totalRegistered || 0 }} /
          {{ enrollmentSummary?.remainingSlots || 0 }}
        </span>
        <span class="unit">คน</span>
      </div>
      <div v-else class="info-row-header-mobile">
        <div class="row-line">
          <div class="label-mobile">จำนวนที่รับ</div>
          <div class="value-mobile">: {{ enrollmentSummary?.maxParticipants || 0 }}</div>
        </div>
        <div class="row-line">
          <div class="label-mobile">จำนวนนิสิตที่ลงทะเบียน</div>
          <div class="value-mobile">: {{ enrollmentSummary?.totalRegistered || 0 }}</div>
        </div>
        <div class="row-line">
          <div class="label-mobile">จำนวนที่ว่าง</div>
          <div class="value-mobile">: {{ enrollmentSummary?.remainingSlots || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- ตารางผลการลงทะเบียน หรือ Card Layout -->
    <div class="registration-title-center">
      <span class="registration-title-text">ผลการลงทะเบียน</span>
    </div>

    <q-list class="q-mt-sm">
      <q-card v-for="(row, index) in registrationRows" :key="index" class="q-mb-sm">
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">
            <b>{{ row.activity }}</b>
          </div>

          <!-- ข้อมูลทั่วไป -->
          <div class="info-row">
            <span class="labels">จำนวนที่รับ</span>
            <span class="value">: {{ row.max }}</span>
          </div>
          <div class="info-row">
            <span class="labels">จำนวนที่ลงทะเบียน</span>
            <span class="value">: {{ row.enrolled }}</span>
          </div>
          <div class="info-row">
            <span class="labels">จำนวนที่ว่าง</span>
            <span class="value">: {{ row.remaining }}</span>
          </div>

          <!-- แสดงแต่ละสาขา -->
          <div v-for="major in majorList" :key="major.majorName" class="info-row">
            <span class="labels">{{ major.majorName }}</span>
            <span class="value">: {{ row[major.majorName] }}</span>
          </div>
        </q-card-section>
      </q-card>
    </q-list>
    <!-- ตารางอาหาร (เฉพาะกรณีมีข้อมูล) -->
    <div v-if="activityDetail?.foodVotes?.length" class="registration-food-section">
      <div class="registration-title-center">
        <span class="registration-title-text">ผลการเลือกอาหาร</span>
      </div>

      <q-list class="q-mt-sm">
        <q-card v-for="(food, index) in foodRows" :key="index" class="q-mb-sm">
          <q-card-section>
            <div class="text-subtitle1">
              <b>{{ food.foodName }}</b>
            </div>
            <div class="label-mobiles">จำนวน: {{ food.vote }}</div>
          </q-card-section>
        </q-card>
      </q-list>
    </div>
  </div>
</template>

<style scoped>
.registration-content-scroll {
  height: 600px; /* ใช้ height แทน min/max-height */
  overflow-y: auto; /* ให้ scroll ตามแนวตั้ง */
  padding-right: 8px;
  border-radius: 8px;
  padding: 12px;
  background-color: #fff; /* เพื่อให้เห็น scrollbar ชัดเจน */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
.registration-content-scroll::-webkit-scrollbar {
  display: none;
}

.registration-title-center {
  display: flex;
  justify-content: left;
  align-items: center;
  margin: 2px 0;
  width: 100%;
}


.info-group-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 40px;
}

.info-row-header {
  display: flex;
  align-items: center;
  gap: 30px;
}
  .label-mobile {
    min-width: 200px;
    font-size: 18px;
    font-weight: 500;
    color: #000;
    text-align: left;
  }
.label {
  white-space: nowrap;
  text-align: right;
  min-width: 400px;
  font-size: 20px;
  color: #000;
}

.value,
.unit {
  font-size: 20px;
  color: #000;
  text-align: left;
}

.registration-title-center {
  display: flex;
  justify-content: left;
  align-items: self-start;
  margin: 20px 0;
  width: 100%;
}


.row {
  display: flex;
  align-items: flex-end;
  gap: 30px;
}
.info-row {
  display: flex;
  margin-bottom: 4px;
  font-size: 16px;
}
.ActivityName {
  font-size: 22px;
  font-weight: 600;
}
.labels {
  min-width: 180px; /* หรือเปลี่ยนตามความเหมาะสม เช่น 150px */
  font-weight: 500;
}
@media (max-width: 830px) {
  .registration-content-scroll {
    height: auto; /* ใช้ height แทน min/max-height */
    overflow-y: auto; /* ให้ scroll ตามแนวตั้ง */
  }
  .registration-content-scroll {
    padding: 8px;
  }

  .info-row-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .label {
    min-width: auto;
    font-size: 20px;
    text-align: left;
  }
  .info-row-header-mobile {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .row-line {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .label-mobile {
    min-width: 200px;
    font-size: 18px;
    font-weight: 500;
    color: #000;
    text-align: left;
  }

  .value-mobile {
    font-size: 18px;
    color: #000;
    text-align: right;
  }
  .value,
  .unit {
    font-size: 20px;
  }

  .text-subtitle1 {
    font-size: 18px;
    font-weight: semibold;
  }
  .label-mobiles {
    font-size: 16px;
    font-weight: 500;
    min-width: 140px;
    color: #000;
  }

}

</style>
