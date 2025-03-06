<template>
  <div class="input-group">
    <p class="label label_minWidth">สาขา :</p>
    <q-btn
      v-for="option in departmentOptions"
      :key="option.value"
      :class="{ 'active-btn': modelValue.includes(option.value) }"
      @click="toggleDepartment(option.value)"
      :label="option.label"
      class="department-btn"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

interface DepartmentOption {
  label: string;
  value: string;
}

const props = defineProps<{ modelValue: string[] }>();
const emit = defineEmits<{ (event: "update:modelValue", value: string[]): void }>();

const departmentOptions: DepartmentOption[] = [
  { label: 'CS', value: 'cs' },
  { label: 'SE', value: 'se' },
  { label: 'ITDI', value: 'itdi' },
  { label: 'AAI', value: 'aai' },
];

const toggleDepartment = (value: string) => {
  const newDepartments = props.modelValue.includes(value)
    ? props.modelValue.filter((item) => item !== value)
    : [...props.modelValue, value];
  emit("update:modelValue", newDepartments);
};
</script>

<style scoped>
.department-btn {
  width: 80px;
  height: 40px;
  border-radius: 50px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  background-color: #ffffff;
  margin-right: 10px;
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
