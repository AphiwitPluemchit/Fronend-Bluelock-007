<script setup lang="ts">
import { defineProps, defineEmits, computed, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  disable?: boolean
}>()
const CloseRegisDates = ref<string>(props.modelValue)
const datePopupRef = ref(null)
const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>()

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
const onDateChange = () => {
  if (props.disable) return
  emit('update:modelValue', CloseRegisDates.value)
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
    CloseRegisDates.value = newVal
  },
)
</script>

<template>
  <div class="input-group">
    <p class="label label_minWidth">วันที่ปิดลงทะเบียน :</p>
    <q-input
      outlined
      :model-value="formattedCloseRegisDate"
      readonly
      class="input-container"
      :disable="disable"
    >
      <template v-slot:prepend>
        <q-icon
          name="event"
          class="cursor-pointer"
          :class="{ 'disabled-icon': disable }"
          style="color: black"
        >
          <q-menu ref="datePopupRef" style="overflow: visible" v-if="!disable">
            <q-date
              v-model="CloseRegisDates"
              mask="YYYY-MM-DD"
              today-btn
              :locale="thaiLocale"
              color="blue-8"
              text-color="white"
              minimal
              first-day-of-week="1"
              class="my-custom-calendar"
              @update:model-value="onDateChange"
            />
          </q-menu>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

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

.disabled-icon {
  pointer-events: none;
  opacity: 0.5;
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
.input-container {
  width: 660px;
  max-width: 100%;
}
@media(max-width: 1880px){
  .input-container {
    width: 530px;
    max-width: 100%;
  }
  .label_minWidth {
    min-width: 180px !important;
  }
}
@media (max-width: 850px) {
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
