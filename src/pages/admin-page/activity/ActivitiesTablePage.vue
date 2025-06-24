<script setup lang="ts">
import 'dayjs/locale/th'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import { ActivityService } from 'src/services/activity'
import type { Pagination } from 'src/types/pagination'
import type { Activity, ActivityItem } from 'src/types/activity'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import RemoveDialog from 'src/components/Dialog/RemoveDialog.vue'
import debounce from 'lodash.debounce'

dayjs.locale('th')
dayjs.extend(buddhistEra)

const router = useRouter()
const isRemoveDialogOpen = ref(false)
const selectedId = ref<string | null>(null)
const goToPage = async () => {
  await router.push('/Admin/ActivitiesManagement/CreateActivityPage')
}
const openRemoveDialog = (id: string) => {
  selectedId.value = id
  isRemoveDialogOpen.value = true
}
const handleConfirmRemove = async () => {
  if (!selectedId.value) return
  try {
    await ActivityService.removeOne(selectedId.value)
    isRemoveDialogOpen.value = false
    selectedId.value = null
    await data4() // 🔁 refresh table
  } catch (err) {
    console.error('Delete error:', err)
  }
}
const goToPageDetail = async (id: string, disable: boolean) => {
  await router.push({
    path: `/Admin/ActivitiesManagement/ActivityDetail/${id}`,
    query: {
      disable: String(disable),
    },
  })
}
const getStatusClass = (status: string) => {
  if (status === 'กำลังวางแผน') return 'status-planning'
  if (status === 'เปิดลงทะเบียน') return 'status-open'
  if (status === 'ปิดลงทะเบียน') return 'status-close'
  if (status === 'เสร็จสิ้น') return 'status-success'
  if (status === 'ยกเลิก') return 'status-cancel'
  return ''
}

const showFilterDialog1 = ref(false)
const filterCategories = ref(['year', 'major', 'statusActivity', 'categoryActivity'])
const showFilterDialog2 = ref(false)
const showFilterDialog3 = ref(false)
const showFilterDialog4 = ref(false)

interface SelectedFilters {
  year: string[]
  major: string[]
  statusActivity: string[]
  categoryActivity: string[]
}

async function getActivityData(qeury: Pagination) {
  const data = await ActivityService.getAll(qeury)
  return data
}

const data1 = async () => {
  const data = await getActivityData(query1.value)
  pagination1.value.page = query1.value.page
  pagination1.value.rowsPerPage = query1.value.limit
  pagination1.value.sortBy = query1.value.sortBy
  pagination1.value.rowsNumber = data.meta.total
  pagination1.value.descending = query1.value.order === 'desc'

  activitys1.value = data.data
}
const data2 = async () => {
  const data = await getActivityData(query2.value)
  pagination2.value.page = query2.value.page
  pagination2.value.rowsPerPage = query2.value.limit
  pagination2.value.sortBy = query2.value.sortBy
  pagination2.value.rowsNumber = data.meta.total
  pagination2.value.descending = query2.value.order === 'desc'

  activitys2.value = data.data
}
const data3 = async () => {
  const data = await getActivityData(query3.value)
  pagination3.value.page = query3.value.page
  pagination3.value.rowsPerPage = query3.value.limit
  pagination3.value.sortBy = query3.value.sortBy
  pagination3.value.rowsNumber = data.meta.total
  pagination3.value.descending = query3.value.order === 'desc'

  activitys3.value = data.data
}
const data4 = async () => {
  const data = await getActivityData(query4.value)
  pagination4.value.page = query4.value.page
  pagination4.value.rowsPerPage = query4.value.limit
  pagination4.value.sortBy = query4.value.sortBy
  pagination4.value.rowsNumber = data.meta.total
  pagination4.value.descending = query4.value.order === 'desc'

  activitys4.value = data.data
}

const applyFilters1 = async (selectedFilters: SelectedFilters) => {
  query1.value.studentYear = selectedFilters.year
  query1.value.major = selectedFilters.major
  query1.value.activityState = selectedFilters.statusActivity
  query1.value.skill = selectedFilters.categoryActivity
  await data1()
}
const applyFilters2 = async (selectedFilters: SelectedFilters) => {
  query2.value.studentYear = selectedFilters.year
  query2.value.major = selectedFilters.major
  query2.value.activityState = selectedFilters.statusActivity
  query2.value.skill = selectedFilters.categoryActivity
  await data2()
}
const applyFilters3 = async (selectedFilters: SelectedFilters) => {
  query3.value.studentYear = selectedFilters.year
  query3.value.major = selectedFilters.major
  query3.value.activityState = selectedFilters.statusActivity
  query3.value.skill = selectedFilters.categoryActivity
  await data3()
}
const applyFilters4 = async (selectedFilters: SelectedFilters) => {
  query4.value.studentYear = selectedFilters.year
  query4.value.major = selectedFilters.major
  query4.value.activityState = selectedFilters.statusActivity
  query4.value.skill = selectedFilters.categoryActivity
  await data4()
}

