<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { today } from '@quasar/quasar-ui-qcalendar'
import type { Timestamp } from '@quasar/quasar-ui-qcalendar'
import '@quasar/quasar-ui-qcalendar/dist/index.css'
import { QCalendarMonth } from '@quasar/quasar-ui-qcalendar'
import type { Activity } from 'src/types/activity'
import type { Pagination } from 'src/types/pagination'
import { ActivityService } from 'src/services/activity'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'

const activitys1 = ref<Activity[]>([])
const showFilterDialog1 = ref(false)
const filterCategories = ref(['year', 'major', 'statusActivity', 'categoryActivity'])

const query1 = ref<Pagination>({
  page: 1,
  limit: 100,
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

const applyFilters1 = async (selectedFilters: SelectedFilters) => {
  query1.value.studentYear = selectedFilters.year
  query1.value.major = selectedFilters.major
  query1.value.activityState = selectedFilters.statusActivity
  query1.value.skill = selectedFilters.categoryActivity
  await data1()
}

interface CalendarEvent {
  id: number
  activityName?: string // ชื่อกิจกรรมหลัก
  activityItemName: string // ชื่อกิจกรรมย่อย
  category: 'soft' | 'hard'
  date: string
  time: string
  location: string
  count: string
  duration?: number
}

const todayDate = ref<string>(today())
const selectedDate = ref<string>(today())
const selectedEvents = ref<CalendarEvent[]>([])
const calendarEvents = ref<CalendarEvent[]>([])

function selectEvent(event: CalendarEvent) {
  
  selectedDate.value = event.date
  selectedEvents.value = getEvents(event.date)
}

// เพิ่ม computed property สำหรับ group กิจกรรมย่อยในวันเดียวกัน
const groupedEvents = computed(() => {
  const groups: Record<string, CalendarEvent[]> = {}

  selectedEvents.value.forEach((event) => {
    const key = event.activityName ?? '-'
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(event)
  })

  return groups
})

const searchResults = computed(() => {
  if (!query1.value.search) {
    // ถ้าไม่มีการค้นหา → แสดง selectedEvents ปกติ (ของวันเดียว)
    return groupedEvents.value
  }

  // ถ้ามีการค้นหา → group ข้อมูลทั้งหมดใน calendarEvents ที่ match คำค้นหา
  const groups: Record<string, CalendarEvent[]> = {}
  const searchTerm = query1.value.search.toLowerCase()

  calendarEvents.value.forEach((event) => {
    // เช็คชื่อกิจกรรมหลัก/ย่อย
    const nameMatch =
      event.activityName?.toLowerCase().includes(searchTerm) ||
      event.activityItemName.toLowerCase().includes(searchTerm)

    if (nameMatch) {
      const key = event.activityName ?? '-'
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(event)
    }
  })

  return groups
})

function onClickDate(payload: { scope: { timestamp: { date: string } } }) {
  selectedDate.value = payload.scope.timestamp.date
  selectedEvents.value = getEvents(payload.scope.timestamp.date)
}

function getEvents(date: string) {
  return calendarEvents.value.filter((e) => {
    const start = new Date(e.date)
    const end = new Date(e.date)
    end.setDate(end.getDate() + (e.duration ?? 1) - 1)
    const target = new Date(date)
    return target >= start && target <= end
  })
}

function getEventsForDay(date: string) {
  const result: { size: number; event: CalendarEvent }[] = []
  for (const e of calendarEvents.value) {
    const end = new Date(e.date)
    const duration = e.duration ?? 1
    end.setDate(end.getDate() + duration - 1)
    const endStr = end.toISOString().split('T')[0] || ''

    if (date >= e.date && date <= endStr) {
      result.push({ size: duration, event: e })
    }
  }
  return result
}

function getWeekEvents(week: Timestamp[]) {
  const weekDates = week.map((d) => d.date)
  const result: { start: number; size: number; event: CalendarEvent }[] = []
  const weekStart = weekDates[0]
  const weekEnd = weekDates[weekDates.length - 1]
  if (!weekStart || !weekEnd) return result

  for (const e of calendarEvents.value) {
    const start = new Date(e.date)
    const duration = e.duration ?? 1
    const end = new Date(start)
    end.setDate(end.getDate() + duration - 1)
    const startStr = start.toISOString().slice(0, 10)
    const endStr = end.toISOString().slice(0, 10)

    if (endStr < weekStart || startStr > weekEnd) continue

    const startIdx = Math.max(
      0,
      weekDates.findIndex((d) => d >= startStr),
    )
    const endIdx = Math.min(
      weekDates.length - 1,
      weekDates.findIndex((d) => d > endStr) === -1
        ? weekDates.length - 1
        : weekDates.findIndex((d) => d > endStr) - 1,
    )

    result.push({
      start: startIdx,
      size: Math.max(1, endIdx - startIdx + 1),
      event: e,
    })
  }

  return result
}

function badgeClasses(d: { event: CalendarEvent }) {
  return ['my-event', d.event.category === 'soft' ? 'bg-soft' : 'bg-hard']
}

function badgeStyles(d: { start: number; size: number }, weekLen: number) {
  const s: Record<string, string> = {}
  s.marginLeft = `${(100 / weekLen) * d.start}%`
  s.width = `${(100 / weekLen) * d.size}%`
  s.pointerEvents = 'auto'
  return s
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

    activity.activityItems?.forEach((item) => {
      // เพิ่มเงื่อนไขตรวจสอบ item ไม่เป็น undefined
      if (!item || !item.dates) return

      item.dates.forEach((d) => {
        parsed.push({
          id: parseInt(item.id?.toString().slice(-5) ?? '0', 16),
          activityName: activity.name || '-', // ชื่อกิจกรรมหลัก
          activityItemName: item.name || activity.name || '-', // fallback ถ้าไม่มีชื่อกิจกรรมย่อย
          category,
          date: d.date,
          time: `${d.stime} - ${d.etime}`,
          location: item.rooms?.[0] || '-',
          count: `${item.enrollmentCount ?? 0}/${item.maxParticipants ?? '-'}`,
          duration: 1,
        })
      })
    })
  })

  return parsed
}

