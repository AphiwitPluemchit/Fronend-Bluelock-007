<template>
  <q-page padding>
    <!-- <q-banner class="q-mb-md" dense>
      Activity ID: <b>{{ activityId }}</b> — ประเภท: <b>{{ qrType }}</b>
    </q-banner> -->

    <q-card class="q-mb-md" style="height: calc(100vh - 150px)">
      <div class="qr-code-container" v-if="qrLink">
        <q-img
          :src="`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${appURL + qrLink}`"
          class="qr-image"
        />
      </div>
      <div v-else class="text-grey text-center q-mt-md">กำลังโหลด QR...</div>
      <div class="text_type">
        ประเภท: <b>{{ qrType === 'checkin' ? 'เช็คชื่อเข้า' : 'เช็คชื่อออก' }}</b>
      </div>
      <div class="qr-link-container" v-if="qrLink">
        <div>
          <span class="qr-link">{{ appURL + qrLink }}</span>
          <q-btn
            flat
            dense
            icon="content_copy"
            size="sm"
            color="primary"
            @click="copyQRLink"
            class="copy-btn"
          >
            <q-tooltip>คัดลอกลิงก์</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import CheckinoutService from 'src/services/checkinout'

const route = useRoute()

// 👉 รับ param มาจาก route
const activityId = route.params.id as string
const type = route.params.type as 'checkin' | 'checkout'

// state
const qrLink = ref('')
const qrType = ref('')
const appURL = import.meta.env.VITE_APP_URL
let refreshInterval: ReturnType<typeof setInterval> | null = null

// โหลด QR จาก backend
const fetchQR = async () => {
  try {
    const res = await CheckinoutService.getLink(activityId, type)
    qrLink.value = res?.url || ''
    qrType.value = res?.type || type
  } catch (err) {
    console.error('โหลด QR ล้มเหลว:', err)
  }
}

onMounted(async () => {
  await fetchQR()
  // auto refresh ทุก 8 วิ
  refreshInterval = setInterval(() => {
    void fetchQR()
  }, 12000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
})

// คัดลอกลิงก์
const copyQRLink = () => {
  if (qrLink.value) {
    void navigator.clipboard.writeText(appURL + qrLink.value)
  }
}
</script>

<style scoped>
.qr-link-container {
  justify-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}
.qr-link {
  font-size: 12px;
  color: #666;
  word-break: break-all;
  flex: 1;
  font-family: monospace;
}
.qr-code-container {
  display: flex;
  justify-content: center;
}
.text_type {
  margin-top: calc(10vh - 10px);
  justify-content: center;
  display: flex;
  font-size: xx-large;
}
.qr-image {
  max-width: 400px;
  border-radius: 8px;
}
</style>
