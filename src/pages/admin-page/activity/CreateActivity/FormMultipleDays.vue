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
        <q-checkbox class="checkbox-left" v-model="sameTimeForAll" label="เวลาเดิมทุกวัน"
          @update:model-value="applySameTime" />
        <div class="day-time-container">
          <div v-for="(day, index) in selectedDays" :key="day.date" class="day-block">
            <TimeSelector v-model:startTime="day.startTime" v-model:endTime="day.endTime"
              :formattedDate="day.formattedDate" @update:startTime="updateDayTime(index, 'start', $event)"
              @update:endTime="updateDayTime(index, 'end', $event)" />
          </div>
        </div>
      </div>
    </div>

    <!-- Room -->
    <Room v-model="selectedRoom" class="input-group" />

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
    <FoodSelector v-model:foodMenu="foodMenu" v-model:foodMenuDisplay="foodMenuDisplay" class="input-group" />

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
import type { Food } from 'src/types/food'

const router = useRouter()

onMounted(() => { })

const goToActivitiesManagement = async () => {
  await router.push('/admin/ActivitiesManagement')
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
const selectedRoom = ref<string[]>([])
const activityType = ref('prep')
const lecturer = ref('')
const detailActivity = ref('')
const departments = ref<string[]>(['CS', 'SE', 'ITDI', 'AAI'])
const years = ref<string[]>(['1', '2', '3', '4'])
const activityDateRangeInternal = ref<string[]>([])
const foodMenu = ref<Food[]>([])
const foodMenuDisplay = ref<string>('')

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

  // สร้างวันที่ปัจจุบันในรูปแบบ YYYY-MM-DD
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const dateString = `${year}-${month}-${day}`
  activityDateRangeInternal.value = [dateString]

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


const props = defineProps<{
  imageFile: File | null
  activity?: { file?: string | null } // 👈 ถ้ามีเฉพาะ field file ก็พอ
}>()

// const goToPageDetail = async (id: string) => {
//   console.log('ไปหน้า ActivityDetail ID:', id)
//   await router.push(`/Admin/ActivitiesManagement/ActivityDetail/${id}`)
// }
const goToPageTable = async () => {
  await router.push(`/Admin/ActivitiesManagement`)
}
const submitActivity = async () => {
  const skillMap: Record<string, 'hard' | 'soft' | null> = {
    prep: 'hard',
    academic: 'soft',
    '': null,
  }

  const skill = skillMap[activityType.value] ?? null
  const parsedHour = Number(totalHours.value)
  const parsedSeats = Number(seats.value)
  const foodVotes = foodMenu.value.map((food) => ({
    vote: 0,
    foodName: food.name,
  }))

  const payload = {
    type: 'one',
    activityState: 'planning',
    name: activityName.value,
    skill: skill ?? '',
    file: props.imageFile?.name ?? '',
    foodVotes,
    activityItems: [
      {
        name: activityName.value,
        hour: isNaN(parsedHour) ? null : parsedHour,
        maxParticipants: isNaN(parsedSeats) ? null : parsedSeats,
        rooms: selectedRoom.value,
        dates: selectedDays.value.map((day) => ({
          date: day.date,
          stime: day.startTime,
          etime: day.endTime,
        })),
        studentYears: years.value.map((y) => parseInt(y, 10)),
        majors: departments.value,
        operator: lecturer.value,
        description: detailActivity.value,
      },
    ],
  }
  try {
    const { status, id } = await ActivityService.createOne(payload)

    if ((status === 200 || status === 201) && props.imageFile) {
      try {
        const uploadStatus = await ActivityService.uploadImage(
          id,
          props.imageFile,
          props.activity?.file ?? undefined,
        )

        if (uploadStatus.status === 200 || uploadStatus.status === 201) {
          console.log('Upload image successfully')
        } else {
          console.log('Upload image failed:', uploadStatus)
        }
      } catch (uploadErr) {
        console.error('Upload image failed:', uploadErr)
      }
    }

    await goToPageTable()
  } catch (err) {
    console.error('Create activity failed:', err)
  }
}
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
