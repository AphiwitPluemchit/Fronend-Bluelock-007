<template>
  <q-list dense>
    <q-item>
      <q-item-section class="col-3 text-right">
        <q-item-label class="q-mb-lg q-ml-md">ชื่อกิจกรรม :</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md">วันที่จัดกิจกรรม :</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md">เวลาที่จัดกิจกรรม :</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md">จำนวนชั่วโมงที่ได้รับ :</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md">สถานที่จัดกิจกรรม :</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md">ประเภทกิจกรรม :</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md">วิทยากร :</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md">รายละเอียดอื่นๆ :</q-item-label>
      </q-item-section>
      <q-item-section class="col-9">
        <q-item-label class="q-mb-lg q-ml-md">{{ activity?.name ?? 'ไม่ระบุ' }}</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md">{{
          getActivityDate(activity?.activityItems)
        }}</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md">{{
          getActivityTime(activity?.activityItems)
        }}</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md"
          >{{ getActivityHours(activity?.activityItems) }} ชั่วโมง</q-item-label
        >
        <!-- <q-item-label class="q-mb-lg q-ml-md">{{
          getActivityRoom(activity?.activityItems) ?? 'ไม่ระบุ'
        }}</q-item-label> -->
        <q-item-label class="q-mb-lg q-ml-md">{{
          activity?.activityState ?? 'ไม่ระบุ'
        }}</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md">{{ 'ไม่ระบุ' }}</q-item-label>
        <q-item-label class="q-mb-lg q-ml-md">{{ 'ไม่มีรายละเอียดเพิ่มเติม' }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>
<script setup lang="ts">
import type { Activity, ActivityItem } from 'src/types/activity'
defineProps<{ activity: Activity }>()
// ฟังก์ชันดึงวันที่
const getActivityDate = (activityItems: ActivityItem[] | null | undefined): string => {
  const firstItem = activityItems?.find((item) => item.date && item.date.length > 0)
  return firstItem?.date
    ? firstItem.date.map((d) => `${d.date} (${d.stime} - ${d.etime})`).join(', ')
    : 'ไม่ระบุ'
}

// ฟังก์ชันดึงเวลา
const getActivityTime = (activityItems: ActivityItem[] | null | undefined): string => {
  const firstItem = activityItems?.find((item) => item.date && item.date.length > 0)
  return firstItem?.date
    ? firstItem.date.map((d) => `${d.stime} - ${d.etime}`).join(', ')
    : 'ไม่ระบุ'
}

// ฟังก์ชันดึงจำนวนชั่วโมง
const getActivityHours = (activityItems: ActivityItem[] | null | undefined): string => {
  return activityItems?.reduce((total, item) => total + (item.hour ?? 0), 0).toString() ?? '0'
}
// ฟังก์ชันดึงสถานที่จัดกิจกรรม (Room)
// const getActivityRoom = (activityItems: ActivityItem[] | null | undefined): string => {
//   // return activityItems && activityItems.length > 0
//   //   ? (activityItems[0]?.room ?? 'ไม่ระบุ')
//   //   : 'ไม่ระบุ'
// }
</script>
