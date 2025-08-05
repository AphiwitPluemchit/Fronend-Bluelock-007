<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import type { QTableProps } from 'quasar'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from 'src/stores/course'
import type { Course } from 'src/types/course'

const search1 = ref('')
const showFilterDialog1 = ref(false)
const filterCategories1 = ref(['categoryActivity'])

const courseStore = useCourseStore()
const rows = ref<Course[]>([])

onMounted(async () => {
  console.log('Fetching courses...')
  await nextTick(async () => {
    await courseStore.fetchCourses()
  })
  console.log('Courses from store:', courseStore.courses)

  rows.value = courseStore.courses
  console.log('Rows value:', rows.value)
})

// interface CertificateCourse {
//   id: number
//   certName: string
//   hour: number
//   link: string
//   categoryActivity: 'ทักษะทางวิชาการ' | 'เตรียมความพร้อม'
// }

const columns: QTableProps['columns'] = [
  { name: 'id', label: 'ลำดับ', field: 'id', align: 'left' },
  { name: 'name', label: 'ชื่อหัวข้อการอบรม', field: 'name', align: 'left' },
  { name: 'hour', label: 'ชั่วโมง', field: 'hour', align: 'center' },
  { name: 'link', label: 'Link สมัครเรียน (Short URL)', field: 'link', align: 'left' },
  {
    name: 'isHardSkill',
    label: 'เก็บชั่วโมงในหมวด',
    field: 'isHardSkill',
    align: 'center',
  },
  { name: 'action', label: '', field: 'action', align: 'left' },
]

function getcategoryCourse(row: Course) {
  return row.isHardSkill ? ' soft-skill' : 'hard-skill'
}

const router = useRouter()

function goToDetail(row: Course) {
  void router.push({
    path: `/admin/CourseDetail/${row.id}`,
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
      <div class="texttitle">หัวข้ออบรมออนไลน์สำหรับการเก็บชั่วโมงสหกิจศึกษา</div>
      <!-- ปุ่มเพื่อการเพิ่มข้อมูล -->
      <q-btn dense outlined label="เพิ่มหัวข้อการอบรม" class="btnadd" @click="goToAddCourse" />
    </div>
    <section class="q-mt-lg">
      <template v-if="$q.screen.gt.sm">
        <!-- แถวค้นหาและไอคอน -->
        <div class="row justify-end items-center">
          <q-input
            dense
            outlined
            v-model="search1"
            label="ค้นหา ชื่อ"
            class="searchbox q-pr-sm"
            :style="{ boxShadow: 'none', border: 'none' }"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <FilterDialog
            v-model="showFilterDialog1"
            :categories="filterCategories1"
            class="filter-btn"
          />
        </div>
        <!-- Desktop: QTable -->
        <q-table
          bordered
          flat
          :rows="rows"
          :columns="columns"
          class="q-mt-md customtable"
          :pagination="{ rowsPerPage: 10 }"
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
              <q-td key="index">{{ props.pageIndex + 1 }}</q-td>

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

              <q-td key="link">
                <a :href="props.row.link" target="_blank" class="text-primary">
                  {{ props.row.link }}
                </a>
              </q-td>

              <q-td key="isHardSkill" class="text-center">
                <q-badge
                  :label="props.row.isHardSkill ? 'ทักษะทางวิชาการ' : 'เตรียมความพร้อม'"
                  class="status-badge"
                  :class="getcategoryCourse(props.row)"
                />
              </q-td>

              <q-td key="action" class="text-center q-gutter-x-sm">
                <q-icon
                  clickable
                  name="visibility"
                  class="bg-primary text-white q-pa-xs rounded-borders q-mr-sm"
                  @click="goToDetail(props.row)"
                >
                  <q-tooltip>ดูรายละเอียด</q-tooltip>
                </q-icon>
              </q-td>
            </q-tr>
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
            v-model="search1"
            label="ค้นหา ชื่อ"
            class="searchbox q-pr-sm"
            :style="{ boxShadow: 'none', border: 'none' }"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <FilterDialog
            v-model="showFilterDialog1"
            :categories="filterCategories1"
            class="filter-btn"
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
              <div class="ActivityNamelabel">
                {{ row.name }}
                <q-tooltip>{{ row.name }}</q-tooltip>
              </div>

              <div class="row q-gutter-sm action-section q-mt-sm">
                <q-badge
                  :label="row.isHardSkill ? 'ทักษะทางวิชาการ' : 'เตรียมความพร้อม'"
                  :class="getcategoryCourse(row)"
                  class="status-badge"
                />
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

.my-table td,
.my-table th {
  vertical-align: middle;
  font-size: 14px;
  line-height: 1.4;
  padding: 12px;
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
.ActivityNamelabel {
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
.texttitle {
  font-size: 28px;
  font-weight: 400;
}
</style>
