<!-- eslint-disable @typescript-eslint/consistent-type-imports -->
<script setup lang="ts">
import { computed, nextTick, onMounted, Ref, ref, watch } from 'vue'
import { QInput } from 'quasar'
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
const selectedFormIds = ref<string[]>([])
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

// check error
const activityNameError = ref('')
const activityNameRef = ref<InstanceType<typeof QInput> | null>(null)
const lecturerErrors = ref<string[]>([])
const lecturerRefs = ref<Record<number, InstanceType<typeof QInput> | null>>({})
const subActivityNameErrors = ref<string[]>([])
const subActivityNameRefs = ref<Record<number, InstanceType<typeof QInput> | null>>({})
const closedateError = ref<string>('')
const hourErrors = ref<string[]>([])
const seatErrors = ref<string[]>([])
const roomErrors = ref<string[]>([])
const dateErrors = ref<string[]>([])
const dateRefs = ref<Record<number, InstanceType<typeof ActivityForm_ActivityDate> | null>>({})
const closedateRef = ref<InstanceType<typeof ActivityForm_CloseRegisDate> | null>(null)
const seatRefs = ref<Record<number, InstanceType<typeof ActivityForm_Seats> | null>>({})
const majorRefs = ref<Record<number, InstanceType<typeof ActivityForm_Major> | null>>({})
const yearRefs = ref<Record<number, InstanceType<typeof ActivityForm_StudentYears> | null>>({})
const hourRefs = ref<Record<number, InstanceType<typeof ActivityForm_Hour> | null>>({})
const roomRefs = ref<Record<number, InstanceType<typeof ActivityForm_Room> | null>>({})
const formStore = useFormStore()
  
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

/**
 * ฟังก์ชันสำหรับตรวจสอบความถูกต้องของข้อมูลก่อนเปิดลงทะเบียน
 * @returns Promise<boolean> - true ถ้าข้อมูลถูกต้อง, false ถ้ามีข้อผิดพลาด
 */
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
  activityNameError.value = ''
  lecturerErrors.value = []
  subActivityNameErrors.value = []
  hourErrors.value = []
  seatErrors.value = []
  roomErrors.value = []

  // ✅ 1. ชื่อกิจกรรมหลัก
  if (!activityName.value.trim()) {
    activityNameError.value = 'กรุณากรอกชื่อกิจกรรมหลัก'
    hasError.value = true
    if (activityNameRef.value?.$el) {
      scrollTargets.push(activityNameRef.value.$el)
      if (!isFirstErrorHandled.value) isFirstErrorHandled.value = true
    }
  }
  // ✅ 2. วันที่ปิดลงทะเบียน (ให้ focus ปฏิทินเฉพาะถ้าเป็น error แรก)
  await validateComponent(closedateRef.value, scrollTargets, hasError, isFirstErrorHandled)

  // ✅ 3. SubActivities ตรวจทีละ field แบบเรียงลำดับ
  for (let i = 0; i < subActivities.value.length; i++) {
    const sub = subActivities.value[i]!

    // 3.1 ชื่อกิจกรรม
    // if (!sub.subActivityName?.trim()) {
    //   subActivityNameErrors.value[i] = 'กรุณากรอกชื่อกิจกรรม'
    //   hasError.value = true
    //   if (subActivityNameRefs.value[i]?.$el) {
    //     scrollTargets.push(subActivityNameRefs.value[i]?.$el)
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
      if (isValid(activityName.value)) {
        activityNameError.value = ''
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
      if (index !== undefined && isValid(subActivities.value[index]?.subActivityName)) {
        subActivityNameErrors.value[index] = ''
        void nextTick(() => scrollToNextInQueue())
      }
      break
    case 'date':
      if (index !== undefined && isValid(subActivities.value[index]?.activityDateInternal)) {
        dateErrors.value[index] = ''
        void nextTick(() => scrollToNextInQueue())
      }
      break
    case 'room':
      if (index !== undefined && isValid(subActivities.value[index]?.roomName)) {
        roomErrors.value[index] = ''
        void nextTick(() => {
          scrollToNextInQueue()
          seatRefs.value[index]?.focus?.()
        })
      }
      break

    case 'seat':
      if (index !== undefined && isValid(subActivities.value[index]?.seats)) {
        seatErrors.value[index] = ''
        void nextTick(() => {
          scrollToNextInQueue()
          seatRefs.value[index + 1]?.focus?.()
        })
      }
      break

    case 'hour':
      if (index !== undefined && isValid(subActivities.value[index]?.totalHours)) {
        seatErrors.value[index] = ''
        void nextTick(() => {
          scrollToNextInQueue()
          seatRefs.value[index + 1]?.focus?.()
        })
      }
      break
    case 'lecturer':
      if (index !== undefined && isValid(subActivities.value[index]?.lecturer)) {
        lecturerErrors.value[index] = ''
        void nextTick(() => scrollToNextInQueue())
      }
      break
  }
}

