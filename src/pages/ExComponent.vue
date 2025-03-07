<template>
  <div class="q-pa-md">
  <AppBreadcrumbs :breadcrumbs="breadcrumbs" />
  <div style="justify-self: end;">
    <q-btn label="filter1" @click="showFilterDialog1 = true">
      <FilterDialog v-model="showFilterDialog1" :categories="filterCategories1" @apply="applyFilters" />
    </q-btn>
    <q-btn label="filter2" @click="showFilterDialog2 = true">
      <FilterDialog v-model="showFilterDialog2" :categories="filterCategories2" @apply="applyFilters"/>
    </q-btn>

  </div>

  <q-table
    title="รายการสินค้า"
    :rows="rows"
    :columns="columns"
    row-key="id"
    :pagination="pagination"
  />

</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'

const showFilterDialog1 = ref(false)
const showFilterDialog2 = ref(false)
// หมวดที่ต้องการให้แสดง
const filterCategories1 = ref(['year', 'major', 'statusStudent'])
const filterCategories2 = ref([
  'year',
  'major',
  'statusStudent',
  'statusActivity',
  'categoryActivity',
])

const filters = ref<{ year: string[]; major: string[]; statusStudent: string[]; statusActivity: string[]; categoryActivity: string[] }>({
  year: [],
  major: [],
  statusStudent: [],
  statusActivity: [],
  categoryActivity: [],
})

const applyFilters = (selectedFilters: { year: string[]; major: string[]; statusStudent: string[]; statusActivity: string[]; categoryActivity: string[] }) => {
  filters.value = selectedFilters
  console.log('Filters Applied:', filters.value)
}
const columns = [
  { name: 'name', label: 'ชื่อสินค้า', align: 'left' as const, field: 'name' },
  { name: 'price', label: 'ราคา', align: 'right' as const, field: 'price' },
]
const breadcrumbs = ref({
  previousPage: { title: 'จัดการกิจกรรม', path: '/ActivitiesManagement' },
  currentPage: { title: 'สร้างกิจกรรม', path: '/ActivitiesManagement/CreateActivity' },
  icon: 'description',
})
const rows = ref([
  { id: 1, name: 'กาแฟ', price: 50 },
  { id: 2, name: 'ชาเขียว', price: 45 },
  { id: 3, name: 'โกโก้', price: 55 },
  { id: 4, name: 'นมสด', price: 40 },
  { id: 5, name: 'ชาไทย', price: 45 },
  { id: 6, name: 'เอสเพรสโซ่', price: 60 },
])

const pagination = ref({
  page: 1, // เริ่มที่หน้า 1
  rowsPerPage: 3, // แสดง 3 แถวต่อหน้า
})
</script>
<style scoped>
</style>
