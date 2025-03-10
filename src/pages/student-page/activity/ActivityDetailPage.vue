<template>
  <q-page class="q-pa-md">
    <!-- Breadcrumbs -->
    <AppBreadcrumbs :breadcrumbs="breadcrumbs" />

    <div class="activity-detail-card">
      <q-card-section class="row">
        <div class="col-12 col-md-4 text-center">
          <q-img :src="getImageUrl(activity?.file)" class="activity-img" />
        </div>

        <div class="col-12 col-md-8 activity-details">
          <q-list dense>
            <q-item>
              <q-item-section class="col-3 text-right">
                <q-item-label class="q-mb-lg q-ml-md">ชื่อกิจกรรม:</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">วันที่จัดกิจกรรม:</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">เวลาที่จัดกิจกรรม:</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">จำนวนชั่วโมงที่ได้รับ:</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">สถานที่จัดกิจกรรม:</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">ประเภทกิจกรรม:</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">วิทยากร:</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">รายละเอียดอื่นๆ:</q-item-label>
              </q-item-section>
              <q-item-section class="col-9">
                <q-item-label class="q-mb-lg q-ml-md">{{
                  activity?.name ?? 'ไม่ระบุ'
                }}</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">{{
                  getActivityDate(activity?.activityItems)
                }}</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">{{
                  getActivityTime(activity?.activityItems)
                }}</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md"
                  >{{ getActivityHours(activity?.activityItems) }} ชั่วโมง</q-item-label
                >
                <q-item-label class="q-mb-lg q-ml-md">{{
                  getActivityRoom(activity?.activityItems) ?? 'ไม่ระบุ'
                }}</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">{{
                  activity?.activityState ?? 'ไม่ระบุ'
                }}</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">{{ 'ไม่ระบุ' }}</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">{{
                  'ไม่มีรายละเอียดเพิ่มเติม'
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>
      <div class="row justify-center">
        <q-btn v-if="activity" label="ลงทะเบียน" class="btnsecces" @click="handleRegisterClick" />
      </div>
    </div>

    <!-- Confirm Dialog-->
    <RegisterConfirmDialog v-model="showDialog" @confirm="register" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import RegisterConfirmDialog from './RegisterConfirmDialog.vue'
import { useStudentActivitystore } from 'src/stores/student-activity'
import type { Activity, ActivityItem } from 'src/types/activity'

const StudentActivityStore = useStudentActivitystore()
const route = useRoute()
const showDialog = ref(false)
const activity = ref<Activity | null>(null)

const breadcrumbs = ref({
  previousPage: { title: 'จัดการกิจกรรม', path: '/ActivitiesManagement' },
  currentPage: { title: 'รายละเอียดกิจกรรม', path: `/ActivitiesManagement/ActivityDetail` },
  icon: 'description',
})

// ฟังก์ชันดึง URL ของรูปภาพ
const getImageUrl = (fileName: string | undefined) => {
  return fileName ? `/uploads/${fileName}` : '/icons/default-image.png'
}

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
const getActivityRoom = (activityItems: ActivityItem[] | null | undefined): string => {
  return activityItems && activityItems.length > 0
    ? (activityItems[0]?.room ?? 'ไม่ระบุ')
    : 'ไม่ระบุ'
}

// ฟังก์ชันลงทะเบียน
const handleRegisterClick = () => {
  showDialog.value = true
}

const register = async () => {
  const payload = {
    activityItemId: activity.value?.activityItems?.[0]?.id,
    studentId: localStorage.getItem('studentId'),
  }
  console.log(payload)
  try {
    await StudentActivityStore.enrollment(payload)
    console.log('ลงทะเบียนสำเร็จ!')
  } catch (error) {
    console.error('Error registering:', error)
  }
}

onMounted(async () => {
  await StudentActivityStore.fetchOneData(route.params.id as string)
  activity.value = StudentActivityStore.form as Activity
})
</script>

<style scoped>
.activity-detail-card {
  background-color: #f5f7fa;
  padding: 20px;
  font-size: 20px;
}

.activity-img {
  width: 300px;
  height: 300px;
  background-color: #d9d9d9;
  border-radius: 10px;
}
</style>
