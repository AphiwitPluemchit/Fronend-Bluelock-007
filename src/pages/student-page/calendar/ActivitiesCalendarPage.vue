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
import CalendarMonthYearSelector from './CalendarComponents/CalendarMonthYearSelector.vue'
import CalendarEventPanel from './CalendarComponents/CalendarEventPanel.vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const isMobile = computed(() => $q.screen.lt.md)
const dialog = ref(false)

const activitys1 = ref<Activity[]>([])
const showFilterDialog1 = ref(false)
const filterCategories = ref(['year', 'major', 'categoryActivity'])
const searchBoxFocused = ref<boolean>(false)
const calendarRef = ref()
const displayedMonth = ref(new Date()) // ค่า default เป็นเดือนปัจจุบัน

const query1 = ref<Pagination>({
  page: 1,
  limit: 99,
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
  categoryActivity: string[]
}

const pagination1 = ref({
  sortBy: query1.value.sortBy,
  descending: query1.value.order === 'desc',
  page: query1.value.page,
  rowsPerPage: query1.value.limit,
  rowsNumber: 0,
})

function sortEventsByTimeAndName(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const timeA = a.time?.split(' - ')[0] ?? ''
    const timeB = b.time?.split(' - ')[0] ?? ''
    return timeA === timeB
      ? a.activityName.toLowerCase().localeCompare(b.activityName.toLowerCase())
      : timeA.localeCompare(timeB)
  })
}

function formatThaiDate(dateStr: string): string {
  if (!dateStr) return ''
  const months = [
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
  const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
  const d = new Date(dateStr)
  const dayName = days[d.getDay()]
  const day = d.getDate()
  const month = months[d.getMonth()]
  const year = d.getFullYear() + 543
  return `วัน${dayName} ${day} ${month} ${year}`
}

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
    const keywords = newSearch.trim().toLowerCase().split(/\s+/)
    const parsedEvents = Array.isArray(data.data)
      ? parseToCalendarEvents(data.data).filter((e) => {
          const target = `${e.activityName} ${e.activityItemName}`.toLowerCase()
          return keywords.every((k) => target.includes(k))
        })
      : []

    // group by date
    const grouped: Record<string, CalendarEvent[]> = {}
    parsedEvents.forEach((e) => {
      ;(grouped[e.date] ??= []).push(e)
    })

    // sort time + name
    for (const date in grouped) {
      const events = grouped[date]
      if (events) {
        grouped[date] = sortEventsByTimeAndName(events)
      }
    }

    groupedSearchResults.value = grouped
  },
)

function onClickDate(payload: { scope: { timestamp: { date: string } } }) {
  selectedDate.value = payload.scope.timestamp.date
  selectedEvents.value = getEvents(payload.scope.timestamp.date)
  query1.value.search = '' // reset การค้นหา

  if (isMobile.value) dialog.value = true
}

function onEventStackClick(date: string) {
  selectedDate.value = date
  selectedEvents.value = getEvents(date)

  if (!searchBoxFocused.value) {
    query1.value.search = ''
  }

  if (isMobile.value) dialog.value = true
}

// for panel ด้านขวา และเรียงลำดับตามเวลาเริ่มต้น
function getEvents(date: string) {
  const events = calendarEvents.value.filter((e) => e.date === date)
  return sortEventsByTimeAndName(events)
}

