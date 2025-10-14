<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue'

const props = defineProps<{
  startTime: string
  endTime: string
  formattedDate: string
  disable?: boolean
}>()
const emit = defineEmits<{
  (event: 'update:startTime', value: string): void
  (event: 'update:endTime', value: string): void
}>()
const extractTime = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return { h: h || 0, m: m || 0 }
}
const { h: startH, m: startM } = extractTime(props.startTime)
const { h: endH, m: endM } = extractTime(props.endTime)
const startHour = ref(startH)
const startMinute = ref(startM)
const endHour = ref(endH)
const endMinute = ref(endM)
const localStartTime = ref(props.startTime)
const localEndTime = ref(props.endTime)
const formatHour = (hour: number): string => hour.toString().padStart(2, '0')
const formatMinute = (minute: number): string => minute.toString().padStart(2, '0')
const formattedStartHour = ref(formatHour(startHour.value))
const formattedStartMinute = ref(formatMinute(startMinute.value))
const formattedEndHour = ref(formatHour(endHour.value))
const formattedEndMinute = ref(formatMinute(endMinute.value))

const adjustHour = (timeType: 'start' | 'end', direction: 'increase' | 'decrease'): void => {
  if (props.disable) return
  if (timeType === 'start') {
    startHour.value =
      direction === 'increase' ? (startHour.value + 1) % 24 : (startHour.value - 1 + 24) % 24
  } else {
    endHour.value =
      direction === 'increase' ? (endHour.value + 1) % 24 : (endHour.value - 1 + 24) % 24
  }
}

const adjustMinute = (timeType: 'start' | 'end', direction: 'increase' | 'decrease'): void => {
  if (props.disable) return
  if (timeType === 'start') {
    startMinute.value =
      direction === 'increase' ? (startMinute.value + 1) % 60 : (startMinute.value - 1 + 60) % 60
  } else {
    endMinute.value =
      direction === 'increase' ? (endMinute.value + 1) % 60 : (endMinute.value - 1 + 60) % 60
  }
}

const padClamp = (str: string, min: number, max: number): number => {
  const num = parseInt(str)
  if (isNaN(num)) return min
  return Math.max(min, Math.min(max, num))
}

const formatTime = (h: number, m: number): string =>
  `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`

const onTimeKeypressLimit = (e: KeyboardEvent, type: 'start' | 'end') => {
  const key = e.key
  const input = e.target as HTMLInputElement
  const raw = input.value.replace(/[^\d]/g, '')

  // ตัวอย่างการใช้ type
  const limit = type === 'start' ? 4 : 4

  if (!/^\d$/.test(key) || raw.length >= limit) {
    e.preventDefault()
  }
}

const onTimeTyping = (val: string | number | null) => {
  if (typeof val !== 'string') return

  let raw = val.replace(/[^\d]/g, '').slice(0, 4)
  if (raw.length < 4) {
    localStartTime.value = raw
    return // ⛔ ยังไม่ emit
  }

  raw = raw.slice(0, 2) + ':' + raw.slice(2)

  const match = raw.match(/^(\d{2}):(\d{2})$/)
  if (!match) {
    localStartTime.value = raw
    return
  }

  const [, hStr, mStr] = match
  if (!hStr || !mStr) return

  const hour = padClamp(hStr, 0, 23)
  const minute = padClamp(mStr, 0, 59)
  const formatted = formatTime(hour, minute)

  startHour.value = hour
  startMinute.value = minute
  localStartTime.value = formatted
  emit('update:startTime', formatted) // ✅ ชัวร์ว่าเป็น string ถูกต้อง
}

const onTimeTypingEnd = (val: string | number | null) => {
  if (typeof val !== 'string') return

  let raw = val.replace(/[^\d]/g, '').slice(0, 4)

  if (raw.length < 4) {
    localEndTime.value = raw
    return
  }

  raw = raw.slice(0, 2) + ':' + raw.slice(2)

  const match = raw.match(/^(\d{2}):(\d{2})$/)
  if (!match) {
    localEndTime.value = raw
    return
  }

  const [, hStr, mStr] = match
  if (!hStr || !mStr) return

  const hour = padClamp(hStr, 0, 23)
  const minute = padClamp(mStr, 0, 59)
  const formatted = formatTime(hour, minute)

  endHour.value = hour
  endMinute.value = minute
  localEndTime.value = formatted
  emit('update:endTime', formatted) // ✅ ปลอดภัย
}

const limitLength = (val: string, type: 'hour' | 'minute', side: 'start' | 'end') => {
  const limited = val.slice(0, 2)

  if (type === 'hour') {
    if (side === 'start') formattedStartHour.value = limited
    else formattedEndHour.value = limited
  } else if (type === 'minute') {
    if (side === 'start') formattedStartMinute.value = limited
    else formattedEndMinute.value = limited
  }
}

watch([startHour, startMinute], () => {
  localStartTime.value = formatTime(startHour.value, startMinute.value)
  emit('update:startTime', localStartTime.value)
})

watch([endHour, endMinute], () => {
  localEndTime.value = formatTime(endHour.value, endMinute.value)
  emit('update:endTime', localEndTime.value)
})

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

