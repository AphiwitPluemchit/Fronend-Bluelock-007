<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import EvaluationTable from './evaluationTable.vue'
import checkInOutDialog from './CheckInOut/checkInOutDialog.vue'
import type { EnrollmentSummary } from 'src/types/program'
import type { Program } from 'src/types/program'
import type { Pagination } from 'src/types/pagination'
import { ProgramService } from 'src/services/program'
import { useRoute } from 'vue-router'
import { SammaryReportService } from 'src/services/summary-report'
import dayjs from 'dayjs'

const route = useRoute()
const programId = route.params.id as string
const selectProgramItemDate = ref<string>('') // เดิม: ref(-1)

const program = ref<Program | null>(null)
// ตัวอย่าง type ของแถว (ให้ตรงกับที่ EvaluationTable ใช้)
interface ProgramRow {
  _id: string
  name: string
  formId?: string | null
  // ...field อื่นๆตามจริง
}
const query = ref<Pagination>({
  date: '',
})
const isDialogOpen = ref(false)
const enrollmentSummary = ref<EnrollmentSummary | null>(null)

// ✅ เตรียม rows ให้ตาราง
const rows = ref<ProgramRow[]>([])
const programItemDatesOptions = computed(() => {
  const items = program.value?.programItems ?? []
  const dates = items.flatMap((it) => (it.dates ?? []).map((d) => d.date).filter(Boolean))
  const uniq = Array.from(new Set(dates)).sort()
  return uniq.map((d) => ({ label: d, value: d }))
})

const showCreateQR_CodeDialog = () => {
  isDialogOpen.value = true
}
const cancelCreateQR_Code = () => {
  isDialogOpen.value = false
}
const confirmCreateQR_Code = () => {
  console.log('QR-Code เช็คชื่อถูกสร้างแล้ว!')
}
async function setDefaultDate() {
  const res = await ProgramService.getOne(programId)
  program.value = res.data
  const opts = programItemDatesOptions.value
  if (!opts.length) return

  const today = dayjs().format('YYYY-MM-DD')
  const foundToday = opts.find((o) => o.value === today)

  if (foundToday) {
    selectProgramItemDate.value = foundToday.value
  } else {
    selectProgramItemDate.value = opts[0]!.value // วันแรกในรายการ
  }
}

const fetchSamaryEnrollment = async () => {


  // ส่ง date ตรง ๆ (ไม่มี -1/ค่าว่างแล้ว)
  query.value.date = selectProgramItemDate.value

  const resSum = await SammaryReportService.getSamaryEnrollment(programId, query.value.date)
  enrollmentSummary.value = resSum.data
}

onMounted(async () => {
  // ตั้ง default แค่ตอนเปิด/หลังโหลด (ไม่ไปยุ่ง flow อื่น)
  await setDefaultDate()
  await fetchSamaryEnrollment()
  // TODO: โหลดข้อมูลจริงจาก API ของคุณ แล้วเซ็ตให้ rows.value
  rows.value = [
    { _id: '1', name: 'อบรมความรู้พื้นฐานด้าน AI', formId: '68d454e6db8ab09a41f75c55' },
    { _id: '2', name: 'Workshop Vue + Quasar', formId: null },
  ]
})
</script>

<template>
  <div>
    <div class="row q-col-gutter-sm form-toolbar q-mb-md">
      <div class="select-filter-row">
        <q-select
          v-if="programItemDatesOptions.length > 0"
          dense
          outlined
          v-model="selectProgramItemDate"
          :options="programItemDatesOptions"
          label="เลือกวัน"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          @update:model-value="fetchSamaryEnrollment"
          class="dropdown"
          popup-content-class="dropdown-menu"
          :style="{ border: 'none' }"
          behavior="menu"
        />
      </div>
    </div>
    <!-- ฝั่งขวา: ข้อมูล + ตาราง -->
    <div class="registration-details">
      <!-- การ์ดบนสุด -->
      <q-card class="stat-card enrolled-card">
        <q-card-section class="stat-content">
          <div class="stat-icon">
            <q-icon name="how_to_reg" size="40px" />
          </div>
          <div class="stat-details">
            <div class="stat-number">{{ enrollmentSummary?.registered || 0 }}</div>
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
              <div class="stat-number">{{ enrollmentSummary?.checkin || 0 }}</div>
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
              <div class="stat-number">{{ enrollmentSummary?.checkinLate || 0 }}</div>
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
              <div class="stat-number">{{ enrollmentSummary?.checkout || 0 }}</div>
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
              <div class="stat-number">{{ enrollmentSummary?.notParticipating || 0 }}</div>
              <div class="stat-label">จำนวนนิสิตที่ไม่มา</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="image-section">
        <q-btn
          label="สร้าง QR-Code เช็คชื่อ"
          @click="showCreateQR_CodeDialog"
          class="check-in-btn"
        />
      </div>
      <!-- ตารางผลการประเมิน -->
      <div class="evaluation-container">
        <EvaluationTable :rows="rows" />
      </div>
    </div>
  </div>

  <checkInOutDialog
    v-model="isDialogOpen"
    @cancel="cancelCreateQR_Code"
    @confirm="confirmCreateQR_Code"
  />
</template>

<style lang="scss" scoped>
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
.select-filter-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.form-toolbar {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}
.dropdown-menu {
  max-width: 300px !important;
  width: 100% !important;
  box-sizing: border-box;
}
</style>
