<template>
  <q-page v-if="activityLoaded">
    <!-- Status -->
    <div class="input-group">
      <p class="label label_minWidth">สถานะ:</p>
      <q-btn :label="activityStatus" :class="statusClass" class="status-btn" />
      <q-btn
        v-if="activityStatus !== 'ยกเลิก' && activityStatus !== 'เสร็จสิ้น'"
        class="btnchange"
        label="เปลี่ยน"
        @click="showChangeStatusDialog = true"
        :disable="!isEditing"
      />
    </div>
    <q-dialog v-model="showChangeStatusDialog">
      <ChangeStatusDialog
        v-model="showChangeStatusDialog"
        :currentStatus="activityStatus"
        @confirm="handleStatusChange"
      />
    </q-dialog>
    <!-- Activity Name -->
    <div class="input-group">
      <p class="label label_minWidth">ชื่อกิจกรรม :</p>
      <q-input outlined v-model="activityName" style="width: 600px" :disable="!isEditing" />
    </div>

    <!-- Date -->
    <MutiDate
      v-model="activityDateRange"
      @update:modelValue="generateDaysInRange"
      :disable="!isEditing"
    />

    <!-- Time -->
    <div class="input-group">
      <p class="label label_minWidth" style="align-self: flex-start">เวลาที่จัดกิจกรรม:</p>
      <div class="day-time-container">
        <q-checkbox
          class="checkbox-left"
          v-model="sameTimeForAll"
          label="เวลาเดิมทุกวัน"
          @update:model-value="applySameTime"
          :disable="!isEditing"
        />
        <div class="day-time-container">
          <div v-for="(day, index) in selectedDays" :key="day.date" class="day-block">
            <TimeSelector
              v-model:startTime="day.startTime"
              v-model:endTime="day.endTime"
              :formattedDate="day.formattedDate"
              @update:startTime="updateDayTime(index, 'start', $event)"
              @update:endTime="updateDayTime(index, 'end', $event)"
              :disable="!isEditing"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Room -->
    <RoomSelector v-model="roomName" class="input-group" :disable="!isEditing" />
    <!-- Hours & Seats -->
    <div class="flex-container">
      <HoursSelector v-model="totalHours" class="input-group" :disable="!isEditing" />
      <SeatsSelector v-model="seats" class="input-group" :disable="!isEditing" />
    </div>

    <!-- Activity Type -->
    <ActivityType v-model="activityType" class="input-group" :disable="!isEditing" />

    <!-- Department -->
    <DepartmentSelector v-model="departments" class="input-group" :disable="!isEditing" />

    <!-- Year -->
    <YearSelector v-model="years" class="input-group" :disable="!isEditing" />

    <!-- Lecturer -->
    <div class="input-group">
      <p class="label label_minWidth">วิทยากร :</p>
      <q-input outlined v-model="lecturer" style="width: 600px" :disable="!isEditing" />
    </div>

    <!-- Food Menu -->
    <FoodSelector v-model:foodMenu="foodMenu" class="input-group" :disable="!isEditing" />

    <!-- Detail Activity -->
    <div class="input-group">
      <p style="align-self: flex-start" class="label label_minWidth">รายละเอียดอื่นๆ :</p>
      <q-input
        type="textarea"
        rows="10"
        outlined
        v-model="detailActivity"
        style="width: 600px"
        :disable="!isEditing"
      />
    </div>

    <div class="button-group">
      <q-btn v-if="!isEditing" class="btnedit" @click="isEditing = true">แก้ไข</q-btn>

      <template v-else>
        <q-btn class="btnreject" @click="cancelEdit">ยกเลิก</q-btn>
        <q-btn class="btnsecces" @click="saveChanges">บันทึก</q-btn>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import YearSelector from 'src/pages/admin-page/activity/CreateActivity/Form/YearSelector.vue'
import DepartmentSelector from 'src/pages/admin-page/activity/CreateActivity/Form/DepartmentSelector.vue'
import MutiDate from 'src/pages/admin-page/activity/CreateActivity/Form/MutiDate.vue'
import ActivityType from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityType.vue'
import HoursSelector from 'src/pages/admin-page/activity/CreateActivity/Form/HoursSelector.vue'
import SeatsSelector from 'src/pages/admin-page/activity/CreateActivity/Form/SeatsSelector.vue'
import TimeSelector from 'src/pages/admin-page/activity/CreateActivity/Form/TimeSelector.vue'
import FoodSelector from 'src/pages/admin-page/activity/CreateActivity/Form/FoodSelector.vue'
import ChangeStatusDialog from 'src/pages/admin-page/activity/ActivityDetail/ActivityDetail/ChangeStatusDialog.vue'
import RoomSelector from 'src/pages/admin-page/activity/CreateActivity/Form/RoomSelector.vue'
import type { Activity } from 'src/types/activity'

