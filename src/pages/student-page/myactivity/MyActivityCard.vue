<template>
  <q-card class="activity-card q-pa-md col-12" @click="onClick(myActivity.id!)">
    <div class="row no-wrap items-center">
      <!-- รูปกิจกรรม -->
      <div class="col-2">
        <q-img :src="myActivity.file" class="activity-img" />
      </div>

      <!-- ข้อมูลกิจกรรม -->
      <div class="col-10 row items-center text-h7">
        <div class="col-5">
          <q-item-label class="activity-name text-bold">{{ myActivity.name }}</q-item-label>
        </div>
        <!-- ActivityType -->
        <div class="col-2 justify-between">
          <ActivityType v-if="myActivity.skill" :skill="myActivity.skill" class="q-ml-md" />
          <!-- <div class="q-mr-md col-4">{{ myActivity.skill }}</div> -->
        </div>
        <div class="row q-mt-sm col-5">
          <div class="q-mr-md col-5">{{ getActivitydates(myActivity.activityItems) }}</div>
          <div class="col-2 text-right">{{ getActivityRooms(myActivity.activityItems) }}</div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import ActivityType from '../myactivity/ActivityType.vue'
import type { Activity, ActivityItem } from 'src/types/activity'
defineProps<{ myActivity: Activity }>()
const router = useRouter()
const onClick = async (id: string) => {
  await router.push(`/Student/Activity/ActivityDetail/${id}`)
}
const getActivitydates = (activityItems: ActivityItem[] | null | undefined): string => {
  const firstItem = activityItems?.find((item) => item.dates && item.dates.length > 0)
  return firstItem?.dates
    ? firstItem.dates.map((d) => `${d.date} (${d.stime} - ${d.etime})`).join(', ')
    : 'ไม่ระบุ'
}

const getActivityRooms = (activityItems: ActivityItem[] | null | undefined): string => {
  if (!activityItems || activityItems.length === 0) return 'ไม่ระบุ'
  const rooms = activityItems[0]?.rooms
  return Array.isArray(rooms) && rooms.length > 0 ? rooms.join(', ') : 'ไม่ระบุ'
}
</script>

<style scoped>
/* ปรับขนาดการ์ด */
.activity-card {
  border-radius: 30px;
  height: 210px;
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

.details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.activity-name {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* จำกัดให้แสดง 2 บรรทัด */
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  width: 100%; /* ป้องกันไม่ให้เกินขอบเขต */
  padding-top: 5px; /* ป้องกันตัวอักษรถูกตัดด้านบน */
}
</style>
