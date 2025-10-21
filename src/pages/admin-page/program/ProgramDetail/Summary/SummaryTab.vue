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
const selectProgramItemDate = ref<string>('')

const program = ref<Program | null>(null)
interface ProgramRow {
  _id: string
  name: string
  formId?: string | null
}
const query = ref<Pagination>({ date: '' })
const isDialogOpen = ref(false)
const enrollmentSummary = ref<EnrollmentSummary | null>(null)

const rows = ref<ProgramRow[]>([])
const programItemDatesOptions = computed(() => {
  const items = program.value?.programItems ?? []
  const dates = items.flatMap((it) => (it.dates ?? []).map((d) => d.date).filter(Boolean))
  const uniq = Array.from(new Set(dates)).sort()
  return uniq.map((d) => ({ label: d, value: d }))
})

const showCreateQR_CodeDialog = () => (isDialogOpen.value = true)
const cancelCreateQR_Code = () => (isDialogOpen.value = false)
const confirmCreateQR_Code = () => console.log('QR-Code เช็คชื่อถูกสร้างแล้ว!')

const canShowCheckInBtn = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  return programItemDatesOptions.value.some((o) => dayjs(String(o.value)).format('YYYY-MM-DD') === today)
})

async function setDefaultDate() {
  const res = await ProgramService.getOne(programId)
  program.value = res.data
  buildRows()
  const opts = programItemDatesOptions.value
  if (!opts.length) return
  const today = dayjs().format('YYYY-MM-DD')
  const foundToday = opts.find((o) => o.value === today)
  selectProgramItemDate.value = foundToday ? foundToday.value : opts[0]!.value
}

const fetchSamaryEnrollment = async () => {
  query.value.date = selectProgramItemDate.value
  const resSum = await SammaryReportService.getSamaryEnrollment(programId, query.value.date)
  enrollmentSummary.value = resSum.data
}

const buildRows = () => {
  const items = program.value?.programItems ?? []
  rows.value = items.map((it) => ({
    _id: it.id || crypto.randomUUID(),
    name: it.name || '—',
    formId: program.value?.formsId ?? null,
  }))
}

onMounted(async () => {
  await setDefaultDate()
  await fetchSamaryEnrollment()
})
</script>

<template>
  <div class="summary-container">

    <!-- ตัวกรองวัน -->
    <div class="row form-toolbar ">
      <!-- <div class=" textsubtitle">{{ program?.name || 'กำลังโหลด...' }}</div> -->

      <div class="program-header">
        <div class="program-title">
          <div class="textsubtitle">{{ program?.name || 'Loading...' }}</div>
        </div>
      </div>
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
        behavior="menu"
      />
    </div>

    <!-- ✅ การ์ดแถวเดียว 5 ใบ -->
    <div class="row cards-row ">
      <q-card class="summary-card green">
        <q-card-section class="card-content">
          <div class="label">ลงทะเบียน</div>
          <div class="number">{{ enrollmentSummary?.registered || 0 }}</div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card blue">
        <q-card-section class="card-content">
          <div class="label">เช็คชื่อเข้า</div>
          <div class="number">{{ enrollmentSummary?.checkin || 0 }}</div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card orange">
        <q-card-section class="card-content">
          <div class="label">เช็คชื่อสาย</div>
          <div class="number">{{ enrollmentSummary?.checkinLate || 0 }}</div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card brown">
        <q-card-section class="card-content">
          <div class="label">เช็คชื่อออก</div>
          <div class="number">{{ enrollmentSummary?.checkout || 0 }}</div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card red">
        <q-card-section class="card-content">
          <div class="label">ไม่มา</div>
          <div class="number">{{ enrollmentSummary?.notParticipating || 0 }}</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- ปุ่มสร้าง QR Code -->
    <div class="image-section">
      <q-btn
        v-if="canShowCheckInBtn"
        label="สร้าง QR-Code เช็คชื่อ"
        icon="qr_code"
        @click="showCreateQR_CodeDialog"
        class="check-in-btn"
      />
    </div>

    <!-- ตารางผลการประเมิน -->
    <div class="evaluation-container">
      <EvaluationTable v-if="program" :program="program" />
    </div>
  </div>

  <checkInOutDialog
    v-model="isDialogOpen"
    @cancel="cancelCreateQR_Code"
    @confirm="confirmCreateQR_Code"
  />
</template>

<style lang="scss" scoped>
.summary-container {
  height: calc(80vh - 150px);
  width: 100%;
}
.program-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}
.program-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
/* ส่วนหัว */
.form-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

/* ✅ แถวการ์ด 5 ใบ */
.cards-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.summary-card {
  flex: 1 1 calc(20% - 16px);
  min-width: 200px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  color: #333;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 140px;
  position: relative;
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  align-items: center;
  position: relative;
  text-align: center;
  padding: 16px;
}

/* ข้อความหัวมุมบนซ้าย (สีดำ) */
.label {
  position: absolute;
  top: 12px;
  left: 16px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #000;
}

/* ตัวเลขกลางการ์ด */
.number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-top: auto;
  margin-bottom: auto;
}

/* สีตัวเลขแต่ละการ์ด */
.green .number {
  color: #16a34a;
}
.blue .number {
  color: #2563eb;
}
.orange .number {
  color: #f59e0b;
}
.red .number {
  color: #dc2626;
}
.brown .number {
  color: #92400e;
}

/* ปุ่มสร้าง QR Code */
.image-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  margin-bottom: 24px;
}
.check-in-btn {
  background-color: #000 !important;
  color: white !important;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 1024px) {
  .summary-card {
    flex: 1 1 calc(50% - 16px);
  }
}
@media (max-width: 640px) {
  .summary-card {
    flex: 1 1 100%;
  }
}
</style>
