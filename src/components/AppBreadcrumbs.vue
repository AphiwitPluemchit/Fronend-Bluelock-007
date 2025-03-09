<template>
  <q-breadcrumbs>
    <!-- แสดงรายการ breadcrumbs ที่มี previousPage -->
    <q-breadcrumbs-el>
      <!-- ตรวจสอบว่า icon เป็นรูปภาพหรือไอคอนจาก Quasar -->
      <template v-if="isImageIcon(filteredBreadcrumbs.icon)">
        <img :src="filteredBreadcrumbs.icon" alt="icon" class="icon-image q-mr-sm" />
      </template>
      <template v-else>
        <q-icon :name="filteredBreadcrumbs.icon" size="md" class="q-mr-sm" />
      </template>
      <router-link :to="filteredBreadcrumbs.previousPage?.path ?? '/'" class="text-bold text-h6">
        {{ filteredBreadcrumbs.previousPage?.title }} >
      </router-link>
    </q-breadcrumbs-el>
    <!-- แสดง currentPage จาก breadcrumb ล่าสุด -->
    <div class="text-h6" style="text-decoration-line: underline">
      {{ filteredBreadcrumbs.currentPage.title }}
    </div>
  </q-breadcrumbs>
  <div class="text-h6 q-mt-sm">
    {{ filteredBreadcrumbs.currentPage.title }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// รับ props เป็น array ของ object ที่ประกอบด้วย previousPage, currentPage และ icon
const props = defineProps<{
  breadcrumbs: {
    previousPage: { title: string; path: string } | null
    currentPage: { title: string; path: string }
    icon: string
  }
}>()

// คำนวณ filteredBreadcrumbs ที่กรองข้อมูล breadcrumb ที่ previousPage ไม่เป็น null
const filteredBreadcrumbs = computed(() => {
  return props.breadcrumbs
})

// ฟังก์ชันตรวจสอบว่า icon เป็นรูปภาพหรือไม่
const isImageIcon = (icon: string) => {
  return (
    icon.startsWith('http') ||
    icon.startsWith('/') ||
    icon.endsWith('.png') ||
    icon.endsWith('.jpg') ||
    icon.endsWith('.svg')
  )
}
</script>

<style scoped>
a {
  text-decoration: none;
  color: inherit;
}
.icon-image {
  width: 24px;
  height: 24px;
}
</style>
