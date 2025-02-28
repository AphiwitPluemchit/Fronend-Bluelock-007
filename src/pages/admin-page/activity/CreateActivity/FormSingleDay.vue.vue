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
      <q-input outlined v-model="activityDate" class="inputBox" readonly>
        <template v-slot:prepend>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="datePopupRef" cover transition-show="scale" transition-hide="scale">
              <q-date
                v-model="activityDateInternal"
                mask="YYYY-MM-DD"
                today-btn
                :locale="thaiLocale"
                color="blue-8"
                text-color="white"
                minimal
                first-day-of-week="1"
                class="my-custom-calendar"
                @update:model-value="closeCalendar"
              />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <!-- Time -->
    <div class="time-container">
      <div class="field-container">
        <p class="label">เวลาที่จัดกิจกรรม:</p>
        <!-- Start Time -->
        <q-input
          outlined
          v-model="selectedTime"
          placeholder="Select a time"
          class="inputBox"
          readonly
        >
          <template v-slot:prepend>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy ref="timePopupRef" cover>
                <q-card class="q-pa-md time-picker-card">
                  <div class="time-container">
                    <!-- ส่วนเลือกชั่วโมง -->
                    <div class="time-column">
                      <q-btn
                        flat
                        dense
                        icon="arrow_drop_up"
                        @click="adjustHour('start', 'increase')"
                      />
                      <div class="time-display">{{ formatHour(hour) }}</div>
                      <q-btn
                        flat
                        dense
                        icon="arrow_drop_down"
                        @click="adjustHour('start', 'decrease')"
                      />
                    </div>
                    <div class="separator">:</div>
                    <!-- ส่วนเลือกนาที -->
                    <div class="time-column">
                      <q-btn
                        flat
                        dense
                        icon="arrow_drop_up"
                        @click="adjustMinute('start', 'increase')"
                      />
                      <div class="time-display">{{ formatMinute(minute) }}</div>
                      <q-btn
                        flat
                        dense
                        icon="arrow_drop_down"
                        @click="adjustMinute('start', 'decrease')"
                      />
                    </div>
                  </div>
                </q-card>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <!-- End Time -->
      <div class="field-container">
        <p class="label">ถึง</p>
        <q-input outlined v-model="endTime" class="inputBox" readonly>
          <template v-slot:prepend>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover>
                <q-card class="q-pa-md time-picker-card">
                  <div class="time-container">
                    <!-- ส่วนเลือกชั่วโมง -->
                    <div class="time-column">
                      <q-btn
                        flat
                        dense
                        icon="arrow_drop_up"
                        @click="adjustHour('end', 'increase')"
                      />
                      <div class="time-display">{{ formatHour(endHour) }}</div>
                      <q-btn
                        flat
                        dense
                        icon="arrow_drop_down"
                        @click="adjustHour('end', 'decrease')"
                      />
                    </div>
                    <div class="separator">:</div>
                    <!-- ส่วนเลือกนาที -->
                    <div class="time-column">
                      <q-btn
                        flat
                        dense
                        icon="arrow_drop_up"
                        @click="adjustMinute('end', 'increase')"
                      />
                      <div class="time-display">{{ formatMinute(endMinute) }}</div>
                      <q-btn
                        flat
                        dense
                        icon="arrow_drop_down"
                        @click="adjustMinute('end', 'decrease')"
                      />
                    </div>
                  </div>
                  
                </q-card>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>
    <!-- Room -->
    <div class="field-container" style="width: 404px; display: flex">
      <p class="label">ชื่อห้องที่จัดกิจกรรม :</p>
      <q-input outlined v-model="roomName" class="inputBox" />
    </div>

    <!-- Hours & Seats -->
    <div class="field-container">
      <p class="label">จำนวนชั่วโมง :</p>
      <q-input outlined v-model="totalHours" class="inputBox" />
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

interface ToggleOption {
  label: string
  value: string
}
interface QPopupProxy {
  hide: () => void
  show: () => void
}
const activityName = ref('')
const totalHours = ref('')
const roomName = ref('')
const seats = ref('')
const activityType = ref('')
const lecturer = ref('')
const foodMenu = ref('')
const detailActivity = ref('')

const departments = ref<string[]>([])
const years = ref<string[]>([])