// กำหนดโครงสร้างของคอลัมน์ในตาราง
const columns = [
  {
    name: 'no',
    label: 'ลำดับ',
    field: 'no',
    sortable: false,
    style: 'width: 5%',
    headerStyle: 'width: 5%; text-align: left;',
  },
  {
    name: 'name',
    label: 'ชื่อกิจกรรม',
    field: 'name',
    align: 'left' as const,
    sortable: true,
    style: 'width: 28%; overflow: hidden; text-overflow: ellipsis;',
    headerStyle: 'width: 28%; text-align: left; justify-content: left;',
  },
  {
    name: 'dates',
    label: 'วันที่',
    field: 'dates',
    sortable: true,
    align: 'left' as const,
    style: 'width: 9.5%',
    headerStyle: 'width: 9.5%; ',
  },
  {
    name: 'time',
    label: 'เวลา',
    field: 'time',
    sortable: false,
    style: 'width: 9%',
    headerStyle: 'width: 9%; text-align: left;',
  },
  {
    name: 'location',
    label: 'สถานที่',
    field: 'location',
    sortable: false,
    style: 'width: 9%',
    headerStyle: 'width: 9%; text-align: left;',
  },
  {
    name: 'participants',
    label: 'จำนวน (ลง/รับ/เหลือ)',
    field: 'participants',
    sortable: false,
    style: 'width: 12%',
    headerStyle: 'width: 12%; text-align: left;',
  },
  {
    name: 'skill',
    label: 'ประเภท',
    field: 'skill',
    sortable: true,
    align: 'left' as const,
    style: 'width: 12%',
    headerStyle: 'width: 12%; ',
  },
  {
    name: 'activityState',
    label: 'สถานะ',
    field: 'activityState',
    align: 'center' as const,
    sortable: true,
    style: 'width: 10%; text-align: center;',
    headerStyle: 'width: 10%; ',
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    sortable: false,
    style: 'width: 5%; text-align: center;',
    headerStyle: 'width: 5%; text-align: center;',
  },
]

const activitys1 = ref<Activity[]>([]) // Open and Close Enrollment Table
const activitys2 = ref<Activity[]>([]) // Planning Table
const activitys3 = ref<Activity[]>([]) // Success Table
const activitys4 = ref<Activity[]>([]) // Cancel Table

// Expanded rows state for each table
const expandedRows1 = ref<Set<string>>(new Set())
const expandedRows2 = ref<Set<string>>(new Set())
const expandedRows3 = ref<Set<string>>(new Set())
// const expandedRows4 = ref<Set<string>>(new Set())

