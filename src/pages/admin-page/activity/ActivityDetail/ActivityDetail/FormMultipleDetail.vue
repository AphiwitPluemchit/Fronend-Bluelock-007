<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { QInput } from 'quasar'
import cloneDeep from 'lodash/cloneDeep'
import type { Food } from 'src/types/food'
import type ImageDetail from './ImageDetail.vue'
import type { Activity } from 'src/types/activity'
import { ActivityService } from 'src/services/activity'
import ActivityForm_Food from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Food.vue'
import ActivityForm_Hour from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Hour.vue'
import ActivityForm_Room from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Room.vue'
import ActivityForm_Type from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Type.vue'
import ActivityForm_Seats from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Seats.vue'
import ActivityForm_Major from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Major.vue'
import ActivityForm_ActivityDate from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_ActivityDate.vue'
import ActivityForm_ActivityTime from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_ActivityTime.vue'
import ActivityForm_StudentYears from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_StudentYears.vue'
import ActivityForm_CloseRegisDate from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_CloseRegisDate.vue'
import ChangeStatusDialog from 'src/pages/admin-page/activity/ActivityDetail/ActivityDetail/ChangeStatusDialog.vue'
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

const activityStatus = ref('')
const activityName = ref('')
const activityType = ref('')
const formattedCloseRegisDate = ref('')
const foodMenu = ref<Food[]>([])
const foodMenuDisplay = ref('')
const originalActivity = ref<Activity | null>(null)
const activityLoaded = ref(false)
const showChangeStatusDialog = ref(false)
const subActivities = ref<SubActivity[]>([])
const sameTimeForAll = ref(false)
const showCancelDialog = ref(false)
const showSuccessDialog = ref(false)
const activityNameError = ref('')
const activityNameInput = ref<InstanceType<typeof QInput> | null>(null)
const formTop = ref<HTMLElement | null>(null)
const defaultTime = ref({
  startTime: '00:00',
  endTime: '00:00',
})
const props = defineProps<{
  activity: Activity | null
  isEditing: boolean
  imageRef?: InstanceType<typeof ImageDetail>
}>()
const emit = defineEmits<{
  (e: 'update:isEditing', value: boolean): void
  (e: 'saved', fileName?: string): void
  (e: 'scroll-to-top'): void
}>()
const enterEditMode = async () => {
  emit('update:isEditing', true)
  await nextTick()
  emit('scroll-to-top')
}
const openCancelDialog = () => {
  showCancelDialog.value = true
}
//ใช้ในการเปลี่ยนสถานะ
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
// ใช้กับปุ่มเวลาเดิมทุกวัน
const applySameTime = (subActivityIndex: number) => {
  const sub = subActivities.value[subActivityIndex]
  if (!sub) return
  const days = sub.selectedDays
  const firstDay = days[0]
  if (!firstDay) return

  const { startTime, endTime, startHour, startMinute, endHour, endMinute } = firstDay

  sub.selectedDays = days.map((day, index) =>
    index === 0
      ? day
      : {
          ...day,
          startTime,
          endTime,
          startHour,
          startMinute,
          endHour,
          endMinute,
        },
  )
}
const updateDayTime = (
  subActivityIndex: number,
  index: number,
  type: 'start' | 'end',
  value: string,
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
watch(sameTimeForAll, (newValue) => {
  if (newValue) {
    subActivities.value.forEach((_, index) => {
      applySameTime(index)
    })
  }
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
//ลบกิจกรรมย่อย
const removeSubActivity = (index: number) => {
  subActivities.value.splice(index, 1)
}

//ใช้กับปุ่มบันทึก ส่งข้อมูลไปหลังบ้าน
const saveChanges = async () => {
  if (!props.activity?.id) {
    console.error('ไม่พบ activity id')
    return
  }
  const updated: Partial<Activity> = cloneDeep(props.activity)
  activityNameError.value = ''
  if (!activityName.value.trim()) {
    activityNameError.value = 'กรุณากรอกชื่อกิจกรรมหลัก'

    await nextTick()
    activityNameInput.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  updated.name = activityName.value
  updated.skill = activityType.value === 'prep' ? 'hard' : 'soft'
  updated.endDateEnroll = formattedCloseRegisDate.value
  updated.activityState = statusReverseMap[activityStatus.value] || 'planning'
  updated.foodVotes = foodMenu.value.map((f) => {
    const existingVote = updated.foodVotes?.find((vote) => vote.foodName === f.name)
    return {
      foodName: f.name,
      vote: existingVote ? existingVote.vote : 0,
    }
  })

  updated.activityItems = subActivities.value.map((sub) => ({
    name: sub.subActivityName,
    hour: Number(sub.totalHours),
    maxParticipants: Number(sub.seats),
    rooms: sub.roomName,
    description: sub.detailActivity,
    operator: sub.lecturer,
    majors: sub.departments.map(String),
    studentYears: sub.years.map((y) => Number(y)),
    dates: sub.selectedDays.map((day) => ({
      date: day.date,
      stime: day.startTime,
      etime: day.endTime,
    })),
  }))

  try {
    const result = await ActivityService.updateOne(updated)

    if ((result === 200 || result === 201) && props.imageRef) {
      const file = props.imageRef.getSelectedFile?.()
      const fileName = props.imageRef.getSelectedFileName?.()
      const oldFile = props.activity?.file ?? ''

      if (file && fileName) {
        if (oldFile && oldFile !== fileName) {
          try {
            await ActivityService.deleteImage(props.activity.id, oldFile)
            console.log('🗑 ลบรูปเก่าเรียบร้อย:', oldFile)
          } catch (err) {
            console.warn('⚠️ ลบรูปเก่าไม่สำเร็จ:', err)
          }
        }

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
    showSuccessDialog.value = true
    emit('update:isEditing', false)
    setTimeout(() => {
      showSuccessDialog.value = false
    }, 1000)
  } catch (err) {
    console.error('❌ ไม่สามารถอัปเดตกิจกรรมได้:', err)
  }
}

onMounted(() => {
  const a = props.activity
  if (!a) return

  originalActivity.value = cloneDeep(a)
  activityName.value = a.name ?? ''
  activityType.value = a.skill === 'hard' ? 'prep' : a.skill === 'soft' ? 'academic' : ''
  formattedCloseRegisDate.value = a.endDateEnroll ?? ''
  if (a.activityState) {
    activityStatus.value = statusMap[a.activityState] || 'กำลังวางแผน'
  }

  foodMenu.value =
    a.foodVotes?.map((f) => ({
      id: '',
      name: f.foodName,
    })) ?? []

  foodMenuDisplay.value = foodMenu.value.map((f) => f.name).join(', ')

  if (a.activityItems?.length) {
    subActivities.value = a.activityItems.map((item) => {
      const dates = item.dates ?? []

      return {
        subActivityName: item.name ?? '',
        roomName: Array.isArray(item.rooms) ? item.rooms : [],
        seats: item.maxParticipants ?? 0,
        lecturer: item.operator ?? '',
        detailActivity: item.description ?? '',
        departments: item.majors?.map(String) ?? [],
        years: item.studentYears?.map(String) ?? [],
        activityDateInternal: dates.map((d) => d.date),
        selectedDays: dates.map((d) => {
          const [startHourStr, startMinuteStr] = (d.stime ?? '00:00').split(':')
          const [endHourStr, endMinuteStr] = (d.etime ?? '00:00').split(':')

          const startHour = Number(startHourStr ?? '0')
          const startMinute = Number(startMinuteStr ?? '0')
          const endHour = Number(endHourStr ?? '0')
          const endMinute = Number(endMinuteStr ?? '0')

          return {
            date: d.date,
            formattedDate: formatThaiDate(d.date),
            startTime: d.stime ?? '00:00',
            endTime: d.etime ?? '00:00',
            startHour,
            startMinute,
            endHour,
            endMinute,
          }
        }),
        totalHours: item.hour ?? 0,
      }
    })
  }

  activityLoaded.value = true
})

const resetFormToOriginal = () => {
  const a = originalActivity.value
  if (!a) return

  activityName.value = a.name ?? ''
  activityType.value = a.skill === 'hard' ? 'prep' : a.skill === 'soft' ? 'academic' : ''
  activityStatus.value = statusMap[a.activityState ?? 'planning'] ?? 'กำลังวางแผน'
  formattedCloseRegisDate.value = a.endDateEnroll ?? ''

  foodMenu.value =
    a.foodVotes?.map((f) => ({
      id: '',
      name: f.foodName,
    })) ?? []

  foodMenuDisplay.value = foodMenu.value.map((f) => f.name).join(', ')

  subActivities.value =
    a.activityItems?.map((item) => {
      const dates = item.dates ?? []

      return {
        subActivityName: item.name ?? '',
        roomName: Array.isArray(item.rooms) ? item.rooms : [],
        seats: item.maxParticipants ?? 0,
        lecturer: item.operator ?? '',
        detailActivity: item.description ?? '',
        totalHours: item.hour ?? 0,
        departments: item.majors?.map(String) ?? [],
        years: item.studentYears?.map(String) ?? [],
        activityDateInternal: dates.map((d) => d.date),
        selectedDays: dates.map((d) => {
          const [startHourStr, startMinuteStr] = (d.stime ?? '09:00').split(':')
          const [endHourStr, endMinuteStr] = (d.etime ?? '16:00').split(':')

          const startHour = Number(startHourStr ?? '0')
          const startMinute = Number(startMinuteStr ?? '0')
          const endHour = Number(endHourStr ?? '0')
          const endMinute = Number(endMinuteStr ?? '0')

          return {
            date: d.date,
            formattedDate: formatThaiDate(d.date),
            startTime: d.stime ?? '09:00',
            endTime: d.etime ?? '16:00',
            startHour,
            startMinute,
            endHour,
            endMinute,
          }
        }),
      }
    }) ?? []
}
</script>

<template>
  <q-page>
    <!-- Status -->
    <div class="input-group" ref="formTop">
      <p class="label label_minWidth">สถานะ:</p>
      <q-badge :class="statusClass" class="status-btn">
        <div align="center" style="font-size: 20px">{{ activityStatus }}</div>
      </q-badge>
      <q-btn
        v-if="props.isEditing && activityStatus != 'เสร็จสิ้น'"
        class="btnchange"
        label="เปลี่ยน"
        @click="showChangeStatusDialog = true"
        :disable="!isEditing"
      />
    </div>
    <ChangeStatusDialog
      v-model="showChangeStatusDialog"
      :currentStatus="activityStatus"
      @confirm="handleStatusChange"
    />

    <!-- Activity Name -->
    <div class="input-group">
      <p class="label label_minWidth" :class="{ 'label-error-shift': activityNameError !== '' }">
        ชื่อกิจกรรมหลัก :
      </p>
      <div class="input-container">
        <q-input
          ref="activityNameInput"
          outlined
          v-model="activityName"
          class="input-max-600 fix-q-input-height"
          :error="activityNameError !== ''"
          hide-bottom
          :disable="!isEditing"
        />
        <div v-if="activityNameError" class="text-negative text-subtitle2 q-mt-xs">
          {{ activityNameError }}
        </div>
      </div>
    </div>

    <!-- Activity Type -->
    <ActivityForm_Type v-model="activityType" class="input-group" :disable="!isEditing" />
    <ActivityForm_CloseRegisDate
      v-model="formattedCloseRegisDate"
      class="input-group"
      :disable="!isEditing"
    />
    <ActivityForm_Food
      v-model:foodMenu="foodMenu"
      v-model:foodMenuDisplay="foodMenuDisplay"
      :disable="!isEditing"
    />

    <!-- Sub Activities List -->
    <div
      v-for="(subActivity, index) in subActivities"
      :key="index"
      class="sub-activity"
      style="margin-top: 15px"
    >
      <!-- Remove Icon -->
      <div class="input-group">
        <div class="input-container" style="display: flex; justify-content: flex-end">
          <q-icon
            name="close"
            size="35px"
            color="red"
            class="cursor-pointer"
            @click="removeSubActivity(index)"
          />
        </div>
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

      <!-- Date -->
      <ActivityForm_ActivityDate
        v-model="subActivity.activityDateInternal"
        @update:modelValue="(dates) => generateDaysInRange(dates, index)"
        :disable="!isEditing"
      />

      <!-- Time -->
      <div class="input-group">
        <p class="label label_minWidth" style="align-self: flex-start">เวลาที่จัดกิจกรรม :</p>
        <div class="day-time-container">
          <q-checkbox
            class="checkbox-left"
            v-model="sameTimeForAll"
            label="เวลาเดิมทุกวัน"
            :disable="!isEditing"
          />
          <div v-if="subActivity.selectedDays.length > 0">
            <div v-for="(day, dIndex) in subActivity.selectedDays" :key="day.date">
              <ActivityForm_ActivityTime
                v-model:startTime="day.startTime"
                v-model:endTime="day.endTime"
                :disable="!isEditing"
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
              :disable="!isEditing"
            />
          </div>
        </div>
      </div>

      <ActivityForm_Hour
        v-model="subActivity.totalHours"
        class="input-group"
        :disable="!isEditing"
      />
      <ActivityForm_Room v-model="subActivity.roomName" class="input-group" :disable="!isEditing" />
      <ActivityForm_Seats
        v-model.number="subActivity.seats"
        class="input-group"
        :disable="!isEditing"
      />
      <ActivityForm_Major
        v-model="subActivity.departments"
        class="input-group"
        :disable="!isEditing"
      />
      <ActivityForm_StudentYears
        v-model="subActivity.years"
        class="input-group"
        :disable="!isEditing"
      />

      <!-- Lecturer -->
      <div class="input-group">
        <p class="label label_minWidth">วิทยากร :</p>
        <q-input
          outlined
          v-model="subActivity.lecturer"
          class="input-max-600"
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
          class="input-max-600"
          :disable="!isEditing"
        />
      </div>
    </div>

    <!-- Add SubActivity Button -->
    <div class="btn-container" v-if="props.isEditing">
      <q-btn
        class="btnAddActivity"
        style="margin-bottom: 100px; background-color: #3676f9"
        @click="addSubActivity"
        :disable="!isEditing"
      >
        <p class="label text-white">
          <q-icon name="add" size="20px" />
          เพิ่มกิจกรรม
        </p>
      </q-btn>
    </div>

    <!-- Save / Cancel Button -->
    <div class="button-group">
      <q-btn v-if="!props.isEditing" class="btnedit" label="แก้ไข" @click="enterEditMode" />
      <template v-else>
        <q-btn class="btnreject" label="ยกเลิก" @click="openCancelDialog" />
        <q-btn class="btnsecces" label="บันทึก" @click="saveChanges" />
      </template>
    </div>

    <!-- Success Dialog -->
    <q-dialog v-model="showSuccessDialog" persistent>
      <div class="q-pa-md text-h6 text-center successDialog">บันทึกสำเร็จ</div>
    </q-dialog>

    <CancelDialog
      v-model="showCancelDialog"
      @confirm="
        () => {
          resetFormToOriginal()
          emit('update:isEditing', false)
          showCancelDialog = false
        }
      "
    />
  </q-page>
</template>

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
.fix-q-input-height ::v-deep(.q-icon) {
  font-size: 16px;
}
.input-max-600 {
  width: 600px;
}
.fix-q-input-height ::v-deep(.q-field__control) {
  height: 40px !important;
  min-height: 40px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  display: flex;
  align-items: center;
}

.fix-q-input-height ::v-deep(.q-field__append) {
  align-items: center;
  display: flex;
}
.input-group p {
  align-self: center;
  margin: 0;
  line-height: normal;
  text-align: right;
}

.input-group {
  display: flex;
  align-items: center; /* ✅ ทำให้ label กับ input อยู่กลางแนวเดียวกัน */
  gap: 25px;
  margin-bottom: 20px;
  width: 100%;
  flex-wrap: wrap;
}

.label {
  font-size: 20px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  line-height: 40px; /* ใช้ line-height เท่ากับความสูง */
  margin: 0;
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
  margin-bottom: 20px;
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

.active-btn {
  background-color: #d0e4ff !important;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 25px;
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

.successDialog {
  background-color: white;
  max-width: 200px;
  max-height: 100px;
}
</style>
