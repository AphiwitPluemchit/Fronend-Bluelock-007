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
            v-model="query.search"
            placeholder="ค้นหา ชื่อกิจกรรม"
            @keyup.enter="applyFilters"
            class="q-mr-sm searchbox"
            :style="{ boxShadow: 'none' }"
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
                :status-activities="query.activityState || []"
                :category-activities="query.skill || []"
              />
            </div>
        </div>
      </div>



        <!-- แสดงกิจกรรม -->
        <div class="row q-col-gutter-md">
          <div
            class="col-xs-12 col-sm-6 col-md-6"
            v-for="activity in activitys"
            :key="activity.id || ''"
          >
            <ActivityCard :activity="activity" />
          </div>
        </div>
      </q-page>

</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
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
// const search = ref()
const showFilterDialog = ref(false)
interface SelectedFilters {
  year: string[]
  major: string[]
  categoryActivity: string[]
}

const filterCategories = ref(['year', 'major', 'categoryActivity'])
// const applyFilters = (selectedFilters: {
//   year: string[]
//   major: string[]

//   categoryActivity: string[]
// }) => {
//   filters.value = selectedFilters
//   console.log('Filters Applied:', filters.value)
// }
const applyFilters = async (selectedFilters: SelectedFilters) => {
  console.log(selectedFilters)

  query.value.studentYear = selectedFilters.year
  query.value.major = selectedFilters.major
  query.value.skill = selectedFilters.categoryActivity
  await fetchData()
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
    console.log(query.value)
    const response = await ActivityService.getAll(query.value)
    activitys.value = response.data
    console.log(response)
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลกิจกรรม:', error)
  }
}
onMounted(async () => {
  await fetchData()
})
</script>

<style scoped>
.search-filter-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}



.filter-btn-wrapper {
  flex-shrink: 0;
}

/* ✅ Mobile: ชุดค้นหา + ปุ่มกรอง ชิดขวา */
@media (max-width: 600px) {
  .search-filter-inner {
    justify-content: flex-end;
    width: 100%;
  }
}

.search-filter-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.filter-btn-wrapper {
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .search-filter-inner {
    justify-content: flex-end;
    width: 100%;
  }
}

.searchbox {
  flex-grow: 1;
  min-width: 0;
}

</style>





