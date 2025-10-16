<script setup lang="ts">
import { defineProps, defineEmits, computed, ref, watch, nextTick } from 'vue'

const props = defineProps<{
  modelValue: string
  disable?: boolean
}>()

const CloseRegisDates = ref<string>(props.modelValue)
const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'enter'): void
}>()
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const menuRef = ref<InstanceType<(typeof import('quasar'))['QMenu']> | null>(null)
const closedateError = ref('')
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const inputRef = ref<InstanceType<(typeof import('quasar'))['QInput']> | null>(null)

const onDateChange = () => {
  if (props.disable) return
  emit('update:modelValue', CloseRegisDates.value)
  if (CloseRegisDates.value) {
    closedateError.value = ''
  }
}

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

const formattedCloseRegisDate = computed(() => {
  return CloseRegisDates.value ? formatThaiDate(CloseRegisDates.value) : ''
})

const formatThaiDate = (dateStr: string): string => {
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

watch(
  () => props.modelValue,
  (newVal) => {
    CloseRegisDates.value = newVal
    if (newVal) closedateError.value = ''
  },
)

const validate = async () => {
  if (!CloseRegisDates.value || CloseRegisDates.value.length === 0) {
    closedateError.value = 'กรุณาเลือกวันที่ปิดลงทะเบียน'
    await nextTick()
    inputRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return false
  }

  closedateError.value = ''
  return true
}

const focus = async () => {
  await nextTick()
  inputRef.value?.focus?.()
  menuRef.value?.show()
}
const handleKeydown = async (event: KeyboardEvent) => {
  console.log('handleKeydown triggered. Key:', event.key) // <--- ADD THIS
  if (event.key === 'Enter') {
    event.preventDefault()
    event.stopPropagation()
    console.log('Enter pressed. CloseRegisDates.value:', CloseRegisDates.value) // <--- ADD THIS
    if (CloseRegisDates.value) {
      console.log('Date is selected, attempting to hide menu.') // <--- ADD THIS
      emit('enter')
      await nextTick()
      menuRef.value?.hide()
      // Optional: Check if menu is still showing after attempting to hide
      // await nextTick(); // ensure DOM updates
      // console.log('Is menu showing after hide attempt?', menuRef.value?.showing);
    } else {
      console.log('Enter pressed, but CloseRegisDates.value is falsy.') // <--- ADD THIS
    }
  }
}

defineExpose({ validate, focus })
</script>

<template>
  <div class="input-group">
    <p class="label label_minWidth" :class="{ 'label-error-shift': closedateError !== '' }">
      วันที่ปิดลงทะเบียน :
    </p>
    <div class="input-container">
      <q-input
        ref="inputRef"
        outlined
        readonly
        :model-value="formattedCloseRegisDate"
        :disable="disable"
        :error="closedateError !== ''"
        @focus="focus"
      >
        <template v-slot:prepend>
          <q-icon
            name="event"
            class="cursor-pointer"
            :class="{ 'disabled-icon': disable }"
            style="color: black"
          />
        </template>
      </q-input>

      <q-menu
        ref="menuRef"
        :target="inputRef?.$el"
        anchor="bottom left"
        self="top left"
        :cover="false"
      >
        <q-date
          v-model="CloseRegisDates"
          mask="YYYY-MM-DD"
          :locale="thaiLocale"
          color="blue-8"
          text-color="white"
          minimal
          first-day-of-week="1"
          class="my-custom-calendar"
          @keydown.enter.stop.prevent="handleKeydown"
          @update:model-value="onDateChange"
        />
      </q-menu>

      <div v-if="closedateError" class="text-negative text-subtitle2 q-mt-xs">
        {{ closedateError }}
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

::v-deep(.q-field__control) {
  height: 40px !important;
  align-items: center;
  padding: 5px 10px;
}
::v-deep(.q-field__native) {
  caret-color: transparent !important;
}
::v-deep(.q-field__prepend) {
  display: flex;
  align-items: center;
}
::v-deep(.q-field--focused .q-field__control) {
  box-shadow: none !important;
  border-color: transparent !important;
}
::v-deep(.q-icon) {
  font-size: 18px;
}
.input-container {
  width: 660px;
  max-width: 100%;
}
@media (max-width: 1880px) {
  .input-container {
    width: 530px;
    max-width: 100%;
  }
  .label_minWidth {
    min-width: 180px !important;
  }
  .label-error-shift {
    transform: translateY(-12px);
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
  .label-error-shift {
    transform: translateY(0px);
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
}
</style>
