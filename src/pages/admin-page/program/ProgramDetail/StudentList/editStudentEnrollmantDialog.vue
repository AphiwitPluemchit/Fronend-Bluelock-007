<template>
  <q-dialog v-model="dialog" persistent>
    <q-card style="min-width: 720px; max-width: 960px">
      <q-card-section class="row items-center q-gutter-sm">
        <q-icon name="edit" color="primary" size="md" />
        <div class="text-h6">แก้ไขเวลาเช็คชื่อ (ต่อวัน)</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-gutter-y-md">
        <div class="text-subtitle2">ข้อมูลนิสิต</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-4">
            <q-input v-model="display.studentCode" label="รหัสนิสิต" outlined dense disable />
          </div>
          <div class="col-12 col-sm-8">
            <q-input v-model="display.studentName" label="ชื่อ-สกุล" outlined dense disable />
          </div>
        </div>

        <q-separator class="q-mt-md" />

        <div class="row items-center justify-between q-mt-sm">
          <div class="text-subtitle2">รายการเช็คชื่อรายวัน</div>
        </div>

        <div class="q-table__container q-table--flat q-table--bordered">
          <table class="q-table">
            <thead>
              <tr>
                <th style="width: 28%">วันที่</th>
                <th style="width: 36%">เวลาเข้า</th>
                <th style="width: 36%">เวลาออก</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in rows" :key="row.recordId">
                <!-- วันที่ (read-only) -->
                <td class="text-no-wrap">
                  {{ row.dateLabel }}
                </td>

                <!-- เวลาเข้า -->
                <td>
                  <div class="row q-col-gutter-sm">
                    <div class="col">
                      <q-input
                        v-model="row.checkinTime"
                        outlined
                        dense
                        placeholder="HH:mm"
                        :error="!!rowErrors[idx]?.in"
                        :error-message="rowErrors[idx]?.in"
                      >
                        <template #append>
                          <q-icon name="access_time" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-time v-model="row.checkinTime" format24h />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                  </div>
                </td>

                <!-- เวลาออก -->
                <td>
                  <div class="row q-col-gutter-sm">
                    <div class="col">
                      <q-input
                        v-model="row.checkoutTime"
                        outlined
                        dense
                        placeholder="HH:mm"
                        :error="!!rowErrors[idx]?.out"
                        :error-message="rowErrors[idx]?.out"
                      >
                        <template #append>
                          <q-icon name="access_time" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-time v-model="row.checkoutTime" format24h />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                  </div>
                </td>
              </tr>

              <tr v-if="rows.length === 0">
                <td colspan="3" class="text-center text-grey">ยังไม่มีข้อมูลเช็คชื่อ</td>
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
          <q-btn label="ยืนยัน" class="btnconfirm" @click="onSave" />
        </q-card-actions>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// import
import { computed, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import dayjs from 'dayjs'
import type { StudentEnrollment } from 'src/types/enrollment'
import { useEnrollmentStore } from 'src/stores/enrollment'
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
const $q = useQuasar()
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

    $q.notify({ type: 'positive', message: 'บันทึกเวลาเช็คชื่อสำเร็จ' })
    emit('updated', { id: props.student.id })
    close()
  } catch {
    errorMessage.value = 'บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.q-table__container {
  max-height: 360px;
  overflow: auto;
}
.q-table thead th {
  position: sticky;
  top: 0;
  background: #f5f5f5;
  z-index: 1;
}
</style>
