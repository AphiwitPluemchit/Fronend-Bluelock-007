<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import ActivityCard from '../activity/ActivityCard.vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
// import { useStudentActivitystore } from 'src/stores/student-activity'
import { ActivityService } from 'src/services/activity'
import type { Pagination } from 'src/types/pagination'
import type { Activity } from 'src/types/activity'
//import { useQuasar } from 'quasar'
// const StudentActivityStore = useStudentActivitystore()
//const $q = useQuasar()

const activitys = ref<Activity[]>([])
const allActivitys = ref<Activity[]>([])
const loading = ref(false)
// const search = ref()
const showFilterDialog = ref(false)
const searchQuery = ref('')
const selectedFilters = ref({
  year: [] as string[],
  major: [] as string[],
  categoryActivity: [] as string[]
})

interface SelectedFilters {
  year: string[]
  major: string[]
  categoryActivity: string[]
}

const filterCategories = ref(['year', 'major', 'categoryActivity'])

const filteredActivitys = computed(() => {
  let filtered = allActivitys.value

  // กรองตามคำค้นหา
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter((activity) => 
      activity.name?.toLowerCase().includes(query) ||
      activity.activityItems?.some(item => 
        item.description?.toLowerCase().includes(query)
      )
    )
  }

  // กรองตาม major
  if (selectedFilters.value.major.length > 0) {
    filtered = filtered.filter((activity) => 
      activity.activityItems?.some(item => 
        item.majors?.some(major => selectedFilters.value.major.includes(major))
      )
    )
  }

  // กรองตาม studentYear
  if (selectedFilters.value.year.length > 0) {
    filtered = filtered.filter((activity) => 
      activity.activityItems?.some(item => 
        item.studentYears?.some(year => selectedFilters.value.year.includes(year.toString()))
      )
    )
  }

  // กรองตาม skill
  if (selectedFilters.value.categoryActivity.length > 0) {
    filtered = filtered.filter((activity) => 
      activity.skill && selectedFilters.value.categoryActivity.includes(activity.skill)
    )
  }

  return filtered
})

const applyFilters = (filters: SelectedFilters) => {
  console.log(filters)
  selectedFilters.value = filters
}

// async function getActivityData(qeury: ActivityPagination) {
//   const data = await ActivityService.getAll(qeury)
//   return data
// }
// const data = async () => {
//   const data = await getActivityData(query.value)
//   // pagination.value.page = query.value.page
//   // pagination.value.rowsPerPage = query.value.limit
//   // pagination.value.sortBy = query.value.sortBy
//   // pagination.value.rowsNumber = data.meta.total
//   activitys.value = data.data
// }
const query = ref<Pagination>({
  page: 1,
  limit: 99,
  search: '',
  sortBy: '_id',
  order: 'desc',
  skill: [],
  activityState: ['open'],
  major: [],
  studentYear: [],
})
const fetchData = async () => {
  try {
    loading.value = true
    console.log(query.value)
    const response = await ActivityService.getAll(query.value)
    allActivitys.value = response.data
    activitys.value = response.data
    console.log(response)
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
    <div class="row justify-between items-center q-mb-md" style="margin-top: 20px">
      <div class="texttitle">กิจกรรมทั้งหมด</div>
    </div>

      <div class="row justify-between items-center q-mb-md search-filter-wrapper q-col-gutter-md">
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
                :years="selectedFilters.year"
                :majors="selectedFilters.major"
                :status-activities="query.activityState || []"
                :category-activities="selectedFilters.categoryActivity"
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
      <div v-if="filteredActivitys.length === 0" class="row justify-center q-pa-lg">
        <div class="text-center">
          <q-icon name="event" size="100px" color="grey-4" />
          <div class="text-h6 q-mt-md text-grey-6">
            {{ (searchQuery.trim() || selectedFilters.major.length > 0 || selectedFilters.year.length > 0 || selectedFilters.categoryActivity.length > 0) ? 'ไม่พบกิจกรรมที่ตรงกับเงื่อนไข' : 'ยังไม่มีกิจกรรมในระบบ' }}
          </div>
        </div>
      </div>

      <!-- แสดงกิจกรรม -->
      <div v-else class="row q-col-gutter-md items-stretch">
        <div
          class="col-xs-12 col-sm-6 col-md-6"
          v-for="activity in filteredActivitys"
          :key="activity.id || ''"
        >
          <ActivityCard :activity="activity" />
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





