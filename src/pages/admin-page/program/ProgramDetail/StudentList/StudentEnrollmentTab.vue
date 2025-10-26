<script setup lang="ts">
//import
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import type { QTableColumn } from 'quasar'
import { useRoute } from 'vue-router'
import RemoveStudentEnrollment from './removeStudentDialog.vue'
import EditStudentEnrollmentDialog from './editStudentEnrollmantDialog.vue'
import EnrollStudentDialog from './enrollmentByAdminDialog.vue'

import { ProgramService } from 'src/services/program'
import { useEnrollmentStore } from 'src/stores/enrollment'
// import { useStudentStore } from 'src/stores/student'
import { EnrollmentService } from 'src/services/enrollment'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import type { Program } from 'src/types/program'
import type { Pagination } from 'src/types/pagination'
import dayjs from 'dayjs'
import type { CheckInOut } from 'src/types/checkinout'
import 'dayjs/locale/th'
import type { StudentEnrollment } from 'src/types/enrollment'

dayjs.locale('th')
const $q = useQuasar()
const isMobile = computed(() => $q.screen.width <= 600)
// const studentStore = useStudentStore()
const route = useRoute()
const enrollmentStore = useEnrollmentStore()
const programId = route.params.id as string

const removeDialog = ref(false)
const editDialog = ref(false)
const addDialogOpen = ref(false)
const canManage = computed(() => program.value?.programState !== 'success')
const filterCategories1 = ref(['year', 'major', 'studentStatus'])
const program = ref<Program | null>(null)
const selectProgramItem = ref(-1)
const selectProgramItemDate = ref<number | string>(-1)
const selectedStudent = ref<StudentEnrollment | null>(null)
const query = ref<Pagination>({
  page: 1,
  limit: 10,
  search: '',
  sortBy: '_id',
  order: 'desc',
  major: [],
  studentStatus: [],
  studentYear: [],
})
const formatDate = (iso: string): string => {
  if (!iso) return 'ยังไม่เช็คชื่อ'
  return dayjs(iso).format('D MMMM YYYY')
}
const formatTime = (iso: string): string => {
  if (!iso) return 'ยังไม่เช็คชื่อ'
  return dayjs(iso).format('HH:mm น.')
}
const visibleColumns = computed(() => {
  const hasFood = students.value.some((s) => !!s.food && s.food.trim() !== '')
  return columns.value.filter((col) => (col.name === 'food' ? hasFood : true))
})

const pagination = ref({
  sortBy: query.value.sortBy || '',
  descending: query.value.order === 'desc',
  page: query.value.page || 1,
  rowsPerPage: query.value.limit || 10,
  rowsNumber: 0,
})
interface QTableRequestProps {
  pagination: {
    page: number
    rowsPerPage: number
    sortBy: string
    descending: boolean
  }
}
const onRequest = async (props: QTableRequestProps) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination

  // แก้ตรงนี้: sync query กับ pagination จริง
  query.value.page = page
  query.value.limit = rowsPerPage
  query.value.sortBy = sortBy
  query.value.order = descending ? 'desc' : 'asc'

  // sync pagination object (UI)
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending

  await fetchStudents()
}

// ใช้ store แทนการสร้างฟังก์ชันใหม่

interface SelectedFilters {
  year: string[]
  major: string[]
  studentStatus: string[]
}

const applyStudentFilters = async (selectedFilters: SelectedFilters) => {
  query.value.studentYear = selectedFilters.year
  query.value.major = selectedFilters.major
  query.value.studentStatus = selectedFilters.studentStatus
  await fetchStudents()
}

const search1 = computed({
  get: () => query.value.search,
  set: (val) => (query.value.search = val || ''),
})

const students = computed(() => {
  return enrollmentStore.studentEnrollments || []
})
const editCheckinout = (row: StudentEnrollment) => {
  selectedStudent.value = row
  editDialog.value = true
}
function openAddDialog() {
  addDialogOpen.value = true
}
const removeStudentFromProgram = (id: string) => {
  const row = students.value.find((s) => s.id === id) || null
  selectedStudent.value = row
  removeDialog.value = true
}
const programItemOptions = computed(() => {
  const items = program.value?.programItems ?? []
  const opts = items.map((item, index) => ({
    label: item.name,
    value: index, // index ปกติของรายการ
  }))

  // ถ้า programItems > 2 ให้เติม "ทุกโครงการ" ไว้หัวรายการ
  if (items.length > 1) {
    return [{ label: 'ทุกโครงการ', value: -1 }, ...opts]
  }
  return opts
})

