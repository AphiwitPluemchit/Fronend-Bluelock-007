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
    <!-- แถว: ชื่อกิจกรรม -->
    <div class="row">
      <div class="col-3 text-right">
        <div class="q-mb-lg q-ml-md">ชื่อกิจกรรม :</div>
      </div>
      <div class="col-9">
        <div class="q-mb-lg q-ml-md">{{ activity?.name ?? 'ไม่ระบุ' }}</div>
      </div>
    </div>

    <!-- แถว: วันที่จัดกิจกรรม -->
    <div class="row">
      <div class="col-3 text-right">
        <div class="q-mb-lg q-ml-md">วันที่จัดกิจกรรม :</div>
      </div>
      <div class="col-9">
        <div class="q-mb-lg q-ml-md">{{ getActivitydates(activity?.activityItems) }}</div>
      </div>
    </div>

    <!-- แถว: เวลาที่จัดกิจกรรม -->
    <div class="row">
      <div class="col-3 text-right">
        <div class="q-mb-lg q-ml-md">เวลาที่จัดกิจกรรม :</div>
      </div>
      <div class="col-9">
        <div class="q-mb-lg q-ml-md">{{ getActivityTime(activity?.activityItems) }}</div>
      </div>
    </div>

    <!-- แถว: ประเภทกิจกรรม -->
    <div class="row">
      <div class="col-3 text-right">
        <div class="q-mb-lg q-ml-md">ประเภทกิจกรรม :</div>
      </div>
      <div class="col-9">
        <div class="q-mb-lg q-ml-md">
          {{
            activity?.skill === 'hard'
              ? 'ชั่วโมงทักษะทางวิชาการ'
              : activity?.skill === 'soft'
                ? 'ชั่วโมงทักษะเตรียมความพร้อม'
                : 'ไม่ระบุประเภท'
          }}
        </div>
      </div>
    </div>

    <!-- แถว: สถานที่จัดกิจกรรม -->
    <div class="row">
      <div class="col-3 text-right">
        <div class="q-mb-lg q-ml-md">สถานที่จัดกิจกรรม :</div>
      </div>
      <div class="col-9">
        <div class="q-mb-lg q-ml-md">{{ getActivityRooms(activity?.activityItems) }}</div>
      </div>
    </div>

    <!-- แถว: จำนวนชั่วโมง -->
    <div class="row">
      <div class="col-3 text-right">
        <div class="q-mb-lg q-ml-md">จำนวนชั่วโมงที่ได้รับ :</div>
      </div>
      <div class="col-9">
        <div class="q-mb-lg q-ml-md">{{ getActivityHours(activity?.activityItems) }} ชั่วโมง</div>
      </div>
    </div>

    <!-- แถว: จำนวนที่ลงทะเบียน -->
    <div class="row">
      <div class="col-3 text-right">
        <div class="q-mb-lg q-ml-md">จำนวนที่ลงทะเบียน :</div>
      </div>
      <div class="col-9">
        <div class="q-mb-lg q-ml-md">
          <!-- ถ้าจะรวมจากหลายรอบ ควรเปลี่ยน logic -->
          {{ getActivityEnrollments(activity?.activityItems) }}
        </div>
      </div>
    </div>

    <!-- แถว: วิทยากร -->
    <div class="row">
      <div class="col-3 text-right">
        <div class="q-mb-lg q-ml-md">วิทยากร :</div>
      </div>
      <div class="col-9">
        <div class="q-mb-lg q-ml-md">{{ getActivityOperator(activity?.activityItems) }}</div>
      </div>
    </div>

    <!-- แถว: รายละเอียด -->
    <div class="row">
      <div class="col-3 text-right">
        <div class="q-mb-lg q-ml-md">รายละเอียดอื่น ๆ :</div>
      </div>
      <div class="col-9">
        <div class="q-mb-lg q-ml-md">{{ getActivityDetail(activity?.activityItems) }}</div>
      </div>
    </div>
  </q-list>
</template>
