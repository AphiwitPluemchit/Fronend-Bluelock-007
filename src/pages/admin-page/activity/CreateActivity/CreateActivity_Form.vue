<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import type { QInput } from 'quasar'
import { useRouter } from 'vue-router'
import type { Food } from 'src/types/food'
import { ActivityService } from 'src/services/activity'
import ActivityForm_Hour from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Hour.vue'
import ActivityForm_Room from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Room.vue'
import ActivityForm_Food from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Food.vue'
import ActivityForm_Type from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Type.vue'
import ActivityForm_Major from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Major.vue'
import ActivityForm_Form from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Form.vue'
import ActivityForm_Seats from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_Seats.vue'
import ActivityForm_StudentYears from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_StudentYears.vue'
import ActivityForm_ActivityDate from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_ActivityDate.vue'
import ActivityForm_ActivityTime from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_ActivityTime.vue'
import ActivityForm_CloseRegisDate from 'src/pages/admin-page/activity/CreateActivity/Form/ActivityForm_CloseRegisDate.vue'
import CancelDialog from 'src/components/Dialog/CancelDialog.vue'
import { useFormStore } from 'src/stores/forms'

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
const formStore = useFormStore()
const router = useRouter()
const activityName = ref('')
const activityType = ref('prep')
const CloseRegisDates = ref('')
const foodMenu = ref<Food[]>([])
const selectedFormIds = ref<string[]>([])
const subActivities = ref<SubActivity[]>([])
const sameTimeForAll = ref(false)
const showCancelDialog = ref(false)
const activityNameError = ref('')
const activityNameInput = ref<InstanceType<typeof QInput> | null>(null)
const dateRefs = ref<Record<number, InstanceType<typeof ActivityForm_ActivityDate> | null>>({})
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
  const sub = subActivities.value[subActivityIndex]
  if (!sub) return

  const firstDay = sub.selectedDays[0]
  if (!firstDay) return

  for (let i = 1; i < sub.selectedDays.length; i++) {
    const day = sub.selectedDays[i]
    if (!day) continue // ป้องกัน undefined ก่อนใช้

    day.startTime = firstDay.startTime
    day.startHour = firstDay.startHour
    day.startMinute = firstDay.startMinute

    day.endTime = firstDay.endTime
    day.endHour = firstDay.endHour
    day.endMinute = firstDay.endMinute
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
      console.log(' selectedDays changed for subActivity', index, newVal)
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

const duplicateSelectedFormIfAny = async (): Promise<string | null> => {
  const originFormId = selectedFormIds.value?.[0] ?? null
  console.log('[dup][page] selected originFormId =', originFormId)

  if (!originFormId) return null

  const newForm = await formStore.duplicateForm(originFormId)
  console.log('[dup][page] newForm =', newForm)

  const newId = newForm?.id ?? null
  console.log('[dup][page] newId =', newId)

  return newId
}

// ใช้กับปุ่มยืนยันส่งไปหลังบ้าน
const submitActivity = async () => {
  activityNameError.value = ''
  if (!activityName.value.trim()) {
    activityNameError.value = 'กรุณากรอกชื่อกิจกรรมหลัก'
    await nextTick()
    activityNameInput.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  const validDates = await Promise.all(
    subActivities.value.map((_, index) => dateRefs.value[index]?.validate?.() ?? true),
  )
  if (validDates.includes(false)) {
    return
  }

  const formIdForActivity = await duplicateSelectedFormIfAny()
  console.log('[submit] formIdForActivity =', formIdForActivity)

  const skillMap: Record<string, 'soft' | 'hard' | null> = {
    prep: 'soft',
    academic: 'hard',
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
    name: activityName.value,
    activityState: 'planning',
    skill: skill ?? '',
    endDateEnroll: CloseRegisDates.value,
    activityItems,
    foodVotes,
    ...(formIdForActivity ? { formId: formIdForActivity } : {}),
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
  watch(activityName, (newVal) => {
    if (newVal && newVal.trim() !== '') {
      activityNameError.value = ''
    }
  })
})
</script>

<template>
  <q-page class="q-pa-md">
    <!-- Status -->
    <div class="input-group no-wrap">
      <p class="label label_minWidth">สถานะ :</p>
      <q-badge class="status-btn">กำลังวางแผน</q-badge>
    </div>

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
          class="fix-q-input-height"
          :error="activityNameError !== ''"
          hide-bottom
        />
        <div v-if="activityNameError" class="text-negative text-subtitle2 q-mt-xs">
          {{ activityNameError }}
        </div>
      </div>
    </div>

    <ActivityForm_Type v-model="activityType" class="input-group" />
    <ActivityForm_CloseRegisDate v-model="CloseRegisDates" class="input-group" />
    <ActivityForm_Food v-model:foodMenu="foodMenu" class="input-group" />
    <ActivityForm_Form v-model="selectedFormIds" :forms="formStore.forms" class="input-group" />

    <!-- Sub Activities List -->
    <div v-for="(subActivity, index) in subActivities" :key="index">
      <!-- Cancel (X) Button -->
      <div
        v-if="index > 0"
        class="button-group"
        style="display: flex; justify-content: flex-end; margin-bottom: 20px"
      >
        <q-btn class="btnreject" @click="removeSubActivity(index)">ลบกิจกรรมย่อย</q-btn>
      </div>

      <!-- SubActivity Name -->
      <div class="input-group">
        <p class="label label_minWidth">ชื่อกิจกรรม :</p>
        <q-input outlined v-model="subActivity.subActivityName" class="input-container" />
      </div>

      <!-- Date -->
      <ActivityForm_ActivityDate
        :ref="(el) => (dateRefs[index] = el as InstanceType<typeof ActivityForm_ActivityDate>)"
        v-model="subActivity.activityDateInternal"
        @update:modelValue="(dates) => generateDaysInRange(dates, index)"
      />

      <!-- Time -->
      <div class="input-group">
        <p class="label label_minWidth" style="align-self: flex-start">เวลาที่จัดกิจกรรม :</p>
        <div>
          <q-checkbox v-model="sameTimeForAll" label="เวลาเดิมทุกวัน" class="tight-checkbox" />

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
        <q-input outlined v-model="subActivity.lecturer" class="input-container" />
      </div>

      <div class="input-group">
        <p style="align-self: flex-start" class="label label_minWidth">รายละเอียดอื่นๆ :</p>
        <q-input
          type="textarea"
          rows="10"
          outlined
          v-model="subActivity.detailActivity"
          class="input-container"
        />
      </div>
    </div>
    <div class="btn-container">
      <p class="label label_minWidth btn-label-empty"></p>
      <q-btn class="btnAddActivity" @click="addSubActivity" style="background-color: #3676f9">
        <p class="label text-white">เพิ่มกิจกรรมย่อย</p>
      </q-btn>
    </div>
    <div class="button-group">
      <q-btn class="btnreject" @click="openCancelDialog">ยกเลิก</q-btn>
      <q-btn class="btnconfirm" @click="submitActivity">บันทึก</q-btn>
    </div>

    <!-- Dialog -->
    <CancelDialog v-model="showCancelDialog" @confirm="goToPageTable" />
  </q-page>
</template>

<style scoped>
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
.btnAddActivity {
  background-color: #ffffff;
  border-radius: 20px;
  height: 40px;
  width: 200px;
  font-size: 20px;
  display: flex;
  align-items: center;
}
::v-deep(.q-field__control) {
  height: auto;
  background-color: white;
}

::v-deep(.q-icon) {
  font-size: 18px;
}
.fix-q-input-height ::v-deep(.q-icon) {
  font-size: 16px;
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
.tight-checkbox ::v-deep(.q-checkbox__label) {
  margin-left: 4px !important;
}
.input-group p {
  margin: 0;
  line-height: normal;
  text-align: left;
}
.label-error-shift {
  transform: translateY(-12px);
}
.no-wrap {
  flex-wrap: nowrap !important;
  white-space: nowrap;
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
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  line-height: 40px;
  margin: 0;
}
.label_minWidth {
  min-width: 200px;
}
.input-container {
  width: 660px;
  max-width: 100%;
}
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 25px;
  margin-right: 10px;
}

.btn-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

/* Media */
@media (max-width: 1880px) {
  .input-container {
    width: 530px;
    max-width: 100%;
  }
  .btn-container {
    justify-content: center !important;
    margin-left: 0 !important;
    width: 100%;
  }
  .label_minWidth {
    min-width: 180px !important;
  }
  .button-group {
    display: flex;
    justify-content: flex-end;
    gap: 25px;
    margin-right: 5px;
  }
}
@media (max-width: 860px) {
  .input-group.no-wrap {
    flex-direction: row !important;
    align-items: center !important;
    gap: 20px !important;
    margin-bottom: 10px !important;
  }

  .input-group:not(.no-wrap) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 10px !important;
    gap: 5px !important;
  }
  .input-container {
    width: 470px;
    max-width: 100%;
  }
  .label {
    justify-content: flex-start;
  }

  .label_minWidth {
    min-width: auto !important;
    width: auto !important;
    flex-shrink: 0;
  }
  .btn-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: 10px;
  }
  .btn-label-empty {
    display: none !important;
  }
  .remove-icon {
    display: flex;
    flex-direction: row !important;
    justify-content: flex-end !important;
    align-items: center;
    margin-top: 10px;
    width: 100%;
  }

  .remove-icon > .q-icon {
    font-size: 30px;
  }
  .label-error-shift {
    transform: translateY(0px);
  }
}
@media (max-width: 500px) {
  .input-group:not(.no-wrap) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 10px !important;
    gap: 5px !important;
  }
  .label {
    justify-content: flex-start;
  }
  .label-error-shift {
    transform: translateY(0px);
  }
  .label_minWidth {
    min-width: unset;
    width: 100%;
    text-align: left;
    padding-left: 0;
    margin-left: 0;
  }

  .btn-container {
    justify-content: center !important;
    margin-left: 0 !important;
    width: 100%;
  }
  .button-group {
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    width: 100%;
    gap: 10px;
    margin-top: 40px;
  }

  .button-group .btnreject,
  .button-group .btnconfirm {
    width: 100%;
  }
  .remove-icon {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    margin-left: auto;
    margin-top: 20px;
    padding-right: 5px;
  }
  .remove-icon > .q-icon {
    font-size: 30px;
  }

  .no-wrap .label_minWidth {
    min-width: unset !important;
    width: auto !important;
    flex-shrink: 0;
  }
}
</style>
