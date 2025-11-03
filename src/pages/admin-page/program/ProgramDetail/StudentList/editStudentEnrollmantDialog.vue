<script setup lang="ts">
// import
import { computed, reactive, ref, watch } from 'vue'
import dayjs from 'dayjs'
import type { StudentEnrollment } from 'src/types/enrollment'
import { useEnrollmentStore } from 'src/stores/enrollment'
import programForm_ProgramTime from '../../CreateProgram/Form/programForm_ProgramTime.vue'
// แนะนำให้มีเมธอดนี้ใน service:
//   EnrollmentService.updateCheckRecord(payload: { recordId: string; checkin: string; checkout: string })

// ===== props & emits =====
interface Props {
  modelValue: boolean
  student: StudentEnrollment | null
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'updated', payload: { id: string }): void
}>()

// ===== ui state =====
const loading = ref(false)
const errorMessage = ref('')
const store = useEnrollmentStore()
// v-model proxy
const dialog = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const errorBannerClass = computed(() => (errorMessage.value ? 'bg-red-1 text-red-8' : ''))

// แสดงผลนิสิต (readonly)
const display = reactive({
  studentCode: '',
  studentName: '',
})

// ==== โครงสร้างแถวในตาราง (แก้ได้เฉพาะเวลา) ====
// รับมาจาก student.checkInOut ต่อ 1 วัน จะต้องมี recordId (id ของ check record)
type Row = {
  recordId: string
  dateISO: string // วันที่ (อิงจาก checkin/checkout เดิม) ไว้ประกอบผลลัพธ์
  dateLabel: string // วันที่เพื่อแสดง UI (D MMM YYYY)
  checkinTime: string // "HH:mm"
  checkoutTime: string // "HH:mm"
  // เก็บต้นฉบับไว้เช็คว่าเปลี่ยนไหม (optional)
  _origCheckin: string
  _origCheckout: string
}
const rows = ref<Row[]>([])
const rowErrors = ref<Array<{ in?: string; out?: string }>>([])

function resetForm() {
  rows.value = []
  rowErrors.value = []
  display.studentCode = ''
  display.studentName = ''
  errorMessage.value = ''
}

// เมื่อเปิด dialog — map ข้อมูลเข้ามาเป็นแถวต่อวัน
watch(
  () => props.modelValue,
  (v) => {
    if (v && props.student) {
      display.studentCode = props.student.code ?? '-'
      display.studentName = props.student.name ?? '-'

      const list = Array.isArray(props.student.checkInOut) ? props.student.checkInOut : []

      // สร้าง row ต่อ check record
      rows.value = list
        .map((r) => {
          const checkinISO = r.checkin ?? ''
          const checkoutISO = r.checkout ?? ''
          // ใช้วันที่จาก checkin ถ้าไม่มีให้ใช้จาก checkout
          const baseISO = checkinISO || checkoutISO
          const dateISO = dayjs(baseISO).format('YYYY-MM-DD') // ใช้ local TZ (+07:00 env)
          const dateLabel = dayjs(baseISO).format('D MMM YYYY')

          return {
            recordId: r.id || '', // รองรับทั้ง id/_id
            dateISO,
            dateLabel,
            checkinTime: checkinISO ? dayjs(checkinISO).format('HH:mm') : '',
            checkoutTime: checkoutISO ? dayjs(checkoutISO).format('HH:mm') : '',
            _origCheckin: checkinISO,
            _origCheckout: checkoutISO,
          }
        })
        .filter((r) => !!r.recordId) // ต้องมี recordId เสมอ

      rowErrors.value = rows.value.map(() => ({}))
      errorMessage.value = ''
    } else if (!v) {
      resetForm()
    }
  },
)

// ===== validate เฉพาะรูปแบบเวลา และลำดับเวลาในวันเดียวกัน =====
function validateRows(): boolean {
  let ok = true
  rowErrors.value = rows.value.map(() => ({}))

  rows.value.forEach((r, idx) => {
    const errs: { in?: string; out?: string } = {}
    // time format HH:mm (อนุญาตค่าว่าง)
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

    if (r.checkinTime && !timeRegex.test(r.checkinTime)) {
      errs.in = 'รูปแบบเวลาเข้าไม่ถูกต้อง (HH:mm)'
      ok = false
    }
    if (r.checkoutTime && !timeRegex.test(r.checkoutTime)) {
      errs.out = 'รูปแบบเวลาออกไม่ถูกต้อง (HH:mm)'
      ok = false
    }

    // ถ้ามีทั้งสองเวลา ตรวจให้ออกหลังเข้า
    if (r.checkinTime && r.checkoutTime) {
      const inDT = dayjs(`${r.dateISO}T${r.checkinTime}:00+07:00`)
      const outDT = dayjs(`${r.dateISO}T${r.checkoutTime}:00+07:00`)
      if (outDT.isBefore(inDT)) {
        errs.out = 'เวลาออกต้องหลังเวลาเข้า'
        ok = false
      }
    }

    rowErrors.value[idx] = errs
  })

  return ok
}

function close() {
  dialog.value = false
}

