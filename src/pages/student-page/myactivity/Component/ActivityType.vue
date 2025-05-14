<template>
  <q-btn :label="buttonLabel" :class="buttonClass" class="category-btn" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  skill: 'hardSkill' | 'softSkill'
}

// กำหนด props สำหรับรับค่า
const props = defineProps<Props>()

// กำหนดข้อความที่จะแสดงในปุ่ม
const buttonLabel = computed(() => {
  return props.skill === 'hardSkill' ? 'ทักษาทางวิชาการ' : 'เตรียมความพร้อม'
})

// กำหนดคลาสของปุ่มตามประเภททักษะ
const buttonClass = computed(() => {
  return props.skill === 'hardSkill' ? 'hard-skill' : 'soft-skill'
})
</script>

<style scoped>
/* สำหรับทักษาทางวิชาการ (HardSkill) */
.hard-skill {
  color: #001780;
  border: 2px solid #002dff; /* สีขอบ */
  background-color: #cfd7ff; /* สีพื้นหลัง */
}

/* สำหรับเตรียมความพร้อม (SoftSkill) */
.soft-skill {
  color: #009812;
  border: 2px solid #00bb16; /* สีขอบ */
  background-color: #d2ffc7; /* สีพื้นหลัง */
}

/* ปรับขนาดปุ่ม */
.category-btn {
  padding: 4px 12px;
  font-size: 16px;
  border-radius: 20px; /* ทำให้ปุ่มมน */
}
</style>
