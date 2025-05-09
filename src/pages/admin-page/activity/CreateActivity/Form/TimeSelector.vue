<template>
  <div class="date-container">
    <div class="day-label">{{ formattedDate }}</div>

    <div class="time-row">
      <div class="time-inputs">
        <!-- Start Time -->
        <q-input outlined v-model="localStartTime" class="time-box" :disable="disable"
          @blur="onManualTimeInput('start')" input-mode="numeric" @keypress="isNumberOrColon">
          <template v-slot:prepend>
            <q-icon name="access_time" class="cursor-pointer" style="color: black;"
              :class="{ 'disabled-icon': disable }">
              <q-menu ref="menuStart" class="time-picker-card" v-if="!disable">
                <div class="time-container">
                  <div class="time-column">
                    <q-btn flat dense icon="arrow_drop_up" @click="adjustHour('start', 'increase')"
                      :disable="disable" />
                    <q-input dense outlined v-model="formattedStartHour" type="text" input-class="text-center"
                      style="width: 40px" :disable="disable" @blur="onBlurHour('start')" @keypress="isNumber"
                      @input="limitLength($event, 'hour', 'start')" />
                    <q-btn flat dense icon="arrow_drop_down" @click="adjustHour('start', 'decrease')"
                      :disable="disable" />
                  </div>
                  <div class="separator">:</div>
                  <div class="time-column">
                    <q-btn flat dense icon="arrow_drop_up" @click="adjustMinute('start', 'increase')"
                      :disable="disable" />
                    <q-input dense outlined v-model="formattedStartMinute" type="text" input-class="text-center"
                      style="width: 40px" :disable="disable" @blur="onBlurMinute('start')" @keypress="isNumber"
                      @input="limitLength($event, 'minute', 'start')" />
                    <q-btn flat dense icon="arrow_drop_down" @click="adjustMinute('start', 'decrease')"
                      :disable="disable" />
                  </div>
                </div>
              </q-menu>
            </q-icon>
          </template>
        </q-input>

        <p class="time-separator">ถึง</p>

        <!-- End Time -->
        <q-input outlined v-model="localEndTime" class="time-box" :disable="disable" @blur="onManualTimeInput('end')"
          input-mode="numeric" @keypress="isNumberOrColon">
          <template v-slot:prepend>
            <q-icon name="access_time" class="cursor-pointer" :class="{ 'disabled-icon': disable }"
              style="color: black;">
              <q-menu ref="menuEnd" class="time-picker-card" v-if="!disable">
                <div class="time-container">
                  <div class="time-column">
                    <q-btn flat dense icon="arrow_drop_up" @click="adjustHour('end', 'increase')" :disable="disable" />
                    <q-input dense outlined v-model="formattedEndHour" type="text" input-class="text-center"
                      style="width: 40px" :disable="disable" @blur="onBlurHour('end')" @keypress="isNumber"
                      @input="limitLength($event, 'hour', 'end')" />
                    <q-btn flat dense icon="arrow_drop_down" @click="adjustHour('end', 'decrease')"
                      :disable="disable" />
                  </div>
                  <div class="separator">:</div>
                  <div class="time-column">
                    <q-btn flat dense icon="arrow_drop_up" @click="adjustMinute('end', 'increase')"
                      :disable="disable" />
                    <q-input dense outlined v-model="formattedEndMinute" type="text" input-class="text-center"
                      style="width: 40px" :disable="disable" @blur="onBlurMinute('end')" @keypress="isNumber"
                      @input="limitLength($event, 'minute', 'end')" />
                    <q-btn flat dense icon="arrow_drop_down" @click="adjustMinute('end', 'decrease')"
                      :disable="disable" />
                  </div>
                </div>
              </q-menu>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';

// ✅ รับค่าจาก props
const props = defineProps<{
  startTime: string;
  endTime: string;
  formattedDate: string;
  disable?: boolean; // เพิ่ม prop disable
}>();

