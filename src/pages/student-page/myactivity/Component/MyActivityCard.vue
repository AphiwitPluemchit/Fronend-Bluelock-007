<script setup lang="ts">
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import ActivityType from './ActivityType.vue'
import type { Activity, ActivityItem } from 'src/types/activity'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import { computed } from 'vue'
import { useQuasar } from 'quasar'

dayjs.locale('th')
dayjs.extend(buddhistEra)

const $q = useQuasar()
const isMobile = computed(() => $q.screen.lt.sm)

function formatDateToThai(dateString: string): string {
  if (!dateString) return '-'
  return dayjs(dateString).format('D MMMM BBBB')
}

const getActivitydates = (activityItems: ActivityItem[] | null | undefined): string => {
  const firstItem = activityItems?.find((item) => item.dates && item.dates.length > 0)
  return firstItem?.dates
    ? firstItem.dates.map((d) => formatDateToThai(d.date)).join(' ')
    : 'ไม่ระบุ'
}

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

// const getActivityDescription = (activityItems: ActivityItem[] | null | undefined): string => {
//   if (!activityItems || activityItems.length === 0) return 'ไม่ระบุ'
//   const desc = activityItems[0]?.description
//   return Array.isArray(desc) && desc.length > 0 ? desc.join(' ') : 'ไม่ระบุ'
// }
</script>

<template>
  <q-card class="activity-card q-pa-md q-mt-sm q-mb-sm">
    <div class="row q-col-gutter-md items-start">
      <!-- รูปกิจกรรม -->
      <div :class="isMobile ? 'full-width' : 'col-4'">
        <q-img
          :src="baseurl + '/uploads/activity/images/' + myActivity.file"
          :ratio="4 / 3"
              style="max-height: 200px; object-fit: cover; border-radius: 12px;"
          class="activity-img"
        />
      </div>

      <!-- ข้อมูลกิจกรรม + ปุ่ม -->
      <div class="col-12 col-sm-8 column justify-between">
        <div>
          <div class="text-h6 text-bold activity-name">
            {{ myActivity.name }}
          </div>
          <div class="side top q-mt-xs">
            <ActivityType
              v-if="myActivity.skill === 'hard' || myActivity.skill === 'soft'"
              :skill="myActivity.skill === 'hard' ? 'hardSkill' : 'softSkill'"
            />
          </div>
        </div>

        <div class="text-body2 q-mt-sm">
          <q-icon name="event" class="q-mb-xs" />
          วันที่ : {{ getActivitydates(myActivity.activityItems) }}
        </div>
        <div class="text-body2">
          <q-icon name="schedule" class="q-mb-xs" />
          เวลา : {{ getActivityTime(myActivity.activityItems) }}
        </div>
        <div class="text-body2">
          <q-icon name="room" class="q-mb-xs" />

          ห้อง : {{ getActivityRooms(myActivity.activityItems) }}
        </div>


        <!-- ปุ่มรายละเอียด -->
      <div class="text-right full-width q-mt-sm">
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
  margin: 12px 0;
  padding: 16px;
  border-radius: 20px;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.activity-img {
  width: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.activity-name {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-height: 1.4em;
  max-height: calc(1.4em * 2);
  word-break: break-word;
  font-size: 1rem;
}

.btnconfirm {
  background-color: #2e74ff;
  color: white;
  border-radius: 8px;
  padding: 6px 16px;
}

@media (max-width: 600px) {
  .btnconfirm {
    width: 100%;
    text-align: center;
  }

  .activity-card {
    min-height: 280px;
    padding: 12px;
    font-size: 15px;
    border-radius: 16px;
    margin: 4px 0;
  }
}

@media (max-width: 400px) {
  .activity-card {
    padding: 10px;
    font-size: 14px;
    border-radius: 12px;
  }

  .activity-name {
    font-size: 14px;
    -webkit-line-clamp: 2;
    max-height: 2.8em;
  }

  .btnconfirm {
    font-size: 13px;
    padding: 6px 12px;
    width: 100%;
  }
}
</style>
