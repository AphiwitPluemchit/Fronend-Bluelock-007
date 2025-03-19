<template>
  <q-page class="q-pa-md">
    <!-- ชื่อหน้า -->
    <div class="row justify-start items-center">
      <div class="text-h4">จัดการกิจกรรม</div>
    </div>
    <div class="row justify-end items-center">
      <q-btn dense outlined icon="add" label="เพิ่มข้อมูล" class="btnadd" @click="goToPage()" />
    </div>
    <!-- ตาราง 1 -->
    <section class="q-mt-lg">
      <div class="row justify-between items-center">
        <div class="text-h6">กิจกรรมที่กำลังเปิดและปิดลงทะเบียนแล้ว</div>
        <div class="row">
          <q-input
            dense
            outlined
            v-model="query1.search"
            placeholder="ค้นหา"
            @keyup.enter="data1"
            class="q-mr-sm searchbox"
            :style="{ boxShadow: 'none' }"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <FilterDialog
            :model-value="showFilterDialog1"
            :categories="filterCategories"
            :years="query1.studentYear"
            :majors="query1.major"
            :status-activities="query1.activityState"
            :category-activities="query1.skill"
            @apply="applyFilters1"
          />
        </div>
      </div>
      <q-table
        bordered
        flat
        :rows="mapActivitiesToTableRows(activitys1)"
        :columns="columns"
        v-model:pagination="pagination1"
        :rows-per-page-options="[5, 7, 10, 15, 20]"
        @request="onRequest1"
        row-key="id"
        class="q-mt-md my-sticky-header-table"
      >
        <template #body-cell-action="props">
          <q-td class="q-gutter-x-sm">
            <q-btn
              icon="info"
              padding="none"
              flat
              color="grey-8"
              @click="
                () => {
                  console.log(props.row)
                  void goToPageDetail(props.row.id)
                }
              "
            ></q-btn
          ></q-td> </template
      ></q-table>
      <!-- <div class="row justify-center q-mt-md">
        <q-pagination
          v-model="pagination1.page"
          color="grey-8"
          :max="pagination1.rowsNumber / pagination1.rowsPerPage || 1"
          size="sm"
        />
      </div> -->
    </section>

    <!-- ตาราง 2 -->
    <section class="q-mt-lg">
      <div class="row justify-between items-center">
        <div class="text-h6">กิจกรรมที่กำลังวางแผน</div>
        <div class="row">
          <q-input
            dense
            outlined
            v-model="query2.search"
            placeholder="ค้นหา"
            class="q-mr-sm searchbox"
            @keyup.enter="data2"
            :style="{ boxShadow: 'none' }"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <FilterDialog
            :model-value="showFilterDialog2"
            :categories="filterCategories"
            :years="query2.studentYear"
            :majors="query2.major"
            :status-activities="query2.activityState"
            :category-activities="query2.skill"
            @apply="applyFilters2"
          />
        </div>
      </div>
      <q-table
        :rows="mapActivitiesToTableRows(activitys2)"
        :columns="columns"
        v-model:pagination="pagination2"
        :rows-per-page-options="[5, 7, 10, 15, 20]"
        @request="onRequest2"
        row-key="id"
        class="q-mt-md my-sticky-header-table"
      >
        <template #body-cell-action="props">
          <q-td class="q-gutter-x-sm" style="min-width: 100px">
            <q-btn
              icon="edit"
              padding="none"
              flat
              color="grey-8"
              @click="goToPageDetail(props.row.action)"
            ></q-btn
          ></q-td> </template
      ></q-table>
      <!-- <div class="row justify-center q-mt-md">
        <q-pagination
          v-model="pagination2.page"
          color="grey-8"
          :max="query2.totalPages || 1"
          size="sm"
        />
      </div> -->
    </section>

    <!-- ตาราง 3 -->
    <section class="q-mt-lg">
      <div class="row justify-between items-center">
        <div class="text-h6">อื่น ๆ</div>
        <div class="row">
          <q-input
            dense
            outlined
            v-model="query3.search"
            placeholder="ค้นหา"
            @keyup.enter="data3"
            class="q-mr-sm searchbox"
            :style="{ boxShadow: 'none' }"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <FilterDialog
            :model-value="showFilterDialog3"
            :categories="filterCategories"
            :years="query3.studentYear"
            :majors="query3.major"
            :status-activities="query3.activityState"
            :category-activities="query3.skill"
            @apply="applyFilters3"
          />
        </div>
      </div>
      <q-table
        :rows="mapActivitiesToTableRows(activitys3)"
        :columns="columns"
        v-model:pagination="pagination3"
        :rows-per-page-options="[5, 7, 10, 15, 20]"
        @request="onRequest3"
        row-key="id"
        class="q-mt-md my-sticky-header-table"
      >
        <template #body-cell-action="props">
          <q-td class="q-gutter-x-sm" style="min-width: 100px">
            <q-btn
              icon="edit"
              padding="none"
              flat
              color="grey-8"
              @click="() => void goToPageDetail(props.row.id)"
            ></q-btn
          ></q-td> </template
      ></q-table>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import type { Activity, ActivityItem } from 'src/types/activity'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import type { ActivityPagination } from 'src/types/pagination'
