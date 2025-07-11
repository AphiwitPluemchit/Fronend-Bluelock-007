<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { today } from '@quasar/quasar-ui-qcalendar'
import '@quasar/quasar-ui-qcalendar/dist/index.css'
import { QCalendarMonth } from '@quasar/quasar-ui-qcalendar'
import type { Activity } from 'src/types/activity'
import type { Pagination } from 'src/types/pagination'
import { ActivityService } from 'src/services/activity'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import type { CalendarEvent } from 'src/types/calendar'

const activitys1 = ref<Activity[]>([])
const showFilterDialog1 = ref(false)
const filterCategories = ref(['year', 'major', 'statusActivity', 'categoryActivity'])
const searchBoxFocused = ref<boolean>(false)
const calendarRef = ref()

const currentMonthDisplay = computed(() => {
  const date = new Date(selectedDate.value)
  const thMonths = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ]
  const month = thMonths[date.getMonth()]
  const year = date.getFullYear() + 543
  return `${month} ${year}`
})

const query1 = ref<Pagination>({
  page: 1,
  limit: 20,
  search: '',
  sortBy: 'dates',
  order: 'desc',
  skill: [],
  activityState: [],
  major: [],
  studentYear: [],
})

interface SelectedFilters {
  year: string[]
  major: string[]
  statusActivity: string[]
  categoryActivity: string[]
}

const pagination1 = ref({
  sortBy: query1.value.sortBy,
  descending: query1.value.order === 'desc',
  page: query1.value.page,
  rowsPerPage: query1.value.limit,
  rowsNumber: 0,
})

async function getActivityData(qeury: Pagination) {
  const data = await ActivityService.getAll(qeury)
  return data
}

const data1 = async () => {
  // console.log('data fetched:', data)
  const data = await getActivityData(query1.value)

  pagination1.value.page = query1.value.page
  pagination1.value.rowsPerPage = query1.value.limit
  pagination1.value.sortBy = query1.value.sortBy
  pagination1.value.rowsNumber = data.meta.total
  pagination1.value.descending = query1.value.order === 'desc'

  activitys1.value = data.data
  calendarEvents.value = parseToCalendarEvents(data.data)
  console.log('Parsed calendarEvents:', calendarEvents.value)
}

const dataCalendar = async () => {
  const date = new Date(selectedDate.value)
  const year = date.getFullYear().toString()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')

  console.log('filters used:', query1.value)

  const res = await ActivityService.getAllCalendar({
    year,
    month,
    skill: query1.value.skill ?? [],
    activityState: query1.value.activityState ?? [],
    major: query1.value.major ?? [],
    studentYear: query1.value.studentYear ?? [],
  })

  // แสดงค่าผลลัพธ์จาก API
  console.log('API response data:', res.data)

  calendarEvents.value = parseToCalendarEvents(res.data)
}

const applyFilters1 = async (selectedFilters: SelectedFilters) => {
  query1.value.studentYear = selectedFilters.year
  query1.value.major = selectedFilters.major
  query1.value.activityState = selectedFilters.statusActivity
  query1.value.skill = selectedFilters.categoryActivity

  selectedEvents.value = [] // ล้าง panel ขวาเมื่อใช้ filter
  await data1()
}

const todayDate = ref<string>(today())
const selectedDate = ref<string>(today())
const selectedEvents = ref<CalendarEvent[]>([])
const calendarEvents = ref<CalendarEvent[]>([])

const groupedSearchResults = ref<Record<string, CalendarEvent[]> | null>(null)

watch(
  () => query1.value.search,
  async (newSearch) => {
    if (!newSearch) {
      groupedSearchResults.value = null
      return
    }

    const q = { ...query1.value, search: newSearch }
    const data = await getActivityData(q)
    const parsedEvents = Array.isArray(data.data)
      ? parseToCalendarEvents(data.data).filter((e) => {
          const keyword = newSearch.trim().toLowerCase()
          const keywords = keyword.split(/\s+/)

          // ตัดชื่อกิจกรรมออกเป็นคำ เช่น 'In house online' → ['in', 'house', 'online']
          const tokens = `${e.activityName} ${e.activityItemName}`.toLowerCase().split(/\s+/)

          // ต้องให้ทุกคำที่พิมพ์มา เจอในบางคำของ tokens (บางส่วนก็ได้)
          return keywords.every((k) => tokens.some((t) => t.includes(k)))
        })
      : []

    // group by date
    const grouped: Record<string, CalendarEvent[]> = {}
    parsedEvents.forEach((e) => {
      ;(grouped[e.date] ??= []).push(e)
    })

    // sort time + alphabet
    for (const date in grouped) {
      grouped[date]!.sort((a, b) => {
        const timeA = a.time?.split(' - ')[0] ?? ''
        const timeB = b.time?.split(' - ')[0] ?? ''
        return timeA === timeB
          ? a.activityName.toLowerCase().localeCompare(b.activityName.toLowerCase())
          : timeA.localeCompare(timeB)
      })
    }

    groupedSearchResults.value = grouped
  },
)

