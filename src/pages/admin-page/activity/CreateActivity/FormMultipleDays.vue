<template>
  <q-page>
    <!-- Status -->
    <div class="input-group">
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
      <q-input outlined v-model="activityDateRange" style="width: 600px" readonly>
        <template v-slot:prepend>
          <q-icon name="event" class="cursor-pointer">
            <q-menu style="overflow: visible" ref="datePopupRef">
              <q-date
                v-model="activityDateRangeInternal"
                mask="YYYY-MM-DD"
                today-btn
                :locale="thaiLocale"
                color="blue-8"
                text-color="white"
                minimal
                first-day-of-week="1"
                class="my-custom-calendar"
                range
                @update:model-value="onDateRangeChange"
              />
            </q-menu>
          </q-icon>
        </template>
      </q-input>
    </div>

    <!-- Time -->
    <div class="input-group">
  <p class="label label_minWidth" style="align-self: flex-start">เวลาที่จัดกิจกรรม:</p>
 
  <div class="day-time-container">
    <q-checkbox v-model="sameTimeForAll" label="เวลาเดิมทุกวัน" @update:model-value="applySameTime" />

    <div v-for="(day, index) in selectedDays" :key="day.date" class="day-block">
      <div class="day-label">{{ day.formattedDate }}</div>
      
      <div class="time-row">
        <q-input outlined v-model="day.startTime" style="width: 200px" readonly @update:model-value="updateTime(index, 'start')">
          <template v-slot:prepend>
            <q-icon name="access_time" class="cursor-pointer">
              <q-menu class="q-pa-md time-picker-card" style="overflow: visible">
                <div class="time-container">
                  <div class="time-column">
                    <q-btn flat dense icon="arrow_drop_up" @click="adjustHour(index, 'start', 'increase')" />
                    <div class="time-display">{{ formatHour(day.startHour) }}</div>
                    <q-btn flat dense icon="arrow_drop_down" @click="adjustHour(index, 'start', 'decrease')" />
                  </div>
                  <div class="separator">:</div>
                  <div class="time-column">
                    <q-btn flat dense icon="arrow_drop_up" @click="adjustMinute(index, 'start', 'increase')" />
                    <div class="time-display">{{ formatMinute(day.startMinute) }}</div>
                    <q-btn flat dense icon="arrow_drop_down" @click="adjustMinute(index, 'start', 'decrease')" />
                  </div>
                </div>
              </q-menu>
            </q-icon>
          </template>
        </q-input>
        
        <p class="label time-separator">ถึง</p>

        <q-input outlined v-model="day.endTime" style="width: 200px" readonly @update:model-value="updateTime(index, 'end')">
          <template v-slot:prepend>
            <q-icon name="access_time" class="cursor-pointer">
              <q-menu class="q-pa-md time-picker-card" style="overflow: visible">
                <div class="time-container">
                  <div class="time-column">
                    <q-btn flat dense icon="arrow_drop_up" @click="adjustHour(index, 'end', 'increase')" />
                    <div class="time-display">{{ formatHour(day.endHour) }}</div>
                    <q-btn flat dense icon="arrow_drop_down" @click="adjustHour(index, 'end', 'decrease')" />
                  </div>
                  <div class="separator">:</div>
                  <div class="time-column">
                    <q-btn flat dense icon="arrow_drop_up" @click="adjustMinute(index, 'end', 'increase')" />
                    <div class="time-display">{{ formatMinute(day.endMinute) }}</div>
                    <q-btn flat dense icon="arrow_drop_down" @click="adjustMinute(index, 'end', 'decrease')" />
                  </div>
                </div>
              </q-menu>
            </q-icon>
          </template>
        </q-input>
      </div>

      <q-separator class="q-my-md" v-if="index < selectedDays.length - 1" />
    </div>
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
import { computed, onMounted, ref, watch } from 'vue'

