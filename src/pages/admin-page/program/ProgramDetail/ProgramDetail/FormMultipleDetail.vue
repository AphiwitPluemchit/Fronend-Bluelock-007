<!-- eslint-disable @typescript-eslint/consistent-type-imports -->
<script setup lang="ts">
import { computed, nextTick, onMounted, Ref, ref, watch } from 'vue'
import { QInput } from 'quasar'
import cloneDeep from 'lodash/cloneDeep'
import type { Food } from 'src/types/food'
import type ImageDetail from './ImageDetail.vue'
import type { Program } from 'src/types/program'
import { ProgramService } from 'src/services/program'
import ProgramForm_Food from 'src/pages/admin-page/program/CreateProgram/Form/programForm_Food.vue'
import ProgramForm_Hour from 'src/pages/admin-page/program/CreateProgram/Form/programForm_Hour.vue'
import ProgramForm_Room from 'src/pages/admin-page/program/CreateProgram/Form/programForm_Room.vue'
import ProgramForm_Type from 'src/pages/admin-page/program/CreateProgram/Form/programForm_Type.vue'
import ProgramForm_Seats from 'src/pages/admin-page/program/CreateProgram/Form/programForm_Seats.vue'
import ProgramForm_Major from 'src/pages/admin-page/program/CreateProgram/Form/programForm_Major.vue'
import ProgramForm_ProgramDate from 'src/pages/admin-page/program/CreateProgram/Form/programForm_ProgramDate.vue'
import ProgramForm_ProgramTime from 'src/pages/admin-page/program/CreateProgram/Form/programForm_ProgramTime.vue'
import ProgramForm_StudentYears from 'src/pages/admin-page/program/CreateProgram/Form/programForm_StudentYears.vue'
import ProgramForm_CloseRegisDate from 'src/pages/admin-page/program/CreateProgram/Form/programForm_CloseRegisDate.vue'
import ChangeStatusDialog from 'src/pages/admin-page/program/ProgramDetail/ProgramDetail/ChangeStatusDialog.vue'
import CancelDialog from 'src/components/Dialog/CancelDialog.vue'
import ProgramForm_Form from 'src/pages/admin-page/program/CreateProgram/Form/programForm_Form.vue'
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
//ใช้สำหรับแบบประเมิน
const formStore = useFormStore()
const selectedFormIds = ref<string[]>([])
const oldChildFormId = ref<string | null>(null)
const isIndexable = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object'

const toValidId = (v: unknown): string | null => {
  if (typeof v === 'string') {
    const s = v.trim()
    if (!s || s === '0' || s === 'null' || s === 'undefined' || /^0+$/.test(s)) return null
    return /^[a-f0-9]{24}$/i.test(s) ? s : null
  }
  if (typeof v === 'number') return v > 0 ? String(v) : null
  return null
}

const getProgramFormId = (a: unknown): string | null => {
  if (!isIndexable(a)) return null
  const fids = a['formsId']
  if (typeof fids === 'string') return toValidId(fids)
  if (Array.isArray(fids) && fids.length > 0) return toValidId(fids[0])
  const legacy = a['formId']
  if (typeof legacy === 'string') return toValidId(legacy)
  const maybeForm = a['form']
  if (isIndexable(maybeForm)) {
    return toValidId(maybeForm['id']) ?? toValidId(maybeForm['_id'])
  }
  return null
}
const getExistingProgramFormId = (): string | null => {
  const a = props.program as unknown
  if (!isIndexable(a)) return null

  // รองรับทั้ง formId, formsId (string/array), และ form.{id|_id}
  const formsId = a['formsId']
  if (typeof formsId === 'string') return toValidId(formsId)
  if (Array.isArray(formsId) && formsId.length > 0) return toValidId(formsId[0])

  const legacy = a['formId']
  if (typeof legacy === 'string') return toValidId(legacy)

  const maybeForm = a['form']
  if (isIndexable(maybeForm)) {
    return toValidId(maybeForm['id']) ?? toValidId(maybeForm['_id'])
  }
  return null
}