const programItemDatesOptions = computed(() => {
  const items = program.value?.programItems ?? []

  // ถ้าเลือก "ทุกโครงการ" (-1) ให้แสดงวันทั้งหมดจากทุกโครงการ
  if (selectProgramItem.value === -1) {
    const dates = items.flatMap((it) => (it.dates ?? []).map((d) => d.date).filter(Boolean))
    const uniq = Array.from(new Set(dates)).sort()

    const opts = uniq.map((d) => ({
      label: d,
      value: d,
    }))

    // ✅ ถ้าวันมากกว่า 1 วัน ให้มีตัวเลือก "ทุกวัน" (value:-1)
    if (uniq.length > 1) {
      return [{ label: 'ทุกวัน', value: -1 }, ...opts]
    }
    // ถ้ามีวันเดียว ก็แสดงวันนั้น (ไม่ต้องมี "ทุกวัน")
    return opts
  } else {
    // ถ้าเลือกโครงการเฉพาะ ให้แสดงเฉพาะวันของโครงการนั้น
    const selectedItem = items[selectProgramItem.value]
    if (!selectedItem || !selectedItem.dates) return []

    const dates = selectedItem.dates.map((d) => d.date).filter(Boolean)
    const uniq = Array.from(new Set(dates)).sort()

    const opts = uniq.map((d) => ({
      label: d,
      value: d,
    }))

    // ✅ ถ้าวันมากกว่า 1 วัน ให้มีตัวเลือก "ทุกวัน" (value:-1)
    if (uniq.length > 1) {
      return [{ label: 'ทุกวัน', value: -1 }, ...opts]
    }
    // ถ้ามีวันเดียว ก็แสดงวันนั้น (ไม่ต้องมี "ทุกวัน")
    return opts
  }
}) // ฟังก์ชันจัดการเมื่อเปลี่ยนโครงการ
const onProgramItemChange = async () => {
  // รีเซ็ตการเลือกวัน
  selectProgramItemDate.value = -1

  // ถ้ามีวันเดียว ให้เลือกวันนั้นอัตโนมัติ
  const dateOptions = programItemDatesOptions.value
  if (dateOptions.length === 1 && dateOptions[0]) {
    selectProgramItemDate.value = dateOptions[0].value
  }

  await fetchStudents()
}

const baseColumns: QTableColumn[] = [
  {
    name: 'index',
    label: 'ลำดับ',
    align: 'left' as const,
    field: 'index',
    style: 'width: 7%;',
    headerStyle: 'width: 7%;',
  },
  {
    name: 'code',
    label: 'รหัสนิสิต',
    field: 'code',
    align: 'left' as const,
    style: 'width: 12%;',
    headerStyle: 'width: 12%;',
  },
  {
    name: 'name',
    label: 'ชื่อ-สกุล',
    field: 'name',
    align: 'left' as const,
    style: 'width: 20%;',
    headerStyle: 'width: 19.5%;',
    classes: 'ellipsis-cell',
  },
  {
    name: 'major',
    label: 'สาขา',
    field: 'major',
    align: 'left' as const,
    style: 'width: 7%;',
    headerStyle: 'width: 7.5%;',
  },
  {
    name: 'food',
    label: 'อาหาร',
    field: 'food',
    align: 'left' as const,
    style: 'width: 7%;',
    headerStyle: 'width: 7.5%;',
  },
  {
    name: 'checkIn',
    label: 'เช็คชื่อเข้า',
    field: 'checkIn',
    align: 'center' as const,
    style: 'width: 15%;',
    headerStyle: 'width: 14%;',
  },
  {
    name: 'checkOut',
    label: 'เช็คชื่อออก',
    field: 'checkOut',
    align: 'center' as const,
    style: 'width: 15%;',
    headerStyle: 'width: 16%;',
  },
]

const participationCol: QTableColumn = {
  name: 'checkInStatus',
  label: 'สถานะเช็คชื่อ',
  field: 'checkInStatus',
  align: 'center',
  style: 'width: 15%;',
  headerStyle: 'width: 16%;',
}
const actionsCol: QTableColumn = {
  name: 'actions',
  label: '',
  field: 'actions',
  align: 'center' as const,
}
const showParticipation = computed(() => selectProgramItemDate.value !== -1)

