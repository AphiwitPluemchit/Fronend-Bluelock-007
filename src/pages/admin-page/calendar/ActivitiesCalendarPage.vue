<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { today } from '@quasar/quasar-ui-qcalendar'
import type { Timestamp } from '@quasar/quasar-ui-qcalendar'
import '@quasar/quasar-ui-qcalendar/dist/index.css'
import { QCalendarMonth } from '@quasar/quasar-ui-qcalendar'
import type { Activity } from 'src/types/activity'
import type { ActivityPagination } from 'src/types/pagination'
import { ActivityService } from 'src/services/activity'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'

const activitys1 = ref<Activity[]>([])
const showFilterDialog1 = ref(false)
const filterCategories = ref(['year', 'major', 'statusActivity', 'categoryActivity'])

const query1 = ref<ActivityPagination>({
  page: 1,
  limit: 1000,
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
  pagination1.value.descending = query1.value.order === 'desc'

  activitys1.value = data.data
  calendarEvents.value = parseToCalendarEvents(data.data)
}

const applyFilters1 = async (selectedFilters: SelectedFilters) => {
  query1.value.studentYear = selectedFilters.year.map(Number)
  query1.value.major = selectedFilters.major
  query1.value.activityState = selectedFilters.statusActivity
  query1.value.skill = selectedFilters.categoryActivity
  await data1()
}

interface CalendarEvent {
  id: number
  name: string
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

function parseToCalendarEvents(activities: Activity[]) {
  const parsed: CalendarEvent[] = []

  activities.forEach((activity) => {
    const category = activity.skill === 'soft' ? 'soft' : 'hard'

    activity.activityItems?.forEach((item) => {
      if (!item?.id) return

      const idStr = (item.id as { toString: () => string }).toString()

      item.dates?.forEach((d) => {
        parsed.push({
          id: parseInt(idStr.slice(-5), 16),
          name: item.name || activity.name || '-',
          category,
          date: d.date,
          time: `${d.stime} - ${d.etime}`,
          location: item.rooms?.[0] || '-',
          count: `${item.enrollmentCount ?? 0}`,
          duration: 1,
        })
      })
    })
  })

  return parsed
}

onMounted(async () => {
  await data1()
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
                  {{ eventData.event.name }}
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
                  <div class="q-calendar__ellipsis">{{ eventData.event.name }}</div>
                </div>
              </template>
            </div>
          </template>
        </q-calendar-month>
      </div>

      <div class="col-4">
        <div class="text-h6 q-mb-sm">{{ formatThaiDate(selectedDate) }}</div>
        <template v-if="selectedEvents.length">
          <div v-for="event in selectedEvents" :key="event.id" class="q-mb-md">
            <div class="text-subname1 text-weight-bold">
              {{ event.time }}
              <span class="float-right text-grey-7">
                {{ event.category === 'soft' ? 'Soft Skill' : 'Hard Skill' }}
              </span>
            </div>
            <div>{{ event.name }}</div>
            <div>จำนวนลงทะเบียน: {{ event.count }}</div>
            <div>สถานที่: {{ event.location }}</div>
            <q-separator class="q-my-sm" />
          </div>
        </template>
        <div v-else class="text-grey">ไม่มีข้อมูลกิจกรรมในวันนี้</div>
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
  font-size: 13px;
  font-weight: bold;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
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
  left: 0;
  right: 0;
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
</style>
