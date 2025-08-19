<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import RegisterConfirmDialog from '../Dialog/RegisterConfirmDialog.vue'
import RegisterFailDialog from '../Dialog/RegisterFailDialog.vue'
import UnRegisterDialog from '../Dialog/UnRegisterDialog.vue'
import DetailOne from './Detail/DetailOne.vue'
import DetailMany from './Detail/DetailMany.vue'
import { useStudentActivitystore } from 'src/stores/activity'
import { EnrollmentService } from 'src/services/enrollment'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'boot/axios'
import type { Activity } from 'src/types/activity'
const baseurl = api.defaults.baseURL
type Enroll = {
  isEnrolled: boolean
  enrollmentId?: string
  message?: string
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
const breadcrumbs = ref({
  previousPage: { title: 'กิจกรรมทั้งหมด', path: '/Student/ActivityTablePage' },
  currentPage: { title: 'รายละเอียดกิจกรรม', path: `/Student/ActivityTablePage/ActivityDetail` },
  icon: 'description',
})

// ฟังก์ชันลงทะเบียน
const handleRegisterClick = () => {
  showRegisterDialog.value = true
}
const handleUnRegisterClick = () => {
  showUnRegisterDialog.value = true
}
const register = async (activityItemId: string, selectedFood: string | null) => {
  const payload = {
    activityItemId,
    studentId: auth.getUser?.id,
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
  if (enrollment.value?.enrollmentId) {
    await EnrollmentService.removeOne(enrollment.value.enrollmentId)
    await fetchData()
  }
}

const isRegistrationNotAllowed = computed(() => {
  if (!activity.value?.endDateEnroll) {
    return false // ถ้าไม่มี endDateEnroll ให้อนุญาตลงทะเบียนไว้ก่อน
  }

  const endDate = new Date(activity.value.endDateEnroll)
  const now = new Date()

  return now > endDate // ถ้าวันปัจจุบันเลยวันสิ้นสุดแล้ว ไม่ให้ลงทะเบียน
})

async function fetchData() {
  await StudentActivityStore.fetchOneData(route.params.id as string)
  activity.value = StudentActivityStore.form as Activity
  try {
    const response = await EnrollmentService.checkEnrollmentByStudentIDAndActivityID(
      `${auth.getUser?.id}`,
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
<template>
  <q-page class="q-pa-md" v-if="screen">
    <!-- Breadcrumbs -->
    <AppBreadcrumbs :breadcrumbs="breadcrumbs" />
    <div class="activity-detail-card">
      <q-card-section class="q-col-gutter-md row items-start q-mb-md">
        <!-- ภาพกิจกรรม -->
        <div class="col-12 col-md-4 text-center">
          <q-img
            :src="baseurl + '/uploads/activity/images/' + activity?.file"
            class="activity-img"
            error-src="/default-placeholder.jpg"
          />
        </div>

        <!-- รายละเอียด -->
        <div class="col-12 col-md-8" v-if="activity">
          <div v-if="Array.isArray(activity?.activityItems) && activity.activityItems.length > 1">
            <DetailMany :activity="activity ?? {}" />
          </div>
          <div v-else>
            <DetailOne :activity="activity ?? {}" />
          </div>
        </div>
      </q-card-section>

      <div class="q-mt-md q-mb-md row justify-center q-gutter-sm">
        <q-btn
          v-if="enrollment.isEnrolled && !isRegistrationNotAllowed"
          label="ยกเลิกลงทะเบียน"
          class="btnreject"
          @click="handleUnRegisterClick"
          unelevated
          rounded
        />
        <q-btn
          v-else-if="!enrollment.isEnrolled && !isRegistrationNotAllowed"
          label="ลงทะเบียน"
          class="btnsecces"
          @click="handleRegisterClick"
          unelevated
          rounded
        />
        <q-btn v-else label="ปิดลงทะเบียน" class="btngrey" :disabled="true" unelevated rounded />
      </div>
    </div>

    <!-- Confirm Dialog-->
    <RegisterConfirmDialog
      v-model="showRegisterDialog"
      :activityItems="activity?.activityItems ?? []"
      :food="activity?.foodVotes ?? []"
      @confirm="register"
    />
    <RegisterFailDialog v-model="showFailDialog" />
    <UnRegisterDialog v-model="showUnRegisterDialog" @confirm="unRegister" />
  </q-page>
</template>

<style scoped>
.activity-detail-card {
  background-color: #edf0f5; /*f5f7fa */
  padding: 16px;
  font-size: 18px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.activity-img {
  width: 100%;
  max-width: 430px;
  height: auto;
  aspect-ratio: 4 / 3;
  background-color: #d9d9d9;
  border-radius: 12px;
  object-fit: cover;
  margin: 0 auto;
}

.btnreject {
  background-color: #ff6b6b;
  color: white;
}
.btnsecces {
  background-color: #4caf50;
  color: white;
}
.btngrey {
  background-color: #bdbdbd;
  color: white;
}

.full-width-mobile {
  width: auto;
}

/* ถ้าหน้าจอเล็กกว่า 600px ให้ปุ่มกว้างเต็ม */
@media (max-width: 600px) {
  .full-width-mobile {
    width: 100% !important;
  }
}
</style>
