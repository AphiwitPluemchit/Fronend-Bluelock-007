<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="dialog-box">
      <q-card-section>
        <div class="label">เปลี่ยนสถานะกิจกรรม</div>
      </q-card-section>

      <!-- ปุ่มเลือกสถานะ -->
      <q-card-section class="status-section">
        <q-btn
          v-for="option in availableStatuses"
          :key="option.value"
          :label="option.label"
          class="status-btn"
          :class="[
            {
              'active-status': selectedStatus === option.value,
            },
            option.value === 'กำลังวางแผน'
              ? 'status-planning'
              : option.value === 'เปิดลงทะเบียน'
                ? 'status-open'
                : option.value === 'ปิดลงทะเบียน'
                  ? 'status-closed'
                  : option.value === 'เสร็จสิ้น'
                    ? 'status-completed'
                    : option.value === 'ยกเลิก'
                      ? 'status-cancelled'
                      : '',
          ]"
          @click="selectedStatus = option.value"
          :outline="false"
        />
      </q-card-section>

      <!-- ปุ่มยืนยัน & ยกเลิก -->
      <q-card-actions align="right">
        <q-btn class="cancel-btn" label="ยกเลิก" @click="closeDialog" />
        <q-btn class="confirm-btn" label="ยืนยัน" @click="confirmStatusChange" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean, // รับค่าจาก v-model
  currentStatus: String, // รับสถานะปัจจุบัน
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const showDialog = ref(props.modelValue)
const selectedStatus = ref('') // สถานะที่เลือก

// กำหนดตัวเลือกสถานะที่แสดงตามสถานะปัจจุบัน
const availableStatuses = computed(() => {
  switch (props.currentStatus) {
    case 'กำลังวางแผน':
      return [
        { label: 'เปิดลงทะเบียน', value: 'เปิดลงทะเบียน' },
        { label: 'ยกเลิก', value: 'ยกเลิก' },
      ]
    case 'เปิดลงทะเบียน':
      return [
        { label: 'ปิดลงทะเบียน', value: 'ปิดลงทะเบียน' },
        { label: 'ยกเลิก', value: 'ยกเลิก' },
      ]
    case 'ปิดลงทะเบียน':
      return [
        { label: 'เสร็จสิ้น', value: 'เสร็จสิ้น' },
        { label: 'ยกเลิก', value: 'ยกเลิก' },
      ]
    default:
      return []
  }
})

// ปิด Dialog
const closeDialog = () => {
  emit('update:modelValue', false)
}

// ยืนยันการเปลี่ยนสถานะ
const confirmStatusChange = () => {
  if (selectedStatus.value) {
    emit('confirm', selectedStatus.value)
    closeDialog()
  }
}
</script>

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

/* สไตล์หลัก */
.status-btn {
  width: 200px;
  height: 40px;
  font-size: 18px;
  border-radius: 10px;
  text-align: center;
}

/* แต่ละสถานะ */
.status-planning {
  color: #ff6f00; /* สีส้ม */
  border: 2px solid #ffa500;
}

.status-open {
  color: #009812; /* สีเขียว */
  border: 2px solid #00bb16;
}

.status-closed {
  color: #001780; /* สีน้ำเงิน */
  border: 2px solid #002dff;
}

.status-completed {
  color: #000000; /* สีม่วง */
  border: 2px solid #575656;
}

.status-cancelled {
  color: #ff0000; /* สีแดง */
  border: 2px solid #f32323;
}

/* Active สถานะพร้อมพื้นหลัง */
.status-open.active-status {
  background-color: #d0ffc5 !important;
}

.status-planning.active-status {
  background-color: #ffe7ba !important;
}

.status-closed.active-status {
  background-color: #cfd7ff !important;
}

.status-completed.active-status {
  background-color: #dadada !important;
}

.status-cancelled.active-status {
  background-color: #ffc5c5 !important;
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
