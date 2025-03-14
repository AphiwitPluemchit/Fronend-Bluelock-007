<script setup lang="ts">
import { ref, defineProps, computed } from 'vue'
import StudentStatus from './StudentStatus.vue'
import RemoveStudent from './RemoveStudent.vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'

const props = defineProps<{ search: string }>()

const showFilterDialog1 = ref(false)
const filterCategories1 = ref(['year', 'major', 'statusStudent'])

const filters = ref<{
  year: string[]
  major: string[]
  statusStudent: string[]
}>({
  year: [],
  major: [],
  statusStudent: [],
})

const applyFilters = (selectedFilters: {
  year: string[]
  major: string[]
  statusStudent: string[]
}) => {
  filters.value = selectedFilters
  console.log('Filters Applied:', filters.value)
}

const emit = defineEmits(['update:search'])

const search1 = ref(props.search)

// ฟังก์ชันกรองข้อมูลเฉพาะ "ชื่อนิสิต"
const updateSearch = () => {
  emit('update:search', search1.value)
}

const pagination = ref({
  page: 1,
  rowPerPage: 10,
  sortBy: 'studentId',
  descending: false,
})

const students = ref([
  {
    id: 1,
    studentId: '65160305',
    name: 'ศิวัช รัตนวงศ์',
    major: 'CS',
    checkIn: '-',
    checkOut: '-',
    status: 'ชั่วโมงมาก',
  },
  {
    id: 2,
    studentId: '65160332',
    name: 'กรณิสา ทองเอี่ยม',
    major: 'CS',
    checkIn: '-',
    checkOut: '-',
    status: 'ชั่วโมงน้อยมาก',
  },
  {
    id: 3,
    studentId: '65160332',
    name: 'อุดม เมธี',
    major: 'ITDI',
    checkIn: '-',
    checkOut: '-',
    status: 'ชั่วโมงน้อย',
  },
  {
    id: 4,
    studentId: '65160332',
    name: 'ภัทรพล เกียรติคุณ',
    major: 'ITDI',
    checkIn: '-',
    checkOut: '-',
    status: 'ชั่วโมงน้อย',
  },
  {
    id: 5,
    studentId: '65160332',
    name: 'วณิช สีสังข์',
    major: 'AAI',
    checkIn: '-',
    checkOut: '-',
    status: 'ชั่วโมงน้อย',
  },
  {
    id: 6,
    studentId: '65160332',
    name: 'กรรณา สีประสงค์',
    major: 'CS',
    checkIn: '-',
    checkOut: '-',
    status: 'ชั่วโมงน้อย',
  },
  {
    id: 7,
    studentId: '65160332',
    name: 'ธนัชชา วงศ์สุวรรณ',
    major: 'CS',
    checkIn: '-',
    checkOut: '-',
    status: 'ชั่วโมงน้อย',
  },
  {
    id: 8,
    studentId: '65160332',
    name: 'พัชราภา รัตนาราห',
    major: 'CS',
    checkIn: '-',
    checkOut: '-',
    status: 'ชั่วโมงน้อย',
  },
  {
    id: 9,
    studentId: '65160332',
    name: 'กฤติกา รัตนไพโรจน์',
    major: 'CS',
    checkIn: '-',
    checkOut: '-',
    status: 'ชั่วโมงน้อย',
  },
  {
    id: 5,
    studentId: '65160332',
    name: 'วณิช สีสังข์',
    major: 'AAI',
    checkIn: '-',
    checkOut: '-',
    status: 'ชั่วโมงน้อย',
  },
  {
    id: 6,
    studentId: '65160332',
    name: 'กรรณา สีประสงค์',
    major: 'CS',
    checkIn: '-',
    checkOut: '-',
    status: 'ชั่วโมงน้อย',
  },
  {
    id: 7,
    studentId: '65160332',
    name: 'ธนัชชา วงศ์สุวรรณ',
    major: 'CS',
    checkIn: '-',
    checkOut: '-',
    status: 'ชั่วโมงน้อย',
  },
  {
    id: 8,
    studentId: '65160332',
    name: 'พัชราภา รัตนาราห',
    major: 'CS',
    checkIn: '-',
    checkOut: '-',
    status: 'ชั่วโมงน้อย',
  },
  {
    id: 9,
    studentId: '65160332',
    name: 'กฤติกา รัตนไพโรจน์',
    major: 'CS',
    checkIn: '-',
    checkOut: '-',
    status: 'ชั่วโมงน้อย',
  },
])

