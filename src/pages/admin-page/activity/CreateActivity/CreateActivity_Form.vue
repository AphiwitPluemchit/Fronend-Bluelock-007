<template>
  <q-page class="q-pa-md">
    <!-- Status -->
    <div class="status-container q-mb-md">
      <p class="label">สถานะ:</p>
      <q-btn label="กำลังวางแผน" class="status-btn" />
    </div>

    <!-- Activity Name -->
    <div class="field-container">
      <p class="label">ชื่อกิจกรรม :</p>
      <q-input outlined v-model="activityName" class="inputBox" />
    </div>

    <!-- Date -->
    <div class="field-container">
      <p class="label">วันที่จัดกิจกรรม :</p>
      <q-input outlined v-model="activityDate" class="inputBox" mask="date">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="activityDate" mask="YYYY-MM-DD" today-btn :locale="thaiLocale" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <!-- Time -->
    <div class="time-container">
      <div class="field-container">
        <p class="label">เวลาเริ่มกิจกรรม :</p>
        <q-input outlined v-model="startTime" class="inputBox">
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="startTime" format24h mask="HH:mm" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="field-container">
        <p class="label">เวลาสิ้นสุดกิจกรรม:</p>
        <q-input outlined v-model="endTime" class="inputBox">
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="startTime" mask="HH:mm:ss" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>

    <!-- Hours -->
    <div class="field-container">
      <p class="label">จำนวนชั่วโมง :</p>
      <q-input outlined v-model="totalHours" class="inputBox" />
    </div>

    <!-- Room -->
    <!-- Seats -->
    <div class="field-container">
      <p class="label">ชื่อห้องที่จัดกิจกรรม :</p>
      <q-input outlined v-model="roomName" class="inputBox" />
      <p class="label">จำนวนที่นั่ง :</p>
      <q-input outlined v-model="seats" class="inputBox" />
    </div>

    <!-- Activity Type -->
    <div class="field-container q-mb-md">
      <p class="label">ประเภทกิจกรรม :</p>
      <q-btn
        :class="{ 'active-btn': activityType === 'prep' }"
        @click="activityType = 'prep'"
        label="ชั่วโมงเตรียมความพร้อม"
        class="activityType-btn"
      />
      <q-btn
        :class="{ 'active-btn': activityType === 'academic' }"
        @click="activityType = 'academic'"
        label="ชั่วโมงทักษะทางวิชาการ"
        class="activityType-btn"
      />
    </div>

    <!-- Department -->
    <div class="field-container q-mb-md">
      <p class="label">สาขา :</p>
      <q-btn
        v-for="option in departmentOptions"
        :key="option.value"
        :class="{ 'active-btn': departments.includes(option.value) }"
        @click="toggleDepartment(option.value)"
        :label="option.label"
        class="department-btn"
      />
    </div>

    <!-- Year -->
    <div class="field-container q-mb-md">
      <p class="label">ชั้นปี :</p>
      <q-btn
        v-for="option in yearOptions"
        :key="option.value"
        :class="{ 'active-btn': years.includes(option.value) }"
        @click="toggleYear(option.value)"
        :label="option.label"
        class="year-btn"
      />
    </div>

    <!-- Lecturer -->
    <div class="field-container">
      <p class="label">วิทยากร :</p>
      <q-input outlined v-model="lecturer" class="inputBox" />
    </div>

    <!-- Food Menu -->
    <div class="field-container">
      <p class="label">รายการอาหาร :</p>
      <q-input outlined v-model="foodMenu" class="inputBox" />
    </div>

    <!-- Detail Activity -->
    <div class="field-container">
      <p class="label" style="align-self: flex-start">รายละเอียดอื่นๆ :</p>
      <q-input outlined v-model="detailActivity" class="inputBox" type="textarea" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ThaiLocale {
  days: string[]
  daysShort: string[]
  months: string[]
  monthsShort: string[]
}

interface ToggleOption {
  label: string
  value: string
}

// Previous refs remain the same
const activityName = ref('')
const activityDate = ref('')
const startTime = ref('')
const endTime = ref('')
const totalHours = ref('')
const roomName = ref('')
const seats = ref('')
const activityType = ref('')
const lecturer = ref('')
const foodMenu = ref('')
const detailActivity = ref('')

// Modified to array refs for multiple selections
const departments = ref<string[]>([])
const years = ref<string[]>([])

// ฟังก์ชันเลือก/ยกเลิก สาขา
const toggleDepartment = (value: string) => {
  if (departments.value.includes(value)) {
    departments.value = departments.value.filter((item) => item !== value)
  } else {
    departments.value.push(value)
  }
}

// ฟังก์ชันเลือก/ยกเลิก ชั้นปี
const toggleYear = (value: string) => {
  if (years.value.includes(value)) {
    years.value = years.value.filter((item) => item !== value)
  } else {
    years.value.push(value)
  }
}

// Thai locale remains the same
const thaiLocale: ThaiLocale = {
  days: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
  daysShort: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
  months: [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ],
  monthsShort: [
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พ.ย.',
    'ธ.ค.',
  ],
}

const departmentOptions: ToggleOption[] = [
  { label: 'CS', value: 'cs' },
  { label: 'SE', value: 'se' },
  { label: 'ITDI', value: 'itdi' },
  { label: 'AAI', value: 'aai' },
]

const yearOptions: ToggleOption[] = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
]
</script>

<style>
.field-container {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.label {
  font-family: 'Noto Serif Thai', serif;
  font-size: 20px;
  margin: 0;
  min-width: 180px;
}

.time-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.inputBox {
  flex-grow: 1;
  border: 1px solid black;
  border-radius: 5px;
  background-color: white;
}

.cursor-pointer {
  cursor: pointer;
}
.status-container {
  display: flex;
  align-items: center; /* จัดให้อยู่ตรงกลางแนวตั้ง */
  gap: 10px; /* กำหนดระยะห่างระหว่างข้อความและปุ่ม */
}
.status-btn {
  color: #ff6f00;
  background-color: #ffe7ba;
  border: 2px solid #ffa500;
  border-radius: 50px;
  height: 40px; /* ปรับความสูงให้เหมาะสม */
  width: 200px;
  font-size: 20px;
}
/* ปุ่ม ประเภทกิจกรรม */
.activityType-btn {
  width: 200px;
  height: 40px;
  border-radius: 50px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  margin-right: 20px;
  background-color: #ffffff;
}
.activityType-btn:last-child {
  margin-right: 0;
}
/* ปุ่ม สาขา */
.department-btn {
  width: 80px;
  height: 40px;
  border-radius: 50px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  margin-right: 10px;
  background-color: #ffffff;
}
.department-btn:last-child {
  margin-right: 0;
}
/* ปุ่ม ชั้นปี */
.year-btn {
  width: 60px;
  height: 40px;
  border-radius: 50px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  margin-right: 10px;
  background-color: #ffffff;
}
.year-btn:last-child {
  margin-right: 0;
}
.active-btn {
  background-color: #d0e4ff !important;
}
</style>
