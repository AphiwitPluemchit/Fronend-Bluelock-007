<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import OnlineCourseCard from './component/OnlineCoursesCard.vue'
import { useCourseStore } from 'src/stores/course'

const $q = useQuasar()
const courseStore = useCourseStore()

const showFilterDialog = ref(false)
const selectedType = ref<string[]>([])
const searchQuery = ref('')

// ดึงข้อมูลคอร์สจาก API
const fetchCourses = async () => {
  try {
    // ดึงเฉพาะคอร์สที่เปิดใช้งาน และเพิ่ม limit เพื่อแสดงคอร์สทั้งหมด
    courseStore.params.isActive = true
    courseStore.params.limit = 100 // เพิ่ม limit เพื่อแสดงคอร์สมากขึ้น
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

const filteredCourses = computed(() => {
  // เริ่มจาก courses ทั้งหมดจาก store
  let filtered = courseStore.courses

  // กรองตามประเภทที่เลือก
  if (selectedType.value.length > 0) {
    filtered = filtered.filter((course) => {
      if (selectedType.value.includes('hard') && course.isHardSkill) return true
      if (selectedType.value.includes('soft') && !course.isHardSkill) return true
      return false
    })
  }

  // กรองตามคำค้นหา
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    const platformType = (type: string) => (type === 'buumooc' ? 'Buu Mooc' : 'Thai Mooc')

    filtered = filtered.filter(
      (course) =>
        course.name.toLowerCase().includes(query) ||
        platformType(course.type).toLowerCase().includes(query),
    )
  }

  return filtered
})

function applyFilters(selected: { categoryProgram: string[] }) {
  selectedType.value = selected.categoryProgram
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
        <div class="texttitle">หลักสูตรทั้งหมด</div>
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
              :categories="['categoryProgram']"
              :category-programs="selectedType"
              @apply="applyFilters"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <!-- <div v-if="courseStore.loading" class="row justify-center q-pa-lg">
        <q-spinner-dots size="50px" color="primary" />
        <div class="text-h6 q-ml-md">กำลังโหลดข้อมูล...</div>
      </div> -->

      <!-- Empty State -->
      <div v-if="filteredCourses.length === 0" class="row justify-center q-pa-lg">
        <div class="text-center">
          <q-icon name="workspace_premium" size="100px" color="grey-4" />
          <div class="text-h6 q-mt-md text-grey-6">
            {{
              searchQuery.trim() || selectedType.length > 0
                ? 'ไม่พบคอร์สที่ตรงกับเงื่อนไข'
                : 'ยังไม่มีคอร์สในระบบ'
            }}
          </div>
        </div>
      </div>

      <!-- การ์ด 2 ต่อแถว + ยืดเท่ากัน -->
      <div v-else class="row q-col-gutter-md items-stretch">
        <div
          v-for="course in filteredCourses"
          :key="course.id || course.name"
          class="col-xs-12 col-sm-6 col-md-6"
        >
          <OnlineCourseCard class="h-100" :course="course" />
        </div>
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
