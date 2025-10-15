<script setup lang="ts">
import { ref, computed } from 'vue'
import { api } from 'boot/axios'

const fileInput = ref<HTMLInputElement | null>(null)
const baseurl = api.defaults.baseURL
const previewUrl = ref<string | null>(null)
const selectedFileName = ref<string | null>(null)
const props = defineProps<{
  imageFileName?: string | null | undefined
  disable?: boolean
}>()

const emit = defineEmits<{
  (e: 'file-selected', file: File): void
}>()

const serverImageUrl = computed(() =>
  props.imageFileName
    ? `${import.meta.env.VITE_API_URL}/uploads/program/images/${props.imageFileName}`
    : null,
)
const imageSrc = computed(() => {
  return previewUrl.value ?? serverImageUrl.value ?? undefined
})
const triggerFileInput = () => {
  fileInput.value?.click()
}

const resetPreview = () => {
  previewUrl.value = null
}

const getSelectedFileName = () => selectedFileName.value
const selectedFile = ref<File | null>(null)
defineExpose({
  resetPreview,
  getSelectedFileName,
  getSelectedFile: () => selectedFile.value,
})

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
    selectedFileName.value = file.name
    previewUrl.value = URL.createObjectURL(file)
    emit('file-selected', file)
  }
}
</script>

<template>
  <div class="upload-container">
    <q-card
      flat
      bordered
      class="upload-box"
      @click="!disable && triggerFileInput()"
      :class="{ 'disabled-box': disable }"
    >
      <input
        type="file"
        accept="image/*"
        ref="fileInput"
        style="display: none"
        @change="onFileChange"
      />

      <q-img
        :src="imageSrc || `${baseurl}/uploads/no-image.jpg`"
        alt="Image preview"
        class="preview-img"
        :ratio="430 / 330"
        contain
      />
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
