<template>
  <!-- รายละเอียดกิจกรรม -->
  <div class="q-pa-sm">
    <div class="row">
      <div class="col-3 text-right">
        <div class="q-mb-lg q-ml-md">ชื่อกิจกรรม :</div>
      </div>
      <div class="col-9">
        <div class="q-mb-lg q-ml-md">{{ activity?.name ?? 'ไม่ระบุ' }}</div>
      </div>
    </div>
    <div class="row">
      <div class="col-3 text-right">
        <div class="q-mb-lg q-ml-md">วันที่จัดกิจกรรม :</div>
      </div>
      <div class="col-9">
        <div class="q-mb-lg q-ml-md">{{ getActivitydates(activity?.activityItems) }}</div>
      </div>
    </div>
    <div class="row">
      <div class="col-3 text-right">
        <div class="q-mb-lg q-ml-md">เวลาที่จัดกิจกรรม :</div>
      </div>
      <div class="col-9">
        <div class="q-mb-lg q-ml-md">{{ getActivityTime(activity?.activityItems) }}</div>
      </div>
    </div>
    <div class="row">
      <div class="col-3 text-right">
        <div class="q-mb-lg q-ml-md">ประเภทกิจกรรม :</div>
      </div>
      <div class="col-9">
        <div class="q-mb-lg q-ml-md">
          {{
            activity?.skill === 'hard'
              ? 'ชั่วโมงทักษะทางวิชาการ'
              : activity?.skill === 'soft'
                ? 'ชั่วโมงทักษะเตรียมความพร้อม'
                : 'ไม่ระบุประเภท'
          }}
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-3 text-right">
        <div class="q-mb-lg q-ml-md">จำนวนกิจกรรม :</div>
      </div>
      <div class="col-9">
        <div class="q-mb-lg q-ml-md">{{ activity.activityItems?.length }}</div>
      </div>
    </div>

    <q-separator spaced />

    <!-- รายการรอบกิจกรรม -->
    <div v-for="item in activity.activityItems" :key="item.id || ''">
      <div class="row">
        <div class="col-3 text-right">
          <div class="q-mb-lg q-ml-md">ชื่อกิจกรรม :</div>
        </div>
        <div class="col-9">
          <div class="q-mb-lg q-ml-md">{{ item.name ?? 'ไม่ระบุ' }}</div>
        </div>
      </div>

      <div class="row">
        <div class="col-3 text-right">
          <div class="q-mb-lg q-ml-md">สถานที่ :</div>
        </div>
        <div class="col-9">
          <div class="q-mb-lg q-ml-md">
            {{ Array.isArray(item.rooms) ? item.rooms.join(', ') : (item.rooms ?? 'ไม่ระบุ') }}
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-3 text-right">
          <div class="q-mb-lg q-ml-md">จำนวนชั่วโมง :</div>
        </div>
        <div class="col-9">
          <div class="q-mb-lg q-ml-md">{{ item.hour ?? '-' }}</div>
        </div>
      </div>

      <div class="row">
        <div class="col-3 text-right">
          <div class="q-mb-lg q-ml-md">จำนวนที่ลง :</div>
        </div>
        <div class="col-9">
          <div class="q-mb-lg q-ml-md">
            {{ item.enrollmentCount ?? 'ไม่ระบุ' }}/{{ item.maxParticipants ?? 'ไม่ระบุ' }}
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-3 text-right">
          <div class="q-mb-lg q-ml-md">วิทยากร :</div>
        </div>
        <div class="col-9">
          <div class="q-mb-lg q-ml-md">{{ item.operator ?? 'ไม่ระบุ' }}</div>
        </div>
      </div>

      <div class="row">
        <div class="col-3 text-right">
          <div class="q-mb-lg q-ml-md">รายละเอียดอื่นๆ :</div>
        </div>
        <div class="col-9">
          <div class="q-mb-lg q-ml-md">{{ item.description ?? 'ไม่ระบุ' }}</div>
        </div>
      </div>

      <q-separator spaced />
    </div>
  </div>
</template>

<script setup lang="ts">
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

defineProps<{ activity: Activity }>()

// const getActivitydates = (activityItems: ActivityItem[] | null | undefined): string => {
//   const firstItem = activityItems?.find((item) => item.dates && item.dates.length > 0)
//   return firstItem?.dates
//     ? firstItem.dates.map((d) => `${d.date} (${d.stime} - ${d.etime})`).join(', ')
//     : 'ไม่ระบุ'
// }

// ฟังก์ชันดึงวันที่จาก `activityItems`
const getActivitydates = (activityItems: ActivityItem[] | null | undefined): string => {
  const firstItem = activityItems?.find((item) => item.dates && item.dates.length > 0)
  return firstItem?.dates
    ? firstItem.dates.map((d) => formatDateToThai(d.date)).join(', ')
    : 'ไม่ระบุ'
}

// ฟังก์ชันดึงเวลา
const getActivityTime = (activityItems: ActivityItem[] | null | undefined): string => {
  const firstItem = activityItems?.find((item) => item.dates && item.dates.length > 0)
  return firstItem?.dates
    ? firstItem.dates.map((d) => `${d.stime} - ${d.etime}`).join(', ')
    : 'ไม่ระบุ'
}
</script>

<style scoped>
.activity-detail-card {
  width: 100%;
  max-width: 900px;
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 10px;
}
</style>
