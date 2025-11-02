<script setup lang="ts">
import { defineProps, defineEmits, ref, computed, watch } from 'vue'

const selectedStatus = ref<string>('')
const props = defineProps({
  modelValue: Boolean, // รับค่าจาก v-model
  currentStatus: String, // รับสถานะปัจจุบัน
})
const emit = defineEmits(['update:modelValue', 'confirm'])
const showDialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      selectedStatus.value = ''
    }
  },
)
// กำหนดตัวเลือกสถานะที่แสดงตามสถานะปัจจุบัน
const availableStatuses = computed(() => {
  switch (props.currentStatus) {
    case 'กำลังวางแผน':
      return [
        { label: 'เปิดลงทะเบียน', value: 'เปิดลงทะเบียน' },
        { label: 'ปิดลงทะเบียน', value: 'ปิดลงทะเบียน' },
        { label: 'เสร็จสิ้น', value: 'เสร็จสิ้น' },
        { label: 'ยกเลิก', value: 'ยกเลิก' },
      ]
    case 'เปิดลงทะเบียน':
      return [
        { label: 'กำลังวางแผน', value: 'กำลังวางแผน' },
        { label: 'ปิดลงทะเบียน', value: 'ปิดลงทะเบียน' },
        { label: 'เสร็จสิ้น', value: 'เสร็จสิ้น' },
        { label: 'ยกเลิก', value: 'ยกเลิก' },
      ]
    case 'ปิดลงทะเบียน':
      return [
        { label: 'กำลังวางแผน', value: 'กำลังวางแผน' },
        { label: 'เปิดลงทะเบียน', value: 'เปิดลงทะเบียน' },
        { label: 'เสร็จสิ้น', value: 'เสร็จสิ้น' },
        { label: 'ยกเลิก', value: 'ยกเลิก' },
      ]
    case 'เสร็จสิ้น':
      return [
        { label: 'กำลังวางแผน', value: 'กำลังวางแผน' },
        { label: 'เปิดลงทะเบียน', value: 'เปิดลงทะเบียน' },
        { label: 'ปิดลงทะเบียน', value: 'ปิดลงทะเบียน' },
        { label: 'ยกเลิก', value: 'ยกเลิก' },
      ]
    case 'ยกเลิก':
      return [
        { label: 'กำลังวางแผน', value: 'กำลังวางแผน' },
        { label: 'เปิดลงทะเบียน', value: 'เปิดลงทะเบียน' },
        { label: 'ปิดลงทะเบียน', value: 'ปิดลงทะเบียน' },
        { label: 'เสร็จสิ้น', value: 'เสร็จสิ้น' },
      ]
    default:
      return []
  }
})

const closeDialog = () => {
  emit('update:modelValue', false)
}
const confirmStatusChange = () => {
  if (selectedStatus.value) {
    emit('confirm', selectedStatus.value)
    closeDialog()
  }
}
</script>

<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="dialog-box">
      <q-card-section>
        <div class="label">เปลี่ยนสถานะโครงการ</div>
      </q-card-section>

      <q-card-section class="status-section">
        <q-btn v-for="option in availableStatuses" :key="option.value" :label="option.label" class="status-btn" :class="[
          {
            'active-status': selectedStatus === option.value,
          },
          option.value === 'กำลังวางแผน'
            ? 'status-plannings'
            : option.value === 'เปิดลงทะเบียน'
              ? 'status-opens'
              : option.value === 'ปิดลงทะเบียน'
                ? 'status-closed'
                : option.value === 'เสร็จสิ้น'
                  ? 'status-completed'
                  : option.value === 'ยกเลิก'
                    ? 'status-cancelled'
                    : '',
        ]" @click="selectedStatus = option.value" :outline="false" />
      </q-card-section>

      <!-- ปุ่มยืนยัน & ยกเลิก -->
      <q-card-actions align="right">
        <q-btn class="btnreject" label="ยกเลิก" @click="closeDialog" />
        <q-btn class="btnsecces" label="ยืนยัน" @click="confirmStatusChange" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.label {
  font-size: 20px;
  font-weight: normal;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 40px;
}

.dialog-box {
  width: 400px;
  padding: 20px;
  border-radius: 12px;
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

.status-plannings {
  color: #ff6f00;
  border: 2px solid #ffa500;
}

.status-opens {
  color: #009812;
  border: 2px solid #00bb16;
}

.status-closed {
  color: #001780;
  /* สีน้ำเงิน */
  border: 2px solid #002dff;
}

.status-completed {
  color: #000000;
  /* สีม่วง */
  border: 2px solid #575656;
}

.status-cancelled {
  color: #ff0000;
  /* สีแดง */
  border: 2px solid #f32323;
}

.status-opens.active-status {
  background-color: #00bb16;
  color: #ffffff;
}

.status-plannings.active-status {
  background-color: #ffa500;
  color: #ffffff;
}

.status-closed.active-status {
  background-color: #002dff;
  color: #ffffff;
}

.status-completed.active-status {
  background-color: #575656;
  color: #ffffff;
}

.status-cancelled.active-status {
  background-color: #f32323;
  color: #ffffff;
}


.cancel-btn {
  background-color: red;
  color: white;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
}

.confirm-btn {
  background-color: blue;
  color: white;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
}
</style>
