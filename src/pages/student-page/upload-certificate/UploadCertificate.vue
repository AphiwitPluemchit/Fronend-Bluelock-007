<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">อัปโหลดใบ Certificate</div>
        <q-uploader
          label="อัปโหลดไฟล์ PDF หรือ PNG"
          url="http://localhost:8888/ocr/upload"
          accept=".pdf,image/*"
          :auto-upload="true"
          field-name="file"
          @uploaded="onUploaded"
        />
      </q-card-section>

      <q-separator />

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

        <q-btn
          label="อนุมัติ"
          color="primary"
          :loading="loading"
          :disable="loading || !ocrResult"
          @click="approve"
          class="q-mt-md"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from 'boot/axios'

// 🟢 Type ของผล OCR
interface OcrResult {
  student_name: string
  course_name: string
  date: string
  url?: string
  verified?: boolean
  verify_note?: string
}

// 🟢 State
const ocrResult = ref<OcrResult | null>(null)
const loading = ref(false)

// 🟢 Event: เมื่ออัปโหลดเสร็จ
function onUploaded({ xhr }: { xhr: XMLHttpRequest }) {
  const res = JSON.parse(xhr.response)
  console.log('📦 RAW:', res)
  const parsed: OcrResult = res.data
  console.log('✅ Parsed:', parsed)
  ocrResult.value = parsed
}

// 🟢 อนุมัติ
function approve() {
  if (!ocrResult.value) return

  loading.value = true
  const payload = { ...ocrResult.value } // Clone object
  console.log('📥 ข้อมูลที่จะส่งไป backend:', payload)

  api
    .post('/ocr/approve', payload)
    .then(() => {
      alert('✅ เพิ่มชั่วโมงสำเร็จ!')
    })
    .catch((err: unknown) => {
      console.error('❌ Failed to approve:', err)
      alert('❌ ไม่สามารถเพิ่มชั่วโมงได้')
    })
    .finally(() => {
      loading.value = false
    })
}
</script>
