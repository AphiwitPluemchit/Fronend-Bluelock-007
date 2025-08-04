<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import { useRoute } from 'vue-router'
import { useCourseStore } from 'src/stores/course'
import type { Course } from 'src/types/course'

const route = useRoute()
const id = route.params.id as string

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
  previousPage: { title: 'รายการหัวข้อทั้งหมด', path: '/admin/CertificateTablePage' },
  currentPage: { title: 'รายละเอียดหัวข้อการอบรม', path: route.fullPath },
  icon: 'school',
})
const submissionColumns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'left' as const },
  { name: 'date', label: 'วันที่อัปโหลด', field: 'date', align: 'left' as const },
  { name: 'studentCode', label: 'รหัสนิสิต', field: 'studentCode', align: 'left' as const },
  { name: 'studentName', label: 'ชื่อ-สกุล', field: 'studentName', align: 'left' as const },
  { name: 'major', label: 'สาขา', field: 'major', align: 'left' as const },
]

const submissionHistory = ref([
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160030',
    studentName: 'นายชนะพล จงอยู่ดีไพศาล',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160011',
    studentName: 'นางสาวศศิธร รัตนกาญจน์',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160030',
    studentName: 'นายธนพล จงอุทัยไพศาล',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160031',
    studentName: 'นางสาวธนมล บุญช่วย',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160033',
    studentName: 'นายธันวา ดีศิริ',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160034',
    studentName: 'นายนนธวัช นิลสนธิ',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160035',
    studentName: 'นายปุณยวีร์ นามวงษ์',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160036',
    studentName: 'นายพลพล คุ้มไข่น้ำ',
    major: 'CS',
  },
])

const showFilterDialog1 = ref(false)
const filterCategories1 = ['major', 'year']

const originalCourseData = ref<Course | null>(null)

const isEditMode = ref(false)
const showCancelDialog = ref<boolean>(false)

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
// const categoryActivityModel = computed({
//   get: () =>
//     isEditMode.value ? localEditCourse.value.categoryActivity : (course.value?.isHardSkill ?? ''),
//   set: (val: string) => {
//     if (isEditMode.value) localEditCourse.value.categoryActivity = val
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

async function saveChanges() {
  if (!course.value) return
  await courseStore.updateCourse(course.value.id!, course.value)
  originalCourseData.value = { ...courseStore.course }
  isEditMode.value = false
}
function cancelEdit() {
  showCancelDialog.value = true
}

function enableEditMode() {
  isEditMode.value = true
  if (course.value) {
    originalCourseData.value = { ...course.value }
  }
}
function confirmCancel() {
  if (originalCourseData.value) {
    course.value = { ...originalCourseData.value }
  }
  isEditMode.value = false
  showCancelDialog.value = false
}
</script>

