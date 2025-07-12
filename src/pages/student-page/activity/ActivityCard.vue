<template>
  <q-card class="activity-card col-12 col-sm-6 col-md-4 q-pa-md q-my-sm">
    <!-- ... -->
    <div :class="isMobile ? 'column' : 'row items-center'">
      <!-- รูปกิจกรรม -->
      <div :class="isMobile ? 'full-width q-mb-sm' : 'col-4 q-pr-md'">
        <q-img
          :src="baseurl + '/uploads/activity/images/' + activity.file"
          class="activity-img"
          :ratio="4 / 3"
        />
      </div>

      <!-- รายละเอียดกิจกรรม -->
      <div class="col column justify-between" style="min-width: 0">
        <div class="text-h6 text-bold q-mb-sm activity-name">
          {{ activity.name }}
        </div>
        <div class="text-subtitle2 q-mb-sm">
          {{ getActivitydates(activity.activityItems) }}
        </div>
        <div class="q-mb-md">จำนวนที่รับ {{ enrollmentSummary(activity.activityItems ?? []) }}</div>
      </div> 
      <!-- ปุ่มรายละเอียด -->
      <div class="text-right full-width q-mt-sm">
        <q-btn
          label="รายละเอียด"
          dense
          unelevated
          class="btnconfirm"
          :to="`/Student/Activity/ActivityDetail/${activity.id}`"
        />
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
import { useQuasar } from 'quasar'
import { computed } from 'vue'
const baseurl = api.defaults.baseURL
const $q = useQuasar()
//const isMobile = computed(() => $q.screen.lt.md)
const isMobile = computed(() => $q.screen.lt.sm) // sm = <600px

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
.activity-card {
  border-radius: 20px;
  font-size: 16px;
  padding: 12px; /* ปรับให้เล็กลง */
  margin: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 100%;
  height: auto; /* ปรับให้สูงตามเนื้อหา */
  min-height: unset; /* ยกเลิก min-height */
}



.activity-img {
  width: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.activity-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  width: 100%;
  font-size: 15px;
}






@media (max-width: 600px) {
  .activity-card {
    min-height: 280px; /* เพิ่มความสูงให้พอดีกับ layout mobile */
    padding: 12px;
    font-size: 15px;
    border-radius: 16px;
  }

  .activity-img {
    max-height: 120px;
  }

  .btnconfirm {
    width: 100%; /* ให้ปุ่มขนาดเต็ม */
  }
}

@media (max-width: 400px) {
  .activity-card {
    padding: 10px;
    font-size: 14px;
    border-radius: 12px;
  }

  .activity-img {
    max-height: 100px;
    border-radius: 8px;
  }

  .activity-name {
    font-size: 14px;
  }

  .btnconfirm {
    font-size: 13px;
    padding: 6px 12px;
    width: 100%;
  }
}



</style>
