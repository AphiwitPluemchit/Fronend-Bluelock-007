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

          <!-- สาขาและชั่วโมงทักษะทางวิชาการ -->
          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md">
              <p class="q-my-none">สาขา :</p>
            </div>
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
  </div>
  <!-- ส่วนประวัติการอบรม -->
  <div class="q-mb-sm">
    <div class="header-container text-center">
      <div class="text-h6 q-mt-lg">ประวัติการอบรม</div>
      <div class="filter-container">
        <FilterDialog
          v-model="showFilterDialog1"
          :categories="filterCategories1"
          @apply="applyFilters"
          class="q-mr-sm"
        />
      </div>
    </div>
    <q-table :columns="columns" :rows="historyActivity" row-key="name" class="tableHisAct">
      <!-- เนื้อหาตาราง -->
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="index">{{ props.rowIndex + 1 }}</q-td>
          <q-td
            key="name"
            style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
          >
            {{ props.row.name }}
          </q-td>
          <q-td key="date">{{ props.row.date }}</q-td>
          <q-td key="time">{{ props.row.time }}</q-td>
          <q-td key="location">{{ props.row.location }}</q-td>
          <!-- แสดงชั่วโมงเตรียมความพร้อม -->
          <q-td key="softskill" class="text-center">
            <span :class="{ 'negative-hours': props.row.skill === 'soft' && props.row.hours < 0 }">
              {{ props.row.skill === 'soft' ? props.row.hours : '-' }}
            </span>
          </q-td>
          <!-- แสดงชั่วโมงทักษะทางวิชาการ -->
          <q-td key="hardskill" class="text-center">
            <span :class="{ 'negative-hours': props.row.skill === 'hard' && props.row.hours < 0 }">
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
        <q-btn label="ยกเลิก" class="btnreject q-mr-md" unelevated rounded @click="confirmCancel" />
        <q-btn label="บันทึก" class="btnconfirm" unelevated rounded @click="saveChanges" />
      </template>
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
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import studentEditIcon from 'src/pages/admin-page/student/icons pics/user-edit-icon.png'
import { useStudentStore } from 'src/stores/student'
import type { Student } from 'src/types/student'

const majorOptions = ['CS', 'AAI', 'IT', 'SE']

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
// const studentYear = computed(() => {
//   if (!studentStore.student?.code || studentStore.student.code.length < 2) return 'N/A'

//   const currentDate = new Date()
//   const currentYear = currentDate.getFullYear() + 543 // ปีปัจจุบัน (พ.ศ.)
//   const currentMonth = currentDate.getMonth() + 1 // เดือนปัจจุบัน (1-12)

//   const admissionYear = 2500 + parseInt(studentStore.student.code.substring(0, 2), 10) // ปีที่เข้าเรียน
//   const transitionMonth = 6 // เดือนมิถุนายนเป็นจุดเปลี่ยนชั้นปี

//   let yearLevel = currentYear - admissionYear
//   if (currentMonth >= transitionMonth) {
//     yearLevel++ // ถ้าเดือนปัจจุบันเป็นมิถุนายนหรือหลังจากนั้น ให้เพิ่มชั้นปีขึ้น 1
//   }

//   return yearLevel >= 1 && yearLevel <= 4 ? yearLevel.toString() : 'N/A' // จำกัดชั้นปีที่ 1-4
// })

const breadcrumbs = ref({
  previousPage: { title: 'จัดการข้อมูลนิสิต', path: '/Admin/StudentManagement' },
  currentPage: { title: 'รายละเอียดนิสิต', path: `/Admin/StudentManagement/StudentDetail/` },
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
}

const isEditMode = ref(false)
//แก้ไข
const enableEditMode = () => {
  isEditMode.value = true
  originalStudentData.value = { ...studentStore.student } // เก็บข้อมูลเดิมก่อนแก้ไข
}

// บันทึกแก้ไข
const saveChanges = async () => {
  const result = await studentStore.updateStudent(studentStore.student)
  if (result) {
    // ปิด Edit Mode
    isEditMode.value = false
  }
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
    name: 'กิจกรรมเสริมสร้างขความรู้และสร้างความสามารถ',
    date: '14 มกราคม 2566',
    time: '08:00-12:00',
    location: 'IF-3C02',
    skill: 'hard',
    hours: 4,
  },
  {
    name: 'กิจกรรมเสริมสร้างขความรู้และสร้างความสามารถกิจกรรมเสริมสร้างขความรู้และสร้างความสามารถกิจกรรมเสริมสร้างขความรู้และสร้างความสามารถกิจกรรมเสริมสร้างขความรู้และสร้างความสามารถ',
    date: '14 มกราคม 2566',
    time: '08:00-12:00',
    location: 'IF-3C02',
    skill: 'soft',
    hours: 4,
  },
  {
    name: 'กิจกรรมเสริมสร้างขความรู้และสร้างความสามารถ',
    date: '14 มกราคม 2566',
    time: '08:00-16:00',
    location: 'IF-3C02',
    skill: 'soft',
    hours: -4,
  },
  {
    name: 'กิจกรรมเสริมสร้างขความรู้และสร้างความสามารถ',
    date: '14 มกราคม 2566',
    time: '09:00-12:00',
    location: 'IF-3C02',
    skill: 'soft',
    hours: 3,
  },
  {
    name: 'กิจกรรมเสริมสร้างขความรู้และสร้างความสามารถ',
    date: '14 มกราคม 2566',
    time: '08:00-12:00',
    location: 'IF-3C02',
    skill: 'hard',
    hours: 4,
  },
  {
    name: 'กิจกรรมเสริมสร้างขความรู้และสร้างความสามารถ',
    date: '14 มกราคม 2566',
    time: '08:00-16:00',
    location: 'IF-3C02',
    skill: 'soft',
    hours: 8,
  },
])
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
.tableHisAct {
  height: 340px;
}
</style>
