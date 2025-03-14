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
    <div class="q-mb-sm student-container">
    <div class="student-table-wrapper">
        <div class="row justify-end items-center">
            <!-- ช่องค้นหา -->
            <q-input dense outlined v-model="search1" @update:model-value="updateSearch" placeholder="ค้นหาชื่อนิสิต"
                class="q-mr-sm searchbox" :style="{ boxShadow: 'none' }">
                <template v-slot:append>
                    <q-icon name="search" />
                </template>
            </q-input>

            <q-btn class="btnfilter" @click="showFilterDialog1 = true">
                <img src="icons\sort.svg" alt="Sort Icon" width="30" height="30" />
                <FilterDialog v-model="showFilterDialog1" :categories="filterCategories1" @apply="applyFilters" />
            </q-btn>
        </div>

        <q-table flat bordered :rows="filteredStudents" :columns="columns" row-key="id" class="q-mt-md customtable"
            :pagination="pagination" :rows-per-page-options="[10, 20, 30, 40, 50]">
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
</div>
</template>

<style scoped>

.student-container {
  display: flex;
  align-items: flex-start;
  gap: 180px;
  background-color: #EDF0F5;
  padding: 45px;
  border-radius: 12px;
  height: 680px;
  overflow: hidden;
}

.student-table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
}

.student-table-wrapper::-webkit-scrollbar {
  width: 8px;
  display: none;
}
</style>