const programStatus = ref('')
const programName = ref('')
const programType = ref('')
const formattedCloseRegisDate = ref('')
const foodMenu = ref<Food[]>([])
const foodMenuDisplay = ref('')
const originalProgram = ref<Program | null>(null)
const programLoaded = ref(false)
const showChangeStatusDialog = ref(false)
const subPrograms = ref<SubProgram[]>([])
const sameTimeForAll = ref(false)
const showCancelDialog = ref(false)
const showSuccessDialog = ref(false)

// check error
const programNameError = ref('')
const programNameRef = ref<InstanceType<typeof QInput> | null>(null)
const lecturerErrors = ref<string[]>([])
const lecturerRefs = ref<Record<number, InstanceType<typeof QInput> | null>>({})
const subProgramNameErrors = ref<string[]>([])
const subProgramNameRefs = ref<Record<number, InstanceType<typeof QInput> | null>>({})
const closedateError = ref<string>('')
const hourErrors = ref<string[]>([])
const seatErrors = ref<string[]>([])
const roomErrors = ref<string[]>([])
const dateErrors = ref<string[]>([])
const dateRefs = ref<Record<number, InstanceType<typeof ProgramForm_ProgramDate> | null>>({})
const closedateRef = ref<InstanceType<typeof ProgramForm_CloseRegisDate> | null>(null)
const seatRefs = ref<Record<number, InstanceType<typeof ProgramForm_Seats> | null>>({})
const majorRefs = ref<Record<number, InstanceType<typeof ProgramForm_Major> | null>>({})
const yearRefs = ref<Record<number, InstanceType<typeof ProgramForm_StudentYears> | null>>({})
const hourRefs = ref<Record<number, InstanceType<typeof ProgramForm_Hour> | null>>({})
const roomRefs = ref<Record<number, InstanceType<typeof ProgramForm_Room> | null>>({})

