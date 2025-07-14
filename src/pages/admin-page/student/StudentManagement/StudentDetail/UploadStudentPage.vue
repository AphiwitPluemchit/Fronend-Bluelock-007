<script setup lang="ts">
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import type { ExcelStudentRow } from 'src/types/student'
import { useStudentStore } from 'src/stores/student'

const file = ref<File | null>(null)
const students = ref<ExcelStudentRow[]>([])
const studentStore = useStudentStore()

const breadcrumbs = ref({
  previousPage: { title: 'จัดการข้อมูลนิสิต', path: '/Admin/StudentManagement' },
  currentPage: {
    title: 'อัปโหลดข้อมูลนิสิต',
    path: '/Admin/StudentManagement/UploadStudent',
  },
  icon: 'cloud_upload',
})

const columns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'left' as const },
  { name: 'code', label: 'รหัสนิสิต', field: 'code', align: 'left' as const },
  { name: 'name', label: 'ชื่อ-สกุล', field: 'name', align: 'left' as const },
  { name: 'major', label: 'สาขา', field: 'major', align: 'left' as const },
  {
    name: 'softSkill',
    label: 'ชั่วโมงเตรียมความพร้อม',
    field: 'softSkill',
    align: 'center' as const,
  },
  {
    name: 'hardSkill',
    label: 'ชั่วโมงทักษะทางวิชาการ',
    field: 'hardSkill',
    align: 'center' as const,
  },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' as const },
]

const getStatusText = (status?: number) => {
  switch (status) {
    case 0:
      return 'พ้นสภาพ'
    case 1:
      return 'ชั่วโมงน้อยมาก'
    case 2:
      return 'ชั่วโมงน้อย'
    case 3:
      return 'ชั่วโมงครบ'
    default:
      return 'ไม่ทราบสถานะ'
  }
}

const getStatusClass = (status?: number) => {
  if (status === 3) return 'status-complete'
  if (status === 2) return 'status-medium'
  if (status === 1) return 'status-low'
  if (status === 0) return 'status-out'
  return ''
}

const downloadTemplate = () => {
  const sampleData = [
    {
      name: 'สมชาย',
      engName: 'Somchai S.',
      code: '123456',
      major: 'SE',
      password: '123456',
      softSkill: 0,
      hardSkill: 0,
    },
    {
      name: 'สมหญิง',
      engName: 'Somying K.',
      code: '123457',
      major: 'CS',
      password: '123456',
      softSkill: 0,
      hardSkill: 0,
    },
  ]
  const worksheet = XLSX.utils.json_to_sheet(sampleData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')
  XLSX.writeFile(workbook, 'students_template.xlsx')
}

const handleFileChange = async () => {
  if (!file.value) return

  try {
    const data = await file.value.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) throw new Error('ไม่พบชีทในไฟล์ Excel')

    const worksheet = workbook.Sheets[sheetName]
    if (!worksheet) throw new Error('ไม่พบข้อมูลในชีท')

    const jsonData = XLSX.utils.sheet_to_json<ExcelStudentRow>(worksheet)

    const formatted = jsonData.map((row) => ({
      name: row.name || '',
      engName: row.engName || '',
      code: row.code?.toString() || '',
      major: row.major || '',
      password: row.password?.toString() || '123456',
      softSkill: Number(row.softSkill) || 0,
      hardSkill: Number(row.hardSkill) || 0,
      status: 1,
    }))

    students.value = formatted
  } catch (error) {
    console.error('Error parsing file:', error)
    alert('เกิดข้อผิดพลาดในการอ่านไฟล์ Excel')
  }
}

const uploadFile = async () => {
  if (!students.value.length) {
    alert('กรุณาเลือกไฟล์และโหลดข้อมูลก่อนกดยืนยัน')
    return
  }

  const seen = new Set<string>()
  const duplicates: string[] = []

  students.value.forEach((s) => {
    const code = String(s.code)
    if (seen.has(code)) {
      duplicates.push(code)
    } else {
      seen.add(code)
    }
  })

  if (duplicates.length > 0) {
    alert(`พบรหัสนิสิตซ้ำในไฟล์: ${[...new Set(duplicates)].join(', ')}`)
    return
  }

  try {
    await studentStore.createStudent(students.value)
    alert('✅ อัปโหลดสำเร็จ!')
    file.value = null
    students.value = []
  } catch (err) {
    console.error(err)
    alert('❌ เกิดข้อผิดพลาดในการอัปโหลด')
  }
}

const clearFile = () => {
  file.value = null
  students.value = []
}
</script>

<template>
  <q-page class="q-pa-md">
    <div style="margin-top: 20px">
      <AppBreadcrumbs :breadcrumbs="breadcrumbs" />
    </div>

    <section class="q-mt-lg">
      <div class="col-12 row items-center q-pa-sm">
        <div class="col-auto text-right q-pr-md">
          <p class="q-my-none">อัพโหลดไฟล์ข้อมูลนิสิต :</p>
        </div>

        <q-file
          v-model="file"
          label="เลือกไฟล์ .xlsx"
          dense
          filled
          accept=".xls,.xlsx"
          emit-value
          map-options
          class="q-mr-sm"
          @update:model-value="handleFileChange"
        >
          <template v-slot:append>
            <q-btn dense flat icon="delete" @click="clearFile" />
          </template>
        </q-file>

        <q-btn
          icon="download"
          color="secondary"
          label="ดาวน์โหลดตัวอย่างไฟล์"
          dense
          outline
          @click="downloadTemplate"
        />
      </div>

      <div class="col-12 row justify-center items-center q-pr-md">
        <div class="text-h6 q-mt-lg">ตารางรายชื่อนิสิต</div>
      </div>

      <q-table
        bordered
        flat
        :rows="students"
        :columns="columns"
        row-key="code"
        class="q-mt-md"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="sticky-header">
            <q-th style="width: 50px; text-align: center" />
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td style="width: 50px; text-align: center" />
            <q-td key="index">{{ props.rowIndex + 1 }}</q-td>
            <q-td key="code">{{ props.row.code }}</q-td>
            <q-td key="name">{{ props.row.name }}</q-td>
            <q-td key="major">{{ props.row.major }}</q-td>
            <q-td class="text-center" key="softSkill">{{ props.row.softSkill }}/30</q-td>
            <q-td class="text-center" key="hardSkill">{{ props.row.hardSkill }}/12</q-td>
            <q-td class="text-center">
              <q-badge
                :label="getStatusText(props.row.status)"
                :class="getStatusClass(props.row.status)"
                class="status-badge"
                unelevated
              />
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <div class="row justify-end q-mt-md">
        <q-btn
          dense
          outlined
          icon="save"
          color="primary"
          label="ยืนยันอัปโหลด"
          class="btnadd"
          @click="uploadFile"
        />
      </div>
    </section>
  </q-page>
</template>

<style scoped>
.status-complete {
  background-color: #cfd7ff;
  color: #001780;
  border: 2px solid #002dff;
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
  background-color: #e0e0e0;
  color: #5f5f5f;
  border: 2px solid #b0b0b0;
  padding: 3px 30px;
  width: 130px;
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
