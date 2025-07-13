<script setup lang="ts">
import { onMounted, ref } from 'vue'
import MyActivityCard from './Component/MyActivityCard.vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import type { Activity } from 'src/types/activity'
import { EnrollmentService } from 'src/services/enrollment'
import { useAuthStore } from 'src/stores/auth'
import type { Pagination } from 'src/types/pagination'

const auth = useAuthStore()
const activitys = ref<Activity[]>([])
const showFilterDialog = ref(false)

interface SelectedFilters {
  categoryActivity: string[]
}

const filterCategories = ref(['categoryActivity'])

const query = ref<Pagination>({
  page: 1,
  limit: 99,
  search: '',
  sortBy: '_id',
  order: 'desc',
  skill: [],
  activityState: ['open', 'close'],
  major: [],
  studentYear: [],
})

const applyFilters = async (selectedFilters: SelectedFilters) => {
  console.log(selectedFilters)
  query.value.skill = selectedFilters.categoryActivity
  await fetchData()
}

const fetchData = async () => {
  try {
    const studentId = `${auth.getUser?.id}`
    const response = await EnrollmentService.getEnrollmentsByStudentID(studentId, query.value)
    activitys.value = response.data
    console.log(response)
    console.log(activitys.value)
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลกิจกรรม:', error)
  }
}

onMounted(async () => {
  console.log(auth.getUser?.id)
  await fetchData()
})
</script>

<template>
  <q-page class="q-pa-md">
    <!-- ชื่อหน้า -->
    <div class="row justify-between items-center q-mb-md" style="margin-top: 20px">
      <div class="texttitle">กิจกรรมของฉัน</div>
    </div>

    <!-- ค้นหา + ฟิลเตอร์ -->
    <div class="row justify-between items-right  q-mb-md search-filter-wrapper q-col-gutter-md">
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
        class="col-xs-12 q-pa-sm"
        v-for="activity in activitys"
        :key="activity.id || ''"
      >
        <MyActivityCard :myActivity="activity" />
      </div>

    </div>
  </q-page>
</template>

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
</style>
