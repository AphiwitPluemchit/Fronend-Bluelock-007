<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
// import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import { useStudentStore } from 'src/stores/student'
import type { Student } from 'src/types/student'
import { EnrollmentService } from 'src/services/enrollment'
import type { ActivityHistory } from 'src/types/activity'
import type { Pagination } from 'src/types/pagination'
import ActivityType from 'src/pages/student-page/activity/component/ActivityType.vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
interface ActivityRow {
  id: string
  name: string
  skill: string
  hour: number
  checkinoutRecord: string // แสดงเป็นข้อความ เช่น "13/08/2025 20:44 -"
}
const majorOptions = ['CS', 'AAI', 'IT', 'SE']

const originalStudentData = ref<Student | null>(null)
const show = ref(false)
const route = useRoute()
const studentCode = ref(route.params.code as unknown as string)
const studentStore = useStudentStore()

const historyActivity = ref<ActivityHistory[]>([])

const query = ref<Pagination>({
  page: 1,
  limit: 99,
  search: '',
  sortBy: '_id',
  order: 'desc',
  skill: [],
  activityState: [],
  major: [],
  studentYear: [],
})

const breadcrumbs = ref({
  previousPage: { title: 'จัดการข้อมูลนิสิต', path: '/Admin/StudentManagement' },
  currentPage: {
    title: 'รายละเอียดนิสิต',
    path: route.fullPath,
  },
  icon: 'people',
})

const showFilterDialog = ref(false)
const selectedType = ref<string[]>([])
const searchQuery = ref('')

function applyFilters(selected: { categoryActivity: string[] }) {
  selectedType.value = selected.categoryActivity
  showFilterDialog.value = false
}

const isEditMode = ref(false)
const enableEditMode = () => {
  isEditMode.value = true
  originalStudentData.value = { ...studentStore.student }
}

const saveChanges = async () => {
  const result = await studentStore.updateStudent(studentStore.student)
  if (result) {
    isEditMode.value = false
  }
}

const showCancelDialog = ref(false)
const confirmCancel = () => {
  showCancelDialog.value = true
}

const cancelEdit = () => {
  studentStore.student = { ...originalStudentData.value } as Student
  isEditMode.value = false
}
function mapHistoryToRows(data: ActivityHistory[]): ActivityRow[] {
  const rows: ActivityRow[] = []
  data.forEach((act) => {
    act.activityItems?.forEach((item) => {
      // แปลง checkinoutRecord ให้เป็น string
      const checkinLogs =
        item.checkinoutRecord && item.checkinoutRecord.length > 0
          ? item.checkinoutRecord
              .map(
                (r) =>
                  `${new Date(r.checkin).toLocaleString('th-TH', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })} - ${
                    r.checkout
                      ? new Date(r.checkout).toLocaleTimeString('th-TH', { timeStyle: 'short' })
                      : 'ยังไม่ออก'
                  }`,
              )
              .join('\n')
          : '-'

      rows.push({
        id: item.id || '',
        name: act.name,
        skill: act.skill || '',
        hour: item.hour || 0,
        checkinoutRecord: checkinLogs,
      })
    })
  })
  return rows
}

const filteredHistory = computed(() => {
  let rows = historyActivity.value as unknown as ActivityRow[]

  if (selectedType.value.length > 0) {
    rows = rows.filter((r) =>
      selectedType.value.includes(r.skill === 'hard' ? 'hard' : r.skill === 'soft' ? 'soft' : ''),
    )
  }

  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    rows = rows.filter((r) => r.name.toLowerCase().includes(query))
  }

  return rows
})
onMounted(async () => {
  show.value = false
  if (!studentCode.value) return
  await studentStore.getStudentByCode(studentCode.value)
  originalStudentData.value = { ...studentStore.student }
  const response = await EnrollmentService.getEnrollmentsHistoryByStudentID(
    studentStore.student.id || '',
    query.value,
  )
  console.log(response)

  historyActivity.value = mapHistoryToRows(response.data) // ✅ แปลงก่อน
  show.value = true
})

const columns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'left' as const },
  { name: 'name', label: 'ชื่อกิจกรรม', field: 'name', align: 'left' as const },
  { name: 'skill', label: 'ประเภท', field: 'skill', align: 'center' as const },
  { name: 'hour', label: 'จำนวนชั่วโมง', field: 'hour', align: 'center' as const },
  {
    name: 'checkinoutRecord',
    label: 'การเช็คชื่อ',
    field: 'checkinoutRecord',
    align: 'left' as const,
  },
]
</script>

