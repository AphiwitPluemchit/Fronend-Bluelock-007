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
const selectedYears = computed(() => props.modelValue);
const yearOptions: YearOption[] = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
];
const toggleYear = (value: string) => {
  if (props.disable) return; // ถ้า disable ห้ามกด
  const newYears = selectedYears.value.includes(value)
    ? selectedYears.value.filter((item) => item !== value)
    : [...selectedYears.value, value];

  emit("update:modelValue", newYears);
};
</script>

<template>
  <div class="input-group">
    <p class="label label_minWidth">ชั้นปี :</p>
    <div class="year-btn-group">
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
  </div>
</template>


<style scoped>
.year-btn {
  width: 80px;
  height: 40px;
  border-radius: 50px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  background-color: #ffffff;
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
.year-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
}

.input-group p {
  align-self: center;
  margin: 0;
  line-height: normal;
  text-align: right;
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
  .input-container {
    width: 100%;
    max-width: 100%;
  }
  .year-btn-group {
    gap: 10px;
}
}
@media (max-width: 450px) {
  .year-btn-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px 20px;
    width: 100%;
  }
  .year-btn {
    width: 100%;
  }
}


</style>
