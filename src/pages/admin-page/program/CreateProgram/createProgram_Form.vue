<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import type { QInput } from 'quasar'
import { useRouter } from 'vue-router'
import type { Food } from 'src/types/food'
import { ProgramService } from 'src/services/program'
import ProgramForm_Hour from './Form/programForm_Hour.vue'
import ProgramForm_Room from './Form/programForm_Room.vue'
import ProgramForm_Food from './Form/programForm_Food.vue'
import ProgramForm_Type from './Form/programForm_Type.vue'
import ProgramForm_Major from './Form/programForm_Major.vue'
import ProgramForm_Form from './Form/programForm_Form.vue'
import ProgramForm_Seats from './Form/programForm_Seats.vue'
import ProgramForm_StudentYears from './Form/programForm_StudentYears.vue'
import ProgramForm_ProgramDate from './Form/programForm_ProgramDate.vue'
import ProgramForm_ProgramTime from './Form/programForm_ProgramTime.vue'
import ProgramForm_CloseRegisDate from './Form/programForm_CloseRegisDate.vue'
import CancelDialog from 'src/components/Dialog/CancelDialog.vue'
import { useFormStore } from 'src/stores/forms'

interface SubProgram {
  subProgramName: string
  roomName: string[]
  seats: number | null
  lecturer: string
  detailProgram: string
  departments: string[]
  years: string[]
  programDateInternal: string[]
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
const programName = ref('')
const programType = ref('prep')
const CloseRegisDates = ref('')
const foodMenu = ref<Food[]>([])
const selectedFormIds = ref<string[]>([])
const subProgram = ref<SubProgram[]>([])
const sameTimeForAll = ref(false)
const showCancelDialog = ref(false)
const programNameError = ref('')
const programNameInput = ref<InstanceType<typeof QInput> | null>(null)
const dateRefs = ref<Record<number, InstanceType<typeof ProgramForm_ProgramDate> | null>>({})
const defaultTime = ref({
  startTime: '00:00',
  endTime: '00:00',
})

const props = defineProps<{
  imageFile: File | null
  program?: { file?: string | null }
}>()
const openCancelDialog = () => {
  showCancelDialog.value = true
}
const removeSubProgram = (index: number) => {
  subProgram.value.splice(index, 1)
}
const goToPageTable = async () => {
  await router.push(`/Admin/ProgramManagement`)
}

const generateDaysInRange = (selectedDates: string[], subProgramIndex: number) => {
  const sub = subProgram.value[subProgramIndex]
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
const applySameTime = (subProgramIndex: number) => {
  const sub = subProgram.value[subProgramIndex]
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
  subProgramIndex: number,
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

  const sub = subProgram.value[subProgramIndex]
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
    applySameTime(subProgramIndex)
  }
}
watch(sameTimeForAll, (newValue) => {
  if (newValue) {
    subProgram.value.forEach((_, index) => {
      applySameTime(index)
    })
  }
})

// ใช้กับปุ่มเพิ่มโครงการ
const addSubProgram = () => {
  const index = subProgram.value.length

  subProgram.value.push({
    subProgramName: '',
    roomName: [],
    seats: null,
    lecturer: '',
    detailProgram: '',
    departments: ['CS', 'SE', 'ITDI', 'AAI'],
    years: ['1', '2', '3', '4'],
    programDateInternal: [],
    selectedDays: [],
    totalHours: null,
  })

  watch(
    () => subProgram.value[index]?.selectedDays,
    (newVal) => {
      console.log(' selectedDays changed for subProgram', index, newVal)
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
const submitProgram = async () => {
  programNameError.value = ''
  if (!programName.value.trim()) {
    programNameError.value = 'กรุณากรอกชื่อโครงการหลัก'
    await nextTick()
    programNameInput.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  const validDates = await Promise.all(
    subProgram.value.map((_, index) => dateRefs.value[index]?.validate?.() ?? true),
  )
  if (validDates.includes(false)) {
    return
  }

  const formIdForProgram = await duplicateSelectedFormIfAny()
  console.log('[submit] formIdForProgram =', formIdForProgram)

  const skillMap: Record<string, 'soft' | 'hard' | null> = {
    prep: 'soft',
    academic: 'hard',
    '': null,
  }
  const skill = skillMap[programType.value] ?? null
  const programItems = subProgram.value.map((sub) => {
    const dates = sub.selectedDays.map((day) => ({
      date: day.date,
      stime: day.startTime,
      etime: day.endTime,
    }))
    return {
      name: sub.subProgramName,
      hour: Number(sub.totalHours),
      maxParticipants: Number(sub.seats),
      rooms: sub.roomName,
      dates,
      studentYears: sub.years.map((y) => parseInt(y, 10)),
      majors: sub.departments,
      operator: sub.lecturer,
      description: sub.detailProgram,
    }
  })

  const foodVotes = foodMenu.value.map((food) => ({
    foodName: food.name,
    vote: 0,
  }))

  const payload = {
    name: programName.value,
    programState: 'planning',
    skill: skill ?? '',
    endDateEnroll: CloseRegisDates.value,
    programItems,
    foodVotes,
    ...(formIdForProgram ? { formId: formIdForProgram } : {}),
  }
  try {
    const { status, id } = await ProgramService.createOne(payload)

    if ((status === 200 || status === 201) && props.imageFile) {
      try {
        const uploadStatus = await ProgramService.uploadImage(
          id,
          props.imageFile,
          props.program?.file ?? undefined,
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
    console.error('Create program failed:', err)
  }
}

onMounted(() => {
  addSubProgram()
  watch(programName, (newVal) => {
    if (newVal && newVal.trim() !== '') {
      programNameError.value = ''
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

    <!-- Program Name -->
    <div class="input-group">
      <p class="label label_minWidth" :class="{ 'label-error-shift': programNameError !== '' }">
        ชื่อโครงการหลัก :
      </p>
      <div class="input-container">
        <q-input
          ref="programNameInput"
          outlined
          v-model="programName"
          class="fix-q-input-height"
          :error="programNameError !== ''"
          hide-bottom
        />
        <div v-if="programNameError" class="text-negative text-subtitle2 q-mt-xs">
          {{ programNameError }}
        </div>
      </div>
    </div>

    <ProgramForm_Type v-model="programType" class="input-group" />
    <ProgramForm_CloseRegisDate v-model="CloseRegisDates" class="input-group" />
    <ProgramForm_Food v-model:foodMenu="foodMenu" class="input-group" />
    <ProgramForm_Form v-model="selectedFormIds" :forms="formStore.forms" class="input-group" />

    <!-- Sub Program List -->
    <div v-for="(subProgram, index) in subProgram" :key="index">
      <!-- Cancel (X) Button -->
      <div
        v-if="index > 0"
        class="button-group"
        style="display: flex; justify-content: flex-end; margin-bottom: 20px"
      >
        <q-btn class="btnreject" @click="removeSubProgram(index)">ลบโครงการย่อย</q-btn>
      </div>

      <!-- SubProgram Name -->
      <div class="input-group">
        <p class="label label_minWidth">ชื่อโครงการ :</p>
        <q-input outlined v-model="subProgram.subProgramName" class="input-container" />
      </div>

      <!-- Date -->
      <ProgramForm_ProgramDate
        :ref="(el) => (dateRefs[index] = el as InstanceType<typeof ProgramForm_ProgramDate>)"
        v-model="subProgram.programDateInternal"
        @update:modelValue="(dates) => generateDaysInRange(dates, index)"
      />

      <!-- Time -->
      <div class="input-group">
        <p class="label label_minWidth" style="align-self: flex-start">เวลาที่จัดโครงการ :</p>
        <div>
          <q-checkbox v-model="sameTimeForAll" label="เวลาเดิมทุกวัน" class="tight-checkbox" />

          <div v-if="subProgram.selectedDays.length > 0">
            <div v-for="(day, dIndex) in subProgram.selectedDays" :key="day.date">
              <ProgramForm_ProgramTime
                v-model:startTime="day.startTime"
                v-model:endTime="day.endTime"
                :formattedDate="day.formattedDate"
                @update:startTime="(v: string) => updateDayTime(index, dIndex, 'start', v)"
                @update:endTime="(v: string) => updateDayTime(index, dIndex, 'end', v)"
              />
            </div>
          </div>

          <div v-else>
            <ProgramForm_ProgramTime
              v-model:startTime="defaultTime.startTime"
              v-model:endTime="defaultTime.endTime"
              formattedDate=""
            />
          </div>
        </div>
      </div>

      <ProgramForm_Hour v-model="subProgram.totalHours" class="input-group" />
      <ProgramForm_Room v-model="subProgram.roomName" class="input-group" />
      <ProgramForm_Seats v-model.number="subProgram.seats" class="input-group" />
      <ProgramForm_Major v-model="subProgram.departments" class="input-group" />
      <ProgramForm_StudentYears v-model="subProgram.years" class="input-group" />

      <div class="input-group">
        <p class="label label_minWidth">วิทยากร :</p>
        <q-input outlined v-model="subProgram.lecturer" class="input-container" />
      </div>

      <div class="input-group">
        <p style="align-self: flex-start" class="label label_minWidth">รายละเอียดอื่นๆ :</p>
        <q-input
          type="textarea"
          rows="10"
          outlined
          v-model="subProgram.detailProgram"
          class="input-container"
        />
      </div>
    </div>
    <div class="btn-container">
      <p class="label label_minWidth btn-label-empty"></p>
      <q-btn class="btnAddProgram" @click="addSubProgram" style="background-color: #3676f9">
        <p class="label text-white">เพิ่มโครงการย่อย</p>
      </q-btn>
    </div>
    <div class="button-group">
      <q-btn class="btnreject" @click="openCancelDialog">ยกเลิก</q-btn>
      <q-btn class="btnconfirm" @click="submitProgram">บันทึก</q-btn>
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
.btnAddProgram {
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
