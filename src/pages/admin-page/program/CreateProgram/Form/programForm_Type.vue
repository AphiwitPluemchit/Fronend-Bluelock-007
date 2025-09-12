<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  modelValue: string
  disable?: boolean // เพิ่ม prop disable
}>()
const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>()
const updateProgramType = (type: string) => {
  if (props.disable) return // ถ้า disable ห้ามกด
  emit('update:modelValue', type)
}
</script>

<template>
  <div class="input-group">
    <p class="label label_minWidth">ประเภทกิจกรรม :</p>
    <div class="programType-btn-group">
    <q-btn
      :class="{ 'active-btn': modelValue === 'prep' }"
      @click="updateProgramType('prep')"
      label="ชั่วโมงเตรียมความพร้อม"
      class="programType-btn"
      :disable="disable"
    />
    <q-btn
      :class="{ 'active-btn': modelValue === 'academic' }"
      @click="updateProgramType('academic')"
      label="ชั่วโมงทักษะทางวิชาการ"
      class="programType-btn"
      :disable="disable"
    />
  </div>
  </div>
</template>

<style scoped>

.programType-btn {
  width: 200px;
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
.programType-btn-group{
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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
@media (max-width: 860px) {
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
@media (max-width: 540px) {
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

  .programType-btn {
  width: 180px;
  height: 40px;
  border-radius: 50px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  background-color: #ffffff;
}
}
@media (max-width: 475px) {
  .programType-btn-group{
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 10px 20px;
    width: 100%;
  }
  .programType-btn {
     width: 100%;
  }
}

</style>