function onClickDate(payload: { scope: { timestamp: { date: string } } }) {
  selectedDate.value = payload.scope.timestamp.date
  selectedEvents.value = getEvents(payload.scope.timestamp.date)
  query1.value.search = '' // reset การค้นหา
}

function onEventStackClick(date: string) {
  selectedDate.value = date
  selectedEvents.value = getEvents(date)

  if (!searchBoxFocused.value) {
    query1.value.search = ''
  }
}

// for panel ด้านขวา และเรียงลำดับตามเวลาเริ่มต้น
function getEvents(date: string) {
  const events = calendarEvents.value.filter((e) => e.date === date)
  console.log('getEvents:', date, events)
  return calendarEvents.value
    .filter((e) => e.date === date)
    .sort((a, b) => {
      const timeA = a.time?.split(' - ')[0] ?? ''
      const timeB = b.time?.split(' - ')[0] ?? ''

      // ถ้าเวลาเริ่มเท่ากัน ให้เรียงตามตัวอักษรของชื่อกิจกรรมย่อย (ไม่สนพิมพ์เล็ก-ใหญ่)
      if (timeA === timeB) {
        return a.activityName.toLowerCase().localeCompare(b.activityName.toLowerCase())
      }
      return timeA.localeCompare(timeB)
    })
}

// for event stack ในแต่ละช่องของ QCalendar
function getEventsForDay(date: string) {
  return calendarEvents.value
    .filter((e) => e.date === date)
    .sort((a, b) => {
      const timeA = a.time?.split(' - ')[0] ?? ''
      const timeB = b.time?.split(' - ')[0] ?? ''

      if (timeA === timeB) {
        return a.activityName.toLowerCase().localeCompare(b.activityName.toLowerCase())
      }
      return timeA.localeCompare(timeB)
    })
    .map((e) => ({ size: 1, event: e }))
}

function activityStatusLabel(status: string): string {
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
    default:
      return '-'
  }
}

const getStatusClass = (status: string) => {
  if (status === 'กำลังวางแผน') return 'status-planning'
  if (status === 'เปิดลงทะเบียน') return 'status-open'
  if (status === 'ปิดลงทะเบียน') return 'status-close'
  if (status === 'เสร็จสิ้น') return 'status-success'
  if (status === 'ยกเลิก') return 'status-cancel'
  return ''
}

// สี ของ card activity
function getStatusColor(status: string): string {
  switch (status) {
    case 'กำลังวางแผน':
      return '#ffa500'
    case 'เปิดลงทะเบียน':
      return '#00bb16'
    case 'ปิดลงทะเบียน':
      return '#002dff'
    case 'ยกเลิก':
      return '#f32323'
    case 'เสร็จสิ้น':
      return '#575656'
    default:
      return '#e0e0e0'
  }
}

function badgeClasses(d: { event: CalendarEvent }) {
  console.log('badgeClasses status:', d.event.activityState)
  return ['my-event', getStatusClass(d.event.activityState)]
}

function formatThaiDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function parseToCalendarEvents(activities: Activity[]): CalendarEvent[] {
  const parsed: CalendarEvent[] = []

  activities.forEach((activity) => {
    const category = activity.skill === 'soft' ? 'soft' : 'hard'
    const activityStateLabel = activityStatusLabel(activity.activityState ?? '')

    activity.activityItems?.forEach((item) => {
      if (!item || !item.dates) return

      item.dates.forEach((d) => {
        parsed.push({
          id: parseInt(item.id?.toString().slice(-5) ?? '0', 16),
          activityName: activity.name || '-',
          activityItemName: item.name || activity.name || '-',
          activityState: activityStateLabel,
          category,
          date: d.date,
          time: `${d.stime} - ${d.etime}`,
          location: item.rooms?.join(', ') || '-',
          participants: `${item.enrollmentCount ?? 0}/${item.maxParticipants ?? '-'}`,
          // duration: 1,
        })
      })
    })
  })

  return parsed
}

function goToDate(dateStr: string) {
  selectedDate.value = dateStr
  console.log('goToDate: ', dateStr)
  console.log('calendarEvents before set:', JSON.stringify(calendarEvents.value, null, 2))
  selectedEvents.value = getEvents(dateStr)
  query1.value.search = '' // reset ช่อง search
}