const toggleDepartment = (value: string) => {
  if (departments.value.includes(value)) {
    departments.value = departments.value.filter((item) => item !== value)
  } else {
    departments.value.push(value)
  }
}

const toggleYear = (value: string) => {
  if (years.value.includes(value)) {
    years.value = years.value.filter((item) => item !== value)
  } else {
    years.value.push(value)
  }
}

const datePopupRef = ref<QPopupProxy | null>(null)
const activityDateInternal = ref('')

const endTime = ref<string>('00:00')
const selectedTime = ref<string>('00:00')
const timePopupRef = ref<QPopupProxy | null>(null)
const hour = ref<number>(0)
const minute = ref<number>(0)
const endHour = ref<number>(0)
const endMinute = ref<number>(0)

// ฟังก์ชันสำหรับฟอร์แมตเวลาเป็นสตริง
const formatTime = (h: number, m: number): string => {
  return `${formatHour(h)}:${formatMinute(m)}`
}
// watch สำหรับ start time
watch([hour, minute], () => {
  selectedTime.value = formatTime(hour.value, minute.value)
})

// watch สำหรับ end time
watch([endHour, endMinute], () => {
  endTime.value = formatTime(endHour.value, endMinute.value)
})
const formatHour = (hour: number): string => {
  return hour.toString().padStart(2, '0')
}

const formatMinute = (minute: number): string => {
  return minute.toString().padStart(2, '0')
}

// ฟังก์ชันปรับชั่วโมงและนาที ที่ใช้ได้ทั้ง start time และ end time
const adjustHour = (timeType: 'start' | 'end', direction: 'increase' | 'decrease'): void => {
  if (timeType === 'start') {
    if (direction === 'increase') {
      hour.value = (hour.value + 1) % 24
    } else {
      hour.value = (hour.value - 1 + 24) % 24
    }
  } else {
    if (direction === 'increase') {
      endHour.value = (endHour.value + 1) % 24
    } else {
      endHour.value = (endHour.value - 1 + 24) % 24
    }
  }
}

const adjustMinute = (timeType: 'start' | 'end', direction: 'increase' | 'decrease'): void => {
  if (timeType === 'start') {
    if (direction === 'increase') {
      minute.value = (minute.value + 1) % 60
    } else {
      minute.value = (minute.value - 1 + 60) % 60
    }
  } else {
    if (direction === 'increase') {
      endMinute.value = (endMinute.value + 1) % 60
    } else {
      endMinute.value = (endMinute.value - 1 + 60) % 60
    }
  }
}
const activityDate = computed({
  get: () => {
    if (!activityDateInternal.value) return ''

    const parts = activityDateInternal.value.split('-')
    if (parts.length !== 3) return ''

    const [year, month, day] = parts
    if (!year || !month || !day) return ''

    const monthIndex = parseInt(month, 10) - 1
    if (monthIndex < 0 || monthIndex >= thaiLocale.months.length) return ''

    const thaiMonth = thaiLocale.months[monthIndex]
    const thaiYear = parseInt(year, 10) + 543

    return `${parseInt(day, 10)} ${thaiMonth} ${thaiYear} `
  },
  set: (val) => {
    activityDateInternal.value = val
  },
})

const closeCalendar = () => {
  setTimeout(() => {
    if (datePopupRef.value) {
      datePopupRef.value.hide()
    }
  }, 10)
}

const thaiLocale = {
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
  align-items: center;
  gap: 10px;
}

.status-btn {
  color: #ff6f00;
  background-color: #ffe7ba;
  border: 2px solid #ffa500;
  border-radius: 50px;
  height: 40px;
  width: 200px;
  font-size: 20px;
}

.activityType-btn,
.department-btn,
.year-btn {
  width: 80px;
  height: 40px;
  border-radius: 50px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  margin-right: 10px;
  background-color: #ffffff;
}

.activityType-btn:last-child,
.department-btn:last-child,
.year-btn:last-child {
  margin-right: 0;
}
.active-btn {
  background-color: #d0e4ff !important;
}
.time-picker-card {
  width: 150px;
  height: 150px;
  text-align: center;
}

.time-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-display {
  font-size: 20px;
  font-weight: semibold;
  color: black;
}
.time-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.separator {
  font-size: 20px;
  font-weight: semibold;
}
</style>
