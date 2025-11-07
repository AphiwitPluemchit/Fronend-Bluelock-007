<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { QTableProps } from 'quasar'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from 'src/stores/course'
import type { Course } from 'src/types/course'

const showFilterDialog1 = ref(false)
const filterCategories1 = ref(['categoryProgram'])

const courseStore = useCourseStore()
const rows = computed(() => courseStore.courses ?? [])

onMounted(async () => {
  console.log('Fetching courses...')
  await fetchCoursesWithPagination()
  console.log('Courses from store:', courseStore.courses)
})

// ฟังก์ชัน fetch ข้อมูลและ sync pagination
async function fetchCoursesWithPagination() {
  await courseStore.fetchCourses()

  pagination.value.rowsNumber = courseStore.meta.total
  pagination.value.page = courseStore.params.page
  pagination.value.rowsPerPage = courseStore.params.limit
  pagination.value.sortBy = courseStore.params.sortBy || ''
  pagination.value.descending = courseStore.params.order === 'desc'
}

async function onRequest(requestProp: {
  pagination: { sortBy: string; descending: boolean; page: number; rowsPerPage: number }
}) {
  const { pagination: p } = requestProp

  courseStore.params.page = p.page
  courseStore.params.limit = p.rowsPerPage
  courseStore.params.sortBy = p.sortBy || 'name'
  courseStore.params.order = p.descending ? 'desc' : 'asc'

  await fetchCoursesWithPagination()
}

const pagination = ref({
  sortBy: courseStore.params.sortBy || '',
  descending: courseStore.params.order === 'desc',
  page: courseStore.params.page || 1,
  rowsPerPage: courseStore.params.limit || 5,
  rowsNumber: courseStore.meta.total || 0, // จำนวนข้อมูลรวม
})

const applyFilters = async (selectedFilters: { categoryProgram: string[] }) => {
  const selected = selectedFilters.categoryProgram || []

  if (selected.length === 0 || selected.length === 2) {
    // ไม่เลือก หรือเลือกทั้งคู่
    courseStore.params.isHardSkill = undefined
  } else if (selected.length === 1) {
    // เลือกอย่างเดียว
    courseStore.params.isHardSkill = selected[0] === 'hard' ? true : false
  }

  console.log('isHardSkill:', courseStore.params.isHardSkill)
  await courseStore.fetchCourses()
}

// interface CertificateCourse {
//   id: number
//   certName: string
//   hour: number
//   link: string
//   categoryProgram: 'ทักษะทางวิชาการ' | 'เตรียมความพร้อม'
// }
const columns: QTableProps['columns'] = [
  { name: 'id', label: 'ลำดับ', field: 'id', align: 'left' },
  { name: 'name', label: 'ชื่อหลักสูตร', field: 'name', align: 'left' },
  { name: 'hour', label: 'จำนวนชั่วโมง', field: 'hour', align: 'center' },
  { name: 'link', label: 'Link เข้าเรียน', field: 'link', align: 'left' },
  {
    name: 'isHardSkill',
    label: 'ประเภท',
    field: 'isHardSkill',
    align: 'left',
  },
  { name: 'isActive', label: 'สถานะ', field: 'isActive', align: 'center' },
  { name: 'action', label: '', field: 'action', align: 'left' },
]

function getcategoryCourse(row: Course) {
  return row.isHardSkill ? ' hard-skill' : 'soft-skill'
}

function getActiveText(isActive: boolean) {
  return isActive ? 'status-approved' : 'status-close'
}

const router = useRouter()

function goToDetail(row: Course) {
  void router.push({
    path: `/admin/CourseDetail/${row.id}`,
  })
}

function goToPageDetailEdit(row: Course) {
  void router.push({
    path: `/admin/CourseDetail/${row.id}`,
    query: { edit: 'true' }, // ✅ ส่ง query parameter เพื่อเปิด edit mode ทันที
  })
}
function goToAddCourse() {
  void router.push({ name: 'AddCourse' })
}
</script>

