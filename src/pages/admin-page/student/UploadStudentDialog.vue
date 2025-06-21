<script setup lang="ts">
import { useStudentStore } from 'src/stores/student'
import type { ExcelStudentRow } from 'src/types/student'
import { ref } from 'vue'
import * as XLSX from 'xlsx'
const isOpen = ref(false)
const file = ref<File | null>(null)
const studentStore = useStudentStore()
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
const closeDialog = () => {
  isOpen.value = false
  file.value = null
}

const openDialogUpload = () => {
  isOpen.value = true
}

// ✅ อัปโหลดและส่งข้อมูลไปยัง backend

const uploadFile = async () => {
  if (!file.value) {
    alert('กรุณาเลือกไฟล์ก่อนอัปโหลด!')
    return
  }

  try {
    const data = await file.value.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const sheetName = workbook.SheetNames?.[0]
    if (!sheetName) throw new Error('ไม่พบชีทในไฟล์ Excel')

    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json<ExcelStudentRow>(worksheet!)

    const formatted = jsonData.map((row) => ({
      name: row.name || '',
      engName: row.engName || '',
      code: row.code?.toString() || '',
      major: row.major || '',
      password: row.password?.toString() || '123456',
      softSkill: Number(row.softSkill) || 0,
      hardSkill: Number(row.hardSkill) || 0,
    }))

    // ✅ เช็กรหัสนิสิตซ้ำ (จาก Excel)
    const seen = new Set<string>()
    const duplicates: string[] = []

    formatted.forEach((s) => {
      if (seen.has(s.code)) {
        duplicates.push(s.code)
      } else {
        seen.add(s.code)
      }
    })

    if (duplicates.length > 0) {
      alert(`⚠️ พบรหัสนิสิตซ้ำในไฟล์: ${[...new Set(duplicates)].join(', ')}`)
      return
    }

    await studentStore.createStudent(formatted)
    alert('✅ อัปโหลดสำเร็จ!')
    closeDialog()
  } catch (error) {
    console.error('❌ Error uploading:', error)
    alert('เกิดข้อผิดพลาดในการอัปโหลด')
  }
}

defineExpose({ openDialogUpload, closeDialog })
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="q-pa-md q-dialog-plugin">
      <q-card-section class="text-center text-h6">อัปโหลดข้อมูลนิสิต</q-card-section>

      <q-card-section class="row justify-center">
        <q-icon name="cloud_upload" size="80px" color="black" style="width: 130px; height: 130px" />
      </q-card-section>

      <q-card-section class="q-gutter-md row justify-center">
        <q-file
          v-model="file"
          label="No Selected File"
          filled
          clearable
          accept=".xls,.xlsx"
          style="width: 350px"
        >
          <template v-slot:append>
            <q-btn dense flat icon="delete" @click="file = null" />
          </template>
        </q-file>
      </q-card-section>

      <q-card-actions class="q-mt-md" style="position: absolute; bottom: 20px; right: 20px">
        <q-btn
          icon="download"
          color="secondary"
          label="ดาวน์โหลดตัวอย่างไฟล์"
          outline
          @click="downloadTemplate"
        />
        <q-btn label="ยกเลิก" class="btnreject q-mr-sm" flat @click="closeDialog" />
        <q-btn label="ยืนยัน" class="btnconfirm" unelevated @click="uploadFile" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-card {
  width: 870px;
  height: 400px;
  border-radius: 10px;
}
</style>
