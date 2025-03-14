<template>
  <div class="q-pa-md">
    <!-- Breadcrumbs -->
    <div><AppBreadcrumbs :breadcrumbs="breadcrumbs" /></div>

    <div class="q-mx-lg">
      <div class="text-h6 q-mt-lg">ข้อมูลนิสิต</div>
      <q-card flat class="q-mt-md">
        <!-- ข้อมูลนิสิต -->
        <div v-if="studentStore.student" class="row q-col-gutter-md">
          <!-- ชื่อและข้อมูลนิสิต -->
          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md">
              <p class="q-my-none">ชื่อ :</p>
            </div>
            <div class="col-4">
              <q-input
                v-model="studentStore.student.name"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
                borderless
                dense
              />
            </div>
            <div class="col-2 text-right q-pr-md">
              <p class="q-my-none">Email :</p>
            </div>
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

          <!-- รหัสนิสิตและชั่วโมงเตรียมความพร้อม -->
          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md">
              <p class="q-my-none">รหัสนิสิต :</p>
            </div>
            <div class="col-4">
              <q-input
                v-model="studentStore.student.code"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
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
              />
            </div>
          </div>

          <!-- ชั้นปีและชั่วโมงทักษะทางวิชาการ -->
          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md">
              <p class="q-my-none">ชั้นปี :</p>
            </div>
            <div class="col-4">
              <!-- รอแก้ -->
              <q-input
                v-model="studentYear"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
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
              />
            </div>
          </div>

          <!-- สาขา -->
          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md">
              <p class="q-my-none">สาขา :</p>
            </div>
            <div class="col-4">
              <q-input
                v-model="studentStore.student.majorNames"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
                borderless
                dense
              />
            </div>
          </div>
        </div>
      </q-card>
    </div>

    <!-- ส่วนประวัติการอบรม -->
    <div class="q-mb-sm">
      <div class="header-container text-center">
        <div class="text-h6">ประวัติการอบรม</div>
        <div class="filter-container">
          <q-btn class="btnfilter q-mr-sm" @click="showFilterDialog1 = true">
            <img src="public\icons\sort.svg" alt="Sort Icon" width="30" height="30" />
            <FilterDialog
              v-model="showFilterDialog1"
              :categories="filterCategories1"
              @apply="applyFilters"
            />
          </q-btn>
        </div>
      </div>
      <q-table :columns="columns" :rows="historyActivity" row-key="name">
        <!-- เนื้อหาตาราง -->
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="index">{{ props.row.index }}</q-td>
            <q-td
              key="name"
              style="
                max-width: 250px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            >
              {{ props.row.name }}
            </q-td>
            <q-td key="date">{{ props.row.date }}</q-td>
            <q-td key="time">{{ props.row.time }}</q-td>
            <q-td key="location">{{ props.row.location }}</q-td>
            <!-- แสดงชั่วโมงเตรียมความพร้อม -->
            <q-td key="softskill" class="text-center">
              <span
                :class="{ 'negative-hours': props.row.skill === 'soft' && props.row.hours < 0 }"
              >
                {{ props.row.skill === 'soft' ? props.row.hours : '-' }}
              </span>
            </q-td>
            <!-- แสดงชั่วโมงทักษะทางวิชาการ -->
            <q-td key="hardskill" class="text-center">
              <span
                :class="{ 'negative-hours': props.row.skill === 'hard' && props.row.hours < 0 }"
              >
                {{ props.row.skill === 'hard' ? props.row.hours : '-' }}
              </span>
            </q-td>
          </q-tr>
        </template>
      </q-table>
      <div class="q-mt-md text-right">
        <template v-if="!isEditMode">
          <q-btn label="แก้ไข" class="btnedit" unelevated rounded @click="enableEditMode" />
        </template>
        <template v-else>
          <q-btn
            label="ยกเลิก"
            class="btnreject q-mr-md"
            unelevated
            rounded
            @click="confirmCancel"
          />
          <q-btn label="บันทึก" class="btnconfirm" unelevated rounded @click="saveChanges" />
        </template>
      </div>
    </div>
  </div>
  <!-- Dialog ยืนยันการยกเลิก -->
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
      <q-card-section>
        <div class="text-h6">ยืนยันการยกเลิก</div>
      </q-card-section>
      <q-card-section>
        คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการแก้ไข? การเปลี่ยนแปลงทั้งหมดจะไม่ถูกบันทึก
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="ยกเลิก" class="btnreject q-mr-md" v-close-popup />
        <q-btn flat label="ยืนยัน" class="btnconfirm" @click="cancelEdit" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import studentEditIcon from 'src/pages/admin-page/student/icons pics/user-edit-icon.png'
