<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useStudentStore } from 'src/stores/student'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import AlertDialog from 'src/components/Dialog/AlertDialog.vue'
import type { Student } from 'src/types/student'
import { useQuasar } from 'quasar'

const breadcrumbs = ref({
  previousPage: { title: 'จัดเก็บข้อมูลนิสิต', path: '/Admin/StudentStorage' },
  currentPage: {
    title: 'ยืนยันการจัดเก็บข้อมูลนิสิต',
    path: '/Admin/StudentStorage/ConfirmStudentDataPage',
  },
  icon: 'people',
})
const show = ref(false)
const studentStore = useStudentStore()
const $q = useQuasar()

// ตัวแปรสำหรับ AlertDialog
const alertDialogModel = ref(false)
const alertDialogTitle = ref('')
const alertDialogMessage = ref('')

function showAlertDialog(title: string, message: string) {
  alertDialogTitle.value = title
  alertDialogMessage.value = message
  alertDialogModel.value = true
}

interface SelectedFilters {
  studentCode: string
  major: string
}
const selectedStudentCode = ref<string>('')
const selectedMajors = ref<string>('')
const yearOptions = ['60', '61', '62', '63', '64', '65', '66']
const majorOptions = ['CS', 'AAI', 'SE', 'ITDI']

const selectedStudents = ref<string[]>([])
const students = computed(() => studentStore.students ?? [])

// เพิ่ม state สำหรับ checkall
const selectAll = ref(false)

// Computed property สำหรับตรวจสอบว่า checkbox ควรแสดงสถานะอะไร
const isStudentSelected = (studentCode: string) => {
  return selectedStudents.value.includes(studentCode)
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    // เลือกทั้งหมดในหน้าปัจจุบัน (เพิ่มเข้าไปในรายการที่เลือกอยู่แล้ว)
    const currentPageCodes = students.value.map((student) => student.code)
    selectedStudents.value = [...new Set([...selectedStudents.value, ...currentPageCodes])]
  } else {
    // ยกเลิกเลือกเฉพาะในหน้าปัจจุบัน (ไม่กระทบกับหน้าที่เลือกไว้แล้ว)
    const currentPageCodes = students.value.map((student) => student.code)
    selectedStudents.value = selectedStudents.value.filter(
      (code) => !currentPageCodes.includes(code),
    )
  }
}

// Watch selectedStudents เพื่อ sync selectAll state เฉพาะหน้าปัจจุบัน
watch(
  selectedStudents,
  (newSelected) => {
    const currentPageCodes = students.value.map((student) => student.code)
    const allCurrentPageSelected = currentPageCodes.every((code) => newSelected.includes(code))
    selectAll.value = allCurrentPageSelected
  },
  { deep: true },
)

// เมื่อเปลี่ยนหน้า อย่า clear selectedStudents เพราะต้องการจำสิ่งที่เลือกไว้
watch(students, () => {
  selectAll.value = false
})

const data = async () => {
  console.log(studentStore.query)

  await studentStore.getStudents()
  // อัปเดต pagination ให้ sync
  pagination.value.page = studentStore.query.page || 1
  pagination.value.rowsPerPage = studentStore.query.limit || 5
  pagination.value.sortBy = studentStore.query.sortBy || ''
  pagination.value.rowsNumber = studentStore.totalStudentsCount
}
async function onRequest(requestProp: {
  pagination: { sortBy: string; descending: boolean; page: number; rowsPerPage: number }
}) {
  query.value.page = requestProp.pagination.page
  query.value.limit = requestProp.pagination.rowsPerPage
  query.value.sortBy = requestProp.pagination.sortBy
  query.value.order = requestProp.pagination.descending ? 'desc' : 'asc'
  await data()
}
const applyFilters = async (selectedFilters: SelectedFilters) => {
  studentStore.query.studentCode = selectedFilters.studentCode ? [selectedFilters.studentCode] : []
  studentStore.query.major = selectedFilters.major ? [selectedFilters.major] : []
  await data()
}
const query = computed(() => studentStore.query)

const pagination = ref({
  sortBy: query.value.sortBy || '',
  descending: query.value.order === 'desc',
  page: query.value.page || 1,
  rowsPerPage: query.value.limit || 5,
  rowsNumber: 0,
})
const saveStudents = async () => {
  try {
    // แปลง student codes เป็น student IDs
    const studentIds = selectedStudents.value
      .map((code) => {
        const student = studentStore.students.find((s) => s.code === code)
        return student?.id
      })
      .filter(Boolean) as string[]

    if (studentIds.length === 0) {
      console.warn('No valid student IDs found')
      return
    }

    // ใช้ API ใหม่ที่ส่งเฉพาะ ID (ประสิทธิภาพดีกว่า)
    await studentStore.updateStudentStatusByIDs(studentIds, 0)

    // เคลียร์การเลือกหลังจากสำเร็จ
    selectedStudents.value = []
    selectAll.value = false
    showAlertDialog('สำเร็จ', '✅ จัดเก็บนิสิตสำเร็จ!')
  } catch (error) {
    console.error('จัดเก็บนิสิตล้มเหลว:', error)
    showAlertDialog('ข้อผิดพลาด', '❌ เกิดข้อผิดพลาดในการจัดเก็บนิสิต')
  }
}

