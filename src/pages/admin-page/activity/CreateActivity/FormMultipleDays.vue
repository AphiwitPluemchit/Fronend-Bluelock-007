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
    <MutiDate v-model="activityDateRange" @update:modelValue="generateDaysInRange" />

    <!-- Time -->
    <div class="input-group">
      <p class="label label_minWidth" style="align-self: flex-start">เวลาที่จัดกิจกรรม:</p>
      <div class="day-time-container">
        <q-checkbox
          class="checkbox-left"
          v-model="sameTimeForAll"
          label="เวลาเดิมทุกวัน"
          @update:model-value="applySameTime"
        />
        <div class="day-time-container">
          <div v-for="(day, index) in selectedDays" :key="day.date" class="day-block">
            <TimeSelector
              v-model:startTime="day.startTime"
              v-model:endTime="day.endTime"
              :formattedDate="day.formattedDate"
              @update:startTime="updateDayTime(index, 'start', $event)"
              @update:endTime="updateDayTime(index, 'end', $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Room -->
    <div class="input-group">
      <p class="label label_minWidth">ชื่อห้องที่จัดกิจกรรม :</p>
      <q-input outlined v-model="roomName" style="width: 600px" />
    </div>

    <!--Hours  & Seats -->
    <div class="flex-container">
      <HoursSelector v-model="totalHours" class="input-group" />
      <SeatsSelector v-model="seats" class="input-group" />
    </div>

    <!-- Activity Type -->
    <ActivityType v-model="activityType" class="input-group" />

    <!-- Department -->
    <DepartmentSelector v-model="departments" class="input-group" />

    <!-- Year -->
    <YearSelector v-model="years" class="input-group" />

    <!-- Lecturer -->
    <div class="input-group">
      <p class="label label_minWidth">วิทยากร :</p>
      <q-input outlined v-model="lecturer" style="width: 600px" />
    </div>

    <!-- Food Menu -->
    <FoodSelector v-model:foodMenu="foodMenu" class="input-group" />

    <!-- Detail Activity -->
    <div class="input-group">
      <p style="align-self: flex-start" class="label label_minWidth">รายละเอียดอื่นๆ :</p>
      <q-input outlined v-model="detailActivity" style="width: 600px" />
    </div>
    <div class="button-group">
            <q-btn class="btnreject" @click="goToActivitiesManagement">ยกเลิก</q-btn>
            <q-btn class="btnsecces" @click="submitActivity">เสร็จสิ้น</q-btn>
          </div>
  </q-page>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import YearSelector from 'src/pages/admin-page/activity/CreateActivity/Form/YearSelector.vue'
import DepartmentSelector from 'src/pages/admin-page/activity/CreateActivity/Form/DepartmentSelector.vue'
import MutiDate from 'src/pages/admin-page/activity/CreateActivity/Form/MutiDate.vue'
import ActivityType from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityType.vue'
import HoursSelector from 'src/pages/admin-page/activity/CreateActivity/Form/HoursSelector.vue'
import SeatsSelector from 'src/pages/admin-page/activity/CreateActivity/Form/SeatsSelector.vue'
import TimeSelector from 'src/pages/admin-page/activity/CreateActivity/Form/TimeSelector.vue'
import FoodSelector from 'src/pages/admin-page/activity/CreateActivity/Form/FoodSelector.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {})

