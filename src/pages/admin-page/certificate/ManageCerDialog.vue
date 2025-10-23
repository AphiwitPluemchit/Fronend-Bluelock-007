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
      isEditing.value = false
    }
  },
)
watch(dialogVisible, (val) => emit('update:modelValue', val))

const selectedAction = ref<'อนุมัติ' | 'ไม่อนุมัติ' | 'รออนุมัติ' | null>(null)
const rejectReason = ref<string>('')
const isEditing = ref(false)

const isConfirmDisabled = computed(() => {
  if (selectedAction.value === 'อนุมัติ') {
    return false // อนุมัติไม่ต้องใส่เหตุผล
  } else if (selectedAction.value === 'ไม่อนุมัติ') {
    return !rejectReason.value.trim() // ไม่อนุมัติต้องใส่เหตุผล
  } else if (selectedAction.value === 'รออนุมัติ') {
    return false // รออนุมัติไม่ต้องใส่เหตุผล
  }
  return true // ยังไม่ได้เลือกอะไร
})

const startEditing = () => {
  isEditing.value = true
  // Set default action based on current status
  if (props.data.status === StatusType.APPROVED) {
    selectedAction.value = 'อนุมัติ'
  } else if (props.data.status === StatusType.REJECTED) {
    selectedAction.value = 'ไม่อนุมัติ'
    rejectReason.value = props.data.remark || ''
  } else {
    selectedAction.value = 'รออนุมัติ'
  }
}

const cancelEditing = () => {
  isEditing.value = false
  selectedAction.value = null
  rejectReason.value = ''
}

const closeDialog = () => {
  dialogVisible.value = false
  selectedAction.value = null
  rejectReason.value = ''
  isEditing.value = false
}

