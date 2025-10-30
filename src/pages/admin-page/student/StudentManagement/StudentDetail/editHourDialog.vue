<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useStudentStore } from 'src/stores/student'
import { HourHistoryService } from 'src/services/hourHistory'
import type { CreateDirectHourChangeRequest } from 'src/types/hourHistory'

// ===== props & emits =====
interface Props {
  modelValue: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'saved'): void
}>()

// ===== ui & state =====
const $q = useQuasar()
const dialog = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})
const studentStore = useStudentStore()

const loading = ref(false)
const errorMessage = ref('')
const errorBannerClass = computed(() => (errorMessage.value ? 'bg-red-1 text-red-8' : ''))

// ===== form data =====
const form = ref<{
  title: string
  sourceType: 'program' | 'certificate' | null
  operationType: 'add' | 'subtract' | null
  skillType: 'soft' | 'hard' | null
  hours: number | null
  remark: string
}>({
  title: '',
  sourceType: null,
  operationType: null,
  skillType: null,
  hours: null,
  remark: '',
})

const errors = ref<{
  title?: string
  sourceType?: string
  operationType?: string
  skillType?: string
  hours?: string
}>({})

// ===== options =====
const sourceTypeOptions = [
  { label: 'โครงการ', value: 'program' },
  { label: 'ใบรับรอง', value: 'certificate' },
]

const operationTypeOptions = [
  { label: 'เพิ่มชั่วโมง', value: 'add', icon: 'add', color: 'positive' },
  { label: 'ลดชั่วโมง', value: 'subtract', icon: 'remove', color: 'negative' },
]

const skillTypeOptions = [
  { label: 'ทักษะเตรียมความพร้อม', value: 'soft' },
  { label: 'ทักษะความรู้ทางวิชาการ', value: 'hard' },
]

// ===== auto preset + preload เมื่อเปิด dialog =====
watch(
  () => dialog.value,
  (open) => {
    if (!open) {
      reset()
    }
  },
)

// ===== validate =====
function validate(): boolean {
  errors.value = {}
  let ok = true

  if (!form.value.title.trim()) {
    errors.value.title = 'กรุณากรอกหัวข้อ'
    ok = false
  }

  if (!form.value.sourceType) {
    errors.value.sourceType = 'กรุณาเลือกประเภท'
    ok = false
  }

  if (!form.value.operationType) {
    errors.value.operationType = 'กรุณาเลือกรูปแบบ'
    ok = false
  }

  if (!form.value.skillType) {
    errors.value.skillType = 'กรุณาเลือกประเภททักษะ'
    ok = false
  }

  if (!form.value.hours || form.value.hours <= 0) {
    errors.value.hours = 'กรุณากรอกจำนวนชั่วโมงที่ถูกต้อง'
    ok = false
  }

  return ok
}

// ===== actions =====
function reset() {
  form.value = {
    title: '',
    sourceType: null,
    operationType: null,
    skillType: null,
    hours: null,
    remark: '',
  }
  errors.value = {}
  errorMessage.value = ''
}

function close() {
  dialog.value = false
}

