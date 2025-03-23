<template>
  <q-page class="q-pa-md" v-if="screen">
    <!-- Breadcrumbs -->
    <AppBreadcrumbs :breadcrumbs="breadcrumbs" />
    <div class="activity-detail-card">
      <q-card-section class="row">
        <div class="col-12 col-md-4 text-center">
          <q-img
            :src="baseurl + '/uploads/activity/images/' + activity?.file"
            class="image"
            error-src="/default-placeholder.jpg"
          />
        </div>

        <div class="col-12 col-md-8" v-if="activity">
          <div v-if="activity?.type == 'one'">
            <DetailOne :activity="activity ?? {}"></DetailOne>
          </div>
          <div v-if="activity?.type == 'many'">
            <DetailMany :activity="activity ?? {}"></DetailMany>
          </div>
        </div>
      </q-card-section>
      <div class="row justify-center">
        <q-btn
          v-if="enrollment?.isEnrolled"
          label="ยกเลิกลงทะเบียน"
          class="btnreject"
          @click="handleRegisterClick"
        />
        <q-btn v-else label="ลงทะเบียน" class="btnsecces" @click="handleRegisterClick" />
      </div>
    </div>

    <!-- Confirm Dialog-->
    <RegisterConfirmDialog
      v-model="showDialog"
      :activityItems="activity?.activityItems ?? []"
      :food="activity?.foodVotes ?? []"
      @confirm="register"
    />
    <RegisterFailDialog v-model="showFailDialog" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import RegisterConfirmDialog from '../Dialog/RegisterConfirmDialog.vue'
import RegisterFailDialog from '../Dialog/RegisterFailDialog.vue'
import { useStudentActivitystore } from 'src/stores/student-activity'
import { EnrollmentService } from 'src/services/enrollment'
import type { Activity } from 'src/types/activity'
import DetailOne from './DetailOne.vue'
import DetailMany from './DetailMany.vue'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'boot/axios'
const baseurl = api.defaults.baseURL
type Enroll = {
  isEnrolled: boolean
}
const StudentActivityStore = useStudentActivitystore()
const route = useRoute()
const showDialog = ref(false)
const showFailDialog = ref(false)
const activity = ref<Activity | null>(null)
const enrollment = ref<Enroll>({ isEnrolled: false })
const screen = ref(false)
const auth = useAuthStore()
const breadcrumbs = ref({
  previousPage: { title: 'จัดการกิจกรรม', path: '/Student/ActivityTablePage' },
  currentPage: { title: 'รายละเอียดกิจกรรม', path: `/Student/ActivityTablePage/ActivityDetail` },
  icon: 'description',
})

// ฟังก์ชันดึง URL ของรูปภาพ
// const getImageUrl = (fileName: string | undefined) => {
//   return fileName ? `/uploads/${fileName}` : '/icons/default-image.png'
// }
// const getImagePath = (fileName: string | undefined | null) => {
//   if (!fileName) {
//     return '/default-placeholder.jpg' // ถ้าไม่มีไฟล์
//   }
//   return `http://127.0.0.1:8888/uploads/activity/images/${fileName}`
// }

// ฟังก์ชันลงทะเบียน
const handleRegisterClick = () => {
  showDialog.value = true
}

const register = async (activityItemId: string, selectedFood: string | null) => {
  const payload = {
    activityItemId,
    studentId: auth.payload?.user?.id,
    food: selectedFood,
  }
  try {
    console.log('ส่ง payload:', payload)
    await StudentActivityStore.enrollment(payload)
  } catch (error) {
    console.log('error:', error)
    showFailDialog.value = true
  }
}

onMounted(async () => {
  await StudentActivityStore.fetchOneData(route.params.id as string)
  activity.value = StudentActivityStore.form as Activity
  const response = await EnrollmentService.getEnrollmentsByStudentIDAndActivityID(
    `${auth.payload?.user?.id}`,
    `${activity.value.id}`,
  )
  enrollment.value = response
  console.log(enrollment.value?.isEnrolled)
  screen.value = true
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
.image {
  width: 430px;
  height: 330px;
  background-color: #d9d9d9;
  border-radius: 12px;
  object-fit: cover;
}
</style>
