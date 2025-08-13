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
</script>

<template>
  <q-card
    class="activity-card q-pa-md q-mt-sm q-mb-sm cursor-pointer"
    :class="{ 'clickable-card': !isMobile }"
    @click="!isMobile && onClick(myActivity.id!)"
  >
    <div class="row q-col-gutter-md items-start">
      <!-- รูปกิจกรรม -->
      <div :class="isMobile ? 'full-width' : 'col-4'">
        <q-img
          :src="baseurl + '/uploads/activity/images/' + myActivity.file"
          :ratio="4 / 3"
          style="max-height: 200px; object-fit: cover; border-radius: 12px"
          class="activity-img"
        />
      </div>

      <!-- ข้อมูลกิจกรรม -->
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
          {{ getActivitydates(myActivity.activityItems) }}
        </div>
        <div class="text-body2 q-mt-sm">
          <q-icon name="schedule" class="q-mb-xs" />
          {{ getActivityTime(myActivity.activityItems) }}
        </div>
        <div class="text-body2 q-mt-sm">
          <q-icon name="room" class="q-mb-xs" />
          {{ getActivityRooms(myActivity.activityItems) }}
        </div>

        <!-- ✅ ปุ่มรายละเอียด (เฉพาะมือถือ) -->
        <div v-if="isMobile" class="text-right full-width q-mt-sm">
          <q-btn
            label="รายละเอียด"
            dense
            unelevated
            class="btnconfirm"
            @click.stop="onClick(myActivity.id!)"
          />
        </div>
      </div>
    </div>
  </q-card>
</template>

<style scoped>
.activity-card {
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  background-color: #fff; /* สีปกติ */
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.clickable-card:hover {
  background-color: #f0f4ff; /* สีตอน hover */
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.outer-box {
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.inner-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: transparent; /* ไม่ต้อง fix สีในนี้ */
}

.activity-image-container {
  margin-bottom: 16px;
}

.activity-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.activity-button {
  margin-top: auto;
  padding-top: 16px;
}

@media (max-width: 600px) {
  .activity-img {
    height: 120px;
  }
}

@media (max-width: 400px) {
  .activity-img {
    height: 100px;
    border-radius: 8px;
  }
}

.btnconfirm {
  width: 100%;
}
</style>
