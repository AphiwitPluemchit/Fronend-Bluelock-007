<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useQuasar } from 'quasar'
import { EnrollmentService } from 'src/services/enrollment'
import { useStudentStore } from 'src/stores/student'
import type { Student } from 'src/types/student'

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



// ===== ProgramItem & FoodVote (จาก props.program) =====





// ===== auto preset + preload เมื่อเปิด dialog =====
watch(
  () => dialog.value,
  (open) => {
    if (open) {
      void fetchStudents()

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
const titel = ref('')
</script>

<template>
  <q-dialog v-model="dialog" persistent>
    <q-card style="width: 90vw; max-width: 600px; border-radius: 10px" >
      <q-card-section class="q-gutter-y-md ">
        <div class="text-h6">ลงทะเบียนเข้าร่วมกิจกรรม</div>

        <!-- เลือกนิสิต -->
        <div>
          <div class="text-subtitle2 q-mb-xs">หัวข้อ</div>
         <q-input v-model="titel"></q-input>
        </div>
        <div>
          <div class="text-subtitle2 q-mb-xs">ประเภท</div>
          <q-select v-model="titel" :options="['โครงการ','ใบรับรอง']" label="เลือกหัวข้อ"></q-select>
        </div>
        <div>
          <div class="text-subtitle2 q-mb-xs">ประเภท</div>
          <q-select v-model="titel" :options="['+','-']" label="บวก/ลบ"></q-select>
        </div>
        <div>
          <div class="text-subtitle2 q-mb-xs">จำนวนชั่วโมง</div>
         <q-input v-model="titel"></q-input>
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
