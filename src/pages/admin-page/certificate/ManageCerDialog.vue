<script setup lang="ts">
import { CertificateService, StatusType, type UploadCertificate } from 'src/services/certificate'
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps<{
  modelValue: boolean
  data: UploadCertificate
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const $q = useQuasar()
const dialogVisible = ref(props.modelValue)
const isLoading = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val
    if (val) {
      // Reset ค่าทุกครั้งที่เปิด dialog
      selectedAction.value = null
      rejectReason.value = ''
    }
  },
)
watch(dialogVisible, (val) => emit('update:modelValue', val))

const selectedAction = ref<'อนุมัติ' | 'ไม่อนุมัติ' | null>(null)
const rejectReason = ref<string>('')

const isConfirmDisabled = computed(() => {
  if (selectedAction.value === 'อนุมัติ') {
    return false // อนุมัติไม่ต้องใส่เหตุผล
  } else if (selectedAction.value === 'ไม่อนุมัติ') {
    return !rejectReason.value.trim() // ไม่อนุมัติต้องใส่เหตุผล
  }
  return true // ยังไม่ได้เลือกอะไร
})

const closeDialog = () => {
  dialogVisible.value = false
  selectedAction.value = null
  rejectReason.value = ''
}

const confirm = async () => {
  if (isConfirmDisabled.value || !props.data.id) return

  try {
    isLoading.value = true

    // แปลงจากภาษาไทยเป็น StatusType
    const status = selectedAction.value === 'อนุมัติ' ? StatusType.APPROVED : StatusType.REJECTED

    // เรียก API
    await CertificateService.updateStatus(props.data.id, {
      status,
      remark: rejectReason.value || '', // ส่ง remark ไป (ถ้าอนุมัติจะเป็นค่าว่าง)
    })

    // แจ้งเตือนสำเร็จ
    $q.notify({
      message: `${selectedAction.value === 'อนุมัติ' ? 'อนุมัติ' : 'ปฏิเสธ'}ใบประกาศนียบัตรเรียบร้อยแล้ว`,
      type: 'positive',
      position: 'bottom',
      timeout: 2000,
    })

    // ปิด dialog และส่งสัญญาณกลับไปให้ parent component
    emit('confirm')
    closeDialog()
  } catch (error) {
    console.error('Error updating certificate status:', error)
    // Error notification จะถูกจัดการใน CertificateService แล้ว
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card class="q-pa-lg custom-dialog-card" style="min-width: 750px; max-width: 90vw">
      <div class="text-h5 q-mb-md">จัดการใบประกาศนียบัตร</div>

      <div class="q-mb-sm row">
        <div class="col-6"><b>ชื่อ-สกุล :</b> {{ props.data.student?.name }}</div>
        <div class="col-6"><b>รหัสนิสิต : </b> {{ props.data.student?.code }}</div>
      </div>
      <div class="q-mb-sm cert-title"><b>หัวข้ออบรม : </b> {{ props.data.course?.name }}</div>
      <div class="q-mb-sm">
        <b>ประเภทโครงการ : </b>
        {{ props.data.course?.isHardSkill ? 'ทักษะด้านวิชาการ' : 'เตรียมความพร้อม' }}
      </div>
      <div class="q-mb-sm"><b>จำนวนชั่วโมง : </b> {{ props.data.course?.hour }} ชั่วโมง</div>
      <div class="q-mb-sm"><b>รูปใบประกาศนียบัตร</b></div>

      <q-img
        :src="props.data.url"
        style="border: 1px solid #333"
        class="q-my-md"
        spinner-color="primary"
      />

      <!-- รออนุมัติ -->
      <template v-if="props.data.status === StatusType.PENDING">
        <div class="row justify-center q-gutter-sm q-mb-md">
          <q-btn
            label="อนุมัติ"
            class="custom-approve q-mr-lg"
            :class="['custom-approve', { 'custom-approve--active': selectedAction === 'อนุมัติ' }]"
            unelevated
            @click="selectedAction = 'อนุมัติ'"
          />
          <q-btn
            label="ไม่อนุมัติ"
            :class="['custom-reject', { 'custom-reject--active': selectedAction === 'ไม่อนุมัติ' }]"
            unelevated
            @click="selectedAction = 'ไม่อนุมัติ'"
          />
        </div>

        <div v-if="selectedAction === 'อนุมัติ'" class="row q-col-gutter-md q-mb-md"></div>

        <div v-if="selectedAction === 'ไม่อนุมัติ'" class="q-mb-md">
          <q-input dense outlined v-model="rejectReason" label="หมายเหตุ" type="textarea" />
        </div>

        <div class="row justify-end q-gutter-sm">
          <q-btn class="btnreject" :disable="isLoading" @click="closeDialog">ยกเลิก</q-btn>
          <q-btn
            class="btnconfirm"
            :disable="isConfirmDisabled"
            :loading="isLoading"
            @click="confirm"
          >
            ยืนยัน
          </q-btn>
        </div>
      </template>

      <!-- อนุมัติแล้ว -->
      <template v-else-if="props.data.status === StatusType.APPROVED">
        <div class="row justify-center q-gutter-sm q-mb-md">
          <q-badge
            v-if="props.data.status === StatusType.APPROVED"
            label="อนุมัติ"
            class="badge-approve"
            rounded
          />
        </div>
        <div class="q-mb-sm row"></div>
        <div class="row justify-end">
          <q-btn class="btnreject" @click="closeDialog">ปิด</q-btn>
        </div>
      </template>

      <!-- ไม่อนุมัติแล้ว -->
      <template v-else-if="props.data.status === StatusType.REJECTED">
        <div class="row justify-center q-gutter-sm q-mb-md">
          <q-badge
            v-if="props.data.status === StatusType.REJECTED"
            label="ไม่อนุมัติ"
            class="badge-reject"
            rounded
          />
        </div>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12"><b>หมายเหตุ : </b> {{ props.data.remark }}</div>
        </div>
        <div class="row justify-end">
          <q-btn class="btnreject" @click="closeDialog">ปิด</q-btn>
        </div>
      </template>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.cert-title {
  max-width: 650px; /* หรือขนาดที่ต้องการ */
  word-break: break-word;
  white-space: normal;
  overflow-wrap: break-word;
}
.q-img {
  height: 350px;
}
.custom-dialog-card {
  border-radius: 10px;
  border: 1px solid #ccc;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
.custom-approve {
  background-color: #d0ffc5;
  color: #009812;
  border: 2px solid #00bb16;
  height: 32px;
  padding: 0 32px;
  border-radius: 999px;
  font-size: 16px;
  width: 130px;
}

.custom-reject {
  background-color: #ffc5c5;
  color: #ff0000;
  border: 2px solid #f32323;
  height: 32px;
  padding: 0 32px;
  border-radius: 999px;
  font-size: 16px;
  width: 130px;
}

.custom-approve--active {
  background-color: #009812;
  border: 2px solid #009812;
  color: white;
}

.custom-reject--active {
  background-color: #ff0000;
  border: 2px solid #ff0000;
  color: white;
}
.badge-approve {
  background-color: #009812;
  color: white;
  height: 40px;
  padding: 12px 45px;
  border-radius: 999px;
  font-size: 16px;
  width: 130px;
  display: inline-block;
}
.badge-reject {
  background-color: #ff0000;
  color: white;
  height: 40px;
  padding: 12px 40px;
  border-radius: 999px;
  font-size: 16px;
  width: 130px;
  display: inline-block;
}

.btnreject {
  background-color: #f44336;
  color: white;
}
.btnconfirm {
  background-color: #2979ff;
  color: white;
}
</style>
