<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import { useRoute } from 'vue-router'
import { useCourseStore } from 'src/stores/course'
import type { Course } from 'src/types/course'
import Tab_CourseDetail from './Tab_CourseDetail.vue'
import Tab_StudentSubmission from './Tab_StudentUpload.vue'
const route = useRoute()
const id = route.params.id as string
const isSmallScreen = ref(false)
const checkScreen = () => {
  const width = window.innerWidth
  isSmallScreen.value = width <= 610
}
onMounted(() => {
  checkScreen()
})

const activeTab = ref<'course' | 'submission'>('course') // v-model ของ tab/panels
const courseId = route.params.id as string // ส่ง id ให้แท็บลูก

const tabOptions = [
  { label: 'รายละเอียดหัวข้อการอบรม', value: 'course' },
  { label: 'ประวัติการส่งหัวข้อโครงการ', value: 'submission' },
]
const courseStore = useCourseStore()
const course = ref<Course | null>(null)

onMounted(async () => {
  // course.value = await courseStore.getOneCourse(id)
  // console.log('Course data:', course.value)
  if (!course.value) {
    course.value = await courseStore.getOneCourse(id)
    originalCourseData.value = { ...course.value }
  }
})

const breadcrumbs = ref({
  previousPage: { title: 'รายการหัวข้อทั้งหมด', path: '/admin/CourseTablePage' },
  currentPage: { title: 'รายละเอียดหัวข้อการอบรม', path: route.fullPath },
  icon: 'school',
})
// const submissionColumns = [
//   { name: 'index', label: 'ลำดับ', field: 'index', align: 'left' as const },
//   { name: 'date', label: 'วันที่อัปโหลด', field: 'date', align: 'left' as const },
//   { name: 'studentCode', label: 'รหัสนิสิต', field: 'studentCode', align: 'left' as const },
//   { name: 'studentName', label: 'ชื่อ-สกุล', field: 'studentName', align: 'left' as const },
//   { name: 'major', label: 'สาขา', field: 'major', align: 'left' as const },
// ]

// const submissionHistory = ref([
//   {
//     date: '27 ก.ค. 2568',
//     studentCode: '61160030',
//     studentName: 'นายชนะพล จงอยู่ดีไพศาล',
//     major: 'CS',
//   },
//   {
//     date: '27 ก.ค. 2568',
//     studentCode: '61160011',
//     studentName: 'นางสาวศศิธร รัตนกาญจน์',
//     major: 'CS',
//   },
//   {
//     date: '27 ก.ค. 2568',
//     studentCode: '61160030',
//     studentName: 'นายธนพล จงอุทัยไพศาล',
//     major: 'CS',
//   },
//   {
//     date: '27 ก.ค. 2568',
//     studentCode: '61160031',
//     studentName: 'นางสาวธนมล บุญช่วย',
//     major: 'CS',
//   },
//   {
//     date: '27 ก.ค. 2568',
//     studentCode: '61160033',
//     studentName: 'นายธันวา ดีศิริ',
//     major: 'CS',
//   },
//   {
//     date: '27 ก.ค. 2568',
//     studentCode: '61160034',
//     studentName: 'นายนนธวัช นิลสนธิ',
//     major: 'CS',
//   },
//   {
//     date: '27 ก.ค. 2568',
//     studentCode: '61160035',
//     studentName: 'นายปุณยวีร์ นามวงษ์',
//     major: 'CS',
//   },
//   {
//     date: '27 ก.ค. 2568',
//     studentCode: '61160036',
//     studentName: 'นายพลพล คุ้มไข่น้ำ',
//     major: 'CS',
//   },
// ])

// const showFilterDialog1 = ref(false)
// const filterCategories1 = ['major', 'year']

const originalCourseData = ref<Course | null>(null)

// const isEditMode = ref(false)
// const showCancelDialog = ref<boolean>(false)