const goToActivitiesManagement = async () => {
  await router.push('/ActivitiesManagement')
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
const selectedDays = ref<DayTimeSelection[]>([])
const sameTimeForAll = ref(false)
const totalHours = ref<string>('')
const seats = ref<string>('')
const activityDateRange = ref<string[]>([])
const activityName = ref('')
const roomName = ref('')
const activityType = ref('')
const lecturer = ref('')
const detailActivity = ref('')
const departments = ref<string[]>([])
const years = ref<string[]>([])
const activityDateRangeInternal = ref<string[]>([])
const foodMenu = ref('')
const menuItems = ref([
  'ผัดกะเพราหมู',
  'ผัดกะเพราไก่',
  'หมูกระเทียม',
  'ไก่กระเทียม',
  'ผัดพริกแกงหมู',
  'ผัดพริกแกงไก่',
  'ผัดพริกอ่อนหมู',
  'ผัดพริกอ่อนไก่',
  'ข้าวหมูทอด',
  'ข้าวไก่ทอด',
])
watch(sameTimeForAll, (newValue) => {
  if (newValue) {
    void applySameTime() // ✅ ใช้ void ป้องกัน ESLint ฟ้อง
  }
})
const applySameTime = async () => {
  if (selectedDays.value.length === 0) return

  const firstDay = selectedDays.value[0]
  if (!firstDay) return

  await nextTick()

  selectedDays.value = selectedDays.value.map((day, index) => {
    if (index === 0) return day

    return {
      ...day,
      startTime: firstDay.startTime,
      startHour: firstDay.startHour,
      startMinute: firstDay.startMinute,
      endTime: firstDay.endTime,
      endHour: firstDay.endHour,
      endMinute: firstDay.endMinute,
    }
  })
}
const updateDayTime = (index: number, type: 'start' | 'end', value: string) => {
  if (selectedDays.value[index]) {
    if (type === 'start') {
      selectedDays.value[index].startTime = value
    } else {
      selectedDays.value[index].endTime = value
    }

    if (sameTimeForAll.value) {
      void applySameTime()
    }
  }
}
onMounted(() => {
  // โหลดเมนูอาหารจาก localStorage ถ้ามี
  const storedMenuItems = localStorage.getItem('menuItems')
  if (storedMenuItems) {
    menuItems.value = JSON.parse(storedMenuItems)
  }

  // สร้างวันที่ปัจจุบันในรูปแบบ YYYY-MM-DD
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const dateString = `${year}-${month}-${day}`

  // กำหนดค่าเริ่มต้นให้กับตัวแปร (เปลี่ยนจาก object เป็น array)
  activityDateRangeInternal.value = [dateString]

  // สร้างข้อมูลวันที่เริ่มต้น (ใช้ array แทน)
  generateDaysInRange(activityDateRangeInternal.value)
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
const generateDaysInRange = (selectedDates: string[]) => {
  selectedDays.value = selectedDates.map((dateString) => ({
    date: dateString,
    formattedDate: formatThaiDate(dateString),
    startHour: 0,
    startMinute: 0,
    endHour: 0,
    endMinute: 0,
    startTime: '00:00',
    endTime: '00:00',
  }))
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
onMounted(() => {
  // สร้างวันที่ปัจจุบันในรูปแบบ YYYY-MM-DD
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const dateString = `${year}-${month}-${day}`

  // กำหนดค่าเริ่มต้นให้กับตัวแปร (เปลี่ยนจาก object เป็น array)
  activityDateRangeInternal.value = [dateString]

  // สร้างข้อมูลวันที่เริ่มต้น (ใช้ array แทน)
  generateDaysInRange(activityDateRangeInternal.value)
})

const submitActivity = () => {
  const payload = {
    activityName: activityName.value,
    selectedDays: selectedDays.value.map((day) => ({
      date: day.date,
      startTime: day.startTime,
      endTime: day.endTime
    })),
    roomName: roomName.value,
    totalHours: totalHours.value,
    seats: seats.value,
    activityType: activityType.value,
    departments: departments.value,
    years: years.value,
    lecturer: lecturer.value,
    foodMenu: foodMenu.value,
    detailActivity: detailActivity.value
  };

  console.log("Payload:", payload); // ตรวจสอบค่า payload ในคอนโซล

  // สามารถส่งไปยัง API ได้โดยใช้ fetch หรือ axios
  // fetch('/api/submit', { method: 'POST', body: JSON.stringify(payload) })

  // หรือเก็บลง localStorage
  localStorage.setItem('activityPayload', JSON.stringify(payload));
};

</script>

<style scoped>
::v-deep(.q-field__control) {
  height: auto;
  background-color: white;
  align-items: center;
}
.input-group p {
  align-self: center;
  margin: 0;
  line-height: normal;
  text-align: right;
}
.input-group {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-bottom: 30px;
}

.label {
  font-size: 20px;
  font-weight: normal;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 40px;
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

.checkbox-left {
  align-self: flex-start;
}
.flex-container {
  display: flex;
  align-items: center; 
  gap: 10px; 
}
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 25px;
  margin-top: 30px; 
}
</style>
