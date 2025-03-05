<script setup lang="ts">
import { ref } from 'vue';
import EvaluationTable from './EvaluationTable.vue';

// ข้อมูลสรุปการลงทะเบียน
const registrationSummary = ref({
  totalStudents: 165,
  checkIn: 150,
  late: 10,
  checkOut: 160,
  absent: 5
});

// ตัวแปรควบคุมการเปิด-ปิดไดอะล็อก
const isDialogOpen = ref(false);

// ฟังก์ชันเปิดไดอะล็อก
const showCreateQR_CodeDialog = () => {
  isDialogOpen.value = true;
};

// ฟังก์ชันยกเลิก QR-Code
const cancelCreateQR_Code = () => {
  isDialogOpen.value = false;
};

// ฟังก์ชันยืนยัน QR-Code
const confirmCreateQR_Code = () => {
  console.log("QR-Code เช็คชื่อถูกสร้างแล้ว!");
  isDialogOpen.value = false;
};

</script>

<template>
  <div class="summary-container">
    <div class="summary-content">
      <!-- ส่วนรูปภาพ -->
      <div class="image-section">
        <div class="upload-box">
          <q-icon name="image" size="80px" class="image-icon" />
        </div>
        <p class="image-note"></p>
        <q-btn label="เช็คชื่อ" @click="showCreateQR_CodeDialog" class="check-in-btn" />

        <!-- ไดอะล็อกสำหรับสร้าง QR-Code เช็คชื่อ -->
        <q-dialog v-model="isDialogOpen">
          <q-card class="dialog-card">
            <q-card-section class="dialog-title">
              <span>สร้าง QR-Code เช็คชื่อ</span>
            </q-card-section>

            <q-card-section class="dialog-body">
              <q-btn outline label="เช็คชื่อเข้า" class="check-type-btn" />
              <q-btn outline label="เช็คชื่อออก" class="check-type-btn" />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn label="ยกเลิก" color="red" class="cancel-btn" @click="cancelCreateQR_Code" />
              <q-btn label="ยืนยัน" color="blue" class="confirm-btn" @click="confirmCreateQR_Code" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>

      <!-- รายละเอียดการลงทะเบียน -->
      <div class="registration-details">
        <div class="registration-row">
          <span class="label">จำนวนนิสิตที่ลงทะเบียน :</span>
          <span class="value">{{ registrationSummary.totalStudents }}</span>
          <span class="unit">คน</span>
        </div>

        <div class="registration-row">
          <span class="label">ผลการเช็คชื่อ :</span>
        </div>
        <div class="registration-row">
          <span class="sub-label">เช็คชื่อเข้า</span>
          <span class="middle-text">จำนวน</span>
          <span class="value">{{ registrationSummary.checkIn }}</span>
          <span class="unit">คน</span>
        </div>

        <div class="registration-row">
          <span class="sub-label">เช็คชื่อสาย</span>
          <span class="middle-text">จำนวน</span>
          <span class="value">{{ registrationSummary.late }}</span>
          <span class="unit">คน</span>
        </div>

        <div class="registration-row">
          <span class="sub-label">เช็คชื่อออก</span>
          <span class="middle-text">จำนวน</span>
          <span class="value">{{ registrationSummary.checkOut }}</span>
          <span class="unit">คน</span>
        </div>

        <div class="registration-row">
          <span class="sub-label">ไม่มา</span>
          <span class="middle-text">จำนวน</span>
          <span class="value">{{ registrationSummary.absent }}</span>
          <span class="unit">คน</span>
        </div>
      </div>
    </div>
    <EvaluationTable />
  </div>
</template>

<style scoped>
.summary-container {
  padding: 20px;
  background-color: #F4F6F9;
  border-radius: 8px;
}

/* โครงสร้างเนื้อหาสรุป */
.summary-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

/* รายละเอียดการลงทะเบียน */
.registration-details {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  margin-top: 20px;
}

.registration-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.label {
  font-weight: bold;
  min-width: 220px;
  text-align: right;
}

.sub-label {
  min-width: 120px;
  text-align: right;
}

.middle-text {
  min-width: 80px;
  text-align: right;
}

.value {
  font-weight: bold;
  min-width: 40px;
  text-align: center;
}

.unit {
  min-width: 40px;
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
  background-color: #D9D9D9;
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
  background-color: #f5f5f5;
  color: black;
  border-radius: 8px;
  font-size: 16px;
  padding: 10px 20px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}

/* ไดอะล็อก */
.dialog-card {
  width: 400px;
  padding: 20px;
  text-align: center;
}

.dialog-title {
  font-size: 18px;
  font-weight: bold;
}

/* ปุ่มเลือกประเภทเช็คชื่อ */
.check-type-btn {
  display: block;
  width: 100%;
  margin: 10px 0;
  font-size: 16px;
  border: 1px solid black;
}

/* ปุ่มยกเลิกและยืนยัน */
.cancel-btn {
  background-color: #d9534f;
  color: white;
  font-size: 14px;
}

.confirm-btn {
  background-color: #007bff;
  color: white;
  font-size: 14px;
}
</style>
