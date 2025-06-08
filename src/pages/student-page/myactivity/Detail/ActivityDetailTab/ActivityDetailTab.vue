<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStudentActivitystore } from 'src/stores/activity'
import { EnrollmentService } from 'src/services/enrollment'
import RegisterConfirmDialog from '../../Dialog/RegisterConfirmDialog.vue'
import RegisterFailDialog from '../../Dialog/RegisterFailDialog.vue'
import UnRegisterDialog from '../../Dialog/UnRegisterDialog.vue'
import type { Activity } from 'src/types/activity'
import DetailOne from 'src/pages/student-page/activity/Detail/Detail/DetailOne.vue'
import DetailMany from 'src/pages/student-page/activity/Detail/Detail/DetailMany.vue'
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
  await EnrollmentService.removeOne(enrollment.value.enrollmentId)
  await fetchData()
}

const isRegistrationNotAllowed = computed(() => {
  // ตรวจสอบว่า activity.value?.activityItems มีข้อมูลหรือไม่
  if (!activity.value?.activityItems || activity.value.activityItems.length === 0) {
    return false // ถ้าไม่มีข้อมูลให้คืนค่า false หรือค่าอื่นๆ ตามที่ต้องการ
  }

  // ดึงวันที่จาก activityItems และตรวจสอบก่อน
  const dateString = activity.value.activityItems[0]?.dates?.[0]?.date

  if (!dateString) {
    return false // ถ้าไม่มีวันที่ให้คืนค่า false หรือค่าอื่นๆ ตามที่ต้องการ
  }

  // สร้าง Date จากวันที่
  const activityDate = new Date(dateString)
  const now = new Date() // วันที่ปัจจุบัน
  const diffTime = activityDate.getTime() - now.getTime() // หาค่าความแตกต่างระหว่างวันที่

  const diffDays = diffTime / (1000 * 3600 * 24) // แปลงเวลาเป็นจำนวนวัน

  // ตรวจสอบว่าเหลือ 7 วันก่อนวันกิจกรรม
  return diffDays < 7 // ถ้ามีวันเหลือมากกว่า 7 วัน จึงจะสามารถลงทะเบียนได้
})

async function fetchData() {
  await StudentActivityStore.fetchOneData(route.params.id as string)
  activity.value = StudentActivityStore.form as Activity
  try {
    const response = await EnrollmentService.getEnrollmentsByStudentIDAndActivityID(
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
        v-if="enrollment?.isEnrolled && !isRegistrationNotAllowed"
        label="ยกเลิกลงทะเบียน"
        class="btnreject"
        @click="handleUnRegisterClick"
      />
      <q-btn
        v-else-if="!enrollment?.isEnrolled && !isRegistrationNotAllowed"
        label="ลงทะเบียน"
        class="btnsecces"
        @click="handleRegisterClick"
      />
      <q-btn v-else label="ไม่สามารถยกเลิกการลงทะเบียนได้" class="btn-disabled" :disabled="true" />
    </div>
    <div v-if="isRegistrationNotAllowed">
      <q-item-label class="text-negative q-mt-md text-center">
        หมายเหตุ: กรุณาติดต่อเจ้าหน้าที่หากต้องการยกเลิกการลงทะเบียน
      </q-item-label>
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
