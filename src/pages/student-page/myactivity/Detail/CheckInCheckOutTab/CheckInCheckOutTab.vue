<template>
  <q-page class="q-pa-md" v-if="screen">
    <div>
      <q-card-section class="row">
        <div class="col-12 col-md-4 text-center">
          <q-img
            :src="baseurl + '/uploads/activity/images/' + activity?.file"
            class="image"
            error-src="/default-placeholder.jpg"
          />
        </div>
        <!-- ///////////////////////////////////////////// -->
        <div class="col-12 col-md-8">
          <div class="row">
            <div class="col-12 text-center">
              <div class="q-mb-lg q-ml-md">ระบบเช็คชื่อ</div>
            </div>
          </div>
          <div class="row">
            <div class="col-6 text-right">
              <div class="q-mb-lg q-ml-md">ชื่อ : {{ auth.getUser?.name }}</div>
            </div>
            <div class="col-6">
              <div class="q-mb-lg q-ml-md">รหัสนิสิต : {{ auth.getUser?.code }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col-12 text-center">
              <div class="q-mb-lg q-ml-md">
                {{ formatDate(checkStatus.checkOut) || 'ยังไม่มีข้อมูล' }}
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-12 text-center">
              <div class="q-mb-lg q-ml-md">เช็คชื่อเข้า</div>
            </div>
          </div>
          <div class="row">
            <div class="col-12 text-center">
              <div class="q-mb-lg q-ml-md text-h3">
                {{ formatTime(checkStatus.checkIn) || 'ยังไม่มีข้อมูล' }}
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-12 text-center">
              <div class="q-mb-lg q-ml-md">เช็คชื่อออก</div>
            </div>
          </div>
          <div class="row">
            <div class="col-12 text-center">
              <div class="q-mb-lg q-ml-md text-h3">
                {{ formatTime(checkStatus.checkOut) || 'ยังไม่มีข้อมูล' }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </div>
  </q-page>
  <!-- Confirm Dialog-->
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStudentActivitystore } from 'src/stores/activity'
import { EnrollmentService } from 'src/services/enrollment'

import type { Activity } from 'src/types/activity'

import { useAuthStore } from 'src/stores/auth'
import { api } from 'boot/axios'
import { useCheckinoutStore } from 'src/stores/checkinout'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
dayjs.locale('th')
const baseurl = api.defaults.baseURL
type Enroll = {
  isEnrolled: boolean
  enrollmentId: string
  activityItemId: string
}
type Status = {
  checkIn: string
  checkOut: string
}
const formatDate = (iso: string): string => {
  if (!iso) return 'ยังไม่เช็คชื่อ'
  return dayjs(iso).format('D MMMM BBBB')
}
const formatTime = (iso: string): string => {
  if (!iso) return 'ยังไม่เช็คชื่อ'
  return dayjs(iso).format('HH:mm น.')
}
const checkinoutStore = useCheckinoutStore()
const studentActivityStore = useStudentActivitystore()
const route = useRoute()
const checkStatus = ref<Status>({ checkIn: '', checkOut: '' })
const activity = ref<Activity | null>(null)
const enrollment = ref<Enroll>({ isEnrolled: false, enrollmentId: '', activityItemId: '' })
const screen = ref(false)
const auth = useAuthStore()

// ฟังก์ชันลงทะเบียน
async function fetchStatus(studentId: string, activityItemId: string) {
  console.log(studentId)
  console.log(activityItemId)
  const res = await checkinoutStore.getStatus(studentId, activityItemId)
  console.log(res)

  checkStatus.value = res
}

async function fetchData() {
  await studentActivityStore.fetchOneData(route.params.id as string)
  activity.value = studentActivityStore.form as Activity
  try {
    const response = await EnrollmentService.getEnrollmentsByStudentIDAndActivityID(
      `${auth.getUser?.id}`,
      `${activity.value.id}`,
    )
    enrollment.value = response
    console.log(enrollment.value)
    await fetchStatus(`${auth.getUser?.id}`, enrollment.value.activityItemId)
  } catch (error) {
    console.log(error)
    enrollment.value = { isEnrolled: false, enrollmentId: '', activityItemId: '' }
  }
}

onMounted(async () => {
  await fetchData()
  screen.value = true
})
</script>

<style scoped>
.activity-img {
  width: 300px;
  height: 300px;
  background-color: #d9d9d9;
  border-radius: 10px;
}
.image {
  width: 430px;
  height: 330px;
  background-color: #d9d9d9;
  border-radius: 12px;
  object-fit: cover;
}
</style>