onMounted(async () => {
  await dataCalendar()
  console.log('calendarRef:', calendarRef.value)

  // หากวันนี้มี event ให้แสดงทางด้านขวาเลย
  if (selectedDate.value === todayDate.value) {
    const todayEvents = getEvents(todayDate.value)
    if (todayEvents.length > 0) {
      selectedEvents.value = todayEvents
    }
  }
})

async function onMonthChanged({ start }: { start: { date: string } }) {
  // ถ้ากำลังค้นหาอยู่ → ไม่ต้องโหลดข้อมูลใหม่
  if (query1.value.search) return

  const newMonth = new Date(start.date)
  const selected = new Date(selectedDate.value)

  // ตรวจสอบว่าเดือนใหม่ที่เปลี่ยนเข้ามา เป็นเดือนเดียวกับวันที่ที่เลือกอยู่หรือไม่
  const sameMonth =
    newMonth.getFullYear() === selected.getFullYear() && newMonth.getMonth() === selected.getMonth()

  // ถ้าเป็นคนละเดือนกัน
  if (!sameMonth) {
    await dataCalendar()

    // ตรวจสอบว่าวันที่เลือกเดิมยังมี event อยู่หรือไม่
    const stillHasEvents = getEvents(selectedDate.value).length > 0

    // ถ้ายังมี event ในวันเดิม ให้แสดง event เหล่านั้นต่อไป
    // ถ้าไม่มี ให้ล้าง selectedEvents
    selectedEvents.value = stillHasEvents ? getEvents(selectedDate.value) : []
  }
}
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-md" style="margin-top: 20px">
      <div class="text-h4 q-mb-md">ตารางกิจกรรม</div>
    </div>

    <!-- แถวรวมซ้าย: เดือน + ปุ่ม , ขวา: ช่องค้นหา + ฟิลเตอร์ -->
    <div class="row items-center justify-between q-mb-md">
      <!-- ⬅ อยู่ฝั่ง col-8 แต่จัดด้านซ้าย -->
      <div class="row items-center no-wrap">
        <q-btn flat dense icon="chevron_left" @click="calendarRef?.prev()" />
        <q-btn flat dense icon="chevron_right" @click="calendarRef?.next()" />
        <div class="text-h5 q-mx-md">{{ currentMonthDisplay }}</div>
      </div>

      <!-- ฝั่งขวา: search + filter -->
      <div class="row items-center no-wrap">
        <q-input
          dense
          outlined
          v-model="query1.search"
          label="ค้นหา ชื่อกิจกรรม"
          class="q-mr-sm searchbox"
          :style="{ border: 'none', minWidth: '200px' }"
          @focus="searchBoxFocused = true"
          @blur="searchBoxFocused = false"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <FilterDialog
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

    <!-- Layout แบ่งปฏิทิน (ซ้าย) และรายละเอียดกิจกรรม (ขวา) -->
    <div class="row q-col-gutter-md calendar-wrapper">
      <div class="col-8">
        <q-calendar-month
          ref="calendarRef"
          v-model="selectedDate"
          locale="th-TH"
          animated
          bordered
          :day-min-height="110"
          :day-class="() => 'bordered-day'"
          @click-date="onClickDate"
          @change="onMonthChanged"
        >
          <!-- Slot day -->
          <template #day="{ scope }">
            <div
              class="q-calendar__day-ellipsis day-cell"
              :class="{
                'is-today': scope.timestamp.date === todayDate,
                'is-selected': scope.timestamp.date === selectedDate,
              }"
              @click="onClickDate({ scope })"
            >
              <div class="day-number">{{ scope.timestamp.day }}</div>
              <div class="event-stack">
                <div
                  v-for="(eventData, idx) in getEventsForDay(scope.timestamp.date)"
                  :key="idx"
                  :class="badgeClasses(eventData)"
                  class="my-event"
                  @click.stop="onEventStackClick(scope.timestamp.date)"
                >
                  <div class="q-calendar__ellipsis">
                    {{ eventData.event.activityName }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </q-calendar-month>
      </div>

      <!-- panel แสดงรายละเอียดกิจกรรม -->
      <div class="col-4">
        <div class="event-panel">
          <!-- กรณีมี search -->
          <div v-if="query1.search">
            <template v-if="groupedSearchResults && Object.keys(groupedSearchResults).length > 0">
              <div
                v-for="date in Object.keys(groupedSearchResults).sort()"
                :key="date"
                class="q-mb-xl"
              >
                <!-- วันที่ -->
                <div class="text-h6 q-mb-sm">{{ formatThaiDate(date) }}</div>

                <!-- การ์ดกิจกรรม -->
                <div v-for="event in groupedSearchResults[date]" :key="event.id" class="q-mb-sm">
                  <q-card
                    flat
                    bordered
                    class="q-pa-md q-mb-sm clickable-card"
                    :style="`border-left: 5px solid ${getStatusColor(event.activityState)}`"
                    @click="goToDate(event.date)"
                  >
                    <div class="event-header-row">
                      <div class="event-title">{{ event.activityName }}</div>
                      <div class="event-category">
                        {{ event.category === 'soft' ? 'Soft Skill' : 'Hard Skill' }}
                      </div>
                    </div>
                    <div class="q-mt-xs">{{ event.activityItemName }}</div>
                    <div class="q-mt-xs">{{ event.time }}</div>
                    <div>จำนวนลงทะเบียน : {{ event.participants }}</div>
                    <div>สถานที่ : {{ event.location }}</div>
                  </q-card>
                </div>
              </div>
            </template>

            <!-- กรณีไม่มีผลลัพธ์ -->
            <div v-else class="text-grey">ไม่พบกิจกรรมที่ตรงกับคำค้นหา</div>
          </div>

          <!-- แสดง selectedDate (ไม่ได้ค้นหา) -->
          <div v-else>
            <div class="text-h6 q-mb-sm">{{ formatThaiDate(selectedDate) }}</div>

            <template v-if="selectedEvents.length">
              <div v-for="event in selectedEvents" :key="event.id" class="q-mb-sm">
                <q-card
                  flat
                  bordered
                  class="q-pa-md q-mb-sm"
                  :style="`border-left: 5px solid ${getStatusColor(event.activityState)}`"
                >
                  <div class="event-header-row">
                    <div class="event-title">
                      {{ event.activityName }}
                    </div>

                    <div class="event-category">
                      {{ event.category === 'soft' ? 'Soft Skill' : 'Hard Skill' }}
                    </div>
                  </div>
                  <div class="q-mt-xs">{{ event.activityItemName }}</div>
                  <div class="q-mt-xs">{{ event.time }}</div>
                  <div>จำนวนลงทะเบียน : {{ event.participants }}</div>
                  <div>สถานที่ : {{ event.location }}</div>
                </q-card>
              </div>
            </template>

            <div v-else class="text-grey">ไม่มีข้อมูลกิจกรรมในวันนี้</div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.calendar-wrapper {
  align-items: flex-start;
}

.bordered-day {
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.my-event {
  width: 100%;
  font-size: 12px;
  height: 20px;
  padding: 2px 4px;
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 6px;
  cursor: pointer;
}

.event-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap; /* ทำให้ขึ้นบรรทัดใหม่ */
  gap: 4px;
}

.event-title {
  font-weight: bold;
  font-size: 16px;
  word-break: break-word; /* บังคับขึ้นบรรทัด */
  flex-grow: 1;
  min-width: 0;
  max-width: calc(100% - 100px); /* ป้องกันชนกับหมวดด้านขวา */
}

.event-category {
  font-size: 16px;
  color: #666;
  white-space: nowrap;
  flex-shrink: 0;
}

.day-cell {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 4px;
  cursor: pointer;
}

.day-number {
  font-size: 12px;
  font-weight: bold;
  width: 24px;
  height: 24px;
  line-height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: auto;
}

:deep(button.q-calendar-month__day--label) {
  display: none !important;
}

:deep(.event-stack) {
  margin-top: 1px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.is-today .day-number {
  border: 2px solid #3e98dc;
  color: #3e98dc;
}

.is-selected .day-number {
  background-color: #3e98dc;
  color: white;
}

.event-panel {
  max-height: 650px;
  overflow-y: scroll;
  padding-right: 8px;
  scrollbar-width: none; /* สำหรับ Firefox */
}

/* สำหรับ Chrome, Edge, Safari */
.event-panel::-webkit-scrollbar {
  display: none;
}

.status-close {
  background-color: #cfd7ff;
  color: #001780;
  border: 2px solid #002dff;
}

.status-open {
  background-color: #d0ffc5;
  color: #009812;
  border: 2px solid #00bb16;
}

.status-planning {
  background-color: #ffe7ba;
  color: #ff6f00;
  border: 2px solid #ffa500;
}

.status-cancel {
  background-color: #ffc5c5;
  color: #ff0000;
  border: 2px solid #f32323;
}

.status-success {
  background-color: #dadada;
  color: #000000;
  /* สีม่วง */
  border: 2px solid #575656;
}

.q-card {
  border-radius: 12px;
  background-color: #fff;
}

.clickable-card {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
</style>
