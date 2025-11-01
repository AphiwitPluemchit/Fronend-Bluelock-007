<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import registerConfirmDialog from '../Dialog/registerConfirmDialog.vue'
import registerFailDialog from '../Dialog/registerFailDialog.vue'
import unRegisterDialog from '../Dialog/unRegisterDialog.vue'
import DetailMany from './Detail/detailMany.vue'
import { useStudentProgramstore } from 'src/stores/program'
import { EnrollmentService } from 'src/services/enrollment'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'boot/axios'
import type { Program } from 'src/types/program'
const baseurl = api.defaults.baseURL
type Enroll = {
  isEnrolled: boolean
  enrollmentId?: string
  message?: string
}
const StudentProgramStore = useStudentProgramstore()
const route = useRoute()
const showRegisterDialog = ref(false)
const showUnRegisterDialog = ref(false)
const showFailDialog = ref(false)
const errorMessage = ref<string>('')
const program = ref<Program | null>(null)
const enrollment = ref<Enroll>({ isEnrolled: false, enrollmentId: '' })
const screen = ref(false)
const auth = useAuthStore()
const breadcrumbs = ref({
  previousPage: { title: 'โครงการทั้งหมด', path: '/Student/ProgramTablePage' },
  currentPage: {
    title: 'รายละเอียดโครงการ',
    path: `/Student/Program/ProgramDetail/${route.params.id as string}}`,
  },
  icon: 'event',
})

// ฟังก์ชันลงทะเบียน
const handleRegisterClick = () => {
  showRegisterDialog.value = true
}
const handleUnRegisterClick = () => {
  showUnRegisterDialog.value = true
}
const register = async (programItemId: string, selectedFood: string | null) => {
  const payload = {
    programItemId,
    studentId: auth.getUser?.id,
    food: selectedFood,
  }
  try {
    console.log('ส่ง payload:', payload)
    await StudentProgramStore.enrollment(payload)
    await fetchData()
  } catch (error: unknown) {
    console.log('error:', error)
    // ดึง error message จาก response
    const err = error as { response?: { data?: { error?: string } }; message?: string }
    errorMessage.value =
      err?.response?.data?.error || err?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน'
    showFailDialog.value = true
  }
}
const unRegister = async () => {
  console.log('ยกเลิกลงทะเบียน')
  if (enrollment.value?.enrollmentId) {
    await EnrollmentService.removeOne(enrollment.value.enrollmentId)
    await fetchData()
  }
}

const isAllowDate = computed(() => {
  if (!program.value?.endDateEnroll) {
    return false // ถ้าไม่มี endDateEnroll ให้อนุญาตลงทะเบียนไว้ก่อน
  }

  const endDate = new Date(program.value.endDateEnroll)
  const now = new Date()

  // เปรียบเทียบเฉพาะวันที่โดยไม่รวมเวลา
  endDate.setHours(23, 59, 59, 999) // ตั้งเวลาสิ้นสุดของวันเป็น 23:59:59.999
  now.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())

  console.log('endDate:', endDate, 'now:', now)

  return now <= endDate // ถ้าวันปัจจุบันเลยวันสิ้นสุดแล้ว ไม่ให้ลงทะเบียน
})

async function fetchData() {
  await StudentProgramStore.fetchOneData(route.params.id as string)
  program.value = StudentProgramStore.form as Program
  try {
    const response = await EnrollmentService.checkEnrollmentByStudentIDAndProgramID(
      `${auth.getUser?.id}`,
      `${program.value.id}`,
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
  <q-page class="q-pa-md card-container">
    <div style="margin-top: 20px">
      <AppBreadcrumbs :breadcrumbs="breadcrumbs" />

      <div class="program-detail-card q-mt-md" v-if="screen">
        <q-card-section class="q-col-gutter-md row items-start q-mb-md">
          <!-- ภาพโครงการ -->
          <div class="col-12 col-md-4 text-center">
            <q-img
              :src="
                program?.file
                  ? baseurl + '/uploads/program/images/' + program.file
                  : baseurl + '/uploads/no-image.jpg'
              "
              class="program-img"
              error-src="/default-placeholder.jpg"
            />
          </div>

          <!-- รายละเอียด -->
          <div class="col-12 col-md-8" v-if="program">
            <div>
              <DetailMany :program="program ?? {}" />
            </div>
          </div>
        </q-card-section>

        <div class="q-mt-md q-mb-md row justify-center q-gutter-sm">
          <q-btn
            v-if="program?.programState !== 'open'"
            label="ไม่สามารถยกเลิกการลงทะเบียนได้"
            class="btn-disabled"
            :disabled="true"
            unelevated
            rounded
          />
          <q-btn
            v-else-if="!isAllowDate && !enrollment.isEnrolled"
            label="หมดช่วงลงทะเบียนแล้ว"
            class="btn-disabled"
            :disabled="true"
            unelevated
            rounded
          />
          <q-btn
            v-else-if="enrollment.isEnrolled"
            label="ยกเลิกลงทะเบียน"
            class="btnreject"
            @click="handleUnRegisterClick"
            :disabled="isAllowDate"
            unelevated
            rounded
          />
          <q-btn
            v-else-if="!enrollment.isEnrolled && isAllowDate"
            label="ลงทะเบียน"
            class="btnsecces"
            @click="handleRegisterClick"
            unelevated
            rounded
          />
        </div>
      </div>

      <!-- Confirm Dialog-->
      <registerConfirmDialog
        v-model="showRegisterDialog"
        :programItems="program?.programItems ?? []"
        :food="program?.foodVotes ?? []"
        @confirm="register"
      />
      <registerFailDialog v-model="showFailDialog" :errorMessage="errorMessage" />
      <unRegisterDialog v-model="showUnRegisterDialog" @confirm="unRegister" />
    </div>
  </q-page>
</template>

<style scoped>
.card-container {
  height: calc(80vh - 150px);
  width: 100%;
}
.program-detail-card {
  background-color: #edf0f5; /*f5f7fa */
  padding: 16px;
  font-size: 18px;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.program-img {
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
.btn-disabled {
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
