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
    class="activity-card cursor-pointer"
    :class="{ 'clickable-card': !isMobile }"
    @click="!isMobile && $router.push(`/Student/Activity/ActivityDetail/${activity.id}`)"
  >
    <q-card-section class="outer-box">
      <div class="inner-box">
        <!-- รูปกิจกรรม -->
        <div class="activity-image-container">
          <q-img
            :src="baseurl + '/uploads/activity/images/' + activity.file"
            class="activity-img"
            :ratio="4 / 3"
          />
        </div>

        <!-- รายละเอียดกิจกรรม -->
        <div class="activity-content">
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
        </div>

        <!-- ✅ ปุ่มรายละเอียดเฉพาะจอมือถือ -->
        <div v-if="isMobile" class="activity-button">
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
    </q-card-section>
  </q-card>
</template>

<style scoped>
.activity-card {
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

.clickable-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clickable-card:hover {
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
  border-radius: 12px;
  background: #fff;
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
