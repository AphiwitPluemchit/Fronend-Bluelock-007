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
            :key="selectedActivityType"
            :is="getFormComponent || 'div'"
            :activity="activity"
            :imageFile="selectedImageFile"
            :imageRef="imageRef"
            :isEditing="route.query.disable !== 'true'"
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
import { useRoute } from 'vue-router'
const emit = defineEmits<{
  (e: 'update-activity', updated: Activity): void
}>()

const imageRef = ref<InstanceType<typeof ImageDetail> | null>(null)
const selectedImageFile = ref<File | null>(null)
const route = useRoute()
const isEditing = computed(() => route.query.disable !== 'true')

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