watch(startHour, (val) => (formattedStartHour.value = formatHour(val)))
watch(startMinute, (val) => (formattedStartMinute.value = formatMinute(val)))
watch(endHour, (val) => (formattedEndHour.value = formatHour(val)))
watch(endMinute, (val) => (formattedEndMinute.value = formatMinute(val)))
watch(localStartTime, (val) => {
  const match = val?.match(/^(\d{2}):(\d{2})$/)
  if (!match) {
    localStartTime.value = formatTime(startHour.value, startMinute.value)
  }
})

watch(localEndTime, (val) => {
  if (!/^(\d{2}):(\d{2})$/.test(val ?? '')) {
    localEndTime.value = formatTime(endHour.value, endMinute.value)
  }
})
watch(
  () => props.startTime,
  (newVal) => {
    localStartTime.value = newVal
  },
)

watch(
  () => props.endTime,
  (newVal) => {
    localEndTime.value = newVal
  },
)
</script>

<template>
  <div class="date-container">
    <div class="day-label">{{ formattedDate }}</div>

    <div class="time-row">
      <div class="time-inputs">
        <!-- Start Time -->
        <q-input
          outlined
          :model-value="localStartTime"
          class="input-container"
          :disable="disable"
          input-mode="numeric"
          @keypress="(e: KeyboardEvent) => onTimeKeypressLimit(e, 'start')"
          @update:model-value="onTimeTyping"
        >
          <template v-slot:prepend>
            <q-icon
              name="access_time"
              class="cursor-pointer"
              style="color: black"
              :class="{ 'disabled-icon': disable }"
            >
              <q-menu ref="menuStart" class="time-picker-card" v-if="!disable">
                <div class="time-container">
                  <div class="time-column">
                    <q-btn
                      flat
                      dense
                      icon="arrow_drop_up"
                      @click="adjustHour('start', 'increase')"
                      :disable="disable"
                    />
                    <q-input
                      dense
                      outlined
                      v-model="formattedStartHour"
                      type="text"
                      input-class="text-center"
                      style="width: 40px"
                      :disable="disable"
                      @input="limitLength($event, 'hour', 'start')"
                    />
                    <q-btn
                      flat
                      dense
                      icon="arrow_drop_down"
                      @click="adjustHour('start', 'decrease')"
                      :disable="disable"
                    />
                  </div>
                  <div class="separator">:</div>
                  <div class="time-column">
                    <q-btn
                      flat
                      dense
                      icon="arrow_drop_up"
                      @click="adjustMinute('start', 'increase')"
                      :disable="disable"
                    />
                    <q-input
                      dense
                      outlined
                      v-model="formattedStartMinute"
                      type="text"
                      input-class="text-center"
                      style="width: 40px"
                      :disable="disable"
                      @input="limitLength($event, 'minute', 'start')"
                    />
                    <q-btn
                      flat
                      dense
                      icon="arrow_drop_down"
                      @click="adjustMinute('start', 'decrease')"
                      :disable="disable"
                    />
                  </div>
                </div>
              </q-menu>
            </q-icon>
          </template>
        </q-input>

        <p class="time-separator">ถึง</p>

        <!-- End Time -->
        <q-input
          outlined
          :model-value="localEndTime"
          class="input-container"
          :disable="disable"
          input-mode="numeric"
          @keypress="(e: KeyboardEvent) => onTimeKeypressLimit(e, 'end')"
          @update:model-value="onTimeTypingEnd"
        >
          <template v-slot:prepend>
            <q-icon
              name="access_time"
              class="cursor-pointer"
              :class="{ 'disabled-icon': disable }"
              style="color: black"
            >
              <q-menu ref="menuEnd" class="time-picker-card" v-if="!disable">
                <div class="time-container">
                  <div class="time-column">
                    <q-btn
                      flat
                      dense
                      icon="arrow_drop_up"
                      @click="adjustHour('end', 'increase')"
                      :disable="disable"
                    />
                    <q-input
                      dense
                      outlined
                      v-model="formattedEndHour"
                      type="text"
                      input-class="text-center"
                      style="width: 40px"
                      :disable="disable"
                      @input="limitLength($event, 'hour', 'end')"
                    />
                    <q-btn
                      flat
                      dense
                      icon="arrow_drop_down"
                      @click="adjustHour('end', 'decrease')"
                      :disable="disable"
                    />
                  </div>
                  <div class="separator">:</div>
                  <div class="time-column">
                    <q-btn
                      flat
                      dense
                      icon="arrow_drop_up"
                      @click="adjustMinute('end', 'increase')"
                      :disable="disable"
                    />
                    <q-input
                      dense
                      outlined
                      v-model="formattedEndMinute"
                      type="text"
                      input-class="text-center"
                      style="width: 40px"
                      :disable="disable"
                      @input="limitLength($event, 'minute', 'end')"
                    />
                    <q-btn
                      flat
                      dense
                      icon="arrow_drop_down"
                      @click="adjustMinute('end', 'decrease')"
                      :disable="disable"
                    />
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

.input-container {
  width: 220px;
  max-width: 100%;
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
@media (max-width: 1880px) {
  .input-container {
    width: 200px;
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
@media (max-width: 550px) {
  .input-container {
    width: 170px;
    max-width: 100%;
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
    max-width: 100%;
  }
}
</style>