interface ToggleOption {
  label: string
  value: string
}
interface QPopupProxy {
  hide: () => void
  show: () => void
}
interface DayTimeSelection {
  date: string
  formattedDate: string
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
  startTime: string
  endTime: string
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
const datePopupRef = ref<QPopupProxy | null>(null)
const endTime = ref<string>('00:00')
const selectedTime = ref<string>('00:00')
const hour = ref<number>(0)
const minute = ref<number>(0)
const endHour = ref<number>(0)
const endMinute = ref<number>(0)
const activityDateRangeInternal = ref({
  from: '',
  to: '',
})
const selectedDays = ref<DayTimeSelection[]>([])

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
const adjustHour = (
  dayIndex: number,
  timeType: 'start' | 'end',
  direction: 'increase' | 'decrease',
): void => {
  const day = selectedDays.value[dayIndex]
  if (!day) return

  if (timeType === 'start') {
    if (direction === 'increase') {
      day.startHour = (day.startHour + 1) % 24
    } else {
      day.startHour = (day.startHour - 1 + 24) % 24
    }
    day.startTime = formatTime(day.startHour, day.startMinute)
  } else {
    if (direction === 'increase') {
      day.endHour = (day.endHour + 1) % 24
    } else {
      day.endHour = (day.endHour - 1 + 24) % 24
    }
    day.endTime = formatTime(day.endHour, day.endMinute)
  }
}

const adjustMinute = (
  dayIndex: number,
  timeType: 'start' | 'end',
  direction: 'increase' | 'decrease',
): void => {
  const day = selectedDays.value[dayIndex]
  if (!day) return

  if (timeType === 'start') {
    if (direction === 'increase') {
      day.startMinute = (day.startMinute + 1) % 60
    } else {
      day.startMinute = (day.startMinute - 1 + 60) % 60
    }
    day.startTime = formatTime(day.startHour, day.startMinute)
  } else {
    if (direction === 'increase') {
      day.endMinute = (day.endMinute + 1) % 60
    } else {
      day.endMinute = (day.endMinute - 1 + 60) % 60
    }
    day.endTime = formatTime(day.endHour, day.endMinute)
  }
}
const activityDateRange = computed(() => {
  const { from, to } = activityDateRangeInternal.value

  const fromFormatted = formatThaiDate(from)
  if (!fromFormatted) return ''

  const toFormatted = formatThaiDate(to)
  if (!toFormatted) return fromFormatted

  return `${fromFormatted} - ${toFormatted}`
})

const formatThaiDate = (dateStr: string): string => {
  if (!dateStr) return ''

  const parts = dateStr.split('-')
  if (parts.length !== 3) return ''

  const year = parts[0] ? parseInt(parts[0], 10) : 0
  const monthIndex = parts[1] ? parseInt(parts[1], 10) - 1 : -1
  const day = parts[2] ? parseInt(parts[2], 10) : 0

  if (isNaN(year) || isNaN(day) || monthIndex < 0 || monthIndex >= thaiLocale.months.length) {
    return ''
  }

  const thaiMonth = thaiLocale.months[monthIndex]
  const thaiYear = year + 543

  return `${day} ${thaiMonth} ${thaiYear}`
}

const closeCalendar = () => {
  setTimeout(() => {
    if (datePopupRef.value) {
      datePopupRef.value.hide()
    }
  }, 10)
}
const onDateRangeChange = () => {
  const { from, to } = activityDateRangeInternal.value

  // ปิด popup ปฏิทิน
  closeCalendar()

  // สร้างรายการวันที่อยู่ในช่วงที่เลือก
  generateDaysInRange(from, to)
}

// ฟังก์ชันสร้างรายการวันที่ในช่วงที่เลือก
const generateDaysInRange = (fromDate: string, toDate: string) => {
  if (!fromDate) return

  // ล้างข้อมูลเดิมก่อน
  selectedDays.value = []

  const fromDateObj = new Date(fromDate)
  const toDateObj = toDate ? new Date(toDate) : new Date(fromDate)

  // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
  if (isNaN(fromDateObj.getTime()) || isNaN(toDateObj.getTime())) return

  // วนลูปสร้างรายการวันที่
  const currentDate = new Date(fromDateObj)
  while (currentDate <= toDateObj) {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const day = String(currentDate.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`

    // สร้างวันที่ในรูปแบบไทย
    const formattedDate = formatThaiDate(dateString)

    // เพิ่มข้อมูลวันที่
    selectedDays.value.push({
      date: dateString,
      formattedDate,
      startHour: 0, // เริ่มต้นที่ 9:00
      startMinute: 0,
      endHour: 0, // สิ้นสุดที่ 17:00
      endMinute: 0,
      startTime: '00:00',
      endTime: '00:00',
    })

    // เพิ่มวันถัดไป
    currentDate.setDate(currentDate.getDate() + 1)
  }
}
// แล้วเปลี่ยนในฟังก์ชัน generateDaysInRange เป็น:

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
onMounted(() => {
  // สร้างวันที่ปัจจุบันในรูปแบบ YYYY-MM-DD
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const dateString = `${year}-${month}-${day}`

  // กำหนดค่าเริ่มต้นให้กับตัวแปร
  activityDateRangeInternal.value = {
    from: dateString,
    to: dateString,
  }

  // สร้างข้อมูลวันที่เริ่มต้น
  generateDaysInRange(dateString, dateString)
})
const sameTimeForAll = ref(false)

const applySameTime = () => {
  if (sameTimeForAll.value && selectedDays.value.length > 0) {
    const firstDay = selectedDays.value[0];
    if (firstDay) {
      selectedDays.value.forEach((day, index) => {
        if (index !== 0) {
          day.startTime = firstDay.startTime;
          day.endTime = firstDay.endTime;
          day.startHour = firstDay.startHour;
          day.startMinute = firstDay.startMinute;
          day.endHour = firstDay.endHour;
          day.endMinute = firstDay.endMinute;
        }
      });
    }
  }
};
const updateTime = (index: number, type: 'start' | 'end') => {
  if (index === 0 && sameTimeForAll.value) {
    const firstDay = selectedDays.value[0];
    if (!firstDay) return;

    selectedDays.value.forEach((day, idx) => {
      if (idx !== 0) {
        if (type === 'start') {
          day.startTime = firstDay.startTime;
          day.startHour = firstDay.startHour;
          day.startMinute = firstDay.startMinute;
        } else {
          day.endTime = firstDay.endTime;
          day.endHour = firstDay.endHour;
          day.endMinute = firstDay.endMinute;
        }
      }
    });
  }
};
watch([sameTimeForAll, selectedDays], ([sameTime, days]) => {
  if (sameTime && days.length > 0) {
    const firstDay = days[0];
    if (firstDay) {
      days.forEach((day, index) => {
        if (index !== 0) {
          day.startTime = firstDay.startTime;
          day.startHour = firstDay.startHour;
          day.startMinute = firstDay.startMinute;
          day.endTime = firstDay.endTime;
          day.endHour = firstDay.endHour;
          day.endMinute = firstDay.endMinute;
        }
      });
    }
  }
}, { deep: true });
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
.time-row {
  display: flex;
  align-items: center;
  gap: 15px; /* ให้เวลา Start และ End อยู่ติดกัน */
}

.time-separator {
  margin: 0 10px;
}
</style>
