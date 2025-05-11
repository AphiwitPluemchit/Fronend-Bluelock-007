<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Food } from 'src/types/food'
import { ActivityService } from 'src/services/activity'
import ActivityForm_Hour from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Hour.vue'
import ActivityForm_Room from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Room.vue'
import ActivityForm_Food from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Food.vue'
import ActivityForm_Type from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Type.vue'
import ActivityForm_Major from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Major.vue'
import ActivityForm_Seats from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Seats.vue'
import ActivityForm_StudentYears from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_StudentYears.vue'
import ActivityForm_ActivityDate from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_ActivityDate.vue'
import ActivityForm_ActivityTime from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_ActivityTime.vue'
import ActivityForm_CloseRegisDate from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_CloseRegisDate.vue'
import CancelDialog from 'src/components/Dialog/CancelDialog.vue'

interface SubActivity {
  subActivityName: string
  roomName: string[]
  seats: number | null
  lecturer: string
  detailActivity: string
  departments: string[]
  years: string[]
  activityDateInternal: string[]
  selectedDays: DayTimeSelection[]
  totalHours: number | null
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

const router = useRouter()
const activityName = ref('')
const activityType = ref('prep')
const CloseRegisDates = ref('')
const foodMenu = ref<Food[]>([])
const subActivities = ref<SubActivity[]>([])
const sameTimeForAll = ref(false)
const showCancelDialog = ref(false)
const defaultTime = ref({
  startTime: '00:00',
  endTime: '00:00',
})

const props = defineProps<{
  imageFile: File | null
  activity?: { file?: string | null }
}>()
const openCancelDialog = () => {
  showCancelDialog.value = true
}
const removeSubActivity = (index: number) => {
  subActivities.value.splice(index, 1)
}
const goToPageTable = async () => {
  await router.push(`/Admin/ActivitiesManagement`)
}

const generateDaysInRange = (selectedDates: string[], subActivityIndex: number) => {
  const sub = subActivities.value[subActivityIndex]
  if (!sub) return
  if (!selectedDates || selectedDates.length === 0) {
    sub.selectedDays = []
    return
  }
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

// ใช้กับปุ่มเวลาเดิมทุกวัน
const applySameTime = (subActivityIndex: number) => {
  console.log('🔁 applySameTime ถูกเรียก')

  const sub = subActivities.value[subActivityIndex]
  if (!sub) return

  const firstDay = sub.selectedDays[0]
  if (!firstDay) return

  console.log('📌 เวลาต้นแบบ:', firstDay.startTime, firstDay.endTime)

  for (let i = 1; i < sub.selectedDays.length; i++) {
    const day = sub.selectedDays[i]
    if (!day) continue // ✅ ป้องกัน undefined ก่อนใช้

    day.startTime = firstDay.startTime
    day.startHour = firstDay.startHour
    day.startMinute = firstDay.startMinute

    day.endTime = firstDay.endTime
    day.endHour = firstDay.endHour
    day.endMinute = firstDay.endMinute

    console.log(`✅ sync ไปยังวันที่ ${i + 1}:`, day.startTime, day.endTime)
  }
}
const delay = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms))
const updateDayTime = async (
  subActivityIndex: number,
  index: number,
  type: 'start' | 'end',
  value: string | undefined,
) => {
  if (typeof value !== 'string') return

  const parts = value.split(':')
  if (parts.length !== 2) return

  const [hStr, mStr] = parts as [string, string]
  if (!/^\d{2}$/.test(hStr) || !/^\d{2}$/.test(mStr)) return

  const hour = parseInt(hStr, 10)
  const minute = parseInt(mStr, 10)

  const sub = subActivities.value[subActivityIndex]
  const day = sub?.selectedDays[index]
  if (!day) return

  if (type === 'start') {
    day.startTime = value
    day.startHour = hour
    day.startMinute = minute
  } else {
    day.endTime = value
    day.endHour = hour
    day.endMinute = minute
  }

  if (sameTimeForAll.value && index === 0) {
    await delay(100) // ให้ time component มีเวลาอัปเดต
    applySameTime(subActivityIndex)
  }
}
watch(sameTimeForAll, (newValue) => {
  if (newValue) {
    subActivities.value.forEach((_, index) => {
      applySameTime(index)
    })
  }
})

// ใช้กับปุ่มเพิ่มกิจกรรม
const addSubActivity = () => {
  const index = subActivities.value.length

  subActivities.value.push({
    subActivityName: '',
    roomName: [],
    seats: null,
    lecturer: '',
    detailActivity: '',
    departments: ['CS', 'SE', 'ITDI', 'AAI'],
    years: ['1', '2', '3', '4'],
    activityDateInternal: [],
    selectedDays: [],
    totalHours: null,
  })

  watch(
    () => subActivities.value[index]?.selectedDays,
    (newVal) => {
      console.log('⏱️ selectedDays changed for subActivity', index, newVal)
    },
    { deep: true },
  )
}

// ใช้แปลงวันที่เป็นวันที่ไทย
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