// ===== Save: ส่งเป็น payload ต่อ 1 วัน =====
// ถ้ามีหลายวัน จะ loop ยิงหลายครั้ง (ทีละแถว)
async function onSave() {
  if (!props.student?.id) {
    errorMessage.value = 'ไม่พบบันทึกการลงทะเบียนของนิสิต'
    return
  }
  if (!validateRows()) {
    errorMessage.value = 'กรุณาตรวจสอบเวลาที่ไม่ถูกต้อง'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    for (const r of rows.value) {
      // สร้าง ISO พร้อม timezone +07:00 จากวันที่เดิม + เวลาใหม่
      // (หากเวลาใดว่าง ให้ส่งเป็นค่าว่างหรือไม่ส่ง ขึ้นกับสเปค API — ที่นี่ส่งเป็นค่าว่าง)
      const checkinISO = r.checkinTime ? `${r.dateISO}T${r.checkinTime}:00+07:00` : ''
      const checkoutISO = r.checkoutTime ? `${r.dateISO}T${r.checkoutTime}:00+07:00` : ''

      // ถ้าไม่มีการเปลี่ยนแปลงเวลาเลย ข้ามได้ (optional)
      const noChange =
        !!r._origCheckin === !!checkinISO &&
        !!r._origCheckout === !!checkoutISO &&
        (!r._origCheckin ||
          dayjs(r._origCheckin).format('YYYY-MM-DDTHH:mm:ssZZ') ===
            dayjs(checkinISO).format('YYYY-MM-DDTHH:mm:ssZZ')) &&
        (!r._origCheckout ||
          dayjs(r._origCheckout).format('YYYY-MM-DDTHH:mm:ssZZ') ===
            dayjs(checkoutISO).format('YYYY-MM-DDTHH:mm:ssZZ'))

      if (noChange) continue

      const payload = {
        id: r.recordId,
        checkin: checkinISO,
        checkout: checkoutISO,
      }
      console.log(payload)
      await store.updateEnrollmentCheckinCheckout(props.student.enrollmentId, payload)
      // 🔧 ปรับให้ตรงกับ service ของโปรเจกต์
      // await EnrollmentService.updateCheckRecord(payload)
    }

    emit('updated', { id: props.student.id })
    close()
  } catch {
    errorMessage.value = 'บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-dialog v-model="dialog" persistent>
    <q-card
      style="width: 90vw; max-width: 900px; max-height: 80vh; overflow-y: auto;" class="dialog-box"
    >
      <q-card-section class="q-gutter-y-md">
        <div class="q-mb-sm q-mt-lg text-h5"><strong>ประวัติการเช็คชื่อ</strong></div>
        <div class="row">
          <div class="col-6 q-mt-sm textcontent2"><strong>รหัสนิสิต :</strong> {{ display.studentCode }}</div>
          <div class="col-6 q-mt-sm textcontent2"><strong>ชื่อ - นามสกุล :</strong> {{ display.studentName }}</div>
        </div>


        <div class="row q-mt-lg">
          <div class="q-mb-sm text-h6"><strong>ประวัติการเช็คชื่อรายวัน</strong></div>
        </div>

        <div class="q-table__container q-table--flat q-table--bordered">
          <table class="q-table">
            <thead>
              <tr>
                <th style="width: 70%">เวลาเข้า / เวลาออก</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in rows" :key="row.recordId">
                <!-- วันที่ (read-only) -->


                <!-- เวลาเข้า/ออก (ใช้คอมโพเนนต์เดียว) -->
                <td :colspan="1" >
                  <programForm_ProgramTime
                    v-model:startTime="row.checkinTime"
                    v-model:endTime="row.checkoutTime"
                    :formattedDate="row.dateLabel"
                    :disable="loading"
                  />
                  <!-- ถ้าต้องการแสดง error ต่อวันเช่นเดิม -->
                  <div
                    class="text-negative text-caption q-mt-xs"
                    v-if="rowErrors[idx]?.in || rowErrors[idx]?.out"
                  >
                    {{ rowErrors[idx]?.in || rowErrors[idx]?.out }}
                  </div>
                </td>
              </tr>

              <tr v-if="rows.length === 0">
                <td colspan="2" class="text-center text-grey">ยังไม่มีข้อมูลเช็คชื่อ</td>
              </tr>
            </tbody>
          </table>
        </div>

        <q-banner
          v-if="errorMessage"
          class="q-mt-md"
          rounded
          dense
          inline-actions
          :class="errorBannerClass"
        >
          {{ errorMessage }}
        </q-banner>
      </q-card-section>

      <q-card-actions align="right">
        <q-card-actions align="right">
          <q-btn label="ยกเลิก" class="btnreject" @click="close" />
          <q-btn label="ยืนยัน" class="btnsecces" @click="onSave" />
        </q-card-actions>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.q-table__container {
  width: 100%;
  max-height: 360px;
  overflow: auto;
}
.q-table thead th {
  position: sticky;
  top: 0;
  background: #f5f5f5;
  z-index: 1;
}

.dialog-box {
  padding: 20px;
  border-radius: 12px;
}
</style>
