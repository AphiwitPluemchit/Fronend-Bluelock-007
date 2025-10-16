<script setup lang="ts">
import { defineProps, defineEmits, computed, ref, watch, nextTick } from 'vue'

const props = defineProps<{
  modelValue: string[]
  disable?: boolean // เพิ่ม prop disable
}>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: string[]): void
  (event: 'enter'): void
}>()
const internalDateRange = ref<string[]>([...props.modelValue])
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const datePopupRef = ref<InstanceType<(typeof import('quasar'))['QMenu']> | null>(null)
const dateError = ref('')
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const inputRef = ref<InstanceType<(typeof import('quasar'))['QInput']> | null>(null)

const thaiLocale = {
  days: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
  daysShort: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
  months: [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ],
  monthsShort: [
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พ.ย.',
    'ธ.ค.',
  ],
}
const formatThaiDate = (dateStr: string): string => {
  if (!dateStr) return ''

  const parts = dateStr.split('-')
  if (parts.length !== 3) return ''

  const year = parseInt(parts[0] ?? '', 10)
  const monthIndex = parseInt(parts[1] ?? '', 10) - 1
  const day = parseInt(parts[2] ?? '', 10)

  if (isNaN(year) || isNaN(day) || monthIndex < 0 || monthIndex >= thaiLocale.months.length) {
    return ''
  }

  const thaiMonth = thaiLocale.months[monthIndex]
  const thaiYear = year + 543

  return `${day} ${thaiMonth} ${thaiYear}`
}

const formattedDateRange = computed(() => {
  return internalDateRange.value.length > 0
    ? internalDateRange.value.map((date) => formatThaiDate(date)).join(', ')
    : ''
})
const validate = async () => {
  if (!internalDateRange.value.length) {
    dateError.value = 'กรุณาเลือกวันที่จัดโครงการ'
    await nextTick()
    inputRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return false
  }
  dateError.value = ''
  return true
}

const onDateRangeChange = () => {
  if (props.disable) return

  if (!internalDateRange.value || internalDateRange.value.length === 0) {
    emit('update:modelValue', [])
    return
  }

  // ✅ เคลียร์ error ถ้ามีการเลือกวันแล้ว
  dateError.value = ''

  // ✅ sort วันใหม่ก่อน emit
  internalDateRange.value = [...internalDateRange.value].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  )
  emit('update:modelValue', internalDateRange.value)
}
const focus = async () => {
  await nextTick()
  inputRef.value?.focus?.()
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(datePopupRef.value as any)?.show?.()
    })
  })
}

defineExpose({ validate, focus })
watch(
  () => props.modelValue,
  (newVal) => {
    internalDateRange.value = [...newVal]
  },
)
</script>

<template>
  <div class="input-group" ref="inputRef">
    <p class="label label_minWidth" :class="{ 'label-error-shift': dateError !== '' }">
      วันที่จัดโครงการ :
    </p>
    <div class="input-container">
      <q-input
        ref="inputRef"
        outlined
        readonly
        :model-value="formattedDateRange"
        class="fix-q-input-height"
        :disable="disable"
        :error="dateError !== ''"
        @focus="focus"
        @keydown.enter.prevent="$emit('enter')"
      >
        <template v-slot:prepend>
          <q-icon
            name="event"
            class="cursor-pointer"
            :class="{ 'disabled-icon': disable }"
            style="color: black"
            @click="datePopupRef?.show()"
          />
        </template>
      </q-input>

        <q-menu ref="datePopupRef" anchor="bottom left" self="top left" :cover="false">
          <q-date
            v-model="internalDateRange"
            mask="YYYY-MM-DD"
            today-btn
            :locale="thaiLocale"
            color="blue-8"
            text-color="white"
            minimal
            first-day-of-week="1"
            class="my-custom-calendar"
            multiple
            @keyup.enter="$emit('enter')"
            @update:model-value="onDateRangeChange"
          />
        </q-menu>


      <div v-if="dateError" class="text-negative text-subtitle2 q-mt-xs">
        {{ dateError }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.label-error-shift {
  transform: translateY(-12px);
}
.input-group {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-bottom: 20px;
}
.label {
  font-size: 20px;
  font-weight: normal;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 40px;
}
.label_minWidth {
  min-width: 200px;
}
.my-custom-calendar {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}
.input-group p {
  align-self: center;
  margin: 0;
  line-height: normal;
  text-align: right;
}

.disabled-icon {
  pointer-events: none;
  opacity: 0.5;
}

.input-container {
  width: 660px;
  max-width: 100%;
}
::v-deep(.q-field--focused .q-field__control) {
  box-shadow: none !important;
  border-color: transparent !important;
}
::v-deep(.q-field__native) {
  caret-color: transparent !important;
}
::v-deep(.q-field__control) {
  height: 40px !important;
  align-items: center;
  padding: 5px 10px;
}

::v-deep(.q-field__prepend) {
  display: flex;
  align-items: center;
}

::v-deep(.q-icon) {
  font-size: 18px;
}
@media (max-width: 1880px) {
  .input-container {
    width: 530px;
    max-width: 100%;
  }
  .label_minWidth {
    min-width: 180px !important;
  }
}
@media (max-width: 860px) {
  .input-group:not(.no-wrap) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 10px !important;
    gap: 5px !important;
  }
  .input-container {
    width: 470px;
    max-width: 100%;
  }
  .label {
    justify-content: flex-start;
  }

  .label_minWidth {
    min-width: unset !important;
    width: 100% !important;
    text-align: left;
    padding-left: 0;
    margin-left: 0;
  }
  .label-error-shift {
    transform: translateY(0px);
  }
}
@media (max-width: 500px) {
  .input-group {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 10px !important;
    gap: 5px !important;
  }

  .label {
    justify-content: flex-start;
  }

  .label_minWidth {
    min-width: unset;
    width: 100%;
    text-align: left;
    padding-left: 0;
    margin-left: 0;
  }
  .input-container {
    width: 100%;
  }
  .label-error-shift {
    transform: translateY(-12px);
  }
}
</style>
