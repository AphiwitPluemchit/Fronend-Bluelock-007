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
          <div class="row q-mt-lg">
            <div class="col-12 text-left">
              <div class="q-mb-md q-ml-md">วันที่ 13 มกราคม 2568</div>
            </div>
          </div>
          <div class="row q-ml-md">
            <div class="col-12 text-left">
              <div class="q-mb-sm q-ml-md">เช็คชื่อเข้า : 10:00 น. (ทันเวลา)</div>
            </div>
            <div class="col-12 text-left">
              <div class="q-mb-sm q-ml-md">เช็คชื่อออก : 16:30 น. (ทันเวลา)</div>
            </div>
          </div>
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
              <div class="q-mb-lg q-ml-md">ชื่อ : นายศิวัช รัตนวงศ์</div>
            </div>
            <div class="col-6">
              <div class="q-mb-lg q-ml-md">รหัสนิสิต : 65160305</div>
            </div>
          </div>
          <div class="row">
            <div class="col-12 text-center">
              <div class="q-mb-lg q-ml-md">วันที่ 15 มกราคม 2568</div>
            </div>
          </div>
          <div class="row">
            <div class="col-12 text-center">
              <div class="q-mb-lg q-ml-md">เช็คชื่อเข้า</div>
            </div>
          </div>
          <div class="row">
            <div class="col-12 text-center">
              <div class="q-mb-lg q-ml-md text-h3">10:00 น.</div>
            </div>
          </div>
          <div class="row">
            <div class="col-12 text-center">
              <div class="q-mb-lg q-ml-md">เช็คชื่อออก</div>
            </div>
          </div>
          <div class="row">
            <div class="col-12 text-center">
              <div class="q-mb-lg q-ml-md text-h3">16:30 น.</div>
            </div>
          </div>
        </div>
      </q-card-section>
    </div>
  </q-page>
  <!-- Confirm Dialog-->
  <RegisterConfirmDialog
    v-model="showRegisterDialog"
    :activityItems="activity?.activityItems ?? []"
    :food="activity?.foodVotes ?? []"
    @confirm="register"
  />
  <RegisterFailDialog v-model="showFailDialog" />
  <UnRegisterDialog v-model="showUnRegisterDialog" @confirm="unRegister" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStudentActivitystore } from 'src/stores/student-activity'
import { EnrollmentService } from 'src/services/enrollment'
import RegisterConfirmDialog from '../Dialog/RegisterConfirmDialog.vue'
import RegisterFailDialog from '../Dialog/RegisterFailDialog.vue'
import UnRegisterDialog from '../Dialog/UnRegisterDialog.vue'
import type { Activity } from 'src/types/activity'

import { useAuthStore } from 'src/stores/auth'
import { api } from 'boot/axios'
const baseurl = api.defaults.baseURL
type Enroll = {
  isEnrolled: boolean
  enrollmentId: string
}
const StudentActivityStore = useStudentActivitystore()
const route = useRoute()
const showRegisterDialog = ref(false)
const showUnRegisterDialog = ref(false)
const showFailDialog = ref(false)
const activity = ref<Activity | null>(null)
const enrollment = ref<Enroll>({ isEnrolled: false, enrollmentId: '' })
const screen = ref(false)
const auth = useAuthStore()

// ฟังก์ชันลงทะเบียน

const register = async (activityItemId: string, selectedFood: string | null) => {
  const payload = {
    activityItemId,
    studentId: auth.payload?.user?.id,
    food: selectedFood,
  }
  try {
    console.log('ส่ง payload:', payload)
    await StudentActivityStore.enrollment(payload)
    await fetchData()
  } catch (error) {
    console.log('error:', error)
    showFailDialog.value = true
  }
}
const unRegister = async (modelValue: boolean) => {
  console.log('ยกเลิกลงทะเบียน', modelValue)
  await EnrollmentService.removeOne(enrollment.value.enrollmentId)
  await fetchData()
}

async function fetchData() {
  await StudentActivityStore.fetchOneData(route.params.id as string)
  activity.value = StudentActivityStore.form as Activity
  try {
    const response = await EnrollmentService.getEnrollmentsByStudentIDAndActivityID(
      `${auth.payload?.user?.id}`,
      `${activity.value.id}`,
    )
    enrollment.value = response
    console.log(enrollment.value)
  } catch (error) {
    console.log(error)
    enrollment.value = { isEnrolled: false, enrollmentId: '' }
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
