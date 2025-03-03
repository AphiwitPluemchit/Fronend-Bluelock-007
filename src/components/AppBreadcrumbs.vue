<template>
  <q-breadcrumbs >
    <!-- แสดงรายการ breadcrumbs ที่มี previousPage -->
    <q-breadcrumbs-el>
      <q-icon :name="filteredBreadcrumbs.icon" size="md" class="q-mr-sm" />
      <router-link :to="filteredBreadcrumbs.previousPage?.path ?? '/'" class="text-bold text-h6 " >
        {{ filteredBreadcrumbs.previousPage?.title }} >
      </router-link>

    </q-breadcrumbs-el>
    <!-- แสดง currentPage จาก breadcrumb ล่าสุด -->
    <div class="text-h6" style="text-decoration-line: underline;">
      {{ filteredBreadcrumbs.currentPage.title }}
    </div>
  </q-breadcrumbs>
  <div class="text-h4 q-mt-sm">
      {{ filteredBreadcrumbs.currentPage.title }}
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

// รับ props เป็น array ของ object ที่ประกอบด้วย previousPage, currentPage และ icon
const props = defineProps<{
  breadcrumbs: {
    previousPage: { title: string; path: string } | null;
    currentPage: { title: string; path: string };
    icon: string;
  };
}>();

// คำนวณ filteredBreadcrumbs ที่กรองข้อมูล breadcrumb ที่ previousPage ไม่เป็น null
const filteredBreadcrumbs = computed(() => {
  return props.breadcrumbs
});
</script>

<style scoped>
a {
  text-decoration: none;
  color: inherit;
}
</style>