import { ActivityService } from 'src/services/activity'

dayjs.locale('th')
dayjs.extend(buddhistEra)

const router = useRouter()

const goToPage = async () => {
  await router.push('/ActivitiesManagement/CreateActivity')
}
const goToPageDetail = async (id: string) => {
  await router.push(`/ActivitiesManagement/ActivityDetail/${id}`)
  console.log(id)
  // await fetchOneData(id)
  // :to="`/Student/Activity/ActivityDetail/${activity.id}`"
  await router.push(`/Admin/ActivitiesManagement/ActivityDetail/${id}`)
}

const showFilterDialog1 = ref(false)
const filterCategories = ref([
  'year',
  'major',
  'statusStudent',
  'statusActivity',
  'categoryActivity',
])
const showFilterDialog2 = ref(false)
const showFilterDialog3 = ref(false)

interface SelectedFilters {
  year: string[]
  major: string[]
  statusActivity: string[]
  categoryActivity: string[]
}

async function getActivityData(qeury: ActivityPagination) {
  const data = await ActivityService.getAll(qeury)
  return data
}

const data1 = async () => {
  const data = await getActivityData(query1.value)
  pagination1.value.page = query1.value.page
  pagination1.value.rowsPerPage = query1.value.limit
  pagination1.value.sortBy = query1.value.sortBy
  pagination1.value.rowsNumber = data.meta.total

  activitys1.value = data.data
}
const data2 = async () => {
  const data = await getActivityData(query2.value)
  pagination2.value.page = query2.value.page
  pagination2.value.rowsPerPage = query2.value.limit
  pagination2.value.sortBy = query2.value.sortBy
  pagination2.value.rowsNumber = data.meta.total

  activitys2.value = data.data
}
const data3 = async () => {
  const data = await getActivityData(query3.value)
  pagination3.value.page = query3.value.page
  pagination3.value.rowsPerPage = query3.value.limit
  pagination3.value.sortBy = query3.value.sortBy
  pagination3.value.rowsNumber = data.meta.total

  activitys3.value = data.data
}

const applyFilters1 = async (selectedFilters: SelectedFilters) => {
  query1.value.studentYear = selectedFilters.year.map(Number)
  query1.value.major = selectedFilters.major
  query1.value.activityState = selectedFilters.statusActivity
  query1.value.skill = selectedFilters.categoryActivity
  await data1()
}

const applyFilters2 = async (selectedFilters: SelectedFilters) => {
  query2.value.studentYear = selectedFilters.year.map(Number)
  query2.value.major = selectedFilters.major
  query2.value.activityState = selectedFilters.statusActivity
  query2.value.skill = selectedFilters.categoryActivity
  await data2()
}

const applyFilters3 = async (selectedFilters: SelectedFilters) => {
  query3.value.studentYear = selectedFilters.year.map(Number)
  query3.value.major = selectedFilters.major
  query3.value.activityState = selectedFilters.statusActivity
  query3.value.skill = selectedFilters.categoryActivity
  await data3()
}

// กำหนดโครงสร้างของคอลัมน์ในตาราง
const columns = [
  {
    name: '_id',
    label: 'ลำดับ',
    field: '_id',
    align: 'left' as const,
    style: 'width: 5%',
  },
  {
    name: 'name',
    label: 'ชื่อกิจกรรม',
    field: 'name',
    align: 'left' as const,

    style: 'width: 30%',
  },
  {
    name: 'location',
    label: 'สถานที่',
    field: 'location',
    align: 'left' as const,
  },
  {
    name: 'participants',
    label: 'จำนวน (ลง/รับ/เหลือ)',
    field: 'participants',
    align: 'left' as const,
  },
  { name: 'type', label: 'ประเภท', field: 'type', align: 'left' as const },
  {
    name: 'status',
    label: 'สถานะ',
    field: 'status',
    align: 'left' as const,
  },
  { name: 'action', label: '', field: '', align: 'left' as const },
]

const activitys1 = ref<Activity[]>([]) // Open and Close Enrollment Table
const activitys2 = ref<Activity[]>([]) // Planning Table
const activitys3 = ref<Activity[]>([]) // Success Table

const query1 = ref<ActivityPagination>({
  page: 1,
  limit: 5,
  search: '',
  sortBy: '_id',
  order: 'desc',
  skill: [],
  activityState: ['open', 'close'],
  major: [],
  studentYear: [],
})
const query2 = ref<ActivityPagination>({
  page: 1,
  limit: 5,
  search: '',
  sortBy: '_id',
  order: 'desc',
  skill: [],
  activityState: ['planning'],
  major: [],
  studentYear: [],
})

