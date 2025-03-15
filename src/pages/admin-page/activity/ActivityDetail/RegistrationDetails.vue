<script setup lang="ts">
import { ActivityService } from 'src/services/activity'
import type { EnrollmentSummary } from 'src/types/activity'
import { onMounted, ref } from 'vue'
// import { useRoute } from 'vue-router';

// const route = useRoute();
// const activityId = route.params.activityId as string;

const activityId = '67cd9fc07f71d9f9edc32cb0'

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

onMounted(async () => {
  await fetchEnrollmentSummary()
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
      <div
        class="info-row"
        v-if="enrollmentSummary?.activityItemSums?.some((item) => item.activityItemName)"
      >
        <div class="registration-info">
          <div
            class="row"
            v-for="item in enrollmentSummary.activityItemSums"
            :key="item.activityItemName"
          >
            <span class="label">ผลการลงทะเบียน &nbsp; {{ item.activityItemName }} :</span>
            <div
              class="row q-gutter-x-sm"
              v-for="major in item.registeredByMajor"
              :key="major.majorName"
            >
              <span class="text">นิสิตสาขา &nbsp; {{ major.majorName }}</span>
              <span class="number">{{ major.count || '-' }}</span>
              <span class="unit">คน</span>
            </div>
          </div>
        </div>
      </div>

      <!-- กรณีที่ไม่มี activityItemName แต่มีข้อมูลนิสิต -->
      <div
        class="info-row"
        v-else-if="enrollmentSummary?.activityItemSums?.[0]?.registeredByMajor?.length"
      >
        <span class="label">ผลการลงทะเบียนนิสิต :</span>
        <div class="registration-info">
          <div
            class="row"
            v-for="major in enrollmentSummary.activityItemSums[0].registeredByMajor"
            :key="major.majorName"
          >
            <span class="text">นิสิตสาขา {{ major.majorName }}</span>
            <span class="number">{{ major.count || '-' }}</span>
            <span class="unit">คน</span>
          </div>
        </div>
      </div>

      <!-- กรณีไม่มีข้อมูลเลย -->
      <div class="info-row" v-else>
        <span class="label">ผลการลงทะเบียนนิสิต :</span>
        <span class="text">ไม่มีข้อมูลการลงทะเบียนนิสิตสำหรับกิจกรรมนี้</span>
      </div>

      <!-- แสดงเฉพาะเมื่อ foodSelections มีข้อมูล -->
      <!-- <div class="info-row" v-if="foodSelections.length > 0">
                <span class="label">ผลการเลือกอาหาร :</span>
                <div class="registration-info">
                    <div class="row" v-for="food in foodSelections" :key="food.name">
                        <span class="major">{{ food.name }}</span>
                        <span class="text">จำนวน</span>
                        <span class="number">{{ food.count }}</span>
                        <span class="unit">คน</span>
                    </div>
                </div>
            </div> -->

      <!-- แสดงข้อความเมื่อไม่มีข้อมูลการเลือกอาหาร -->
      <!-- <div class="info-row" v-else>
                <span class="label">ผลการเลือกอาหาร :</span>
                <span class="text">ไม่มีข้อมูลการเลือกอาหารสำหรับกิจกรรมนี้</span>
            </div> -->
    </div>
  </div>
</template>

<style scoped>
.registration-container {
  display: flex;
  align-items: flex-start;
  gap: 120px;
  background-color: #edf0f5;
  border-radius: 12px;
  height: 680px;
  overflow: hidden;
  margin-left: 60px;
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
  margin-left: 100px;
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
  gap: 30px;
  /* flex-wrap: nowrap; */
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 30px;
  margin-top: 50px;
  flex-wrap: nowrap;
  /* ป้องกันการขึ้นบรรทัดใหม่ */
}

.row {
  display: flex;
  align-items: center;
  gap: 30px;
}

.number {
  text-align: left;
}

.label {
  white-space: nowrap;
  text-align: right;
  margin-right: 10px;
  min-width: 320px;
}

.value {
  min-width: 30px;
  text-align: left;
  /* เพิ่มระยะห่างระหว่างตัวเลขกับหน่วย */
}

.unit {
  min-width: 30px;
  text-align: left;
}

.text {
  min-width: 50px;
  text-align: left;
}

.label,
.value,
.unit,
.text,
.number {
  /* font-weight: 500; */
  font-size: 20px;
  color: #000000;
}
</style>
