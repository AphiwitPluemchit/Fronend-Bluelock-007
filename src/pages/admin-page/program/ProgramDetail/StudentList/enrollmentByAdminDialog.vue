<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useQuasar } from 'quasar'
import { EnrollmentService } from 'src/services/enrollment'
import type { Program } from 'src/types/program'
import { useStudentStore } from 'src/stores/student'
import type { Student } from 'src/types/student'

// ===== props & emits =====
interface Props {
  modelValue: boolean
  program: Program | null
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

// ===== shared types =====
interface Option<T extends string = string> {
  label: string
  value: T
}

// ===== form =====
const form = ref<{
  student: string | null
  programItemId: string | null
  foodVoteName: string | null
}>({
  student: null,
  programItemId: null,
  foodVoteName: null,
})

const errors = ref<{ studentId?: string; programItemId?: string; foodVoteName?: string }>({})

// ===== Students: preload จาก store + local filter =====
const allStudentOptions = ref<Array<Option<string>>>([])
const studentOptions = ref<Array<Option<string>>>([])
const loadingStudents = ref(false)

const fetchStudents = async () => {
  loadingStudents.value = true
  try {
    studentStore.query.page = 1
    studentStore.query.limit = 50
    studentStore.query.search = ''
    studentStore.query.sortBy = 'code'
    studentStore.query.order = 'asc'
    studentStore.query.studentStatus = ['1', '2', '3'] // ปรับตามสภาวะที่ต้องการ

    await studentStore.getStudents()

    const items = Array.isArray(studentStore.students) ? studentStore.students : []
    allStudentOptions.value = items
      .filter((s: Student) => s?.id && (s?.code || s?.name))
      .map((s: Student) => ({
        label: `${s.code ?? ''} — ${s.name ?? ''}`.trim(),
        value: String(s.id),
      }))
    studentOptions.value = allStudentOptions.value
  } finally {
    loadingStudents.value = false
  }
}

function onFilterStudentLocal(val: string, update: (cb: () => void) => void) {
  const needle = (val || '').toLowerCase().trim()
  update(() => {
    studentOptions.value = needle
      ? allStudentOptions.value.filter((opt) => opt.label.toLowerCase().includes(needle))
      : allStudentOptions.value
  })
}
function onAbortStudentFilter() {/* no-op */}

// ===== ProgramItem & FoodVote (จาก props.program) =====
const programItemOptions = computed<Array<Option<string>>>(() =>
  (props.program?.programItems ?? [])
    .filter((it) => !!it?.id)
    .map((it) => ({ label: it.name ?? '(ไม่มีชื่อโครงการย่อย)', value: String(it.id) })),
)

const hasFoodVotes = computed(() => (props.program?.foodVotes?.length ?? 0) > 0)

const foodVoteOptions = computed<Array<Option<string>>>(() => {
  if (!hasFoodVotes.value) return []
  // แสดงชื่อ + โหวตปัจจุบันเพื่อคอนเท็กซ์ (เช่น "ข้าวมันไก่ (12)")
  return (props.program!.foodVotes ?? [])
    .filter((fv) => !!fv?.foodName)
    .map((fv) => ({
      label: `${fv.foodName}${Number.isFinite(fv.vote) ? ` (${fv.vote})` : ''}`,
      value: fv.foodName,
    }))
})

// ===== auto preset + preload เมื่อเปิด dialog =====
watch(
  () => dialog.value,
  (open) => {
    if (open) {
      void fetchStudents()
      if (!form.value.programItemId && programItemOptions.value.length === 1) {
        form.value.programItemId = programItemOptions.value[0]!.value
      }
      if (!form.value.foodVoteName && foodVoteOptions.value.length === 1) {
        form.value.foodVoteName = foodVoteOptions.value[0]!.value
      }
    } else {
      reset()
    }
  },
)

// ===== validate =====
function validate(): boolean {
  errors.value = {}
  let ok = true
  if (!form.value.student) {
    errors.value.studentId = 'กรุณาเลือกนิสิต'
    ok = false
  }
  if (!form.value.programItemId) {
    errors.value.programItemId = 'กรุณาเลือกโครงการย่อย'
    ok = false
  }
  if (hasFoodVotes.value && !form.value.foodVoteName) {
    errors.value.foodVoteName = 'กรุณาเลือกเมนูอาหาร'
    ok = false
  }
  return ok
}

// ===== actions =====
function reset() {
  form.value = { student: null, programItemId: null, foodVoteName: null }
  errors.value = {}
  errorMessage.value = ''
  studentOptions.value = []
  allStudentOptions.value = []
}

function close() {
  dialog.value = false
}

async function onSave() {
  if (!validate()) {
    errorMessage.value = 'กรุณากรอกข้อมูลให้ครบถ้วน'
    return
  }

  loading.value = true
  errorMessage.value = ''

  // สร้าง payload: ส่ง FoodVote เฉพาะกรณีมี foodVotes ให้เลือก
  const payload: {
    studentId: string
    programItemId: string
    food?: string
  } = {
    studentId: form.value.student as string,
    programItemId: form.value.programItemId as string,
  }

  if (hasFoodVotes.value && form.value.foodVoteName) {
    payload.food =form.value.foodVoteName
  }

  try {
    await EnrollmentService.enrollmentByAdmin(payload)
    $q.notify({ type: 'positive', message: 'ลงทะเบียนสำเร็จ' })
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
    <q-card style="width: 90vw; max-width: 600px; border-radius: 10px" >
      <q-card-section>
        <div class="text-h6 q-mb-lg q-mt-sm">
          ลงทะเบียนนิสิตโดยเจ้าหน้าที่
        </div>
        <!-- เลือกนิสิต -->
        <div>
          <div class="text-subtitle2 q-mb-xs">นิสิต</div>
          <q-select
            v-model="form.student"
            :options="studentOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            use-input
            fill-input
            input-debounce="150"
            outlined
            dense
            placeholder="ค้นหา รหัสนิสิต หรือ ชื่อนิสิต"
            :loading="loadingStudents"
            :error="!!errors.studentId"
            :error-message="errors.studentId"
            @filter="onFilterStudentLocal"
            @filter-abort="onAbortStudentFilter"
            clearable
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">ไม่พบนิสิตที่ค้นหา</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- เลือกโครงการย่อย -->
        <div>
          <div class="text-subtitle2 q-mb-xs">โครงการย่อย</div>
          <q-select
            v-model="form.programItemId"
            :options="programItemOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            outlined
            dense
            placeholder="เลือกโครงการย่อย"
            :error="!!errors.programItemId"
            :error-message="errors.programItemId"
            clearable
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">ยังไม่มีรายการโครงการย่อย</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- เลือกอาหาร (FoodVote) — แสดงเฉพาะเมื่อ program มี foodVotes -->
        <div v-if="hasFoodVotes">
          <div class="text-subtitle2 q-mb-xs">อาหาร (โหวต)</div>
          <q-select
            v-model="form.foodVoteName"
            :options="foodVoteOptions"
            emit-value
            map-options
            outlined
            dense
            placeholder="เลือกเมนูอาหารเพื่อโหวต"
            :error="!!errors.foodVoteName"
            :error-message="errors.foodVoteName"
            clearable
          />
        </div>

        <q-banner
          v-if="errorMessage"
          class="q-mt-sm"
          rounded
          dense
          inline-actions
          :class="errorBannerClass"
        >
          {{ errorMessage }}
        </q-banner>
      </q-card-section>


      <q-card-actions align="right">
        <q-btn flat label="ยกเลิก" class="btnreject" :disable="loading" @click="close" />
        <q-btn unelevated label="ยืนยัน" class="btnconfirm" :loading="loading" @click="onSave" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
