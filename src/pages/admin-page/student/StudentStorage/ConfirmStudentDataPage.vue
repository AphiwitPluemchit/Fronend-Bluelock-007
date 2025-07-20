<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStudentStore } from 'src/stores/student'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'

const breadcrumbs = ref({
  previousPage: { title: 'จัดเก็บข้อมูลนิสิต', path: '/Admin/StudentStorage' },
  currentPage: {
    title: 'ยืนยันการจัดเก็บข้อมูลนิสิต',
    path: '/Admin/StudentStorage/ConfirmStudentDataPage',
  },
  icon: 'people',
})
const show = ref(false)
const studentStore = useStudentStore()
interface SelectedFilters {
  studentCode: string
  major: string
}
const selectedStudentCode = ref<string>('')
const selectedMajors = ref<string>('')
const yearOptions = ['60', '61', '62', '63', '64', '65', '66']
const majorOptions = ['CS', 'AAI', 'SE', 'ITDI']

const selectedStudents = ref<string[]>([])
const students = computed(() => studentStore.students ?? [])

const data = async () => {
  console.log(studentStore.query)

  await studentStore.getStudents()
  // อัปเดต pagination ให้ sync
  pagination.value.page = studentStore.query.page || 1
  pagination.value.rowsPerPage = studentStore.query.limit || 5
  pagination.value.sortBy = studentStore.query.sortBy || ''
  pagination.value.rowsNumber = studentStore.totalStudentsCount
}
async function onRequest(requestProp: {
  pagination: { sortBy: string; descending: boolean; page: number; rowsPerPage: number }
}) {
  query.value.page = requestProp.pagination.page
  query.value.limit = requestProp.pagination.rowsPerPage
  query.value.sortBy = requestProp.pagination.sortBy
  query.value.order = requestProp.pagination.descending ? 'desc' : 'asc'
  await data()
}
const applyFilters = async (selectedFilters: SelectedFilters) => {
  studentStore.query.studentCode = selectedFilters.studentCode ? [selectedFilters.studentCode] : []
  studentStore.query.major = selectedFilters.major ? [selectedFilters.major] : []
  await data()
}
const query = computed(() => studentStore.query)

const pagination = ref({
  sortBy: query.value.sortBy || '',
  descending: query.value.order === 'desc',
  page: query.value.page || 1,
  rowsPerPage: query.value.limit || 5,
  rowsNumber: 0,
})
const saveStudents = async () => {
  try {
    for (const code of selectedStudents.value) {
      const student = studentStore.students.find((s) => s.code === code)
      if (student) {
        const updatedStudent = { ...student, status: 0 }
        await studentStore.updateStudent(updatedStudent)
      }
    }
    await studentStore.getStudents()
    selectedStudents.value = []
  } catch (error) {
    console.error('จัดเก็บนิสิตล้มเหลว:', error)
  }
}

const columns = [
  { name: 'check', label: '', field: 'check', align: 'left' as const },
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'left' as const },
  { name: 'code', label: 'รหัสนิสิต', field: 'code', align: 'left' as const },
  { name: 'name', label: 'ชื่อ-สกุล', field: 'name', align: 'left' as const },
  { name: 'major', label: 'สาขา', field: 'major', align: 'left' as const },
  {
    name: 'softskill',
    label: 'ชั่วโมงเตรียมความพร้อม',
    field: 'softSkill',
    align: 'center' as const,
  },
  {
    name: 'hardskill',
    label: 'ชั่วโมงทักษะทางวิชาการ',
    field: 'hardSkill',
    align: 'center' as const,
  },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' as const },
]

onMounted(async () => {
  show.value = false
  studentStore.query = {
    page: 1,
    limit: 10,
    sortBy: 'code',
    order: 'asc',
    search: '',
    major: [],
    studentStatus: [],
    studentCode: [], // กรองเฉพาะนิสิตที่พ้นสภาพ
    skill: [],
    studentYear: [],
  }
  await data()
  show.value = true
})
</script>