const columns = computed<QTableColumn[]>(() => {
  const cols = [...baseColumns]
  if (showParticipation.value) {
    const afterCheckOut = cols.findIndex((c) => c.name === 'checkOut') + 1
    cols.splice(afterCheckOut, 0, participationCol)
  }
  if (canManage.value) cols.push(actionsCol) // ✅ ใส่เฉพาะตอนเปิดแก้ไขได้
  return cols
})

const expanded = ref<{ [key: string]: boolean }>({})

function formatStudentName(name: string): string {
  if (!name) return ''
  if (name.length <= 25) return name
  return name.slice(0, 22) + '...'
}

function toggleCard(studentId: string) {
  expanded.value[studentId] = !expanded.value[studentId]
}
const windowWidth = ref(window.innerWidth)

function handleResize() {
  windowWidth.value = window.innerWidth
}

// Add helper methods for checkin/checkout filtering for QTable rows and card layout
// ✅ คืน array ของ string (ISO in Asia/Bangkok) สำหรับ "เข้า"
function getRowCheckins(row: { checkInOut?: unknown }): string[] {
  if (!Array.isArray(row.checkInOut)) return []
  return (row.checkInOut as CheckInOut[]).map((r) => r.checkin).filter((v): v is string => !!v)
}

function getRowCheckouts(row: { checkInOut?: unknown }): string[] {
  if (!Array.isArray(row.checkInOut)) return []
  return (row.checkInOut as CheckInOut[]).map((r) => r.checkout).filter((v): v is string => !!v)
}

function getStudentCheckins(student: { checkInOut?: unknown }): string[] {
  if (!Array.isArray(student.checkInOut)) return []
  return (student.checkInOut as CheckInOut[]).map((r) => r.checkin).filter((v): v is string => !!v)
}

function getStudentCheckouts(student: { checkInOut?: unknown }): string[] {
  if (!Array.isArray(student.checkInOut)) return []
  return (student.checkInOut as CheckInOut[]).map((r) => r.checkout).filter((v): v is string => !!v)
}

// ฟังก์ชันคำนวณสถานะเช็คชื่อ
const getCheckInStatus = (student: StudentEnrollment): string => {
  if (!program.value || !program.value.programItems) return 'ไม่มา'

  // หา programItem ที่ student ลงทะเบียน
  // ใช้ enrollment ID หรือข้อมูลอื่นในการเชื่อมโยง
  // สมมติว่าเราต้องเทียบกับ date ที่เลือก (selectProgramItemDate)

  const selectedDate =
    selectProgramItemDate.value !== -1 ? selectProgramItemDate.value.toString() : null

  // ถ้าไม่ได้เลือกวัน หรือเลือก "ทุกวัน" (-1) ไม่สามารถแสดงสถานะได้
  if (!selectedDate) return '-'

  // หา programItem และ date ที่ตรงกับวันที่เลือก
  let targetTime: string | null = null

  if (selectProgramItem.value === -1) {
    // กรณีเลือก "ทุกโครงการ" ให้หา stime จากโครงการใดๆที่มีวันตรงกัน
    for (const item of program.value.programItems) {
      const dateObj = item.dates?.find((d) => d.date === selectedDate)
      if (dateObj && dateObj.stime) {
        targetTime = dateObj.stime
        break
      }
    }
  } else {
    // กรณีเลือกโครงการเฉพาะ
    const selectedItem = program.value.programItems[selectProgramItem.value]
    if (selectedItem && selectedItem.dates) {
      const dateObj = selectedItem.dates.find((d) => d.date === selectedDate)
      if (dateObj && dateObj.stime) {
        targetTime = dateObj.stime
      }
    }
  }

  if (!targetTime) return '-'

  // ตรวจสอบข้อมูล checkInOut ของ student
  const checkInOuts = Array.isArray(student.checkInOut) ? student.checkInOut : []

  // กรองเฉพาะ check-in/out ที่ตรงกับวันที่เลือก
  const relevantCheckInOut = checkInOuts.filter((record) => {
    if (!record.checkin) return false
    const checkinDate = dayjs(record.checkin).format('YYYY-MM-DD')
    return checkinDate === selectedDate
  })

  // ตรวจสอบว่าถึงเวลาเริ่มกิจกรรมหรือยัง
  const [hours, minutes] = targetTime.split(':').map(Number)
  if (hours === undefined || minutes === undefined) return '-'

  const activityStartTime = dayjs(selectedDate).hour(hours).minute(minutes).second(0)
  const now = dayjs()

  // ถ้ายังไม่ถึงเวลาเริ่มกิจกรรม และยังไม่มีคนเช็คอิน ให้แสดง "-"
  if (now.isBefore(activityStartTime) && relevantCheckInOut.length === 0) {
    return '-'
  }

  // ถ้าไม่มีข้อมูลเช็คชื่อเลย และเลยเวลาเริ่มแล้ว
  if (relevantCheckInOut.length === 0) return 'ไม่มา'

  // ตรวจสอบสถานะ
  const record = relevantCheckInOut[0]
  if (!record) return 'ไม่มา'

  const hasCheckIn = !!record.checkin
  const hasCheckOut = !!record.checkout

  // กรณีมาไม่ครบ (เช็คอย่างใดอย่างหนึ่งเท่านั้น)
  if (hasCheckIn && !hasCheckOut) return 'มาไม่ครบ'
  if (!hasCheckIn && hasCheckOut) return 'มาไม่ครบ'

  // กรณีไม่มาเลย
  if (!hasCheckIn && !hasCheckOut) return 'ไม่มา'

  // เปรียบเทียบเวลาเช็คอินกับ stime
  const checkinTime = dayjs(record.checkin)
  // สร้าง datetime โดยใช้วันจาก checkin และเวลาจาก stime (ใช้ hours, minutes ที่ประกาศไว้ด้านบนแล้ว)
  const startTime = dayjs(record.checkin).hour(hours).minute(minutes).second(0)
  // เพิ่มเวลา grace period 30 นาที
  const graceTime = startTime.add(30, 'minute')

  // ถ้าเช็คอินหลังจาก grace period (stime + 30 นาที) ถือว่ามาสาย
  if (checkinTime.isAfter(graceTime)) {
    return 'มาสาย'
  } else {
    return 'ทันเวลา'
  }
}

