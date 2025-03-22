<template>
  <div class="row justify-center items-center">
    <div class="text-h4">อัปโหลดใบ Certificate</div>
  </div>

  <!-- แสดงภาพที่อัปโหลด -->
  <q-card-section class="flex flex-center" style="height: 620px; width: 100%">
    <iframe
      v-if="previewUrl && isPDF"
      :src="
        previewUrl +
        '#toolbar=0&navpanes=0&scrollbar=0&&view=FitH&&view=FitV&zoom=page-fit&pagemode=none'
      "
      width="50%"
      height="100%"
      frameborder="0"
      style="border: none"
    />

    <q-icon v-else name="image" size="100px" color="grey-5" />
  </q-card-section>

  <!-- เลือกไฟล์ -->
  <q-card-section class="q-ma-md">
    <div class="row">
      <q-file
        v-model="selectedFile"
        label="เลือกไฟล์ PDF"
        accept=".pdf"
        filled
        @update:model-value="onFileSelected"
      />
    </div>
    <div class="row justify-end">
      <q-btn
        label="ยืนยัน"
        color="primary"
        class="btnconfirm"
        :disable="!selectedFile"
        @click="uploadFile"
      />
    </div>
  </q-card-section>

  <!-- แสดงผลลัพธ์ OCR -->
  <q-card-section v-if="ocrResult">
    <q-markup-table>
      <tbody>
        <tr>
          <td><b>ชื่อนิสิต</b></td>
          <td>{{ ocrResult.student_name }}</td>
        </tr>
        <tr>
          <td><b>วิชา</b></td>
          <td>{{ ocrResult.course_name }}</td>
        </tr>
        <tr>
          <td><b>วันที่</b></td>
          <td>{{ ocrResult.date }}</td>
        </tr>
        <tr v-if="ocrResult.url">
          <td><b>ลิงก์ Certificate</b></td>
          <td>
            <a :href="ocrResult.url" target="_blank">{{ ocrResult.url }}</a>
          </td>
        </tr>
      </tbody>
    </q-markup-table>

    <!-- สถานะการตรวจสอบ -->
    <div class="q-mt-sm">
      <q-banner
        v-if="ocrResult.verified"
        class="bg-green-2 text-green-9"
        rounded
        icon="check_circle"
      >
        ✔️ ข้อมูลในใบประกาศ <b>ตรงกับข้อมูลใน URL</b>
      </q-banner>

      <q-banner
        v-else-if="ocrResult.url && !ocrResult.verified"
        class="bg-orange-2 text-orange-10"
        rounded
        icon="warning"
      >
        ⚠️ ข้อมูลในใบที่อัปโหลด <b>ไม่ตรงกับใน URL</b>
        <div v-if="ocrResult.verify_note" class="q-mt-xs text-caption">
          หมายเหตุ: {{ ocrResult.verify_note }}
        </div>
      </q-banner>

      <q-banner v-else class="bg-red-2 text-red-10" rounded icon="error">
        ❌ ไม่สามารถตรวจสอบกับ URL ได้ (อาจไม่มี URL หรือลิงก์ไม่เปิด)
      </q-banner>
    </div>
  </q-card-section>
  <q-inner-loading
    :showing="visible"
    label="Please wait..."
    label-class="text-teal"
    label-style="font-size: 1.1em"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from 'boot/axios'

const baseurl = api.defaults.baseURL
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const ocrResult = ref<OcrResult | null>(null)
const isPDF = ref(false)
const visible = ref(false)
interface OcrResult {
  student_name: string
  course_name: string
  date: string
  url?: string
  verified?: boolean
  verify_note?: string
}

// 🖼 เมื่อเลือกไฟล์
function onFileSelected(file: File | null) {
  if (!file) return

  if (file.type !== 'application/pdf') {
    selectedFile.value = null
    previewUrl.value = null
    return
  }

  isPDF.value = true
  previewUrl.value = URL.createObjectURL(file)
}

// 📤 อัปโหลดไฟล์ไป backend
async function uploadFile() {
  visible.value = true
  if (!selectedFile.value) return

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    const res = await api.post(baseurl + '/ocr/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // ✅ แก้ parse จาก res.data.data (ไม่ใช่ res.data)
    const parsed = JSON.parse(res.data.data)
    ocrResult.value = parsed.data

    visible.value = false
  } catch (err) {
    visible.value = false
    console.error('❌ Upload failed:', err)
  }
}
</script>
