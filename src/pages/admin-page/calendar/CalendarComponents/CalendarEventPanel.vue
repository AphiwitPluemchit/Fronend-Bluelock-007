<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { CalendarEvent } from 'src/types/calendar'

const router = useRouter()

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

// สี ของ card program
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

const goToPageDetail = async (id: string, disable: boolean) => {
  await router.push({
    path: `/Admin/ProgramsManagement/ProgramDetail/${id}`,
    query: {
      disable: String(disable),
    },
  })
}
</script>

<template>
  <div class="event-panel">
    <!-- ค้นหาโครงการ -->
    <div v-if="searchQuery">
      <template v-if="groupedSearchResults && Object.keys(groupedSearchResults).length > 0">
        <div v-for="date in Object.keys(groupedSearchResults).sort()" :key="date">
          <div
            class="text-h6 q-mb-sm"
            :style="{
              marginTop:
                Object.keys(groupedSearchResults).sort().indexOf(date) !== 0 ? '30px' : '0',
            }"
          >
            {{ formatThaiDate(date) }}
          </div>
          <div v-for="event in groupedSearchResults[date]" :key="event.id" class="q-mb-sm">
            <q-card
              flat
              bordered
              class="q-pa-md q-mb-sm clickable-card"
              :style="`border-left: 5px solid ${getStatusColor(event.programState)}`"
              @click="emit('go-to-date', event.date)"
            >
              <div class="event-header-row">
                <div class="event-title">{{ event.programName }}</div>
                <div class="event-category">
                  {{ event.category === 'soft' ? 'Soft Skill' : 'Hard Skill' }}
                </div>
              </div>
              <div class="q-mt-xs">{{ event.programItemName }}</div>
              <div class="q-mt-xs">{{ event.time }}</div>
              <div class="q-mt-xs">จำนวนลงทะเบียน : {{ event.participants }}</div>
              <div class="event-footer-row">
                <div>สถานที่ : {{ event.location }}</div>
                <div class="action-buttons">
                  <q-icon
                    clickable
                    name="edit"
                    @click.stop="goToPageDetail(event.id as string, false)"
                    class="bg-primary text-white rounded-borders q-mr-sm edit-icon"
                    size="18px"
                  >
                    <q-tooltip>แก้ไข</q-tooltip>
                  </q-icon>
                  <q-icon
                    clickable
                    name="visibility"
                    @click="goToPageDetail(event.id as string, true)"
                    class="bg-black text-white rounded-borders view-icon"
                    size="18px"
                  >
                    <q-tooltip>ดูรายละเอียด</q-tooltip>
                  </q-icon>
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </template>

      <div v-else class="text-grey">ไม่พบโครงการที่ตรงกับคำค้นหา</div>
    </div>

    <!-- แสดงโครงการตามวันที่เลือก -->
    <div v-else>
      <div class="text-h6 q-mb-sm">{{ formatThaiDate(selectedDate) }}</div>

      <template v-if="selectedEvents.length">
        <div v-for="event in selectedEvents" :key="event.id" class="q-mb-sm">
          <q-card
            flat
            bordered
            class="q-pa-md q-mb-sm"
            :style="`border-left: 5px solid ${getStatusColor(event.programState)}`"
            @click="emit('go-to-date', event.date)"
          >
            <div class="event-header-row">
              <div class="event-title">{{ event.programName }}</div>
              <div class="event-category">
                {{ event.category === 'soft' ? 'Soft Skill' : 'Hard Skill' }}
              </div>
            </div>
            <div class="q-mt-xs">{{ event.programItemName }}</div>
            <div class="q-mt-xs">{{ event.time }}</div>
            <div class="q-mt-xs">จำนวนลงทะเบียน : {{ event.participants }}</div>
            <div class="event-footer-row">
              <div>สถานที่ : {{ event.location }}</div>
              <div class="action-buttons">
                <q-icon
                  clickable
                  name="edit"
                  @click.stop="goToPageDetail(event.id as string, false)"
                  class="bg-primary text-white rounded-borders q-mr-sm edit-icon"
                  size="18px"
                >
                  <q-tooltip>แก้ไข</q-tooltip>
                </q-icon>
                <q-icon
                  clickable
                  name="visibility"
                  @click="goToPageDetail(event.id as string, true)"
                  class="bg-black text-white rounded-borders view-icon"
                  size="18px"
                >
                  <q-tooltip>ดูรายละเอียด</q-tooltip>
                </q-icon>
              </div>
            </div>
          </q-card>
        </div>
      </template>

      <div v-else class="text-grey">ไม่มีข้อมูลโครงการในวันนี้</div>
    </div>
  </div>
</template>

<style scoped>
.event-panel {
  max-height: 630px;
  overflow-y: scroll;
  scrollbar-width: none; /* สำหรับ Firefox */
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
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
  margin-bottom: 5px;
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

.event-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1px;
}

.action-buttons {
  display: flex;
  align-items: end;
  flex-shrink: 0;
}

.edit-icon,
.view-icon {
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 880px) {
  .event-panel {
    max-height: 70vh;
  }
}
</style>
