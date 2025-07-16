<script setup lang="ts">
import { ref } from 'vue'
import EvaluationTable from './EvaluationTable.vue'
import checkInOutDialog from './CheckInOut/checkInOutDialog.vue'

const isDialogOpen = ref(false)
// ข้อมูลสรุปการลงทะเบียน
const registrationSummary = ref({
  totalStudents: 165,
  checkIn: 150,
  late: 10,
  checkOut: 160,
  absent: 5,
})

// เปิด dialog → รีเซตค่า
const showCreateQR_CodeDialog = () => {
  isDialogOpen.value = true
}

// ยกเลิก → ปิด + รีเซตค่า
const cancelCreateQR_Code = () => {
  isDialogOpen.value = false
}

// ยืนยัน
const confirmCreateQR_Code = () => {
  console.log('QR-Code เช็คชื่อถูกสร้างแล้ว!')
  // isDialogOpen.value = false
  // selectedCheckType.value = ''
}
</script>

<template>
  <div class="summary-container">
    <div class="summary-content">
      <!-- ส่วนรูปภาพ (ซ้าย) -->
      <div class="image-section">
        <p class="image-note"></p>
        <q-btn label="เช็คชื่อ" @click="showCreateQR_CodeDialog" class="check-in-btn" />

        <!-- ไดอะล็อกสำหรับสร้าง QR-Code เช็คชื่อ -->
      </div>

      <!-- ฝั่งขวา: ข้อมูล + ตาราง -->
      <div class="details-section">
        <!-- รายละเอียดการลงทะเบียน -->
        <div class="registration-details">
          <div class="registration-row">
            <span class="label">จำนวนนิสิตที่ลงทะเบียน :</span>
            <span class="value">{{ registrationSummary.totalStudents }}</span>
            <span class="unit">คน</span>
          </div>

          <!-- ผลการเช็คชื่อ -->
          <div class="info-row">
            <div class="registration-info">
              <!-- แถวแรก -->
              <div class="row">
                <span class="label">ผลการเช็คชื่อ :</span>
                <span class="sub-label">เช็คชื่อเข้า</span>
                <span class="text">จำนวน</span>
                <span class="number">{{ registrationSummary.checkIn }}</span>
                <span class="unit">คน</span>
              </div>

              <!-- แถวอื่น ให้เว้นช่อง label -->
              <div class="row">
                <span class="label">&nbsp;</span>
                <!-- ช่องว่าง -->
                <span class="sub-label">เช็คชื่อสาย</span>
                <span class="text">จำนวน</span>
                <span class="number">{{ registrationSummary.late }}</span>
                <span class="unit">คน</span>
              </div>

              <div class="row">
                <span class="label">&nbsp;</span>
                <!-- ช่องว่าง -->
                <span class="sub-label">เช็คชื่อออก</span>
                <span class="text">จำนวน</span>
                <span class="number">{{ registrationSummary.checkOut }}</span>
                <span class="unit">คน</span>
              </div>

              <div class="row">
                <span class="label">&nbsp;</span>
                <!-- ช่องว่าง -->
                <span class="sub-label">ไม่มา</span>
                <span class="text">จำนวน</span>
                <span class="number">{{ registrationSummary.absent }}</span>
                <span class="unit">คน</span>
              </div>
            </div>
          </div>

          <!-- ตารางผลการประเมิน -->
          <div class="evaluation-container">
            <EvaluationTable />
          </div>
        </div>
      </div>
    </div>
  </div>
  <checkInOutDialog
    v-model="isDialogOpen"
    @cancel="cancelCreateQR_Code"
    @confirm="confirmCreateQR_Code"
  />
</template>

<style scoped>
.summary-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 50px;
  background-color: #edf0f5;
  padding: 30px;
  border-radius: 12px;
  height: 680px;
}

/* ตารางสามารถเลื่อนขึ้นลงได้ */
.evaluation-container {
  width: 100%;
  margin-top: 20px;
  /* เว้นระยะห่างจากข้อมูลเช็คชื่อ */
}

/* โครงสร้างเนื้อหาสรุป */
.summary-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 200px;
}

/* รายละเอียดการลงทะเบียน */
.registration-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.details-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 10px;
}

.details-section::-webkit-scrollbar {
  width: 0px;
  /* Hide scrollbar */
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: nowrap;
  /* ป้องกันการขึ้นบรรทัดใหม่ */
}

.registration-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.registration-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-top: 10px;
  flex-wrap: nowrap;
}

.sub-label {
  min-width: 120px;
  text-align: left;
  gap: 20px;
}

.row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 30px;
}

.label {
  white-space: nowrap;
  text-align: right;
  margin-right: px;
  /* min-width: 180px; */
  min-width: 200px;
}

.value,
.unit,
.text,
.number {
  min-width: 40px;
  text-align: left;
}

.label,
.sub-label,
.value,
.unit,
.text,
.number {
  font-weight: 500;
  font-size: 20px;
  color: #000000;
}

/* ส่วนรูปภาพ */
.image-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-box {
  width: 430px;
  height: 330px;
  background-color: #d9d9d9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-note {
  color: red;
  font-size: 12px;
  margin-top: 5px;
}

/* ปุ่มเช็คชื่อ */
.check-in-btn {
  background-color: #d9d9d9;
  color: black;
  border-radius: 8px;
  font-size: 16px;
  padding: 10px 16px;
  align-self: flex-start;
  margin-right: auto;
  /* box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1); */
}

/* ไดอะล็อก */
.dialog-card {
  width: 400px;
  padding: 10px;
  text-align: left;
  border-radius: 8px;
}

.dialog-title {
  font-size: 20px;
}

.dialog-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

/* ปุ่มเลือกประเภทเช็คชื่อ */
.check-type-btn {
  display: block;
  width: 60%;
  margin: 10px 0;
  font-size: 16px;
  border-radius: 12px;
  border: 2px solid black;
  transition: background-color 0.2s ease;
}

.action-buttons {
  justify-content: flex-end;
  gap: 5px;
}

/* ปุ่มยกเลิกและยืนยัน */
.cancel-btn {
  background-color: #f03b2d;
  color: white;
  height: 40px;
  min-width: 70px;
  border-radius: 10px;
}

.confirm-btn {
  background-color: #3676f4;
  color: white;
  height: 40px;
  min-width: 70px;
  border-radius: 10px;
}
</style>