// ฟังก์ชันกำหนดคลาสของ badge
const getCheckInStatusClass = (status: string): string => {
  switch (status) {
    case 'ทันเวลา':
      return 'status-ontime'
    case 'มาสาย':
      return 'status-late'
    case 'มาไม่ครบ':
      return 'status-incomplete'
    case 'ไม่มา':
      return 'status-absent'
    default:
      return ''
  }
}

const fetchStudents = async () => {
  enrollmentStore.studentEnrollments = []

  const res = await ProgramService.getOne(programId)
  program.value = res.data

  if (
    program.value &&
    Array.isArray(program.value.programItems) &&
    program.value.programItems.length > 0
  ) {
    if (selectProgramItemDate.value === -1) {
      console.log('date = ', selectProgramItemDate.value)
      query.value.date = ''
    } else {
      console.log('date = ', selectProgramItemDate.value)
      query.value.date = selectProgramItemDate.value.toString()
    }
    // แตกแขนงตามค่า selectProgramItem (จะเข้ามาทาง -1 ครั้งแรกโดยอัตโนมัติ)
    if (selectProgramItem.value === -1) {
      const data = await EnrollmentService.getEnrollmentsByProgramIDs(programId, query.value)

      pagination.value.page = query.value.page || 1
      pagination.value.rowsPerPage = query.value.limit || 10
      pagination.value.sortBy = query.value.sortBy || ''
      pagination.value.descending = query.value.order === 'desc'
      pagination.value.rowsNumber = data.meta.total

      enrollmentStore.studentEnrollments = data.data
      enrollmentStore.total = data.meta.total
    } else {
      const programItemId = program.value.programItems[selectProgramItem.value]!.id!
      const data = await EnrollmentService.getEnrollmentsByProgramID(programItemId, query.value)

      pagination.value.page = query.value.page || 1
      pagination.value.rowsPerPage = query.value.limit || 10
      pagination.value.sortBy = query.value.sortBy || ''
      pagination.value.descending = query.value.order === 'desc'
      pagination.value.rowsNumber = data.meta.total

      enrollmentStore.studentEnrollments = data.data
      enrollmentStore.total = data.meta.total
    }
  } else {
    enrollmentStore.studentEnrollments = []
    enrollmentStore.total = 0
    console.error('programItems is null or undefined')
  }
}

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  await fetchStudents()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="student-container">
    <!-- <div class="student-table-wrapper "> -->
    <div class="program-header">
      <div class="row justify-between items-center">
        <div class="textsubtitle">{{ program?.name }}</div>
        <q-btn
          v-if="canManage"
          dense
          outlined
          label="เพิ่มนิสิต"
          class="btnadd"
          style="width: 130px"
          @click="openAddDialog"
        >
        </q-btn>
      </div>
    </div>

    <div class="row q-col-gutter-sm form-toolbar q-mt-md">
      <!-- Row 1 -->
      <div class="search-row">
        <q-input
          dense
          outlined
          v-model="search1"
          @keyup.enter="fetchStudents"
          label="ค้นหาชื่อ-สกุล/ รหัสนิสิต"
          class="searchbox"
          :style="{ border: 'none' }"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- Row 2 -->
      <div class="select-filter-row">
        <q-select
          v-if="programItemOptions.length > 1"
          dense
          outlined
          v-model="selectProgramItem"
          :options="programItemOptions"
          label="เลือกโครงการ"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          @update:model-value="onProgramItemChange"
          class="dropdown"
          popup-content-class="dropdown-menu"
          :style="{ border: 'none' }"
          behavior="menu"
        />
        <q-select
          v-if="programItemDatesOptions.length > 0"
          dense
          outlined
          v-model="selectProgramItemDate"
          :options="programItemDatesOptions"
          label="เลือกวัน"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          @update:model-value="fetchStudents"
          class="dropdown"
          popup-content-class="dropdown-menu"
          :style="{ border: 'none' }"
          behavior="menu"
        />
        <FilterDialog :categories="filterCategories1" @apply="applyStudentFilters" />
      </div>
    </div>

    <q-table
      v-if="!isMobile"
      flat
      bordered
      :rows="students"
      :columns="visibleColumns"
      row-key="id"
      class="q-mt-md new-sticky-header"
      @request="onRequest"
      v-model:pagination="pagination"
      :rows-per-page-options="[10, 20, 30, 40, 50]"
      :rows-number="enrollmentStore.total"
    >
      <!-- หัวตาราง Sticky -->
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" class="sticky-header">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body-cell-index="props">
        <q-td :props="props" class="text-center table-text bold-text">
          {{ props.rowIndex + 1 }}
        </q-td>
      </template>

      <!-- <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :label="studentStore.getStatusText(parseInt(props.row.status))"
            rounded
            unelevated
            class="status-badge"
            :class="studentStore.getStatusClass(parseInt(props.row.status))"
          />
        </q-td>
      </template> -->

      <!-- ปุ่มลบ -->
      <template v-slot:body-cell-checkIn="props">
        <q-td :props="props">
          <div v-if="getRowCheckins(props.row).length">
            <div v-for="(rec, idx) in getRowCheckins(props.row)" :key="idx">
              {{ formatDate(rec) }} {{ formatTime(rec) }}
            </div>
          </div>

          <div v-else>-</div>
        </q-td>
      </template>
      <template v-slot:body-cell-checkOut="props">
        <q-td :props="props">
          <div v-if="getRowCheckouts(props.row).length">
            <div v-for="(rec, idx) in getRowCheckouts(props.row)" :key="idx">
              {{ formatDate(rec) }} {{ formatTime(rec) }}
            </div>
          </div>
          <div v-else>-</div>
        </q-td>
      </template>
      <template v-slot:body-cell-checkInStatus="props">
        <q-td :props="props">
          <q-badge
            v-if="getCheckInStatus(props.row) !== '-'"
            :label="getCheckInStatus(props.row)"
            rounded
            unelevated
            class="status-badge"
            :class="getCheckInStatusClass(getCheckInStatus(props.row))"
          />
          <span v-else>-</span>
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props" v-if="canManage">
        <q-td class="q-gutter-x-sm" key="action">
          <q-icon
            clickable
            name="edit"
            @click.stop="editCheckinout(props.row)"
            class="bg-primary text-white q-pa-xs rounded-borders q-mr-sm"
          >
            <q-tooltip>แก้ไข</q-tooltip>
          </q-icon>
          <q-icon
            clickable
            name="delete"
            @click.stop="removeStudentFromProgram(props.row.id)"
            class="bg-red-7 text-white q-pa-xs rounded-borders q-mr-sm"
          >
            <q-tooltip>ลบ</q-tooltip>
          </q-icon>
        </q-td>
      </template>
      <template v-slot:no-data>
        <div class="full-width text-center q-pa-md text-grey" style="font-size: 20px">
          ไม่มีนิสิตที่ลงทะเบียน
        </div>
      </template>
    </q-table>

    <!-- Card layout for mobile -->
    <div v-else style="margin-top: 20px">
      <q-card v-for="student in students" :key="student.id" class="student-card" bordered flat>
        <!-- HEADER -->
        <q-card-section class="row items-center justify-between">
          <div
            class="ProgramNamelabel row items-center"
            @click="toggleCard(student.id)"
            style="cursor: pointer"
          >
            <span class="student-code q-mr-sm">{{ student.code }}</span>
            <span class="student-name">{{ formatStudentName(student.name) }}</span>
            <q-icon
              :name="expanded[student.id] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
              size="28px"
              class="q-ml-sm"
              style="transition: transform 0.2s"
            />
          </div>

          <!-- ACTIONS (always visible on mobile header) -->
          <div class="row items-center q-gutter-xs" v-if="canManage">
            <q-btn
              round
              dense
              size="sm"
              icon="edit"
              class="bg-primary text-white q-pa-xs rounded-borders q-mr-sm"
              aria-label="แก้ไข"
              @click.stop="editCheckinout(student)"
            />
            <q-btn
              round
              dense
              size="sm"
              icon="delete"
              class="bg-red-7 text-white q-pa-xs rounded-borders q-mr-sm"
              aria-label="ลบ"
              @click.stop="removeStudentFromProgram(student.id)"
            />
          </div>
        </q-card-section>

        <!-- CONTENT -->
        <q-card-section v-if="expanded[student.id]">
          <div class="info-row" style="display: flex; align-items: center; margin-bottom: 10px">
            <div class="label">สาขา</div>
            <div class="value">{{ student.major || '-' }}</div>
          </div>

          <div
            class="info-row"
            v-if="student.food && student.food.trim() !== ''"
            style="display: flex; align-items: center; margin-bottom: 10px"
          >
            <div class="label">อาหาร</div>
            <div class="value">{{ student.food }}</div>
          </div>

          <div class="info-row" style="display: flex; align-items: center; margin-bottom: 10px">
            <div class="label">เช็คชื่อเข้า</div>
            <div class="value">
              <template v-if="getStudentCheckins(student).length">
                <div v-for="(rec, idx) in getStudentCheckins(student)" :key="idx">
                  {{ formatDate(rec) }} {{ formatTime(rec) }}
                </div>
              </template>
              <div v-else>-</div>
            </div>
          </div>

          <div class="info-row" style="display: flex; align-items: center; margin-bottom: 10px">
            <div class="label">เช็คชื่อออก</div>
            <div class="value">
              <template v-if="getStudentCheckouts(student).length">
                <div v-for="(rec, idx) in getStudentCheckouts(student)" :key="idx">
                  {{ formatDate(rec) }} {{ formatTime(rec) }}
                </div>
              </template>
              <div v-else>-</div>
            </div>
          </div>

          <div class="info-row" style="display: flex; align-items: center; margin-bottom: 10px">
            <div class="label">สถานะเช็คชื่อ</div>
            <div class="value">
              <q-badge
                v-if="getCheckInStatus(student) !== '-'"
                :label="getCheckInStatus(student)"
                rounded
                unelevated
                class="status-badge"
                :class="getCheckInStatusClass(getCheckInStatus(student))"
              />
              <span v-else>-</span>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div
        v-if="students.length === 0"
        class="full-width text-center q-pa-md text-grey"
        style="font-size: 20px"
      >
        ไม่มีนิสิตที่ลงทะเบียน
      </div>
    </div>
    <!-- </div> -->
  </div>
  <RemoveStudentEnrollment
    v-model="removeDialog"
    :student="selectedStudent"
    @removed="fetchStudents"
  />

  <EditStudentEnrollmentDialog
    v-model="editDialog"
    :student="selectedStudent"
    @updated="fetchStudents"
  />
  <EnrollStudentDialog v-model="addDialogOpen" :program="program" @saved="fetchStudents" />
