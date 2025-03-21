<template>
  <q-page class="q-pa-md">
    <!-- ชื่อหน้า -->
    <div class="row justify-start items-center">
      <div class="text-h4">จัดการข้อมูลนิสิต</div>
    </div>
    <!-- ตาราง 1 -->
    <section class="q-mt-lg">
      <div class="row justify-end items-center">
        <div class="text-h6"></div>
        <div class="row">
          <q-input
            dense
            outlined
            v-model="search1"
            placeholder="ค้นหา"
            class="q-mr-sm searchbox"
            :style="{ boxShadow: 'none' }"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <FilterDialog
            v-model="showFilterDialog1"
            :categories="filterCategories1"
            @apply="applyFilters"
            class="q-mr-sm"
          />
          <div>
            <q-btn
              dense
              outlined
              icon="settings"
              label="จัดการข้อมูล"
              class="btnadd"
              @click="openManageDialog"
            >
              <ManageStudentDialog ref="manageDialogRef"
            /></q-btn>
          </div>
        </div>
      </div>

      <!-- ตาราง -->
      <q-table
        bordered
        flat
        :rows="studentStore.students"
        :columns="columns"
        row-key="id"
        class="q-mt-md customtable"
        :pagination="{ rowsPerPage: 10 }"
      >
        <!-- หัวตาราง Sticky -->
        <template v-slot:header="props">
          <q-tr :props="props" class="sticky-header">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <!-- เนื้อหาตาราง -->
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="index">{{ props.rowIndex + 1 }}</q-td>
            <q-td key="code">{{ props.row.code }}</q-td>
            <q-td key="name">{{ props.row.name }}</q-td>
            <q-td key="major">{{ props.row.major }}</q-td>
            <q-td class="text-center" key="softskill">{{ props.row.softSkill }}/30</q-td>
            <q-td class="text-center" key="hardskill">{{ props.row.hardSkill }}/12</q-td>
            <!-- แสดงสถานะพร้อมสี -->
            <q-td class="text-center">
              <q-btn
                :label="calculateStatus(props.row.softSkill, props.row.hardSkill)"
                :class="getStatusClass(calculateStatus(props.row.softSkill, props.row.hardSkill))"
                rounded
                unelevated
              />
            </q-td>

            <q-td class="q-gutter-x-sm">
              <q-btn
                icon="info"
                padding="none"
                flat
                color="grey-8"
                @click="goToDetail(props.row.code)"
                class="clickable-row"
              ></q-btn
            ></q-td>
          </q-tr>
        </template>
        ></q-table
      >
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import ManageStudentDialog from './ManageStudentDialog.vue'
import { useStudentStore } from 'src/stores/student'

const studentStore = useStudentStore()
const router = useRouter()

onMounted(async () => {
  await studentStore.getStudents()
})

const goToDetail = (code: string) => {
  void router.push(`/Admin/StudentManagement/StudentDetail/${code}`)
}

const filters = ref<{
  major: string[]
  year: string[]
  statusStudent: string[]
}>({
  major: [],
  year: [],
  statusStudent: [],
})
const showFilterDialog1 = ref(false)
const filterCategories1 = ref(['major', 'year', 'statusStudent'])

const applyFilters = (selectedFilters: {
  major: string[]
  year: string[]
  statusStudent: string[]
}) => {
  filters.value = selectedFilters
  console.log('Filters Applied:', filters.value)
}

const manageDialogRef = ref<InstanceType<typeof ManageStudentDialog> | null>(null)

// ฟังก์ชันเปิด ManageStudentDialog
const openManageDialog = async () => {
  await nextTick() // รอให้ DOM อัปเดตก่อน
  if (manageDialogRef.value) {
    manageDialogRef.value.openDialog()
  }
}

const search1 = ref('')

