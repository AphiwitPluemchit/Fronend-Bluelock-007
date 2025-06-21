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
const registrationColumns = ref([
  { name: 'activity', label: 'ชื่อกิจกรรม', field: 'activity', align: 'left' as const },
  { name: 'max', label: 'จำนวนที่รับ', field: 'max', align: 'center' as const },
  { name: 'enrolled', label: 'จำนวนที่ลงทะเบียน', field: 'enrolled', align: 'center' as const },
  { name: 'remaining', label: 'จำนวนที่ว่าง', field: 'remaining', align: 'center' as const },
  ...majorList.map((m) => ({
    name: m.majorName,
    label: m.majorName,
    field: m.majorName,
    align: 'center' as const,
  })),
])
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

const foodColumns = [
  { name: 'foodName', label: 'ชื่ออาหาร', field: 'foodName', align: 'left' as const },
  { name: 'vote', label: 'จำนวน', field: 'vote', align: 'center' as const },
]

// rows สำหรับ q-table
const foodRows = computed(() => activityDetail.value?.foodVotes ?? [])
const foodPagination = ref({
  page: 1,
  rowsPerPage: 5,
  sortBy: 'foodName',
  descending: false,
})
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

    <div v-if="!isMobile" class="table-scroll-container">
      <q-table
        flat
        bordered
        :rows="registrationRows"
        :columns="registrationColumns"
        row-key="activity"
        class="q-mt-sm rounded-borders"
      />
    </div>

    <q-list v-else class="q-mt-sm">
      <q-card v-for="(row, index) in registrationRows" :key="index" class="q-mb-sm">
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">
            <b>{{ row.activity }}</b>
          </div>
          <div class="row-line">
            <div class="label-mobiles">จำนวนที่รับ</div>
            <div class="value-mobiles">: {{ row.max }}</div>
          </div>
          <div class="row-line">
            <div class="label-mobiles">จำนวนที่ลงทะเบียน</div>
            <div class="value-mobiles">: {{ row.enrolled }}</div>
          </div>
          <div class="row-line">
            <div class="label-mobiles">จำนวนที่ว่าง</div>
            <div class="value-mobiles">: {{ row.remaining }}</div>
          </div>
          <div v-for="major in majorList" :key="major.majorName" class="row-line">
            <div class="label-mobiles">{{ major.majorName }}</div>
            <div class="value-mobiles">: {{ row[major.majorName] }}</div>
          </div>
        </q-card-section>
      </q-card>
    </q-list>
    <!-- ตารางอาหาร (เฉพาะกรณีมีข้อมูล) -->
    <div v-if="activityDetail?.foodVotes?.length" class="registration-food-section">
      <div class="registration-title-center">
        <span class="registration-title-text">ผลการเลือกอาหาร</span>
      </div>

      <div v-if="!isMobile" class="table-scroll-container food-table-wrapper">
        <q-table
          flat
          bordered
          :rows="foodRows"
          :columns="foodColumns"
          row-key="foodName"
          v-model:pagination="foodPagination"
          :rows-per-page-options="[5, 10, 20]"
          class="q-mt-sm"
        />
      </div>

      <q-list v-else class="q-mt-sm">
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
  display: none; /* Chrome/Safari */
}

.registration-title-center {
  display: flex;
  justify-content: left;
  align-items: center;
  margin: 2px 0; /* 🔽 ลดจาก 20px เหลือ 8px */
  width: 100%;
}
.registration-title-text {
  font-size: 18px;
  padding: 0 16px;
  font-weight: 600;
}

.info-group-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 40px;
}

.activity-name-wrapper {
  width: 100%;
  display: flex;
  justify-content: left;
}

.ActivityName {
  font-size: 22px;
  font-weight: 600;
}

.info-row-header {
  display: flex;
  align-items: center;
  gap: 30px;
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
.table-center {
  margin: 0 auto;
  width: auto;
  min-width: 300px;
}

.activity-item-name {
  margin-bottom: 8px;
  text-align: left;
}

.row {
  display: flex;
  align-items: flex-end;
  gap: 30px;
}

.student-major-block {
  display: flex;
  align-items: center;
  gap: 30px;
}

.textEnroll,
.number,
.quantity-number {
  font-size: 20px;
  color: #000;
  text-align: left;
}

.textEnroll {
  min-width: 80px;
}
.number,
.quantity-number {
  min-width: 30px;
}
.table-wrapper-center {
  width: 100%;
  display: flex;
  justify-content: center;
}
.table-wrapper-center table {
  max-width: 1000px;
  width: 100%;
}
.food-table-wrapper {
  max-height: 240px; /* หรือกำหนดให้เล็กลง */
  overflow-y: auto;
  max-width: 400px;
  width: 100%;
}
.table-scroll-container {
  max-height: 300px; /* ปรับตามที่ต้องการ */
  overflow-y: auto;
  margin-bottom: 40px;
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

  .registration-title-text {
    font-size: 20px;
    padding: 0 8px;
  }

  .ActivityName {
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

  .value-mobiles {
    font-size: 16px;
    font-weight: 400;
    text-align: right;
    color: #000;
  }
}
</style>
