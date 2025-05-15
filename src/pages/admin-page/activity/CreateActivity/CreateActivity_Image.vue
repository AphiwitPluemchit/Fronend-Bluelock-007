<script setup lang="ts">
import { ref } from 'vue'

const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)
const emit = defineEmits<{
  (e: 'file-selected', file: File): void
}>()
const triggerFileInput = () => {
  fileInput.value?.click()
}
const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
    emit('file-selected', file)
  }
}
defineExpose({ selectedFile })
</script>

<template>
  <div class="upload-container">
    <q-card flat bordered class="upload-box" @click="triggerFileInput">
      <input
        type="file"
        accept="image/*"
        ref="fileInput"
        style="display: none"
        @change="onFileChange"
      />
      <q-img
        v-if="previewUrl"
        :src="previewUrl"
        class="preview-img"
        :ratio="430 / 330"
        contain
        alt="Image preview"
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
  background-color: #e2e2e2;
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