<template>
  <div class="q-pa-md">
    <!-- Breadcrumbs -->
    <AppBreadcrumbs :breadcrumbs="breadcrumbs" />

    <div class="q-mx-lg">
      <div class="row col-12">
        <div class="text-h6 q-mt-lg col-10">ข้อมูลหัวข้อการอบรม</div>
        <div class="justify-end q-mt-lg col-2">
          <q-toggle
            v-if="course"
            v-model="course.isActive"
            :label="course.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน (จัดเก็บแล้ว)'"
            :disable="!isEditMode"
            color="primary"
          />
        </div>
      </div>

      <q-card class="q-mt-md full-width" flat>
        <div v-if="course" class="row q-col-gutter-md">
          <!-- แถวข้อมูล-->
          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md"><p class="q-my-none">ชื่อ :</p></div>
            <div class="col-10">
              <q-input
                v-model="course.name"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
                borderless
                dense
              />
            </div>
          </div>
          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md">
              <p class="q-my-none">Link URL :</p>
            </div>

            <div class="col-10">
              <!-- โหมดแก้ไข -->
              <q-input
                v-if="isEditMode"
                v-model="course.link"
                borderless
                dense
                placeholder="https://example.com"
              />

              <!-- โหมดอ่านอย่างเดียวแบบมีกรอบ + คลิกลิงก์ได้ -->
              <q-field v-else borderless dense readonly>
                <template #control>
                  <a :href="course.link" target="_blank" rel="noopener" class="link-box">
                    {{ course.link }}
                  </a>
                </template>
              </q-field>
            </div>
          </div>

          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md"><p class="q-my-none">ประเภท :</p></div>

            <div class="col-4">
              <q-select
                v-if="isEditMode"
                v-model="course.isHardSkill"
                :options="[
                  { label: 'ทักษะทางวิชาการ', value: true },
                  { label: 'เตรียมความพร้อม', value: false },
                ]"
                dense
                outlined
                emit-value
                map-options
              />
              <q-input
                v-else
                :model-value="course.isHardSkill ? 'ทักษะทางวิชาการ' : 'เตรียมความพร้อม'"
                readonly
                class="readonly"
                borderless
                dense
              />
            </div>
            <div class="col-2 text-right q-pr-md">
              <p class="q-my-none">จำนวนชั่วโมง :</p>
            </div>
            <div class="col-4">
              <q-input
                v-model="course.hour"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
                borderless
                dense
                type="number"
              />
            </div>
          </div>
        </div>
      </q-card>
    </div>
    <div class="q-mt-md q-pa-md text-right">
      <template v-if="!isEditMode">
        <q-btn label="แก้ไข" class="btnedit" unelevated rounded @click="enableEditMode" />
      </template>
      <template v-else>
        <q-btn label="ยกเลิก" class="btnreject q-mr-md" unelevated rounded @click="cancelEdit" />
        <q-btn label="บันทึก" class="btnconfirm" unelevated rounded @click="saveChanges" />
      </template>
    </div>
    <!-- ตารางประวัติ -->
    <div class="q-pa-md">
      <div class="header-container text-center">
        <div class="text-h6 q-mt-lg">ประวัติการส่งหัวข้อกิจกรรม</div>
        <div class="filter-container q-mt-sm">
          <FilterDialog
            v-model="showFilterDialog1"
            :categories="filterCategories1"
            class="q-mr-sm"
          />
        </div>
      </div>

      <q-table
        :columns="submissionColumns"
        :rows="submissionHistory"
        row-key="studentCode"
        bordered
        flat
        class="tableHisAct q-mt-md"
        :pagination="{ rowsPerPage: 10 }"
        no-data-label="ไม่พบข้อมูล"
      >
        <template v-slot:body="props">
          <q-tr :props="props" class="sticky-header">
            <q-td key="index" style="t">{{ props.rowIndex + 1 }}</q-td>
            <q-td key="date">{{ props.row.date }}</q-td>
            <q-td key="studentCode">{{ props.row.studentCode }}</q-td>
            <q-td key="studentName">{{ props.row.studentName }}</q-td>
            <q-td key="major">{{ props.row.major }}</q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <!-- Dialog -->
    <q-dialog v-model="showCancelDialog">
      <q-card>
        <q-card-section><div class="text-h6">ยืนยันการยกเลิก</div></q-card-section>
        <q-card-section
          >คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการแก้ไข?
          การเปลี่ยนแปลงทั้งหมดจะไม่ถูกบันทึก</q-card-section
        >
        <q-card-actions align="right">
          <q-btn flat label="ยกเลิก" class="btnreject q-mr-md" v-close-popup />
          <q-btn flat label="ยืนยัน" class="btnconfirm" @click="confirmCancel" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.readonly {
  background-color: #e4e4e4;
  color: #757575;
}
.q-input {
  border: 1px solid #757575;
  border-radius: 5px;
  padding-left: 10px;
}
.q-card {
  background-color: white;
  width: 600px;
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
</style>
