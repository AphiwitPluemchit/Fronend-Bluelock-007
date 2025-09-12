<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import CheckinoutService from 'src/services/checkinout'
import { ProgramService } from 'src/services/program'

const route = useRoute()
const programId = route.params.id as string
const type = route.params.type as 'checkin' | 'checkout'

const qrLink = ref('')
const qrType = ref('')
const programName = ref('')
const appURL = import.meta.env.VITE_APP_URL
let refreshInterval: ReturnType<typeof setInterval> | null = null

const fetchProgram = async () => {
  try {
    const res = await ProgramService.getOne(programId)
    programName.value = res.data?.name || ''
  } catch (err) {
    console.error('โหลดข้อมูลกิจกรรมล้มเหลว:', err)
  }
}

const fetchQR = async () => {
  try {
    const res = await CheckinoutService.getLink(programId, type)
    qrLink.value = res?.url || ''
    qrType.value = res?.type || type
  } catch (err) {
    console.error('โหลด QR ล้มเหลว:', err)
  }
}

onMounted(async () => {
  await Promise.all([fetchProgram(), fetchQR()])
  refreshInterval = setInterval(() => {
    void fetchQR()
  }, 12000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

const copyQRLink = () => {
  if (qrLink.value) void navigator.clipboard.writeText(appURL + qrLink.value)
}
</script>

<template>
  <q-page padding class="flex flex-center">
    <!-- Desktop / Tablet -->
    <q-card v-if="$q.screen.gt.xs" class="q-pa-xl shadow-3 full-width full-height flex flex-center">
      <div class="text-center">
        <div class="column items-center text-center q-mb-lg">
          <div class="text-h4 text-primary">
            {{ qrType === 'checkin' ? 'เช็คชื่อเข้ากิจกรรม' : 'เช็คชื่อออกกิจกรรม' }}
          </div>
        </div>
        <div class="text-h6 q-mb-md" v-if="programName">
          {{ programName }}
        </div>
        <div class="q-my-xl">
          <q-img
            v-if="qrLink"
            :src="`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${appURL + qrLink}`"
            style="width: 350px; height: 350px"
            spinner-color="primary"
          />
          <div v-else class="text-grey text-subtitle1 q-my-md">กำลังโหลด QR...</div>
        </div>
        <q-card-section class="bg-white rounded-borders q-pa-md">
          <div class="row items-center justify-center q-gutter-sm">
            <span class="text-body2 ellipsis" style="word-break: break-all">
              {{ appURL + qrLink }}
            </span>
            <q-btn
              round
              flat
              dense
              size="sm"
              color="primary"
              icon="content_copy"
              @click="copyQRLink"
            >
              <q-tooltip anchor="top middle" self="bottom middle">คัดลอกลิงก์</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
      </div>
    </q-card>

    <!-- Mobile -->
    <q-card v-else class="q-pa-lg shadow-3" style="width: 90%; max-width: 500px; max-height: 90vh">
      <div class="column items-center text-center q-my-sm">
        <div class="text-h4 text-primary q-mb-sm">
          {{ qrType === 'checkin' ? 'เช็คชื่อเข้ากิจกรรม' : 'เช็คชื่อออกกิจกรรม' }}
        </div>
        <div class="text-h6 q-mb-md" v-if="programName">
          {{ programName }}
        </div>
        <q-img
          v-if="qrLink"
          :src="`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${appURL + qrLink}`"
          class="qr-image q-mb-md"
          spinner-color="primary"
        />
        <div v-else class="text-grey text-subtitle1 q-my-md">กำลังโหลด QR...</div>
        <q-card-section class="bg-white rounded-borders q-pa-sm" style="width: 100%">
          <div class="row items-center justify-center q-gutter-sm">
            <span class="text-body2 ellipsis qr-link" style="word-break: break-all">
              {{ appURL + qrLink }}
            </span>
            <q-btn
              round
              flat
              dense
              size="sm"
              color="primary"
              icon="content_copy"
              @click="copyQRLink"
            >
              <q-tooltip anchor="top middle" self="bottom middle">คัดลอกลิงก์</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
      </div>
    </q-card>
  </q-page>
</template>

<style scoped>
.qr-image {
  width: 80%;
  max-width: 350px;
  height: auto;
  border-radius: 8px;
}

.qr-link {
  font-size: 14px;
  word-break: break-word;
}
</style>