<template>
  <div class="q-pa-md">
    <!-- Breadcrumbs -->
    <div><AppBreadcrumbs :breadcrumbs="breadcrumbs" /></div>

    <div class="q-mx-lg">
      <div class="text-h6 q-mt-lg">ข้อมูลนิสิต</div>
      <q-card flat class="q-mt-md">
        <div v-if="show" class="row q-col-gutter-md">
          <!-- แถวข้อมูลนิสิต -->
          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md"><p class="q-my-none">ชื่อ :</p></div>
            <div class="col-4">
              <q-input
                v-model="studentStore.student.name"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
                borderless
                dense
              />
            </div>
            <div class="col-2 text-right q-pr-md"><p class="q-my-none">Email :</p></div>
            <div class="col-4">
              <q-input
                v-model="studentStore.student.email"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
                borderless
                dense
              />
            </div>
          </div>

          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md"><p class="q-my-none">รหัสนิสิต :</p></div>
            <div class="col-4">
              <q-input
                v-model="studentStore.student.code"
                class="readonly"
                readonly
                borderless
                dense
              />
            </div>
            <div class="col-2 text-right q-pr-md">
              <p class="q-my-none">ชั่วโมงเตรียมความพร้อม :</p>
            </div>
            <div class="col-4">
              <q-input
                v-model="studentStore.student.softSkill"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
                borderless
                dense
                type="number"
              />
            </div>
          </div>

          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md"><p class="q-my-none">สาขา :</p></div>
            <!-- <div class="col-4"> -->
            <!-- รอแก้ -->
            <!-- <q-input
                v-model="studentYear"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
                borderless
                dense
              />
            </div> -->
            <!-- <div class="col-4">
              <q-input
                v-model="studentStore.student.major"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
                borderless
                dense
              />
            </div> -->
            <div class="col-4">
              <q-select
                v-if="isEditMode"
                v-model="studentStore.student.major"
                :options="majorOptions"
                dense
                outlined
                emit-value
                map-options
              />
              <q-input
                v-else
                v-model="studentStore.student.major"
                readonly
                class="readonly"
                borderless
                dense
              />
            </div>
            <div class="col-2 text-right q-pr-md">
              <p class="q-my-none">ชั่วโมงทักษะทางวิชาการ :</p>
            </div>
            <div class="col-4">
              <q-input
                v-model="studentStore.student.hardSkill"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
                borderless
                dense
                type="number"
              />
            </div>
          </div>

          <!-- สาขา -->
          <!-- <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md">
              <p class="q-my-none">สาขา :</p>
            </div> -->

          <!-- </div> -->
        </div>
      </q-card>
    </div>

    <!-- ส่วนประวัติการอบรม -->
    <div class="q-pa-md">
      <div class="header-container q-mb-md" style="margin-top: 12px">
        <div class="text-h6 q-mt-lg text-center">ประวัติการอบรม</div>
      <!-- ค้นหา/ฟิลเตอร์ -->
      <div class="row justify-between items-center q-mb-md search-filter-wrapper q-col-gutter-md">
        <div class="text-h6"></div>
        <div class="row search-filter-inner items-center no-wrap">
          <!-- <q-input
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
          </q-input> -->

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
      </div>

      <q-table :columns="columns" :rows="filteredHistory" row-key="id" bordered flat>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="index">{{ props.rowIndex + 1 }}</q-td>
            <q-td key="name">{{ props.row.name }}</q-td>
            <!-- <q-td key="skill">{{ props.row.skill }}</q-td> -->

            <q-td key="skill" class="text-center">
              <ActivityType
                v-if="props.row.skill === 'hard' || props.row.skill === 'soft'"
                :skill="props.row.skill === 'hard' ? 'hardSkill' : 'softSkill'"
              />
              <span v-else>-</span>
            </q-td>
            <q-td key="hour" class="text-center">{{ props.row.hour }}</q-td>
            <q-td key="checkinoutRecord">
              <pre style="white-space: pre-line">{{ props.row.checkinoutRecord }}</pre>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <div class="q-mt-md q-pa-md text-right">
      <template v-if="!isEditMode">
        <q-btn label="แก้ไข" class="btnedit" unelevated rounded @click="enableEditMode" />
      </template>
      <template v-else>
        <q-btn label="ยกเลิก" class="btnreject q-mr-md" unelevated rounded @click="confirmCancel" />
        <q-btn label="บันทึก" class="btnconfirm" unelevated rounded @click="saveChanges" />
      </template>
    </div>

    <!-- Dialog -->
    <q-dialog v-model="showCancelDialog">
      <q-card
        style="
          background-color: white;
          width: 600px;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
        "
      >
        <q-card-section><div class="text-h6">ยืนยันการยกเลิก</div></q-card-section>
        <q-card-section
          >คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการแก้ไข?
          การเปลี่ยนแปลงทั้งหมดจะไม่ถูกบันทึก</q-card-section
        >
        <q-card-actions align="right">
          <q-btn flat label="ยกเลิก" class="btnreject q-mr-md" v-close-popup />
          <q-btn flat label="ยืนยัน" class="btnconfirm" @click="cancelEdit" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.search-filter-wrapper {
  flex-wrap: wrap;
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
</style>
