<template>
  <q-page>
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
      <p class="label label_minWidth">ชื่อกิจกรรมหลัก :</p>
      <q-input outlined v-model="activityName" style="width: 600px" :disable="!isEditing" />
    </div>

    <!-- Date -->
    <SingleDate v-model="activityDateInternal" :disable="!isEditing" />

    <!-- Time -->
    <div class="input-group">
      <p class="label label_minWidth">เวลาที่จัดกิจกรรม:</p>
      <TimeSelector
        v-model:startTime="selectedTime"
        v-model:endTime="endTime"
        :formattedDate="formattedThaiDate"
        :disable="!isEditing"
      />
    </div>

    <!-- Activity Type -->
    <ActivityType v-model="activityType" class="input-group" :disable="!isEditing" />
    <HoursSelector v-model="totalHours" class="input-group" :disable="!isEditing" />
    <FoodSelector
      v-model:foodMenu="foodMenu"
      v-model:foodMenuDisplay="foodMenuDisplay"
      :disable="!isEditing"
    />

    <!-- Sub Activities List -->
    <div v-for="(subActivity, index) in subActivities" :key="index" class="sub-activity">
      <!-- Cancel (X) Icon -->
      <div
        class="remove-icon"
        :class="{ 'icon-disabled': !isEditing }"
        @click="isEditing && removeSubActivity(index)"
      >
        <q-icon
          name="close"
          size="35px"
          :color="isEditing ? 'red' : 'grey-5'"
          class="cursor-pointer"
        />
      </div>

      <!-- SubActivity Name -->
      <div class="input-group">
        <p class="label label_minWidth">ชื่อกิจกรรม :</p>
        <q-input
          outlined
          v-model="subActivity.subActivityName"
          style="width: 600px"
          :disable="!isEditing"
        />
      </div>
      <RoomSelector v-model="subActivity.roomName" class="input-group" :disable="!isEditing" />

      <!-- Room and Seats -->
      <div class="input-group">
        <p class="label label_minWidth">จำนวนที่รับ :</p>
        <q-input
          outlined
          style="width: 225px"
          v-model="subActivity.seats"
          type="number"
          @keypress="isNumber($event)"
          @blur="validatePositive('seats', index)"
          :disable="!isEditing"
        />
      </div>

      <!-- Department -->
      <DepartmentSelector
        v-model="subActivity.departments"
        class="input-group"
        :disable="!isEditing"
      />
      <!-- Year -->
      <YearSelector v-model="subActivity.years" class="input-group" :disable="!isEditing" />

      <!-- Lecturer -->
      <div class="input-group">
        <p class="label label_minWidth">วิทยากร :</p>
        <q-input
          outlined
          v-model="subActivity.lecturer"
          style="width: 100%"
          :disable="!isEditing"
        />
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
          :disable="!isEditing"
        />
      </div>

      <!-- Add Activity Button -->
    </div>
    <div class="btn-container">
      <q-btn class="btnAddActivity" @click="addSubActivity" :disable="!isEditing">
        <p class="label">
          <q-icon name="add" size="20px" />
          เพิ่มกิจกรรม
        </p>
      </q-btn>
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
          >ยกเลิก</q-btn
        >

        <q-btn class="btnsecces" @click="saveChanges">บันทึก</q-btn>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import FoodSelector from 'src/pages/admin-page/activity/CreateActivity/Form/FoodSelector.vue'
import HoursSelector from 'src/pages/admin-page/activity/CreateActivity/Form/HoursSelector.vue'
import SingleDate from 'src/pages/admin-page/activity/CreateActivity/Form/SingleDate.vue'
import TimeSelector from 'src/pages/admin-page/activity/CreateActivity/Form/TimeSelector.vue'
import ChangeStatusDialog from 'src/pages/admin-page/activity/ActivityDetail/ActivityDetail/ChangeStatusDialog.vue'
import RoomSelector from 'src/pages/admin-page/activity/CreateActivity/Form/RoomSelector.vue'
import DepartmentSelector from 'src/pages/admin-page/activity/CreateActivity/Form/DepartmentSelector.vue'
import YearSelector from 'src/pages/admin-page/activity/CreateActivity/Form/YearSelector.vue'
import ActivityType from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityType.vue'
import type { Activity } from 'src/types/activity'
import type { Food } from 'src/types/food'
import { ActivityService } from 'src/services/activity'
import cloneDeep from 'lodash/cloneDeep'
import type ImageDetail from './ImageDetail.vue'

const props = defineProps<{
  activity: Activity | null
  isEditing: boolean
  imageRef?: InstanceType<typeof ImageDetail>
}>()
const emit = defineEmits<{
  (e: 'update:isEditing', value: boolean): void
  (e: 'saved', fileName?: string): void // ✅ ส่ง fileName กลับ
}>()

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
const originalActivity = ref<Activity | null>(null)
const activityLoaded = ref(false)
const activityType = ref('')
const showChangeStatusDialog = ref(false)
const activityName = ref('')
const totalHours = ref<number>(0)
const subActivities = ref<SubActivity[]>([])
const activityDateInternal = ref('')
const endTime = ref<string>('00:00')
const selectedTime = ref<string>('00:00')
const hour = ref<number>(0)
const minute = ref<number>(0)
const endHour = ref<number>(0)
const endMinute = ref<number>(0)
const foodMenuDisplay = ref('')
const foodMenu = ref<Food[]>([])
const activityStatus = ref('กำลังวางแผน')
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