// ใช้กับปุ่มยืนยันส่งไปหลังบ้าน
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
    endDateEnroll: CloseRegisDates.value,
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
  } catch (err) {
    console.error('Create activity failed:', err)
  }
}

onMounted(() => {
  addSubActivity()
})
</script>

<template>
  <q-page class="q-pa-md">
    <!-- Status -->
    <div class="input-group">
      <p class="label label_minWidth">สถานะ:</p>
      <q-badge class="status-btn"> กำลังวางแผน </q-badge>
    </div>

    <!-- Activity Name -->
    <div class="input-group">
      <p class="label label_minWidth">ชื่อกิจกรรมหลัก :</p>
      <q-input outlined v-model="activityName" class="input-max-600" />
    </div>

    <ActivityForm_Type v-model="activityType" class="input-group" />
    <ActivityForm_CloseRegisDate v-model="CloseRegisDates" class="input-group" />
    <ActivityForm_Food v-model:foodMenu="foodMenu" class="input-group" />

    <!-- Sub Activities List -->
    <div v-for="(subActivity, index) in subActivities" :key="index" class="sub-activity">
      <!-- Cancel (X) Icon -->
      <div class="remove-icon">
        <q-icon
          name="close"
          size="35px"
          color="red"
          class="cursor-pointer"
          @click="removeSubActivity(index)"
        />
      </div>

      <!-- SubActivity Name -->
      <div class="input-group">
        <p class="label label_minWidth">ชื่อกิจกรรม :</p>
        <q-input outlined v-model="subActivity.subActivityName" class="input-max-600" />
      </div>

      <!-- Date -->
      <ActivityForm_ActivityDate
        v-model="subActivity.activityDateInternal"
        @update:modelValue="(dates) => generateDaysInRange(dates, index)"
      />

      <!-- Time -->
      <div class="input-group">
        <p class="label label_minWidth" style="align-self: flex-start">เวลาที่จัดกิจกรรม :</p>
        <div class="day-time-container">
          <q-checkbox class="checkbox-left" v-model="sameTimeForAll" label="เวลาเดิมทุกวัน" />

          <div v-if="subActivity.selectedDays.length > 0">
            <div v-for="(day, dIndex) in subActivity.selectedDays" :key="day.date">
              <ActivityForm_ActivityTime
                v-model:startTime="day.startTime"
                v-model:endTime="day.endTime"
                :formattedDate="day.formattedDate"
                @update:startTime="(v: string) => updateDayTime(index, dIndex, 'start', v)"
                @update:endTime="(v: string) => updateDayTime(index, dIndex, 'end', v)"
              />
            </div>
          </div>

          <div v-else>
            <ActivityForm_ActivityTime
              v-model:startTime="defaultTime.startTime"
              v-model:endTime="defaultTime.endTime"
              formattedDate=""
            />
          </div>
        </div>
      </div>

      <ActivityForm_Hour v-model="subActivity.totalHours" class="input-group" />
      <ActivityForm_Room v-model="subActivity.roomName" class="input-group" />
      <ActivityForm_Seats v-model.number="subActivity.seats" class="input-group" />
      <ActivityForm_Major v-model="subActivity.departments" class="input-group" />
      <ActivityForm_StudentYears v-model="subActivity.years" class="input-group" />

      <div class="input-group">
        <p class="label label_minWidth">วิทยากร :</p>
        <q-input outlined v-model="subActivity.lecturer" class="input-max-600" />
      </div>

      <div class="input-group">
        <p style="align-self: flex-start" class="label label_minWidth">รายละเอียดอื่นๆ :</p>
        <q-input
          type="textarea"
          rows="10"
          outlined
          v-model="subActivity.detailActivity"
          class="input-max-600"
        />
      </div>
    </div>
    <div class="btn-container">
      <q-btn class="btnAddActivity" @click="addSubActivity" style="background-color: #3676f9">
        <p class="label text-white">เพิ่มกิจกรรม</p>
      </q-btn>
    </div>
    <div class="button-group">
      <q-btn class="btnreject" @click="openCancelDialog">ยกเลิก</q-btn>
      <q-btn class="btnsecces" @click="submitActivity">เสร็จสิ้น</q-btn>
    </div>

    <!-- Dialog -->
    <CancelDialog v-model="showCancelDialog"
     @confirm="goToPageTable"  />
  </q-page>
</template>

<style scoped>
.input-max-600 {
  max-width: 600px;
  width: 100%;
}

::v-deep(.q-field__control) {
  height: auto;
  background-color: white;
}

::v-deep(.q-icon) {
  font-size: 18px;
}

.responsive-input {
  width: 100%;
  max-width: 600px;
}

.input-group p {
  margin: 0;
  line-height: normal;
  text-align: left;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-bottom: 20px;
  width: 100%;
  flex-wrap: wrap;
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

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
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

.large-font {
  font-size: 100px;
}

/* Responsive behavior when screen ≤ 830px */
@media (max-width: 900px) {
  .input-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .label_minWidth {
    min-width: unset;
    width: 100%;
  }

  .input-max-600 {
    width: 100%;
  }
}
</style>
