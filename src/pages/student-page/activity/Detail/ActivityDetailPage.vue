<template>
  <q-page class="q-pa-md">
    <!-- Breadcrumbs -->
    <AppBreadcrumbs :breadcrumbs="breadcrumbs" />
    {{ activity }}
    <div class="activity-detail-card">
      <q-card-section class="row">
        <div class="col-12 col-md-4 text-center">
          <!-- <q-img :src="getImageUrl(activity?.file)" class="activity-img" /> -->
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
        <q-btn v-if="activity" label="ลงทะเบียน" class="btnsecces" @click="handleRegisterClick" />
      </div>
    </div>

    <!-- Confirm Dialog-->
    <RegisterConfirmDialog
      v-model="showDialog"
      :activityItems="activity?.activityItems ?? []"
      :food="activity?.foodVotes ?? []"
      @confirm="register"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import RegisterConfirmDialog from '../RegisterConfirmDialog.vue'
import { useStudentActivitystore } from 'src/stores/student-activity'
import type { Activity } from 'src/types/activity'
import DetailOne from './DetailOne.vue'
import DetailMany from './DetailMany.vue'
import { useAuthStore } from 'src/stores/auth'

const StudentActivityStore = useStudentActivitystore()
const route = useRoute()
const showDialog = ref(false)
const activity = ref<Activity | null>(null)
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

// ฟังก์ชันลงทะเบียน
const handleRegisterClick = () => {
  showDialog.value = true
}

const register = async (activityItemId: string, selectedFood: string | null) => {
  const payload = {
    activityItemId,
    studentId: auth.payload?.user?.id,
    selectedFood,
  }
  console.log('ส่ง payload:', payload)
  await StudentActivityStore.enrollment(payload)
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