//ใช้กับปุ่มบันทึก ส่งข้อมูลไปหลังบ้าน
const saveChanges = async () => {
  if (!props.activity?.id) {
    console.error('ไม่พบ activity id')
    return
  }

  try {
    // Validate before opening registration
    if (activityStatus.value === 'เปิดลงทะเบียน') {
      const valid = await validateBeforeOpen()
      if (!valid) return
    }

    // 1. Prepare the updated activity data
    const updated: Partial<Activity> = {
      ...cloneDeep(props.activity),
      id: props.activity.id,
      name: activityName.value,
      skill: activityType.value === 'prep' ? 'soft' : 'hard',
      endDateEnroll: formattedCloseRegisDate.value,
      activityState: statusReverseMap[activityStatus.value] || 'planning',
      foodVotes: foodMenu.value.map((f) => {
        const existingVote = props.activity?.foodVotes?.find((vote) => vote.foodName === f.name)
        return {
          foodName: f.name,
          vote: existingVote ? existingVote.vote : 0,
        }
      }),
      activityItems: subActivities.value.map((sub, index) => {
        const existingItem = props.activity?.activityItems?.[index]
        return {
          ...(existingItem || {}),
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
        }
      }),
    }

    // 2. Update the main activity
    await ActivityService.updateOne(updated)

    // 3. Handle image upload if there's a new image
    if (props.imageRef) {
      const file = props.imageRef.getSelectedFile?.()
      const oldFile = props.activity?.file ?? ''
      const newFileName = props.imageRef.getSelectedFileName?.() ?? ''

      // Only upload if a new file is selected and its name is different from the old
      if (file && newFileName && oldFile !== newFileName) {
        console.log('📤 Uploading image with file:', file.name)
        try {
          const uploadResult = await ActivityService.uploadImage(updated.id!, file, oldFile)
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
      // No imageRef provided
      emit('saved')
    }

    showSuccessDialog.value = true
    emit('update:isEditing', false)
  } catch (err) {
    console.error('❌ ไม่สามารถอัปเดตกิจกรรมได้:', err)
  }
}

onMounted(() => {
  const a = props.activity
  if (!a) return

  originalActivity.value = cloneDeep(a)
  activityName.value = a.name ?? ''
  activityType.value = a.skill === 'soft' ? 'prep' : a.skill === 'hard' ? 'academic' : ''
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

onMounted(() => {
  watch(activityName, (val) => {
    if (val.trim() !== '') {
      activityNameError.value = ''
    }
  })
  watch(
    subActivities,
    (subs) => {
      subs.forEach((sub, i) => {
        if (sub.subActivityName.trim()) {
          subActivityNameErrors.value[i] = ''
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
          <div align="center" class="status-text" style="font-size: 20px">{{ activityStatus }}</div>
        </q-badge>
        <q-btn
          v-if="props.isEditing && activityStatus !== 'เสร็จสิ้น'"
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
      :currentStatus="activityStatus"
      @confirm="handleStatusChange"
    />

    <!-- Activity Name -->
    <!-- FINISH -->
    <div class="input-group">
      <p class="label label_minWidth" :class="{ 'label-error-shift': activityNameError !== '' }">
        ชื่อกิจกรรมหลัก :
      </p>
      <div class="input-container">
        <q-input
          ref="activityNameRef"
          outlined
          v-model="activityName"
          class="fix-q-input-height"
          :error="activityNameError !== ''"
          hide-bottom
          :disable="!isEditing"
          @keyup.enter="onEnterField('mainName')"
        />
        <div v-if="activityNameError" class="text-negative text-subtitle2 q-mt-xs">
          {{ activityNameError }}
        </div>
      </div>
    </div>

    <!-- Activity Type -->
    <ActivityForm_Type v-model="activityType" class="input-group" :disable="!isEditing" />
    <ActivityForm_CloseRegisDate
      :ref="(el) => (closedateRef = el as InstanceType<typeof ActivityForm_CloseRegisDate>)"
      v-model="formattedCloseRegisDate"
      class="input-group"
      :disable="!isEditing"
      @enter="onEnterField('closedate')"
    />

    <ActivityForm_Food
      v-model:foodMenu="foodMenu"
      v-model:foodMenuDisplay="foodMenuDisplay"
      :disable="!isEditing"
    />
    <ActivityForm_Form v-model="selectedFormIds" :forms="formStore.forms" class="input-group"  :disable="!isEditing" />
    <!-- Sub Activities List -->
    <div v-for="(subActivity, index) in subActivities" :key="index" class="sub-activity">
      <!-- Cancel (X) Icon -->
      <div class="remove-icon input-group" style="display: flex; justify-content: flex-end">
        <q-icon
          name="close"
          size="35px"
          color="red"
          class="cursor-pointer"
          @click="removeSubActivity(index)"
        />
      </div>

      <!-- SubActivity Name -->
      <!-- FINISH -->
      <div class="input-group">
        <p
          class="label label_minWidth"
          :class="{
            'label-error-shift':
              subActivityNameErrors[index] !== undefined && subActivityNameErrors[index] !== '',
          }"
        >
          ชื่อกิจกรรม :
        </p>
        <div class="input-container">
          <q-input
            ref="subActivityNameRefs"
            outlined
            v-model="subActivity.subActivityName"
            class="fix-q-input-height"
            @keyup.enter="onEnterField('subName', index)"
            :disable="!isEditing"
            :error="
              subActivityNameErrors[index] !== undefined && subActivityNameErrors[index] !== ''
            "
          />

          <div v-if="subActivityNameErrors[index]" class="text-negative text-subtitle2 q-mt-xs">
            {{ subActivityNameErrors[index] }}
          </div>
        </div>
      </div>

      <!-- Date -->
      <!-- FINISH -->
      <ActivityForm_ActivityDate
        :ref="(el) => (dateRefs[index] = el as InstanceType<typeof ActivityForm_ActivityDate>)"
        v-model="subActivity.activityDateInternal"
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
      <!-- Hour -->
      <!-- FINISH -->
      <ActivityForm_Hour
        :ref="(el) => (hourRefs[index] = el as InstanceType<typeof ActivityForm_Hour>)"
        v-model="subActivity.totalHours"
        class="input-group"
        :disable="!isEditing"
        @keyup.enter="onEnterField('hour', index)"
      />

      <!-- Room --><!-- FINISH -->
      <ActivityForm_Room
        :ref="(el) => (roomRefs[index] = el as InstanceType<typeof ActivityForm_Room>)"
        v-model="subActivity.roomName"
        class="input-group"
        :disable="!isEditing"
        @enter="onEnterField('room', index)"
      />

      <!-- Seats -->
      <!-- FINISH -->
      <ActivityForm_Seats
        :ref="(el) => (seatRefs[index] = el as InstanceType<typeof ActivityForm_Seats>)"
        v-model.number="subActivity.seats"
        class="input-group"
        :disable="!isEditing"
        @keyup.enter="onEnterField('seat', index)"
      />
      <!-- Major -->
      <!-- FINISH -->
      <ActivityForm_Major
        :ref="(el) => (majorRefs[index] = el as InstanceType<typeof ActivityForm_Major>)"
        v-model="subActivity.departments"
        class="input-group"
        :disable="!isEditing"
      />
      <!-- Year -->
      <!-- FINISH -->
      <ActivityForm_StudentYears
        :ref="(el) => (yearRefs[index] = el as InstanceType<typeof ActivityForm_StudentYears>)"
        v-model="subActivity.years"
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
            v-model="subActivity.lecturer"
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

      <!-- Detail Activity -->
      <!-- FINISH -->
      <div class="input-group">
        <p style="align-self: flex-start" class="label label_minWidth">รายละเอียดอื่นๆ :</p>
        <q-input
          type="textarea"
          rows="10"
          outlined
          v-model="subActivity.detailActivity"
          class="input-container"
          :disable="!isEditing"
        />
      </div>
    </div>

    <!-- Add SubActivity Button -->
    <div class="btn-container" v-if="props.isEditing">
      <p class="label label_minWidth btn-label-empty"></p>
      <q-btn class="btnAddActivity" @click="addSubActivity" style="background-color: #3676f9">
        <p class="label text-white">เพิ่มกิจกรรม</p>
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
  .button-group .btnsecces {
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
