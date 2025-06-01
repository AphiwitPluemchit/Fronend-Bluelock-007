<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ActivityService } from 'src/services/activity'
import type { Activity, EnrollmentSummary } from 'src/types/activity'

const route = useRoute()
const activityId = route.params.id as string

const enrollmentSummary = ref<EnrollmentSummary | null>(null)
const majorList = [
  { majorName: 'CS' },
  { majorName: 'SE' },
  { majorName: 'AAI' },
  { majorName: 'ITDI' },
]

const fetchEnrollmentSummary = async () => {
  try {
    const response = await ActivityService.getEnrollmentSummary(activityId)
    console.log('API Response:', response) // ตรวจสอบข้อมูล API
    enrollmentSummary.value = response
  } catch (error) {
    console.error('Error fetching enrollment summary:', error)
  }
}

const activityDetail = ref<Activity | null>(null)

const fetchActivityDetail = async () => {
  try {
    const response = await ActivityService.getOne(activityId)
    console.log('Activity Detail:', response)
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
  <div class="registration-container">
    <!-- Header ข้อมูลกิจกรรม -->
    <div class="info-group-header">
      <div class="activity-name-wrapper">
        <div class="ActivityName">{{ activityDetail?.name }}</div>
      </div>
      <div class="info-row-header">
        <span class="label">จำนวนที่รับ / จำนวนนิสิตที่ลงทะเบียน / จำนวนที่ว่าง :</span>
        <span class="value">
          {{ enrollmentSummary?.maxParticipants || 0 }} /
          {{ enrollmentSummary?.totalRegistered || 0 }} /
          {{ enrollmentSummary?.remainingSlots || 0 }}
        </span>
        <span class="unit">คน</span>
      </div>
    </div>

    <!-- Layout แบ่งซ้ายขวา -->
    <div v-if="activityDetail?.foodVotes?.length" class="registration-split">
      <!-- ฝั่งซ้าย -->
      <div class="registration-left">
        <!-- ส่วนหัวที่ไม่ scroll -->
        <div class="registration-title-center">
          <span class="registration-title-text">ผลการลงทะเบียน</span>
        </div>

        <!-- ส่วนที่ scroll ได้ -->
        <div class="registration-left-scroll">
          <div
            class="registration-info"
            v-for="(item, index) in enrollmentSummary?.activityItemSums"
            :key="index"
          >
            <div class="activity-item-name text">
              {{ activityDetail?.activityItems?.[index]?.name ?? '-' }}
            </div>
            <div class="row" v-for="(major, mIndex) in majorList" :key="mIndex">
              <div class="student-major-block">
                <span class="textEnroll">{{ major.majorName }} </span>
                <span class="number">จำนวน</span>
                <span class="quantity-number">
                  {{
                    item.registeredByMajor?.find((m) => m.majorName === major.majorName)?.count ||
                    '0'
                  }}
                </span>
                <span class="unit">คน</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ฝั่งขวา -->
      <div class="registration-right">
        <div class="info-row">
          <span class="label" style="margin-bottom: 10px">ผลการลงทะเบียน</span>
        </div>
        <div class="registration-info food-scroll">
          <div class="row" v-for="food in activityDetail.foodVotes" :key="food.foodName">
            <span class="textFood">{{ food.foodName }} </span>
            <span class="number">จำนวน</span>
            <span class="quantity-number">{{ food.vote }}</span>
            <span class="unit">คน</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="registration-full">
      <div class="registration-title-center">
        <span class="registration-title-text">ผลการลงทะเบียน</span>
      </div>
      <div class="registration-grid">
        <div
          class="registration-info"
          v-for="(item, index) in enrollmentSummary?.activityItemSums"
          :key="index"
        >
          <div class="activity-item-name text">
            {{ activityDetail?.activityItems?.[index]?.name ?? '-' }}
          </div>
          <div class="row" v-for="(major, mIndex) in majorList" :key="mIndex">
            <div class="student-major-block">
              <span class="textEnroll">{{ major.majorName }} </span>
              <span class="number">จำนวน</span>
              <span class="quantity-number">
                {{
                  item.registeredByMajor?.find((m) => m.majorName === major.majorName)?.count || '0'
                }}
              </span>
              <span class="unit">คน</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.registration-container {
  display: flex;
  flex-direction: column;
  height: 680px;
  border-radius: 12px;
  overflow: hidden;
}

.registration-split {
  display: flex;
  flex: 1;
  width: 100%;
  gap: 20px;
  overflow: hidden;
}

.registration-left,
.registration-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 100%;
  box-sizing: border-box;
  margin-bottom: 50px;
}

.registration-left {
  border-right: 1px solid #ccc;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.registration-left-scroll {
  overflow-y: auto;
  flex: 1;
  /* ซ่อน scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
.registration-left-scroll::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}
.registration-right {
  padding: 20px;
  align-items: flex-start;
}

.info-group-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.activity-name-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.ActivityName {
  font-size: 22px;
  font-weight: semibold;
}

.info-row-header {
  display: flex;
  align-items: center;
  gap: 30px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 30px;
  margin-top: 30px;
  margin-bottom: 10px;
}

.registration-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
}

.food-scroll {
  overflow-y: auto;
  flex-grow: 1;

  /* ซ่อน scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
.food-scroll::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.food-header {
  width: 100%;
  display: flex;
  justify-content: center; /* จัดให้ span อยู่กลางของกล่องฝั่งขวา */
  margin-bottom: 10px;
  margin-top: 30px;
}

.food-header-text {
  white-space: nowrap;
  text-align: right;
  font-size: 20px;
  color: #000;
  text-align: center;
}

.activity-item-name {
  margin-bottom: 8px;
  text-align: left;
}

.student-major-block {
  display: flex;
  align-items: center;
  gap: 30px;
}

.row {
  display: flex;
  align-items: flex-end;
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
.unit,
.text,
.textFood,
.textEnroll,
.number,
.quantity-number {
  font-size: 20px;
  color: #000;
}

.value {
  min-width: 30px;
  text-align: left;
}

.unit {
  text-align: left;
}

.number {
  min-width: 30px;
  text-align: left;
}

.textEnroll {
  min-width: 80px;
  text-align: left;
}

.textFood {
  max-width: 300px;
  min-width: 160px;
  text-align: left;
  margin-left: 30px;
}

.text {
  min-width: 80px;
  text-align: left;
}

.quantity-number {
  min-width: 30px;
  text-align: left;
}
.registration-full {
  padding: 20px;
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.registration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  overflow-y: auto;
}
.registration-container {
  height: 680px;
  overflow-y: hidden; /* เพื่อไม่ให้ซ้อน scrollbar */
}
.registration-full {
  flex: 1;
  overflow-y: auto;
}
.registration-title-center {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  width: 100%;
}

.registration-title-text {
  font-size: 20px;
  padding: 6px 16px;
  border-radius: 4px;
}
</style>