<template>
  <q-page class="q-pa-md">
    <!-- ชื่อหน้า -->
    <div class="row justify-between items-center q-mb-md" style="margin-top: 20px">
      <div class="texttitle">จัดการหลักสูตร</div>
      <!-- ปุ่มเพื่อการเพิ่มข้อมูล -->
      <q-btn dense outlined label="เพิ่มหลักสูตร" class="btnadd" @click="goToAddCourse" />
    </div>
    <section class="q-mt-lg">
      <template v-if="$q.screen.gt.sm">
        <!-- แถวค้นหาและไอคอน -->
        <div class="row justify-end items-center">
          <q-input
            dense
            outlined
            v-model="courseStore.params.search"
            placeholder="ค้นหา ชื่อหลักสูตร"
            class="searchbox q-pr-sm"
            :style="{ boxShadow: 'none', border: 'none' }"
            @update:model-value="
              () => {
                courseStore.params.page = 1
                courseStore.fetchCourses()
              }
            "
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <FilterDialog
            v-model="showFilterDialog1"
            :categories="filterCategories1"
            @apply="applyFilters"
            class="filter-btn"
          />
        </div>
        <!-- Desktop: QTable -->
        <q-table
          :rows="rows"
          :columns="columns"
          :loading="courseStore.loading"
          v-model:pagination="pagination"
          :rows-per-page-options="[5, 10, 15, 20]"
          row-key="id"
          @request="onRequest"
          class="q-mt-md my-table my-sticky-header-table"
        >
          <!-- Header Sticky -->
          <template v-slot:header="props">
            <q-tr :props="props" class="sticky-header">
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <!-- Body -->
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="index">{{ props.rowIndex + 1 }}</q-td>

              <q-td
                key="name"
                style="
                  max-width: 350px;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
              >
                {{ props.row.name }}
              </q-td>

              <q-td key="hour" class="text-center">{{ props.row.hour }}</q-td>

              <q-td
                key="link"
                style="
                  max-width: 350px;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
              >
                <a :href="props.row.link" target="_blank" class="text-primary">
                  {{ props.row.link }}
                </a>
              </q-td>

              <q-td key="isHardSkill">
                {{ props.row.isHardSkill ? 'ทักษะทางวิชาการ' : 'เตรียมความพร้อม' }}
              </q-td>

              <q-td key="isActive" class="text-center">
                <q-badge
                  :label="props.row.isActive ? 'เปิดใช้งาน' : 'ปิดชั่วคราว'"
                  class="status-badge"
                  :class="getActiveText(props.row.isActive)"
                />
              </q-td>

              <q-td key="action" class="text-center q-gutter-x-sm">
                <q-icon
                  clickable
                  name="edit"
                  class="bg-primary text-white q-pa-xs rounded-borders q-mr-sm"
                  @click="goToPageDetailEdit(props.row)"
                >
                  <q-tooltip>แก้ไข</q-tooltip>
                </q-icon>
                <q-icon
                  clickable
                  name="visibility"
                  class="bg-black text-white q-pa-xs rounded-borders q-mr-sm"
                  @click="goToDetail(props.row)"
                >
                  <q-tooltip>ดูรายละเอียด</q-tooltip>
                </q-icon>
              </q-td>
            </q-tr>
          </template>
          <template v-slot:no-data>
            <div class="full-width text-center q-pa-md text-grey" style="font-size: 20px">
              ไม่มีหัวข้อการอบรม
            </div>
          </template>
        </q-table>
      </template>
      <template v-else>
        <!-- Mobile: QTable -->
        <!-- แถวค้นหาและไอคอน -->
        <div class="row filter-row">
          <q-input
            dense
            style="flex: 1"
            outlined
            v-model="courseStore.params.search"
            placeholder="ค้นหาหัวข้อการอบรม..."
            class="searchbox q-pr-sm"
            :style="{ boxShadow: 'none', border: 'none' }"
            @update:model-value="
              () => {
                courseStore.params.page = 1
                courseStore.fetchCourses()
              }
            "
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <FilterDialog
            v-model="showFilterDialog1"
            :categories="filterCategories1"
            class="filter-btn"
            @apply="applyFilters"
          />
        </div>
        <div class="q-mt-md">
          <!-- 🔹 Card View -->
          <q-card
            v-for="(row, index) in rows"
            :key="row.id ?? `row-${index}`"
            bordered
            flat
            class="q-mb-md"
          >
            <!-- 🔷 HEADER -->
            <q-card-section class="backgroundheader">
              <div class="ProgramNamelabel">
                {{ row.name }}
                <q-tooltip>{{ row.name }}</q-tooltip>
              </div>

              <div class="row q-gutter-sm action-section q-mt-sm">
                <q-badge
                  :label="row.isHardSkill ? 'ทักษะทางวิชาการ' : 'เตรียมความพร้อม'"
                  :class="getcategoryCourse(row)"
                  class="status-badge"
                />
                <q-badge
                  :label="row.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'"
                  class="status-badge"
                  :class="getActiveText(row.isActive)"
                />
                <q-btn
                  flat
                  dense
                  icon="edit"
                  class="bg-primary text-white"
                  @click="goToPageDetailEdit(row)"
                >
                  <q-tooltip>แก้ไข</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  icon="visibility"
                  class="bg-black text-white"
                  @click="goToDetail(row)"
                >
                  <q-tooltip>ดูรายละเอียด</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>

            <!-- 🔹 CONTENT -->
            <q-card-section>
              <div class="q-mb-xs info-row">
                <div class="label">จำนวนชั่วโมง</div>
                <div class="value">: {{ row.hour }} ชั่วโมง</div>
              </div>
              <div class="q-mb-xs info-row">
                <div class="label">ลิงก์</div>
                <div class="value link-container">
                  <a :href="row.link" target="_blank" class="text-primary break-link">
                    {{ row.link }}
                  </a>
                </div>
                <!-- <div class="value">: {{ row.link }}</div> -->
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </section>
    <router-view />
  </q-page>
