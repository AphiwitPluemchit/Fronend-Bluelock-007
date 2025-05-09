<template>
  <q-page>
    <!-- Status -->
    <div class="input-group">
      <p class="label label_minWidth">สถานะ:</p>
      <q-btn label="กำลังวางแผน" class="status-btn" />
    </div>

    <!-- Activity Name -->
    <div class="input-group">
      <p class="label label_minWidth">ชื่อกิจกรรมหลัก :</p>
      <q-input outlined v-model="activityName" style="width: 600px" />
    </div>

    <!-- Activity Type -->
    <ActivityType v-model="activityType" class="input-group" />
    <FoodSelector v-model:foodMenu="foodMenu" class="input-group" />

    <!-- Sub Activities List -->
    <div v-for="(subActivity, index) in subActivities" :key="index" class="sub-activity">
      <!-- Cancel (X) Icon -->
      <div class="remove-icon">
        <q-icon name="close" size="35px" color="red" class="cursor-pointer" @click="removeSubActivity(index)" />
      </div>

      <!-- SubActivity Name -->
      <div class="input-group">
        <p class="label label_minWidth">ชื่อกิจกรรม :</p>
        <q-input outlined v-model="subActivity.subActivityName" style="width: 600px" />
      </div>

      <!-- Date -->
      <MutiDate v-model="subActivity.activityDateInternal"
        @update:modelValue="(dates) => generateDaysInRange(dates, index)" />

      <!-- Time -->
      <div class="input-group">
        <p class="label label_minWidth" style="align-self: flex-start">เวลาที่จัดกิจกรรม:</p>
        <div class="day-time-container">
          <q-checkbox class="checkbox-left" v-model="sameTimeForAll" label="เวลาเดิมทุกวัน"
            @update:model-value="() => applySameTime(index)" />
          <div class="day-time-container">
            <div v-for="(day, dIndex) in subActivity.selectedDays" :key="day.date">
              <TimeSelector v-model:startTime="day.startTime" v-model:endTime="day.endTime"
                :formattedDate="day.formattedDate" @update:startTime="v => updateDayTime(index, dIndex, 'start', v)"
                @update:endTime="v => updateDayTime(index, dIndex, 'end', v)" />
            </div>

          </div>
        </div>
      </div>

      <HoursSelector v-model="subActivity.totalHours" class="input-group" />
      <!-- Room and Seats -->
      <Room v-model="subActivity.roomName" class="input-group" />

      <div class="input-group">
        <p class="label label_minWidth">จำนวนที่รับ :</p>
        <q-input outlined style="width: 225px" v-model="subActivity.seats" type="number" @keypress="isNumber($event)"
          @blur="validatePositive('seats', index)" />
      </div>

      <!-- Department -->
      <DepartmentSelector v-model="subActivity.departments" class="input-group" />
      <!-- Year -->
      <YearSelector v-model="subActivity.years" class="input-group" />

      <!-- Lecturer -->
      <div class="input-group">
        <p class="label label_minWidth">วิทยากร :</p>
        <q-input outlined v-model="subActivity.lecturer" style="width: 100%" />
      </div>

      <!-- Detail Activity -->
      <div class="input-group">
        <p style="align-self: flex-start" class="label label_minWidth">รายละเอียดอื่นๆ :</p>
        <q-input type="textarea" rows="10" outlined v-model="subActivity.detailActivity" style="width: 100%" />
      </div>

      <!-- Add Activity Button -->
    </div>
    <div class="btn-container">
      <q-btn class="btnAddActivity" @click="addSubActivity">
        <p class="label">
          <q-icon name="add" size="20px" />
          เพิ่มกิจกรรม
          เพิ่มกิจกรรม
        </p>
      </q-btn>
    </div>
    <div class="button-group">
      <q-btn class="btnreject" @click="goToActivitiesManagement">ยกเลิก</q-btn>
      <q-btn class="btnsecces" @click="submitActivity">เสร็จสิ้น</q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import FoodSelector from 'src/pages/admin-page/activity/CreateActivity/Form/FoodSelector.vue'
import HoursSelector from 'src/pages/admin-page/activity/CreateActivity/Form/HoursSelector.vue'
import MutiDate from 'src/pages/admin-page/activity/CreateActivity/Form/MutiDate.vue'
import TimeSelector from 'src/pages/admin-page/activity/CreateActivity/Form/TimeSelector.vue'
import Room from 'src/pages/admin-page/activity/CreateActivity/Form/RoomSelector.vue'
import YearSelector from 'src/pages/admin-page/activity/CreateActivity/Form/YearSelector.vue'
import DepartmentSelector from 'src/pages/admin-page/activity/CreateActivity/Form/DepartmentSelector.vue'
import ActivityType from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityType.vue'
import { useRouter } from 'vue-router'
import type { Food } from 'src/types/food'
import { ActivityService } from 'src/services/activity'
const router = useRouter()