const query3 = ref<ActivityPagination>({
  page: 1,
  limit: 5,
  search: '',
  sortBy: '_id',
  order: 'desc',
  skill: [],
  activityState: ['success', 'cancel'],
  major: [],
  studentYear: [],
})

// **Wrapper function to fetch
async function getActivities() {
  await data1()
  await data2()
  await data3()
}

onMounted(async () => {
  await nextTick(async () => {
    if (
      activitys1.value.length === 0 ||
      activitys2.value.length === 0 ||
      activitys3.value.length === 0
    )
      await getActivities()
  })
})

function mapActivitiesToTableRows(activitys: Activity[]) {
  if (!activitys) return []
  return activitys.map((activity, index) => {
    if (!activity || !activity.activityItems) return []
    const firstItem = activity.activityItems[0] || { dates: [] }
    if (!firstItem.dates || firstItem.dates.length === 0) return []
    const firstDate = firstItem.dates[0] || { date: '', stime: '', etime: '' }

    return {
      _id: index + 1,
      name: activity.name || '-',
      date: formatDateToThai(firstDate.date), // ✅ ใช้ format ตรงนี้
      time: firstDate.stime && firstDate.etime ? `${firstDate.stime}-${firstDate.etime}` : '-', // เวลาแรก
      location: firstItem.rooms?.[0] || '-', // สถานที่แรก
      participants: enrollmentSummary(activity.activityItems), // ไว้ก่อน ยังไม่แน่ใจข้อมูล
      type: activity.skill ? (activity.skill === 'hard' ? 'ทักษะวิชาการ' : 'เตรียมความพร้อม') : '-', // hard / soft
      status: activityStatusLebel(activity.activityState || '-'),
      action: '', // ปุ่ม action ภายหลัง
    }
  })
}
function activityStatusLebel(status: string) {
  switch (status) {
    case 'planning':
      return 'กำลังวางแผน'
    case 'open':
      return 'เปิดลงทะเบียน'
    case 'close':
      return 'ปิดลงทะเบียน'
    case 'success':
      return 'เสร็จสิ้น'
    case 'cancel':
      return 'ยกเลิก'
  }
}

function formatDateToThai(dateString: string): string {
  if (!dateString) return '-'
  return dayjs(dateString).format('D MMM BBBB') // D = วัน, MMM = เดือน, BBBB = ปี พ.ศ.
}

function enrollmentSummary(activityItems: ActivityItem[]) {
  if (!activityItems || activityItems.length === 0) return '-'
  // คํานวณจํานวนลงทะเบียน
  const totalEnrolled = activityItems.reduce(
    (total, item) => total + (item.enrollmentCount ?? 0),
    0,
  )
  // คํานวณจํานวนรับทะเบียน
  const totalAccepted = activityItems.reduce(
    (total, item) => total + (item.maxParticipants ?? 0),
    0,
  )
  // คํานวณจํานวนเหลือ
  const totalRemaining = totalAccepted - totalEnrolled

  return `${totalEnrolled}/${totalAccepted}/${totalRemaining}`
}

const pagination1 = ref({
  sortBy: query1.value.sortBy,
  descending: query1.value.order === 'desc',
  page: query1.value.page,
  rowsPerPage: query1.value.limit,
  rowsNumber: 0,
})
const pagination2 = ref({
  sortBy: query2.value.sortBy,
  descending: query2.value.order === 'desc',
  page: query2.value.page,
  rowsPerPage: query2.value.limit,
  rowsNumber: 0,
})

const pagination3 = ref({
  sortBy: query3.value.sortBy,
  descending: query3.value.order === 'desc',
  page: query3.value.page,
  rowsPerPage: query3.value.limit,
  rowsNumber: 0,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function onRequest1(props: any) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  query1.value.page = page
  query1.value.limit = rowsPerPage
  query1.value.sortBy = sortBy
  query1.value.order = descending ? 'desc' : 'asc'

  await data1()
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function onRequest2(props: any) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  query2.value.page = page
  query2.value.limit = rowsPerPage
  query2.value.sortBy = sortBy
  query2.value.order = descending ? 'desc' : 'asc'

  await data2()
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function onRequest3(props: any) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  query3.value.page = page
  query3.value.limit = rowsPerPage
  query3.value.sortBy = sortBy
  query3.value.order = descending ? 'desc' : 'asc'

  await data3()
}
</script>

<style lang="scss">
.my-sticky-header-table {
  /* ตัด max-height ออกจาก q-table */

  /* Fix header */
  thead tr:first-child th {
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: #f5f5f5;
  }

  /* Make tbody scrollable */
  tbody {
    display: block;
    height: 240px; /* ปรับความสูงตามต้องการ */
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
    width: 10px;
  }

  tbody::-webkit-scrollbar-thumb {
    background: #a7a7a7;
    border-radius: 10px;
    cursor: pointer;
  }
}
</style>
