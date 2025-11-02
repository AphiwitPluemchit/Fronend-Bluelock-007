<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { QTableColumn } from 'quasar'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import ManageCerDialog from './ManageCerDialog.vue'
import {
  type CertificateQuery,
  CertificateService,
  dateTime,
  getStatus,
  getStatusClass,
  StatusType,
  type UploadCertificate,
} from 'src/services/certificate'
import { type PaginationRequest } from 'src/types/pagination'
import { seqNo } from 'src/utils/sequence'

const showFilterDialog = ref(false)
const filterCategories = ref(['major', 'statusCertificate'])
const params = ref<CertificateQuery>({
  page: 1,
  limit: 15,
  sortBy: 'uploadAt',
  order: 'desc',
  // default to show pending certificates
  status: ['pending'],
})
const loading = ref(false)
const pagination = ref<PaginationRequest>({
  descending: true,
  page: 1,
  rowsNumber: 0,
  rowsPerPage: 15,
  sortBy: 'uploadAt',
})

const columns: QTableColumn<UploadCertificate>[] = [
  { name: 'no', label: 'ลำดับ', field: () => '', align: 'left' },
  { name: 'code', label: 'รหัสนิสิต', field: (row) => row.student?.code, align: 'left' },
  { name: 'name', label: 'ชื่อ-สกุล', field: (row) => row.student?.name, align: 'left' },
  { name: 'major', label: 'สาขา', field: (row) => row.student?.major, align: 'left' },
  {
    name: 'courseName',
    label: 'ชื่อหัวข้อการอบรม',
    field: (row) => row.course?.name,
    align: 'left',
  },
  { name: 'uploadAt', label: 'วันที่อัปโหลด', field: (row) => row.uploadAt, align: 'left' },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' },
  { name: 'action', label: '', field: (row) => row, align: 'center' },
]

const showDialog = ref(false)
const selectedCert = ref<UploadCertificate>({
  id: '',
  studentId: '',
  courseId: '',
  url: '',
  nameMatch: 0,
  courseMatch: 0,
  status: StatusType.PENDING,
  isDuplicate: false,
  uploadAt: '',
  changedStatusAt: '',
})

const openManageCer = (row: UploadCertificate) => {
  const found = rows.value.find((cert) => cert.id === row.id)
  if (found) {
    selectedCert.value = { ...found }
    showDialog.value = true
  }
}

const handleConfirm = async () => {
  // Refresh ข้อมูลหลังจากอัปเดตสถานะสำเร็จ
  await fetchCertificates()
  showDialog.value = false
}

//Mock up
//Mock up
const rows = ref<UploadCertificate[]>([])

async function onRequest(props: {
  pagination: { sortBy: string; descending: boolean; page: number; rowsPerPage: number }
}) {
  params.value.page = props.pagination.page
  params.value.limit = props.pagination.rowsPerPage
  params.value.sortBy = props.pagination.sortBy
  params.value.order = props.pagination.descending ? 'desc' : 'asc'
  await fetchCertificates()
}

const fetchCertificates = async () => {
  try {
    const response = await CertificateService.getAll(params.value)
    rows.value = response.data
    pagination.value.rowsNumber = response.meta.total
    pagination.value.page = response.meta.page
    pagination.value.rowsPerPage = response.meta.limit
  } catch (error) {
    console.error('Error fetching certificates:', error)
  }
}

// Handle filters applied from FilterDialog
type DialogFilters = {
  year?: string[]
  major?: string[]
  statusProgram?: string[]
  categoryProgram?: string[]
  studentStatus?: string[]
  statusCertificate?: string[]
}

async function onFilterApply(filters: DialogFilters) {
  // Map majors -> backend expects comma-separated string
  if (filters.major && filters.major.length > 0) {
    params.value.major = filters.major
  } else {
    delete params.value.major
  }

  // Map certificate statuses -> backend accepts comma-separated statuses
  if (filters.statusCertificate && filters.statusCertificate.length > 0) {
    params.value.status = filters.statusCertificate
  } else {
    delete params.value.status
  }

  // Reset to first page on filter change
  params.value.page = 1
  await fetchCertificates()
}

