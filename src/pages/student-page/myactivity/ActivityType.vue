<template>
  <q-btn
    :label="buttonLabel"
    outline
    rounded
    class="category-btn q-ml-md text-h7"
    :class="buttonClass"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  skill: String, // 'softSkill' หรือ 'hardSkill'
})

// คำนวณป้ายชื่อปุ่ม
const buttonLabel = computed(() => {
  return props.skill === 'hardSkill' ? 'ทักษะทางวิชาการ' : 'เตรียมความพร้อม'
})

// กำหนดคลาสสีของปุ่ม
const buttonClass = computed(() => {
  return props.skill === 'hardSkill' ? 'hard-skill' : 'soft-skill'
})
</script>

<style scoped>
/* ทักษะทางวิชาการ*/
.hard-skill {
  color: #001780;
  border: 1px solid #002dff;
  background-color: #cfd7ff;
}

/* เตรียมความพร้อม */
.soft-skill {
  color: #009812;
  border: 1px solid #00bb16;
  background-color: #d0ffc5;
}
.category-btn {
  padding: 4px 12px;
  font-size: 16px;
}
</style>
