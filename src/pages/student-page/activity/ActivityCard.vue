<script setup lang="ts">
import type { Activity, ActivityItem } from 'src/types/activity'
import { api } from 'boot/axios'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import { useQuasar } from 'quasar'
import { computed } from 'vue'
import ActivityType from './component/ActivityType.vue'

const baseurl = api.defaults.baseURL
const $q = useQuasar()
const isMobile = computed(() => $q.screen.lt.sm)

dayjs.locale('th')
dayjs.extend(buddhistEra)

defineProps<{ activity: Activity }>()

function getActivityDate(activityItems: ActivityItem[] | null | undefined): string {
  if (!activityItems || activityItems.length === 0 || !activityItems[0]?.dates) {
    return 'ไม่ระบุ'
  }

  const firstDate = activityItems[0].dates[0]?.date
  return firstDate ? dayjs(firstDate).format('D MMMM BBBB') : 'ไม่ระบุ'
}

function getActivityTime(activityItems: ActivityItem[] | null | undefined): string {
  if (!activityItems || activityItems.length === 0 || !activityItems[0]?.dates) {
    return '-'
  }

  const stime = activityItems[0].dates[0]?.stime ?? ''
  const etime = activityItems[0].dates[0]?.etime ?? ''
  return stime && etime ? `${stime} - ${etime}` : '-'
}

function enrollmentSummary(activityItems: ActivityItem[]) {
  if (!activityItems || activityItems.length === 0) return '-'
  const totalEnrolled = activityItems.reduce(
    (total, item) => total + (item.enrollmentCount || 0),
    0,
  )
  const totalAccepted = activityItems.reduce(
    (total, item) => total + (item.maxParticipants ?? 0),
    0,
  )
  return `${totalEnrolled}/${totalAccepted}`
}
</script>

<template>
  <q-card
    class="activity-card col-12 col-sm-6 col-md-4 q-pa-md q-my-sm cursor-pointer"
    :class="{ 'clickable-card': !isMobile }"
    @click="!isMobile && $router.push(`/Student/Activity/ActivityDetail/${activity.id}`)"
  >
    <div class="row q-col-gutter-md items-start">
      <!-- รูปกิจกรรม -->
      <div :class="isMobile ? 'full-width' : 'col-4'">
        <q-img
          :src="baseurl + '/uploads/activity/images/' + activity.file"
          class="activity-img"
          style="max-height: 200px; object-fit: cover; border-radius: 12px"
          :ratio="4 / 3"
        />
      </div>

      <!-- รายละเอียดกิจกรรม -->
      <div class="col-12 col-sm-8 column justify-between q-pl-md">
        <div class="text-h6 text-bold ellipsis-2-lines">
          {{ activity.name }}
        </div>

        <div class="q-mb-sm">
          <ActivityType
            v-if="activity.skill === 'hard' || activity.skill === 'soft'"
            :skill="activity.skill === 'hard' ? 'hardSkill' : 'softSkill'"
          />
        </div>

        <div class="text-subtitle2 q-mb-sm">
          <q-icon name="event" class="q-mb-xs" />
          วันที่จัด : {{ getActivityDate(activity.activityItems) }}
        </div>
        <div class="text-subtitle2 q-mb-sm">
          <q-icon name="schedule" class="q-mb-xs" />
          เวลาที่จัด : {{ getActivityTime(activity.activityItems) }}
        </div>
        <div class="text-subtitle2 q-mb-sm">
          <q-icon name="chair" class="q-mb-xs" />
          จำนวนที่รับ : {{ enrollmentSummary(activity.activityItems ?? []) }}
        </div>

        <!-- ✅ ปุ่มรายละเอียดเฉพาะจอมือถือ -->
        <div v-if="isMobile" class="q-mt-sm">
          <q-btn
            label="รายละเอียด"
            dense
            unelevated
            class="btnconfirm full-width"
            color="btnconfirm"
            @click.stop="$router.push(`/Student/Activity/ActivityDetail/${activity.id}`)"
          />
        </div>
      </div>
    </div>
  </q-card>
</template>

<style scoped>
.activity-card {
  border-radius: 20px;
  font-size: 16px;
  padding: 12px;
  margin: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 100%;
  height: auto;
  min-height: 200px;
}

.activity-img {
  width: 100%;
  height: 100%;
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
    min-height: 280px;
    padding: 12px;
    font-size: 15px;
    border-radius: 16px;
  }

  .activity-img {
    max-height: 120px;
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
}

.btnconfirm {
  width: 100%;
}
</style>