onMounted(async () => {
  await fetchCertificates()
})
</script>
<template>
  <q-page class="q-pa-md">
    <!-- ชื่อหน้า -->
    <div class="row justify-between items-center q-mb-md" style="margin-top: 20px">
      <div class="texttitle">จัดการใบประกาศนียบัตร</div>
    </div>

    <!-- แถวค้นหาและไอคอน -->
    <section class="q-mt-lg">
      <div class="row justify-end items-center">
        <div class="text-h6"></div>
        <div class="row">
          <q-input
            dense
            outlined
            v-model="params.search"
            label="ค้นหาชื่อหรือรหัสนิสิต"
            class="q-mr-sm searchbox"
            debounce="500"
            @update:model-value="fetchCertificates"
            :style="{ boxShadow: 'none', border: 'none' }"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <FilterDialog
            v-model="showFilterDialog"
            :categories="filterCategories"
            :statusCertificate="['pending']"
            class="q-mr-sm"
            @apply="onFilterApply"
          />
        </div>
      </div>

      <!-- ตาราง -->
      <q-table
        bordered
        flat
        :rows="rows"
        :columns="columns"
        v-model:pagination="pagination"
        :loading="loading"
        @request="onRequest"
        row-key="id"
        class="q-mt-md my-sticky-header-table"
      >
        <!-- Header Sticky -->
        <template v-slot:header="props">
          <q-tr :props="props" class="sticky-header">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Body -->
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="id">{{
              seqNo(props.rowIndex, pagination.page, pagination.rowsPerPage)
            }}</q-td>
            <q-td key="code">{{ props.row.student?.code }}</q-td>
            <q-td
              key="name"
              style="
                max-width: 300px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
              >{{ props.row.student?.name }}</q-td
            >
            <q-td key="major">{{ props.row.student?.major }}</q-td>
            <q-td
              key="courseName"
              style="
                max-width: 350px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
              >{{ props.row.course?.name }}</q-td
            >
            <q-td key="uploadAt">{{ dateTime(props.row.uploadAt) }}</q-td>
            <q-td key="status" class="text-center">
              <q-badge
                :label="getStatus(props.row.status)"
                class="status-badge"
                :class="getStatusClass(props.row.status)"
              />
            </q-td>
            <td key="action" class="text-center q-gutter-x-sm">
              <q-icon
                clickable
                name="edit"
                class="bg-primary text-white q-pa-xs rounded-borders q-mr-sm"
                @click="openManageCer(props.row)"
              >
                <q-tooltip>จัดการใบประกาศนียบัตร</q-tooltip>
              </q-icon>
            </td>
          </q-tr>
        </template>
        <!-- no data -->
        <template v-slot:no-data>
          <div class="full-width text-center q-pa-md text-grey" style="font-size: 20px">
            ไม่มีรายชื่อนิสิตที่อัปโหลดใบประกาศนียบัตร
          </div>
        </template>
      </q-table>
      <ManageCerDialog v-model="showDialog" :data="selectedCert" @confirm="handleConfirm" />
    </section>
  </q-page>
</template>

<style scoped>
.my-sticky-header-table {
  min-height: 340px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

/* Sticky thead (ใช้ภายใน q-table ได้เลย) */
.my-sticky-header-table thead tr {
  background-color: #162aae;
  font-weight: bold;
  font-size: 16px;
  color: #ffffff;
  border-bottom: 2px solid #d0d0d0;
  transition: background-color 0.3s ease;
}
.my-sticky-header-table td,
.my-sticky-header-table th {
  padding: 10px 12px;
  font-size: 15px;
}
.status-badge {
  height: 32px;
  line-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  text-align: center;
  display: inline-block;
  font-size: 15px;
  width: 130px;
}

.status-approved {
  background-color: #d0ffc5;
  color: #009812;
  border: 1px solid #00bb16;
  padding: 3px 30px;
  width: 130px;
}

.status-pending {
  background-color: #ffe7ba;
  color: #ff6f00;
  border: 1px solid #ffa500;
  padding: 3px 30px;
  width: 130px;
}

.status-rejected {
  background-color: #ffc5c5;
  color: #ff0000;
  border: 1px solid #f32323;
  padding: 3px 30px;
  width: 130px;
}

.sticky-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}
</style>
