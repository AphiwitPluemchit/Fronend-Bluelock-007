<template>
  <q-card style="border-radius: 30px; height: 210px" class="q-pa-md q-ma-md activity-card">
    <div class="row q-pa-md items-stretch">
      <!-- รูปกิจกรรม -->
      <div class="col-md-4">
        <!-- <q-img
          :src="'http://localhost:8888/uploads/activity/images/' + activity.file"
          class="activity-img"
        /> -->
        <q-img :src="baseurl + '/uploads/activity/images/' + activity.file" class="activity-img" />
      </div>

      <!-- รายละเอียดกิจกรรม -->
      <div class="col-md-8 column justify-between text-h6">
        <div>
          <div class="content-wrapper q-mb-md">
            <q-item-label class="text-bold activity-name q-pt-sm">{{ activity.name }}</q-item-label>
          </div>
          <div class="positionText q-mb-md">
            <!-- แสดงวันที่ -->
            <q-item-label class="q-mb-md">
              {{ getActivitydates(activity.activityItems) }}
            </q-item-label>

            <!-- แสดงจำนวนที่นั่ง -->
            <q-item-label>
              จำนวนที่รับ {{ enrollmentSummary(activity.activityItems ?? []) }}
            </q-item-label>
          </div>
        </div>

        <!-- ปุ่มรายละเอียด -->
        <div class="q-mt-auto text-right">
          <q-btn
            label="รายละเอียด"
            dense
            unelevated
            class="detail-btn"
            :to="`/Student/Activity/ActivityDetail/${activity.id}`"
          />
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import type { Activity, ActivityItem } from 'src/types/activity'
import { api } from 'boot/axios'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
const baseurl = api.defaults.baseURL

dayjs.locale('th')
dayjs.extend(buddhistEra)
// รับ props
defineProps<{ activity: Activity }>()

// ฟังก์ชันจัดการรูปภาพ (เช็คว่า `file` มีค่าหรือไม่)
// const getImageUrl = (fileName: string | undefined) => {
//   return fileName ? `/uploads/${fileName}` : '/icons/default-image.png'
// }

function formatDateToThai(dateString: string, stime: string, etime: string): string {
  if (!dateString) return '-'

  // แปลงวันที่และเวลาเป็นรูปแบบ 'วัน เดือน ปี พ.ศ. (เวลาเริ่ม - เวลาสิ้นสุด)'
  return dayjs(dateString).format('D MMMM BBBB') + ` (${stime} - ${etime})`
}

// ฟังก์ชันดึงวันที่จาก `activityItems`
// const getActivitydates = (activityItems: ActivityItem[] | null | undefined): string => {
//   if (!activityItems || activityItems.length === 0 || !activityItems[0]?.dates) {
//     return 'ไม่ระบุ'
//   }

//   return (
//     activityItems[0].dates?.map((d) => `${d.date} (${d.stime} - ${d.etime})`).join(', ') ??
//     'ไม่ระบุ'
//   )
// }

// ฟังก์ชันดึงวันที่จาก `activityItems`
const getActivitydates = (activityItems: ActivityItem[] | null | undefined): string => {
  if (!activityItems || activityItems.length === 0 || !activityItems[0]?.dates) {
    return 'ไม่ระบุ'
  }

  // ใช้ formatDateToThai เพื่อแปลงวันที่และเวลา
  const firstDate = activityItems[0].dates[0]?.date // เลือกวันที่แรก
  const stime = activityItems[0].dates[0]?.stime // เวลาที่เริ่ม
  const etime = activityItems[0].dates[0]?.etime // เวลาที่สิ้นสุด

  return firstDate ? formatDateToThai(firstDate, stime ?? '', etime ?? '') : 'ไม่ระบุ' // แสดงวันที่แรกพร้อมเวลา
}

function enrollmentSummary(activityItems: ActivityItem[]) {
  if (!activityItems || activityItems.length === 0) return '-'
  // คํานวณจํานวนลงทะเบียน
  const totalEnrolled = activityItems.reduce(
    (total, item) => total + (item.enrollmentCount || 0),
    0,
  )
  // คํานวณจํานวนรับทะเบียน
  const totalAccepted = activityItems.reduce(
    (total, item) => total + (item.maxParticipants ?? 0),
    0,
  )

  return `${totalEnrolled}/${totalAccepted}`
}
</script>

<style scoped>
/* ปรับขนาดการ์ด */
.activity-card {
  border-radius: 30px;
  min-height: 120px;
  display: flex;
  align-items: center;
  font-size: 18px;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
}

.activity-img {
  width: 90%; /* Full width of the container */
  height: auto; /* Maintain aspect ratio */
  object-fit: cover; /* Cover the container, cropping as needed */
  border-radius: 8px; /* Optional border radius for rounded corners */
  aspect-ratio: 4 / 3; /* Maintain 4:3 aspect ratio */
}

.detail-btn {
  border-radius: 15px;
  font-weight: bold;
  padding: 6px 12px;
  font-size: 18px;
  background-color: #3676f4;
  color: white;
  position: absolute;
  bottom: 25px;
  right: 30px;
}
.activity-name {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* แสดงแค่ 2 บรรทัด */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis; /* ใช้ ... เมื่อข้อความยาวเกิน */
  width: 100%; /* กำหนดความกว้างให้เต็มพื้นที่ */
  line-clamp: 2;
}
</style>
