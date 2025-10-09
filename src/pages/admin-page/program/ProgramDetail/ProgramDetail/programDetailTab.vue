<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Program } from 'src/types/program'
import { ProgramService } from 'src/services/program'
import ImageDetail from './imageDetail.vue'
import FormMultipleDetail from './formMultipleDetail.vue'

const route = useRoute()
const selectedImageFile = ref<File | null>(null)
const isEditing = ref(route.query.disable !== 'true')
const imageRef = ref<InstanceType<typeof ImageDetail> | null>(null)
const formSection = ref<HTMLElement | null>(null)
const scrollToFormTop = () => {
  formSection.value?.scrollTo({ top: 0, behavior: 'smooth' })
}
const emit = defineEmits<{
  (e: 'update-program', updated: Program): void
}>()

const handleFileSelected = (file: File) => {
  selectedImageFile.value = file
}

const props = defineProps<{
  program: Program | null
}>()

const selectedProgramType = ref('')
const handleSave = async (fileName?: string) => {
  if (selectedImageFile.value && props.program?.id) {
    await uploadImageIfChanged()
  }
  selectedImageFile.value = null
  imageRef.value?.resetPreview()

  if (props.program?.id) {
    const res = await ProgramService.getOne(props.program.id)
    emit('update-program', {
      ...res.data,
      file: fileName ?? res.data.file,
    })
  }
}

const uploadImageIfChanged = async () => {
  if (!selectedImageFile.value || !props.program?.id) return

  const oldFile = props.program.file ?? ''
  const newFileName = imageRef.value?.getSelectedFileName() ?? ''

  if (oldFile && oldFile !== newFileName) {
    try {

      console.log('🗑 ลบรูปเก่าแล้ว:', oldFile)
    } catch (err) {
      console.warn('⚠️ ลบรูปเก่าไม่สำเร็จ:', err)
    }
  }

  try {
    const res = await ProgramService.uploadImage(props.program.id, selectedImageFile.value)

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
            :imageFileName="props.program?.file"
            :disable="!isEditing"
            @file-selected="handleFileSelected"
          />
        </div>

        <div class="form-section" ref="formSection">
          <FormMultipleDetail
            :key="selectedProgramType"
            :program="program"
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
  padding: 0px 50px;
  flex-wrap: wrap;
  background-color:#EDF0F5;
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
