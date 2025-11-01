<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudentProgramstore } from 'src/stores/program'
import { EnrollmentService } from 'src/services/enrollment'
import RegisterConfirmDialog from 'src/pages/student-page/program/Dialog/registerConfirmDialog.vue'
import RegisterFailDialog from 'src/pages/student-page/program/Dialog/registerFailDialog.vue'
import UnRegisterDialog from 'src/pages/student-page/program/Dialog/unRegisterDialog.vue'
import type { Program } from 'src/types/program'
import DetailMany from 'src/pages/student-page/program/Detail/Detail/detailMany.vue'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'boot/axios'
import type { EnrollmentResponse } from 'src/types/enrollment'

const baseurl = api.defaults.baseURL
const StudentProgramStore = useStudentProgramstore()

const router = useRouter()
const route = useRoute()
const showRegisterDialog = ref(false)
const showUnRegisterDialog = ref(false)
const showFailDialog = ref(false)
const program = ref<Program | null>(null)
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
  } catch (error) {
    console.log('error:', error)
    showFailDialog.value = true
  }
}
const unRegister = async () => {
  console.log('ยกเลิกลงทะเบียน')
  if (enrollment.value) {
    await EnrollmentService.removeOne(enrollment.value.enrollmentId)
    await router.push(`/Student/RecordPage`)
  }
}

const isRegistrationNotAllowed = computed(() => {
  if (!program.value?.endDateEnroll) {
    return false // ถ้าไม่มี endDateEnroll ให้อนุญาตลงทะเบียนไว้ก่อน
  }

  const endDate = new Date(program.value.endDateEnroll)
  const now = new Date()

  return now > endDate // ถ้าวันปัจจุบันเลยวันสิ้นสุดแล้ว ไม่ให้ลงทะเบียน
})

async function fetchData() {
  try {
    const response = await EnrollmentService.checkEnrollmentByStudentIDAndProgramID(
      String(auth.getUser?.id),
      String(route.params.id),
    )
    console.log(response)

    if (response.isEnrolled && response.program) {
      // Map program response to Program type for compatibility with existing components
      program.value = response.program
      // Create enrollment object from program data for compatibility
      enrollment.value = {
        id: response.program.id || '',
        registrationDate: new Date().toISOString(), // This will be updated when we have actual enrollment data
        studentId: String(auth.getUser?.id || ''),
        program: response.program,
        enrollmentId: response.enrollmentId || '',
      }
    } else {
      enrollment.value = null
      program.value = null
    }
  } catch (error) {
    console.log(error)
    program.value = null
    enrollment.value = null
  }
}

onMounted(async () => {
  await fetchData()
  screen.value = true
})
</script>
<template>
  <div v-if="screen">
    <!-- กรอบข้อมูลโครงการ -->
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
          :ratio="4 / 3"
          spinner-color="primary"
        />
      </div>

      <!-- รายละเอียดโครงการ -->
      <div class="col-12 col-md-8" v-if="program">
        <DetailMany
          :program="{
            ...program,
            programItems: Array.isArray(program?.programItems)
              ? program.programItems
              : program?.programItems
                ? [program.programItems]
                : [],
          }"
        />
      </div>
    </q-card-section>

    <!-- ปุ่มลงทะเบียน / ยกเลิก -->
    <div class="row justify-center q-gutter-sm q-mt-md">
      <q-btn
        v-if="program?.programState !== 'open'"
        label="ไม่สามารถยกเลิกการลงทะเบียนได้"
        class="btn-disabled"
        :disabled="true"
        unelevated
        rounded
      />
      <q-btn
        v-else-if="enrollment && !isRegistrationNotAllowed"
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
      :programItems="program?.programItems ?? []"
      :food="program?.foodVotes ?? []"
      @confirm="register"
    />
    <RegisterFailDialog v-model="showFailDialog" />
    <UnRegisterDialog v-model="showUnRegisterDialog" @confirm="unRegister" />
  </div>
</template>

<style scoped>
.program-img {
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
