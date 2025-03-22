<template>
  <div class="upload-container">
    <div
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
      <img
        v-if="previewUrl || serverImageUrl"
        :src="(previewUrl || serverImageUrl) ?? ''"
        alt="Image preview"
        class="preview-img"
      />

      <q-icon v-else name="image" size="50px" />
    </div>
    <p class="image-size-text">*ขนาดรูป 430x330 px</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  imageFileName?: string | null | undefined
  disable?: boolean
}>()

const emit = defineEmits<{
  (e: 'file-selected', file: File): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)
const selectedFileName = ref<string | null>(null)

const serverImageUrl = computed(() =>
  props.imageFileName
    ? `http://localhost:8888/uploads/activity/images/${props.imageFileName}`
    : null,
)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const resetPreview = () => {
  previewUrl.value = null
}

const getSelectedFileName = () => selectedFileName.value

// ✅ รวมไว้ใน defineExpose เดียว
defineExpose({
  resetPreview,
  getSelectedFileName,
})

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFileName.value = file.name
    previewUrl.value = URL.createObjectURL(file)
    emit('file-selected', file)
  }
}

</script>

<style scoped>
.disabled-box {
  pointer-events: none;
  opacity: 0.6;
}
.q-icon {
  cursor: pointer;
}
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
  object-fit: fill;
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
.image-size-text {
  margin-top: 10px;
  font-size: 14px;
  color: #f03b2d;
  font-weight: bold;
  font-family: 'Noto Serif Thai', serif;
  align-self: flex-start;
}
.upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