const isNumberOrColon = (event: KeyboardEvent) => {
  const charCode = event.which ? event.which : event.keyCode;
  // อนุญาตเฉพาะตัวเลข (48–57) และ colon (58)
  if ((charCode < 48 || charCode > 57) && charCode !== 58) {
    event.preventDefault();
  }
};

const emit = defineEmits<{
  (event: 'update:startTime', value: string): void;
  (event: 'update:endTime', value: string): void;
}>();

// ✅ แปลงค่า startTime และ endTime เป็นชั่วโมงและนาที
const extractTime = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return { h: h || 0, m: m || 0 };
};

const { h: startH, m: startM } = extractTime(props.startTime);
const { h: endH, m: endM } = extractTime(props.endTime);

// ✅ กำหนดค่าเริ่มต้นจาก props
const startHour = ref(startH);
const startMinute = ref(startM);
const endHour = ref(endH);
const endMinute = ref(endM);

const localStartTime = ref(props.startTime);
const localEndTime = ref(props.endTime);


// ✅ อัปเดต localStartTime และส่งค่ากลับไปยัง parent
watch([startHour, startMinute], () => {
  localStartTime.value = formatTime(startHour.value, startMinute.value);
  emit('update:startTime', localStartTime.value);
});

watch([endHour, endMinute], () => {
  localEndTime.value = formatTime(endHour.value, endMinute.value);
  emit('update:endTime', localEndTime.value);
});

// ✅ ฟังก์ชันสำหรับจัดรูปแบบเวลา
const formatTime = (h: number, m: number): string =>
  `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`

const formatHour = (hour: number): string => hour.toString().padStart(2, '0');
const formatMinute = (minute: number): string => minute.toString().padStart(2, '0');

const adjustHour = (timeType: 'start' | 'end', direction: 'increase' | 'decrease'): void => {
  if (props.disable) return;
  if (timeType === 'start') {
    startHour.value = direction === 'increase' ? (startHour.value + 1) % 24 : (startHour.value - 1 + 24) % 24;
  } else {
    endHour.value = direction === 'increase' ? (endHour.value + 1) % 24 : (endHour.value - 1 + 24) % 24;
  }
};

const adjustMinute = (timeType: 'start' | 'end', direction: 'increase' | 'decrease'): void => {
  if (props.disable) return;
  if (timeType === 'start') {
    startMinute.value = direction === 'increase' ? (startMinute.value + 1) % 60 : (startMinute.value - 1 + 60) % 60;
  } else {
    endMinute.value = direction === 'increase' ? (endMinute.value + 1) % 60 : (endMinute.value - 1 + 60) % 60;
  }
};
const onManualTimeInput = (type: 'start' | 'end') => {
  const raw = type === 'start' ? localStartTime.value : localEndTime.value;
  const value = raw ?? '';
  const regex = /^(\d{1,2}):(\d{2})$/;
  const match = value.match(regex);

  if (match) {
    const [, hourStr, minuteStr] = match;
    const h = Math.min(23, Math.max(0, Number(hourStr)));
    const m = Math.min(59, Math.max(0, Number(minuteStr)));

    if (type === 'start') {
      startHour.value = h;
      startMinute.value = m;
    } else {
      endHour.value = h;
      endMinute.value = m;
    }
  } else {
    if (type === 'start') {
      localStartTime.value = formatTime(startHour.value, startMinute.value);
    } else {
      localEndTime.value = formatTime(endHour.value, endMinute.value);
    }
  }
};
const formattedStartHour = ref(formatHour(startHour.value))
const formattedStartMinute = ref(formatMinute(startMinute.value))
const formattedEndHour = ref(formatHour(endHour.value))
const formattedEndMinute = ref(formatMinute(endMinute.value))

// ✅ Watch ต้นฉบับ → อัปเดตฟอร์แมต
watch(startHour, val => formattedStartHour.value = formatHour(val))
watch(startMinute, val => formattedStartMinute.value = formatMinute(val))
watch(endHour, val => formattedEndHour.value = formatHour(val))
watch(endMinute, val => formattedEndMinute.value = formatMinute(val))

