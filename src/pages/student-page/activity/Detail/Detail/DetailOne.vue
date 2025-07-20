<script setup lang="ts">
import type { Activity, ActivityItem } from 'src/types/activity'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
dayjs.locale('th')
dayjs.extend(buddhistEra)
defineProps<{ activity: Activity }>()
// ฟังก์ชันดึงวันที่
// const getActivitydates = (activityItems: ActivityItem[] | null | undefined): string => {
//   if (!activityItems || activityItems.length === 0 || !activityItems[0]?.dates) {
//     return 'ไม่ระบุ'
//   }

//   // ใช้ formatDateToThai เพื่อแปลงวันที่
//   const firstDate = activityItems[0].dates[0]?.date // เลือกวันที่แรก
//   return firstDate ? formatDateToThai(firstDate) : 'ไม่ระบุ' // แสดงวันที่แรกในรูปแบบที่ต้องการ
// }
const getActivitydates = (activityItems: ActivityItem[] | null | undefined): string => {
  const firstItem = activityItems?.find((item) => item.dates && item.dates.length > 0)
  return firstItem?.dates
    ? firstItem.dates.map((d) => formatDateToThai(d.date)).join(', ')
    : 'ไม่ระบุ'
}
// ฟังก์ชันดึงเวลา
const getActivityTime = (activityItems: ActivityItem[] | null | undefined): string => {
  const firstItem = activityItems?.find((item) => item.dates && item.dates.length > 0)
  return firstItem?.dates
    ? firstItem.dates.map((d) => `${d.stime} - ${d.etime}`).join(', ')
    : 'ไม่ระบุ'
}

function formatDateToThai(dateString: string): string {
  if (!dateString) return '-'
  return dayjs(dateString).format('D MMMM BBBB') // D = วัน, MMM = เดือน, BBBB = ปี พ.ศ.
}

// ฟังก์ชันดึงจำนวนชั่วโมง
const getActivityHours = (activityItems: ActivityItem[] | null | undefined): string => {
  return activityItems?.reduce((total, item) => total + (item.hour ?? 0), 0).toString() ?? '0'
}
// ฟังก์ชันดึงรายชื่อห้องกิจกรรม
const getActivityRooms = (activityItems: ActivityItem[] | null | undefined): string => {
  if (!activityItems || activityItems.length === 0) return 'ไม่ระบุ'
  const rooms = activityItems[0]?.rooms
  return Array.isArray(rooms) && rooms.length > 0 ? rooms.join(', ') : 'ไม่ระบุ'
}
const getActivityEnrollments = (activityItems: ActivityItem[] | null | undefined): string => {
  if (!activityItems) return 'ไม่ระบุ'
  const total = activityItems.reduce((sum, item) => sum + (item.enrollmentCount ?? 0), 0)
  const max = activityItems.reduce((sum, item) => sum + (item.maxParticipants ?? 0), 0)
  return `${total} / ${max}`
}

const getActivityOperator = (activityItems: ActivityItem[] | null | undefined): string => {
  const firstItem = activityItems?.[0]
  return firstItem?.operator || 'ไม่ระบุ'
}

const getActivityDetail = (activityItems: ActivityItem[] | null | undefined): string => {
  const firstItem = activityItems?.[0]
  return firstItem?.description || 'ไม่มีรายละเอียดเพิ่มเติม'
}
</script>

<template>
  <q-list dense>
    <div class="field-pair">
      <div class="field-label">ชื่อกิจกรรม : </div>
      <div class="field-value">{{ activity?.name ?? 'ไม่ระบุ' }}</div>
    </div>

    <div class="field-pair">
      <div class="field-label">วันที่จัดกิจกรรม : </div>
      <div class="field-value">{{ getActivitydates(activity?.activityItems) }}</div>
    </div>

    <div class="field-pair">
      <div class="field-label">เวลาที่จัดกิจกรรม : </div>
      <div class="field-value">{{ getActivityTime(activity?.activityItems) }}</div>
    </div>

    <div class="field-pair">
      <div class="field-label">ประเภทกิจกรรม : </div>
      <div class="field-value">
        {{
          activity?.skill === 'hard'
            ? 'ชั่วโมงทักษะทางวิชาการ'
            : activity?.skill === 'soft'
              ? 'ชั่วโมงทักษะเตรียมความพร้อม'
              : 'ไม่ระบุประเภท'
        }}
      </div>
    </div>

    <div class="field-pair">
      <div class="field-label">สถานที่จัดกิจกรรม : </div>
      <div class="field-value">{{ getActivityRooms(activity?.activityItems) }}</div>
    </div>

    <div class="field-pair">
      <div class="field-label">จำนวนชั่วโมงที่ได้รับ : </div>
      <div class="field-value">{{ getActivityHours(activity?.activityItems) }} ชั่วโมง</div>
    </div>

    <div class="field-pair">
      <div class="field-label">จำนวนที่ลงทะเบียน : </div>
      <div class="field-value">{{ getActivityEnrollments(activity?.activityItems) }}</div>
    </div>

    <div class="field-pair">
      <div class="field-label">วิทยากร : </div>
      <div class="field-value">{{ getActivityOperator(activity?.activityItems) }}</div>
    </div>

    <div class="field-pair">
      <div class="field-label">รายละเอียดอื่น ๆ : </div>
      <div class="field-value">{{ getActivityDetail(activity?.activityItems) }}</div>
    </div>
  </q-list>
</template>

<style scoped>
.field-pair {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

/* มือถือ: แสดงแนวตั้งเหมือนเดิม */
.field-label {
  font-weight: bold;
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.field-value {
  font-size: 16px;
  color: #555;
  word-break: break-word;
}

/* แสดงแนวนอนเฉพาะตอนจอใหญ่ */
@media (min-width: 768px) {
  .field-pair {
    flex-direction: row;
    align-items: baseline;
  }

  .field-label {
    width: 200px;
    text-align: right;
    margin-bottom: 0;
    padding-right: 8px;
    position: relative;
  }

  .field-label::after {
    position: absolute;
    right: 0;
  }

  .field-value {
    text-align: left;
    flex: 1;
  }
}
</style>