</template>

<style lang="scss" scoped>
.program-header {
  justify-content: space-between;
}

.student-container {
  height: calc(80vh - 150px);
  width: 100%;
}
.q-table table {
  table-layout: fixed;
}
.ProgramNamelabel {
  font-size: 16px;
  font-weight: 600;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.my-sticky-header-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #f5f5f5;
}

.new-sticky-header {
  .my-sticky-header-table {
    /* Fix header */
    thead tr:first-child th {
      background-color: #f5f5f5;
    }

    /* Make tbody scrollable */
    tbody {
      display: block;
      overflow-y: auto;
    }

    /* Ensure header and body columns align */
    thead,
    tbody tr {
      display: table;
      width: 100%;
      table-layout: fixed;
    }

    /* Optional: ปรับ scrollbar ไม่ทับ */
    tbody::-webkit-scrollbar {
      width: 12px;
    }

    tbody::-webkit-scrollbar-thumb {
      background: #a7a7a7;
      border-radius: 10px;
      cursor: pointer;
    }
  }
}
.label {
  font-weight: 600;
  font-size: 16px;
  min-width: 200px;
  margin-top: 2px;
}
.value {
  font-size: 16px;
  margin-top: 2px;
}
.ellipsis-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-complete {
  background-color: #cfd7ff;
  color: #001780;
  border: 1px solid #002dff;
  padding: 3px 30px;
  width: 130px;
}

