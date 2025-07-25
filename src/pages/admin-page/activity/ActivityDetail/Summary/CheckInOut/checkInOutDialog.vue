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
  <q-dialog v-model="dialogVisible">
    <q-card class="dialog-card">
      <q-card-section class="dialog-title">
        <span>สร้าง QR-Code เช็คชื่อ{{ selectedType === 'checkin' ? 'เข้า' : 'ออก' }}</span>
      </q-card-section>

      <!-- ยังไม่เลือกประเภท -->
      <q-card-section class="dialog-body" v-if="!confirmedType">
        <q-btn
          unelevated
          label="เช็คชื่อเข้า"
          class="checktype-btn"
          :color="selectedType === 'checkin' ? 'primary' : 'white'"
          text-color="black"
          @click="selectType('checkin')"
        />
        <q-btn
          unelevated
          label="เช็คชื่อออก"
          class="checktype-btn"
          :color="selectedType === 'checkout' ? 'primary' : 'white'"
          text-color="black"
          @click="selectType('checkout')"
        />
      </q-card-section>

      <!-- แสดง QR -->
      <q-card-section class="dialog-body" v-else>
        <div v-if="qrType">
          ประเภท:
          <b>{{
            qrType === 'checkin' ? 'เช็คชื่อเข้า' : qrType === 'checkout' ? 'เช็คชื่อออก' : qrType
          }}</b>
        </div>
        {{ appURL + qrLink }}
        <q-btn @click="copyQRLink">copyQRLink</q-btn>

        <q-img
          :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${appURL + qrLink}`"
          style="margin-top: 10px; max-width: 250px"
        />
      </q-card-section>

      <q-card-actions align="right" class="action-buttons">
        <q-btn flat label="ยกเลิก" class="cancel-btn" color="negative" @click="onCancel" />
        <q-btn
          unelevated
          label="ยืนยัน"
          class="confirm-btn"
          color="primary"
          @click="onConfirm"
          v-if="!confirmedType"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.dialog-card {
  width: 400px;
  padding: 10px;
  text-align: left;
  border-radius: 8px;
}
.dialog-title {
  font-size: 20px;
}
.dialog-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.checktype-btn {
  display: block;
  width: 100%;
  margin: 8px 0;
  font-size: 16px;
  border-radius: 10px;
}
</style>
