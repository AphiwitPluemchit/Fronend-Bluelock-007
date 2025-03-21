<script setup lang="ts">
import { ActivityService } from 'src/services/activity'
import type { Activity, EnrollmentSummary } from 'src/types/activity'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router';

const route = useRoute();
const activityId = route.params.id as string;

const getImagePath = (fileName: string | undefined | null) => {
  if (!fileName) {
    return '/default-placeholder.jpg' // ถ้าไม่มีไฟล์
  }
  return `http://127.0.0.1:8888/uploads/activity/images/${fileName}`
}

const enrollmentSummary = ref<EnrollmentSummary | null>(null)

const majorList = [
  { majorName: 'CS' },
  { majorName: 'SE' },
  { majorName: 'AAI' },
  { majorName: 'ITDI' },
];

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

    // console.log('🖼️ file name:', activityDetail.value?.file)
    // console.log('🌐 Full Path:', getImagePath(activityDetail.value?.file))

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
    <!-- แสดงรูปภาพที่เลือกไว้ -->
    <q-img :src="getImagePath(activityDetail?.file)" class="registration-image" error-src="/default-placeholder.jpg" />

    <!-- รายละเอียดข้อมูล -->
    <div class="registration-details">
      <div class="info-group-header">
        <div class="info-row-header">
          <span class="label">จำนวนที่รับ :</span>
          <span class="value">{{ enrollmentSummary?.maxParticipants || 0 }}</span>
          <span class="unit">คน</span>
        </div>
        <div class="info-row-header">
          <span class="label">จำนวนนิสิตที่ลงทะเบียน :</span>
          <span class="value">{{ enrollmentSummary?.totalRegistered || 0 }}</span>
          <span class="unit">คน</span>
        </div>
        <div class="info-row-header">
          <span class="label">จำนวนที่ว่าง :</span>
          <span class="value">{{ enrollmentSummary?.remainingSlots || 0 }}</span>
          <span class="unit">คน</span>
        </div>
      </div>

      <!-- มีข้อมูล -->
      <div v-if="enrollmentSummary?.activityItemSums?.some((item) => item.activityItemName)">

        <!-- Label -->
        <div class="info-row">
          <span class="label">ผลการลงทะเบียน</span>
        </div>

        <!-- Loop activityItem -->
        <div class="registration-info" v-for="(item, index) in enrollmentSummary.activityItemSums" :key="index">

          <!-- Loop major -->
          <div class="row" v-for="(major, mIndex) in majorList" :key="mIndex">

            <div class="activity-name-block">
              <span v-if="mIndex === 0" class="activity-name">{{ item.activityItemName }} :</span>
              <span v-else class="activity-name-placeholder"></span>
            </div>

            <div class="student-major-block">
              <span class="text">นิสิตสาขา &nbsp; {{ major.majorName }}</span>
              <span class="number">จำนวน</span>
              <span class="quantity-number">
                {{
                  item.registeredByMajor?.find(m => m.majorName === major.majorName)?.count || '0'
                }}
              </span>
              <span class="unit">คน</span>
            </div>
          </div>
        </div>

        <!-- อาหาร -->
        <div class="info-row" v-if="activityDetail?.foodVotes?.length">
          <span class="label">ผลการเลือกอาหาร :</span>
          <div class="registration-info">
            <div class="row" v-for="food in activityDetail.foodVotes" :key="food.foodName">
              <span class="text">{{ food.foodName }}</span>
              <span class="number">จำนวน</span>
              <span class="quantity-number">{{ food.vote }}</span>
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
  align-items: flex-start;
  background-color: #edf0f5;
  border-radius: 12px;
  height: 680px;
  overflow: hidden;
}

.registration-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
}

.registration-details::-webkit-scrollbar {
  width: 8px;
  margin-right: 50px;
}

.registration-image {
  width: 430px;
  height: 330px;
  background-color: #d9d9d9;
  border-radius: 12px;
  margin-left: 40px;
}

.registration-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-name {
  min-width: 20px;
}

.activity-name-placeholder {
  min-width: 500px;
  /* ขนาดเท่ากับ .activity-name */
  display: inline-block;
}

.activity-name-block {
  min-width: 500px;
  display: inline-block;
  text-align: right;
}

.info-group-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
  /* flex-wrap: nowrap; */
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-top: 50px;
  flex-wrap: nowrap;
  /* ป้องกันการขึ้นบรรทัดใหม่ */
  margin-bottom: 10px;
}

.student-major-block {
  display: flex;
  align-items: center;
  gap: 20px;
}

.row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.number {
  min-width: 30px;
  text-align: left;
}

.label {
  white-space: nowrap;
  text-align: right;
  min-width: 500px;
}

.value {
  min-width: 30px;
  text-align: left;
  /* เพิ่มระยะห่างระหว่างตัวเลขกับหน่วย */
}

.unit {
  text-align: left;
}

.text {
  min-width: 180px;
  text-align: left;
  margin-right: 20px;
}

.quantity-number {
  min-width: 30px;
  text-align: left;
}

.label,
.value,
.unit,
.text,
.number,
.quantity-number,
.activity-name-block {
  /* font-weight: 500; */
  font-size: 20px;
  color: #000000;
}
</style>
