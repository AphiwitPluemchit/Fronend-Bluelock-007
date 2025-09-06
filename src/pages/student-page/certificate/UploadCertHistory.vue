<script setup lang="ts">
import {
  type CertificateQuery,
  CertificateService,
  type UploadCertificate,
} from 'src/services/certificate'
import { ref, onMounted, onBeforeUnmount, watchEffect } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { type QTableColumn } from 'quasar'
import { seqNo } from 'src/utils/sequence'
import { type QTableRequest } from 'src/types/pagination'

const authStore = useAuthStore()

const rows = ref<UploadCertificate[]>([])
const params = ref<CertificateQuery>({
  page: 1,
  limit: 15,
  sortBy: 'uploadAt',
  order: 'desc',
})

const pagination = ref({
  rowsPerPage: 15,
  page: 1,
  rowsNumber: 0,
  sortBy: 'uploadAt',
  order: 'desc',
})

const columns: QTableColumn<UploadCertificate>[] = [
  {
    name: 'no',
    label: 'ลำดับ',
    field: () => '',
    align: 'left' as const,
    sortable: false,
    style: 'width: 8%',
    headerStyle: 'width: 8%; text-align: left;',
  },
  {
    name: 'courseName',
    label: 'ชื่อ',
    field: (row) => row.course.name,
    align: 'left' as const,
    classes() {
      return 'ellipsis'
    },
    sortable: true,
    style: 'width: 25%; overflow: hidden; text-overflow: ellipsis;',
    headerStyle: 'width: 25%; text-align: left;',
  },
  {
    name: 'courseType',
    label: 'ประเภทกิจกรรม',
    field: (row) => translateSkillType(row.course.isHardSkill || false),
    align: 'left' as const,
    sortable: true,
    style: 'width: 18%',
    headerStyle: 'width: 18%; text-align: left;',
  },
  {
    name: 'hour',
    label: 'ชั่วโมงที่ได้รับ',
    field: (row) => row.course.hour,
    align: 'center' as const,
    sortable: true,
    style: 'width: 15%',
    headerStyle: 'width: 15%; text-align: center;',
  },
  {
    name: 'uploadAt',
    label: 'วันที่อัปโหลด',
    field: (row) => dateTime(row),
    align: 'left' as const,
    sortable: true,
    style: 'width: 12%',
    headerStyle: 'width: 12%; text-align: left;',
  },
  {
    name: 'status',
    label: 'สถานะ',
    field: (row) => getStatus(row.status),
    align: 'center' as const,
    sortable: true,
    style: 'width: 12%',
    headerStyle: 'width: 12%; text-align: center;',
  },
  // {
  //   // detail
  //   name: 'actions',
  //   label: 'รายละเอียด',
  //   field: (row) => row,
  //   sortable: false,
  //   style: 'width: 5%; text-align: center;',
  //   headerStyle: 'width: 5%; text-align: center;',
  // },
]

function getStatus(row: string) {
  switch (row) {
    case 'pending':
      return 'รออนุมัติ'
    case 'approved':
      return 'อนุมัติ'
    case 'rejected':
      return 'ไม่อนุมัติ'
    default:
      return ''
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case 'pending':
      return 'status-waiting'
    case 'approved':
      return 'status-approved'
    case 'rejected':
      return 'status-rejected'
    default:
      return ''
  }
}

function translateSkillType(isHardSkill: boolean) {
  switch (isHardSkill) {
    case true:
      return 'ทักษะทางวิชาการ'
    case false:
      return 'เตรียมความพร้อม'
    default:
      return '-'
  }
}

const dateTime = (row: UploadCertificate) => {
  return new Date(row.uploadAt).toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    // hour: '2-digit',
    // minute: '2-digit',
    // hour12: false,
  })
}

// Responsive variables
const isMediumScreen = ref(false)
const isSmallScreen = ref(false)

const checkScreen = () => {
  const width = window.innerWidth
  isSmallScreen.value = width <= 650
  isMediumScreen.value = width <= 850
}

async function fetchData() {
  await CertificateService.getAll(params.value).then((res) => {
    rows.value = res.data
    pagination.value.rowsNumber = res.meta.total
  })
}

onMounted(async () => {
  checkScreen()
  window.addEventListener('resize', checkScreen)

  if (authStore.isStudent && authStore.getUser?.id) {
    params.value.studentId = authStore.getUser?.id
  }

  await fetchData()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreen)
})

async function onRequest(props: QTableRequest) {
  params.value.page = props.pagination.page
  params.value.limit = props.pagination.rowsPerPage
  params.value.sortBy = props.pagination.sortBy
  params.value.order = props.pagination.descending ? 'desc' : 'asc'
  await fetchData()
}

