<script setup lang="ts">
import { defineProps, defineEmits, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const programId = route.params.id as string
// รับ programId จาก parent
const props = defineProps<{ modelValue: boolean}>()
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

const selectedType = ref<'checkin' | 'checkout' | ''>('')

// เลือกประเภท
const selectType = (type: 'checkin' | 'checkout') => {
  selectedType.value = type
}

const onCancel = () => {
  selectedType.value = ''
  emit('cancel')
}

// 👉 กดยืนยันแล้วเปิดหน้า CheckInOutPage แท็บใหม่
const onConfirm = () => {
  if (!selectedType.value) return
  const routeData = router.resolve({
    name: 'ProgramCheckQR', // ตั้งตามที่ประกาศใน routes
    params: { id: programId, type: selectedType.value },
  })
  window.open(routeData.href, '_blank', 'noopener') // เปิดแท็บใหม่

  emit('confirm')
  dialogVisible.value = false
}
</script>


<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card class="dialog-box">
      <q-card-section>
        <div class="label">สร้าง QR-Code เช็คชื่อ</div>
      </q-card-section>

      <!-- ปุ่มเลือกประเภท -->
      <q-card-section class="status-section">
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

      <q-card-actions align="right">
        <q-btn class="btnreject" label="ยกเลิก" @click="onCancel" />
        <q-btn
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

  display: flex; /* 👈 ทำให้ลูกอยู่แนวนอน */
  justify-content: center; /* 👈 จัดลูกให้อยู่กลางแนวนอน */
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
