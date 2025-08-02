<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
import type { EnrollmentResponse } from 'src/types/enrollment'

const baseurl = api.defaults.baseURL
const StudentActivityStore = useStudentActivitystore()

const router = useRouter()
const route = useRoute()
const showRegisterDialog = ref(false)
const showUnRegisterDialog = ref(false)
const showFailDialog = ref(false)
const activity = ref<Activity | null>(null)
const enrollment = ref<EnrollmentResponse | null>(null)
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
  if (enrollment.value) {
    await EnrollmentService.removeOne(enrollment.value.id)
    await fetchData()
    await router.push(`/Student/MyActivitiesPage`)
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
  try {
    const response = await EnrollmentService.checkEnrollmentByStudentIDAndActivityID(
      String(auth.getUser?.id),
      String(route.params.id),
    )

    if (response.isEnrolled && response.activity) {
      // Map activity response to Activity type for compatibility with existing components
      activity.value = response.activity
      // Create enrollment object from activity data for compatibility
      enrollment.value = {
        id: response.activity.id || '',
        registrationDate: new Date().toISOString(), // This will be updated when we have actual enrollment data
        studentId: String(auth.getUser?.id || ''),
        activity: response.activity
      }
    } else {
      enrollment.value = null
      activity.value = null
    }
  } catch (error) {
    console.log(error)
    activity.value = null
    enrollment.value = null
  }
}

onMounted(async () => {
  await fetchData()
  screen.value = true
})
</script>
<template>
  <q-page class="q-pa-none" v-if="screen">
    <!-- กรอบข้อมูลกิจกรรม -->
    <q-card-section class="q-col-gutter-md row items-start q-mb-md">
      <!-- ภาพกิจกรรม -->
      <div class="col-12 col-md-4 text-center">
        <q-img
          :src="
            activity?.file
              ? baseurl + '/uploads/activity/images/' + activity.file
              : '/default-placeholder.jpg'
          "
          class="activity-img"
          :ratio="4 / 3"
          spinner-color="primary"
        />
      </div>

      <!-- รายละเอียดกิจกรรม -->
      <div class="col-12 col-md-8" v-if="activity">
        <DetailOne
          v-if="Array.isArray(activity?.activityItems) && activity.activityItems.length > 1"
          :activity="activity"
        />
        <DetailMany v-else :activity="{ ...activity, activityItems: Array.isArray(activity?.activityItems) ? activity.activityItems : (activity?.activityItems ? [activity.activityItems] : []) }" />
      </div>
    </q-card-section>

    <!-- ปุ่มลงทะเบียน / ยกเลิก -->
    <div class="row justify-center q-gutter-sm q-mt-md">
      <q-btn
        v-if="enrollment && !isRegistrationNotAllowed"
        label="ยกเลิกลงทะเบียน"
        class="btnreject"
        @click="handleUnRegisterClick"
        unelevated
        rounded
      />
      <q-btn
        v-else-if="!enrollment && !isRegistrationNotAllowed"
        label="ลงทะเบียน"
        class="btnsecces"
        @click="handleRegisterClick"
        unelevated
        rounded
      />
      <q-btn
        v-else
        label="ไม่สามารถยกเลิกการลงทะเบียนได้"
        class="btn-disabled"
        :disabled="true"
        unelevated
        rounded
      />
    </div>

    <!-- หมายเหตุ -->
    <div v-if="isRegistrationNotAllowed">
      <q-item-label class="text-negative q-mt-md text-center">
        หมายเหตุ: กรุณาติดต่อเจ้าหน้าที่หากต้องการยกเลิกการลงทะเบียน
      </q-item-label>
    </div>

    <!-- Dialogs -->
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
.activity-img {
  width: 100%;
  max-width: 430px;
  height: auto;
  background-color: #d9d9d9;
  border-radius: 12px;
  object-fit: cover;
  /* margin: 0 auto; */
}

.btnreject {
  background-color: #f44336;
  color: white;
}
.btnsecces {
  background-color: #4caf50;
  color: white;
}
.btn-disabled {
  background-color: #bdbdbd;
  color: white;
}
</style>
