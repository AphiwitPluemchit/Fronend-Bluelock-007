<script setup lang="ts">
import { ref, defineProps, computed, onMounted } from 'vue'
import RemoveStudent from './RemoveStudent.vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import { useEnrollmentStore } from 'src/stores/enrollment'
import { useRoute } from 'vue-router'

const enrollmentStore = useEnrollmentStore()
const route = useRoute()
const activityId = route.params.id as string

const props = defineProps<{ search: string }>()

const showFilterDialog1 = ref(false)
const filterCategories1 = ref([
  'year', 
  'major', 
  'statusStudent',
])

const pagination = computed({
  get: () => ({
    sortBy: enrollmentStore.query.sortBy,
    descending: enrollmentStore.query.order === 'desc',
    page: enrollmentStore.query.page,
    rowsPerPage: enrollmentStore.query.limit,
    rowsNumber: enrollmentStore.total,
  }),

  set: (val) => {
    enrollmentStore.query.page = val.page
    enrollmentStore.query.limit = val.rowsPerPage
    enrollmentStore.query.sortBy = val.sortBy
    enrollmentStore.query.order = val.descending ? 'desc' : 'asc'
  },
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  enrollmentStore.query.page = page
  enrollmentStore.query.limit = rowsPerPage
  enrollmentStore.query.sortBy = sortBy
  enrollmentStore.query.order = descending ? 'desc' : 'asc'
  enrollmentStore.query.search = search1.value

  await enrollmentStore.fetchEnrollmentsByActivityID(activityId)
}

const getStatusText = (status: string) => {
  const numStatus = parseInt(status, 10)
  switch (numStatus) {
    case 0:
      return 'พ้นสภาพ'
    case 1:
      return 'ชั่วโมงน้อยมาก'
    case 2:
      return 'ชั่วโมงน้อย'
    case 3:
      return 'ชั่วโมงครบแล้ว'
    default:
      return '-'
  }
}

const getStatusClass = (status: string) => {
  const numStatus = parseInt(status, 10)
  if (numStatus === 3) return 'status-complete'
  if (numStatus === 2) return 'status-medium'
  if (numStatus === 1) return 'status-low'
  if (numStatus === 0) return 'status-out'
  return ''
}

interface SelectedFilters {
  year: string[]
  major: string[]
  statusStudent: string[]
}

const applyStudentFilters = async (selectedFilters: SelectedFilters) => {
  enrollmentStore.query.studentYears = selectedFilters.year
  enrollmentStore.query.major = selectedFilters.major
  enrollmentStore.query.status = selectedFilters.statusStudent
  
  // กลับไปหน้าแรกก่อน!
  enrollmentStore.query.page = 1 

  await fetchStudents()
}

const handleApplyFilters = async (selectedFilters: SelectedFilters) => {
  await applyStudentFilters(selectedFilters)
  showFilterDialog1.value = false // <<< ปิด dialog หลัง apply
}

const search1 = ref(props.search)

const students = computed(() => {
  return enrollmentStore.enrollments.map((enrollment) => ({
    id: enrollment.id,
    studentId: enrollment.student.code,
    name: enrollment.student.name,
    major: enrollment.student.major,
    checkIn: '-',
    checkOut: '-',
    status: enrollment.student.status, // ใส่ฟังก์ชันแปลง
  }))
})

const fetchStudents = async () => {
  await onRequest({ pagination: pagination.value }) 
}

const columns = [
  { name: 'index', label: 'ลำดับ', align: 'left' as const, field: 'index' },
  { name: 'studentId', label: 'รหัสนิสิต', field: 'studentId', align: 'left' as const },
  { name: 'name', label: 'ชื่อ-สกุล', field: 'name', align: 'left' as const },
  { name: 'major', label: 'สาขา', field: 'major', align: 'left' as const },
  { name: 'checkIn', label: 'เช็คชื่อเข้า', field: 'checkIn', align: 'center' as const },
  { name: 'checkOut', label: 'เช็คชื่อออก', field: 'checkOut', align: 'center' as const },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' as const },
  { name: 'actions', label: '', field: 'actions', align: 'center' as const },
]

// ฟังก์ชันลบนิสิต
const removeStudentFromList = () => {
  // students.value = students.value.filter((student) => student.id !== studentId)
}

onMounted(async () => {
  await enrollmentStore.fetchEnrollmentsByActivityID(activityId)
})

</script>

<template>
  <div class="q-mb-sm student-container">
    <div class="student-table-wrapper">
      <div class="row justify-end items-center">

        <!-- ช่องค้นหา -->
        <q-input 
        dense outlined 
        v-model="search1" 
        @keyup.enter="fetchStudents"
        placeholder="ค้นหาชื่อนิสิต/ รหัสนิสิต"
        class="q-mr-sm searchbox" 
        :style="{ boxShadow: 'none' }"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <!-- btnfilter -->
        <q-btn class="btnfilter" @click="showFilterDialog1 = true">
          <img src="icons/sort.svg" alt="Sort Icon" width="30" height="30" />
          <FilterDialog
          :model-value="showFilterDialog1"
          :categories="filterCategories1"
          @apply="handleApplyFilters"
          @update:modelValue="(val) => showFilterDialog1 = val"
          />
        </q-btn>
      </div>

      <q-table 
      flat bordered 
      :rows="students" 
      :columns="columns" 
      row-key="id"
      class="q-mt-md customtable my-sticky-header-table" 
      @request="onRequest" 
      v-model:pagination="pagination"
      :rows-per-page-options="[10, 20, 50]"
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
            <q-btn
            :label="getStatusText(props.row.status)"
            rounded
            unelevated
            class="status-btn"
            :class="getStatusClass(props.row.status)"
            />
          </q-td>
        </template>

        <!-- ปุ่มลบ -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <RemoveStudent :id="props.row.id" @removeStudent="removeStudentFromList" />
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<style scoped>

.student-container {
  display: flex;
  align-items: flex-start;
  gap: 180px;
  background-color: #EDF0F5;
  height: 680px;
  width: 100%;
}

.student-table-wrapper {
  flex: none;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  max-height: 600px;
}

.q-table {
  width: 100%;
}

.my-sticky-header-table {
  height: 60vh;
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}

/* .my-sticky-header-table::-webkit-scrollbar {
    display: none;
} */

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #fff;
}

/* .status-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
} */

.status-complete {
    background-color: #cfd7ff;
    color: #001780;
    border: 2px solid #002dff;
    padding: 3px 30px;
    width: 130px;
}

.status-medium {
    background-color: #ffe7ba;
    color: #ff6f00;
    border: 2px solid #ffa500;
    padding: 3px 30px;
    width: 130px;
}

.status-low {
    background-color: #ffc5c5;
    color: #ff0000;
    border: 2px solid #f32323;
    padding: 3px 30px;
    width: 130px;
}

.status-out {
    background-color: #dadada;
    color: #000000;
    border: 2px solid #575656;
    padding: 3px 30px;
    width: 130px;
}
</style>
