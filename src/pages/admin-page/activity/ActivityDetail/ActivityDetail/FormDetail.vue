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
    <FoodSelector
      v-model:foodMenu="foodMenu"
      v-model:foodMenuDisplay="foodMenuDisplay"
      class="input-group"
      :disable="!isEditing"
    />

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
      <q-btn v-if="!props.isEditing" class="btnedit" @click="emit('update:isEditing', true)">
        แก้ไข
      </q-btn>

      <template v-else>
        <q-btn
          class="btnreject"
          @click="
            () => {
              resetFormToOriginal()
              emit('update:isEditing', false)
            }
          "
        >
          ยกเลิก
        </q-btn>

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
import type { Food } from 'src/types/food'
import { ActivityService } from 'src/services/activity'
import cloneDeep from 'lodash/cloneDeep'
import type ImageDetail from './ImageDetail.vue'

const originalActivity = ref<Activity | null>(null)
const props = defineProps<{
  activity: Activity | null
  isEditing: boolean
  imageFile: File | null
  imageRef: InstanceType<typeof ImageDetail> | undefined
}>()

const emit = defineEmits<{
  (e: 'update:isEditing', value: boolean): void
  (e: 'saved', fileName?: string): void // ✅ ส่ง fileName กลับ
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
const roomName = ref<string[]>([])
const activityStatus = ref('กำลังวางแผน') // ค่าปัจจุบันของสถานะ
const foodMenu = ref<Food[]>([])
const foodMenuDisplay = ref('')

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
const resetFormToOriginal = () => {
  const a = originalActivity.value
  if (!a) return

  activityName.value = a.name ?? ''
  activityType.value = a.skill === 'hard' ? 'prep' : a.skill === 'soft' ? 'academic' : ''

  if (a.activityState) {
    activityStatus.value = statusMap[a.activityState] || 'กำลังวางแผน'
  }

  foodMenu.value =
    a.foodVotes?.map((f) => ({
      id: '',
      name: f.foodName,
    })) ?? []

  foodMenuDisplay.value = foodMenu.value.map((f) => f.name).join(', ')

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
  const engStatus = statusReverseMap[activityStatus.value]
  switch (engStatus) {
    case 'planning':
      return 'status-planning'
    case 'open':
      return 'status-open'
    case 'close':
      return 'status-closed'
    case 'success':
      return 'status-completed'
    case 'cancel':
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

// const isEditing = ref(false) // เปลี่ยนค่าเริ่มต้นเป็น false (ฟอร์มถูกล็อก)

// const cancelEdit = () => {
//   isEditing.value = false
// }
const statusMap: Record<string, string> = {
  planning: 'กำลังวางแผน',
  open: 'เปิดลงทะเบียน',
  close: 'ปิดลงทะเบียน',
  cancel: 'ยกเลิก',
  success: 'เสร็จสิ้น',
}

const statusReverseMap: Record<string, string> = {
  กำลังวางแผน: 'planning',
  เปิดลงทะเบียน: 'open',
  ปิดลงทะเบียน: 'close',
  ยกเลิก: 'cancel',
  เสร็จสิ้น: 'success',
}

const saveChanges = async () => {
  emit('update:isEditing', false)

  if (!originalActivity.value?.id) {
    console.error('ไม่พบ activity id สำหรับการอัปเดต')
    return
  }

  const updated: Partial<Activity> = cloneDeep(originalActivity.value)
  updated.name = activityName.value
  updated.skill = activityType.value === 'prep' ? 'hard' : 'soft'
  updated.activityState = statusReverseMap[activityStatus.value] || 'planning'
  updated.foodVotes = foodMenu.value.map((f) => ({ foodName: f.name, vote: 1 }))

  if (updated.activityItems && updated.activityItems.length > 0) {
    updated.activityItems[0] = {
      ...updated.activityItems[0],
      name: activityName.value,
      hour: Number(totalHours.value),
      maxParticipants: Number(seats.value),
      rooms: roomName.value,
      description: detailActivity.value,
      operator: lecturer.value,
      majors: departments.value.map(String),
      studentYears: years.value.map((y) => Number(y)),
      dates: selectedDays.value.map((d) => ({
        date: d.date,
        stime: d.startTime,
        etime: d.endTime,
      })),
    }
  }

  try {
    const status = await ActivityService.updateOne(updated)

    if ((status === 200 || status === 201) && props.imageRef) {
      const file = props.imageRef.getSelectedFile?.()
      const fileName = props.imageRef.getSelectedFileName?.()
      const oldFile = props.activity?.file ?? ''

      if (file && fileName && fileName !== oldFile) {
        try {
          if (oldFile) {
            await ActivityService.deleteImage(originalActivity.value.id, oldFile)
            console.log('🗑 ลบรูปเก่าแล้ว:', oldFile)
          }

          const uploadResult = await ActivityService.uploadImage(originalActivity.value.id, file)

          if (uploadResult.status === 200 || uploadResult.status === 201) {
            emit('saved', uploadResult.fileName)
            return
          }
        } catch (uploadErr) {
          console.error('❌ Upload image failed:', uploadErr)
        }
      }
    }

    emit('saved')
  } catch (err) {
    console.error('❌ อัปเดตกิจกรรมไม่สำเร็จ:', err)
  }
}

onMounted(() => {
  const a = props.activity
  if (!a) return
  originalActivity.value = cloneDeep(a)

  activityName.value = a.name ?? ''
  activityType.value = a.skill === 'hard' ? 'prep' : a.skill === 'soft' ? 'academic' : ''

  // ✅ แปลง activityState (จาก backend) → ภาษาไทยสำหรับแสดงผล
  if (a.activityState) {
    activityStatus.value = statusMap[a.activityState] || 'กำลังวางแผน'
  }

  foodMenu.value =
    a.foodVotes?.map((f) => ({
      id: '',
      name: f.foodName,
    })) ?? []

  foodMenuDisplay.value = foodMenu.value.map((f) => f.name).join(', ')

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
