<script setup lang="ts">
import { defineProps, defineEmits, ref, watch, computed, onUnmounted } from 'vue'
import CheckinoutService from 'src/services/checkinout'
import { useRoute } from 'vue-router'
const route = useRoute()
const activityId = route.params.id as string
// Props และ Emits
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// เชื่อมกับ v-model
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

// State
const selectedType = ref<'checkin' | 'checkout' | ''>('') // ประเภทที่เลือก
const confirmedType = ref('') // ประเภทที่ยืนยันแล้ว
const qrLink = ref('') // ลิงก์ที่ใช้สร้าง QR
const qrType = ref('') // ประเภทที่ backend ตอบกลับมา
const appURL = import.meta.env.VITE_APP_URL
let refreshInterval: ReturnType<typeof setInterval> | null = null

// รีเซตค่าทุกครั้งที่เปิด dialog
watch(
  () => dialogVisible.value,
  (isOpen) => {
    if (isOpen) {
      selectedType.value = ''
      confirmedType.value = ''
      qrLink.value = ''
      if (refreshInterval) {
        clearInterval(refreshInterval)
        refreshInterval = null
      }
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval)
        refreshInterval = null
      }
    }
  },
)

// รีเฟรช QR อัตโนมัติทุก 10 วิหลังยืนยัน
watch(
  () => confirmedType.value,
  (val) => {
    if (val) {
      if (refreshInterval) clearInterval(refreshInterval)
      refreshInterval = setInterval(() => {
        void onConfirm()
      }, 8000)
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval)
        refreshInterval = null
      }
    }
  },
)

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
})

// เมื่อผู้ใช้เลือกประเภท → โหลดลิงก์ QR จาก backend
const selectType = (type: 'checkin' | 'checkout') => {
  selectedType.value = type
}

// ปุ่มยกเลิก
const onCancel = () => {
  selectedType.value = ''
  emit('cancel')
}

// ปุ่มยืนยัน
const onConfirm = async () => {
  confirmedType.value = selectedType.value
  const res = await CheckinoutService.getLink(activityId, confirmedType.value)
  console.log('res:', res)
  qrLink.value = res?.url || ''
  qrType.value = res?.type || ''
  emit('confirm')
}
function copyQRLink() {
  void navigator.clipboard.writeText(appURL + qrLink.value)
}
</script>

<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card class="dialog-box">
      <q-card-section>
        <div class="label">สร้าง QR-Code เช็คชื่อ</div>
      </q-card-section>

      <!-- ปุ่มเลือกประเภท -->
      <q-card-section class="status-section" v-if="!confirmedType">
        <q-btn
          label="เช็คชื่อเข้า"
          class="status-btn"
          :class="['status-checkin', selectedType === 'checkin' ? 'active-status' : '']"
          @click="selectType('checkin')"
        />
        <q-btn
          label="เช็คชื่อออก"
          class="status-btn"
          :class="['status-checkout', selectedType === 'checkout' ? 'active-status' : '']"
          @click="selectType('checkout')"
        />
      </q-card-section>

      <!-- แสดง QR หลังยืนยัน -->
      <q-card-section v-else>
        <div class="qr-type-info">
          ประเภท: <b>{{ qrType === 'checkin' ? 'เช็คชื่อเข้า' : 'เช็คชื่อออก' }}</b>
        </div>
        <div class="qr-link-container">
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
        <div class="qr-code-container">
          <q-img
            :src="`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${appURL + qrLink}`"
            class="qr-image"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn class="btnreject" label="ยกเลิก" @click="onCancel" />
        <q-btn
          v-if="!confirmedType"
          class="btnconfirm"
          label="ยืนยัน"
          @click="onConfirm"
          :disable="!selectedType"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.dialog-box {
  width: 400px;
  padding: 20px;
  border-radius: 12px;
}

.label {
  font-size: 20px;
  font-weight: normal;
  margin-bottom: 10px;
}

.status-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.status-btn {
  width: 200px;
  height: 40px;
  font-size: 18px;
  border-radius: 50px;
  text-align: center;
}

.status-checkin {
  color: #1a73e8;
  border: 2px solid #1a73e8;
}

.status-checkout {
  color: #e60000;
  border: 2px solid #e60000;
}

.active-status.status-checkin {
  background-color: #1a73e8;
  color: white;
}

.active-status.status-checkout {
  background-color: #e60000;
  color: white;
}

.qr-type-info {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.qr-link-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  width: 100%;
  box-sizing: border-box;
}

.qr-link {
  font-size: 12px;
  color: #666;
  word-break: break-all;
  flex: 1;
  font-family: monospace;
}

.copy-btn {
  min-width: auto !important;
  padding: 4px !important;
}

.qr-code-container {
  margin-top: 16px;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  display: flex;              /* 👈 ทำให้ลูกอยู่แนวนอน */
  justify-content: center;    /* 👈 จัดลูกให้อยู่กลางแนวนอน */
}


.qr-image {
  max-width: 200px;
  border-radius: 8px;
}

.btnconfirm:disabled {
  background: #cccccc;
  color: #666666;
  transform: none;
}
</style>

