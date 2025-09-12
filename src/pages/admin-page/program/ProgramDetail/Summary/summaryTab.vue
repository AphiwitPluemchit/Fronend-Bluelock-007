<script setup lang="ts">
import { ref } from 'vue'
import EvaluationTable from './evaluationTable.vue'
import checkInOutDialog from './CheckInOut/checkInOutDialog.vue'
import type { EnrollmentSummary } from 'src/types/program'

const isDialogOpen = ref(false)
const enrollmentSummary = ref<EnrollmentSummary | null>(null)

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
  <div>
    <!-- ฝั่งขวา: ข้อมูล + ตาราง -->
    <div class="registration-details">
      <!-- การ์ดบนสุด -->
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

      <!-- 4 การ์ดที่อยู่ในบรรทัดเดียวกัน -->
      <div class="info-row">
        <q-card class="checkin-card ontime-card">
          <q-card-section class="stat-content">
            <div class="stat-icon">
              <q-icon name="login" size="40px" />
            </div>
            <div class="stat-details">
              <div class="stat-number">{{ enrollmentSummary?.totalRegistered || 0 }}</div>
              <div class="stat-label">จำนวนนิสิตที่เช็คชื่อเข้า</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="checkin-card late-card">
          <q-card-section class="stat-content">
            <div class="stat-icon">
              <q-icon name="schedule" size="40px" />
            </div>
            <div class="stat-details">
              <div class="stat-number">{{ enrollmentSummary?.totalRegistered || 0 }}</div>
              <div class="stat-label">จำนวนนิสิตที่เช็คชื่อสาย</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="checkin-card out-card">
          <q-card-section class="stat-content">
            <div class="stat-icon">
              <q-icon name="logout" size="40px" />
            </div>
            <div class="stat-details">
              <div class="stat-number">{{ enrollmentSummary?.totalRegistered || 0 }}</div>
              <div class="stat-label">จำนวนนิสิตที่เช็คชื่อออก</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="checkin-card missing-card">
          <q-card-section class="stat-content">
            <div class="stat-icon">
              <q-icon name="cancel" size="40px" />
            </div>
            <div class="stat-details">
              <div class="stat-number">{{ enrollmentSummary?.totalRegistered || 0 }}</div>
              <div class="stat-label">จำนวนนิสิตที่ไม่มา</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="image-section">
        <q-btn label="สร้าง QR-Code เช็คชื่อ" @click="showCreateQR_CodeDialog" class="check-in-btn" />
      </div>
      <!-- ตารางผลการประเมิน -->
      <div class="evaluation-container">
        <EvaluationTable />
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
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}
.stat-card {
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  background: #10b981;
  color: white;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}
.checkin-card {
  flex: 1 1 250px;
  max-width: 400px;
  margin-top: 10px;
  margin-bottom: 10px;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.checkin-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}
.info-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
  overflow-x: auto;
  margin-bottom: 24px;
}

.enrolled-card {
  background: #10b981;
  color: white;
}
.ontime-card {
  background: #4169e1;
  color: white;
}
.late-card {
  background: #d6c94e;
  color: white;
}
.out-card {
  background: #2196f3;
  color: white;
}
.missing-card {
  background: #cd5c5c;
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
  font-size: 36px; /* เพิ่มขนาด */
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 16px; /* เพิ่มขนาด */
  opacity: 0.9;
  font-weight: 600;
}

.check-in-btn {
  background-color: #000 !important;
  color: white !important;
  justify-content: flex-end;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
}
</style>

