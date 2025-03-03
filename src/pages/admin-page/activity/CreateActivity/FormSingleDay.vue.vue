<template>
  <q-page>
    <!-- Status -->
    <div class="input-group ">
      <p class="label label_minWidth">สถานะ:</p>
      <q-btn label="กำลังวางแผน" class="status-btn" />
    </div>

    <!-- Activity Name -->
    <div class="input-group">
      <p class="label label_minWidth">ชื่อกิจกรรม :</p>
      <q-input outlined v-model="activityName" style="width: 600px" />
    </div>

    <!-- Date -->
    <div class="input-group">
      <p class="label label_minWidth">วันที่จัดกิจกรรม :</p>
      <q-input outlined v-model="activityDate" style="width: 600px" readonly>
        <template v-slot:prepend>
          <q-icon name="event">
            <q-menu style="overflow: visible">
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
            </q-menu>
          </q-icon>
        </template>
      </q-input>
    </div>

    <!-- Time -->
    <div class="input-group">
      <!-- Start Time -->
      <p class="label label_minWidth">เวลาที่จัดกิจกรรม:</p>
      <div class="input-group">
        <q-input outlined v-model="selectedTime" style="width: 200px" readonly>
          <template v-slot:prepend>
            <q-icon name="access_time" class="cursor-pointer">
              <q-menu class="q-pa-md time-picker-card" style="overflow: visible">
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
              </q-menu>
            </q-icon>
          </template>
        </q-input>
      </div>

      <!-- End Time -->
      <p class="label">ถึง</p>
      <div>
        <q-input outlined v-model="endTime" style="width: 200px" readonly>
          <template v-slot:prepend>
            <q-icon name="access_time" class="cursor-pointer">
              <q-menu class="time-picker-card" style="overflow: visible">
                <div class="time-container">
                  <!-- ส่วนเลือกชั่วโมง -->
                  <div class="time-column">
                    <q-btn flat dense icon="arrow_drop_up" @click="adjustHour('end', 'increase')" />
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
              </q-menu>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>

    <!-- Room -->
    <div class="input-group">
      <p class="label label_minWidth">ชื่อห้องที่จัดกิจกรรม :</p>
      <q-input outlined v-model="roomName" style="width: 600px" />
    </div>

    <!-- Hours & Seats -->
    <div class="input-group">
      <p class="label label_minWidth">จำนวนชั่วโมง :</p>
      <q-input
        outlined
        style="width: 200px"
        v-model="totalHours"
        type="number"
        @keypress="isNumber($event)"
        @blur="validatePositive('totalHours')"
      />
      <p class="label">จำนวนที่นั่ง :</p>
      <q-input
        outlined
        style="width: 240px"
        v-model="seats"
        type="number"
        @keypress="isNumber($event)"
        @blur="validatePositive('seats')"
      />
    </div>

    <!-- Activity Type -->
    <div class="input-group">
      <p class="label label_minWidth">ประเภทกิจกรรม :</p>
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
    <div class="input-group">
      <p class="label label_minWidth">สาขา :</p>
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
    <div class="input-group">
      <p class="label label_minWidth">ชั้นปี :</p>
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
    <div class="input-group">
      <p class="label label_minWidth">วิทยากร :</p>
      <q-input outlined v-model="lecturer" style="width: 600px" />
    </div>

    <!-- Food Menu -->
    <div class="input-group">
      <p class="label label_minWidth">รายการอาหาร :</p>
      <q-input outlined v-model="foodMenu" style="width: 600px" />
    </div>

    <!-- Detail Activity -->
    <div class="input-group">
      <p style="align-self: flex-start" class="label label_minWidth">รายละเอียดอื่นๆ :</p>
      <q-input outlined v-model="detailActivity" style="width: 600px" />
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
const isNumber = (event: KeyboardEvent) => {
  const charCode = event.which ? event.which : event.keyCode

  if (charCode < 48 || charCode > 57) {
    event.preventDefault()
  }
}
const validatePositive = (field: 'totalHours' | 'seats') => {
  if (eval(field).value < 0 || eval(field).value === '') {
    eval(field).value = 0
  }
}
</script>

<style scoped>
::v-deep(.q-field__control) {
  height: 40px;
  background-color: white;
  align-items: center;
}
::v-deep(.q-icon) {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.input-group {
  display: flex;
  gap: 25px;
  margin-bottom: 20px;
}
.label {
  font-size: 20px;
  font-weight: normal;
  text-align: right;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.label_minWidth {
  min-width: 200px;
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
.activityType-btn {
  width: 200px;
  height: 40px;
  border-radius: 50px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  background-color: #ffffff;
  margin-right: 10px;
}
.department-btn,
.year-btn {
  width: 80px;
  height: 40px;
  border-radius: 50px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  background-color: #ffffff;
  margin-right: 10px;
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
  width: 300px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

.time-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.time-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.separator {
  font-weight: bold;
}
</style>
