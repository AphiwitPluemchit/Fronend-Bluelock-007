<template>
  <div class="date-container">
    <div class="day-label">{{ formattedDate }}</div>

    <div class="time-row">
      <div class="time-inputs">
        <!-- Start Time -->
        <q-input outlined v-model="localStartTime" class="time-box" readonly :disable="disable">
          <template v-slot:prepend>
            <q-icon name="access_time" class="cursor-pointer" :class="{ 'disabled-icon': disable }">
              <q-menu ref="menuStart" class="time-picker-card" v-if="!disable">
                <div class="time-container">
                  <div class="time-column">
                    <q-btn flat dense icon="arrow_drop_up" @click="adjustHour('start', 'increase')" :disable="disable" />
                    <div class="time-display">{{ formatHour(startHour) }}</div>
                    <q-btn flat dense icon="arrow_drop_down" @click="adjustHour('start', 'decrease')" :disable="disable" />
                  </div>
                  <div class="separator">:</div>
                  <div class="time-column">
                    <q-btn flat dense icon="arrow_drop_up" @click="adjustMinute('start', 'increase')" :disable="disable" />
                    <div class="time-display">{{ formatMinute(startMinute) }}</div>
                    <q-btn flat dense icon="arrow_drop_down" @click="adjustMinute('start', 'decrease')" :disable="disable" />
                  </div>
                </div>
              </q-menu>
            </q-icon>
          </template>
        </q-input>

        <p class="time-separator">ถึง</p>

        <!-- End Time -->
        <q-input outlined v-model="localEndTime" class="time-box" readonly :disable="disable">
          <template v-slot:prepend>
            <q-icon name="access_time" class="cursor-pointer" :class="{ 'disabled-icon': disable }">
              <q-menu ref="menuEnd" class="time-picker-card" v-if="!disable">
                <div class="time-container">
                  <div class="time-column">
                    <q-btn flat dense icon="arrow_drop_up" @click="adjustHour('end', 'increase')" :disable="disable" />
                    <div class="time-display">{{ formatHour(endHour) }}</div>
                    <q-btn flat dense icon="arrow_drop_down" @click="adjustHour('end', 'decrease')" :disable="disable" />
                  </div>
                  <div class="separator">:</div>
                  <div class="time-column">
                    <q-btn flat dense icon="arrow_drop_up" @click="adjustMinute('end', 'increase')" :disable="disable" />
                    <div class="time-display">{{ formatMinute(endMinute) }}</div>
                    <q-btn flat dense icon="arrow_drop_down" @click="adjustMinute('end', 'decrease')" :disable="disable" />
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

// ✅ Watch ค่า startTime และ endTime จาก props เพื่อให้ UI อัปเดตตาม
watch(() => props.startTime, (newVal) => {
  const { h, m } = extractTime(newVal);
  startHour.value = h;
  startMinute.value = m;
  localStartTime.value = formatTime(h, m);
});

watch(() => props.endTime, (newVal) => {
  const { h, m } = extractTime(newVal);
  endHour.value = h;
  endMinute.value = m;
  localEndTime.value = formatTime(h, m);
});

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
const formatTime = (h: number, m: number): string => {
  return `${formatHour(h)}:${formatMinute(m)}`;
};

const formatHour = (hour: number): string => hour.toString().padStart(2, '0');
const formatMinute = (minute: number): string => minute.toString().padStart(2, '0');

// ✅ ปรับค่าเวลาเมื่อกดปุ่มเพิ่ม/ลด
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
  width: 400px;
  max-width: 100%;
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
  font-size: 18px; /* ปรับขนาดไอคอนให้เล็กลง */
}
</style>