const columns = [
  { name: 'index', label: 'ลำดับ', align: 'center' as const, field: 'index' },
  { name: 'studentId', label: 'รหัสนิสิต', field: 'studentId', align: 'left' as const },
  { name: 'name', label: 'ชื่อ-สกุล', field: 'name', align: 'left' as const },
  { name: 'major', label: 'สาขา', field: 'major', align: 'left' as const },
  { name: 'checkIn', label: 'เช็คชื่อเข้า', field: 'checkIn', align: 'center' as const },
  { name: 'checkOut', label: 'เช็คชื่อออก', field: 'checkOut', align: 'center' as const },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' as const },
  { name: 'actions', label: '', field: 'actions', align: 'center' as const },
]

// ฟังก์ชันลบนิสิต
const removeStudentFromList = (studentId: number) => {
  students.value = students.value.filter((student) => student.id !== studentId)
}

const filteredStudents = computed(() => {
  if (!search1.value) return students.value // ถ้า search1 ว่าง ให้แสดงทุกคน
  return students.value.filter(
    (student) => student.name.toLowerCase().includes(search1.value.toLowerCase()), // ค้นหาจาก "ชื่อ-สกุล"
  )
})
</script>

<template>
  <div class="table-container">
    <div class="row q-mb-md justify-end items-center">
      <!-- ช่องค้นหา -->
      <q-input-sticky
        dense
        outlined
        v-model="search1"
        @update:model-value="updateSearch"
        placeholder="ค้นหาชื่อนิสิต"
        class="q-mr-sm searchbox"
        :style="{ boxShadow: 'none' }"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input-sticky>

      <q-btn class="btnfilter" @click="showFilterDialog1 = true">
        <img src="icons\sort.svg" alt="Sort Icon" width="30" height="30" />
        <FilterDialog
          v-model="showFilterDialog1"
          :categories="filterCategories1"
          @apply="applyFilters"
        />
      </q-btn>
    </div>

    <q-table
      flat
      bordered
      :rows="filteredStudents"
      :columns="columns"
      row-key="id"
      class="q-mt-md customtable my-sticky-header-table"
      :pagination="pagination"
      :rows-per-page-options="[10]"
    >
      <!--- หัวตาราง -->
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" class="sticky-header">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body-cell-index="props">
        <q-td :props="props" class="text-center table-text bold-text">
          {{ props.rowIndex + 1 }}
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <StudentStatus :status="props.row.status" />
        </q-td>
      </template>

      <!-- ปุ่มลบ -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <RemoveStudent :id="props.row.id" @removeStudent="removeStudentFromList" />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<style scoped>
.table-container {
  background-color: #edf0f5;
  padding: 20px;
  border-radius: 12px;
}

/* ปรับขนาดตัวอักษรของตาราง */
:deep(.q-table) {
  font-size: 18px;
}

.my-sticky-header-table {
  /* กำหนดความสูงของตารางเป็น 60% ของหน้า */
  height: 60vh;
  max-height: 60vh;
  overflow: auto;
}

.sticky-header {
  position: sticky;
  top: 0; /* ทำให้ส่วนหัวติดอยู่ด้านบน */
  z-index: 1; /* ให้ส่วนหัวอยู่ด้านบนของเนื้อหาตาราง */
  background-color: #fff; /* เพิ่มสีพื้นหลังเพื่อให้ส่วนหัวดูชัดเจน */
}
</style>