const formTop = ref<HTMLElement | null>(null)
const defaultTime = ref({
  startTime: '00:00',
  endTime: '00:00',
})
const props = defineProps<{
  program: Program | null
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
  programStatus.value = newStatus
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
  const engStatus = statusReverseMap[programStatus.value]
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
const addSubProgram = () => {
  const index = subPrograms.value.length

  subPrograms.value.push({
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
    () => subPrograms.value[index]?.selectedDays,
    (newVal) => {
      console.log('⏱️ selectedDays changed for subProgram', index, newVal)
    },
    { deep: true },
  )
}

const generateDaysInRange = (selectedDates: string[], subProgramIndex: number) => {
  const sub = subPrograms.value[subProgramIndex]
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
const applySameTime = (subProgramIndex: number) => {
  const sub = subPrograms.value[subProgramIndex]
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
  subProgramIndex: number,
  index: number,
  type: 'start' | 'end',
  value: string,
) => {
  const sub = subPrograms.value[subProgramIndex]
  if (!sub) return
  const day = sub.selectedDays[index]
  if (!day) return

  if (type === 'start') {
    day.startTime = value
  } else {
    day.endTime = value
  }

  if (sameTimeForAll.value) {
    applySameTime(subProgramIndex)
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
    subPrograms.value.forEach((_, index) => {
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
const removeSubProgram = (index: number) => {
  subPrograms.value.splice(index, 1)
}
const pendingScrollQueue = ref<HTMLElement[]>([])
/**
 * ฟังก์ชันสำหรับ scroll ไปที่ element ที่อยู่บนสุดจากลิสต์ที่กำหนด
 * @param els - รายการของ elements ที่อาจมี null หรือ undefined
 */
function scrollToTopMost(els: (HTMLElement | null | undefined)[]): void {
  const validElements: HTMLElement[] = els.filter((el): el is HTMLElement => !!el)
  if (validElements.length === 0) return

  const container = document.querySelector('.form-section')
  if (!(container instanceof HTMLElement)) return

  const sorted = validElements.sort(
    (a, b) =>
      a.getBoundingClientRect().top -
      container.getBoundingClientRect().top -
      (b.getBoundingClientRect().top - container.getBoundingClientRect().top),
  )

  const topEl = sorted[0]
  if (!(topEl instanceof HTMLElement)) return

  container.scrollTo({
    top: topEl.offsetTop - container.offsetTop - 30,
    behavior: 'smooth',
  })

  const input = topEl.querySelector('input')
  if (input instanceof HTMLInputElement) {
    input.focus()
  }
}

const validateComponent = async (
  ref:
    | {
        validate?: () => Promise<boolean>
        focus?: () => void
        $el?: HTMLElement | null
      }
    | null
    | undefined,
  scrollTargets: (HTMLElement | null | undefined)[],
  hasErrorRef: Ref<boolean>,
  isFirstErrorHandledRef: Ref<boolean>,
): Promise<void> => {
  if (ref?.validate) {
    try {
      const valid = await ref.validate()
      if (!valid && ref.$el) {
        hasErrorRef.value = true
        scrollTargets.push(ref.$el)

        // ✅ ถ้าเป็น field แรกที่ error → เรียก focus (เช่น ปฏิทิน)
        if (!isFirstErrorHandledRef.value && ref.focus) {
          ref.focus()
          isFirstErrorHandledRef.value = true
        }
      }
    } catch (err) {
      console.error('Validation error:', err)
      hasErrorRef.value = true
      if (ref?.$el) {
        scrollTargets.push(ref.$el)
        if (!isFirstErrorHandledRef.value && ref.focus) {
          ref.focus()
          isFirstErrorHandledRef.value = true
        }
      }
    }
  }
}

const validateBeforeOpen = async (): Promise<boolean> => {
  const hasError = ref(false)
  const isFirstErrorHandled = ref(false)
  const scrollTargets: (HTMLElement | null | undefined)[] = []

  // ❌ ล้าง errors ทั้งหมด
  programNameError.value = ''
  lecturerErrors.value = []
  subProgramNameErrors.value = []
  hourErrors.value = []
  seatErrors.value = []
  roomErrors.value = []

  // ✅ 1. ชื่อกิจกรรมหลัก
  if (!programName.value.trim()) {
    programNameError.value = 'กรุณากรอกชื่อกิจกรรมหลัก'
    hasError.value = true
    if (programNameRef.value?.$el) {
      scrollTargets.push(programNameRef.value.$el)
      if (!isFirstErrorHandled.value) isFirstErrorHandled.value = true
    }
  }
  // ✅ 2. วันที่ปิดลงทะเบียน (ให้ focus ปฏิทินเฉพาะถ้าเป็น error แรก)
  await validateComponent(closedateRef.value, scrollTargets, hasError, isFirstErrorHandled)

  // ✅ 3. SubPrograms ตรวจทีละ field แบบเรียงลำดับ
  for (let i = 0; i < subPrograms.value.length; i++) {
    const sub = subPrograms.value[i]!

    // 3.1 ชื่อกิจกรรม
    // if (!sub.subProgramName?.trim()) {
    //   subProgramNameErrors.value[i] = 'กรุณากรอกชื่อกิจกรรม'
    //   hasError.value = true
    //   if (subProgramNameRefs.value[i]?.$el) {
    //     scrollTargets.push(subProgramNameRefs.value[i]?.$el)
    //     if (!isFirstErrorHandled.value) isFirstErrorHandled.value = true
    //   }
    // }

    // 3.2 วันที่จัดกิจกรรม
    await validateComponent(dateRefs.value[i], scrollTargets, hasError, isFirstErrorHandled)

    // 3.3 จำนวนชั่วโมง
    await validateComponent(hourRefs.value[i], scrollTargets, hasError, isFirstErrorHandled)

    // 3.4 ห้อง
    await validateComponent(roomRefs.value[i], scrollTargets, hasError, isFirstErrorHandled)

    // 3.5 จำนวนที่รับ
    await validateComponent(seatRefs.value[i], scrollTargets, hasError, isFirstErrorHandled)

    // 3.6 สาขา
    await validateComponent(majorRefs.value[i], scrollTargets, hasError, isFirstErrorHandled)

    // 3.7 ชั้นปี
    await validateComponent(yearRefs.value[i], scrollTargets, hasError, isFirstErrorHandled)

    // 3.8 วิทยากร
    if (!sub.lecturer?.trim()) {
      lecturerErrors.value[i] = 'กรุณากรอกชื่อวิทยากร'
      hasError.value = true
      if (lecturerRefs.value[i]?.$el) {
        scrollTargets.push(lecturerRefs.value[i]?.$el)
        if (!isFirstErrorHandled.value) isFirstErrorHandled.value = true
      }
    }
  }

  await nextTick()

  // ✅ Scroll + ตั้ง queue สำหรับ enter
  if (scrollTargets.length > 0) {
    scrollToTopMost(scrollTargets)
    pendingScrollQueue.value = scrollTargets.slice(1).filter((el): el is HTMLElement => el != null)
    return false
  }

  return !hasError.value
}

function scrollToNextInQueue() {
  const nextEl = pendingScrollQueue.value.shift()
  if (nextEl) {
    requestAnimationFrame(() => {
      nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      const input = nextEl.querySelector('input')
      if (input) {
        input.focus()
      }
    })
  }
}
const onEnterField = (
  type:
    | 'mainName'
    | 'subName'
    | 'lecturer'
    | 'seat'
    | 'hour'
    | 'closedate'
    | 'room'
    | 'major'
    | 'year'
    | 'date',
  index?: number,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isValid = (val: any) =>
    typeof val === 'string'
      ? val.trim() !== ''
      : typeof val === 'number'
        ? val > 0
        : Array.isArray(val)
          ? val.length > 0
          : false

  switch (type) {
    case 'mainName':
      if (isValid(programName.value)) {
        programNameError.value = ''
        void nextTick(() => scrollToNextInQueue())
      }
      break

    case 'closedate':
      if (isValid(formattedCloseRegisDate.value)) {
        closedateError.value = ''
        void nextTick(() => scrollToNextInQueue())
      }
      break

    case 'subName':
      if (index !== undefined && isValid(subPrograms.value[index]?.subProgramName)) {
        subProgramNameErrors.value[index] = ''
        void nextTick(() => scrollToNextInQueue())
      }
      break
    case 'date':
      if (index !== undefined && isValid(subPrograms.value[index]?.programDateInternal)) {
        dateErrors.value[index] = ''
        void nextTick(() => scrollToNextInQueue())
      }
      break
    case 'room':
      if (index !== undefined && isValid(subPrograms.value[index]?.roomName)) {
        roomErrors.value[index] = ''
        void nextTick(() => {
          scrollToNextInQueue()
          seatRefs.value[index]?.focus?.()
        })
      }
      break

    case 'seat':
      if (index !== undefined && isValid(subPrograms.value[index]?.seats)) {
        seatErrors.value[index] = ''
        void nextTick(() => {
          scrollToNextInQueue()
          seatRefs.value[index + 1]?.focus?.()
        })
      }
      break

    case 'hour':
      if (index !== undefined && isValid(subPrograms.value[index]?.totalHours)) {
        seatErrors.value[index] = ''
        void nextTick(() => {
          scrollToNextInQueue()
          seatRefs.value[index + 1]?.focus?.()
        })
      }
      break
    case 'lecturer':
      if (index !== undefined && isValid(subPrograms.value[index]?.lecturer)) {
        lecturerErrors.value[index] = ''
        void nextTick(() => scrollToNextInQueue())
      }
      break
  }
}
/** ถ้ามีการเปลี่ยนฟอร์ม: ลบลูกเก่า (ถ้าเป็นลูกจริง) แล้ว duplicate ใหม่จาก origin ที่เลือก */
const duplicateSelectedFormIfAny = async (): Promise<string | null> => {
  const selectedId = selectedFormIds.value?.[0] ?? null
  const prevChildId = getExistingProgramFormId()

  console.log('[dup][page] selectedId =', selectedId, 'prevChildId =', prevChildId)

  // ไม่มีการเลือกใหม่ → ใช้ของเดิมไป
  if (!selectedId) return prevChildId

  // หา origin ของที่เลือก และของของเดิม เพื่อตรวจว่า “เปลี่ยนฟอร์มหรือยัง”
  const selectedOriginId = (await formStore.resolveOriginId(selectedId)) ?? selectedId
  const prevOriginId = prevChildId ? await formStore.resolveOriginId(prevChildId) : null

  // ถ้ายังชี้ origin เดิมอยู่ → ไม่ต้องลบ/ไม่ต้อง duplicate ใช้ลูกเดิม
  if (prevChildId && prevOriginId && prevOriginId === selectedOriginId) {
    console.log('[dup][page] same origin → reuse prev child:', prevChildId)
    return prevChildId
  }

  // ลบลูกเก่า (เฉพาะถ้าเป็นลูกจริง ๆ) ก่อนค่อย duplicate ใหม่
  if (prevChildId) {
    try {
      const prev = await formStore.fetchFormById(prevChildId)
      if (prev && (prev as unknown as { isOrigin?: boolean }).isOrigin === false) {
        console.log('[dup][page] deleting old child =', prevChildId)
        await formStore.deleteForm(prevChildId)
      } else {
        console.log('[dup][page] skip delete (old is origin or not found)')
      }
    } catch (e) {
      console.warn('ลบฟอร์มลูกอันเก่าไม่สำเร็จ (ข้าม):', e)
      // ไม่ต้อง throw เพื่อไม่ให้บล็อกการ duplicate ใหม่
    }
  }

  // duplicate ใหม่จาก origin ที่เลือก
  const created = await formStore.duplicateForm(selectedOriginId)
  const newId = created?.id ?? null
  console.log('[dup][page] created new child id =', newId)
  return newId
}

const saveChanges = async () => {
  if (!props.program?.id) {
    console.error('ไม่พบ program id')
    return
  }

  try {
    if (programStatus.value === 'เปิดลงทะเบียน') {
      const valid = await validateBeforeOpen()
      if (!valid) return
    }
    const formIdForProgram = await duplicateSelectedFormIfAny()

    const updated: Partial<Program> = {
      ...cloneDeep(props.program),
      id: props.program.id,
      name: programName.value,
      skill: programType.value === 'prep' ? 'soft' : 'hard',
      endDateEnroll: formattedCloseRegisDate.value,
      programState: statusReverseMap[programStatus.value] || 'planning',
      foodVotes: foodMenu.value.map((f) => {
        const existingVote = props.program?.foodVotes?.find((vote) => vote.foodName === f.name)
        return {
          foodName: f.name,
          vote: existingVote ? existingVote.vote : 0,
        }
      }),
      ...(formIdForProgram ? { formId: formIdForProgram } : {}),
      programItems: subPrograms.value.map((sub, index) => {
        const existingItem = props.program?.programItems?.[index]
        return {
          ...(existingItem || {}),
          name: sub.subProgramName,
          hour: Number(sub.totalHours),
          maxParticipants: Number(sub.seats),
          rooms: sub.roomName,
          description: sub.detailProgram,
          operator: sub.lecturer,
          majors: sub.departments.map(String),
          studentYears: sub.years.map((y) => Number(y)),
          dates: sub.selectedDays.map((day) => ({
            date: day.date,
            stime: day.startTime,
            etime: day.endTime,
          })),
        }
      }),
    }
    await ProgramService.updateOne(updated)

    if (props.imageRef) {
      const file = props.imageRef.getSelectedFile?.()
      const oldFile = props.program?.file ?? ''
      const newFileName = props.imageRef.getSelectedFileName?.() ?? ''

      // Only upload if a new file is selected and its name is different from the old
      if (file && newFileName && oldFile !== newFileName) {
        console.log('📤 Uploading image with file:', file.name)
        try {
          const uploadResult = await ProgramService.uploadImage(updated.id!, file, oldFile)
          if (uploadResult.status === 200 || uploadResult.status === 201) {
            console.log('✅ Upload success:', uploadResult.fileName)
            emit('saved', uploadResult.fileName)
          } else {
            alert('⚠️ รูปใหม่อัปโหลดไม่สำเร็จ')
          }
        } catch (err) {
          console.error('❌ upload image failed:', err)
          alert('⚠️ รูปใหม่อัปโหลดไม่สำเร็จ')
        }
      } else {
        // No new file, or same file as old
        emit('saved', oldFile)
      }
    } else {
      emit('saved')
    }

    showSuccessDialog.value = true
    emit('update:isEditing', false)
  } catch (err) {
    console.error('❌ ไม่สามารถอัปเดตกิจกรรมได้:', err)
  }
}

onMounted(async () => {
  const a = props.program
  if (!a) return

  await formStore.fetchForms()

  const formId = getProgramFormId(props.program)
  selectedFormIds.value = formId ? [formId] : []
  oldChildFormId.value = formId ?? null

  // ✅ เพิ่มลูกเข้า store ถ้ายังไม่มี
  if (formId && !formStore.forms.some((f) => f.id === formId)) {
    const f = await formStore.fetchFormById(formId)
    if (f && !formStore.forms.some((x) => x.id === f.id)) {
      formStore.forms.unshift(f)
    }
  }

  originalProgram.value = cloneDeep(a)
  programName.value = a.name ?? ''
  programType.value = a.skill === 'soft' ? 'prep' : a.skill === 'hard' ? 'academic' : ''
  formattedCloseRegisDate.value = a.endDateEnroll ?? ''
  if (a.programState) {
    programStatus.value = statusMap[a.programState] || 'กำลังวางแผน'
  }

  foodMenu.value =
    a.foodVotes?.map((f) => ({
      id: '',
      name: f.foodName,
    })) ?? []

  foodMenuDisplay.value = foodMenu.value.map((f) => f.name).join(', ')

  if (a.programItems?.length) {
    subPrograms.value = a.programItems.map((item) => {
      const dates = item.dates ?? []

      return {
        subProgramName: item.name ?? '',
        roomName: Array.isArray(item.rooms) ? item.rooms : [],
        seats: item.maxParticipants ?? 0,
        lecturer: item.operator ?? '',
        detailProgram: item.description ?? '',
        departments: item.majors?.map(String) ?? [],
        years: item.studentYears?.map(String) ?? [],
        programDateInternal: dates.map((d) => d.date),
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

  programLoaded.value = true
})

const resetFormToOriginal = () => {
  const a = originalProgram.value
  if (!a) return

  programName.value = a.name ?? ''
  programType.value = a.skill === 'hard' ? 'prep' : a.skill === 'soft' ? 'academic' : ''
  programStatus.value = statusMap[a.programState ?? 'planning'] ?? 'กำลังวางแผน'
  formattedCloseRegisDate.value = a.endDateEnroll ?? ''
  foodMenu.value =
    a.foodVotes?.map((f) => ({
      id: '',
      name: f.foodName,
    })) ?? []

  foodMenuDisplay.value = foodMenu.value.map((f) => f.name).join(', ')

  subPrograms.value =
    a.programItems?.map((item) => {
      const dates = item.dates ?? []

      return {
        subProgramName: item.name ?? '',
        roomName: Array.isArray(item.rooms) ? item.rooms : [],
        seats: item.maxParticipants ?? 0,
        lecturer: item.operator ?? '',
        detailProgram: item.description ?? '',
        totalHours: item.hour ?? 0,
        departments: item.majors?.map(String) ?? [],
        years: item.studentYears?.map(String) ?? [],
        programDateInternal: dates.map((d) => d.date),
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

onMounted(() => {
  watch(programName, (val) => {
    if (val.trim() !== '') {
      programNameError.value = ''
    }
  })
  watch(
    subPrograms,
    (subs) => {
      subs.forEach((sub, i) => {
        if (sub.subProgramName.trim()) {
          subProgramNameErrors.value[i] = ''
        }
        if (sub.lecturer.trim()) {
          lecturerErrors.value[i] = ''
        }
      })
    },
    { deep: true },
  )
})
</script>

<template>
  <q-page class="q-pa-md">
    <!-- Status -->
    <!-- Status -->
    <div class="input-group no-wrap status-group" ref="formTop">
      <p class="label label_minWidth">สถานะ :</p>
      <div class="status-inline-group">
        <q-badge :class="statusClass" class="status-btn">
          <div align="center" class="status-text" style="font-size: 20px">{{ programStatus }}</div>
        </q-badge>
        <q-btn
          v-if="props.isEditing && programStatus !== 'เสร็จสิ้น'"
          class="btnchange"
          label="เปลี่ยน"
          :disable="!isEditing"
          @click="showChangeStatusDialog = true"
          flat
          unelevated
          style="min-width: unset; width: auto"
        />
      </div>
    </div>

    <ChangeStatusDialog
      v-model="showChangeStatusDialog"
      :currentStatus="programStatus"
      @confirm="handleStatusChange"
    />

    <!-- Program Name -->
    <!-- FINISH -->
    <div class="input-group">
      <p class="label label_minWidth" :class="{ 'label-error-shift': programNameError !== '' }">
        ชื่อกิจกรรมหลัก :
      </p>
      <div class="input-container">
        <q-input
          ref="programNameRef"
          outlined
          v-model="programName"
          class="fix-q-input-height"
          :error="programNameError !== ''"
          hide-bottom
          :disable="!isEditing"
          @keyup.enter="onEnterField('mainName')"
        />
        <div v-if="programNameError" class="text-negative text-subtitle2 q-mt-xs">
          {{ programNameError }}
        </div>
      </div>
    </div>

    <!-- Program Type -->
    <ProgramForm_Type v-model="programType" class="input-group" :disable="!isEditing" />
    <ProgramForm_CloseRegisDate
      :ref="(el) => (closedateRef = el as InstanceType<typeof ProgramForm_CloseRegisDate>)"
      v-model="formattedCloseRegisDate"
      class="input-group"
      :disable="!isEditing"
      @enter="onEnterField('closedate')"
    />

    <ProgramForm_Food
      v-model:foodMenu="foodMenu"
      v-model:foodMenuDisplay="foodMenuDisplay"
      :disable="!isEditing"
    />
    <ProgramForm_Form v-model="selectedFormIds" :disable="!isEditing" :forms="formStore.forms" />

    <!-- Sub Programs List -->
    <div v-for="(subProgram, index) in subPrograms" :key="index" class="sub-program">
      <!-- Cancel (X) Icon -->
      <div
        v-if="index > 0"
        class="button-group"
        style="display: flex; justify-content: flex-end; margin-bottom: 20px"
      >
        <q-btn class="btnreject" @click="removeSubProgram(index)">ลบกิจกรรมย่อย</q-btn>
      </div>

      <!-- SubProgram Name -->
      <!-- FINISH -->
      <div class="input-group">
        <p
          class="label label_minWidth"
          :class="{
            'label-error-shift':
              subProgramNameErrors[index] !== undefined && subProgramNameErrors[index] !== '',
          }"
        >
          ชื่อกิจกรรม :
        </p>
        <div class="input-container">
          <q-input
            ref="subProgramNameRefs"
            outlined
            v-model="subProgram.subProgramName"
            class="fix-q-input-height"
            @keyup.enter="onEnterField('subName', index)"
            :disable="!isEditing"
            :error="
              subProgramNameErrors[index] !== undefined && subProgramNameErrors[index] !== ''
            "
          />

          <div v-if="subProgramNameErrors[index]" class="text-negative text-subtitle2 q-mt-xs">
            {{ subProgramNameErrors[index] }}
          </div>
        </div>
      </div>

      <!-- Date -->
      <!-- FINISH -->
      <ProgramForm_ProgramDate
        :ref="(el) => (dateRefs[index] = el as InstanceType<typeof ProgramForm_ProgramDate>)"
        v-model="subProgram.programDateInternal"
        @update:modelValue="(dates) => generateDaysInRange(dates, index)"
        :disable="!isEditing"
        @enter="onEnterField('date', index)"
      />
      <!-- Time -->
      <!-- FINISH -->
      <div class="input-group">
        <p class="label label_minWidth" style="align-self: flex-start">เวลาที่จัดกิจกรรม :</p>
        <div class="day-time-container">
          <q-checkbox
            class="checkbox-left"
            v-model="sameTimeForAll"
            label="เวลาเดิมทุกวัน"
            :disable="!isEditing"
          />
          <div v-if="subProgram.selectedDays.length > 0">
            <div v-for="(day, dIndex) in subProgram.selectedDays" :key="day.date">
              <ProgramForm_ProgramTime
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
            <ProgramForm_ProgramTime
              v-model:startTime="defaultTime.startTime"
              v-model:endTime="defaultTime.endTime"
              formattedDate=""
              :disable="!isEditing"
            />
          </div>
        </div>
      </div>
      <!-- Hour -->
      <!-- FINISH -->
      <ProgramForm_Hour
        :ref="(el) => (hourRefs[index] = el as InstanceType<typeof ProgramForm_Hour>)"
        v-model="subProgram.totalHours"
        class="input-group"
        :disable="!isEditing"
        @keyup.enter="onEnterField('hour', index)"
      />

      <!-- Room --><!-- FINISH -->
      <ProgramForm_Room
        :ref="(el) => (roomRefs[index] = el as InstanceType<typeof ProgramForm_Room>)"
        v-model="subProgram.roomName"
        class="input-group"
        :disable="!isEditing"
        @enter="onEnterField('room', index)"
      />

      <!-- Seats -->
      <!-- FINISH -->
      <ProgramForm_Seats
        :ref="(el) => (seatRefs[index] = el as InstanceType<typeof ProgramForm_Seats>)"
        v-model.number="subProgram.seats"
        class="input-group"
        :disable="!isEditing"
        @keyup.enter="onEnterField('seat', index)"
      />
      <!-- Major -->
      <!-- FINISH -->
      <ProgramForm_Major
        :ref="(el) => (majorRefs[index] = el as InstanceType<typeof ProgramForm_Major>)"
        v-model="subProgram.departments"
        class="input-group"
        :disable="!isEditing"
      />
      <!-- Year -->
      <!-- FINISH -->
      <ProgramForm_StudentYears
        :ref="(el) => (yearRefs[index] = el as InstanceType<typeof ProgramForm_StudentYears>)"
        v-model="subProgram.years"
        class="input-group"
        :disable="!isEditing"
      />

      <!-- Lecturer -->
      <!-- FINISH -->
      <div class="input-group">
        <p
          class="label label_minWidth"
          :class="{
            'label-error-shift':
              lecturerErrors[index] !== undefined && lecturerErrors[index] !== '',
          }"
        >
          วิทยากร :
        </p>
        <div class="input-container">
          <q-input
            ref="lecturerRefs"
            outlined
            v-model="subProgram.lecturer"
            class="fix-q-input-height"
            @keyup.enter="onEnterField('lecturer', index)"
            :disable="!isEditing"
            :error="lecturerErrors[index] !== undefined && lecturerErrors[index] !== ''"
          />
          <div v-if="lecturerErrors[index]" class="text-negative text-subtitle2 q-mt-xs">
            {{ lecturerErrors[index] }}
          </div>
        </div>
      </div>

      <!-- Detail Program -->
      <!-- FINISH -->
      <div class="input-group">
        <p style="align-self: flex-start" class="label label_minWidth">รายละเอียดอื่นๆ :</p>
        <q-input
          type="textarea"
          rows="10"
          outlined
          v-model="subProgram.detailProgram"
          class="input-container"
          :disable="!isEditing"
        />
      </div>
    </div>

    <!-- Add SubProgram Button -->
    <div class="btn-container" v-if="props.isEditing">
      <p class="label label_minWidth btn-label-empty"></p>
      <q-btn class="btnAddProgram" @click="addSubProgram" style="background-color: #3676f9">
        <p class="label text-white">เพิ่มกิจกรรมย่อย</p>
      </q-btn>
    </div>

    <!-- Save / Cancel Button -->
    <div class="button-group">
      <q-btn v-if="!props.isEditing" class="btnedit" label="แก้ไข" @click="enterEditMode" />
      <template v-else>
        <q-btn class="btnreject" label="ยกเลิก" @click="openCancelDialog" />
        <q-btn class="btnconfirm" label="บันทึก" @click="saveChanges" />
      </template>
    </div>

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
.status-group {
  align-items: flex-start;
}
.status-btn {
  display: flex;
  align-items: center; /* จัดกลางแนวตั้ง */
  justify-content: center; /* จัดกลางแนวนอน */
  height: 40px;
  width: 200px;
  font-size: 20px;
  border-radius: 50px;
  padding: 0 16px;
  text-align: center;
}
.status-inline-group {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  flex-wrap: nowrap;
}

/* ปรับเฉพาะปุ่มไม่ให้ยืดเต็มบรรทัด */
.btnchange {
  min-width: auto !important;
  width: auto !important;
  padding: 4px 12px;
  font-size: 14px;
  background-color: #000;
  color: white;
  border-radius: 10px;
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
  margin-left: 4px !important; /* ลดจากค่าปกติ 8px หรือมากกว่า */
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
.remove-icon {
  max-width: 100%;
  text-align: right;
  cursor: pointer;
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
@media (max-width: 445px) {
  .input-group.no-wrap.status-group {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 8px !important;
  }

  .status-group .label_minWidth {
    min-width: unset !important;
    width: 100% !important;
    text-align: left !important;
  }

  .status-group .status-btn,
  .status-group .btnchange {
    margin-left: 0 !important;
  }
  .btnchange {
    padding: 2px 10px;
    font-size: 14px;
    background-color: #000;
    color: white;
    border-radius: 10px;
  }
}
</style>
