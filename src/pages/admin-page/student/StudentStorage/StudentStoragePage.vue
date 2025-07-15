<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import { useStudentStore } from 'src/stores/student'

const studentStore = useStudentStore()
const router = useRouter()
const show = ref(false)
const students = computed(() => studentStore.students ?? [])

interface SelectedFilters {
  major: string[]
}
const showFilterDialog1 = ref(false)
const filterCategories1 = ref(['major'])

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
  studentStore.query.major = selectedFilters.major ?? []
  studentStore.query.studentStatus = ['0']

  await data()
}

const data = async () => {
  studentStore.query.studentStatus = ['0'] // กรองเฉพาะนิสิตที่พ้นสภาพ
  await studentStore.getStudents() // ✅ เรียกจาก store

  // อัปเดต pagination ให้ sync
  pagination.value.page = studentStore.query.page
  pagination.value.rowsPerPage = studentStore.query.limit
  pagination.value.sortBy = studentStore.query.sortBy
  pagination.value.rowsNumber = studentStore.totalStudentsCount
}

const query = computed(() => studentStore.query)

const pagination = ref({
  sortBy: query.value.sortBy,
  descending: query.value.order === 'desc',
  page: query.value.page,
  rowsPerPage: query.value.limit,
  rowsNumber: 0,
})
// const manageDialogRef = ref<InstanceType<typeof ManageStudentDialog> | null>(null)

// ฟังก์ชันเปิด ManageStudentDialog
const goToConfirmStudentDataPage = () => {
  void router.push('/Admin/StudentStorage/ConfirmStudentDataPage')
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
    studentStatus: ['0'],
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
    <!-- ชื่อหน้า -->
    <div class="row justify-between items-center" style="margin-top: 20px">
      <div class="texttitle">จัดเก็บข้อมูลนิสิต</div>
      <q-btn
        v-if="show"
        dense
        outlined
        label="จัดเก็บนิสิต"
        @click="goToConfirmStudentDataPage"
        class="btnadd"
      >
      </q-btn>
    </div>

    <!-- ตาราง 1 -->
    <section class="q-mt-lg" v-if="show">
      <div class="search-filter-wrapper row wrap justify-end items-start">
        <!-- Search box -->
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

        <!-- Buttons -->
        <div class="btn-filter-wrapper row no-wrap">
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
    </section>
  </q-page>
</template>

<style scoped>
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
