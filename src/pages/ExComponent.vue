<template>
 <AppBreadcrumbs
      :breadcrumbs="breadcrumbs"
    />

  <q-table
    title="รายการสินค้า"
    :rows="rows"
    :columns="columns"
    row-key="id"
    :pagination="pagination"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import AppBreadcrumbs from "src/components/AppBreadcrumbs.vue";
const columns = [
  { name: "name", label: "ชื่อสินค้า", align: "left" as const, field: "name" },
  { name: "price", label: "ราคา", align: "right" as const, field: "price" },
];
const breadcrumbs = ref(
  {
    previousPage: { title: "จัดการกิจกรรม", path: "/ActivitiesManagement" },
    currentPage: { title: "สร้างกิจกรรม", path: "/ActivitiesManagement/CreateActivity" },
    icon: "description"
  }
);
const rows = ref([
  { id: 1, name: "กาแฟ", price: 50 },
  { id: 2, name: "ชาเขียว", price: 45 },
  { id: 3, name: "โกโก้", price: 55 },
  { id: 4, name: "นมสด", price: 40 },
  { id: 5, name: "ชาไทย", price: 45 },
  { id: 6, name: "เอสเพรสโซ่", price: 60 },
]);

const pagination = ref({
  page: 1,         // เริ่มที่หน้า 1
  rowsPerPage: 3,  // แสดง 3 แถวต่อหน้า
});
</script>
