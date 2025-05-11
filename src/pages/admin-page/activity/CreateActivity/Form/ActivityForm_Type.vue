<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  modelValue: string
  disable?: boolean // เพิ่ม prop disable
}>()
const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>()
const updateActivityType = (type: string) => {
  if (props.disable) return // ถ้า disable ห้ามกด
  emit('update:modelValue', type)
}
</script>

<template>
  <div class="input-group">
    <p class="label label_minWidth">ประเภทกิจกรรม :</p>
    <q-btn
      :class="{ 'active-btn': modelValue === 'prep' }"
      @click="updateActivityType('prep')"
      label="ชั่วโมงเตรียมความพร้อม"
      class="activityType-btn"
      :disable="disable"
    />
    <q-btn
      :class="{ 'active-btn': modelValue === 'academic' }"
      @click="updateActivityType('academic')"
      label="ชั่วโมงทักษะทางวิชาการ"
      class="activityType-btn"
      :disable="disable"
    />
  </div>
</template>

<style scoped>
.activityType-btn {
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
</style>