const columns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'left' as const },
  { name: 'code', label: 'รหัสนิสิต', field: 'code', align: 'left' as const },
  {
    name: 'name',
    label: 'ชื่อ-สกุล',
    field: 'name',
    align: 'left' as const,
    style: 'max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
  },
  { name: 'major', label: 'สาขา', field: 'major', align: 'left' as const },
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
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' as const },
  { name: 'action', label: '', field: 'action', align: 'center' as const },
]

const getStatusClass = (status: string) => {
  if (status === 'ชั่วโมงมาก') return 'status-high'
  if (status === 'ชั่วโมงน้อย') return 'status-medium'
  if (status === 'ชั่วโมงครบแล้ว') return 'status-complete'
  if (status === 'ชั่วโมงน้อยมาก') return 'status-low'
  return ''
}

const calculateStatus = (softskill: number, hardskill: number) => {
  if (softskill >= 30 && hardskill >= 12) {
    return 'ชั่วโมงครบแล้ว'
  } else if (softskill >= 20 && hardskill >= 8) {
    return 'ชั่วโมงมาก'
  } else if (softskill >= 10 && hardskill >= 4) {
    return 'ชั่วโมงน้อย'
  } else {
    return 'ชั่วโมงน้อยมาก'
  }
}

//mockup
// const mockStudents = ref([
//   {
//     index: 1,
//     studentID: '65160311',
//     name: 'คิรัชช์ รัตนวงศ์',
//     major: 'CS',
//     softskill: '30',
//     hardskill: '12',
//   },
//   {
//     index: 2,
//     studentID: '65160312',
//     name: 'กรนิศา ทองเยี่ยม',
//     major: 'CS',
//     softskill: '15',
//     hardskill: '30',
//   },
//   {
//     index: 3,
//     studentID: '65160313',
//     name: 'อุดม เมธี',
//     major: 'ITDI',
//     softskill: '11',
//     hardskill: '11',
//   },
//   {
//     index: 4,
//     studentID: '65160314',
//     name: 'ภัทรพล เกียรติคุณ',
//     major: 'ITDI',
//     softskill: '10',
//     hardskill: '2',
//   },
//   {
//     index: 5,
//     studentID: '65160315',
//     name: 'วณิชชา สีสังข์',
//     major: 'AAI',
//     softskill: '12',
//     hardskill: '5',
//   },
//   {
//     index: 6,
//     studentID: '65160316',
//     name: 'คิรัชช์ รัตนวงศ์รัตนวงศ์รัตนวงศ์รัตนวงศ์',
//     major: 'CS',
//     softskill: '3',
//     hardskill: '1',
//   },
//   {
//     index: 7,
//     studentID: '65160317',
//     name: 'กรนิศา ทองเยี่ยม',
//     major: 'CS',
//     softskill: '15',
//     hardskill: '30',
//   },
//   {
//     index: 8,
//     studentID: '65160318',
//     name: 'อุดม เมธี',
//     major: 'ITDI',
//     softskill: '11',
//     hardskill: '11',
//   },
//   {
//     index: 9,
//     studentID: '65160319',
//     name: 'ภัทรพล เกียรติคุณ',
//     major: 'ITDI',
//     softskill: '30',
//     hardskill: '20',
//   },
//   {
//     index: 10,
//     studentID: '65160320',
//     name: 'วณิชชา สีสังข์',
//     major: 'AAI',
//     softskill: '11',
//     hardskill: '30',
//   },
//   {
//     index: 11,
//     studentID: '65160321',
//     name: 'คิรัชช์ รัตนวงศ์',
//     major: 'CS',
//     softskill: '30',
//     hardskill: '12',
//   },
//   {
//     index: 12,
//     studentID: '65160322',
//     name: 'กรนิศา ทองเยี่ยม',
//     major: 'CS',
//     softskill: '15',
//     hardskill: '30',
//   },
//   {
//     index: 13,
//     studentID: '65160323',
//     name: 'อุดม เมธี',
//     major: 'ITDI',
//     softskill: '11',
//     hardskill: '11',
//   },
//   {
//     index: 14,
//     studentID: '65160324',
//     name: 'ภัทรพล เกียรติคุณ',
//     major: 'ITDI',
//     softskill: '15',
//     hardskill: '20',
//   },
//   {
//     index: 15,
//     studentID: '65160325',
//     name: 'วณิชชา สีสังข์',
//     major: 'AAI',
//     softskill: '11',
//     hardskill: '30',
//   },
//   {
//     index: 16,
//     studentID: '65160326',
//     name: 'คิรัชช์ รัตนวงศ์',
//     major: 'CS',
//     softskill: '30',
//     hardskill: '12',
//   },
//   {
//     index: 17,
//     studentID: '65160327',
//     name: 'กรนิศา ทองเยี่ยม',
//     major: 'CS',
//     softskill: '15',
//     hardskill: '30',
//   },
//   {
//     index: 18,
//     studentID: '65160328',
//     name: 'อุดม เมธี',
//     major: 'ITDI',
//     softskill: '11',
//     hardskill: '11',
//   },
//   {
//     index: 19,
//     studentID: '65160329',
//     name: 'ภัทรพล เกียรติคุณ',
//     major: 'ITDI',
//     softskill: '30',
//     hardskill: '20',
//   },
//   {
//     index: 20,
//     studentID: '65160330',
//     name: 'วณิชชา สีสังข์',
//     major: 'AAI',
//     softskill: '11',
//     hardskill: '30',
//   },
//   {
//     index: 21,
//     studentID: '65160331',
//     name: 'อุดม เมธี',
//     major: 'ITDI',
//     softskill: '11',
//     hardskill: '11',
//   },
//   {
//     index: 22,
//     studentID: '65160332',
//     name: 'ภัทรพล เกียรติคุณ',
//     major: 'ITDI',
//     softskill: '15',
//     hardskill: '20',
//   },
//   {
//     index: 23,
//     studentID: '65160333',
//     name: 'วณิชชา สีสังข์',
//     major: 'AAI',
//     softskill: '11',
//     hardskill: '30',
//   },
//   {
//     index: 24,
//     studentID: '65160334',
//     name: 'คิรัชช์ รัตนวงศ์',
//     major: 'CS',
//     softskill: '30',
//     hardskill: '12',
//   },
//   {
//     index: 25,
//     studentID: '65160335',
//     name: 'กรนิศา ทองเยี่ยม',
//     major: 'CS',
//     softskill: '15',
//     hardskill: '30',
//   },
//   {
//     index: 26,
//     studentID: '65160336',
//     name: 'อุดม เมธี',
//     major: 'ITDI',
//     softskill: '11',
//     hardskill: '11',
//   },
//   {
//     index: 27,
//     studentID: '65160337',
//     name: 'ภัทรพล เกียรติคุณ',
//     major: 'ITDI',
//     softskill: '30',
//     hardskill: '20',
//   },
//   {
//     index: 28,
//     studentID: '65160338',
//     name: 'วณิชชา สีสังข์',
//     major: 'AAI',
//     softskill: '11',
//     hardskill: '30',
//   },
// ])
</script>

<style scoped>
.status-complete {
  background-color: #cfd7ff;
  color: #001780;
  border: 2px solid #002dff;
  padding: 3px 30px;
  width: 130px;
}
.status-high {
  background-color: #d0ffc5;
  color: #009812;
  border: 2px solid #00bb16;
  padding: 3px 30px;
  width: 130px;
}

.status-medium {
  background-color: #ffe7ba;
  color: #ff6f00;
  border: 2px solid #ffa500;
  padding: 3px 30px;
  width: 130px;
}
.status-low {
  background-color: #ffc5c5;
  color: #ff0000;
  border: 2px solid #f32323;
  padding: 3px 30px;
  width: 130px;
}
.status-out {
  background-color: #dadada;
  color: #000000;
  border: 2px solid #575656;
  padding: 3px 30px;
  width: 130px;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f5f5f5;
}
.info-icon {
  cursor: pointer;
  width: 60px;
}
</style>
