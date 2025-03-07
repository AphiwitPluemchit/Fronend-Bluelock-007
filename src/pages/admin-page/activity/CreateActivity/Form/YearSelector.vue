<template>
  <div class="input-group">
    <p class="label label_minWidth">ชั้นปี :</p>
    <q-btn
      v-for="option in yearOptions"
      :key="option.value"
      :class="{ 'active-btn': modelValue.includes(option.value) }"
      @click="toggleYear(option.value)"
      :label="option.label"
      class="year-btn"
      :disable="disable" 
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';

interface YearOption {
  label: string;
  value: string;
}

const props = defineProps<{ 
  modelValue: string[];
  disable?: boolean; // เพิ่ม prop disable
}>();

const emit = defineEmits<{ (event: "update:modelValue", value: string[]): void }>();

const yearOptions: YearOption[] = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
];

const selectedYears = computed(() => props.modelValue);

const toggleYear = (value: string) => {
  if (props.disable) return; // ถ้า disable ห้ามกด
  const newYears = selectedYears.value.includes(value)
    ? selectedYears.value.filter((item) => item !== value)
    : [...selectedYears.value, value];

  emit("update:modelValue", newYears);
};
</script>

<style scoped>
.year-btn {
  width: 80px;
  height: 40px;
  border-radius: 50px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  background-color: #ffffff;
  margin-right: 10px;
}
.year-btn:last-child {
  margin-right: 0;
}
.active-btn {
  background-color: #d0e4ff !important;
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
</style>