const onBlurHour = (type: 'start' | 'end') => {
  const input = type === 'start' ? formattedStartHour.value : formattedEndHour.value
  const num = parseInt(input)
  if (!isNaN(num)) {
    if (type === 'start') startHour.value = num
    else endHour.value = num
  }

  if (type === 'start') {
    formattedStartHour.value = startHour.value.toString().padStart(2, '0')
  } else {
    formattedStartHour.value = endHour.value.toString().padStart(2, '0')
  }
}

const onBlurMinute = (type: 'start' | 'end') => {
  const input = type === 'start' ? formattedStartMinute.value : formattedEndMinute.value
  const num = parseInt(input)
  if (!isNaN(num)) {
    if (type === 'start') startMinute.value = num
    else endMinute.value = num
  }

  if (type === 'start') {
    formattedStartMinute.value = startMinute.value.toString().padStart(2, '0')
  } else {
    formattedEndMinute.value = endMinute.value.toString().padStart(2, '0')
  }
}

const isNumber = (event: KeyboardEvent) => {
  const key = event.key
  if (!/^[0-9]$/.test(key)) {
    event.preventDefault()
  }
}
const padClamp = (str: string, min: number, max: number): number => {
  const num = parseInt(str)
  if (isNaN(num)) return min
  return Math.max(min, Math.min(max, num))
}

watch([formattedStartHour, formattedStartMinute], ([h, m]) => {
  const hour = padClamp(h, 0, 23)
  const minute = padClamp(m, 0, 59)
  startHour.value = hour
  startMinute.value = minute
  localStartTime.value = formatTime(hour, minute)
  emit('update:startTime', localStartTime.value)
})

watch([formattedEndHour, formattedEndMinute], ([h, m]) => {
  const hour = padClamp(h, 0, 23)
  const minute = padClamp(m, 0, 59)
  endHour.value = hour
  endMinute.value = minute
  localEndTime.value = formatTime(hour, minute)
  emit('update:endTime', localEndTime.value)
})
watch(formattedStartHour, (val) => {
  if (!/^\d{2}$/.test(val)) {
    const padded = padClamp(val, 0, 23).toString().padStart(2, '0')
    formattedStartHour.value = padded
  }
})
watch(formattedStartMinute, (val) => {
  if (!/^\d{2}$/.test(val)) {
    const padded = padClamp(val, 0, 59).toString().padStart(2, '0')
    formattedStartMinute.value = padded
  }
})

watch(formattedEndHour, (val) => {
  if (!/^\d{2}$/.test(val)) {
    const padded = padClamp(val, 0, 23).toString().padStart(2, '0')
    formattedEndHour.value = padded
  }
})
watch(formattedEndMinute, (val) => {
  if (!/^\d{2}$/.test(val)) {
    const padded = padClamp(val, 0, 59).toString().padStart(2, '0')
    formattedEndMinute.value = padded
  }
})

const limitLength = (val: string, type: 'hour' | 'minute', side: 'start' | 'end') => {
  const limited = val.slice(0, 2)

  if (type === 'hour') {
    if (side === 'start') formattedStartHour.value = limited
    else formattedEndHour.value = limited
  } else if(type==='minute') {
    if (side === 'start') formattedStartMinute.value = limited
    else formattedEndMinute.value = limited
  }
}


</script>

<style scoped>
.time-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 10px;
}

.time-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.date-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 10px;
}

.day-label {
  font-size: 14px;
  text-align: left;

}

.time-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-box {
  width: 220px !important;
}

.time-picker-card {
  max-width: 200px;
  min-height: 150px;
  padding: 10px;
}


.separator {
  font-weight: bold;
}

.time-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  margin: 0 10px;
}

.input-group p {
  align-self: center;
  margin: 0;
  line-height: normal;
  text-align: right;
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

.time-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-box {
  width: 200px;
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

::v-deep(input[type='number'])::-webkit-inner-spin-button,
::v-deep(input[type='number'])::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

::v-deep(input[type='number']) {
  -moz-appearance: textfield;
}
</style>
