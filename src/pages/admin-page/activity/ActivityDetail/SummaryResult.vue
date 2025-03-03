<script setup lang="ts">
import { ref } from 'vue';

// ข้อมูลสรุปการลงทะเบียน
const registrationSummary = ref({
  totalStudents: 165,
  checkIn: 150,
  late: 10,
  checkOut: 160,
  absent: 5
});

// ข้อมูลการประเมินผลความพึงพอใจ
const evaluationResults = ref([
  { id: "1.1", topic: "ความรู้และความเข้าใจในเรื่องเนื้อหากิจกรรม", most: 47, high: 31, medium: 24, low: 3, lowest: 0, avg: 3.42 },
  { id: "1.2", topic: "ความรู้และความเข้าใจในเรื่องเนื้อหากิจกรรม", most: 63, high: 13, medium: 6, low: 2, lowest: 0, avg: 4.12 },
  { id: "1.3", topic: "ท่านได้รับความรู้ แนวคิด ประสบการณ์ใหม่จากโครงการ", most: 63, high: 13, medium: 6, low: 1, lowest: 0, avg: 4.65 },
  { id: "1.4", topic: "ท่านสามารถนำสิ่งที่ได้รับจากโครงการไปใช้ประโยชน์ในการปฏิบัติงานได้", most: 24, high: 24, medium: 6, low: 0, lowest: 0, avg: 4.65 },
  { id: "1.5", topic: "รูปแบบและวิธีการกิจกรรมมีความเหมาะสมกับสถานการณ์ปัจจุบัน", most: 34, high: 24, medium: 1, low: 0, lowest: 0, avg: 3.42 }
]);

// ตัวแปรควบคุมการเปิด-ปิดไดอะล็อก
const isDialogOpen = ref(false);

// ฟังก์ชันเปิดไดอะล็อก
const openDialog = () => {
  isDialogOpen.value = true;
};

// ฟังก์ชันปิดไดอะล็อก
const closeDialog = () => {
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
        <q-btn label="เช็คชื่อ" @click="openDialog" class="check-in-btn" />
        <!-- ไดอะล็อก -->
        <q-dialog v-model="isDialogOpen">
          <q-card class="dialog-card">
            <q-card-section class="dialog-title">
              <span>สร้าง <strong>QR-Code</strong> เช็คชื่อ</span>
            </q-card-section>

            <q-card-section class="dialog-body">
              <q-btn outline label="เช็คชื่อเข้า" class="check-type-btn" />
              <q-btn outline label="เช็คชื่อออก" class="check-type-btn" />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn label="ยกเลิก" color="red" class="cancel-btn" @click="closeDialog" />
              <q-btn label="ยืนยัน" color="blue" class="confirm-btn" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>

      <!-- รายละเอียดการลงทะเบียน -->
      <div class="registration-details">
        <p>จำนวนนิสิตที่ลงทะเบียน : {{ registrationSummary.totalStudents }} คน</p>

        <p><strong>ผลการเช็คชื่อ :</strong></p>
        <p>เช็คชื่อเข้า : <span class="number">{{ registrationSummary.checkIn }}</span> คน</p>
        <p>เช็คชื่อสาย : <span class="number">{{ registrationSummary.late }}</span> คน</p>
        <p>เช็คชื่อออก : <span class="number">{{ registrationSummary.checkOut }}</span> คน</p>
        <p>ไม่มา : <span class="number">{{ registrationSummary.absent }}</span> คน</p>
      </div>
    </div>

    <!-- ตารางผลการประเมิน -->
    <h3 class="evaluation-title">ผลการประเมิน</h3>
    <table class="evaluation-table">
      <thead>
        <tr>
          <th>ข้อ</th>
          <th>หัวข้อความพึงพอใจ</th>
          <th>มากที่สุด</th>
          <th>มาก</th>
          <th>ปานกลาง</th>
          <th>น้อย</th>
          <th>น้อยที่สุด</th>
          <th>ค่าเฉลี่ย</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="result in evaluationResults" :key="result.id">
          <td>{{ result.id }}</td>
          <td>{{ result.topic }}</td>
          <td>{{ result.most }}</td>
          <td>{{ result.high }}</td>
          <td>{{ result.medium }}</td>
          <td>{{ result.low }}</td>
          <td>{{ result.lowest }}</td>
          <td>{{ result.avg }}</td>
        </tr>
      </tbody>
    </table>
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

.check-in-btn {
  margin-top: 10px;
  background-color: #E0E0E0;
  color: black;
}

/* รายละเอียดการลงทะเบียน */
.registration-details {
  text-align: left;
  font-size: 16px;
}

.number {
  font-weight: bold;
  color: #333;
}

/* ตารางผลการประเมิน */
.evaluation-title {
  margin-top: 30px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.evaluation-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.evaluation-table th,
.evaluation-table td {
  border: 1px solid #000;
  padding: 8px;
  text-align: center;
}

.evaluation-table th {
  background-color: #D9D9D9;
  font-weight: bold;
}

.evaluation-table td {
  background-color: #FFF;
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
