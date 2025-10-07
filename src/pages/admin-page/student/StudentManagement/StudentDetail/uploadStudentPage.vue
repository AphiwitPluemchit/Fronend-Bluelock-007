<script setup lang="ts">
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import AlertDialog from 'src/components/Dialog/AlertDialog.vue'
import type { ExcelStudentRow } from 'src/types/student'
import { useStudentStore } from 'src/stores/student'

const file = ref<File | null>(null)
const students = ref<ExcelStudentRow[]>([])
const studentStore = useStudentStore()
const MAX_ROWS = 250

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
]

// ใช้ store แทนการสร้างฟังก์ชันใหม่

// ตัวแปรสำหรับ AlertDialog
const alertDialogModel = ref(false)
const alertDialogTitle = ref('')
const alertDialogMessage = ref('')

function showAlertDialog(title: string, message: string) {
  alertDialogTitle.value = title
  alertDialogMessage.value = message
  alertDialogModel.value = true
}

const downloadTemplate = () => {
  const sampleData = [
    {
      name: 'สมชาย',
      engName: 'Somchai S.',
      code: '123456',
      major: 'SE',
      softSkill: 0,
      hardSkill: 0,
    },
    {
      name: 'สมหญิง',
      engName: 'Somying K.',
      code: '123457',
      major: 'CS',
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
      softSkill: Number(row.softSkill) || 0,
      hardSkill: Number(row.hardSkill) || 0,
      status: 1,
    }))

    students.value = formatted
  } catch (error) {
    console.error('Error parsing file:', error)
    showAlertDialog('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการอ่านไฟล์ Excel')
  }
}

const uploadFile = async () => {
  if (!students.value.length) {
    showAlertDialog('แจ้งเตือน', 'กรุณาเลือกไฟล์และโหลดข้อมูลก่อนกดยืนยัน')
    return
  }

  // 🔒 กันเกิน MAX_ROWS อีกรอบ (เผื่อกรณีข้อมูลถูกแก้ไขด้วยวิธีอื่น)
  if (students.value.length > MAX_ROWS) {
    showAlertDialog(
      'แจ้งเตือน',
      `จำกัดการอัปโหลดไม่เกิน ${MAX_ROWS} แถวต่อครั้ง (ขณะนี้มี ${students.value.length} แถว)`,
    )
    return
  }

  // ตรวจซ้ำในไฟล์
  const seen = new Set<string>()
  const duplicates: string[] = []
  students.value.forEach((s) => {
    const code = String(s.code)
    if (seen.has(code)) duplicates.push(code)
    else seen.add(code)
  })
  if (duplicates.length > 0) {
    showAlertDialog('แจ้งเตือน', `พบรหัสนิสิตซ้ำในไฟล์: ${[...new Set(duplicates)].join(', ')}`)
    return
  }

  try {
    await studentStore.createStudent(students.value)
    showAlertDialog('สำเร็จ', '✅ อัปโหลดสำเร็จ!')
    file.value = null
    students.value = []
  } catch (err) {
    console.error(err)
    showAlertDialog('ข้อผิดพลาด', '❌ เกิดข้อผิดพลาดในการอัปโหลด')
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
          style="height: 40px; width: 200px"
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
          icon="save"
          color="primary"
          label="ยืนยันอัปโหลด"
          class="btnadd"
          @click="uploadFile"
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
  line-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  text-align: center;
  display: inline-block;
  font-size: 15px;
}
</style>
