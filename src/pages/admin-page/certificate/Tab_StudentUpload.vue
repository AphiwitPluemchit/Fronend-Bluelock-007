<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import ManageCerDialog from './ManageCerDialog.vue'
import { useCertificateStore } from 'src/stores/certificate'
import {
  getStatus,
  getStatusClass,
  StatusType,
  type UploadCertificate,
} from 'src/services/certificate'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

dayjs.locale('th')
const $q = useQuasar()
const route = useRoute()
const isMobile = computed(() => $q.screen.width <= 600)

// Store
const certificateStore = useCertificateStore()

// Filter categories for FilterDialog
const filterCategories = ref(['year', 'major', 'statusCertificate'])

// Get courseId from route params
const courseId = computed(() => route.params.id as string)

// Table columns
const submissionColumns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'left' as const },
  { name: 'uploadAt', label: 'วันที่อัปโหลด', field: 'uploadAt', align: 'left' as const },
  { name: 'studentCode', label: 'รหัสนิสิต', field: 'studentCode', align: 'left' as const },
  { name: 'studentName', label: 'ชื่อ-สกุล', field: 'studentName', align: 'left' as const },
  { name: 'major', label: 'สาขา', field: 'major', align: 'left' as const },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' as const },
  { name: 'action', label: '', field: 'action', align: 'center' as const },
]

// Search
const searchText = ref('')

// Computed values
const certificates = computed(() => certificateStore.certificates)
const loading = computed(() => certificateStore.loading)
const meta = computed(() => certificateStore.meta)
const query = computed(() => certificateStore.query)

// Table pagination state
const tablePagination = ref({
  sortBy: 'uploadAt',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

// Watch meta changes to update pagination
watch(
  meta,
  (newMeta) => {
    tablePagination.value.page = newMeta.page
    tablePagination.value.rowsPerPage = newMeta.limit
    tablePagination.value.rowsNumber = newMeta.total
  },
  { deep: true },
)

// Format date
const formatDate = (dateString: string) => {
  return dayjs(dateString).format('DD MMM YYYY')
}

// Get student full name
const getStudentName = (certificate: UploadCertificate) => {
  if (certificate.student) {
    return certificate.student.name || '-'
  }
  return '-'
}

// Get student code
const getStudentCode = (certificate: UploadCertificate) => {
  return certificate.student?.code || '-'
}

// Get student major
const getStudentMajor = (certificate: UploadCertificate) => {
  return certificate.student?.major || '-'
}

// Manage certificate dialog
const showManageDialog = ref(false)
const selectedCertificate = ref<UploadCertificate>({
  id: '',
  studentId: '',
  courseId: '',
  url: '',
  nameMatch: 0,
  courseMatch: 0,
  status: StatusType.PENDING,
  isDuplicate: false,
  uploadAt: '',
})

const openViewDialog = (certificate: UploadCertificate) => {
  selectedCertificate.value = { ...certificate }
  showManageDialog.value = true
}

// Handle filter apply
const handleFilterApply = async (filterData: {
  statusCertificate?: string[]
  major?: string[]
  year?: string[]
}) => {
  await certificateStore.applyFilters({
    status: filterData.statusCertificate ?? [],
    major: filterData.major ?? [],
    year: filterData.year ?? [],
    search: searchText.value,
  })
}

// Handle search
const handleSearch = async () => {
  await certificateStore.searchCertificates(searchText.value)
}

// Handle pagination
const handlePageChange = async (page: number) => {
  await certificateStore.changePage(page)
}

const handleLimitChange = async (limit: number) => {
  await certificateStore.changeLimit(limit)
}

// Watch search input with debounce
let searchTimeout: NodeJS.Timeout
watch(searchText, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    void handleSearch()
  }, 500)
})

// Handle table request (pagination, sorting)
const onRequest = (props: { pagination: { page: number; rowsPerPage: number } }) => {
  const { page, rowsPerPage } = props.pagination

  if (rowsPerPage !== meta.value.limit) {
    void handleLimitChange(rowsPerPage)
  } else if (page !== meta.value.page) {
    void handlePageChange(page)
  }
}

// Initialize data
onMounted(async () => {
  // Check if we should fetch by courseId or all certificates
  if (courseId.value) {
    // Fetch certificates for specific course
    await certificateStore.fetchCertificatesByCourse(courseId.value)
  } else {
    // Fetch all certificates
    await certificateStore.fetchCertificates()
  }
  // Initialize pagination from meta
  tablePagination.value.page = meta.value.page
  tablePagination.value.rowsPerPage = meta.value.limit
  tablePagination.value.rowsNumber = meta.value.total
})
</script>

