<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import OnlineCourseCard from './component/OnlineCoursesCard.vue'
import { useCourseStore } from 'src/stores/course'
import type { Course } from 'src/types/course'

// Interface สำหรับ OnlineCourseCard
interface OnlineCourse {
  id: string
  title: string
  type: 'soft' | 'hard'
  description: string
  platformType: 'Buu Mooc' | 'Thai Mooc'
  hours: number
  link: string
}

const $q = useQuasar()
const courseStore = useCourseStore()

const showFilterDialog = ref(false)
const selectedType = ref<string[]>([])
const searchQuery = ref('')

// ดึงข้อมูลคอร์สจาก API
const fetchCourses = async () => {
  try {
    // ดึงเฉพาะคอร์สที่เปิดใช้งาน
    courseStore.params.isActive = true
    await courseStore.fetchCourses()
  } catch (error) {
    console.error('Error fetching courses:', error)
    $q.notify({
      message: 'ไม่สามารถดึงข้อมูลคอร์สได้',
      type: 'negative',
      position: 'bottom',
      timeout: 3000,
    })
  }
}

// แปลงข้อมูลจาก API ให้เข้ากับ interface ของ OnlineCourseCard
const transformCourseData = (course: Course): OnlineCourse => ({
  id: course.id || '',
  title: course.name,
  type: course.isHardSkill ? 'hard' : 'soft',
  description: course.description || '',
  platformType: course.type === 'buumooc' ? 'Buu Mooc' : 'Thai Mooc',
  hours: course.hour,
  link: course.link,
})

const filteredCourses = computed(() => {
  const transformedCourses = courseStore.courses.map(transformCourseData)
  
  // กรองตามประเภทที่เลือก
  let filtered = transformedCourses
  if (selectedType.value.length > 0) {
    filtered = filtered.filter((c) => {
      if (selectedType.value.includes('hard') && c.type === 'hard') return true
      if (selectedType.value.includes('soft') && c.type === 'soft') return true
      return false
    })
  }
  
  // กรองตามคำค้นหา
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter((c) => 
      c.title.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.platformType.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

function applyFilters(selected: { categoryActivity: string[] }) {
  selectedType.value = selected.categoryActivity
  showFilterDialog.value = false
}

// โหลดข้อมูลเมื่อ component mount
onMounted(() => {
  void fetchCourses()
})
</script>

<template>
  <q-page class="q-pa-md">
    <div class="page-wrap">
      <!-- ชื่อหน้า -->
      <div class="row justify-between items-center q-mb-md" style="margin-top: 20px">
        <div class="texttitle">หัวข้ออบรมออนไลน์</div>
      </div>

      <!-- ค้นหา/ฟิลเตอร์ -->
      <div class="row justify-between items-center q-mb-md search-filter-wrapper q-col-gutter-md">
        <div class="text-h6"></div>
        <div class="row search-filter-inner items-center no-wrap">
          <q-input
            dense
            outlined
            v-model="searchQuery"
            placeholder="ค้นหา ชื่อคอร์ส"
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
              :categories="['categoryActivity']"
              :category-activities="selectedType"
              @apply="applyFilters"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="courseStore.loading" class="row justify-center q-pa-lg">
        <q-spinner-dots size="50px" color="primary" />
        <div class="text-h6 q-ml-md">กำลังโหลดข้อมูล...</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredCourses.length === 0" class="row justify-center q-pa-lg">
        <div class="text-center">
          <q-icon name="school" size="100px" color="grey-4" />
          <div class="text-h6 q-mt-md text-grey-6">
            {{ searchQuery.trim() || selectedType.length > 0 ? 'ไม่พบคอร์สที่ตรงกับเงื่อนไข' : 'ยังไม่มีคอร์สในระบบ' }}
          </div>
        </div>
      </div>

      <!-- การ์ด 2 ต่อแถว + ยืดเท่ากัน -->
      <div v-else class="row q-col-gutter-md items-stretch">
        <div v-for="course in filteredCourses" :key="course.id" class="col-xs-12 col-sm-6 col-md-6">
          <OnlineCourseCard
            class="h-100"
            :title="course.title"
            :type="course.type"
            :hours="course.hours"
            :link="course.link"
            :platform-type="course.platformType"
            :description="course.description"
          />
        </div>
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

.searchbox {
  flex-grow: 1;
  min-width: 0;
}
</style>