.status-medium {
  background-color: #ffe7ba;
  color: #ff6f00;
  border: 1px solid #ffa500;
  padding: 3px 30px;
  width: 130px;
}

.status-low {
  background-color: #ffc5c5;
  color: #ff0000;
  border: 1px solid #f32323;
  padding: 3px 30px;
  width: 130px;
}

.status-out {
  background-color: #dadada;
  color: #000000;
  border: 1px solid #575656;
  padding: 3px 30px;
  width: 130px;
}
.status-graduated {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #28a745;
  padding: 3px 30px;
  width: 130px;
}
.status-ontime {
  background-color: #cfe2ff;
  color: #084298;
  border: 1px solid #6ea8fe;
  padding: 3px 30px;
  width: 130px;
}
.status-late {
  background-color: #ffe7ba;
  color: #cc5500;
  border: 1px solid #ffb347;
  padding: 3px 30px;
  width: 130px;
}
.status-absent {
  background-color: #ffc5c5;
  color: #cc0000;
  border: 1px solid #ff6b6b;
  padding: 3px 30px;
  width: 130px;
}
.status-incomplete {
  background-color: #e0e0e0;
  color: #5a5a5a;
  border: 1px solid #9e9e9e;
  padding: 3px 30px;
  width: 130px;
}
.status-badge {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 15px;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}
.form-toolbar {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}

