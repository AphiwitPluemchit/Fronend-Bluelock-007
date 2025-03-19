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

    <!-- Date -->
    <SingleDate v-model="activityDateInternal" />

    <!-- Time -->
    <div class="input-group">
      <p class="label label_minWidth">เวลาที่จัดกิจกรรม:</p>
      <TimeSelector
        v-model:startTime="selectedTime"
        v-model:endTime="endTime"
        :formattedDate="formattedThaiDate"
      />
    </div>
    <!-- Activity Type -->
    <ActivityType v-model="activityType" class="input-group" />
    <HoursSelector v-model="totalHours" class="input-group" />
    <FoodSelector v-model:foodMenu="foodMenu" class="input-group" />

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
        <q-input outlined v-model="subActivity.subActivityName" style="width: 600px" />
      </div>

      <!-- Room and Seats -->
      <Room v-model="subActivity.roomName" class="input-group" />

      <div class="input-group">
        <p class="label label_minWidth">จำนวนที่รับ :</p>
        <q-input
          outlined
          style="width: 225px"
          v-model="subActivity.seats"
          type="number"
          @keypress="isNumber($event)"
          @blur="validatePositive('seats', index)"
        />
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
        <q-input
          type="textarea"
          rows="10"
          outlined
          v-model="subActivity.detailActivity"
          style="width: 100%"
        />
      </div>

      <!-- Add Activity Button -->
    </div>
    <div class="btn-container">
      <q-btn class="btnAddActivity" @click="addSubActivity">
        <p class="label">
          <q-icon name="add" size="20px" />
          เพิ่มข้อกิจกรรม
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
import { computed, onMounted, ref, watch } from 'vue'
import FoodSelector from 'src/pages/admin-page/activity/CreateActivity/Form/FoodSelector.vue'
import HoursSelector from 'src/pages/admin-page/activity/CreateActivity/Form/HoursSelector.vue'
import SingleDate from 'src/pages/admin-page/activity/CreateActivity/Form/SingleDate.vue'
import TimeSelector from 'src/pages/admin-page/activity/CreateActivity/Form/TimeSelector.vue'
import Room from 'src/pages/admin-page/activity/CreateActivity/Form/RoomSelector.vue'
import YearSelector from 'src/pages/admin-page/activity/CreateActivity/Form/YearSelector.vue'
import DepartmentSelector from 'src/pages/admin-page/activity/CreateActivity/Form/DepartmentSelector.vue'
import ActivityType from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityType.vue'
import { ActivityService } from 'src/services/activity'
import { useRouter } from 'vue-router'
import type { Food } from 'src/types/food'

const router = useRouter()

onMounted(() => {})

const goToActivitiesManagement = async () => {
  await router.push('/ActivitiesManagement')
}
interface SubActivity {
  subActivityName: string
  roomName: string[]
  seats: number
  lecturer: string
  detailActivity: string
  departments: string[]
  years: string[]
}

const addSubActivity = () => {
  subActivities.value.push({
    subActivityName: '',
    roomName: [],
    seats: 0,
    lecturer: '',
    detailActivity: '',
    departments: [],
    years: [],
  })
}
const activityType = ref('')
const activityName = ref('')
const totalHours = ref(0)
const foodMenu = ref<Food[]>([])
const subActivities = ref<SubActivity[]>([])
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

const isNumber = (event: KeyboardEvent) => {
  const charCode = event.which ? event.which : event.keyCode

  if (charCode < 48 || charCode > 57) {
    event.preventDefault()
  }
}
const formattedThaiDate = computed(() => {
  if (!activityDateInternal.value) return ''

  const parts = activityDateInternal.value.split('-') // แยก YYYY-MM-DD
  if (parts.length !== 3) return ''

  const [year, month, day] = parts
  if (!year || !month || !day) return ''

  const monthIndex = parseInt(month, 10) - 1
  if (monthIndex < 0 || monthIndex >= thaiLocale.months.length) return ''

  const thaiMonth = thaiLocale.months[monthIndex]
  const thaiYear = parseInt(year, 10) + 543 // แปลง ค.ศ. เป็น พ.ศ.

  return `${parseInt(day, 10)} ${thaiMonth} ${thaiYear}`
})

// ✅ Thai locale สำหรับเดือน
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

const validatePositive = (field: 'totalHours' | 'seats', index?: number) => {
  if (field === 'totalHours') {
    if (!totalHours.value || totalHours.value < 0) {
      totalHours.value = 0
    }
  } else if (field === 'seats' && typeof index === 'number' && subActivities.value[index]) {
    if (!subActivities.value[index].seats || subActivities.value[index].seats < 0) {
      subActivities.value[index].seats = 0
    }
  }
}

const removeSubActivity = (index: number) => {
  subActivities.value.splice(index, 1)
}
const submitActivity = async () => {


  const skillMap: Record<string, 'hard' | 'soft' | null> = {
    prep: 'hard',
    academic: 'soft',
    '': null,
  }
  const skill = skillMap[activityType.value] ?? null
  const activityItems = subActivities.value.map((sub) => {

    return {
      name: sub.subActivityName,
      hour: Number(totalHours.value),
      maxParticipants: Number(sub.seats),
      rooms: sub.roomName,
      dates: [
        {
          date: activityDateInternal.value,
          stime: selectedTime.value,
          etime: endTime.value,
        },
      ],
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
    id: '',
    type: 'many',
    name: activityName.value,
    activityState: 'planning',
    skill: skill ?? '',
    file: 'image.jpg',
    activityItems,
    foodVotes,
  }

  console.log('📦 payload ที่จะส่ง:', payload)

  try {
    await ActivityService.createOne(payload)
    alert('✅ สร้างกิจกรรมสำเร็จ')
    await router.push('/ActivitiesManagement')
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการสร้างกิจกรรม:', error)
    console.log(payload)
  }
}
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
