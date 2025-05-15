<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import { useStudentStore } from 'src/stores/student'
import type { Student } from 'src/types/student'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'

const router = useRouter()
const studentStore = useStudentStore()

const search1 = ref('')
const showFilterDialog1 = ref(false)

const breadcrumbs = ref({
  previousPage: { title: 'จัดการข้อมูลนิสิต', path: '/Admin/StudentManagement' },
  currentPage: { title: 'จัดเก็บข้อมูลนิสิต', path: '/Admin/StudentManagement/StudentStorePage' },
  icon: 'people',
})

const filterCategories1 = ref(['major', 'year', 'status'])
const filters = ref({
  major: [] as string[],
  year: [] as number[],
  status: [] as string[],
})

onMounted(async () => {
  try {
    await studentStore.getStudents()
  } catch (err) {
    console.error('โหลดข้อมูลนิสิตล้มเหลว:', err)
  }
})

const applyFilters = (selectedFilters: typeof filters.value) => {
  filters.value = selectedFilters
}

const getStatusLabel = (student: Student): string => {
  if (student.status === 0) return 'พ้นสภาพ'
  if (student.softSkill >= 30 && student.hardSkill >= 12) return 'ชั่วโมงครบแล้ว'
  if (student.softSkill >= 20 && student.hardSkill >= 8) return 'ชั่วโมงมาก'
  if (student.softSkill >= 10 && student.hardSkill >= 4) return 'ชั่วโมงน้อย'
  return 'ชั่วโมงน้อยมาก'
}

const getStatusClass = (status: string): string => {
  if (status === 'พ้นสภาพ') return 'status-terminated'
  if (status === 'ชั่วโมงมาก') return 'status-high'
  if (status === 'ชั่วโมงน้อย') return 'status-medium'
  if (status === 'ชั่วโมงครบแล้ว') return 'status-complete'
  if (status === 'ชั่วโมงน้อยมาก') return 'status-low'
  return ''
}

const filteredStudents = computed(() => {
  return studentStore.students.filter((student) => student.status === 0)
})

const columns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'left' as const },
  { name: 'code', label: 'รหัสนิสิต', field: 'code', align: 'left' as const },
  { name: 'name', label: 'ชื่อ-สกุล', field: 'name', align: 'left' as const },
  { name: 'major', label: 'สาขา', field: 'major', align: 'left' as const },
  {
    name: 'softskill',
    label: 'ชั่วโมงเตรียมความพร้อม',
    field: 'softSkill',
    align: 'center' as const,
  },
  {
    name: 'hardskill',
    label: 'ชั่วโมงทักษะทางวิชาการ',
    field: 'hardSkill',
    align: 'center' as const,
  },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' as const },
]

const goToConfirmPage = () => {
  void router.push('/Admin/StudentManagement/StudentStorePage/ConfirmStudentDataPage')
}
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

.status-terminated {
  background-color: #e0e0e0;
  color: #5f5f5f;
  border: 2px solid #b0b0b0;
  padding: 3px 30px;
  width: 130px;
}
.Font {
  color: #000000;
  font-size: 15px;
  font-weight: bold;
  font-family: 'Noto Serif Thai', serif;
}
.status-badge {
  height: 32px;
  line-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  text-align: center;
  display: inline-block;
  font-size: 15px;
}
</style>

<style lang="scss" scoped>
.student-container {
  background-color: #edf0f5;
  height: 680px;
  width: 100%;
}

// .student-table-wrapper {
//   display: flex;
//   width: 100%;
//   max-width: 100%;
//   display: flex;
//   flex-direction: column;
// }

// .my-sticky-header-table {
//   min-height: 450px;
//   overflow: auto;
// }

.q-table table {
  table-layout: fixed;
}

.my-sticky-header-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #f5f5f5;
}

.new-sticky-header {
  .my-sticky-header-table {
    /* Fix header */
    thead tr:first-child th {
      background-color: #f5f5f5;
    }

    /* Make tbody scrollable */
    tbody {
      display: block;
      overflow-y: auto;
    }

    /* Ensure header and body columns align */
    thead,
    tbody tr {
      display: table;
      width: 100%;
      table-layout: fixed;
    }

    /* Optional: ปรับ scrollbar ไม่ทับ */
    tbody::-webkit-scrollbar {
      width: 12px;
    }

    tbody::-webkit-scrollbar-thumb {
      background: #a7a7a7;
      border-radius: 10px;
      cursor: pointer;
    }
  }
}

.ellipsis-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<template>
  <q-page class="q-pa-md">
    <!-- ส่วนหัวของหน้า -->
    <div style="margin-top: 20px">
      <AppBreadcrumbs :breadcrumbs="breadcrumbs" />
    </div>

    <!-- ส่วนค้นหา + ฟิลเตอร์ + ปุ่มเพิ่ม -->
    <section class="q-mt-lg">
      <div class="row justify-end items-center">
        <div class="row">
          <q-input
            dense
            outlined
            v-model="search1"
            label="ค้นหา ชื่อนิสิต"
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
              icon="add"
              label="เพิ่มข้อมูล"
              class="btnadd"
              @click="goToConfirmPage"
            />
          </div>
        </div>
      </div>

      <q-table
        bordered
        flat
        :rows="filteredStudents"
        :columns="columns"
        row-key="code"
        class="q-mt-md"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="sticky-header">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="index">{{ props.rowIndex + 1 }}</q-td>
            <q-td key="code">{{ props.row.code }}</q-td>
            <q-td
              key="name"
              style="
                max-width: 200px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            >
              {{ props.row.name }}
            </q-td>
            <q-td key="major">{{ props.row.major }}</q-td>
            <q-td class="text-center" key="softskill">{{ props.row.softSkill }}/30</q-td>
            <q-td class="text-center" key="hardskill">{{ props.row.hardSkill }}/12</q-td>
            <q-td class="text-center">
              <q-badge
                :label="getStatusLabel(props.row)"
                :class="getStatusClass(getStatusLabel(props.row))"
                class="status-badge"
                rounded
                unelevated
              />
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </section>
  </q-page>
</template>
