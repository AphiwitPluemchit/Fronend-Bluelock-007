<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md">
      <div class="text-subtitle1 text-grey-8 flex items-center">
        <q-icon name="people" class="q-mr-sm" />
        <span>จัดการข้อมูลนิสิต &gt; <u>ยืนยันการจัดเก็บข้อมูลนิสิต</u></span>
      </div>
      <div class="text-h4">ยืนยันการจัดเก็บข้อมูลนิสิต</div>
    </div>

    <section class="q-mt-lg">
      <div class="col-12 row items-center q-pa-sm">
        <div class="col-auto text-right q-pr-md">
          <p class="q-my-none">ปีการศึกษาที่ต้องการจัดเก็บ :</p>
        </div>
        <q-select dense outlined v-model="selectedYear" :options="yearOptions" label="ปีการศึกษาที่ต้องการจัดเก็บ"
          style="width: 150px; margin-right: 40px;" />

        <div class="col-auto text-right q-pr-md">
          <p class="q-my-none">สาขาที่ต้องการจัดเก็บ :</p>
        </div>
        <q-input dense outlined v-model="selectedMajors" label="สาขาที่ต้องการจัดเก็บ" readonly
          style="width: 250px; margin-right: 40px;" />

        <q-btn color="primary" label="ยืนยัน" style="margin-left: 20px;" @click="confirmSelection" />
      </div>

      <div class="col-12 row justify-center items-center q-pr-md">
        <div class="text-h6 q-mt-lg">ตารางรายชื่อนิสิต</div>
      </div>


      <q-table bordered flat :rows="filteredStudents" :columns="columns" row-key="code" class="q-mt-md"
        :pagination="{ rowsPerPage: 10 }">
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
            <q-td key="name" style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              {{ props.row.name }}
            </q-td>
            <q-td key="major">{{ props.row.major }}</q-td>
            <q-td class="text-center" key="softskill">{{ props.row.softSkill }}/30</q-td>
            <q-td class="text-center" key="hardskill">{{ props.row.hardSkill }}/12</q-td>
            <q-td class="text-center">
              <q-btn :label="getStatusLabel(props.row)" :class="getStatusClass(getStatusLabel(props.row))" rounded
                unelevated />
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <div class="row justify-end q-mt-md">
        <q-btn color="primary" label="จัดเก็บนิสิต" @click="saveStudents" />
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStudentStore } from 'src/stores/student'

interface Student {
  id?: string
  code: string
  name: string
  email: string
  password: string
  status: number
  softSkill: number
  hardSkill: number
  major: string
}

const studentStore = useStudentStore()

const selectedYear = ref(62)
const yearOptions = [62, 63, 64, 65]
const selectedMajors = ref('CS, AI, SE, ITDI')

onMounted(async () => {
  try {
    await studentStore.getStudents()
  } catch (err) {
    console.error('โหลดข้อมูลนิสิตล้มเหลว:', err)
  }
})

const filteredStudents = computed(() => {
  return studentStore.students || []
})

const columns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'left' as const },
  { name: 'code', label: 'รหัสนิสิต', field: 'code', align: 'left' as const },
  { name: 'name', label: 'ชื่อ-สกุล', field: 'name', align: 'left' as const },
  { name: 'major', label: 'สาขา', field: 'major', align: 'left' as const },
  { name: 'softskill', label: 'ชั่วโมงเตรียมความพร้อม', field: 'softSkill', align: 'center' as const },
  { name: 'hardskill', label: 'ชั่วโมงทักษะทางวิชาการ', field: 'hardSkill', align: 'center' as const },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' as const }
]

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

const confirmSelection = () => {
  console.log('ยืนยันการเลือกปี:', selectedYear.value, 'สาขา:', selectedMajors.value)
}

const saveStudents = () => {
  console.log('จัดเก็บข้อมูลนิสิต...')
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
</style>