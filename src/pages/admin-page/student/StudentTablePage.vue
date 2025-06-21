<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import ManageStudentDialog from './ManageStudentDialog.vue'
import { useStudentStore } from 'src/stores/student'

const studentStore = useStudentStore()
const router = useRouter()
const search1 = ref('')
const students = computed(() => studentStore.students ?? [])

onMounted(async () => {
  await data()
})

const goToDetail = (code: string) => {
  void router.push(`/Admin/StudentManagement/StudentDetail/${code}`)
}
interface SelectedFilters {
  year: string[]
  major: string[]
  studentStatus: string[]
}
const showFilterDialog1 = ref(false)
const filterCategories1 = ref(['major', 'year', 'studentStatus'])

const applyFilters = async (selectedFilters: SelectedFilters) => {
  studentStore.query.studentYear = selectedFilters.year ?? []
  studentStore.query.major = selectedFilters.major ?? []
  studentStore.query.studentStatus = selectedFilters.studentStatus ?? []

  await data()
}

const data = async () => {
  await studentStore.getStudents() // ✅ เรียกจาก store

  // อัปเดต pagination ให้ sync
  pagination.value.page = studentStore.query.page
  pagination.value.rowsPerPage = studentStore.query.limit
  pagination.value.sortBy = studentStore.query.sortBy
  pagination.value.rowsNumber = Array.isArray(studentStore.students)
    ? studentStore.students.length
    : 0
}

const query = computed(() => studentStore.query)

const pagination = ref({
  sortBy: query.value.sortBy,
  descending: query.value.order === 'desc',
  page: query.value.page,
  rowsPerPage: query.value.limit,
  rowsNumber: 0,
})
const manageDialogRef = ref<InstanceType<typeof ManageStudentDialog> | null>(null)

// ฟังก์ชันเปิด ManageStudentDialog
const openManageDialog = async () => {
  await nextTick() // รอให้ DOM อัปเดตก่อน
  if (manageDialogRef.value) {
    manageDialogRef.value.openDialog()
  }
}

const getStatusClass = (status: number) => {
  if (status === 3) return 'status-complete'
  if (status === 2) return 'status-medium'
  if (status === 1) return 'status-low'
  if (status === 0) return 'status-out'
  return ''
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return 'พ้นสภาพ'
    case 1:
      return 'ชั่วโมงน้อยมาก'
    case 2:
      return 'ชั่วโมงน้อย'
    case 3:
      return 'ชั่วโมงครบ'
    default:
      return 'ไม่ทราบสถานะ'
  }
}

const columns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'left' as const },
  { name: 'code', label: 'รหัสนิสิต', field: 'code', align: 'left' as const },
  {
    name: 'name',
    label: 'ชื่อ-สกุล',
    field: 'name',
    align: 'left' as const,
  },
  { name: 'major', label: 'สาขา', field: 'major', align: 'left' as const },
  {
    name: 'softskill',
    label: 'ชั่วโมงเตรียมความพร้อม',
    field: 'softskill',
    align: 'center' as const,
  },
  {
    name: 'hardskill',
    label: 'ชั่วโมงทักษะทางวิชาการ',
    field: 'hardskill',
    align: 'center' as const,
  },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' as const },
  { name: 'action', label: '', field: 'action', align: 'center' as const },
]
</script>

<template>
  <q-page class="q-pa-md">
    <!-- ชื่อหน้า -->
    <div class="row justify-start items-center" style="margin-top: 20px">
      <div class="texttitle">จัดการข้อมูลนิสิต</div>
    </div>
    <!-- ตาราง 1 -->
    <section class="q-mt-lg">
      <div class="search-filter-wrapper row wrap justify-end items-start">
        <!-- Search box -->
        <q-input
          dense
          outlined
          v-model="search1"
          label="ค้นหา ชื่อนิสิต"
          class="q-mr-sm searchbox"
          :style="{ border: 'none' }"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <!-- Buttons -->
        <div class="btn-filter-wrapper row no-wrap">
          <q-btn
            dense
            outlined
            icon="settings"
            label="จัดการข้อมูล"
            @click="openManageDialog"
            class="q-mr-sm btnadd"
          >
            <ManageStudentDialog ref="manageDialogRef" />
          </q-btn>

          <FilterDialog
            v-model="showFilterDialog1"
            :categories="filterCategories1"
            @apply="applyFilters"
            class="q-mr-sm"
          />
        </div>
      </div>

      <!-- ตาราง -->
      <q-table
        bordered
        flat
        :rows="students"
        :columns="columns"
        row-key="id"
        class="q-mt-md"
        :pagination="{ rowsPerPage: 10 }"
      >
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
                :label="getStatusText(props.row.status)"
                :class="getStatusClass(props.row.status)"
                class="status-badge"
                unelevated
              />
            </q-td>

            <q-td class="q-gutter-x-sm">
              <q-icon
                name="visibility"
                @click="goToDetail(props.row.code)"
                class="cursor-pointer"
                size="20px"
              >
                <q-tooltip> ดูรายละเอียด </q-tooltip>
              </q-icon></q-td
            >
          </q-tr>
        </template>
        ></q-table
      >
    </section>
  </q-page>
</template>

<style scoped>
.status-complete {
  background-color: #cfd7ff;
  color: #001780;
  border: 2px solid #002dff;
  padding: 3px 30px;
  width: 130px;
}
.status-high {
  background-color: #d0ffc5;
  color: #009812;
  border: 2px solid #00bb16;
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

.clickable-row:hover {
  background-color: #f5f5f5;
}
.info-icon {
  cursor: pointer;
  width: 60px;
}

.status-badge {
  height: 32px;
  line-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  text-align: center;
  display: inline-block;
  font-size: 15px;
}

@media (max-width: 620px) {
  .search-filter-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 10px; /* เพิ่มระยะห่างระหว่างกล่อง search กับปุ่มทั้งชุด */
  }
   .searchbox {
    width: 100% !important;
    margin-bottom: 0 !important; /* ใช้ gap แทน */
  }

    .btn-filter-wrapper {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 5px; 
    flex-wrap: nowrap;
  }

  .btn-filter-wrapper .btnadd {
    width: 90%;
  }

  .btn-filter-wrapper .q-mr-sm {
    margin-right: 0 !important;
  }
}

@media (max-width: 450px) {
  .texttitle {
    font-size: 28px;
    font-weight: 400;
  }
}
</style>