const saveChanges = async () => {
  emit('update:isEditing', false)

  if (!props.activity?.id) {
    console.error('ไม่พบ activity id')
    return
  }

  const updated: Partial<Activity> = cloneDeep(props.activity)

  updated.name = activityName.value
  updated.skill = activityType.value === 'prep' ? 'hard' : 'soft'
  updated.activityState = statusReverseMap[activityStatus.value] || 'planning'
  updated.foodVotes = foodMenu.value.map((f) => {
    const existingVote = updated.foodVotes?.find(vote => vote.foodName === f.name);
    return {
      foodName: f.name,
      vote: existingVote ? existingVote.vote : 0  
    };
  });

  const date = activityDateInternal.value
  const stime = selectedTime.value
  const etime = endTime.value

  updated.activityItems = subActivities.value.map((sub) => ({
    name: sub.subActivityName,
    hour: Number(totalHours.value),
    maxParticipants: Number(sub.seats),
    rooms: sub.roomName,
    description: sub.detailActivity,
    operator: sub.lecturer,
    majors: sub.departments.map(String),
    studentYears: sub.years.map((y) => Number(y)),
    dates: [{ date, stime, etime }],
  }))

  try {
    const result = await ActivityService.updateOne(updated)

    // ✅ ถ้าบันทึกข้อมูลกิจกรรมสำเร็จ → อัปโหลดรูป
    if ((result === 200 || result === 201) && props.imageRef) {
      const file = props.imageRef.getSelectedFile?.()
      const fileName = props.imageRef.getSelectedFileName?.()
      const oldFile = props.activity?.file ?? ''

      if (file && fileName) {
        // ✅ ลบรูปเก่า (ถ้ามี และชื่อไม่ตรงกับรูปใหม่)
        if (oldFile && oldFile !== fileName) {
          try {
            await ActivityService.deleteImage(props.activity.id, oldFile)
            console.log('🗑 ลบรูปเก่าเรียบร้อย:', oldFile)
          } catch (err) {
            console.warn('⚠️ ลบรูปเก่าไม่สำเร็จ:', err)
          }
        }

        // ✅ อัปโหลดรูปใหม่
        try {
          const uploadResult = await ActivityService.uploadImage(props.activity.id, file)
          if (uploadResult.status === 200 || uploadResult.status === 201) {
            emit('saved', uploadResult.fileName)
            return
          } else {
            console.warn('⚠️ รูปใหม่อัปโหลดไม่สำเร็จ')
          }
        } catch (uploadErr) {
          console.error('❌ Upload image failed:', uploadErr)
        }
      }
    }

    emit('saved')
  } catch (err) {
    console.error('❌ ไม่สามารถอัปเดตกิจกรรมได้:', err)
  }
}


const handleStatusChange = (newStatus: string) => {
  activityStatus.value = newStatus
}
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
  const a = props.activity
  if (!a) return

  originalActivity.value = cloneDeep(a)
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

  // ✅ เช็กก่อนว่า activityItems มีข้อมูล
  if (a.activityItems?.length) {
    const firstItem = a.activityItems[0]
    if (!firstItem) return

    // ✅ วันที่
    const firstDate = firstItem.dates?.[0]?.date
    if (firstDate) {
      activityDateInternal.value = firstDate
    }

    // ✅ เวลา
    const firstDateTime = firstItem.dates?.[0]
    if (firstDateTime) {
      selectedTime.value = firstDateTime.stime
      endTime.value = firstDateTime.etime
    }
    totalHours.value = firstItem.hour ?? 0
    subActivities.value = a.activityItems.map((item) => ({
      subActivityName: item.name ?? '',
      roomName: Array.isArray(item.rooms) ? item.rooms : [],
      seats: item.maxParticipants ?? 0,
      lecturer: item.operator ?? '',
      detailActivity: item.description ?? '',
      departments: item.majors?.map(String) ?? [],
      years: item.studentYears?.map(String) ?? [],
    }))
  }

  activityLoaded.value = true
})
const resetFormToOriginal = () => {
  const a = originalActivity.value
  if (!a) return

  activityName.value = a.name ?? ''
  activityType.value = a.skill === 'hard' ? 'prep' : a.skill === 'soft' ? 'academic' : ''
  activityStatus.value = statusMap[a.activityState ?? 'planning'] ?? 'กำลังวางแผน'

  foodMenu.value =
    a.foodVotes?.map((f) => ({
      id: '',
      name: f.foodName,
    })) ?? []
  foodMenuDisplay.value = foodMenu.value.map((f) => f.name).join(', ')

  const firstItem = a.activityItems?.[0]
  if (firstItem?.dates?.[0]) {
    activityDateInternal.value = firstItem.dates[0].date ?? ''
    selectedTime.value = firstItem.dates[0].stime ?? '00:00'
    endTime.value = firstItem.dates[0].etime ?? '00:00'
  }

  totalHours.value = firstItem?.hour ?? 0

  subActivities.value =
    a.activityItems?.map((item) => ({
      subActivityName: item.name ?? '',
      roomName: Array.isArray(item.rooms) ? item.rooms : [],
      seats: item.maxParticipants ?? 0,
      lecturer: item.operator ?? '',
      detailActivity: item.description ?? '',
      departments: item.majors?.map(String) ?? [],
      years: item.studentYears?.map(String) ?? [],
    })) ?? []
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
.department-btn {
  width: 80px;
  height: 40px;
  border-radius: 50px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  background-color: #ffffff;
  margin-right: 10px;
}
.active-btn {
  background-color: #d0e4ff !important;
}
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 25px;
  margin-top: 30px;
  margin-bottom: 100px;
  width: 100%;
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
.icon-disabled {
  pointer-events: none;
  opacity: 0.6;
}
</style>