onMounted(async () => {
  await data1()

  // หากวันนี้มี event ให้แสดงทางด้านขวาเลย
  if (selectedDate.value === todayDate.value) {
    const todayEvents = getEvents(todayDate.value)
    if (todayEvents.length > 0) {
      selectedEvents.value = todayEvents
    }
  }
})
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-md" style="margin-top: 20px">
      <div class="text-h4 q-mb-md">ตารางกิจกรรม</div>
    </div>

    <div class="row justify-end q-mb-md">
      <div class="row">
        <q-input
          dense
          outlined
          v-model="query1.search"
          label="ค้นหา ชื่อกิจกรรม"
          class="q-mr-sm searchbox"
          :style="{ border: 'none' }"
        >
          <template v-slot:append>
            <q-icon activityName="search" />
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
    <div class="row q-col-gutter-md calendar-wrapper">
      <div class="col-8">
        <q-calendar-month
          v-model="selectedDate"
          locale="th-TH"
          animated
          bordered
          :day-min-height="110"
          :day-class="() => 'bordered-day'"
          @click-date="onClickDate"
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
                  v-for="(eventData, idx) in getEventsForDay(scope.timestamp.date)"
                  :key="idx"
                  :class="badgeClasses(eventData)"
                  class="my-event"
                  @click.stop="selectEvent(eventData.event)"
                >
                  <div class="q-calendar__ellipsis">
                    {{ eventData.event.activityName }}
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #week="{ scope }">
            <div class="event-row">
              <template v-for="(eventData, index) in getWeekEvents(scope.week)" :key="index">
                <div
                  :class="badgeClasses(eventData)"
                  :style="badgeStyles(eventData, scope.week.length)"
                  class="my-event week-bar"
                  @click.stop="selectEvent(eventData.event)"
                >
                  <div class="q-calendar__ellipsis">
                    {{ eventData.event.activityName }}
                  </div>
                </div>
              </template>
            </div>
          </template>
        </q-calendar-month>
      </div>

      <div class="col-4">
        <div class="event-panel">
          <div class="text-h6 q-mb-sm">{{ formatThaiDate(selectedDate) }}</div>

          <template v-if="selectedEvents.length">
            <div
              v-for="(events, activityName) in groupedEvents"
              :key="activityName"
              class="q-mb-md"
            >
              <div class="text-weight-bold" style="font-size: 18px">
                {{ activityName }}
              </div>
              <div v-for="event in events" :key="event.id" class="q-mb-xs">
                <div class="text-weight-bold">
                  {{ event.activityItemName }}
                </div>
                <div class="q-mt-xs">{{ event.time }}</div>
                <div>จำนวนลงทะเบียน : {{ event.count }}</div>
                <div>สถานที่ : {{ event.location }}</div>
                <q-separator class="q-my-sm" />
              </div>
            </div></template>
          <template v-if="Object.keys(searchResults).length">
            <div
              v-for="(events, activityName) in searchResults"
              :key="activityName"
              class="q-mb-md"
            >
              <div class="text-subname1 text-weight-bold">
                <span class="float-right text-grey-7">
                  {{ events[0]?.category === 'soft' ? 'Soft Skill' : 'Hard Skill' }}
                </span>
              </div>

              <div class="text-weight-bold" style="font-size: 18px">
                {{ activityName }}
              </div>
              <div v-for="event in events" :key="event.id" class="q-mb-xs">
                <div class="text-weight-bold">
                  {{ event.activityItemName }}
                </div>
                <div class="q-mt-xs">{{ event.time }}</div>
                <div>จำนวนลงทะเบียน : {{ event.count }}</div>
                <div>สถานที่ : {{ event.location }}</div>
                <q-separator class="q-my-sm" />
              </div>

            </div>
          </template>

          <div v-else class="text-grey">ไม่มีข้อมูลกิจกรรมในวันนี้</div>
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
  font-size: 12px;
  height: 20px;
  padding: 2px 4px;
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}

.bg-soft {
  background-color: #027be3;
}

.bg-hard {
  background-color: #e53935;
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

.event-row {
  position: absolute;
  top: 28px;
  display: flex;
  flex-wrap: wrap;
  pointer-events: none;
}

.week-bar {
  height: 22px;
  margin-top: 2px;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: auto;
  z-index: 1;
}

.is-today .day-number {
  border: 2px solid #e37c41;
  color: #e37c41;
}

.is-selected .day-number {
  background-color: #e37c41;
  color: white;
}

.event-panel {
  max-height: 580px;
  overflow-y: scroll;
  padding-right: 8px;
  scrollbar-width: none; /* สำหรับ Firefox */
}

/* สำหรับ Chrome, Edge, Safari */
.event-panel::-webkit-scrollbar {
  display: none;
}
</style>
