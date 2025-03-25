<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import RemoveStudent from './RemoveStudent.vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import { useEnrollmentStore } from 'src/stores/enrollment'
import { useRoute } from 'vue-router'

const enrollmentStore = useEnrollmentStore()
const route = useRoute()
const activityId = route.params.id as string

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

  enrollmentStore.query.page = 1

  await fetchStudents()
}

const search1 = computed({
  get: () => enrollmentStore.query.search,
  set: (val) => enrollmentStore.query.search = val,
})

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
  {
    name: 'index',
    label: 'ลำดับ',
    align: 'left' as const,
    field: 'index',
    style: 'width: 7%;',
    headerStyle: 'width: 7%;',
  },
  {
    name: 'studentId',
    label: 'รหัสนิสิต',
    field: 'studentId',
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

const removeStudentFromActivity = async (studentId: string) => {
  try {
    await enrollmentStore.deleteEnrollmentById(studentId)
    // ลบเสร็จ → Refresh ตาราง
    await fetchStudents()
  } catch (error) {
    console.error('Failed to delete student:', error)
  }
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
          dense 
          outlined 
          v-model="search1" 
          @keyup.enter="fetchStudents"
          placeholder="ค้นหาชื่อ-นามสกุล/ รหัสนิสิต" 
          class="q-mr-sm searchbox" 
          :style="{ boxShadow: 'none' }"
        >

          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <FilterDialog :categories="filterCategories1" @apply="applyStudentFilters" />
      </div>

      <q-table 
        flat bordered 
        :rows="students" 
        :columns="columns" 
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
            <q-btn :label="getStatusText(props.row.status)" rounded unelevated class="status-btn"
              :class="getStatusClass(props.row.status)" />
          </q-td>
        </template>

        <!-- ปุ่มลบ -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <RemoveStudent :id="props.row.id" @removeStudent="() => removeStudentFromActivity(props.row.id)" />
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.student-container {
  background-color: #EDF0F5;
  height: 680px;
  width: 100%;
}

// .student-table-wrapper {
//   display: flex;
//   width: 100%;
//   max-width: 100%;
//   display: flex;
//   flex-direction: column;
// }

// .my-sticky-header-table {
//   min-height: 450px; 
//   overflow: auto;
// }

.q-table table {
  table-layout: fixed;
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

.ellipsis-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

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
