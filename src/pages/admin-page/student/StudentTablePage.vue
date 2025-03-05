<template>
  <q-page class="q-pa-md">
    <!-- ชื่อหน้า -->
    <div class="row justify-start items-center">
      <div class="text-h4">จัดการข้อมูลนิสิต</div>
    </div>
    <div class="row justify-end items-center">
      <q-btn dense outlined icon="add" label="เพิ่มข้อมูล" class="btnadd" @click="goToPage()" />
    </div>
    <!-- ตาราง 1 -->
    <section class="q-mt-lg">
      <div class="row justify-between items-center">
        <div class="text-h6"></div>
        <div class="row">
          <q-input
            dense
            outlined
            v-model="search1"
            placeholder="ค้นหา"
            class="q-mr-sm searchbox"
            :style="{ boxShadow: 'none' }"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn class="btnfilter" @click="showFilterDialog1 = true">
            <img src="public\icons\sort.svg" alt="Sort Icon" width="30" height="30" />
            <FilterDialog
              v-model="showFilterDialog1"
              :categories="filterCategories1"
              @apply="applyFilters"
            />
          </q-btn>
        </div>
      </div>
      <q-table
        bordered
        flat
        :rows="studentStore.students"
        :columns="columns"
        row-key="id"
        class="q-mt-md customtable"
      >
        <template #body-cell-action="props">
          <q-td class="q-gutter-x-sm">
            <q-btn
              icon="info"
              padding="none"
              flat
              color="grey-8"
              @click="goToPageDetail(props.row.id)"
            ></q-btn
          ></q-td> </template
      ></q-table>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import { useStudentStore } from 'src/stores/student'
const studentStore = useStudentStore()
// ใช้ Vue Router
const router = useRouter()
const goToPage = async () => {
  await router.push('add')
}
const goToPageDetail = async (id: string) => {
  console.log(id)
  await studentStore.fetchOneData(id)
  await router.push(`/StudentManagement/StudentDetail/${id}`)
}
const filters = ref<{
  year: string[]
  major: string[]
  statusStudent: string[]
  categoryStudent: string[]
}>({
  year: [],
  major: [],
  statusStudent: [],
  categoryStudent: [],
})
const showFilterDialog1 = ref(false)
const filterCategories1 = ref([
  'year',
  'major',
  'statusStudent',
  'statusStudent',
  'categoryStudent',
])

const applyFilters = (selectedFilters: {
  year: string[]
  major: string[]
  statusStudent: string[]
  categoryStudent: string[]
}) => {
  filters.value = selectedFilters
  console.log('Filters Applied:', filters.value)
}
// ตัวแปรสำหรับค้นหา
const search1 = ref('')

// กำหนดโครงสร้างของคอลัมน์ในตาราง
const columns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'left' as const },
  { name: 'code', label: 'รหัสนิสิต', field: 'code', align: 'left' as const },
  { name: 'name', label: 'ชื่อ-สกุล', field: 'name', align: 'left' as const },
  { name: 'major', label: 'สาขา', field: 'major', align: 'left' as const },
  {
    name: 'softskill',
    label: 'ชั่วโมงทักษะทางวิชาการ',
    field: 'softskill',
    align: 'left' as const,
  },
  {
    name: 'hardskill',
    label: 'ชั่วโมงเตรียมความพร้อม',
    field: 'hardskill',
    align: 'left' as const,
  },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'left' as const },
  { name: 'action', label: '', field: '', align: 'left' as const },
]

// ข้อมูลกิจกรรม (ตัวอย่าง)
onMounted(() => {
  studentStore.fetchData()
})
</script>

<style scoped></style>
