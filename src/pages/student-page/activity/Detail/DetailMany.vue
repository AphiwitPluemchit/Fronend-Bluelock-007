<template>
  <!-- รายละเอียดกิจกรรม -->
  <q-list dense>
    <q-item>
      <q-item-section class="col-3 text-right">
        <q-item-label class="q-mb-lg q-ml-md">ชื่อกิจกรรม :</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md">วันที่จัดกิจกรรม :</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md">เวลาที่จัดกิจกรรม :</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md">ประเภทกิจกรรม :</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md">จำนวนกิจกรรม :</q-item-label>
      </q-item-section>
      <q-item-section class="col-9">
        <q-item-label class="q-mb-lg q-ml-md"> {{ activity.name }}</q-item-label>

        <q-item-label class="q-mb-lg q-ml-md">{{
          getActivitydates(activity?.activityItems)
        }}</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md">{{
          getActivityTime(activity?.activityItems)
        }}</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md">
          {{
            activity?.skill === 'hard'
              ? 'ชั่วโมงทักษะเตรียมความพร้อม'
              : activity?.skill === 'soft'
                ? 'ชั่วโมงทักษะทางวิชาการ'
                : 'ไม่ระบุประเภท'
          }}</q-item-label
        >
        <q-item-label class="q-mb-lg q-ml-md"> {{ activity.activityItems?.length }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator spaced />

    <!-- รายการรอบกิจกรรม -->
    <div v-for="item in activity.activityItems" :key="item.id || ''">
      <q-item>
        <q-item-section class="col-3 text-right">
          <q-item-label class="q-mb-lg q-ml-md">ชื่อกิจกรรม :</q-item-label>
          <q-item-label class="q-mb-lg q-ml-md">สถานที่ :</q-item-label>

          <q-item-label class="q-mb-lg q-ml-md">จำนวนชั่วโมง :</q-item-label>
          <q-item-label class="q-mb-lg q-ml-md">จำนวนที่ลง :</q-item-label
          ><q-item-label class="q-mb-lg q-ml-md">วิทยากร :</q-item-label>
          <q-item-label class="q-mb-lg q-ml-md">รายละเอียดอื่นๆ :</q-item-label>
        </q-item-section>
        <q-item-section class="col-9">
          <q-item-label class="q-mb-lg q-ml-md">{{ item.name ?? 'ไม่ระบุ' }}</q-item-label>
          <q-item-label class="q-mb-lg q-ml-md">{{ item.rooms ?? 'ไม่ระบุ' }}</q-item-label>

          <q-item-label class="q-mb-lg q-ml-md">{{ item.hour ?? '-' }}</q-item-label>
          <q-item-label class="q-mb-lg q-ml-md">{{
            item.maxParticipants ?? 'ไม่ระบุ'
          }}</q-item-label>
          <q-item-label class="q-mb-lg q-ml-md">{{ item.operator ?? 'ไม่ระบุ' }}</q-item-label>
          <q-item-label class="q-mb-lg q-ml-md">{{ item.description ?? 'ไม่ระบุ' }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-separator spaced />
    </div>
  </q-list>
</template>

<script setup lang="ts">
import type { Activity, ActivityItem } from 'src/types/activity'
defineProps<{ activity: Activity }>()

const getActivitydates = (activityItems: ActivityItem[] | null | undefined): string => {
  const firstItem = activityItems?.find((item) => item.dates && item.dates.length > 0)
  return firstItem?.dates
    ? firstItem.dates.map((d) => `${d.date} (${d.stime} - ${d.etime})`).join(', ')
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
