<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ProgramCard from '../program/programCard.vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
// import { useStudentProgramstore } from 'src/stores/student-program'
import { ProgramService } from 'src/services/program'
import type { Pagination } from 'src/types/pagination'
import type { Program } from 'src/types/program'
import { useAuthStore } from 'src/stores/auth'
//import { useQuasar } from 'quasar'
// const StudentProgramStore = useStudentProgramstore()
//const $q = useQuasar()
const authStore = useAuthStore()
const programs = ref<Program[]>([])
const loading = ref(false)
// const search = ref()
const showFilterDialog = ref(false)
const searchQuery = ref('')
const selectedFilters = ref({
  year: [] as string[],
  major: [] as string[],
  categoryProgram: [] as string[],
})

interface SelectedFilters {
  year: string[]
  major: string[]
  categoryProgram: string[]
}
const query = ref<Pagination>({
  page: 1,
  limit: 0,
  search: '',
  sortBy: 'dates',
  order: 'desc',
  skill: [],
  programState: ['open'],
  major: [],
  studentYear: [],
})
const pagination = ref({
  sortBy: query.value.sortBy || '',
  descending: query.value.order === 'desc',
  page: query.value.page || 1,
  rowsPerPage: query.value.limit || 0,
  rowsNumber: 0,
})
const filterCategories = ref(['year', 'major', 'categoryProgram'])

const applyFilters = async (selectedFilter: SelectedFilters) => {
  query.value.studentYear = selectedFilter.year
  query.value.major = selectedFilter.major
  query.value.skill = selectedFilter.categoryProgram
  selectedFilters.value = selectedFilter
  await data()
}
async function getProgramData(qeury: Pagination) {
  const data = await ProgramService.getAll(qeury)
  return data
}
const data = async () => {
  const data = await getProgramData(query.value)
  pagination.value.page = query.value.page || 1
  pagination.value.rowsPerPage = query.value.limit || 0
  pagination.value.sortBy = query.value.sortBy || 'dates'
  pagination.value.rowsNumber = data.meta.total
  pagination.value.descending = query.value.order === 'desc'

  programs.value = data.data
}
onMounted(async () => {
  const userMajor = authStore.getMajor // เช่น 'CS'
  const useYear = authStore.getStudentYear?.toString()


  // ใช้กรองข้อมูลตั้งแต่โหลดครั้งแรก
  query.value.major = userMajor ? [userMajor] : []
  query.value.studentYear = useYear ? [useYear] : []

  // ✅ ส่งเข้า FilterDialog เป็นค่าเริ่มต้น เพื่อให้ชิปติ๊กค้าง
  if (userMajor) {
    selectedFilters.value.major = [userMajor]
  }
  if(useYear){
    selectedFilters.value.year = [useYear]
  }

  await data()
  loading.value = true;
  await data();
  loading.value = false;
})

</script>

<template>
  <q-page class="q-pa-md">
    <!-- ชื่อหน้า -->
    <div class="row justify-between items-center q-mb-md" style="margin-top: 20px">
      <div class="texttitle">โครงการทั้งหมด</div>
    </div>

    <div class="row justify-between items-center q-mb-md search-filter-wrapper q-col-gutter-md">
      <div class="text-h6"></div>
      <div class="row search-filter-inner items-center no-wrap">
        <q-input
          dense
          outlined
          v-model="searchQuery"
          placeholder="ค้นหา ชื่อโครงการ"
          class="q-mr-sm searchbox"
          :style="{ boxShadow: 'none' }"
          clearable
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <div class="filter-btn-wrapper">
          <FilterDialog
            :model-value="showFilterDialog"
            :categories="filterCategories"
            @apply="applyFilters"
            :years="selectedFilters.year"
            :majors="selectedFilters.major"
            :status-programs="query.programState || []"
            :category-programs="selectedFilters.categoryProgram"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="programs.length === 0" class="row justify-center q-pa-lg">
      <div class="text-center">
        <q-icon name="today" size="100px" color="grey-4" />
        <div class="text-h6 q-mt-md text-grey-6">
          {{
            searchQuery.trim() ||
            selectedFilters.major.length > 0 ||
            selectedFilters.year.length > 0 ||
            selectedFilters.categoryProgram.length > 0
              ? 'ไม่พบโครงการที่ตรงกับเงื่อนไข'
              : 'ยังไม่มีโครงการในระบบ'
          }}
        </div>
      </div>
    </div>

    <!-- แสดงโครงการ -->
    <div v-else class="row q-col-gutter-md items-stretch">
      <div
        class="col-xs-12 col-sm-6 col-md-4"
        v-for="program in programs"
        :key="program.id || ''"
      >
        <ProgramCard :program="program" />
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.search-filter-wrapper {
  flex-wrap: wrap;
}

.searchbox {
  flex-grow: 1;
  min-width: 0;
}

@media (max-width: 600px) {
  .search-filter-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .searchbox {
    width: 100%;
  }
}
</style>
