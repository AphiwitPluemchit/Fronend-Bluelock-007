<template>
  <q-page class="q-pa-md">
    <div class="wrapper">
      <div class="container">
        <div class="image-section">
          <ImageDetail
            ref="imageRef"
            :imageFileName="activity?.file"
            :disable="!isEditing"
            @file-selected="handleFileSelected"
          />

          <!-- Dropdown ใต้รูป -->
          <q-select v-model="selectedActivityType" outlined class="dropdown no-border bg-white">
            <template v-slot:selected>
              <div v-if="selectedActivityType">{{ selectedActivityType }}</div>
              <div v-else class="text-black">เลือกประเภท</div>
            </template>
          </q-select>
        </div>

        <div class="form-section">
          <component
            :is="getFormComponent || 'div'"
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
import { ref, computed, watch } from 'vue'
import ImageDetail from './ActivityDetail/ImageDetail.vue'
import FormDetail from './ActivityDetail/FormDetail.vue'
import FormMultipleDetail from './ActivityDetail/FormMultipleDetail.vue'
import type { Activity } from 'src/types/activity'
import { ActivityService } from 'src/services/activity'

const imageRef = ref<InstanceType<typeof ImageDetail> | null>(null)
const selectedImageFile = ref<File | null>(null)
const isEditing = ref(false)

const handleFileSelected = (file: File) => {
  selectedImageFile.value = file
}

const props = defineProps<{
  activity: Activity | null
}>()

const selectedActivityType = ref('')
const handleSave = async () => {
  await uploadImageIfChanged()
  selectedImageFile.value = null
  imageRef.value?.resetPreview()
}
const uploadImageIfChanged = async () => {
  if (!selectedImageFile.value || !props.activity?.id) return

  const oldFile = props.activity.file ?? undefined
  const status = await ActivityService.uploadImage(
    props.activity.id,
    selectedImageFile.value,
    oldFile
  )
  console.log('📤 uploaded new image:', status)
}

watch(
  () => props.activity?.type,
  (newType) => {
    if (newType === 'one') {
      selectedActivityType.value = 'กิจกรรมเดียว'
    } else if (newType === 'many') {
      selectedActivityType.value = 'หลายกิจกรรม'
    } else {
      selectedActivityType.value = ''
    }
  },
  { immediate: true },
)
const getFormComponent = computed(() => {
  switch (selectedActivityType.value) {
    case 'กิจกรรมเดียว':
      return FormDetail
    case 'หลายกิจกรรม':
      return FormMultipleDetail
    default:
      return null
  }
})
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
.dropdown {
  border-radius: 5px;
  width: 200px;
  height: 55px;
  margin-top: 10px;
}
</style>