import { useStudentStore } from 'src/stores/student'
import type { Student } from 'src/types/student'

const originalStudentData = ref<Student | null>(null) // เก็บข้อมูลเดิมก่อนแก้ไข

const route = useRoute()
const studentCode = ref(route.params.code as unknown as string) // ดึงค่า code จาก URL
const studentStore = useStudentStore()
onMounted(async () => {
  if (!studentCode.value) return
  await studentStore.getStudentByCode(studentCode.value)
  originalStudentData.value = { ...studentStore.student } // เก็บข้อมูลเดิม
})

//คำนวณชั้นปี
const studentYear = computed(() => {
  if (!studentStore.student?.code || studentStore.student.code.length < 2) return 'N/A'

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() + 543 // ปีปัจจุบัน (พ.ศ.)
  const currentMonth = currentDate.getMonth() + 1 // เดือนปัจจุบัน (1-12)

  const admissionYear = 2500 + parseInt(studentStore.student.code.substring(0, 2), 10) // ปีที่เข้าเรียน
  const transitionMonth = 6 // เดือนมิถุนายนเป็นจุดเปลี่ยนชั้นปี

  let yearLevel = currentYear - admissionYear
  if (currentMonth >= transitionMonth) {
    yearLevel++ // ถ้าเดือนปัจจุบันเป็นมิถุนายนหรือหลังจากนั้น ให้เพิ่มชั้นปีขึ้น 1
  }

  return yearLevel >= 1 && yearLevel <= 4 ? yearLevel.toString() : 'N/A' // จำกัดชั้นปีที่ 1-4
})

const breadcrumbs = ref({
  previousPage: { title: 'จัดการข้อมูลนิสิต', path: '/StudentManagement' },
  currentPage: { title: 'รายละเอียดนิสิต', path: `/StudentManagement/StudentDetail/` },
  icon: studentEditIcon,
})

const showFilterDialog1 = ref(false)
const filterCategories1 = ref(['categoryActivity'])
const filters = ref<{
  categoryActivity: string[]
}>({
  categoryActivity: [],
})
const applyFilters = (selectedFilters: { categoryActivity: string[] }) => {
  filters.value = selectedFilters
  console.log('Filters Applied:', filters.value)
}

const isEditMode = ref(false)
//แก้ไข
const enableEditMode = () => {
  isEditMode.value = true
  originalStudentData.value = { ...studentStore.student } // เก็บข้อมูลเดิมก่อนแก้ไข
}

// บันทึก
const saveChanges = () => {
  isEditMode.value = false
}

// ยกเลิกการแก้ไข
const showCancelDialog = ref(false)
const confirmCancel = () => {
  showCancelDialog.value = true // แสดง Dialog ยืนยันการยกเลิก
}

// ยกเลิกการแก้ไข
const cancelEdit = () => {
  studentStore.student = { ...originalStudentData.value } as Student
  isEditMode.value = false
}

// const props = defineProps({
//   rows: Array
// })