const props = defineProps<{
  activity: Activity | null
}>()
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
const activityLoaded = ref(false)
const showChangeStatusDialog = ref(false)
const selectedDays = ref<DayTimeSelection[]>([])
const sameTimeForAll = ref(false)
const totalHours = ref<number>(0)
const seats = ref<number>(0)
const activityDateRange = ref<string[]>([])
const activityName = ref('')
const activityType = ref('')
const lecturer = ref('')
const detailActivity = ref('')
const departments = ref<string[]>([])
const years = ref<string[]>([])
const activityDateRangeInternal = ref<string[]>([])
const foodMenu = ref('')
const roomName = ref<string[]>([])
const activityStatus = ref('กำลังวางแผน') // ค่าปัจจุบันของสถานะ
const handleStatusChange = (newStatus: string) => {
  activityStatus.value = newStatus
}
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
    void applySameTime()
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
const statusClass = computed(() => {
  switch (activityStatus.value) {
    case 'กำลังวางแผน':
      return 'status-planning'
    case 'เปิดลงทะเบียน':
      return 'status-open'
    case 'ปิดลงทะเบียน':
      return 'status-closed'
    case 'เสร็จสิ้น':
      return 'status-completed'
    case 'ยกเลิก':
      return 'status-canceled'
    default:
      return ''
  }
})

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
      endTime: day.endTime,
    })),
    roomName: roomName.value,
    totalHours: totalHours.value,
    seats: seats.value,
    activityType: activityType.value,
    departments: departments.value,
    years: years.value,
    lecturer: lecturer.value,
    foodMenu: foodMenu.value,
    detailActivity: detailActivity.value,
  }

  console.log('Payload:', payload) // ตรวจสอบค่า payload ในคอนโซล
  // หรือเก็บลง localStorage
  localStorage.setItem('activityPayload', JSON.stringify(payload))
}
const isEditing = ref(false) // เปลี่ยนค่าเริ่มต้นเป็น false (ฟอร์มถูกล็อก)

const cancelEdit = () => {
  isEditing.value = false
}

const saveChanges = () => {
  isEditing.value = false
  submitActivity()
}
onMounted(() => {
  const a = props.activity
  if (!a) return

  activityName.value = a.name ?? ''
  activityType.value =
    a.skill === 'hard'
      ? 'prep'
      : a.skill === 'soft'
        ? 'academic'
        : (activityStatus.value = a.activityState ?? 'กำลังวางแผน')
  foodMenu.value = a.Foods?.map((f) => f.name).join(', ') ?? ''

  const firstItem = a.activityItems?.[0]
  if (firstItem) {
    roomName.value = firstItem.rooms ?? []
    totalHours.value = firstItem.hour ?? 0
    seats.value = firstItem.maxParticipants ?? 0
    departments.value = firstItem.majors?.map(String) ?? []
    detailActivity.value = firstItem.description ?? ''
    lecturer.value = firstItem.operator ?? ''
    years.value = firstItem.studentYears?.map(String) ?? []

    if (firstItem.dates?.length) {
      activityDateRange.value = firstItem.dates.map((d) => d.date)
      generateDaysInRange(activityDateRange.value)

      selectedDays.value.forEach((day, index) => {
        const d = firstItem.dates?.[index]
        if (d) {
          day.date = d.date
          day.startTime = d.stime
          day.endTime = d.etime
        }
      })
    }
  }

  activityLoaded.value = true
})

</script>

<style scoped>
::v-deep(.q-field--disabled .q-field__control) {
  background-color: #e0e0e0 !important;
  color: #757575 !important;
}
::v-deep(.q-btn:disabled) {
  background-color: #e0e0e0 !important;
  color: #757575 !important;
}

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
  border-radius: 50px;
  height: 40px;
  width: 200px;
  font-size: 20px;
}

.status-planning {
  color: #ff6f00;
  background-color: #ffe7ba;
  border: 2px solid #ffa500;
}

.status-open {
  color: #009812;
  background-color: #d0ffc5;
  border: 2px solid #00bb16;
}

.status-closed {
  color: #001780;
  background-color: #cfd7ff;
  border: 2px solid #002dff;
}
.status-completed {
  color: #000000;
  background-color: #dadada;
  border: 2px solid #575656;
}

.status-canceled {
  color: #f32323;
  background-color: #ffc5c5;
  border: 2px solid #ff0000;
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
  margin-bottom: 100px;
  width: 100%;
}
</style>
