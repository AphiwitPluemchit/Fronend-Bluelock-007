<template>
  <q-page class="q-pa-md">
    <div class="wrapper">
      <div class="container">
        <div class="image-section">
          <ImageDetail
            ref="imageRef"
            :imageFileName="props.activity?.file"
            :disable="!isEditing"
            @file-selected="handleFileSelected"
          />
        </div>

      <div class="form-section">
          <FormMultipleDetail

            :key="selectedActivityType"
            :activity="activity"
            :imageFile="selectedImageFile"
            v-model:isEditing="isEditing"
            @saved="handleSave"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import {  ref, watch } from 'vue'
import ImageDetail from './ActivityDetail/ImageDetail.vue'
import FormMultipleDetail from './ActivityDetail/FormMultipleDetail.vue'
import type { Activity } from 'src/types/activity'
import { ActivityService } from 'src/services/activity'
import { useRoute } from 'vue-router'
const emit = defineEmits<{
  (e: 'update-activity', updated: Activity): void
}>()

const imageRef = ref<InstanceType<typeof ImageDetail> | null>(null)
const selectedImageFile = ref<File | null>(null)
const route = useRoute()
const isEditing = ref(route.query.disable !== 'true')

const handleFileSelected = (file: File) => {
  selectedImageFile.value = file
}

const props = defineProps<{
  activity: Activity | null
}>()

const selectedActivityType = ref('')
const handleSave = async (fileName?: string) => {
  if (selectedImageFile.value && props.activity?.id) {
    await uploadImageIfChanged()
  }
  selectedImageFile.value = null
  imageRef.value?.resetPreview()

  if (props.activity?.id) {
    const res = await ActivityService.getOne(props.activity.id)
    emit('update-activity', {
      ...res.data,
      file: fileName ?? res.data.file,
    })
  }
}

const uploadImageIfChanged = async () => {
  if (!selectedImageFile.value || !props.activity?.id) return

  const oldFile = props.activity.file ?? ''
  const newFileName = imageRef.value?.getSelectedFileName() ?? ''

  if (oldFile && oldFile !== newFileName) {
    try {
      await ActivityService.deleteImage(props.activity.id, oldFile)
      console.log('🗑 ลบรูปเก่าแล้ว:', oldFile)
    } catch (err) {
      console.warn('⚠️ ลบรูปเก่าไม่สำเร็จ:', err)
    }
  }

  try {
    const res = await ActivityService.uploadImage(props.activity.id, selectedImageFile.value)

    if (res.status === 200 || res.status === 201) {
      console.log('📤 อัปโหลดรูปใหม่สำเร็จ')
    }
  } catch (err) {
    console.error('❌ upload image failed:', err)
  }
}

watch(isEditing, (newVal) => {
  if (!newVal) {
    selectedImageFile.value = null
    imageRef.value?.resetPreview()
  }
})

</script>

<style scoped>
.wrapper {
  display: flex;
  align-items: flex-start;
  background-color: #edf0f5;
  border-radius: 12px;
}

.container {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.image-section {
  align-items: flex-start;
  width: 100%;
  flex: 1;
  margin-left: 100px;
}

.form-section {
  flex-grow: 1;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 680px;
  justify-items: flex-end;
  margin-right: 50px;
}

.form-section::-webkit-scrollbar {
  width: 8px;
  margin-right: 50px;
}
.Font {
  color: #ffffff;
  font-size: 15px;
  font-weight: bold;
  font-family: 'Noto Serif Thai', serif;
}
</style>
