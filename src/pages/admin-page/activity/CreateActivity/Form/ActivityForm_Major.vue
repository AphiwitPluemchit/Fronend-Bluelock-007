<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface DepartmentOption {
  label: string
  value: string
  id: string
}
const props = defineProps<{
  modelValue: string[]
  disable?: boolean // เพิ่ม prop disable
}>()
const emit = defineEmits<{ (event: 'update:modelValue', value: string[]): void }>()
const departmentOptions: DepartmentOption[] = [
  { label: 'CS', value: 'CS', id: '67bf0c358873e448798fed37' },
  { label: 'SE', value: 'SE', id: '67bf0bdf8873e448798fed36' },
  { label: 'ITDI', value: 'ITDI', id: '67bf0bda8873e448798fed35' },
  { label: 'AAI', value: 'AAI', id: '67bf0bd48873e448798fed34' },
]
const toggleDepartment = (value: string) => {
  if (props.disable) return // ถ้า disable ห้ามกด
  const newDepartments = props.modelValue.includes(value)
    ? props.modelValue.filter((item) => item !== value)
    : [...props.modelValue, value]
  emit('update:modelValue', newDepartments)
}
</script>

<template>
  <div class="input-group">
    <p class="label label_minWidth">สาขา :</p>
    <div class="department-btn-group">
    <q-btn
      v-for="option in departmentOptions"
      :key="option.value"
      :class="{ 'active-btn': modelValue.includes(option.value) }"
      @click="toggleDepartment(option.value)"
      :label="option.label"
      class="department-btn"
      :disable="disable"
    />
    </div>
  </div>
</template>

<style scoped>
.department-btn {
  width: 80px;
  height: 40px;
  border-radius: 50px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  background-color: #ffffff;

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
.department-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
}
@media(max-width: 1880px){
  .input-container {
    width: 500px;
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
  .department-btn-group{
    gap: 10px;
  }
}
@media (max-width: 450px) {
  .department-btn-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px 20px;
    width: 100%;
  }
  .department-btn {
    width: 100%;
  }
}


</style>
