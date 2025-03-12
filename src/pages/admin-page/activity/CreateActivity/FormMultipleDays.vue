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
    <Room v-model="roomName" class="input-group" />

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
      <q-input type="textarea" rows="10" outlined v-model="detailActivity" style="width: 600px" />
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
import Room from 'src/pages/admin-page/activity/CreateActivity/Form/RoomSelector.vue'
import { ActivityService } from 'src/services/activity'
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
const totalHours = ref<number>(0)
const seats = ref<number>(0)
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
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const dateString = `${year}-${month}-${day}`

  activityDateRangeInternal.value = [dateString]

  generateDaysInRange(activityDateRangeInternal.value)
})

const submitActivity = async () => {
  const majorMap: Record<string, { id: string; name: string }> = {
    cs: { id: '67bf0c358873e448798fed37', name: 'CS' },
    se: { id: '67bf0bdf8873e448798fed36', name: 'SE' },
    itdi: { id: '67bf0bda8873e448798fed35', name: 'ITDI' },
    aai: { id: '67bf0bd48873e448798fed34', name: 'AAI' },
  }

  const skill = activityType.value === 'prep' ? 'hard' : 'soft'

  const majors = departments.value
    .map((dep) => majorMap[dep])
    .filter((m): m is { id: string; name: string } => m !== undefined)

  const payload = {
    name: activityName.value,
    activityState: 'planning',
    type: 'one',
    skill,
    studentYears: years.value.map((y) => parseInt(y, 10)),
    majors,
    activityItems: [
      {
        name: activityName.value,
        description: detailActivity.value,
        hour: totalHours.value,
        maxParticipants:seats.value,
        operator: lecturer.value,
        room: roomName.value,
        dates: selectedDays.value.map((day) => ({
          date: day.date,
          stime: day.startTime,
          etime: day.endTime,
        })),
      },
    ],
  }

  try {
    await ActivityService.createOne(payload)
    alert('✅ สร้างกิจกรรมสำเร็จ')
    await router.push('/ActivitiesManagement')
  } catch (error) {
    console.error(error)
    alert('❌ เกิดข้อผิดพลาดในการสร้างกิจกรรม')
  }
  }

const isSidebarOpen = ref(false)

watch(isSidebarOpen, (newVal) => {
  document.documentElement.style.setProperty('--sidebar-width', newVal ? '250px' : '0px')
})
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
  width: 100%;
}
</style>