// const certNameModel = computed({
//   get: () => (isEditMode.value ? localEditCourse.value.courseName : (course.value?.name ?? '')),
//   set: (val: string) => {
//     if (isEditMode.value) localEditCourse.value.courseName = val
//   },
// })
// const linkModel = computed({
//   get: () => (isEditMode.value ? localEditCourse.value.link : (course.value?.link ?? '')),
//   set: (val: string) => {
//     if (isEditMode.value) localEditCourse.value.link = val
//   },
// })
// const categoryProgramModel = computed({
//   get: () =>
//     isEditMode.value ? localEditCourse.value.categoryProgram : (course.value?.isHardSkill ?? ''),
//   set: (val: string) => {
//     if (isEditMode.value) localEditCourse.value.categoryProgram = val
//   },
// })
// const hourModel = computed({
//   get: () => (isEditMode.value ? localEditCourse.value.hour : (course.value?.hour ?? 0)),
//   set: (val: number) => {
//     if (isEditMode.value) localEditCourse.value.hour = val
//   },
// })

// const categoryOptions = [
//   { label: 'เตรียมความพร้อม', value: 'เตรียมความพร้อม' },
//   { label: 'ทักษะทางวิชาการ', value: 'ทักษะทางวิชาการ' },
// ]

// async function saveChanges() {
//   console.log('saveChanges called')
//   try {
//     if (!course.value) return
//     await courseStore.updateCourse(course.value.id!, course.value)
//     originalCourseData.value = { ...courseStore.course }
//     isEditMode.value = false
//     $q.notify({ message: 'แก้ไขข้อมูลสำเร็จ', type: 'positive' })
//   } catch (err) {
//     $q.notify({ message: 'ไม่สามารถบันทึกข้อมูลได้', type: 'negative' })
//     console.error('Error updating course:', err)
//   }
// }
// function cancelEdit() {
//   showCancelDialog.value = true
// }

// function enableEditMode() {
//   isEditMode.value = true
//   if (course.value) {
//     originalCourseData.value = { ...course.value }
//   }
// }
// function confirmCancel() {
//   if (originalCourseData.value) {
//     course.value = { ...originalCourseData.value }
//   }
//   isEditMode.value = false
//   showCancelDialog.value = false
// }

// Pagination แบบ "load more"
//const rowsPerPage = ref(5)
// const paginatedRows = computed(() => submissionHistory.value.slice(0, rowsPerPage.value))
// const canLoadMore = computed(() => rowsPerPage.value < submissionHistory.value.length)

// function loadMore() {
//   rowsPerPage.value += 5
// }
</script>

<template>
  <q-page class="q-pa-md">
    <div style="margin-top: 20px">
      <AppBreadcrumbs :breadcrumbs="breadcrumbs" />

      <!-- Tabs -->
      <div class="tab-scroll-wrapper">
        <!-- ✅ จอใหญ่: ใช้ q-tabs -->
        <q-tabs
          v-if="!isSmallScreen"
          v-model="activeTab"
          align="left"
          dense
          class="tab-no-arrow"
          indicator-color="transparent"
        >
          <q-tab name="course" label="รายละเอียดหัวข้ออบรม" />
          <q-tab name="submission" label="ประวัติการส่งหัวข้อโครงการ" />
        </q-tabs>

        <!-- ✅ จอเล็ก: ใช้ q-select dropdown -->
        <q-select
          v-else
          v-model="activeTab"
          :options="tabOptions"
          emit-value
          map-options
          label="เลือกหัวข้อ"
          dense
          outlined
          class="q-mb-md"
          style="min-width: 250px"
          menu-anchor="bottom start"
          menu-self="top start"
          :popup-content-style="{ maxHeight: '200px', overflowY: 'auto' }"
        />
      </div>

      <!-- Tab Panels -->
      <q-tab-panels v-model="activeTab" animated class="custom-panels">
        <q-tab-panel name="course" class="q-my-md">
          <Tab_CourseDetail :id="courseId" />
        </q-tab-panel>

        <q-tab-panel name="submission" class="q-my-md">
          <Tab_StudentSubmission :id="courseId" />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<style scoped>
