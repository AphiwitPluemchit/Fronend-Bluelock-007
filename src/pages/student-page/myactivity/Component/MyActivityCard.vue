<template>
  <q-card class="activity-card q-pa-md col-12" @click="onClick(myActivity.id!)">
    <div class="row no-wrap items-center">
      <!-- รูปกิจกรรม -->
      <div class="col-2">
        <!-- <img
        v-if="previewUrl || serverImageUrl"
        :src="(previewUrl || serverImageUrl) ?? ''"
        alt="Image preview"
        class="preview-img"
      /> -->
        <!-- <q-img
          :src="'http://localhost:8888/uploads/activity/images/' + myActivity.file"
          class="activity-img"
        /> -->
        <q-img
          :src="baseurl + '/uploads/activity/images/' + myActivity.file"
          class="activity-img"
        />
      </div>

      <!-- ข้อมูลกิจกรรม -->
      <div class="col-10 row items-center text-h7">
        <div class="col-5">
          <q-item-label class="activity-name text-bold">{{ myActivity.name }}</q-item-label>
        </div>
        <!-- ActivityType -->
        <div class="col-2 justify-between">
          <ActivityType
            v-if="myActivity.skill === 'hard' || myActivity.skill === 'soft'"
            :skill="myActivity.skill === 'hard' ? 'hardSkill' : 'softSkill'"
          />
        </div>
        <div class="row q-mt-sm col-4">
          <div class="q-mr-md col-4">{{ getActivitydates(myActivity.activityItems) }}</div>
          <div class="q-mr-md col-4 text-right">
            {{ getActivityTime(myActivity.activityItems) }}
          </div>
          <div class="col-3 text-right">{{ getActivityRooms(myActivity.activityItems) }}</div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import ActivityType from './ActivityType.vue'
import type { Activity, ActivityItem } from 'src/types/activity'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'

dayjs.locale('th')
dayjs.extend(buddhistEra)

function formatDateToThai(dateString: string): string {
  if (!dateString) return '-'
  return dayjs(dateString).format('D MMMM BBBB') // D = วัน, MMM = เดือน, BBBB = ปี พ.ศ.
}

// ฟังก์ชันดึงวันที่
const getActivitydates = (activityItems: ActivityItem[] | null | undefined): string => {
  const firstItem = activityItems?.find((item) => item.dates && item.dates.length > 0)
  return firstItem?.dates
    ? firstItem.dates.map((d) => formatDateToThai(d.date)).join(' ')
    : 'ไม่ระบุ'
}

// ฟังก์ชันดึงเวลา
const getActivityTime = (activityItems: ActivityItem[] | null | undefined): string => {
  const firstItem = activityItems?.find((item) => item.dates && item.dates.length > 0)
  return firstItem?.dates
    ? firstItem.dates.map((d) => `${d.stime} - ${d.etime}`).join(' ')
    : 'ไม่ระบุ'
}

defineProps<{ myActivity: Activity }>()
const router = useRouter()
const baseurl = api.defaults.baseURL
const onClick = async (id: string) => {
  await router.push(`/Student/Activity/MyActivityDetail/${id}`)
}

const getActivityRooms = (activityItems: ActivityItem[] | null | undefined): string => {
  if (!activityItems || activityItems.length === 0) return 'ไม่ระบุ'
  const rooms = activityItems[0]?.rooms
  return Array.isArray(rooms) && rooms.length > 0 ? rooms.join(' ') : 'ไม่ระบุ'
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
  width: 90%; /* Full width of the container */
  height: auto; /* Maintain aspect ratio */
  object-fit: cover; /* Cover the container, cropping as needed */
  border-radius: 8px; /* Optional border radius for rounded corners */
  aspect-ratio: 4 / 3; /* Maintain 4:3 aspect ratio */
  margin: 10px;
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
