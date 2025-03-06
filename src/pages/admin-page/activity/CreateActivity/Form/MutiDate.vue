<template>
  <div class="input-group">
    <p class="label label_minWidth">วันที่จัดกิจกรรม :</p>
    <q-input outlined v-model="formattedDateRange" style="width: 600px" readonly>
      <template v-slot:prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-menu ref="datePopupRef" style="overflow: visible">
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
              @update:model-value="onDateRangeChange"
            />
          </q-menu>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed, ref, watch } from 'vue'

const props = defineProps<{ modelValue: string[] }>()
const emit = defineEmits<{ (event: 'update:modelValue', value: string[]): void }>()

const internalDateRange = ref<string[]>([...props.modelValue])
const datePopupRef = ref(null)

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

const formattedDateRange = computed(() => {
  return internalDateRange.value.length > 0
    ? internalDateRange.value.map((date) => formatThaiDate(date)).join(', ')
    : ''
})

const onDateRangeChange = () => {
  internalDateRange.value = [...internalDateRange.value].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  )
  emit('update:modelValue', internalDateRange.value)
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

watch(
  () => props.modelValue,
  (newVal) => {
    internalDateRange.value = [...newVal]
  },
)
</script>

<style scoped>
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
</style>