<template>
  <q-page class="q-pa-md">
    <div style="margin-top: 20px">
      <AppBreadcrumbs :breadcrumbs="breadcrumbs" />
    </div>

    <section class="q-mt-lg" v-if="show">
      <div class="col-12 row items-center q-pa-sm">
        <div class="col-auto text-right q-pr-md">
          <p class="q-my-none">ปีการศึกษาที่ต้องการจัดเก็บ :</p>
        </div>
        <q-select
          dense
          outlined
          v-model="selectedStudentCode"
          :options="yearOptions"
          label="รหัสปีนิสิต"
          emit-value
          map-options
          class="q-mr-sm dropdown"
          :style="{ border: 'none' }"
          @update:model-value="
            applyFilters({ studentCode: selectedStudentCode, major: selectedMajors })
          "
        />

        <q-select
          dense
          outlined
          v-model="selectedMajors"
          :options="majorOptions"
          label="สาขาที่ต้องการจัดเก็บ"
          emit-value
          map-options
          class="q-mr-sm dropdown"
          :style="{ border: 'none' }"
          @update:model-value="
            applyFilters({ studentCode: selectedStudentCode, major: selectedMajors })
          "
        />
        <q-input
          dense
          outlined
          v-model="query.search"
          label="ค้นหา ชื่อนิสิต"
          class="q-mr-sm searchbox"
          :style="{ border: 'none' }"
          @keyup.enter="applyFilters"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div class="col-12 row justify-center items-center q-pr-md">
        <div class="text-h6 q-mt-lg">ตารางรายชื่อนิสิต</div>
      </div>

      <q-table
        bordered
        flat
        :rows="students"
        :columns="columns"
        v-model:pagination="pagination"
        :rows-per-page-options="[5, 7, 10, 15, 20]"
        @request="onRequest"
        row-key="code"
        class="q-mt-md"
      >
        <!-- <q-table bordered flat :rows="students" :columns="columns" @request="applyFilters" row-key="id" class="q-mt-md"> -->
        <!-- หัวตาราง Sticky -->
        <template v-slot:header="props">
          <q-tr :props="props" class="sticky-header">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <!-- เนื้อหาตาราง -->
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td style="width: 50px; text-align: center">
              <q-checkbox
                v-model="selectedStudents"
                :val="props.row.code"
                color="primary"
                dense
                keep-focus
              />
            </q-td>
            <q-td key="index">{{ props.rowIndex + 1 }}</q-td>
            <q-td key="code">{{ props.row.code }}</q-td>
            <q-td
              key="name"
              style="
                max-width: 200px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
              >{{ props.row.name }}</q-td
            >
            <q-td key="major">{{ props.row.major }}</q-td>
            <q-td class="text-center" key="softskill">{{ props.row.softSkill }}/30</q-td>
            <q-td class="text-center" key="hardskill">{{ props.row.hardSkill }}/12</q-td>
            <!-- แสดงสถานะพร้อมสี -->
            <q-td class="text-center">
              <q-badge
                :label="studentStore.getStatusText(props.row.status)"
                :class="studentStore.getStatusClass(props.row.status)"
                class="status-badge"
                unelevated
              />
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <div class="row justify-end q-mt-md">
        <q-btn
          dense
          outlined
          icon="save"
          color="primary"
          label="จัดเก็บนิสิต"
          class="btnadd"
          @click="saveStudents"
        />
      </div>
    </section>
  </q-page>
</template>

<style scoped>
.status-badge {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  text-align: center;
  align-items: center; /* ✅ จัดแนวตั้งให้ตรงกลาง */
  justify-content: center; /* ✅ จัดแนวนอนให้ตรงกลาง */
  font-size: 15px;
}

.dropdown {
  min-width: 200px;
}
</style>

<style lang="scss" scoped>
.student-container {
  background-color: #edf0f5;
  height: 680px;
  width: 100%;
}

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
    thead tr:first-child th {
      background-color: #f5f5f5;
    }

    tbody {
      display: block;
      overflow-y: auto;
    }

    thead,
    tbody tr {
      display: table;
      width: 100%;
      table-layout: fixed;
    }

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
</style>