function getFilteredEventsForDay(date: string) {
  const d = new Date(date)
  const currentMonth = displayedMonth.value.getMonth()
  const currentYear = displayedMonth.value.getFullYear()

  let events: CalendarEvent[] = []

  // เงื่อนไขนี้ใช้เฉพาะตอนค้นหา
  if (query1.value.search && groupedSearchResults.value) {
    // ถ้าเดือนนี้ไม่ใช่เดือนที่กำลังแสดงใน calendar → ไม่ render
    if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return []

    events = groupedSearchResults.value[date] || []
  } else {
    // แสดง event ได้ทุกเดือน
    events = calendarEvents.value.filter((e) => e.date === date)
  }

  return sortEventsByTimeAndName(events).map((e) => ({ size: 1, event: e }))
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

function badgeClasses(d: { event: CalendarEvent }) {
  console.log('badgeClasses status:', d.event.activityState)
  return ['my-event', d.event.category === 'hard' ? 'hard-skill' : 'soft-skill']
}

function parseToCalendarEvents(activities: Activity[]): CalendarEvent[] {
  const parsed: CalendarEvent[] = []

  activities.forEach((activity) => {
    const category = activity.skill === 'soft' ? 'soft' : 'hard'
    const activityStateLabel = activityStatusLabel(activity.activityState ?? '')

    // ไม่แสดงสถานะกิจกรรม 'ยกเลิก' หรือ 'กำลังวางแผน'
    if (['cancel', 'planning'].includes(activity.activityState ?? '')) return

    activity.activityItems?.forEach((item) => {
      if (!item || !item.dates) return

      item.dates.forEach((d) => {
        parsed.push({
          id: activity.id?.toString() || '',
          activityName: activity.name || '-',
          activityItemName: item.name || activity.name || '-',
          activityState: activityStateLabel,
          category,
          date: d.date,
          time: `${d.stime} - ${d.etime}`,
          location: item.rooms?.join(', ') || '-',
          participants: `${item.enrollmentCount ?? 0}/${item.maxParticipants ?? '-'}`,
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

function onMonthYearSelected(newDate: string) {
  // reset search
  if (query1.value.search) {
    query1.value.search = ''
  }

  selectedDate.value = newDate
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

watch(selectedDate, (val) => {
  if (!val) {
    selectedEvents.value = []
    return
  }

  const events = getEvents(val)
  selectedEvents.value = events.length > 0 ? events : []
})
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-md" style="margin-top: 20px">
      <div class="texttitle" style="margin-bottom: 20px">ตารางกิจกรรม</div>
    </div>

    <div v-if="!isMobile">
      <!-- แถวรวมซ้าย: เดือน + ปุ่ม , ขวา: ช่องค้นหา + ฟิลเตอร์ -->
      <div class="row items-center justify-between q-mb-md">
        <!-- อยู่ฝั่ง col-8 แต่จัดด้านซ้าย -->
        <div class="row items-center no-wrap">
          <div class="row items-center no-wrap">
            <!-- select Date -->
            <CalendarMonthYearSelector
              :selected-date="selectedDate"
              @update:selected-date="selectedDate = $event"
            />
          </div>
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
                    v-for="(eventData, idx) in getFilteredEventsForDay(scope.timestamp.date)"
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
          <CalendarEventPanel
            :selected-date="selectedDate"
            :selected-events="selectedEvents"
            :search-query="query1.search || ''"
            :grouped-search-results="groupedSearchResults"
            @go-to-date="goToDate"
          />
        </div>
      </div>
    </div>

    <!-- Mobile Layout -->
    <div v-else>
      <!-- Month-Year Selector -->
      <div class="row q-mb-md full-width justify-end">
        <CalendarMonthYearSelector
          :selected-date="selectedDate"
          @update:selected-date="onMonthYearSelected"
        />
      </div>

      <!-- Search + Filter -->
      <div class="row q-gutter-sm q-mb-md items-center no-wrap" style="position: relative">
        <q-input
          dense
          outlined
          class="col"
          v-model="query1.search"
          label="ค้นหา ชื่อกิจกรรม"
          @focus="searchBoxFocused = true"
          @blur="searchBoxFocused = false"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
          <template
            v-if="query1.search && groupedSearchResults && Object.keys(groupedSearchResults).length"
            v-slot:after
          >
            <div class="dropdown-search-result">
              <div
                v-for="date in Object.keys(groupedSearchResults).sort(
                  (a, b) => new Date(a).getTime() - new Date(b).getTime(),
                )"
                :key="date"
                class="dropdown-date-group"
              >
                <div class="date-activity">{{ formatThaiDate(date) }}</div>
                <div
                  v-for="event in groupedSearchResults[date]"
                  :key="event.id"
                  class="dropdown-item"
                  @click="goToDate(date)"
                >
                  <div class="main-activity" style="font-weight: bold">
                    {{ event.activityName }}
                  </div>
                  <div class="sub-activity">{{ event.activityItemName }}</div>
                </div>
              </div>
            </div>
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

      <!-- Calendar always shown -->
      <q-calendar-month
        ref="calendarRef"
        v-model="selectedDate"
        locale="th-TH"
        animated
        bordered
        :day-min-height="110"
        :day-class="() => 'bordered-day'"
        @update:model-value="goToDate"
        @click-date="onClickDate"
        @change="onMonthChanged"
      >
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
                v-for="(eventData, idx) in getFilteredEventsForDay(scope.timestamp.date)"
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

      <!-- Dialog สำหรับ mobile -->
      <q-dialog v-model="dialog" full-width>
        <q-card class="q-dialog-card scroll-wrapper q-pa-md">
          <!-- Panel แสดงกิจกรรม -->
          <CalendarEventPanel
            :selected-date="selectedDate"
            :selected-events="selectedEvents"
            :search-query="query1.search || ''"
            :grouped-search-results="groupedSearchResults"
            @go-to-date="goToDate"
          />
        </q-card>
      </q-dialog>
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
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: 2px;
}

:deep(.q-calendar-month__day--label__wrapper) {
  display: none !important;
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

.dropdown-search-result {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background: #fff;
  border: 1px solid #ccc;
  width: 100%;
  max-width: 100vw;
  max-height: 300px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  margin-top: 2px;
  transition: width 0.2s;
  overflow-y: auto;
  scrollbar-width: none;
}

.dropdown-search-result::-webkit-scrollbar {
  display: none;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column; /* เปลี่ยนเป็น column */
  justify-content: flex-start;
}

.main-activity,
.sub-activity {
  color: #1f1f1f;
  margin-bottom: 2px;
}

.date-activity {
  color: #1976d2;
  padding-left: 11px;
  font-size: 14px;
  padding-top: 10px;
  font-weight: bold;
}

.dropdown-date-group:not(:first-child) {
  margin-top: 8px;
}

.dropdown-item:hover {
  background: #f0f4ff;
}

.is-today .day-number {
  border: 2px solid #1976d2;
  color: #1976d2;
}

.is-selected .day-number {
  background-color: #1976d2;
  color: white;
}

.hard-skill {
  color: #001780;
  border: 1px solid #002dff;
  background-color: #cfd7ff;
}

.soft-skill {
  color: #009812;
  border: 1px solid #00bb16;
  background-color: #d2ffc7;
}

.q-dialog-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  background: white;
  position: relative;
  border-radius: 12px;
}

.scroll-wrapper {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scroll-wrapper::-webkit-scrollbar {
  display: none;
}

@media (max-width: 300px), (max-width: 900px) {
  .calendar-wrapper {
    flex-direction: column;
  }

  .calendar-wrapper .col-8,
  .calendar-wrapper .col-4 {
    width: 100%;
    max-width: 100%;
  }

  .searchbox {
    width: 100%;
  }
}
</style>
