<script setup lang="ts">
import type { CalendarEvent } from 'src/types/calendar'

defineProps<{
  selectedDate: string
  selectedEvents: CalendarEvent[]
  searchQuery: string
  groupedSearchResults: Record<string, CalendarEvent[]> | null
}>()

const emit = defineEmits<{
  (e: 'go-to-date', date: string): void
}>()

function formatThaiDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
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
</script>

<template>
  <div class="event-panel">
    <!-- ค้นหากิจกรรม -->
    <div v-if="searchQuery">
      <template v-if="groupedSearchResults && Object.keys(groupedSearchResults).length > 0">
        <div v-for="date in Object.keys(groupedSearchResults).sort()" :key="date" class="q-mb-xl">
          <div class="text-h6 q-mb-sm">{{ formatThaiDate(date) }}</div>
          <div v-for="event in groupedSearchResults[date]" :key="event.id" class="q-mb-sm">
            <q-card
              flat
              bordered
              class="q-pa-md q-mb-sm clickable-card"
              :style="`border-left: 5px solid ${getStatusColor(event.activityState)}`"
              @click="emit('go-to-date', event.date)"
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

      <div v-else class="text-grey">ไม่พบกิจกรรมที่ตรงกับคำค้นหา</div>
    </div>

    <!-- แสดงกิจกรรมตามวันที่เลือก -->
    <div v-else>
      <div class="text-h6 q-mb-sm">{{ formatThaiDate(selectedDate) }}</div>

      <template v-if="selectedEvents.length">
        <div v-for="event in selectedEvents" :key="event.id" class="q-mb-sm">
          <q-card
            flat
            bordered
            class="q-pa-md q-mb-sm"
            :style="`border-left: 5px solid ${getStatusColor(event.activityState)}`"
            @click="emit('go-to-date', event.date)"
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
      </template>

      <div v-else class="text-grey">ไม่มีข้อมูลกิจกรรมในวันนี้</div>
    </div>
  </div>
</template>

<style scoped>
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

.q-card {
  border-radius: 12px;
  background-color: #fff;
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

.clickable-card {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
</style>