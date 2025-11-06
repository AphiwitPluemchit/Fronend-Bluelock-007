<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import CheckinoutService from 'src/services/checkinout'
import { ProgramService } from 'src/services/program'
import { useQuasar, copyToClipboard } from 'quasar'

const $q = useQuasar()
const route = useRoute()
const programId = route.params.id as string
const type = route.params.type as 'checkin' | 'checkout'

const qrLink = ref('') // อาจเป็น path (เช่น /CheckIn/xxx) หรือ full URL
const qrType = ref('')
const programName = ref('')

const baseURL = (import.meta.env.VITE_APP_URL as string) || window.location.origin

// รวมลิงก์สุดท้ายให้คลิก/ก็อบได้เสมอ
const fullQRUrl = () => {
  try {
    // ถ้า qrLink เป็น absolute URL อยู่แล้ว
    return new URL(qrLink.value).toString()
  } catch {
    // ไม่ใช่ absolute → รวมกับ base
    return new URL(qrLink.value, baseURL).toString()
  }
}

// Frontend display duration for the QR countdown (in seconds)
const qrDisplaySeconds = Number(import.meta.env.VITE_QR_DISPLAY_SECONDS) || 5
const countdown = ref(qrDisplaySeconds)

let refreshInterval: ReturnType<typeof setInterval> | null = null
let countdownInterval: ReturnType<typeof setInterval> | null = null

const fetchProgram = async () => {
  try {
    const res = await ProgramService.getOne(programId)
    programName.value = res.data?.name || ''
  } catch (err) {
    console.error('โหลดข้อมูลโครงการล้มเหลว:', err)
  }
}

const fetchQR = async () => {
  try {
    const res = await CheckinoutService.getLink(programId, type)
    qrLink.value = res?.url || '' // เก็บ “ค่าดิบ” ที่ backend ส่งมา
    qrType.value = res?.type || type
    countdown.value = qrDisplaySeconds
  } catch (err) {
    console.error('โหลด QR ล้มเหลว:', err)
  }
}

const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval)
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) countdown.value = qrDisplaySeconds
  }, 1000)
}

onMounted(async () => {
  await Promise.all([fetchProgram(), fetchQR()])
  // Auto-refresh QR
  if (refreshInterval) clearInterval(refreshInterval)
  refreshInterval = setInterval(() => {
    void fetchQR()
  }, qrDisplaySeconds * 1000)
  startCountdown()
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
  if (countdownInterval) clearInterval(countdownInterval)
})

const copyQRLink = async () => {
  try {
    await copyToClipboard(fullQRUrl())
    $q.notify({ type: 'positive', message: 'คัดลอกลิงก์เรียบร้อยแล้ว' })
  } catch {
    $q.notify({ type: 'negative', message: 'ไม่สามารถคัดลอกลิงก์ได้' })
  }
}
</script>

<template>
  <q-page padding class="flex flex-center">
    <!-- Desktop / Tablet -->
    <q-card v-if="$q.screen.gt.xs" class="q-pa-xl shadow-3 full-width full-height flex flex-center">
      <div class="text-center">
        <div class="column items-center text-center q-mb-lg">
          <div class="text-h4 text-primary">
            {{ qrType === 'checkin' ? 'เช็คชื่อเข้าโครงการ' : 'เช็คชื่อออกโครงการ' }}
          </div>
        </div>
        <div class="text-h6 q-mb-md" v-if="programName">
          {{ programName }}
        </div>

        <!-- Countdown Timer -->
        <div class="q-mb-md">
          <div class="text-h2 text-primary q-mb-xs" style="font-weight: 700">
            {{ countdown }}
          </div>
          <div class="text-subtitle1 text-grey-7">QR Code จะรีเฟรชใน {{ countdown }} วินาที</div>
        </div>

        <div class="q-my-xl">
          <q-img
            v-if="qrLink"
            :src="`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(fullQRUrl())}`"
            style="width: 350px; height: 350px"
            spinner-color="primary"
          />
          <div v-else class="text-grey text-subtitle1 q-my-md">กำลังโหลด QR...</div>
        </div>
        <q-card-section class="bg-white rounded-borders q-pa-md">
          <div class="row items-center justify-center q-gutter-sm">
            <span class="text-body2 ellipsis" style="word-break: break-all">
              {{ fullQRUrl() }}
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
          {{ qrType === 'checkin' ? 'เช็คชื่อเข้าโครงการ' : 'เช็คชื่อออกโครงการ' }}
        </div>
        <div class="text-h6 q-mb-md" v-if="programName">
          {{ programName }}
        </div>

        <!-- Countdown Timer (Mobile) -->
        <div class="q-mb-md">
          <div class="text-h2 text-primary q-mb-xs" style="font-weight: 700">
            {{ countdown }}
          </div>
          <div class="text-subtitle2 text-grey-7">QR Code จะรีเฟรชใน {{ countdown }} วินาที</div>
        </div>

        <q-img
          v-if="qrLink"
          :src="`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(fullQRUrl())}`"
          style="width: 350px; height: 350px"
          spinner-color="primary"
        />

        <div v-else class="text-grey text-subtitle1 q-my-md">กำลังโหลด QR...</div>
        <q-card-section class="bg-white rounded-borders q-pa-sm" style="width: 100%">
          <div class="row items-center justify-center q-gutter-sm">
            <span class="text-body2 ellipsis qr-link" style="word-break: break-all">
              {{ fullQRUrl() }}
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
