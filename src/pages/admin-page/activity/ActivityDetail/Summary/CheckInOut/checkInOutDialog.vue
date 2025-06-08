<!-- CreateQRCodeDialog.vue -->
<script setup lang="ts">
import CheckinoutService from 'src/services/checkinout'
import { defineProps, defineEmits, ref, onMounted } from 'vue'

const props = defineProps({
  modelValue: Boolean,
})
console.log('props', props)

// const isDialogOpen = ref(props.modelValue)
const selectedCheckType = ref('')
const link = ref('')
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const setCheckType = (type: string) => {
  selectedCheckType.value = type
}

const cancel = () => {
  selectedCheckType.value = ''
  link.value = ''
  emit('cancel')
}

const confirm = () => {
  link.value = selectedCheckType.value
  emit('confirm')
}
onMounted(async () => {
  console.log('mounted')
  const res = await CheckinoutService.getLink('683aaee145a98ac1ae968e6a', selectedCheckType.value)
  console.log('res', res)
})
</script>

<template>
  <q-dialog v-model="props.modelValue!">
    <q-card class="dialog-card">
      <q-card-section class="dialog-title">
        <span>สร้าง QR-Code เช็คชื่อ{{ selectedCheckType === 'check-in' ? 'เข้า' : 'ออก' }}</span>
      </q-card-section>

      <!-- เลือกประเภท -->
      <q-card-section class="dialog-body" v-if="!link">
        <q-btn
          unelevated
          label="เช็คชื่อเข้า"
          class="check-type-btn"
          :color="selectedCheckType === 'check-in' ? 'primary' : 'white'"
          text-color="black"
          @click="setCheckType('check-in')"
        />
        <q-btn
          unelevated
          label="เช็คชื่อออก"
          class="check-type-btn"
          :color="selectedCheckType === 'check-out' ? 'primary' : 'white'"
          text-color="black"
          @click="setCheckType('check-out')"
        />
      </q-card-section>

      <q-card-section v-else class="dialog-body">
        <q-img
          :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedCheckType}`"
          style="margin-top: 10px; max-width: 150px"
        />
      </q-card-section>

      <q-card-actions align="right" class="action-buttons">
        <q-btn flat label="ยกเลิก" class="cancel-btn" color="negative" @click="cancel" />
        <q-btn
          unelevated
          label="ยืนยัน"
          class="confirm-btn"
          color="primary"
          @click="confirm"
          v-if="!link"
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
.check-type-btn {
  display: block;
  width: 100%;
  margin: 8px 0;
  font-size: 16px;
  border-radius: 10px;
}
</style>
