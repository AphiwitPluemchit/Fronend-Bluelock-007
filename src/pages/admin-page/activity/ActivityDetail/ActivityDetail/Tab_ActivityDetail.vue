<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Activity } from 'src/types/activity'
import { ActivityService } from 'src/services/activity'
import ImageDetail from './ImageDetail.vue'
import FormMultipleDetail from './FormMultipleDetail.vue'

const route = useRoute()
const selectedImageFile = ref<File | null>(null)
const isEditing = ref(route.query.disable !== 'true')
const imageRef = ref<InstanceType<typeof ImageDetail> | null>(null)
const formSection = ref<HTMLElement | null>(null)
const scrollToFormTop = () => {
  formSection.value?.scrollTo({ top: 0, behavior: 'smooth' })
}
const emit = defineEmits<{
  (e: 'update-activity', updated: Activity): void
}>()

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

<template>
  <q-page >
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

        <div class="form-section" ref="formSection">
          <FormMultipleDetail
            :key="selectedActivityType"
            :activity="activity"
            :imageFile="selectedImageFile"
            @scroll-to-top="scrollToFormTop"
            v-model:isEditing="isEditing"
            @saved="handleSave"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.wrapper {
  display: flex;
  align-items: flex-start;
  column-gap: 150px;
  padding: 45px;
  flex-wrap: wrap; 
}

.container {
  display: flex;
  align-items: flex-start;
  width: 100%;
  flex-wrap: wrap; 
}
.image-section {
  align-items: flex-start;
  width: 100%;
  flex: 1;
  margin-left: 80px;
}

.form-section {
  flex-grow: 1;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 590px;
}

.form-section::-webkit-scrollbar {
  width: 8px;
}
.Font {
  color: #ffffff;
  font-size: 15px;
  font-weight: bold;
  font-family: 'Noto Serif Thai', serif;
}
@media(max-width: 1880px) {
  .wrapper {
    gap: 0px;
    padding: 0px;
  }
  .container {
    flex-direction: column;
    align-items: center;
  }

  .image-section {
    margin-left: 0;
    width: 100%;
    max-width: 430px;
  }

  .form-section {
    margin-right: 0;
    max-height: unset;
    width: 100%;
    max-width: 770px;
  }
}
@media(max-width: 860px) {
  .container {
    flex-direction: column;
    align-items: center;
  }

  .image-section {
    margin-left: 0;
    width: 100%;
    max-width: 430px;
  }

  .form-section {
    margin-right: 0;
    max-height: unset;
    width: 100%;
    max-width: 500px;
  }
}
@media (max-width: 500px) {
  .wrapper {
    flex-direction: column;
    gap: 30px;
    padding: 5px;
  }

  .container {
    flex-direction: column;
    align-items: center;
  }

  .image-section {
    margin-left: 0;
    width: 100%;
    max-width: 430px;
  }

  .form-section {
    margin-right: 0;
    max-height: unset;
    width: 100%;
    max-width: 800px;
  }
}
</style>