</template>

<style scoped>
.my-sticky-header-table {
  min-height: 340px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

/* Sticky thead (ใช้ภายใน q-table ได้เลย) */
.my-sticky-header-table thead tr {
  background-color: #162aae;
  font-weight: bold;
  font-size: 16px;
  color: #ffffff;
  border-bottom: 2px solid #d0d0d0;
  transition: background-color 0.3s ease;
}
.my-sticky-header-table td,
.my-sticky-header-table th {
  padding: 10px 12px;
  font-size: 15px;
}
.status-badge {
  width: 130px;
  height: 32px;
  line-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  text-align: center;
  display: inline-block;
  font-size: 15px;
}
.hard-skill {
  color: #001780;
  border: 1px solid #002dff;
  background-color: #cfd7ff;
}

.soft-skill {
  color: #009812;
  border: 1px solid #00bb16;
  background-color: #d2ffc7;
}

.status-approved {
  background-color: #d0ffc5;
  color: #009812;
  border: 1px solid #00bb16;
  padding: 3px 30px;
  width: 130px;
}

.status-close {
  background-color: #dadada;
  color: #000000;
  border: 1px solid #575656;
  width: 130px;
}

.category-badge {
  padding: 1px 10px;
  font-size: 14px;
  border-radius: 20px;
}
.bg-yellow-light {
  background-color: #fff8e1;
}

.bg-blue-light {
  background-color: #e1f5fe;
}
.ellipsis {
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
}

.label {
  font-weight: 600;
  font-size: 16px;
  min-width: 200px;
  margin-top: 2px;
}
.value {
  font-size: 16px;
  margin-top: 2px;
}
.ProgramNamelabel {
  font-size: 18px;
  font-weight: 700;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal; /* ✅ ให้ขึ้นบรรทัดใหม่ได้ */
  word-break: break-word; /* ✅ กันคำยาวเกิน */
}

.backgroundheader {
  background-color: #edf0f5;
}
.action-section q-btn {
  min-width: 28px;
  height: 28px;
}

.info-row {
  display: flex;
  font-size: 14px;
}

.info-row .label {
  width: 140px;
  font-weight: 600;
}

.info-row .value {
  flex: 1;
}
.link-container {
  word-break: break-all; /* ✅ ตัดลิงก์ให้ไม่ล้นการ์ด */
}

.break-link {
  display: inline-block;
  max-width: 100%;
  overflow-wrap: anywhere;
}
</style>
