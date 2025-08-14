<script setup lang="ts">
//import
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import RemoveStudent from './RemoveStudent.vue'
import { ActivityService } from 'src/services/activity'
import { useEnrollmentStore } from 'src/stores/enrollment'
import { useStudentStore } from 'src/stores/student'
import { EnrollmentService } from 'src/services/enrollment'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import type { Activity } from 'src/types/activity'
import type { Pagination } from 'src/types/pagination'
import dayjs from 'dayjs'
import type { CheckInOut } from 'src/types/checkinout'
import 'dayjs/locale/th'
dayjs.locale('th')
const $q = useQuasar()
const isMobile = computed(() => $q.screen.width <= 600)
const studentStore = useStudentStore()
const route = useRoute()
const enrollmentStore = useEnrollmentStore()
const activityId = route.params.id as string

const filterCategories1 = ref(['year', 'major', 'studentStatus'])
const allTab = ref<Activity | null>(null)
const indexTab = ref(-1)
const query = ref<Pagination>({
  page: 1,
  limit: 5,
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
  return columns.filter((col) => {
    if (col.name === 'food') return hasFood
    return true
  })
})
const pagination = ref({
  sortBy: query.value.sortBy || '',
  descending: query.value.order === 'desc',
  page: query.value.page || 1,
  rowsPerPage: query.value.limit || 5,
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

const removeStudentFromActivity = async (studentId: string) => {
  try {
    await enrollmentStore.deleteEnrollmentById(studentId)
    // ลบเสร็จ → Refresh ตาราง
    await fetchStudents()
  } catch (error) {
    console.error('Failed to delete student:', error)
  }
}
const activityItemOptions = computed(() => {
  const items = allTab.value?.activityItems ?? []
  const opts = items.map((item, index) => ({
    label: item.name,
    value: index, // index ปกติของรายการ
  }))

  // ถ้า activityItems > 2 ให้เติม "ทุกกิจกรรม" ไว้หัวรายการ
  if (items.length > 1) {
    return [{ label: 'ทุกกิจกรรม', value: -1 }, ...opts]
  }
  return opts
})

const columns = [
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
  {
    name: 'status',
    label: 'สถานะ',
    field: 'status',
    align: 'center' as const,
    style: 'width: 13%;',
    headerStyle: 'width: 12%;',
  },
  { name: 'actions', label: '', field: 'actions', align: 'center' as const },
]

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
function getRowCheckins(row: { checkInOut?: unknown }): CheckInOut[] {
  return Array.isArray(row.checkInOut)
    ? (row.checkInOut as CheckInOut[]).filter((rec) => rec.type === 'checkin')
    : []
}
function getRowCheckouts(row: { checkInOut?: unknown }): CheckInOut[] {
  return Array.isArray(row.checkInOut)
    ? (row.checkInOut as CheckInOut[]).filter((rec) => rec.type === 'checkout')
    : []
}
function getStudentCheckins(student: { checkInOut?: unknown }): CheckInOut[] {
  return Array.isArray(student.checkInOut)
    ? (student.checkInOut as CheckInOut[]).filter((rec) => rec.type === 'checkin')
    : []
}
function getStudentCheckouts(student: { checkInOut?: unknown }): CheckInOut[] {
  return Array.isArray(student.checkInOut)
    ? (student.checkInOut as CheckInOut[]).filter((rec) => rec.type === 'checkout')
    : []
}
const fetchStudents = async () => {
  enrollmentStore.studentEnrollments = []

  const res = await ActivityService.getOne(activityId)
  allTab.value = res.data

  if (
    allTab.value &&
    Array.isArray(allTab.value.activityItems) &&
    allTab.value.activityItems.length > 0
  ) {

    // แตกแขนงตามค่า indexTab (จะเข้ามาทาง -1 ครั้งแรกโดยอัตโนมัติ)
    if (indexTab.value === -1) {
      const data = await EnrollmentService.getEnrollmentsByActivityIDs(activityId, query.value)

      pagination.value.page = query.value.page || 1
      pagination.value.rowsPerPage = query.value.limit || 5
      pagination.value.sortBy = query.value.sortBy || ''
      pagination.value.descending = query.value.order === 'desc'
      pagination.value.rowsNumber = data.meta.total

      enrollmentStore.studentEnrollments = data.data
      enrollmentStore.total = data.meta.total
    } else {
      const activityItemId = allTab.value.activityItems[indexTab.value]!.id!
      const data = await EnrollmentService.getEnrollmentsByActivityID(activityItemId, query.value)

      pagination.value.page = query.value.page || 1
      pagination.value.rowsPerPage = query.value.limit || 5
      pagination.value.sortBy = query.value.sortBy || ''
      pagination.value.descending = query.value.order === 'desc'
      pagination.value.rowsNumber = data.meta.total

      enrollmentStore.studentEnrollments = data.data
      enrollmentStore.total = data.meta.total
    }
  } else {
    enrollmentStore.studentEnrollments = []
    enrollmentStore.total = 0
    console.error('activityItems is null or undefined')
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
  <div class="q-mb-sm student-container">
    <div class="student-table-wrapper">
      <div class="row q-col-gutter-sm form-toolbar">
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
            dense
            outlined
            v-model="indexTab"
            :options="activityItemOptions"
            label="เลือกกิจกรรม"
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

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge
              :label="studentStore.getStatusText(parseInt(props.row.status))"
              rounded
              unelevated
              class="status-badge"
              :class="studentStore.getStatusClass(parseInt(props.row.status))"
            />
          </q-td>
        </template>

        <!-- ปุ่มลบ -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <RemoveStudent
              :id="props.row.id"
              @removeStudent="() => removeStudentFromActivity(props.row.id)"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-checkIn="props">
          <q-td :props="props">
            <div v-if="getRowCheckins(props.row).length">
              <div v-for="(rec, idx) in getRowCheckins(props.row)" :key="idx">
                {{ formatDate(rec.checkedAt) }} {{ formatTime(rec.checkedAt) }}
              </div>
            </div>
            <div v-else>-</div>
          </q-td>
        </template>
        <template v-slot:body-cell-checkOut="props">
          <q-td :props="props">
            <div v-if="getRowCheckouts(props.row).length">
              <div v-for="(rec, idx) in getRowCheckouts(props.row)" :key="idx">
                {{ formatDate(rec.checkedAt) }} {{ formatTime(rec.checkedAt) }}
              </div>
            </div>
            <div v-else>-</div>
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
          <q-card-section
            class="backgroundheader"
            @click="toggleCard(student.id)"
            style="cursor: pointer"
          >
            <div class="student-header-row row justify-between">
              <div class="ActivityNamelabel row items-center">
                <span class="student-code" style="margin-right: 10px"> {{ student.code }}</span>
                <span class="student-name">{{ formatStudentName(student.name) }}</span>
                <q-icon
                  :name="expanded[student.id] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                  size="28px"
                  class="q-ml-sm"
                  style="transition: transform 0.2s"
                />
              </div>
            </div>
          </q-card-section>

          <!-- CONTENT -->
          <q-card-section v-if="expanded[student.id]">
            <div class="info-row" style="display: flex; align-items: center; margin-bottom: 10px">
              <div class="label" style="margin-right: 5px">สาขา</div>
              <div class="value">: {{ student.major || '-' }}</div>
            </div>
            <div
              class="info-row"
              v-if="student.food && student.food.trim() !== ''"
              style="display: flex; align-items: center; margin-bottom: 10px"
            >
              <div class="label" style="margin-right: 5px">อาหาร</div>
              <div class="value">: {{ student.food }}</div>
            </div>
            <div class="info-row">
              <div class="label">เช็คชื่อเข้า</div>
              <div class="value">
                <template v-if="getStudentCheckins(student).length">
                  <div v-for="(rec, idx) in getStudentCheckins(student)" :key="idx">
                    {{ formatDate(rec.checkedAt) }} {{ formatTime(rec.checkedAt) }}
                  </div>
                </template>
                <div v-else>-</div>
              </div>
            </div>
            <div class="info-row">
              <div class="label">เช็คชื่อออก</div>
              <div class="value">
                <template v-if="getStudentCheckouts(student).length">
                  <div v-for="(rec, idx) in getStudentCheckouts(student)" :key="idx">
                    {{ formatDate(rec.checkedAt) }} {{ formatTime(rec.checkedAt) }}
                  </div>
                </template>
                <div v-else>-</div>
              </div>
            </div>
            <RemoveStudent
              :id="student.id"
              @removeStudent="() => removeStudentFromActivity(student.id)"
            />
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
    </div>
  </div>
</template>

<style lang="scss" scoped>
.student-container {
  height: 680px;
  width: 100%;
}
.q-table table {
  table-layout: fixed;
}
.ActivityNamelabel {
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
.backgroundheader {
  background-color: #90b2ee;
}

.student-header-row {
  flex-direction: column !important;
  align-items: stretch !important;
}
.student-header-actions {
  margin-top: 10px !important;
  justify-content: space-between;
}

.ActivityNamelabel .student-name {
  flex-grow: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ActivityNamelabel .q-icon {
  margin-left: auto;
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
  .ActivityNamelabel {
    font-size: 12px;
  }
}
</style>
