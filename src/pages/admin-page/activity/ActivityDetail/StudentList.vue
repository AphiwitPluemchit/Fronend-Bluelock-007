<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import RemoveStudent from './RemoveStudent.vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import type { ActivityEnrollmentPagination } from 'src/types/pagination'
import type { Activity } from 'src/types/activity'
import { useEnrollmentStore } from 'src/stores/enrollment'
import { useRoute } from 'vue-router'
import { EnrollmentService } from 'src/services/enrollment'
import { ActivityService } from 'src/services/activity'

const enrollmentStore = useEnrollmentStore()
const route = useRoute()
const activityId = route.params.id as string
const allTab = ref<Activity | null>(null)
const indexTab = ref(0)
const query = ref<ActivityEnrollmentPagination>({
  page: 1,
  limit: 5,
  search: '',
  sortBy: '_id',
  order: 'desc',
  major: [],
  status: [],
  studentYears: []
})
const filterCategories1 = ref([
  'year',
  'major',
  'statusStudent',
])

const pagination = ref({
  sortBy: query.value.sortBy,
  descending: query.value.order === 'desc',
  page: query.value.page,
  rowsPerPage: query.value.limit,
  rowsNumber: 0,
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.sortBy = descending ? 'desc' : 'asc'
  await fetchStudents()
  // await enrollmentStore.fetchEnrollmentsByActivityID(activityId)
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
  console.log(selectedFilters);

  query.value.studentYears = selectedFilters.year
  query.value.major = selectedFilters.major
  query.value.status = selectedFilters.statusStudent
  // enrollmentStore.query.page = 1
  await fetchStudents()
}

const search1 = computed({
  get: () => enrollmentStore.query.search,
  set: (val) => enrollmentStore.query.search = val,
})

const students = computed(() => {
  return enrollmentStore.studentEnrollments
})

const fetchStudents = async () => {
  const res = await ActivityService.getOne(activityId)
  allTab.value = res.data
  console.log(allTab.value);
  if (allTab.value && allTab.value.activityItems && allTab.value.activityItems.length > 0) {
    const activityItemId = allTab.value.activityItems[indexTab.value]!.id!
    console.log(query.value);
    const data = await EnrollmentService.getEnrollmentsByActivityID(activityItemId, query.value)
    pagination.value.page = query.value.page
    pagination.value.rowsPerPage = query.value.limit
    pagination.value.sortBy = query.value.sortBy
    pagination.value.rowsNumber = data.meta.total
    console.log(pagination.value);
    enrollmentStore.studentEnrollments = data.data
    // ...
  } else {
    console.error('activityItems is null or undefined');
  }

}

// const activityItemOptions = computed(() => {
//   return allTab.value?.activityItems?.map(item => ({
//     label: item.name,
//     value: item.id
//   })) || []
// })

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
  await fetchStudents()
  // console.log(enrollmentStore.enrollments.students)
  console.log(students.value);


  // await enrollmentStore.fetchEnrollmentsByActivityID(activityId)
})

</script>

<template>
  <div class="q-mb-sm student-container">
    <div class="student-table-wrapper">
      <div class="row justify-end items-center">
        <div v-for="(activityItems, index) in allTab?.activityItems" :key="index">
          <div @click="indexTab = index, fetchStudents()"
            style="cursor: pointer; margin-right: 10px; font-weight: bold; background-color: coral;">
            {{ activityItems.name }}
            <!-- do something with activity.activityItems -->
          </div>
        </div>
        <!-- ช่องค้นหา -->
        <q-input dense outlined v-model="search1" @keyup.enter="fetchStudents"
          placeholder="ค้นหาชื่อ-นามสกุล/ รหัสนิสิต" class="q-mr-sm searchbox" :style="{ boxShadow: 'none' }">

          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <FilterDialog :categories="filterCategories1" @apply="applyStudentFilters" />
      </div>

      <!-- <div class="q-pa-md">
        <q-select filled v-model="indexTab" :options="activityItemOptions" option-label="label" option-value="value"
          label="เลือกกิจกรรมย่อย" emit-value map-options @update:model-value="fetchStudents" />
      </div> -->


      <q-table flat bordered :rows="students" :columns="columns" row-key="id" class="q-mt-md new-sticky-header"
        @request="onRequest" v-model:pagination="pagination" :rows-per-page-options="[10, 20, 30, 40, 50]"
        :rows-number="enrollmentStore.total">

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
