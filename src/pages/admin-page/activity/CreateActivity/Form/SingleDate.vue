<template>
  <div class="input-group">
    <p class="label label_minWidth">วันที่จัดกิจกรรม :</p>
    <q-input outlined v-model="formattedDate" style="width: 600px" readonly  :disable="!props.isEditing">
      <template v-slot:prepend>
        <q-icon name="event">
          <q-menu style="overflow: visible">
            <q-date
              v-model="selectedDate"
              mask="YYYY-MM-DD"
              today-btn
              :locale="thaiLocale"
              color="blue-8"
              text-color="white"
              minimal
              first-day-of-week="1"
              class="my-custom-calendar"
            />
          </q-menu>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits, ref, watch } from 'vue'

const props = defineProps({
  modelValue: String,
  isEditing: Boolean, // รับค่า isEditing จาก parent
})

const emit = defineEmits(['update:modelValue'])

const selectedDate = ref(props.modelValue || '')

// คำนวณรูปแบบวันที่ให้เป็นแบบไทย
const formattedDate = computed(() => {
  if (!selectedDate.value) return ''
  
  const parts = selectedDate.value.split('-')
  if (parts.length !== 3) return ''

  const [year, month, day] = parts
  if (!year || !month || !day) return ''

  const monthIndex = parseInt(month, 10) - 1
  if (monthIndex < 0 || monthIndex >= thaiLocale.months.length) return ''

  const thaiMonth = thaiLocale.months[monthIndex]
  const thaiYear = parseInt(year, 10) + 543

  return `${parseInt(day, 10)} ${thaiMonth} ${thaiYear}`
})

// อัปเดตค่าเมื่อมีการเลือกวันใหม่
watch(selectedDate, (newDate) => {
  emit('update:modelValue', newDate)
})

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
