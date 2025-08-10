<script setup lang="ts">
import { ref, computed } from 'vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import OnlineCourseCard from './component/OnlineCoursesCard.vue'

interface Course {
  id: number
  title: string
  type: 'soft' | 'hard'
  description?: string
  platformType: 'Buu Mooc' | 'Thai Mooc'
  hours: number
  link: string
}

const showFilterDialog = ref(false)
const selectedType = ref<string[]>([])

const courses = ref<Course[]>([
  {
    id: 1,
    title: 'การพัฒนาทักษะการสื่อสาร',
    type: 'soft',
    hours: 3,
    link: 'https://example.com/soft-course',
    platformType: 'Buu Mooc',
    description: 'คอร์สนี้จะช่วยพัฒนาทักษะการสื่อสารของคุณให้ดียิ่งขึ้น',
  },
  {
    id: 2,
    title: 'พื้นฐานการเขียนโปรแกรม',
    type: 'hard',
    hours: 4,
    link: 'https://example.com/hard-course',
    platformType: 'Thai Mooc',
  },
  {
    id: 3,
    title: 'การทำงานเป็นทีม',
    type: 'soft',
    hours: 2,
    link: 'https://example.com/soft-course2',
    platformType: 'Buu Mooc',
  },
  {
    id: 4,
    title: 'การวิเคราะห์ข้อมูลขั้นสูง ที่สุด ที่หนึ่ง ที่สอง ที่สาม ไม่มีใครเทียบได้',
    type: 'soft',
    hours: 10,
    link: 'https://example.com/soft-course2',
    platformType: 'Thai Mooc',
    description:
      'คอร์สนี้จะช่วยพัฒนาทักษะการวิเคราะห์ข้อมูลของคุณให้ดียิ่งขึ้น ไปอีกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกก',
  },
])

const filteredCourses = computed(() => {
  if (!selectedType.value.length) return courses.value
  return courses.value.filter((c) => selectedType.value.includes(c.type))
})

function applyFilters(selected: { categoryActivity: string[] }) {
  selectedType.value = selected.categoryActivity
  showFilterDialog.value = false
}
</script>

<template>
  <q-page class="q-pa-lg">
    <div class="page-wrap">
      <!-- ชื่อหน้า -->
      <div class="row justify-between items-center q-mb-md" style="margin-top: 20px">
        <div class="texttitle">หัวข้ออบรมออนไลน์</div>
      </div>

      <!-- ค้นหา/ฟิลเตอร์ -->
      <div class="row justify-between items-right q-mb-md search-filter-wrapper q-col-gutter-md">
        <div class="text-h6"></div>
        <div class="row search-filter-inner items-center no-wrap">
          <FilterDialog
            :model-value="showFilterDialog"
            :categories="['categoryActivity']"
            :category-activities="selectedType"
            @apply="applyFilters"
          />
        </div>
      </div>

      <!-- การ์ด 2 ต่อแถว + ยืดเท่ากัน -->
      <div class="row q-col-gutter-lg items-stretch">
        <div v-for="course in filteredCourses" :key="course.id" class="col-xs-12 col-sm-6 col-md-6">
          <OnlineCourseCard
            class="h-100"
            :title="course.title"
            :type="course.type"
            :hours="course.hours"
            :link="course.link"
            :platform-type="course.platformType"
            :description="course.description ?? '-'"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>