.wrapper {
  display: flex;
  align-items: flex-start;
  column-gap: 150px;
  padding: 0px 50px;
  flex-wrap: wrap;
  background-color: #edf0f5;
}
.container {
  display: flex;
  align-items: flex-start;
  width: 100%;
  flex-wrap: wrap;
}
.image-section {
  align-items: flex-start;
  width: 100%;
  flex: 1;
  margin-left: 80px;
}

.form-section {
  flex-grow: 1;
  overflow-x: hidden;
  overflow-y: auto;
}

.form-section::-webkit-scrollbar {
  width: 8px;
}
.Font {
  color: #ffffff;
  font-size: 15px;
  font-weight: bold;
  font-family: 'Noto Serif Thai', serif;
}
@media (max-width: 1880px) {
  .wrapper {
    gap: 0px;
    padding: 0px;
  }
  .container {
    flex-direction: column;
    align-items: center;
  }

  .image-section {
    margin-left: 0;
    width: 100%;
    max-width: 430px;
  }

  .form-section {
    margin-right: 0;
    max-height: unset;
    width: 100%;
    max-width: 770px;
  }
}
@media (max-width: 860px) {
  .container {
    flex-direction: column;
    align-items: center;
  }

  .image-section {
    margin-left: 0;
    width: 100%;
    max-width: 430px;
  }

  .form-section {
    margin-right: 0;
    max-height: unset;
    width: 100%;
    max-width: 500px;
  }
}
@media (max-width: 500px) {
  .wrapper {
    flex-direction: column;
    gap: 30px;
    padding: 5px;
  }

  .container {
    flex-direction: column;
    align-items: center;
  }

  .image-section {
    margin-left: 0;
    width: 100%;
    max-width: 430px;
  }

  .form-section {
    margin-right: 0;
    max-height: unset;
    width: 100%;
    max-width: 800px;
  }
}
@media (max-width: 599px) {
  .q-card {
    padding: 15px;
  }
}
.q-card {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}
.negative-hours {
  color: #f03b2d;
}
.filter-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
.q-input {
  border: 1px solid #757575;
  border-radius: 5px;
  padding-left: 10px;
}
.readonly {
  background-color: #e4e4e4;
  color: #757575;
}
.editable {
  background-color: white;
}
.tableHisAct {
  height: 340px;
}

.table-container {
  overflow-x: auto;
  width: 100%;
}

@media (max-width: 599px) {
  .table-container {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  .table-container::-webkit-scrollbar {
    height: 8px;
  }

  .table-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .table-container::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  .table-container::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}

.scroll-indicator {
  display: none;
}

@media (max-width: 599px) {
  .scroll-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.link-display {
  color: #1976d2;
  text-decoration: underline;
  cursor: pointer;
  word-break: break-all;
  transition: color 0.2s;
}
.link-display:hover {
  color: #0d47a1;
}
.link-box {
  width: 100%;
  display: block;
  padding: 8px;
  border: 1px solid;
  border-radius: 4px;
  color: black;
  text-decoration: none;
  transition: all 0.2s;
  word-break: break-all;
  background-color: #e4e4e4;
}

.link-box:hover {
  background-color: #f0f8ff;
  text-decoration: underline;
  cursor: pointer;
  color: #1976d2;
}
.q-tabs {
  max-width: 100%;
  margin-left: 20px;
}

.tab-scroll-wrapper {
  overflow-x: auto;
  max-width: 100%;
  white-space: nowrap;
  justify-self: end;
}

.tab-scroll-wrapper::-webkit-scrollbar {
  display: none;
}
.tab-no-arrow {
  display: flex;
}
.tab-no-arrow .q-tab {
  flex: 1 1 0;
  text-align: center;
  border-radius: 12px 12px 0 0;
  min-width: unset; /* ยกเลิก min-width เดิม */
}
.tab-no-arrow .q-tab.q-tab--active {
  background-color: #edf0f5;
}
.custom-panels {
  max-height: unset;
  background-color: #edf0f5;
}
@media (max-width: 1650px) {
  .custom-panels {
    max-height: unset;
  }
}
</style>
