<template>
  <q-layout>
    <q-page-container>
      <q-page class="q-pa-md">
        <!-- กล่องค้นหาและปุ่ม Filter -->
        <div class="row justify-start items-center">
          <div class="text-h4">กิจกรรมทั้งหมด</div>
        </div>

        <div class="row justify-between items-center q-pa-md">
          <div class="text-h6"></div>
          <div class="row">
            <q-input
              dense
              outlined
              v-model="search"
              placeholder="ค้นหา ชื่อกิจกรรม"
              @keyup.enter="fetchData()"
              class="q-mr-sm searchbox"
              :style="{ boxShadow: 'none' }"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <FilterDialog
              :model-value="showFilterDialog"
              :categories="filterCategories"
              @apply="applyFilters"
              :years="query.studentYear"
              :majors="query.major"
              :status-activities="query.activityState"
              :category-activities="query.skill"
            />
          </div>
        </div>

        <!-- แสดงกิจกรรม -->
        <div class="row q-col-gutter-md">
          <div class="col-xs-12 q-pa-lg" v-for="activitys in activitys" :key="activitys.id || ''">
            <MyActivityCard :myActivity="activitys" :activitys="activitys" />
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import MyActivityCard from '../myactivity/MyActivityCard.vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import type { Activity } from 'src/types/activity'
import type { ActivityPagination } from 'src/types/pagination'
import { EnrollmentService } from 'src/services/enrollment'
import { useAuthStore } from 'src/stores/auth'
const auth = useAuthStore()
const activitys = ref<Activity[]>([])
const search = ref()
const showFilterDialog = ref(false)

interface SelectedFilters {
  categoryActivity: string[]
}

const filterCategories = ref(['categoryActivity'])
const applyFilters = async (selectedFilters: SelectedFilters) => {
  console.log(selectedFilters)

  query.value.skill = selectedFilters.categoryActivity
  await fetchData()
}
const query = ref<ActivityPagination>({
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
const fetchData = async () => {
  try {
    const studentId = `${auth.payload?.user?.id}`
    const response = await EnrollmentService.getEnrollmentsByStudentID(studentId, query.value)
    activitys.value = response.data
    console.log(response)
    console.log(activitys.value)
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลกิจกรรม:', error)
  }
}
onMounted(async () => {
  console.log(auth.payload?.user?.id)
  await fetchData()
})
</script>
