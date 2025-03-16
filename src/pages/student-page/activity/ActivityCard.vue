<template>
  <q-card style="border-radius: 30px; height: 210px" class="q-pa-md q-ma-md activity-card">
    <div class="row q-pa-md items-stretch">
      <!-- รูปกิจกรรม -->
      <div class="col-md-4">
        <q-img :src="getImageUrl(activity.file)" class="rounded-borders activity-img" />
      </div>

      <!-- รายละเอียดกิจกรรม -->
      <div class="col-md-8 column justify-between text-h6">
        <div>
          <div class="content-wrapper q-mb-md">
            <q-item-label class="text-bold activity-name">{{ activity.name }}</q-item-label>
          </div>
          <div class="positionText q-mb-md">
            <!-- แสดงวันที่ -->
            <q-item-label class="q-mb-md">
              {{ getActivitydates(activity.activityItems) }}
            </q-item-label>

            <!-- แสดงจำนวนที่นั่ง -->
            <q-item-label>
              ที่นั่งว่าง {{ activity.activityItems?.[0]?.maxParticipants ?? 'N/A' }}/{{
                activity.activityItems?.[0]?.maxParticipants ?? 'N/A'
              }}
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

// รับ props
defineProps<{ activity: Activity }>()

// ฟังก์ชันจัดการรูปภาพ (เช็คว่า `file` มีค่าหรือไม่)
const getImageUrl = (fileName: string | undefined) => {
  return fileName ? `/uploads/${fileName}` : '/icons/default-image.png'
}

// ฟังก์ชันดึงวันที่จาก `activityItems`
const getActivitydates = (activityItems: ActivityItem[] | null | undefined): string => {
  if (!activityItems || activityItems.length === 0 || !activityItems[0]?.dates) {
    return 'ไม่ระบุ'
  }

  return (
    activityItems[0].dates?.map((d) => `${d.date} (${d.stime} - ${d.etime})`).join(', ') ?? 'ไม่ระบุ'
  )
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
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
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
</style>