<template>
  <div class="q-mb-sm student-container">
    <div class="student-table-wrapper">
      <!-- Search and Filter Row -->
      <div class="row justify-end items-center q-mb-md">
        <q-input
          v-model="searchText"
          placeholder="ค้นหารหัสนิสิต, ชื่อ-สกุล, หรือชื่อคอร์ส..."
          outlined
          dense
          clearable
          class="q-mr-sm searchbox"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <FilterDialog
          :categories="filterCategories"
          :majors="(Array.isArray(query.major) ? query.major : []) as string[]"
          :years="(Array.isArray(query.year) ? query.year : []) as string[]"
          :statusCertificate="(Array.isArray(query.status) ? query.status : []) as string[]"
          @apply="handleFilterApply"
        />
      </div>

      <div>
        <!-- TABLE MODE (Desktop) -->
        <q-table
          v-if="!isMobile"
          :columns="submissionColumns"
          :rows="certificates"
          :loading="loading"
          row-key="id"
          bordered
          flat
          class="tableHisAct q-mt-md"
          v-model:pagination="tablePagination"
          :rows-per-page-options="[10, 20, 50, 100]"
          @request="onRequest"
        >
          <template v-slot:body="props">
            <q-tr :props="props" class="sticky-header">
              <q-td key="index">
                {{ (meta.page - 1) * meta.limit + props.rowIndex + 1 }}
              </q-td>
              <q-td key="uploadAt">{{ formatDate(props.row.uploadAt) }}</q-td>
              <q-td key="studentCode">{{ getStudentCode(props.row) }}</q-td>
              <q-td key="studentName">{{ getStudentName(props.row) }}</q-td>
              <q-td key="major">{{ getStudentMajor(props.row) }}</q-td>
              <q-td key="status">
                <q-badge
                  :class="['status-badge', getStatusClass(props.row.status)]"
                  :label="getStatus(props.row.status)"
                />
              </q-td>
              <q-td key="action">
                <q-btn
                  flat
                  round
                  dense
                  icon="visibility"
                  color="primary"
                  @click="openViewDialog(props.row)"
                >
                  <q-tooltip>ดูรายละเอียด</q-tooltip>
                </q-btn>
              </q-td>
            </q-tr>
          </template>
          <template v-slot:no-data>
            <div class="full-width text-center q-pa-md text-grey" style="font-size: 20px">
              ไม่มีรายการการอัปโหลดใบรับรอง
            </div>
          </template>
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
        </q-table>

        <!-- CARD MODE (Mobile) -->
        <div v-else>
          <q-card
            v-for="(certificate, index) in certificates"
            :key="certificate.id || `cert-${index}`"
            class="q-mb-sm student-card"
            bordered
          >
            <q-card-section>
              <div class="text-subtitle1">
                {{ (meta.page - 1) * meta.limit + index + 1 }}. {{ getStudentName(certificate) }}
              </div>
              <div class="text-caption">รหัสนิสิต: {{ getStudentCode(certificate) }}</div>
              <div class="text-caption">วันที่อัปโหลด: {{ formatDate(certificate.uploadAt) }}</div>
              <div class="text-caption">สาขา: {{ getStudentMajor(certificate) }}</div>
              <div class="text-caption">
                สถานะ:
                <q-badge
                  :class="['status-badge', getStatusClass(certificate.status)]"
                  :label="getStatus(certificate.status)"
                />
              </div>
              <div class="q-mt-sm">
                <q-btn
                  flat
                  dense
                  color="primary"
                  icon="visibility"
                  label="ดูรายละเอียด"
                  @click="openViewDialog(certificate)"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Mobile Pagination -->
          <div class="q-mt-md text-center" v-if="meta.totalPages > 1">
            <q-pagination
              v-model="meta.page"
              :max="meta.totalPages"
              :max-pages="5"
              direction-links
              @update:model-value="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Manage Certificate Dialog -->
    <ManageCerDialog
      v-model="showManageDialog"
      :data="selectedCertificate"
      @confirm="handleSearch"
    />
  </div>
</template>

<style lang="scss" scoped>
.student-container {
  width: 100%;
}

.student-table-wrapper {
  padding: 16px;
}

.q-table table {
  table-layout: fixed;
}

.searchbox {
  max-width: 100%;
  min-width: 300px;
}

.text-right {
  text-align: right;
  display: flex;
  justify-content: flex-end;
  align-items: center;
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

.status-badge {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 15px;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.status-pending {
  background-color: #ffe7ba;
  color: #ff6f00;
  border: 1px solid #ffa500;
}

.status-approved {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #28a745;
}

.status-rejected {
  background-color: #ffc5c5;
  color: #ff0000;
  border: 1px solid #f32323;
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

@media (max-width: 1024px) {
  .text-right {
    text-align: left;
    justify-content: flex-start;
    margin-top: 8px;
  }
}

@media (max-width: 600px) {
  .student-table-wrapper {
    padding: 8px;
  }

  .student-card {
    margin-bottom: 12px;
    font-size: 16px;
  }

  .text-right {
    width: 100%;
    justify-content: flex-start;
  }

  .searchbox {
    min-width: 100%;
    margin-right: 0 !important;
    margin-bottom: 8px;
  }

  .row.justify-end {
    flex-direction: column;
    align-items: stretch !important;
  }
}

@media (max-width: 450px) {
  .ProgramNamelabel {
    font-size: 12px;
  }
}
</style>
