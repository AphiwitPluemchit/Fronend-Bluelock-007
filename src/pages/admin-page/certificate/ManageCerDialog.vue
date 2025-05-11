<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card class="q-pa-lg custom-dialog-card" style="min-width: 750px; max-width: 90vw">
      <!-- หัวข้อ -->
      <div class="text-h5 q-mb-md">จัดการใบประกาศนียบัตร</div>

      <!-- ข้อมูลนิสิต -->
      <div class="q-mb-sm row">
        <div class="col-6"><b>ชื่อ-สกุล</b> {{ data.name }}</div>
        <div class="col-6"><b>รหัสนิสิต</b> {{ data.code }}</div>
      </div>
      <div class="q-mb-sm"><b>หัวข้ออบรม</b> {{ data.certName }}</div>
      <div class="q-mb-sm"><b>รูปใบประกาศนียบัตร</b></div>

      <!-- รูปใบประกาศนียบัตร -->
      <q-img
        :src="data.imageUrl"
        style="border: 1px solid #333"
        spinner-color="primary"
        class="q-my-md"
      />

      <!-- ปุ่มอนุมัติ/ไม่อนุมัติ -->
      <div class="row justify-center q-gutter-sm q-mb-md">
        <q-btn
          label="อนุมัติ"
          class="custom-approve q-mr-lg"
          unelevated
          @click="setStatus('อนุมัติ')"
        />
        <q-btn
          label="ไม่อนุมัติ"
          class="custom-reject"
          unelevated
          @click="setStatus('ไม่อนุมัติ')"
        />
      </div>

      <!-- กรณี อนุมัติ -->
      <div v-if="status === 'อนุมัติ'" class="row q-col-gutter-md q-mb-md">
        <div class="col-6">
          <q-select
            dense
            outlined
            v-model="activityType"
            :options="['เตรียมความพร้อม', 'ทักษะทางวิชาการ']"
            label="ประเภทกิจกรรม"
            :rules="[(val) => !!val || 'กรุณาเลือกประเภทกิจกรรม']"
          />
        </div>
        <div class="col-6">
          <q-input
            dense
            outlined
            v-model.number="hourCount"
            type="number"
            label="จำนวนชั่วโมง"
            :rules="[(val) => val > 0 || 'กรุณาระบุจำนวนชั่วโมง']"
          />
        </div>
      </div>

      <!-- กรณี ไม่อนุมัติ -->
      <div v-if="status === 'ไม่อนุมัติ'" class="q-mb-md">
        <q-input
          dense
          outlined
          v-model="rejectReason"
          label="หมายเหตุ"
          type="textarea"
          :rules="[(val) => !!val || 'กรุณาระบุหมายเหตุ']"
        />
      </div>

      <!-- ปุ่มล่าง -->
      <div class="row justify-end q-gutter-sm">
        <q-btn class="btnreject" @click="closeDialog">ยกเลิก</q-btn>
        <q-btn class="btnconfirm" @click="confirm" :disable="!status">ยืนยัน</q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface CertificateData {
  code: string
  name: string
  certName: string
  imageUrl: string
}

const props = defineProps<{
  modelValue: boolean
  data: CertificateData
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (val) => (dialogVisible.value = val),
)
watch(dialogVisible, (val) => emit('update:modelValue', val))

const status = ref<'อนุมัติ' | 'ไม่อนุมัติ' | null>(null)
const activityType = ref<string | null>(null)
const hourCount = ref<number | null>(null)
const rejectReason = ref<string>('')

const isConfirmDisabled = computed(() => {
  if (status.value === 'อนุมัติ') {
    return !activityType.value || !hourCount.value || hourCount.value <= 0
  } else if (status.value === 'ไม่อนุมัติ') {
    return !rejectReason.value.trim()
  }
  return true
})

const setStatus = (val: 'อนุมัติ' | 'ไม่อนุมัติ') => {
  status.value = val
}

const closeDialog = () => {
  dialogVisible.value = false
  status.value = null
  activityType.value = null
  hourCount.value = null
  rejectReason.value = ''
}

const confirm = () => {
  if (!isConfirmDisabled.value) {
    const payload = {
      code: props.data.code,
      name: props.data.name,
      certName: props.data.certName,
      imageUrl: props.data.imageUrl,
      status: status.value!,
      activityType: activityType.value || undefined,
      hourCount: hourCount.value || undefined,
      rejectReason: rejectReason.value || undefined,
    }

    emit('confirm', payload)
    closeDialog()
  }
}
</script>

<style scoped>
.custom-dialog-card {
  border-radius: 10px;
  border: 1px solid #ccc; /* ขอบเทาอ่อน */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); /* เพิ่มเงา */
}

.custom-approve {
  background-color: #d0ffc5;
  color: #009812;
  border: 2px solid #00bb16;
  padding: 3px 30px;
  width: 130px;
  height: 32px;
  line-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  text-align: center;
  display: inline-block;
  font-size: 16px;
  width: 200px;
}

.custom-reject {
  background-color: #ffc5c5;
  color: #ff0000;
  border: 2px solid #f32323;
  padding: 3px 30px;
  width: 130px;
  height: 32px;
  line-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  text-align: center;
  display: inline-block;
  font-size: 16px;
  width: 200px;
}
</style>