const confirm = async () => {
  if (isConfirmDisabled.value || !props.data.id) return

  try {
    isLoading.value = true

    // แปลงจากภาษาไทยเป็น StatusType
    let status: StatusType
    let message: string
    
    if (selectedAction.value === 'อนุมัติ') {
      status = StatusType.APPROVED
      message = 'อนุมัติใบประกาศนียบัตรเรียบร้อยแล้ว'
    } else if (selectedAction.value === 'ไม่อนุมัติ') {
      status = StatusType.REJECTED
      message = 'ปฏิเสธใบประกาศนียบัตรเรียบร้อยแล้ว'
    } else {
      status = StatusType.PENDING
      message = 'เปลี่ยนสถานะเป็นรออนุมัติเรียบร้อยแล้ว'
    }

    // เรียก API
    await CertificateService.updateStatus(props.data.id, {
      status,
      remark: rejectReason.value || '', // ส่ง remark ไป
    })

    // แจ้งเตือนสำเร็จ
    $q.notify({
      message,
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

// Add date formatting function
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
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
      <div class="q-mb-sm"><b>คะแนนชื่อนิสิตภาษาไทย : </b> {{ props.data.nameMatch }}</div>
      <div class="q-mb-sm"><b>คะแนนชื่อนิสิตภาษาอังกฤษ : </b> {{ props.data.nameEngMatch }}</div>
      <div class="q-mb-sm"><b>คะแนนหัวข้ออบรมภาษาไทย : </b> {{ props.data.courseMatch }}</div>
      <div class="q-mb-sm"><b>คะแนนหัวข้ออบรมภาษาอังกฤษ : </b> {{ props.data.courseEngMatch }}</div>
      <div class="q-mb-sm"><b>ลิงก์ใบประกาศนียบัตร : </b> {{ props.data.url }}</div>
      <!-- uploadAt, changeStatusAt, useOcr? -->
      <div class="q-mb-sm"><b>วันที่อัปโหลด : </b> {{ formatDate(props.data.uploadAt) }}</div>
      <div class="q-mb-sm">
        <b>วันที่เปลี่ยนสถานะ : </b> {{ formatDate(props.data.changedStatusAt) }}
      </div>
      <div class="q-mb-sm"><b>ใช้ OCR : </b> {{ props.data.useOcr ? 'ใช่' : 'ไม่ใช่' }}</div>

      <!-- Mode: View/Edit -->
      <template v-if="!isEditing">
        <!-- แสดงสถานะปัจจุบัน -->
        <div class="row justify-center q-gutter-sm q-mb-md">
          <q-badge
            v-if="props.data.status === StatusType.APPROVED"
            label="อนุมัติ"
            class="badge-approve"
            rounded
          />
          <q-badge
            v-else-if="props.data.status === StatusType.REJECTED"
            label="ไม่อนุมัติ"
            class="badge-reject"
            rounded
          />
          <q-badge
            v-else-if="props.data.status === StatusType.PENDING"
            label="รออนุมัติ"
            class="badge-pending"
            rounded
          />
        </div>

        <!-- แสดง remark ถ้ามี -->
        <div v-if="props.data.remark" class="q-mb-md">
          <div class="text-body1"><b>หมายเหตุ : </b> {{ props.data.remark }}</div>
        </div>

        <!-- ปุ่มแก้ไขและปิด -->
        <div class="row justify-end q-gutter-sm">
          <q-btn class="btnreject" @click="closeDialog">ปิด</q-btn>
          <q-btn class="btnedit" @click="startEditing">
            <q-icon name="edit" class="q-mr-sm" />
            แก้ไขสถานะ
          </q-btn>
        </div>
      </template>

      <!-- Mode: Editing -->
      <template v-else>
        <div class="row justify-center q-gutter-sm q-mb-md">
          <q-btn
            label="รออนุมัติ"
            :class="['custom-pending', { 'custom-pending--active': selectedAction === 'รออนุมัติ' }]"
            unelevated
            @click="selectedAction = 'รออนุมัติ'"
          />
          <q-btn
            label="อนุมัติ"
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

        <!-- ช่องกรอก remark เมื่อเลือก "ไม่อนุมัติ" หรือ "รออนุมัติ" -->
        <div v-if="selectedAction === 'ไม่อนุมัติ' || selectedAction === 'รออนุมัติ'" class="q-mb-md">
          <q-input
            dense
            outlined
            v-model="rejectReason"
            label="หมายเหตุ"
            type="textarea"
            rows="3"
            :rules="[val => selectedAction === 'ไม่อนุมัติ' ? !!val || 'กรุณาระบุเหตุผล' : true]"
          />
        </div>

        <div class="row justify-end q-gutter-sm">
          <q-btn class="btnreject" :disable="isLoading" @click="cancelEditing">ยกเลิก</q-btn>
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
.custom-pending {
  background-color: #ffe7ba;
  color: #ff6f00;
  border: 2px solid #ffa500;
  height: 32px;
  padding: 0 24px;
  border-radius: 999px;
  font-size: 14px;
  min-width: 110px;
}

.custom-approve {
  background-color: #d0ffc5;
  color: #009812;
  border: 2px solid #00bb16;
  height: 32px;
  padding: 0 24px;
  border-radius: 999px;
  font-size: 14px;
  min-width: 110px;
}

.custom-reject {
  background-color: #ffc5c5;
  color: #ff0000;
  border: 2px solid #f32323;
  height: 32px;
  padding: 0 24px;
  border-radius: 999px;
  font-size: 14px;
  min-width: 110px;
}

.custom-pending--active {
  background-color: #ff6f00;
  border: 2px solid #ff6f00;
  color: white;
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

.badge-pending {
  background-color: #ff6f00;
  color: white;
  height: 40px;
  padding: 12px 30px;
  border-radius: 999px;
  font-size: 16px;
  min-width: 130px;
  display: inline-block;
}

.badge-approve {
  background-color: #009812;
  color: white;
  height: 40px;
  padding: 12px 45px;
  border-radius: 999px;
  font-size: 16px;
  min-width: 130px;
  display: inline-block;
}

.badge-reject {
  background-color: #ff0000;
  color: white;
  height: 40px;
  padding: 12px 40px;
  border-radius: 999px;
  font-size: 16px;
  min-width: 130px;
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

.btnedit {
  background-color: #4caf50;
  color: white;
}
</style>
