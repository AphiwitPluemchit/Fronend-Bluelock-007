<template>
  <div class="q-pa-md" v-if="screen">
    <div>
      <div class="row q-mb-md">
        <div class="column">
          <div class="text-h6">
            {{ activity?.name || 'กำลังโหลด...' }}
          </div>
        </div>
      </div>

      <div v-if="sortedCheckStatus.length === 0" class="text-center text-grey">
        ยังไม่มีข้อมูลเช็คชื่อ
      </div>
      <div v-else class="checkin-list q-pa-sm">
        <div
          v-for="(item, index) in sortedCheckStatus"
          :key="index"
          class="checkin-item q-py-sm q-mb-md"
        >
          <div class="text-h7 q-mb-xs">
            วันที่ : {{ formatDate(item.checkin || item.checkout) }}
          </div>

          <div class="row items-center q-mb-xs">
            <q-icon name="login" color="green" />
            <span class="q-ml-sm text-weight">เช็คชื่อเข้า :</span>
            <span class="q-ml-sm">
              {{ item.checkin ? formatTime(item.checkin) : 'ยังไม่มีข้อมูล' }}
            </span>
          </div>

          <div class="row items-center">
            <q-icon name="logout" color="red" />
            <span class="q-ml-sm text-weight">เช็คชื่อออก :</span>
            <span class="q-ml-sm">
              {{ item.checkout ? formatTime(item.checkout) : 'ยังไม่มีข้อมูล' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Activity } from 'src/types/activity'
import type { CheckinoutRecord } from 'src/types/checkinout'
import { useAuthStore } from 'src/stores/auth'
import { ActivityService } from 'src/services/activity'
import { useCheckinoutStore } from 'src/stores/checkinout'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
dayjs.locale('th')

const formatDate = (iso?: string): string =>
  iso ? dayjs(iso).format('D MMMM BBBB') : 'ยังไม่เช็คชื่อ'
const formatTime = (iso?: string): string =>
  iso ? dayjs(iso).format('HH:mm น.') : 'ยังไม่เช็คชื่อ'

const checkinoutStore = useCheckinoutStore()
const route = useRoute()
const checkStatus = ref<CheckinoutRecord[]>([])
const activity = ref<Activity | null>(null)
const screen = ref(false)
const auth = useAuthStore()

const sortedCheckStatus = computed(() =>
  [...checkStatus.value].sort((a, b) => {
    const dateA = a.checkin || a.checkout || ''
    const dateB = b.checkin || b.checkout || ''
    return dayjs(dateB).valueOf() - dayjs(dateA).valueOf()
  }),
)

async function fetchStatus(studentId: string, activityId: string) {
  const res = await checkinoutStore.getStatus(studentId, activityId)
  checkStatus.value = res
}

async function fetchActivity(activityId: string) {
  const res = await ActivityService.getOne(activityId)
  activity.value = res.data
}

async function load() {
  const id = route.params.id as string
  await Promise.all([fetchStatus(String(auth.getUser?.id), id), fetchActivity(id)])
}

onMounted(async () => {
  await load()
  screen.value = true
})

// ถ้า id ใน path เปลี่ยน ให้โหลดใหม่ (รองรับการสลับกิจกรรม)
watch(
  () => route.params.id,
  async () => {
    await load()
  },
)
</script>

<style scoped>
.checkin-list {
  background-color: transparent;
  border-radius: 0;
  box-shadow: none;
  padding-left: 0;
  padding-right: 0;
}
.checkin-item {
  background-color: transparent;
  border-radius: 0;
  box-shadow: none;
  padding-left: 0;
  padding-right: 0;
  border: none;
  margin-bottom: 1rem;
}
</style>
