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
                <div v-if="checkStatus.length === 0">ยังไม่มีข้อมูลเช็คชื่อ</div>
                <div v-else>
                  <q-table :rows="checkStatus" :columns="[ { name: 'checkin', label: 'เช็คชื่อเข้า', field: 'checkin', align: 'left' }, { name: 'checkout', label: 'เช็คชื่อออก', field: 'checkout', align: 'left' } ]" row-key="checkin">
                    <template #body-cell-checkin="props">
                      <q-td :props="props">{{ formatDate(props.row.checkin) }} {{ formatTime(props.row.checkin) }}</q-td>
                    </template>
                    <template #body-cell-checkout="props">
                      <q-td :props="props">{{ props.row.checkout ? formatDate(props.row.checkout) + ' ' + formatTime(props.row.checkout) : 'ยังไม่มีข้อมูล' }}</q-td>
                    </template>
                  </q-table>
                </div>
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
// import { useStudentActivitystore } from 'src/stores/activity'
// import { EnrollmentService } from 'src/services/enrollment'

import type { Activity } from 'src/types/activity'
import type { CheckinoutRecord } from 'src/types/checkinout'

import { useAuthStore } from 'src/stores/auth'
import { api } from 'boot/axios'
import { useCheckinoutStore } from 'src/stores/checkinout'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
dayjs.locale('th')
const baseurl = api.defaults.baseURL

const formatDate = (iso: string): string => {
  if (!iso) return 'ยังไม่เช็คชื่อ'
  return dayjs(iso).format('D MMMM BBBB')
}
const formatTime = (iso: string): string => {
  if (!iso) return 'ยังไม่เช็คชื่อ'
  return dayjs(iso).format('HH:mm น.')
}
const checkinoutStore = useCheckinoutStore()
// const studentActivityStore = useStudentActivitystore()
const route = useRoute()
const checkStatus = ref<CheckinoutRecord[]>([])
const activity = ref<Activity | null>(null)
const screen = ref(false)
const auth = useAuthStore()

// ฟังก์ชันลงทะเบียน
async function fetchStatus(studentId: string, activityId: string) {
  const res = await checkinoutStore.getStatus(studentId, activityId)
  checkStatus.value = Array.isArray(res) ? res : []
}

async function fetchData() {
  try {
    await fetchStatus(`${auth.getUser?.id}`, route.params.id as string)
  } catch (error) {
    console.log(error)
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