// --- confirm dialog before save ---
const confirmSave = () => {
  $q.dialog({
    title: 'ยืนยันการทำรายการ',
    message: 'ต้องการจัดเก็บนิสิตหรือไม่?',
    cancel: {
      label: 'ยกเลิก',
      color: 'red',
    },
    ok: {
      label: 'ยืนยัน',
      color: 'primary',
    },
    persistent: true,
    class: 'my-dialog', // << ใส่คลาสที่นี่
    seamless: false, // ถ้าอยากให้มี backdrop ปกติ
  }).onOk(() => {
    void saveStudents()
  })
}

const columns = [
  { name: 'check', label: '', field: 'check', align: 'left' as const },
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

const selectedStudentsData = computed(() => selectedStudentsDataRaw.value)

// เก็บ object ของนิสิตที่ถูกเลือกแบบถาวร (ข้ามหน้าได้)
const selectedStudentsDataRaw = ref<Student[]>([])

watch(selectedStudents, (codes) => {
  // ทุกครั้งที่รหัสเปลี่ยน ให้เพิ่ม object ใหม่เข้า raw ถ้ายังไม่มี
  const newStudents = studentStore.students.filter(
    (s) => codes.includes(s.code) && !selectedStudentsDataRaw.value.some((d) => d.code === s.code),
  )
  selectedStudentsDataRaw.value.push(...newStudents)

  // ลบรายการที่ไม่อยู่ใน selectedStudents
  selectedStudentsDataRaw.value = selectedStudentsDataRaw.value.filter((s) =>
    codes.includes(s.code),
  )
})

onMounted(async () => {
  show.value = false
  studentStore.query = {
    page: 1,
    limit: 10,
    sortBy: 'code',
    order: 'asc',
    search: '',
    major: [],
    studentStatus: ['1', '2', '3', '4'],
    studentCode: [], // กรองเฉพาะนิสิตที่พ้นสภาพ
    skill: [],
    studentYear: [],
  }
  await data()
  show.value = true
})
</script>

<template>
  <q-page class="q-pa-md">
    <div style="margin-top: 20px">
      <AppBreadcrumbs :breadcrumbs="breadcrumbs" />
    </div>

    <section class="q-mt-lg" v-if="show">
      <div class="col-12 row items-center q-pa-sm">
        <div class="col-auto text-right q-pr-md">
          <p class="q-my-none">ปีการศึกษาที่ต้องการจัดเก็บ :</p>
        </div>
        <q-select
          dense
          outlined
          v-model="selectedStudentCode"
          :options="yearOptions"
          label="รหัสปีนิสิต"
          emit-value
          map-options
          class="q-mr-sm dropdown"
          :style="{ border: 'none' }"
          @update:model-value="
            applyFilters({ studentCode: selectedStudentCode, major: selectedMajors })
          "
        />

        <q-select
          dense
          outlined
          v-model="selectedMajors"
          :options="majorOptions"
          label="สาขาที่ต้องการจัดเก็บ"
          emit-value
          map-options
          class="q-mr-sm dropdown"
          :style="{ border: 'none' }"
          @update:model-value="
            applyFilters({ studentCode: selectedStudentCode, major: selectedMajors })
          "
        />
        <q-input
          dense
          outlined
          v-model="query.search"
          label="ค้นหา ชื่อหรือรหัสนิสิต"
          class="q-mr-sm searchbox"
          :style="{ border: 'none' }"
          @keyup.enter="applyFilters"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div class="col-12 row justify-center items-center q-pr-md">
        <div class="text-h6 q-mt-lg">ตารางรายชื่อนิสิตทั้งหมด</div>
      </div>

      <q-table
        bordered
        flat
        :rows="students"
        :columns="columns"
        v-model:pagination="pagination"
        :rows-per-page-options="[5, 7, 10, 15, 20, 50, 100]"
        @request="onRequest"
        row-key="code"
        class="q-mt-md"
      >
        <!-- <q-table bordered flat :rows="students" :columns="columns" @request="applyFilters" row-key="id" class="q-mt-md"> -->
        <!-- หัวตาราง Sticky -->
        <template v-slot:header="props">
          <q-tr :props="props" class="sticky-header">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              <!-- Checkall checkbox สำหรับคอลัมน์แรก -->
              <div v-if="col.name === 'check'">
                <q-checkbox
                  v-model="selectAll"
                  :color="selectAll ? 'primary' : 'white'"
                  keep-color
                  @update:model-value="toggleSelectAll"
                >
                  <q-tooltip>เลือกทั้งหมดในหน้านี้</q-tooltip>
                </q-checkbox>
              </div>
              <!-- คอลัมน์อื่นๆ แสดง label ปกติ -->
              <div v-else>
                {{ col.label }}
              </div>
            </q-th>
          </q-tr>
        </template>
        <!-- เนื้อหาตาราง -->
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td style="width: 50px; text-align: center">
              <q-checkbox
                v-model="selectedStudents"
                :val="props.row.code"
                :color="isStudentSelected(props.row.code) ? 'primary' : 'gray'"
                keep-color
                dense
                keep-focus
              />
            </q-td>
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
              >{{ props.row.name }}</q-td
            >
            <q-td key="major">{{ props.row.major }}</q-td>
            <q-td class="text-center" key="softskill">{{ props.row.softSkill }}/30</q-td>
            <q-td class="text-center" key="hardskill">{{ props.row.hardSkill }}/12</q-td>
            <!-- แสดงสถานะพร้อมสี -->
            <q-td class="text-center">
              <q-badge
                :label="studentStore.getStatusText(props.row.status)"
                :class="studentStore.getStatusClass(props.row.status)"
                class="status-badge"
                unelevated
              />
            </q-td>
          </q-tr>
        </template>
        <template v-slot:no-data>
          <div class="full-width text-center q-pa-md text-grey" style="font-size: 20px">
            ไม่มีรายชื่อนิสิต
          </div>
        </template>
      </q-table>

      <!-- ตารางแสดงรายชื่อนิสิตที่จัดเก็บ -->
      <div class="text-h6 text-center q-mt-xl q-mb-md">ตารางรายชื่อนิสิตที่จัดเก็บ</div>

      <!-- ตารางที่ 2 -->
      <q-table
        bordered
        flat
        class="q-mt-none full-width"
        :rows="selectedStudentsData"
        :columns="columns"
        row-key="code"
        :pagination="{ rowsPerPage: 5 }"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <!-- คอลัมน์ว่างแทน checkbox -->
            <q-td style="width: 50px"></q-td>

            <!-- คอลัมน์จริง -->
            <q-td key="index">{{ props.rowIndex + 1 }}</q-td>
            <q-td key="code">{{ props.row.code }}</q-td>
            <q-td key="name">{{ props.row.name }}</q-td>
            <q-td key="major">{{ props.row.major }}</q-td>
            <q-td key="softSkill" class="text-center">{{ props.row.softSkill }}/30</q-td>
            <q-td key="hardSkill" class="text-center">{{ props.row.hardSkill }}/12</q-td>
            <q-td key="status" class="text-center">
              <q-badge
                v-if="props.row.status"
                :label="studentStore.getStatusText(props.row.status)"
                :class="studentStore.getStatusClass(props.row.status)"
                class="status-badge"
                unelevated
              />
            </q-td>
          </q-tr>
        </template>
        <template v-slot:no-data>
          <div class="full-width text-center q-pa-md text-grey" style="font-size: 20px">
            ไม่มีรายชื่อนิสิต
          </div>
        </template>
      </q-table>

      <div class="row justify-end q-mt-md">
        <q-btn
          dense
          outlined
          label="บันทึก"
          class="btnconfirm"
          @click="confirmSave"
          :disable="selectedStudents.length === 0"
        />
      </div>
    </section>

    <!-- AlertDialog -->
    <AlertDialog
      :model-value="alertDialogModel"
      :title="alertDialogTitle"
      :message="alertDialogMessage"
      @update:modelValue="(val) => (alertDialogModel = val)"
    />
  </q-page>
</template>

<style scoped>
.status-badge {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  text-align: center;
  align-items: center; /* ✅ จัดแนวตั้งให้ตรงกลาง */
  justify-content: center; /* ✅ จัดแนวนอนให้ตรงกลาง */
  font-size: 15px;
}

.dropdown {
  min-width: 200px;
}
</style>

<style lang="scss" scoped>
.student-container {
  background-color: #edf0f5;
  height: 680px;
  width: 100%;
}

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
    thead tr:first-child th {
      background-color: #f5f5f5;
    }

    tbody {
      display: block;
      overflow-y: auto;
    }

    thead,
    tbody tr {
      display: table;
      width: 100%;
      table-layout: fixed;
    }

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
