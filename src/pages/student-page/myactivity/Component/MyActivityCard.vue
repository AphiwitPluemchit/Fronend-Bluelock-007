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
const getActivityDescription = (activityItems: ActivityItem[] | null | undefined): string => {
  if (!activityItems || activityItems.length === 0) return 'ไม่ระบุ'
  const rooms = activityItems[0]?.description
  return Array.isArray(rooms) && rooms.length > 0 ? rooms.join(' ') : 'ไม่ระบุ'
}
</script>

<template>
  <q-card class="activity-card q-pa-md">
    <div class="row q-col-gutter-md items-start">
      <!-- รูปกิจกรรม -->
      <div class="col-12 col-sm-4">
        <q-img
          :src="baseurl + '/uploads/activity/images/' + myActivity.file"
          :ratio="4 / 3"
          class="activity-img"
        />
      </div>

      <!-- ข้อมูลกิจกรรม + ปุ่ม -->
      <div class="col-12 col-sm-8 column justify-between">
        <!-- ชื่อ + ประเภท -->
        <div class="row justify-between items-start">
          <div class="text-h6 text-bold ellipsis-2-lines">
            {{ myActivity.name }}
          </div>
          <ActivityType
            v-if="myActivity.skill === 'hard' || myActivity.skill === 'soft'"
            :skill="myActivity.skill === 'hard' ? 'hardSkill' : 'softSkill'"
          />
        </div>

        <!-- รายละเอียดกิจกรรม -->
        <div class="text-body2 q-mt-sm">
          วันที่ : {{ getActivitydates(myActivity.activityItems) }}
        </div>
        <div class="text-body2">เวลา : {{ getActivityTime(myActivity.activityItems) }}</div>
        <div class="text-body2">ห้อง : {{ getActivityRooms(myActivity.activityItems) }}</div>
        <div class="text-body2">
          รายละเอียด : {{ getActivityDescription(myActivity.activityItems) }}
        </div>

        <!-- ปุ่ม -->
        <div class="q-mt-sm self-end">
          <q-btn
            label="รายละเอียด"
            dense
            unelevated
            class="btnconfirm"
            @click="onClick(myActivity.id!)"
          />
        </div>
      </div>
    </div>
  </q-card>
</template>

<style scoped>
.activity-card {
  border-radius: 30px;
  font-size: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%; /* ทำให้ทุกใบสูงเท่ากัน */
}

.activity-img {
  border-radius: 12px;
  object-fit: cover;
  width: 100%;
  height: auto;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

@media (max-width: 600px) {
  .activity-img {
    height: 200px;
  }
}
</style>
