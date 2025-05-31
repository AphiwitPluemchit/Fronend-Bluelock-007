<template>
  <q-page class="q-pa-md">
    <!-- ชื่อหน้า -->
    <div class="row justify-start items-center">
      <div class="text-h4">จัดการข้อมูลนิสิต</div>
    </div>
    <!-- ตาราง 1 -->
    <section class="q-mt-lg">
      <div class="row justify-end items-center">
        <div class="text-h6"></div>
        <div class="row">
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
          <FilterDialog
            v-model="showFilterDialog1"
            :categories="filterCategories1"
            @apply="applyFilters"
            class="q-mr-sm"
          />
          <div>
            <q-btn
              dense
              outlined
              icon="settings"
              label="จัดการข้อมูล"
              class="btnadd"
              @click="openManageDialog"
            >
              <ManageStudentDialog ref="manageDialogRef"
            /></q-btn>
          </div>
        </div>
      </div>

      <!-- ตาราง -->
      <q-table
        bordered
        flat
        :rows="studentStore.students"
        :columns="columns"
        row-key="id"
        class="q-mt-md customtable"
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
                :label="calculateStatus(props.row.softSkill, props.row.hardSkill)"
                :class="getStatusClass(calculateStatus(props.row.softSkill, props.row.hardSkill))"
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

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import ManageStudentDialog from './ManageStudentDialog.vue'
import { useStudentStore } from 'src/stores/student'
import type { Pagination } from 'src/types/pagination'
import { StudentService } from 'src/services/student'

const studentStore = useStudentStore()
const router = useRouter()
const search1 = ref('')
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
  query.value.studentYear = selectedFilters.year
  query.value.major = selectedFilters.major
  query.value.studentStatus = selectedFilters.studentStatus
  await data()
}
const data = async () => {
  const data = await getStudents(query.value)
  pagination.value.page = query.value.page
  pagination.value.rowsPerPage = query.value.limit
  pagination.value.sortBy = query.value.sortBy
  pagination.value.rowsNumber = data.meta.total
  studentStore.students = data.data
}
const query = ref<Pagination>({
  page: 1,
  limit: 10,
  search: '',
  sortBy: 'code',
  order: 'asc',
  major: [],
  studentYear: [],
  studentStatus: [],
})
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

const getStatusClass = (status: string) => {
  if (status === 'ชั่วโมงมาก') return 'status-high'
  if (status === 'ชั่วโมงน้อย') return 'status-medium'
  if (status === 'ชั่วโมงครบแล้ว') return 'status-complete'
  if (status === 'ชั่วโมงน้อยมาก') return 'status-low'
  return ''
}

const calculateStatus = (softskill: number, hardskill: number) => {
  if (softskill >= 30 && hardskill >= 12) {
    return 'ชั่วโมงครบแล้ว'
  } else if (softskill >= 20 && hardskill >= 8) {
    return 'ชั่วโมงมาก'
  } else if (softskill >= 10 && hardskill >= 4) {
    return 'ชั่วโมงน้อย'
  } else {
    return 'ชั่วโมงน้อยมาก'
  }
}

async function getStudents(qeury: Pagination) {
  const data = await StudentService.getAll(qeury)
  return data
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
</style>