async function onSave() {
  if (!validate()) {
    errorMessage.value = 'กรุณากรอกข้อมูลให้ครบถ้วน'
    return
  }

  if (!studentStore.student?.id) {
    errorMessage.value = 'ไม่พบข้อมูลนิสิต'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    // คำนวณจำนวนชั่วโมงที่เปลี่ยน (บวก/ลบ)
    const hourChange = form.value.operationType === 'add' ? form.value.hours! : -form.value.hours!

    const payload: CreateDirectHourChangeRequest = {
      studentId: studentStore.student.id,
      sourceType: form.value.sourceType!,
      skillType: form.value.skillType!,
      hourChange,
      title: form.value.title.trim(),
    }

    // Add remark only if it has content
    if (form.value.remark.trim()) {
      payload.remark = form.value.remark.trim()
    }

    await HourHistoryService.createDirectHourChange(payload)

    $q.notify({
      type: 'positive',
      message: `${form.value.operationType === 'add' ? 'เพิ่ม' : 'ลด'}ชั่วโมงสำเร็จ`,
    })

    emit('saved')
    close()
    reset()
  } catch {
    errorMessage.value = 'บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-dialog v-model="dialog" persistent>
    <q-card style="width: 90vw; max-width: 650px; border-radius: 12px; padding: 10px">
      <q-card-section class="q-pb-sm">
        <div class="text-h6 text-primary q-mb-lg">
          <q-icon name="schedule" class="q-mr-sm" />
          เพิ่มชั่วโมงอบรมโดยตรง
        </div>

        <!-- <div class="text-body2 text-grey-7 q-mb-lg">
          เพิ่มหรือลดชั่วโมงการอบรมให้กับนิสิตโดยตรง โดยไม่ต้องผ่านโครงการหรือใบรับรอง
        </div> -->

        <div class="q-gutter-y-md">
          <!-- หัวข้อ -->
          <div>
            <div class="text-subtitle2 q-mb-xs">หัวข้อ <span class="text-red">*</span></div>
            <q-input
              v-model="form.title"
              outlined
              dense
              placeholder="หัวข้อการอบรม/หัวข้อหลักสูตร"
              :error="!!errors.title"
              :error-message="errors.title"
              class="rounded-input"
            />
          </div>

          <!-- ประเภท -->
          <div>
            <div class="text-subtitle2 q-mb-xs">ประเภท <span class="text-red">*</span></div>
            <q-option-group
              v-model="form.sourceType"
              :options="sourceTypeOptions"
              color="primary"
              inline
              class="q-mt-sm"
            />
            <div v-if="errors.sourceType" class="text-red text-caption q-mt-xs">
              {{ errors.sourceType }}
            </div>
          </div>

          <!-- รูปแบบ -->
          <div>
            <div class="text-subtitle2 q-mb-xs">รูปแบบ <span class="text-red">*</span></div>
            <div class="row q-gutter-sm q-mt-sm">
              <q-btn
                v-for="op in operationTypeOptions"
                :key="op.value"
                :outline="form.operationType !== op.value"
                :unelevated="form.operationType === op.value"
                :color="form.operationType === op.value ? op.color : 'grey-8'"
                :icon="op.icon"
                :label="op.label"
                @click="form.operationType = op.value as 'add' | 'subtract'"
                class="q-px-lg"
                style="border-radius: 8px"
              />
            </div>
            <div v-if="errors.operationType" class="text-red text-caption q-mt-xs">
              {{ errors.operationType }}
            </div>
          </div>

          <!-- ประเภททักษะ -->
          <div>
            <div class="text-subtitle2 q-mb-xs">ประเภททักษะ <span class="text-red">*</span></div>
            <q-select
              v-model="form.skillType"
              :options="skillTypeOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              outlined
              dense
              placeholder="เลือกประเภททักษะ"
              :error="!!errors.skillType"
              :error-message="errors.skillType"
              class="rounded-input"
            />
          </div>

          <!-- จำนวนชั่วโมง -->
          <div>
            <div class="text-subtitle2 q-mb-xs">จำนวนชั่วโมง <span class="text-red">*</span></div>
            <q-input
              v-model.number="form.hours"
              outlined
              dense
              type="number"
              min="1"
              step="1"
              placeholder="เช่น 8"
              :error="!!errors.hours"
              :error-message="errors.hours"
              suffix="ชั่วโมง"
              class="rounded-input"
            />
          </div>

          <!-- หมายเหตุ -->
          <div>
            <div class="text-subtitle2 q-mb-xs">หมายเหตุ</div>
            <q-input
              v-model="form.remark"
              outlined
              dense
              type="textarea"
              rows="3"
              placeholder="เพิ่มหมายเหตุเพิ่มเติม (ไม่บังคับ)"
              class="rounded-input"
            />
          </div>
        </div>

        <!-- Error Banner -->
        <q-banner
          v-if="errorMessage"
          class="q-mt-md"
          rounded
          dense
          inline-actions
          :class="errorBannerClass"
        >
          <q-icon name="warning" class="q-mr-sm" />
          {{ errorMessage }}
        </q-banner>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="ยกเลิก" class="btnreject q-mr-sm" :disable="loading" @click="close" />
        <q-btn unelevated label="บันทึก" class="btnconfirm" :loading="loading" @click="onSave" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
/* ปรับแต่งมุมโค้งและขนาดของ input สำหรับ dense */
.rounded-input :deep(.q-field__control) {
  border-radius: 8px;
  min-height: 40px; /* ลดลงจาก 48px เพื่อให้เหมาะกับ dense */
}

.rounded-input :deep(.q-field__native) {
  min-height: 40px; /* แก้ปัญหาการคลิกให้ครอบคลุมพื้นที่ทั้งหมด */
  padding: 8px 12px; /* ลด padding เพื่อให้เหมาะกับ dense */
}

/* สำหรับ textarea */
.rounded-input :deep(.q-field__native[rows]) {
  min-height: auto;
  padding: 8px 12px;
}

/* แก้ปัญหาการคลิกโดยให้ control element ครอบคลุมพื้นที่ทั้งหมด */
.rounded-input :deep(.q-field__control) {
  position: relative;
}

.rounded-input :deep(.q-field__control::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none; /* ให้คลิกผ่านไปยัง input ด้านล่าง */
}

/* ปรับแต่งเมื่อ focus */
.rounded-input :deep(.q-field--focused .q-field__control) {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

/* ปรับแต่งเมื่อมี error */
.rounded-input :deep(.q-field--error .q-field__control) {
  border-color: #f44336;
}

/* ให้ label มีพื้นหลังสีขาวเมื่อลอย */
.rounded-input :deep(.q-field--float .q-field__label) {
  background-color: white;
  padding: 0 4px;
}

/* สำหรับ dense - ปรับ margin ของ label */
.rounded-input :deep(.q-field--dense .q-field__label) {
  top: 50%;
  transform: translateY(-50%);
}
</style>
