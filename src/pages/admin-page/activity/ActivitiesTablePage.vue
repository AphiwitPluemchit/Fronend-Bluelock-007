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
        :rows-per-page-options="[5, 10, 15, 20]"
        row-key="id"
        class="q-mt-md customtable"
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
            @apply="applyFilters2"
          />
        </div>
      </div>
      <q-table
        :rows="mapActivitiesToTableRows(activitys2)"
        :columns="columns"
        :v-model:pagination="pagination2"
        :rows-per-page-options="[5, 10, 15, 20]"
        row-key="id"
        class="q-mt-md"
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
            @apply="applyFilters3"
          />
        </div>
      </div>
      <q-table
        :rows="mapActivitiesToTableRows(activitys3)"
        :columns="columns"
        :v-model:pagination="pagination3"
        :rows-per-page-options="[5, 10, 15, 20]"
        row-key="id"
        class="q-mt-md"
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
import { nextTick, onMounted, ref, watch } from 'vue'
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
  return data.data
}

const data1 = async () => {
  console.log('test search click')
  activitys1.value = await getActivityData(query1.value)
}
const data2 = async () => {
  activitys2.value = await getActivityData(query2.value)
}
const data3 = async () => {
  activitys3.value = await getActivityData(query3.value)
}

const applyFilters1 = async (selectedFilters: SelectedFilters) => {
  query1.value.studentYear = selectedFilters.year.map(Number)
  query1.value.major = selectedFilters.major
  query1.value.activityState = selectedFilters.statusActivity
  query1.value.skill = selectedFilters.categoryActivity
  activitys1.value = await getActivityData(query1.value)
}

const applyFilters2 = async (selectedFilters: SelectedFilters) => {
  query2.value.studentYear = selectedFilters.year.map(Number)
  query2.value.major = selectedFilters.major
  query2.value.activityState = selectedFilters.statusActivity
  query2.value.skill = selectedFilters.categoryActivity
  activitys2.value = await getActivityData(query2.value)
}

const applyFilters3 = async (selectedFilters: SelectedFilters) => {
  query3.value.studentYear = selectedFilters.year.map(Number)
  query3.value.major = selectedFilters.major
  query3.value.activityState = selectedFilters.statusActivity
  query3.value.skill = selectedFilters.categoryActivity
  activitys3.value = await getActivityData(query3.value)
}

// กำหนดโครงสร้างของคอลัมน์ในตาราง
const columns = [
  { name: '_id', label: 'ลำดับ', field: '_id', sortable: true, align: 'left' as const },
  { name: 'name', label: 'ชื่อกิจกรรม', field: 'name', sortable: true, align: 'left' as const },
  { name: 'date', label: 'วันที่', field: 'date', align: 'left' as const },
  { name: 'time', label: 'เวลา', field: 'time', align: 'left' as const },
  { name: 'location', label: 'สถานที่', field: 'location', align: 'left' as const },
  {
    name: 'participants',
    label: 'จำนวน (ลง/รับ/เหลือ)',
    field: 'participants',
    align: 'left' as const,
  },
  { name: 'type', label: 'ประเภท', field: 'type', sortable: true, align: 'left' as const },
  { name: 'status', label: 'สถานะ', field: 'status', sortable: true, align: 'left' as const },
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
  activitys1.value = await getActivityData(query1.value)
  activitys2.value = await getActivityData(query2.value)
  activitys3.value = await getActivityData(query3.value)
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
})
const pagination2 = ref({
  sortBy: query2.value.sortBy,
  descending: query2.value.order === 'desc',
  page: query2.value.page,
  rowsPerPage: query2.value.limit,
})

const pagination3 = ref({
  sortBy: query3.value.sortBy,
  descending: query3.value.order === 'desc',
  page: query3.value.page,
  rowsPerPage: query3.value.limit,
})

watch(
  () => pagination1.value,
  async () => {
    query1.value.page = pagination1.value.page
    query1.value.limit = pagination1.value.rowsPerPage
    query1.value.sortBy = pagination1.value.sortBy
    query1.value.order = pagination1.value.descending ? 'desc' : 'asc'
    const data = await ActivityService.getAll(query1.value)
    activitys1.value = data.data
  },
  { deep: true },
)

watch(
  () => pagination2.value,
  async () => {
    query2.value.page = pagination2.value.page
    query2.value.limit = pagination2.value.rowsPerPage
    query2.value.sortBy = pagination2.value.sortBy
    query2.value.order = pagination2.value.descending ? 'desc' : 'asc'
    const data = await ActivityService.getAll(query2.value)
    activitys2.value = data.data
  },
  { deep: true },
)

watch(
  () => pagination3.value,
  async () => {
    query3.value.page = pagination3.value.page
    query3.value.limit = pagination3.value.rowsPerPage
    query3.value.sortBy = pagination3.value.sortBy
    query3.value.order = pagination3.value.descending ? 'desc' : 'asc'
    const data = await ActivityService.getAll(query3.value)
    activitys3.value = data.data
  },
  { deep: true },
)
</script>

<style scoped></style>
