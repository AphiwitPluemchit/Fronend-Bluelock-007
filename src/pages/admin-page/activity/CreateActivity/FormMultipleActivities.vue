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
      <q-input outlined v-model="activityDateInput" class="inputBox" mask="date">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="internalDate" mask="DD/MM/YYYY" today-btn @input="handleDateInput" />
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
    <div class="field-container" style="width: 404px; display: flex">
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
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import buddhistEra from 'dayjs/plugin/buddhistEra'

dayjs.extend(buddhistEra)

interface ToggleOption {
  label: string
  value: string
}

// Previous refs remain the same
const activityName = ref('')

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
const activityDateInput = ref<string | null>(null)
const internalDate = ref<string | null>(null)

const convertToBuddhist = (date: string | null) => {
  if (!date) return null
  return dayjs(date).locale('th').format('BBBB-MM-DD')
}

const convertToGregorian = (date: string | null) => {
  if (!date) return null
  return dayjs(date, 'BBBB-MM-DD').locale('th').format('YYYY-MM-DD')
}

const handleDateInput = (date: string | null) => {
  internalDate.value = date
  activityDateInput.value = convertToBuddhist(date)
}

// Update internalDate when activityDateInput changes
const buddhistDate = computed(() => {
  return convertToGregorian(activityDateInput.value)
})

watch(buddhistDate, (newValue) => {
  internalDate.value = newValue
})

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