// Toggle functions for expanding/collapsing rows
const toggleRowExpansion1 = (rowId: string) => {
  if (expandedRows1.value.has(rowId)) {
    expandedRows1.value.delete(rowId)
  } else {
    expandedRows1.value.add(rowId)
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const toggleRowExpansion2 = (rowId: string) => {
  if (expandedRows2.value.has(rowId)) {
    expandedRows2.value.delete(rowId)
  } else {
    expandedRows2.value.add(rowId)
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const toggleRowExpansion3 = (rowId: string) => {
  if (expandedRows3.value.has(rowId)) {
    expandedRows3.value.delete(rowId)
  } else {
    expandedRows3.value.add(rowId)
  }
}

// const toggleRowExpansion4 = (rowId: string) => {
//   if (expandedRows4.value.has(rowId)) {
//     expandedRows4.value.delete(rowId)
//   } else {
//     expandedRows4.value.add(rowId)
//   }
// }

const query1 = ref<Pagination>({
  page: 1,
  limit: 5,
  search: '',
  sortBy: 'dates',
  order: 'desc',
  skill: [],
  activityState: ['open', 'close'],
  major: [],
  studentYear: [],
})
const query2 = ref<Pagination>({
  page: 1,
  limit: 5,
  search: '',
  sortBy: 'dates',
  order: 'desc',
  skill: [],
  activityState: ['planning'],
  major: [],
  studentYear: [],
})

const query3 = ref<Pagination>({
  page: 1,
  limit: 5,
  search: '',
  sortBy: 'dates',
  order: 'desc',
  skill: [],
  activityState: ['success'],
  major: [],
  studentYear: [],
})
const query4 = ref<Pagination>({
  page: 1,
  limit: 5,
  search: '',
  sortBy: 'dates',
  order: 'desc',
  skill: [],
  activityState: ['cancel'],
  major: [],
  studentYear: [],
})

// **Wrapper function to fetch
async function getActivities() {
  await data1()
  await data2()
  await data3()
  await data4()
}

onMounted(async () => {
  await nextTick(async () => {
    if (
      activitys1.value.length === 0 ||
      activitys2.value.length === 0 ||
      activitys3.value.length === 0 ||
      activitys4.value.length === 0
    )
      await getActivities()
  })
})

function mapActivitiesToTableRows(activitys: Activity[]) {
  if (!activitys) return []

  return activitys.map((activity, index) => {
    const allDates =
      activity?.activityItems?.flatMap((item) => item.dates?.map((d) => ({ ...d, item })) || []) ||
      []

    const today = dayjs()
    const futureDates = allDates.filter(
      (d) => dayjs(d.date).isSame(today, 'day') || dayjs(d.date).isAfter(today),
    )

    const nearestDate = (futureDates.length ? futureDates : allDates).sort((a, b) =>
      dayjs(a.date).diff(dayjs(b.date)),
    )[0]

    if (!nearestDate) {
      return {
        no: index + 1,
        id: activity.id,
        name: activity.name || '-',
        dates: '-',
        time: '-',
        location: '-',
        participants: '-',
        skill: '-',
        activityState: '-',
        action: '',
        activityItems: activity.activityItems || [],
      }
    }

    // ✅ หาเวลาต้นสุด-ท้ายสุดของทุก activityItem
    const allStimes = activity.activityItems?.flatMap(
      (item) => item.dates?.map((d) => d.stime).filter(Boolean) || [],
    )
    const allEtimes = activity.activityItems?.flatMap(
      (item) => item.dates?.map((d) => d.etime).filter(Boolean) || [],
    )

    const earliestStime = allStimes?.length ? allStimes?.sort()[0] : '-'
    const latestEtime = allEtimes?.length ? allEtimes?.sort().reverse()[0] : '-'

    return {
      no: index + 1,
      id: activity.id,
      name: activity.name || '-',
      dates: formatDateToThai(nearestDate.date) || '-',
      time:
        earliestStime !== '-' && latestEtime !== '-' ? `${earliestStime} - ${latestEtime}` : '-',
      location: nearestDate.item?.rooms?.[0] || '-',
      participants: enrollmentSummary(activity.activityItems || []) || '-',
      skill:
        activity.skill === 'hard'
          ? 'ทักษะวิชาการ'
          : activity.skill === 'soft'
            ? 'เตรียมความพร้อม'
            : '-',
      activityState: activityStatusLebel(activity.activityState || '-') || '-',
      action: '',
      activityItems: activity.activityItems || [],
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

  const totalEnrolled = activityItems.reduce(
    (total, item) => total + (item.enrollmentCount || 0),
    0,
  )
  const totalAccepted = activityItems.reduce(
    (total, item) => total + (item.maxParticipants ?? 0),
    0,
  )
  const totalRemaining = totalAccepted - totalEnrolled

  if (totalAccepted === 0) return '-' // กรณีไม่มี maxParticipant เลย
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
const pagination4 = ref({
  sortBy: query4.value.sortBy,
  descending: query4.value.order === 'desc',
  page: query4.value.page,
  rowsPerPage: query4.value.limit,
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function onRequest4(props: any) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  query4.value.page = page
  query4.value.limit = rowsPerPage
  query4.value.sortBy = sortBy
  query4.value.order = descending ? 'desc' : 'asc'

  await data4()
}
// Debounced Search Function 1
const debouncedSearch = debounce(async () => {
  query1.value.page = 1 // รีเซต page เมื่อ search
  await data1()
}, 500) // หน่วง 500ms

watch(
  () => query1.value.search,
  async () => {
    await debouncedSearch()
  },
)

// Debounced Search Function 2
const debouncedSearch2 = debounce(async () => {
  query2.value.page = 1 // รีเซต page เมื่อ search
  await data2()
}, 500) // หน่วง 500ms

watch(
  () => query2.value.search,
  async () => {
    await debouncedSearch2()
  },
)

// Debounced Search Function 3
const debouncedSearch3 = debounce(async () => {
  query3.value.page = 1 // รีเซต page เมื่อ search
  await data3()
}, 500) // หน่วง 500ms

watch(
  () => query3.value.search,
  async () => {
    await debouncedSearch3()
  },
)

// Debounced Search Function 4
const debouncedSearch4 = debounce(async () => {
  query4.value.page = 1 // รีเซต page เมื่อ search
  await data4()
}, 500) // หน่วง 500ms

watch(
  () => query4.value.search,
  async () => {
    await debouncedSearch4()
  },
)
const tabIndex = ref(0)
const isMediumScreen = ref(false)
const isSmallScreen = ref(false)

const checkScreen = () => {
  const width = window.innerWidth
  isSmallScreen.value = width <= 650
  isMediumScreen.value = width <= 850
}

function truncateText(text: string, maxLength = 30): string {
  if (!text) return '-'

  // ใช้ค่าจาก ref ที่ reactive แล้ว
  let dynamicMaxLength = maxLength
  if (isSmallScreen.value) {
    dynamicMaxLength = 45
  } else if (isMediumScreen.value) {
    dynamicMaxLength = 35
  }

  return text.length > dynamicMaxLength ? text.slice(0, dynamicMaxLength - 3) + '...' : text
}
onMounted(() => {
  checkScreen()
  window.addEventListener('resize', checkScreen)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreen)
})
watchEffect(() => {
  console.log('screen width changed →', {
    isSmall: isSmallScreen.value,
    isMedium: isMediumScreen.value,
  })
})
</script>

<template>
  <q-page class="q-pa-md">
    <!-- ชื่อหน้า -->
    <div class="row justify-between items-center q-mb-md" style="margin-top: 20px">
      <div class="texttitle">จัดการกิจกรรม</div>
      <q-btn dense outlined label="เพิ่มกิจกรรม" class="btnadd" bo @click="goToPage()" />
    </div>

    <!-- FullScreen -->
    <template v-if="!isMediumScreen">
      <!-- ตาราง 1 เปิด/ปิด ลงทะเบียน -->
      <section class="q-mt-lg">
        <div class="row items-center justify-between activity-section-header">
          <!-- หัวข้อ -->
          <div class="textheader">กิจกรรมที่เปิดลงทะเบียนและปิดลงทะเบียน</div>
          <div class="row filter-row no-wrap q-mt-sm">
            <!-- 🔹 Search box -->
            <q-input
              dense
              outlined
              v-model="query1.search"
              label="ค้นหา ชื่อกิจกรรม"
              class="searchbox"
              :style="{ border: 'none' }"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <!-- 🔹 Filter Dialog -->
            <FilterDialog
              class="filter-btn"
              :model-value="showFilterDialog1"
              :categories="filterCategories || []"
              :years="query1.studentYear || []"
              :majors="query1.major || []"
              :status-activities="query1.activityState || []"
              :category-activities="query1.skill || []"
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
          <!-- หัวตาราง Sticky -->
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                :style="col.headerStyle"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <!-- เนื้อหาตาราง -->
          <template v-slot:body="props">
            <q-tr :props="props" @click="toggleRowExpansion1(props.row.id)" class="cursor-pointer">
              <q-td key="no">
                <div class="row items-center no-wrap">
                  <q-icon
                    :name="expandedRows1.has(props.row.id) ? 'expand_less' : 'expand_more'"
                    class="q-mr-sm"
                  />
                  {{ props.rowIndex + 1 }}
                </div>
              </q-td>
              <q-td key="name">
                <div class="ellipsis">
                  {{ truncateText(props.row.name) }}
                  <q-tooltip>{{ props.row.name }}</q-tooltip>
                </div>
              </q-td>
              <q-td key="dates">{{ props.row.dates }}</q-td>
              <q-td key="time">{{ props.row.time }}</q-td>
              <q-td key="location">{{ props.row.location }}</q-td>
              <q-td key="participants">{{ props.row.participants }}</q-td>
              <q-td key="skill">{{ props.row.skill }}</q-td>

              <!-- ✅ จัดกลางเฉพาะสถานะ -->
              <q-td key="activityState">
                <div class="row justify-center items-center full-width">
                  <q-badge
                    :label="props.row.activityState"
                    :class="getStatusClass(props.row.activityState)"
                    class="status-badge"
                    rounded
                    unelevated
                  />
                </div>
              </q-td>
              <q-td class="q-gutter-x-sm" key="action">
                <q-icon clickable name="visibility" @click="goToPageDetail(props.row.id, true)">
                  <q-tooltip>ดูรายละเอียด</q-tooltip>
                </q-icon>
                <q-icon clickable name="edit" @click.stop="goToPageDetail(props.row.id, false)">
                  <q-tooltip>แก้ไข</q-tooltip>
                </q-icon>
              </q-td>
            </q-tr>
            <!-- Expanded Row Content -->
            <q-tr v-if="expandedRows1.has(props.row.id)" class="expanded-row">
              <q-td colspan="9" class="expanded-content">
                <div class="q-pa-sm">
                  <div class="text-subtitle2 q-mb-sm">รายละเอียดกิจกรรมย่อย</div>
                  <div v-if="props.row.activityItems && props.row.activityItems.length > 0">
                    <div
                      v-for="(item, index) in props.row.activityItems"
                      :key="index"
                      class="activity-item q-mb-sm q-pa-xs"
                      style="border: 1px solid #e0e0e0; border-radius: 4px"
                    >
                      <div class="row items-center q-gutter-sm text-body2">
                        <div class="col-auto">
                          <span class="text-weight-bold">ชื่อ:</span> {{ item.name || '-' }}
                        </div>

                        <div class="col-auto">
                          <span class="text-weight-bold">รับ:</span>
                          {{ item.maxParticipants || '-' }} คน
                        </div>
                        <div class="col-auto">
                          <span class="text-weight-bold">ลงทะเบียน:</span>
                          {{ item.enrollmentCount || 0 }} คน
                        </div>
                        <div class="col-auto" v-if="item.dates && item.dates.length > 0">
                          <span class="text-weight-bold">วันที่:</span>
                          <span v-for="(date, dateIndex) in item.dates" :key="dateIndex">
                            {{ formatDateToThai(date.date) }} {{ date.stime }}-{{ date.etime
                            }}{{ dateIndex < item.dates.length - 1 ? ', ' : '' }}
                          </span>
                        </div>
                        <div class="col-auto">
                          <span class="text-weight-bold">ชั่วโมง:</span> {{ item.hour || '-' }} ชม.
                        </div>
                        <div class="col-auto">
                          <span class="text-weight-bold">ผู้ดำเนินการ:</span>
                          {{ item.operator || '-' }}
                        </div>
                        <div class="col-auto">
                          <span class="text-weight-bold">ห้อง:</span>
                          {{ item.rooms?.join(', ') || '-' }}
                        </div>
                        <div class="col-auto">
                          <span class="text-weight-bold">สาขา:</span>
                          {{ item.majors?.join(', ') || '-' }}
                        </div>
                      </div>
                      <div
                        v-if="item.description && item.description !== '-'"
                        class="q-mt-xs text-body2"
                      >
                        <span class="text-weight-bold">คำอธิบาย:</span> {{ item.description }}
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-grey-6">ไม่มีข้อมูลกิจกรรมย่อย</div>
                </div>
              </q-td>
            </q-tr>
          </template>
          <template v-slot:no-data>
            <div class="full-width text-center q-pa-md text-grey" style="font-size: 20px">
              ไม่มีกิจกรรมที่เปิดลงทะเบียนและปิดลงทะเบียน
            </div>
          </template>
        </q-table>
      </section>

      <!-- ตาราง 2 กำลังวางแผน-->
      <section class="q-mt-lg">
        <div class="row items-center justify-between activity-section-header">
          <!-- หัวข้อ -->
          <div class="textheader">กิจกรรมที่กำลังวางแผน</div>
          <div class="row filter-row no-wrap q-mt-sm">
            <!-- 🔹 Search box -->
            <q-input
              dense
              outlined
              v-model="query2.search"
              label="ค้นหา ชื่อกิจกรรม"
              class="searchbox"
              :style="{ border: 'none' }"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <!-- 🔹 Filter Dialog -->
            <FilterDialog
              class="filter-btn"
              :model-value="showFilterDialog2"
              :categories="filterCategories || []"
              :years="query2.studentYear || []"
              :majors="query2.major || []"
              :status-activities="query2.activityState || []"
              :category-activities="query2.skill || []"
              @apply="applyFilters2"
            />
          </div>
        </div>

        <q-table
          bordered
          flat
          :rows="mapActivitiesToTableRows(activitys2)"
          :columns="columns"
          v-model:pagination="pagination2"
          :rows-per-page-options="[5, 7, 10, 15, 20]"
          @request="onRequest2"
          row-key="id"
          class="q-mt-md my-sticky-header-table"
        >
          <!-- หัวตาราง Sticky -->
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <!-- เนื้อหาตาราง -->
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="no">{{ props.rowIndex + 1 }}</q-td>
              <q-td key="name">
                <div class="ellipsis">
                  {{ truncateText(props.row.name) }}
                  <q-tooltip>{{ props.row.name }}</q-tooltip>
                </div>
              </q-td>
              <q-td key="dates">{{ props.row.dates }}</q-td>
              <q-td key="time">{{ props.row.time }}</q-td>
              <q-td key="location">{{ props.row.location }}</q-td>
              <q-td key="participants">{{ props.row.participants }}</q-td>
              <q-td key="skill">{{ props.row.skill }}</q-td>

              <!-- ✅ จัดกลางเฉพาะสถานะ -->
              <q-td key="activityState">
                <q-badge
                  :label="props.row.activityState"
                  :class="getStatusClass(props.row.activityState)"
                  class="status-badge"
                  rounded
                  unelevated
                />
              </q-td>

              <q-td key="action" class="text-left q-gutter-x-sm">
                <q-icon clickable name="visibility" @click="goToPageDetail(props.row.id, true)">
                  <q-tooltip>ดูรายละเอียด</q-tooltip>
                </q-icon>
                <q-icon clickable name="edit" @click="goToPageDetail(props.row.id, false)">
                  <q-tooltip>แก้ไข</q-tooltip>
                </q-icon>
              </q-td>
            </q-tr>
          </template>
          <template v-slot:no-data>
            <div class="full-width text-center q-pa-md text-grey" style="font-size: 20px">
              ไม่มีกิจกรรมที่เสร็จสิ้น
            </div>
          </template>
        </q-table>
      </section>

      <!-- ตาราง 3 เสร็จสิ้น-->
      <section class="q-mt-lg">
        <div class="row items-center justify-between activity-section-header">
          <!-- หัวข้อ -->
          <div class="textheader">กิจกรรมที่เสร็จสิ้น</div>
          <div class="row filter-row no-wrap q-mt-sm">
            <!-- 🔹 Search box -->
            <q-input
              dense
              outlined
              v-model="query3.search"
              label="ค้นหา ชื่อกิจกรรม"
              class="searchbox"
              :style="{ border: 'none' }"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <!-- 🔹 Filter Dialog -->
            <FilterDialog
              class="filter-btn"
              :model-value="showFilterDialog3"
              :categories="filterCategories || []"
              :years="query3.studentYear || []"
              :majors="query3.major || []"
              :status-activities="query3.activityState || []"
              :category-activities="query3.skill || []"
              @apply="applyFilters3"
            />
          </div>
        </div>
        <q-table
          bordered
          flat
          :rows="mapActivitiesToTableRows(activitys3)"
          :columns="columns"
          v-model:pagination="pagination3"
          :rows-per-page-options="[5, 7, 10, 15, 20]"
          @request="onRequest3"
          row-key="id"
          class="q-mt-md my-sticky-header-table"
        >
          <!-- หัวตาราง Sticky -->
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <!-- เนื้อหาตาราง -->
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="no">{{ props.rowIndex + 1 }}</q-td>
              <q-td key="name">
                <div class="ellipsis">
                  {{ truncateText(props.row.name) }}
                  <q-tooltip>{{ props.row.name }}</q-tooltip>
                </div>
              </q-td>
              <q-td key="dates">{{ props.row.dates }}</q-td>
              <q-td key="time">{{ props.row.time }}</q-td>
              <q-td key="location">{{ props.row.location }}</q-td>
              <q-td key="participants">{{ props.row.participants }}</q-td>
              <q-td key="skill">{{ props.row.skill }}</q-td>

              <!-- ✅ จัดกลางเฉพาะสถานะ -->
              <q-td key="activityState">
                <q-badge
                  :label="props.row.activityState"
                  :class="getStatusClass(props.row.activityState)"
                  class="status-badge"
                  rounded
                  unelevated
                />
              </q-td>

              <q-td key="action" class="text-left q-gutter-x-sm">
                <q-icon clickable name="visibility" @click="goToPageDetail(props.row.id, true)">
                  <q-tooltip>ดูรายละเอียด</q-tooltip>
                </q-icon>
                <q-icon clickable name="edit" @click="goToPageDetail(props.row.id, false)">
                  <q-tooltip>แก้ไข</q-tooltip>
                </q-icon>
                <!-- <q-icon clickable name="delete" @click="openRemoveDialog(props.row.id)">
                <q-tooltip>ลบ</q-tooltip>
              </q-icon> -->
              </q-td>
            </q-tr>
          </template>
          <template v-slot:no-data>
            <div class="full-width text-center q-pa-md text-grey" style="font-size: 20px">
              ไม่มีกิจกรรมที่เสร็จสิ้น
            </div>
          </template>
        </q-table>
      </section>

      <!-- ตางราง 4 ยกเลิก -->
      <section class="q-mt-lg">
        <div class="row items-center justify-between activity-section-header">
          <!-- หัวข้อ -->
          <div class="textheader">กิจกรรมที่ยกเลิก</div>
          <div class="row filter-row no-wrap q-mt-sm">
            <!-- 🔹 Search box -->
            <q-input
              dense
              outlined
              v-model="query4.search"
              label="ค้นหา ชื่อกิจกรรม"
              class="searchbox"
              :style="{ border: 'none' }"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <!-- 🔹 Filter Dialog -->
            <FilterDialog
              class="filter-btn"
              :model-value="showFilterDialog4"
              :categories="filterCategories || []"
              :years="query4.studentYear || []"
              :majors="query4.major || []"
              :status-activities="query4.activityState || []"
              :category-activities="query4.skill || []"
              @apply="applyFilters4"
            />
          </div>
        </div>
        <q-table
          bordered
          flat
          :rows="mapActivitiesToTableRows(activitys4)"
          :columns="columns"
          v-model:pagination="pagination4"
          :rows-per-page-options="[5, 7, 10, 15, 20]"
          @request="onRequest4"
          row-key="id"
          class="q-mt-md my-sticky-header-table"
        >
          <!-- หัวตาราง Sticky -->
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <!-- เนื้อหาตาราง -->
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="no" class="text-left">{{ props.rowIndex + 1 }}</q-td>
              <q-td key="name">
                <div class="ellipsis">
                  {{ truncateText(props.row.name) }}
                  <q-tooltip>{{ props.row.name }}</q-tooltip>
                </div>
              </q-td>
              <q-td key="dates">{{ props.row.dates }}</q-td>
              <q-td key="time">{{ props.row.time }}</q-td>
              <q-td key="location">{{ props.row.location }}</q-td>
              <q-td key="participants">{{ props.row.participants }}</q-td>
              <q-td key="skill">{{ props.row.skill }}</q-td>

              <!-- ✅ จัดกลางเฉพาะสถานะ -->
              <q-td key="activityState">
                <q-badge
                  :label="props.row.activityState"
                  :class="getStatusClass(props.row.activityState)"
                  class="status-badge"
                  rounded
                  unelevated
                />
              </q-td>

              <q-td key="action" class="text-left q-gutter-x-sm">
                <!-- <q-icon clickable name="visibility" @click="goToPageDetail(props.row.id, true)">
                <q-tooltip>ดูรายละเอียด</q-tooltip>
              </q-icon> -->
                <q-icon clickable name="edit" @click="goToPageDetail(props.row.id, false)">
                  <q-tooltip>แก้ไข</q-tooltip>
                </q-icon>
                <q-icon clickable name="delete" @click="openRemoveDialog(props.row.id)">
                  <q-tooltip>ลบ</q-tooltip>
                </q-icon>
              </q-td>
            </q-tr>
          </template>
          <template v-slot:no-data>
            <div class="full-width text-center q-pa-md text-grey" style="font-size: 20px">
              ไม่มีกิจกรรมที่ยกเลิก
            </div>
          </template>
        </q-table>
      </section>
    </template>

    <!-- Tabs สำหรับ mobile -->
    <q-tabs
      v-if="isMediumScreen"
      v-model="tabIndex"
      dense
      style="margin-bottom: 30px;"
      align="justify"
      class="tab-scroll-wrapper q-mb-md"
    >
      <q-tab name="0" label="เปิด/ปิดลงทะเบียน" />
      <q-tab name="1" label="กำลังวางแผน" />
      <q-tab name="2" label="เสร็จสิ้น" />
      <q-tab name="3" label="ยกเลิก" />
    </q-tabs>

    <!-- ตารางกิจกรรมใน mobile (แสดงเฉพาะ tab ที่เลือก) -->
    <template v-if="isMediumScreen">
      <section v-show="tabIndex == 0">
        <!-- 🔹 Header: Search + Filter -->
        <div class="column activity-section-header">
          <!-- 🔹 บรรทัดแรก -->
          <div class="textheader q-mb-sm">กิจกรรมที่เปิดลงทะเบียนและปิดลงทะเบียน</div>

          <!-- 🔸 บรรทัดที่สอง: Search + Filter -->
          <div class="row filter-row">
            <q-input
              dense
              style="flex: 1"
              outlined
              v-model="query1.search"
              label="ค้นหา ชื่อกิจกรรม"
              class="searchbox q-mr-sm"
              :style="{ border: 'none' }"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <FilterDialog
              class="filter-btn"
              :model-value="showFilterDialog1"
              :categories="filterCategories || []"
              :years="query1.studentYear || []"
              :majors="query1.major || []"
              :status-activities="query1.activityState || []"
              :category-activities="query1.skill || []"
              @apply="applyFilters1"
            />
          </div>
        </div>

        <!-- 🔹 Card View -->
        <q-card
          v-for="(row, index) in mapActivitiesToTableRows(activitys1)"
          :key="row.id ?? `row-${index}`"
          bordered
          flat
          class="q-mb-md"
        >
          <!-- 🔷 HEADER -->
          <q-card-section class="backgroundheader">
            <div class="row justify-between header-row-responsive">
              <!-- 🔹 ซ้าย: ชื่อกิจกรรม -->
              <div class="ActivityNamelabel">
                {{ truncateText(row.name) }}
                <q-tooltip>{{ row.name }}</q-tooltip>
              </div>

              <!-- 🔸 ขวา: Badge + ปุ่ม -->
              <div class="row q-gutter-sm action-section">
                <q-badge :class="getStatusClass(row.activityState)" class="status-badge">
                  {{ row.activityState }}
                </q-badge>
                <q-btn
                  flat
                  dense
                  icon="visibility"
                  class="bg-blue-10 text-blue-1"
                  @click="goToPageDetail(row.id ?? '', true)"
                >
                  <q-tooltip>ดูรายละเอียด</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  icon="edit"
                  class="bg-amber-5 text-yellow-1"
                  @click="goToPageDetail(row.id ?? '', false)"
                >
                  <q-tooltip>แก้ไข</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>

          <!-- 🔹 CONTENT -->
          <q-card-section>
            <div class="q-mb-xs info-row">
              <div class="label">วันที่</div>
              <div class="value">: {{ row.dates || '-' }}</div>
            </div>
            <div class="q-mb-xs info-row">
              <div class="label">เวลา</div>
              <div class="value">: {{ row.time || '-' }}</div>
            </div>
            <div class="q-mb-xs info-row">
              <div class="label">สถานที่</div>
              <div class="value">: {{ row.location || '-' }}</div>
            </div>
            <div class="q-mb-xs info-row">
              <div class="label">จำนวน (รับ/ลง/เหลือ)</div>
              <div class="value">: {{ row.participants || '-' }}</div>
            </div>
            <div class="info-row">
              <div class="label">ประเภท</div>
              <div class="value">: {{ row.skill || '-' }}</div>
            </div>
          </q-card-section>
        </q-card>
      </section>

      <section v-show="tabIndex == 1">
        <!-- 🔹 Header: Search + Filter -->
        <div class="column activity-section-header">
          <!-- 🔹 บรรทัดแรก -->
          <div class="textheader q-mb-sm">กิจกรรมที่กำลังวางแผน</div>

          <!-- 🔸 บรรทัดที่สอง: Search + Filter -->
          <div class="row filter-row">
            <q-input
              dense
              style="flex: 1"
              outlined
              v-model="query1.search"
              label="ค้นหา ชื่อกิจกรรม"
              class="searchbox q-mr-sm"
              :style="{ border: 'none' }"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <FilterDialog
              class="filter-btn"
              :model-value="showFilterDialog2"
              :categories="filterCategories || []"
              :years="query2.studentYear || []"
              :majors="query2.major || []"
              :status-activities="query2.activityState || []"
              :category-activities="query2.skill || []"
              @apply="applyFilters2"
            />
          </div>
        </div>

        <!-- 🔹 Card View -->
        <q-card
          v-for="(row, index) in mapActivitiesToTableRows(activitys2)"
          :key="row.id ?? `row-${index}`"
          bordered
          flat
          class="q-mb-md"
        >
          <!-- 🔷 HEADER -->
          <q-card-section class="backgroundheader">
            <div class="row justify-between header-row-responsive">
              <!-- 🔹 ซ้าย: ชื่อกิจกรรม -->
              <div class="ActivityNamelabel">
                {{ truncateText(row.name) }}
                <q-tooltip>{{ row.name }}</q-tooltip>
              </div>

              <!-- 🔸 ขวา: Badge + ปุ่ม -->
              <div class="row q-gutter-sm action-section">
                <q-badge :class="getStatusClass(row.activityState)" class="status-badge">
                  {{ row.activityState }}
                </q-badge>
                <q-btn
                  flat
                  dense
                  icon="visibility"
                  class="bg-blue-10 text-blue-1"
                  @click="goToPageDetail(row.id ?? '', true)"
                >
                  <q-tooltip>ดูรายละเอียด</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  icon="edit"
                  class="bg-amber-5 text-yellow-1"
                  @click="goToPageDetail(row.id ?? '', false)"
                >
                  <q-tooltip>แก้ไข</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>

          <!-- 🔹 CONTENT -->
           <q-card-section>
            <div class="q-mb-xs info-row">
              <div class="label">วันที่</div>
              <div class="value">: {{ row.dates || '-' }}</div>
            </div>
            <div class="q-mb-xs info-row">
              <div class="label">เวลา</div>
              <div class="value">: {{ row.time || '-' }}</div>
            </div>
            <div class="q-mb-xs info-row">
              <div class="label">สถานที่</div>
              <div class="value">: {{ row.location || '-' }}</div>
            </div>
            <div class="q-mb-xs info-row">
              <div class="label">จำนวน (รับ/ลง/เหลือ)</div>
              <div class="value">: {{ row.participants || '-' }}</div>
            </div>
            <div class="info-row">
              <div class="label">ประเภท</div>
              <div class="value">: {{ row.skill || '-' }}</div>
            </div>
          </q-card-section>
        </q-card>
      </section>

      <section v-show="tabIndex == 2">
        <!-- 🔹 Header: Search + Filter -->
        <div class="column activity-section-header">
          <!-- 🔹 บรรทัดแรก -->
          <div class="textheader q-mb-sm">กิจกรรมที่เสร็จสิ้น</div>

          <!-- 🔸 บรรทัดที่สอง: Search + Filter -->
          <div class="row filter-row">
            <q-input
              dense
              style="flex: 1"
              outlined
              v-model="query3.search"
              label="ค้นหา ชื่อกิจกรรม"
              class="searchbox q-mr-sm"
              :style="{ border: 'none' }"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <FilterDialog
              class="filter-btn"
              :model-value="showFilterDialog3"
              :categories="filterCategories || []"
              :years="query3.studentYear || []"
              :majors="query3.major || []"
              :status-activities="query3.activityState || []"
              :category-activities="query3.skill || []"
              @apply="applyFilters3"
            />
          </div>
        </div>

        <!-- 🔹 Card View -->
        <q-card
          v-for="(row, index) in mapActivitiesToTableRows(activitys3)"
          :key="row.id ?? `row-${index}`"
          bordered
          flat
          class="q-mb-md"
        >
          <!-- 🔷 HEADER -->
          <q-card-section class="backgroundheader">
            <div class="row justify-between header-row-responsive">
              <!-- 🔹 ซ้าย: ชื่อกิจกรรม -->
              <div class="ActivityNamelabel">
                {{ truncateText(row.name) }}
                <q-tooltip>{{ row.name }}</q-tooltip>
              </div>

              <!-- 🔸 ขวา: Badge + ปุ่ม -->
              <div class="row q-gutter-sm action-section">
                <q-badge :class="getStatusClass(row.activityState)" class="status-badge">
                  {{ row.activityState }}
                </q-badge>
                <q-btn
                  flat
                  dense
                  icon="visibility"
                  class="bg-blue-10 text-blue-1"
                  @click="goToPageDetail(row.id ?? '', true)"
                >
                  <q-tooltip>ดูรายละเอียด</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  icon="edit"
                  class="bg-amber-5 text-yellow-1"
                  @click="goToPageDetail(row.id ?? '', false)"
                >
                  <q-tooltip>แก้ไข</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>

          <!-- 🔹 CONTENT -->
          <q-card-section>
            <div class="q-mb-xs info-row">
              <div class="label">วันที่</div>
              <div class="value">: {{ row.dates || '-' }}</div>
            </div>
            <div class="q-mb-xs info-row">
              <div class="label">เวลา</div>
              <div class="value">: {{ row.time || '-' }}</div>
            </div>
            <div class="q-mb-xs info-row">
              <div class="label">สถานที่</div>
              <div class="value">: {{ row.location || '-' }}</div>
            </div>
            <div class="q-mb-xs info-row">
              <div class="label">จำนวน (รับ/ลง/เหลือ)</div>
              <div class="value">: {{ row.participants || '-' }}</div>
            </div>
            <div class="info-row">
              <div class="label">ประเภท</div>
              <div class="value">: {{ row.skill || '-' }}</div>
            </div>
          </q-card-section>
        </q-card>
      </section>

      <section v-show="tabIndex == 3">
        <!-- 🔹 Header: Search + Filter -->
        <div class="column activity-section-header">
          <!-- 🔹 บรรทัดแรก -->
          <div class="textheader q-mb-sm">กิจกรรมที่เสร็จสิ้น</div>

          <!-- 🔸 บรรทัดที่สอง: Search + Filter -->
          <div class="row filter-row">
            <q-input
              dense
              style="flex: 1"
              outlined
              v-model="query1.search"
              label="ค้นหา ชื่อกิจกรรม"
              class="searchbox q-mr-sm"
              :style="{ border: 'none' }"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <FilterDialog
              class="filter-btn"
              :model-value="showFilterDialog4"
              :categories="filterCategories || []"
              :years="query4.studentYear || []"
              :majors="query4.major || []"
              :status-activities="query4.activityState || []"
              :category-activities="query4.skill || []"
              @apply="applyFilters4"
            />
          </div>
        </div>

        <!-- 🔹 Card View -->
        <q-card
          v-for="(row, index) in mapActivitiesToTableRows(activitys4)"
          :key="row.id ?? `row-${index}`"
          bordered
          flat
          class="q-mb-md"
        >
          <!-- 🔷 HEADER -->
          <q-card-section class="backgroundheader">
            <div class="row justify-between header-row-responsive">
              <!-- 🔹 ซ้าย: ชื่อกิจกรรม -->
              <div class="ActivityNamelabel">
                {{ truncateText(row.name) }}
                <q-tooltip>{{ row.name }}</q-tooltip>
              </div>

              <!-- 🔸 ขวา: Badge + ปุ่ม -->
              <div class="row q-gutter-sm action-section">
                <q-badge :class="getStatusClass(row.activityState)" class="status-badge">
                  {{ row.activityState }}
                </q-badge>
                <q-btn
                  flat
                  dense
                  icon="visibility"
                  class="bg-blue-10 text-blue-1"
                  @click="goToPageDetail(row.id ?? '', true)"
                >
                  <q-tooltip>ดูรายละเอียด</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  icon="edit"
                  class="bg-amber-5 text-yellow-1"
                  @click="goToPageDetail(row.id ?? '', false)"
                >
                  <q-tooltip>แก้ไข</q-tooltip>
                </q-btn>
                 <q-btn
                  flat
                  dense
                  icon="delete"
                  class="bg-red-7 text-red-1"
                  @click="openRemoveDialog(row.id ?? '')"
                >
                  <q-tooltip>ลบ</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>

          <!-- 🔹 CONTENT -->
           <q-card-section>
            <div class="q-mb-xs info-row">
              <div class="label">วันที่</div>
              <div class="value">: {{ row.dates || '-' }}</div>
            </div>
            <div class="q-mb-xs info-row">
              <div class="label">เวลา</div>
              <div class="value">: {{ row.time || '-' }}</div>
            </div>
            <div class="q-mb-xs info-row">
              <div class="label">สถานที่</div>
              <div class="value">: {{ row.location || '-' }}</div>
            </div>
            <div class="q-mb-xs info-row">
              <div class="label">จำนวน (รับ/ลง/เหลือ)</div>
              <div class="value">: {{ row.participants || '-' }}</div>
            </div>
            <div class="info-row">
              <div class="label">ประเภท</div>
              <div class="value">: {{ row.skill || '-' }}</div>
            </div>
          </q-card-section>
        </q-card>
      </section>
    </template>

    <RemoveDialog v-model="isRemoveDialogOpen" @confirm="handleConfirmRemove" />
  </q-page>
</template>

<style lang="scss" scoped>
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
  background-color: #edf0f5;
}
.my-sticky-header-table {
  min-height: 340px; /* หรือแล้วแต่ต้องการ */
  overflow-y: auto;
}

/* Sticky thead (ใช้ภายใน q-table ได้เลย) */
.my-sticky-header-table thead tr {
  position: sticky;
  top: 0;
  background: white; /* จำเป็น */
  z-index: 1;
}

.status-close {
  background-color: #cfd7ff;
  color: #001780;
  border: 2px solid #002dff;
  width: 130px;
}

.status-open {
  background-color: #d0ffc5;
  color: #009812;
  border: 2px solid #00bb16;
  width: 130px;
}

.status-planning {
  background-color: #ffe7ba;
  color: #ff6f00;
  border: 2px solid #ffa500;

  width: 130px;
}

.status-cancel {
  background-color: #ffc5c5;
  color: #ff0000;
  border: 2px solid #f32323;

  width: 130px;
}

.status-success {
  background-color: #dadada;
  color: #000000;
  /* สีม่วง */
  border: 2px solid #575656;

  width: 130px;
}

.status-badge {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 15px;

  align-items: center;
  justify-content: center;

  /* ป้องกันการขยายแนวนอนเกินไป */
  white-space: nowrap;
}

.btnadd {
  background-color: #14279b;
  color: white;
  border: none;
  font-weight: bold;
  font-size: medium;
}
.searchbox {
  margin-right: 5px;
}
.textheader {
  font-size: 20px;
  font-weight: 500;
}
.activity-section-header {
  margin-bottom: 20px;
}

@media (max-width: 1150px) {
  .searchbox {
    width: 280px !important;
  }
}
@media (max-width: 650px) {
  .header-row-responsive {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-section {
    margin-top: 8px;
  }
}

@media (max-width: 450px) {
  .btnadd {
    width: 120px !important;
    min-width: 120px !important;
    max-width: 120px !important;
    flex: 0 0 120px !important; /* ป้องกัน flex บีบหรือขยาย */
    padding: 0 !important;
  }
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

@media (max-width: 370px) {
  .info-row {
    flex-direction: column;
    align-items: flex-start; /* ชิดซ้าย */
  }

  .info-row .label,
  .info-row .value {
    width: 100%;
  }
}
</style>
