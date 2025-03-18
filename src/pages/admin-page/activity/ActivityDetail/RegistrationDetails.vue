<script setup lang="ts">
import { ActivityService } from 'src/services/activity'
import type { Activity, EnrollmentSummary } from 'src/types/activity'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router';

const route = useRoute();
const activityId = route.params.id as string;

// โหลดรูปจาก Local Storage (ถ้ามี)
const savedImageUrl = ref(localStorage.getItem('savedImageUrl') || '')

const enrollmentSummary = ref<EnrollmentSummary | null>(null)

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
    <!-- แสดงรูปภาพที่เลือกไว้ -->
    <q-img :src="savedImageUrl || 'path_to_placeholder_image'" class="registration-image" />

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

      <!-- กรณีที่มี activityItemName -->
      <div class="info-row" v-if="enrollmentSummary?.activityItemSums?.some((item) => item.activityItemName)">
        <div class="registration-info">
          <div class="row" v-for="item in enrollmentSummary.activityItemSums" :key="item.activityItemName">
            <span class="label">ผลการลงทะเบียน &nbsp; {{ item.activityItemName }} :</span>
            <div class="row" v-for="major in item.registeredByMajor" :key="major.majorName">
              <span class="text">นิสิตสาขา &nbsp; {{ major.majorName }}</span>
              <span class="number">จำนวน</span>
              <span class="quantity-number">{{ major.count || '-' }}</span>
              <span class="unit">คน</span>
            </div>
          </div>
        </div>
      </div>

      <!-- กรณีที่ไม่มี activityItemName แต่มีข้อมูลนิสิต -->
      <div class="info-row" v-else-if="enrollmentSummary?.activityItemSums?.[0]?.registeredByMajor?.length">
        <span class="label">ผลการลงทะเบียนนิสิต :</span>
        <div class="registration-info">
          <div class="row" v-for="major in enrollmentSummary.activityItemSums[0].registeredByMajor"
            :key="major.majorName">
            <span class="text">นิสิตสาขา &nbsp; {{ major.majorName }}</span>
            <span class="number">จำนวน</span>
            <span class="quantity-number">{{ major.count || '-' }}</span>
            <span class="unit">คน</span>
          </div>
        </div>
      </div>

      <!-- กรณีไม่มีข้อมูลเลย -->
      <div class="info-row" v-else>
        <span class="label">ผลการลงทะเบียนนิสิต :</span>
        <span class="text">ไม่มีข้อมูลการลงทะเบียนนิสิตสำหรับกิจกรรมนี้</span>
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
</template>

<style scoped>
.registration-container {
  display: flex;
  align-items: flex-start;
  gap: 20px;
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
  min-width: 270px;
  text-align: left;
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
.quantity-number {
  /* font-weight: 500; */
  font-size: 20px;
  color: #000000;
}
</style>
