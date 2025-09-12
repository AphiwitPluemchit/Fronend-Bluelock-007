<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import MyProgramCard from './Component/myProgramCard.vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import type { Program } from 'src/types/program'
import { EnrollmentService } from 'src/services/enrollment'
import { useAuthStore } from 'src/stores/auth'
import type { Pagination } from 'src/types/pagination'

const auth = useAuthStore()
const programs = ref<Program[]>([])
const allPrograms = ref<Program[]>([])
const loading = ref(false)
const showFilterDialog = ref(false)
const searchQuery = ref('')
const selectedFilters = ref({
  categoryProgram: [] as string[]
})

interface SelectedFilters {
  categoryProgram: string[]
}

const filterCategories = ref(['categoryProgram'])

const filteredPrograms = computed(() => {
  let filtered = allPrograms.value

  // กรองตามคำค้นหา
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter((program) =>
      program.name?.toLowerCase().includes(query) ||
      program.programItems?.some(item =>
        item.description?.toLowerCase().includes(query)
      )
    )
  }

  // กรองตาม skill
  if (selectedFilters.value.categoryProgram.length > 0) {
    filtered = filtered.filter((program) =>
      program.skill && selectedFilters.value.categoryProgram.includes(program.skill)
    )
  }

  return filtered
})

const query = ref<Pagination>({
  page: 1,
  limit: 99,
  search: '',
  sortBy: '_id',
  order: 'desc',
  skill: [],
  programState: ['open', 'close'],
  major: [],
  studentYear: [],
})

const applyFilters = (filters: SelectedFilters) => {
  selectedFilters.value = filters
}

const fetchData = async () => {
  try {
    loading.value = true
    const studentId = `${auth.getUser?.id}`
    const response = await EnrollmentService.getEnrollmentsByStudentID(studentId, query.value)
    allPrograms.value = response.data
    programs.value = response.data
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลกิจกรรม:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchData()
})
</script>

<template>
  <q-page class="q-pa-md">
    <!-- ชื่อหน้า -->
    <div class="q-mb-md" style="margin-top: 20px">
      <div class="texttitle">กิจกรรมของฉัน</div>
    </div>

    <!-- ค้นหา + ฟิลเตอร์ -->
    <div class="row justify-between items-right  q-mb-md search-filter-wrapper q-col-gutter-md">
      <div class="text-h6"></div>
      <div class="row search-filter-inner items-center no-wrap">
      <q-input
        dense
        outlined
        v-model="searchQuery"
        placeholder="ค้นหา ชื่อกิจกรรม"
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
                :years="query.studentYear || []"
                :majors="query.major || []"
                :status-programs="query.programState || []"
                :category-programs="selectedFilters.categoryProgram"
              />
            </div>
          </div>
        </div>

    <!-- Loading State -->
    <!-- <div v-if="loading" class="row justify-center q-pa-lg">
      <q-spinner-dots size="50px" color="primary" />
      <div class="text-h6 q-ml-md">กำลังโหลดข้อมูล...</div>
    </div> -->

    <!-- Empty State -->
    <div v-if="filteredPrograms.length === 0" class="row justify-center q-pa-lg">
      <div class="text-center">
        <q-icon name="person_outline" size="100px" color="grey-4" />
        <div class="text-h6 q-mt-md text-grey-6">
          {{ (searchQuery.trim() || selectedFilters.categoryProgram.length > 0) ? 'ไม่พบกิจกรรมที่ตรงกับเงื่อนไข' : 'ยังไม่มีกิจกรรมที่ลงทะเบียน' }}
        </div>
      </div>
    </div>

    <!-- แสดงกิจกรรม -->
    <div v-else>
      <div
        class="q-mb-md"
        v-for="program in filteredPrograms"
        :key="program.id || ''"
      >
        <MyProgramCard :myProgram="program" />
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