watchEffect(() => {
  console.log('screen width changed →', {
    isSmall: isSmallScreen.value,
    isMedium: isMediumScreen.value,
  })
})
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">ประวัติการอัปโหลด</div>

    <!-- Desktop View -->
    <template v-if="!isMediumScreen">
      <section class="q-mt-lg">
        <q-table
          flat
          bordered
          :rows="rows"
          :columns="columns"
          row-key="id"
          :pagination="params"
          @onRequest="onRequest"
        >
          <!-- หัวตาราง Sticky
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                :style="col.headerStyle"
                class="text-weight-medium"
              >
                <div class="header-cell" @click.stop="col.sortable && props.sort(col)">
                  {{ col.label }}
                  <template v-if="col.sortable">
                    <q-icon name="expand_more" size="1.8em" class="sort-icon-hover" />
                  </template>
                </div>
              </q-th>
            </q-tr>
          </template> -->

          <!-- คอลัมน์ลำดับ -->
          <template #body-cell-no="props">
            <q-td :props="props">
              {{ seqNo(props.rowIndex, params.page, params.limit) }}
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td key="status">
              <div class="row justify-center items-center full-width">
                <q-badge
                  :label="getStatus(props.row.status)"
                  :class="getStatusClass(props.row.status)"
                  class="status-badge"
                  rounded
                  unelevated
                />
              </div>
            </q-td>
            <!-- <q-td key="actions">
              <q-btn flat round dense icon="info" color="primary" @click="showDetail(row)" />
            </q-td> -->
          </template>

          <template v-slot:no-data>
            <div class="full-width text-center q-pa-md text-grey" style="font-size: 20px">
              ไม่มีประวัติการอัพโหลด
            </div>
          </template>
        </q-table>
      </section>
    </template>

    <!-- Mobile/Tablet Card View -->
    <template v-if="isMediumScreen">
      <section class="q-mt-lg">
        <!-- Card View -->
        <q-card
          v-for="(row, index) in rows"
          :key="row.id ?? `row-${index}`"
          bordered
          flat
          class="q-mb-md"
        >
          <!-- Header -->
          <q-card-section class="backgroundheader">
            <div class="row justify-between header-row-responsive">
              <!-- ซ้าย: ชื่อใบรับรอง -->
              <div class="ActivityNamelabel">
                {{ row.course.name }}
                <q-tooltip>{{ row.course.name }}</q-tooltip>
              </div>

              <!-- ขวา: Status Badge -->
              <div class="row q-gutter-sm action-section">
                <q-badge
                  :label="getStatus(row.status)"
                  :class="getStatusClass(row.status)"
                  class="status-badge"
                >
                </q-badge>
              </div>
            </div>
          </q-card-section>

          <!-- Content -->
          <q-card-section>
            <!-- <div class="q-mb-xs info-row">
              <div class="label">ลำดับ</div>
              <div class="value">: {{ row.id }}</div>
            </div> -->
            <div class="q-mb-xs info-row">
              <div class="label">ประเภทกิจกรรม</div>
              <div class="value">: {{ translateSkillType(row.course.isHardSkill || false) }}</div>
            </div>
            <div class="q-mb-xs info-row">
              <div class="label">ชั่วโมงที่ได้รับ</div>
              <div class="value">: {{ row.course.hour !== null ? row.course.hour : '-' }}</div>
            </div>
            <div class="q-mb-xs info-row">
              <div class="label">วันที่อัปโหลด</div>
              <div class="value">: {{ dateTime(row) }}</div>
            </div>
            <div class="info-row" v-if="row.remark">
              <div class="label">หมายเหตุ</div>
              <div class="value text-negative">: {{ row.remark }}</div>
            </div>
          </q-card-section>
        </q-card>
      </section>
    </template>
  </q-page>
</template>

<style lang="scss" scoped>
/* ปิดไอคอน sort ของ Quasar */
:deep(.q-table th.sortable .q-table__sort-icon) {
  display: none;
}

/* ทำให้ pointer กับ hover ใช้งานกับ .header-cell */
.header-cell {
  display: inline-flex;
  align-items: center;

  .q-icon {
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
    transform: rotate(0deg);
  }

  .sort-icon-hover {
    opacity: 0;
  }

  &:hover .sort-icon-hover {
    opacity: 0.7;
  }
}

.ellipsis {
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
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

.ActivityNamelabel {
  font-size: 18px;
  font-weight: 700;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.backgroundheader {
  background-color: #f9fafd;
}

.my-sticky-header-table {
  min-height: 340px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

/* Sticky thead */
.my-sticky-header-table thead tr {
  background-color: #162aae;
  font-weight: bold;
  font-size: 16px;
  color: #ffffff;
  border-bottom: 2px solid #d0d0d0;
  transition: background-color 0.3s ease;
}

.my-sticky-header-table tbody tr {
  transition: background-color 0.3s ease;
}

.my-sticky-header-table tbody tr:hover {
  background-color: #f5f7ff;
}

.my-sticky-header-table td,
.my-sticky-header-table th {
  padding: 10px 12px;
  font-size: 15px;
}

.my-sticky-header-table .q-icon {
  color: #d0d0d0;
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

.status-waiting {
  background-color: #ffe7ba;
  color: #ff6f00;
  border: 1px solid #ffa500;
}

.status-approved {
  background-color: #d0ffc5;
  color: #009812;
  border: 1px solid #00bb16;
}

.status-rejected {
  background-color: #ffc5c5;
  color: #ff0000;
  border: 1px solid #f32323;
}

.texttitle {
  font-size: 32px;
  font-weight: 500;
}

@media (max-width: 650px) {
  .header-row-responsive {
    flex-direction: row; /* ให้เป็นแถว */
    align-items: center; /* จัดกลางแนวตั้ง */
    justify-content: space-between; /* แยกซ้าย-ขวา */
    width: 100%;
  }

  .action-section {
    margin-top: 0; /* ไม่ต้องให้เลื่อนลงมา */
  }
}

@media (max-width: 450px) {
  .texttitle {
    font-size: 28px;
    font-weight: 400;
  }
}

.info-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

@media (max-width: 400px) {
  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-row .label,
  .info-row .value {
    width: 100%;
  }
}
</style>
