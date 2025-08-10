<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from 'boot/axios'
import { useCourseStore } from 'src/stores/course'
import { useAuthStore } from 'src/stores/auth'

const courseStore = useCourseStore()
const authStore = useAuthStore()
const baseurl = api.defaults.baseURL
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const isPDF = ref(false)
const visible = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const ocrResult = ref<OcrResult | null>(null)

const selectedSource = ref('')
const selectedTopic = ref<{ id: number; name: string } | null>(null)

const sourceOptions = [
  { value: 'buumooc', label: 'BUU MOOC' },
  { value: 'thaimooc', label: 'Thai MOOC' },
]

const topicOptions = computed(() => courseStore.courses)

interface OcrResult {
  student_name: string
  course_name: string
  date: string
  url?: string
  verified?: boolean
  verify_note?: string
}

function onInputChange(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (files && files.length > 0) {
    selectedFile.value = files[0]!
    onFileSelected(files[0]!)
  }
}

function handleDrop(e: DragEvent) {
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]!
    onFileSelected(files[0]!)
  }
}

function onFileSelected(file: File | null) {
  if (!file) return
  isPDF.value = file.type === 'application/pdf'
  previewUrl.value = URL.createObjectURL(file)
}

function clearFile() {
  selectedFile.value = null
  previewUrl.value = null
  isPDF.value = false
  ocrResult.value = null
}

async function uploadFile() {
  if (!selectedFile.value) return
  visible.value = true

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    console.log('Student ID:', authStore.getUser?.id)
    console.log('Course ID:', selectedTopic.value?.id)
    const res = await api.post(baseurl + '/ocr/upload', formData, {
      params: {
        // get id of course
        studentId: authStore.getUser?.id,
        courseId: selectedTopic.value?.id,
      },
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const parsed = JSON.parse(res.data.data)
    ocrResult.value = parsed.data
  } catch (err) {
    console.error('❌ Upload failed:', err)
  } finally {
    visible.value = false
  }
}

function onSearch(val: string, update: (callback: () => void) => void) {
  courseStore.params.search = val
  courseStore
    .fetchCourses()
    .catch((err) => console.error('Course load failed:', err))
    .finally(() => {
      update(() => {})
    })
}

function setCourseFilter() {
  courseStore.params.type = selectedSource.value
  console.log(courseStore.params.type)
}
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">อัปโหลดใบประกาศนียบัตร</div>

    <q-card
      class="q-pa-md q-mt-md drop-area"
      @dragover.prevent
      @drop.prevent="handleDrop"
      @click="fileInput?.click()"
    >
      <div class="column items-center justify-center">
        <div v-if="previewUrl" class="relative-container full-width">
          <q-btn
            round
            color="negative"
            icon="close"
            size="sm"
            class="close-btn"
            @click.stop="clearFile"
          />
          <iframe
            v-if="isPDF"
            class="preview-frame"
            :src="previewUrl + '#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=page-fit'"
          />
          <q-img
            v-else
            :src="previewUrl"
            style="max-width: 100%; max-height: 400px; object-fit: contain"
            spinner-color="primary"
          />
        </div>

        <div v-else class="text-subtitle1 text-grey text-center q-pa-md">
          <q-icon name="cloud_upload" size="40px" class="q-mb-sm" />
          <div>คลิกหรือลากไฟล์ของคุณมาที่นี่เพื่ออัปโหลด</div>
          <input
            type="file"
            ref="fileInput"
            class="hidden"
            accept=".pdf,image/*"
            @change="onInputChange"
          />
        </div>
      </div>
    </q-card>

    <!-- Dropdowns -->
    <div class="column q-gutter-y-sm q-mt-md">
      <q-select
        v-model="selectedSource"
        :options="sourceOptions"
        label="แหล่งที่มา"
        dense
        outlined
        emit-value
        map-options
        @update:model-value="setCourseFilter"
      />
      <q-select
        v-model="selectedTopic"
        :options="topicOptions"
        option-label="name"
        option-value="id"
        label="หัวข้อ"
        dense
        outlined
        :loading="courseStore.loading"
        @filter="onSearch"
        :disable="!selectedSource"
        use-input
        :debounce="300"
      />
    </div>

    <!-- ปุ่มยืนยัน -->
    <div class="row justify-end q-mt-md">
      <q-btn
        label="ยืนยัน"
        class="btnconfirm"
        :disable="!selectedFile || !selectedSource || !selectedTopic"
        @click="uploadFile"
      />
    </div>

    <!-- OCR Result -->
    <q-card-section v-if="ocrResult" class="q-mt-lg">
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
    </q-card-section>

    <q-inner-loading
      :showing="visible"
      label="กำลังอัปโหลด..."
      label-class="text-primary"
      label-style="font-size: 1.1em"
    />
  </q-page>
</template>

<style scoped>
.drop-area {
  border: 2px dashed #90caf9;
  background-color: #e3f2fd;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 24px;
  min-height: 160px;
}

.drop-area:hover {
  background-color: #d0e9ff;
}

.relative-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.preview-frame {
  width: 100%;
  height: 400px;
  border: none;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  transition: transform 0.2s;
}

.close-btn:hover {
  transform: scale(1.2);
}
</style>