const goToActivitiesManagement = async () => {
  await router.push('/admin/ActivitiesManagement')
}
interface SubActivity {
  subActivityName: string
  roomName: string[]
  seats: number
  lecturer: string
  detailActivity: string
  departments: string[]
  years: string[]
  activityDateInternal: string[]
  selectedDays: DayTimeSelection[]
  totalHours: number
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

const activityType = ref('prep')
const activityName = ref('')
const foodMenu = ref<Food[]>([])
const subActivities = ref<SubActivity[]>([])
const sameTimeForAll = ref(false)

const generateDaysInRange = (selectedDates: string[], subActivityIndex: number) => {
  const sub = subActivities.value[subActivityIndex]
  if (!sub) return

  sub.selectedDays = selectedDates.map((dateString) => ({
    date: dateString,
    formattedDate: formatThaiDate(dateString),
    startHour: 9,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
    startTime: '09:00',
    endTime: '12:00',
  }))
}
const applySameTime = (subActivityIndex: number) => {
  const sub = subActivities.value[subActivityIndex]
  if (!sub) return
  const days = sub.selectedDays
  const firstDay = days[0]
  if (!firstDay) return

  sub.selectedDays = days.map((day, index) =>
    index === 0 ? day : { ...day, ...firstDay }
  )
}
const updateDayTime = (
  subActivityIndex: number,
  index: number,
  type: 'start' | 'end',
  value: string
) => {
  const sub = subActivities.value[subActivityIndex]
  if (!sub) return
  const day = sub.selectedDays[index]
  if (!day) return

  if (type === 'start') {
    day.startTime = value
  } else {
    day.endTime = value
  }

  if (sameTimeForAll.value) {
    applySameTime(subActivityIndex)
  }
}
const addSubActivity = () => {
  const today = new Date()
  const formattedToday = today.toISOString().split('T')[0] as string

  const index = subActivities.value.length // index ใหม่ของ subActivity

  subActivities.value.push({
    subActivityName: '',
    roomName: [],
    seats: 0,
    lecturer: '',
    detailActivity: '',
    departments: ['CS', 'SE', 'ITDI', 'AAI'],
    years: ['1', '2', '3', '4'],
    activityDateInternal: [formattedToday],
    selectedDays: [],
    totalHours: 0,
  })

  generateDaysInRange([formattedToday], index)

  watch(
    () => subActivities.value[index]?.selectedDays,
    (newVal) => {
      console.log('⏱️ selectedDays changed for subActivity', index, newVal)
    },
    { deep: true }
  )
}
const isNumber = (event: KeyboardEvent) => {
  const charCode = event.which ? event.which : event.keyCode

  if (charCode < 48 || charCode > 57) {
    event.preventDefault()
  }
}
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
const thaiLocale = {
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
}

const validatePositive = (field: 'seats', index?: number) => {
  if (field === 'seats' && typeof index === 'number' && subActivities.value[index]) {
    if (!subActivities.value[index].seats || subActivities.value[index].seats < 0) {
      subActivities.value[index].seats = 0
    }
  }
}

const removeSubActivity = (index: number) => {
  subActivities.value.splice(index, 1)
}
const props = defineProps<{
  imageFile: File | null
  activity?: { file?: string | null }
}>()
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
  const activityItems = subActivities.value.map((sub) => {
    const dates = sub.selectedDays.map((day) => ({
      date: day.date,
      stime: day.startTime,
      etime: day.endTime,
    }))
    return {
      name: sub.subActivityName,
      hour: Number(sub.totalHours),
      maxParticipants: Number(sub.seats),
      rooms: sub.roomName,
      dates,
      studentYears: sub.years.map((y) => parseInt(y, 10)),
      majors: sub.departments,
      operator: sub.lecturer,
      description: sub.detailActivity,
    }
  })

  const foodVotes = foodMenu.value.map((food) => ({
    foodName: food.name,
    vote: 0,
  }))

  const payload = {
    type: 'many',
    name: activityName.value,
    activityState: 'planning',
    skill: skill ?? '',
    activityItems,
    foodVotes,
  }

  console.log('📦 payload ที่จะส่ง:', payload)

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
          console.log('อัปโหลดรูปสําเร็จ')
        } else {
          console.log('อัปโหลดรูปไม่สําเร็จ')
        }
      } catch (uploadErr) {
        console.error('Upload image failed:', uploadErr)
      }
    }

    await goToPageTable()
    await goToPageTable()
  } catch (err) {
    console.error('Create activity failed:', err)
  }
}
watch(sameTimeForAll, (newValue) => {
  if (newValue) {
    subActivities.value.forEach((_, index) => {
      applySameTime(index)
    })
  }
})
onMounted(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const dateString = `${year}-${month}-${day}`
  addSubActivity()
  subActivities.value.forEach((sub, index) => {
    sub.activityDateInternal = [dateString]
    generateDaysInRange(sub.activityDateInternal, index)

    if (sameTimeForAll.value) {
      applySameTime(index)
    }
  })
})

</script>

<style scoped>
::v-deep(.q-field__control) {
  height: auto;
  background-color: white;
  align-items: center;
}

::v-deep(.q-field__prepend) {
  display: flex;
  align-items: center;
}

::v-deep(.q-icon) {
  font-size: 18px;
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
  margin-bottom: 20px;
  width: 100%;
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

.btnAddActivity {
  background-color: #ffffff;
  border-radius: 20px;
  height: 40px;
  width: 200px;
  font-size: 20px;
  display: flex;
  align-items: center;
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

.time-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.remove-icon {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.q-icon {
  cursor: pointer;
}

.btn-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-left: 200px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 25px;
  margin-top: 30px;
}
</style>
