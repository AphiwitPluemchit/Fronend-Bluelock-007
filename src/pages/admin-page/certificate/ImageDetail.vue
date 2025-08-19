<script setup lang="ts">
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url' // Vite
import { ref, computed, onMounted } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'

// ตั้ง worker ให้ PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)
const selectedFileName = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

const props = defineProps<{
  imageFileName?: string | null | undefined
  disable?: boolean
}>()

const emit = defineEmits<{
  (e: 'file-selected', file: File): void
}>()

const serverFileUrl = computed(() =>
  props.imageFileName
    ? `${import.meta.env.VITE_API_URL}/uploads/course/images/${props.imageFileName}`
    : null,
)

// สร้าง src สำหรับแสดง (รูปที่อัปโหลด, หรือภาพที่เรนเดอร์จากไฟล์บนเซิร์ฟเวอร์)
const imageSrc = computed(() => previewUrl.value ?? undefined)

// เรียก input
const triggerFileInput = () => !props.disable && fileInput.value?.click()

// รีเซ็ต
const resetPreview = () => {
  previewUrl.value = null
}
const getSelectedFileName = () => selectedFileName.value

defineExpose({
  resetPreview,
  getSelectedFileName,
  getSelectedFile: () => selectedFile.value,
})

async function renderPdfFirstPageToDataUrl(buffer: ArrayBuffer, scale = 1.5): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.width = viewport.width
  canvas.height = viewport.height
  await page.render({ canvasContext: ctx, viewport, canvas }).promise
  return canvas.toDataURL('image/png') // จะเอา image/jpeg ก็ได้
}

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  selectedFile.value = file
  selectedFileName.value = file.name

  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    // PDF → แปลงหน้าแรกเป็นภาพ
    const buffer = await file.arrayBuffer()
    previewUrl.value = await renderPdfFirstPageToDataUrl(buffer)
  } else if (file.type.startsWith('image/')) {
    // รูปภาพทั่วไป → แสดงได้เลย
    previewUrl.value = URL.createObjectURL(file)
  } else {
    previewUrl.value = null
  }

  emit('file-selected', file)
}

onMounted(async () => {
  if (!serverFileUrl.value) return
  const isPdf = /\.pdf(\?|$)/i.test(serverFileUrl.value)
  if (isPdf) {
    const res = await fetch(serverFileUrl.value, { credentials: 'include' }).catch(() => null)
    if (res && res.ok) {
      const buf = await res.arrayBuffer()
      previewUrl.value = await renderPdfFirstPageToDataUrl(buf)
    }
  } else {
    previewUrl.value = serverFileUrl.value!
  }
})
</script>

<template>
  <div class="upload-container">
    <q-card
      flat
      bordered
      class="upload-box"
      :class="{ 'disabled-box': disable }"
      @click="triggerFileInput"
    >
      <input type="file" @change="onFileChange" />

      <q-img
        v-if="imageSrc"
        :src="imageSrc"
        alt="preview"
        class="preview-img"
        :ratio="430 / 330"
        contain
      />
      <q-icon v-else name="image" size="50px" />
    </q-card>
    <p class="image-size-text">*ขนาดรูป 430x330 px</p>
  </div>
</template>

<style scoped>
.upload-box {
  width: 430px;
  height: 330px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.preview-img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.image-size-text {
  margin-top: 10px;
  font-size: 14px;
  color: #f03b2d;
  font-weight: bold;
  font-family: 'Noto Serif Thai', serif;
  text-align: left;
  width: 100%;
  max-width: 430px;
}
.disabled-box {
  pointer-events: none;
  opacity: 0.6;
}
@media (max-width: 500px) {
  .upload-box {
    width: 330px;
    height: 230px;
  }
  .image-size-text {
    max-width: 330px;
  }
}
@media (max-width: 400px) {
  .upload-box {
    width: 300px;
    height: 200px;
  }
  .image-size-text {
    max-width: 300px;
  }
}
</style>