const columns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'left' as const },
  {
    name: 'name',
    label: 'ชื่อกิจกรรม',
    field: 'name',
    align: 'left' as const,
    style: 'max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
  },
  { name: 'date', label: 'วันที่', field: 'date', align: 'left' as const },
  { name: 'time', label: 'เวลา', field: 'time', align: 'left' as const },
  { name: 'location', label: 'สถานที่', field: 'location', align: 'left' as const },
  {
    name: 'softskill',
    label: 'ชั่วโมงเตรียมความพร้อม',
    field: 'softskill',
    align: 'center' as const,
  },
  {
    name: 'hardskill',
    label: 'ชั่วโมงทักษะทางวิชาการ',
    field: 'hardskill',
    align: 'center' as const,
  },
]
//mockupActivity
const historyActivity = ref([
  {
    index: 1,
    name: 'กิจกรรมเสริมสร้างขความรู้และสร้างความสามารถ',
    date: '14 มกราคม 2566',
    time: '08:00-12:00',
    location: 'IF-3C02',
    skill: 'hard',
    hours: 4,
  },
  {
    index: 2,
    name: 'กิจกรรมเสริมสร้างขความรู้และสร้างความสามารถกิจกรรมเสริมสร้างขความรู้และสร้างความสามารถกิจกรรมเสริมสร้างขความรู้และสร้างความสามารถกิจกรรมเสริมสร้างขความรู้และสร้างความสามารถ',
    date: '14 มกราคม 2566',
    time: '08:00-12:00',
    location: 'IF-3C02',
    skill: 'soft',
    hours: 4,
  },
  {
    index: 3,
    name: 'กิจกรรมเสริมสร้างขความรู้และสร้างความสามารถ',
    date: '14 มกราคม 2566',
    time: '08:00-16:00',
    location: 'IF-3C02',
    skill: 'soft',
    hours: -4,
  },
  {
    index: 4,
    name: 'กิจกรรมเสริมสร้างขความรู้และสร้างความสามารถ',
    date: '14 มกราคม 2566',
    time: '09:00-12:00',
    location: 'IF-3C02',
    skill: 'soft',
    hours: 3,
  },
  {
    index: 5,
    name: 'กิจกรรมเสริมสร้างขความรู้และสร้างความสามารถ',
    date: '14 มกราคม 2566',
    time: '08:00-12:00',
    location: 'IF-3C02',
    skill: 'hard',
    hours: 4,
  },
  {
    index: 6,
    name: 'กิจกรรมเสริมสร้างขความรู้และสร้างความสามารถ',
    date: '14 มกราคม 2566',
    time: '08:00-16:00',
    location: 'IF-3C02',
    skill: 'soft',
    hours: 8,
  },
])
// const mockStudents = ref([
//   {
//     index: 1,
//     studentID: '65160311',
//     name: 'คิรัชช์ รัตนวงศ์',
//     major: 'CS',
//     softskill: '30',
//     hardskill: '12',
//     year: '3',
//     email: '65160311@go.buu.ac.th',
//   },
//   {
//     index: 2,
//     studentID: '65160312',
//     name: 'กรนิศา ทองเยี่ยม',
//     major: 'CS',
//     softskill: '15',
//     hardskill: '30',
//     year: '3',
//     email: '65160312@go.buu.ac.th',
//   },
//   {
//     index: 3,
//     studentID: '65160313',
//     name: 'อุดม เมธี',
//     major: 'ITDI',
//     softskill: '11',
//     hardskill: '11',
//     year: '3',
//     email: '65160313@go.buu.ac.th',
//   },
//   {
//     index: 4,
//     studentID: '65160314',
//     name: 'ภัทรพล เกียรติคุณ',
//     major: 'ITDI',
//     softskill: '15',
//     hardskill: '20',
//     year: '2',
//     email: '65160313@go.buu.ac.th',
//   },
//   {
//     index: 5,
//     studentID: '65160315',
//     name: 'วณิชชา สีสังข์',
//     major: 'AAI',
//     softskill: '11',
//     hardskill: '30',
//     year: '1',
//     email: '65160313@go.buu.ac.th',
//   },
//   {
//     index: 6,
//     studentID: '65160316',
//     name: 'คิรัชช์ รัตนวงศ์รัตนวงศ์รัตนวงศ์รัตนวงศ์',
//     major: 'CS',
//     softskill: '30',
//     hardskill: '12',
//     year: '3',
//     email: '65160316@go.buu.ac.th',
//   },
//   {
//     index: 7,
//     studentID: '65160317',
//     name: 'กรนิศา ทองเยี่ยม',
//     major: 'CS',
//     softskill: '15',
//     hardskill: '30',
//     year: '4',
//     email: '65160317@go.buu.ac.th',
//   },
//   {
//     index: 8,
//     studentID: '65160318',
//     name: 'อุดม เมธี',
//     major: 'ITDI',
//     softskill: '11',
//     hardskill: '11',
//     year: '4',
//     email: '65160318@go.buu.ac.th',
//   },
//   {
//     index: 9,
//     studentID: '65160319',
//     name: 'ภัทรพล เกียรติคุณ',
//     major: 'ITDI',
//     softskill: '30',
//     hardskill: '20',
//     year: '3',
//     email: '65160319@go.buu.ac.th',
//   },
//   {
//     index: 10,
//     studentID: '65160320',
//     name: 'วณิชชา สีสังข์',
//     major: 'AAI',
//     softskill: '11',
//     hardskill: '30',
//     year: '3',
//     email: '65160320@go.buu.ac.th',
//   },
//   {
//     index: 11,
//     studentID: '65160321',
//     name: 'คิรัชช์ รัตนวงศ์',
//     major: 'CS',
//     softskill: '30',
//     hardskill: '12',
//     year: '3',
//     email: '65160321@go.buu.ac.th',
//   },
//   {
//     index: 12,
//     studentID: '65160322',
//     name: 'กรนิศา ทองเยี่ยม',
//     major: 'CS',
//     softskill: '15',
//     hardskill: '30',
//     year: '3',
//     email: '65160322@go.buu.ac.th',
//   },
//   {
//     index: 13,
//     studentID: '65160323',
//     name: 'อุดม เมธี',
//     major: 'ITDI',
//     softskill: '11',
//     hardskill: '11',
//     year: '3',
//     email: '65160323@go.buu.ac.th',
//   },
//   {
//     index: 14,
//     studentID: '65160324',
//     name: 'ภัทรพล เกียรติคุณ',
//     major: 'ITDI',
//     softskill: '15',
//     hardskill: '20',
//     year: '3',
//     email: '65160324@go.buu.ac.th',
//   },
//   {
//     index: 15,
//     studentID: '65160325',
//     name: 'วณิชชา สีสังข์',
//     major: 'AAI',
//     softskill: '11',
//     hardskill: '30',
//     year: '3',
//     email: '65160325@go.buu.ac.th',
//   },
//   {
//     index: 16,
//     studentID: '65160326',
//     name: 'คิรัชช์ รัตนวงศ์',
//     major: 'CS',
//     softskill: '30',
//     hardskill: '12',
//     year: '3',
//     email: '65160326@go.buu.ac.th',
//   },
//   {
//     index: 17,
//     studentID: '65160327',
//     name: 'กรนิศา ทองเยี่ยม',
//     major: 'CS',
//     softskill: '15',
//     hardskill: '30',
//     year: '3',
//     email: '65160327@go.buu.ac.th',
//   },
//   {
//     index: 18,
//     studentID: '65160328',
//     name: 'อุดม เมธี',
//     major: 'ITDI',
//     softskill: '11',
//     hardskill: '11',
//     year: '2',
//     email: '65160328@go.buu.ac.th',
//   },
//   {
//     index: 19,
//     studentID: '65160329',
//     name: 'ภัทรพล เกียรติคุณ',
//     major: 'ITDI',
//     softskill: '30',
//     hardskill: '20',
//     email: '65160329@go.buu.ac.th',
//   },
//   {
//     index: 20,
//     studentID: '65160330',
//     name: 'วณิชชา สีสังข์',
//     major: 'AAI',
//     softskill: '11',
//     hardskill: '30',
//     year: '2',
//     email: '65160330@go.buu.ac.th',
//   },
//   {
//     index: 21,
//     studentID: '65160331',
//     name: 'อุดม เมธี',
//     major: 'ITDI',
//     softskill: '11',
//     hardskill: '11',
//     year: '3',
//     email: '65160331@go.buu.ac.th',
//   },
//   {
//     index: 22,
//     studentID: '65160332',
//     name: 'ภัทรพล เกียรติคุณ',
//     major: 'ITDI',
//     softskill: '15',
//     hardskill: '20',
//     year: '3',
//     email: '65160332@go.buu.ac.th',
//   },
//   {
//     index: 23,
//     studentID: '65160333',
//     name: 'วณิชชา สีสังข์',
//     major: 'AAI',
//     softskill: '11',
//     hardskill: '30',
//     year: '2',
//     email: '65160333@go.buu.ac.th',
//   },
//   {
//     index: 24,
//     studentID: '65160334',
//     name: 'คิรัชช์ รัตนวงศ์',
//     major: 'CS',
//     softskill: '30',
//     hardskill: '12',
//     year: '2',
//     email: '65160334@go.buu.ac.th',
//   },
//   {
//     index: 25,
//     studentID: '65160335',
//     name: 'กรนิศา ทองเยี่ยม',
//     major: 'CS',
//     softskill: '15',
//     hardskill: '30',
//     year: '4',
//     email: '65160335@go.buu.ac.th',
//   },
//   {
//     index: 26,
//     studentID: '65160336',
//     name: 'อุดม เมธี',
//     major: 'ITDI',
//     softskill: '11',
//     hardskill: '11',
//     year: '3',
//     email: '65160336@go.buu.ac.th',
//   },
//   {
//     index: 27,
//     studentID: '65160337',
//     name: 'ภัทรพล เกียรติคุณ',
//     major: 'ITDI',
//     softskill: '30',
//     hardskill: '20',
//     year: '3',
//     email: '65160337@go.buu.ac.th',
//   },
//   {
//     index: 28,
//     studentID: '65160338',
//     name: 'วณิชชา สีสังข์',
//     major: 'AAI',
//     softskill: '11',
//     hardskill: '30',
//     year: '3',
//     email: '65160338@go.buu.ac.th',
//   },
// ])
</script>
<style scoped>
.negative-hours {
  color: #f03b2d; /* สีแดง */
}
.filter-container {
  display: flex;
  justify-content: flex-end; /* จัดชิดขวา */
  margin-bottom: 16px; /* เพิ่มระยะห่างด้านล่าง */
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