.select-filter-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.dropdown-menu {
  max-width: 300px !important;
  width: 100% !important;
  box-sizing: border-box;
}
// .backgroundheader {
//   background-color: #90b2ee;
// }

.student-header-row {
  flex-direction: column !important;
  align-items: stretch !important;
}
.student-header-actions {
  margin-top: 10px !important;
  justify-content: space-between;
}

.ProgramNamelabel .student-name {
  flex-grow: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ProgramNamelabel .q-icon {
  margin-left: auto;
}
.student-card .q-card__section.backgroundheader {
  padding: 8px 12px;
}
.student-card .q-card__section + .q-card__section {
  padding-top: 8px;
}
@media (max-width: 690px) {
  .form-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .searchbox {
    width: 100% !important;
  }

  .select-filter-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .dropdown {
    width: 90% !important;
  }
}

@media (max-width: 600px) {
  .student-table-wrapper {
    padding: 0;
  }
  .student-card {
    margin-bottom: 12px;
    font-size: 16px;
  }
}
@media (max-width: 450px) {
  /* ชื่อในหัวการ์ด (มีอยู่แล้วก็ไม่เป็นไร) */
  .ProgramNamelabel {
    font-size: 12px;
  }

  /* ↓ ส่วนรายละเอียด (expanded) ให้เล็กลงตามหัวการ์ด */
  .label,
  .value {
    font-size: 12px;
  }

  /* กัน label ดันบรรทัดบนจอเล็กมาก ๆ */
  .label {
    min-width: 120px;
  }

  /* ให้ระยะห่างแถวกระชับขึ้นบนจอเล็ก */
  .student-card .info-row {
    margin-bottom: 6px !important;
  }
}
</style>
