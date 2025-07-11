<script setup lang="ts">
import { ref } from 'vue'
import CreateActivity_Form from './CreateActivity_Form.vue'
import CreateActivity_Image from './CreateActivity_Image.vue' 
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'

const imageComponentRef = ref<InstanceType<typeof CreateActivity_Image> | null>(null)
const selectedImageFile = ref<File | null>(null)

const handleFileSelected = (file: File) => {
  selectedImageFile.value = file
}
const breadcrumbs = ref({
  previousPage: { title: 'จัดการกิจกรรม', path: '/Admin/ActivitiesManagement' },
  currentPage: { title: 'สร้างกิจกรรม', path: '/Admin/ActivitiesManagement/CreateActivityPage' },
  icon: 'description',
})
</script>

<template>
  <q-page class="q-pa-md">
    <div style="margin-top: 20px;">
    <AppBreadcrumbs :breadcrumbs="breadcrumbs"/>
    <div class="wrapper">
      <div class="container">
        <div class="image-section">
          <CreateActivity_Image
            ref="imageComponentRef"
            @file-selected="handleFileSelected"
          />
        </div>
        <div class="form-section">
          <CreateActivity_Form
            :image-file="selectedImageFile"
          />
        </div>
      </div>
    </div>
    </div>
  </q-page>
</template>

<style scoped>
.wrapper {
  display: flex;
  align-items: flex-start;
  gap: 150px;
  padding: 30px;
  margin-top: 20px;
  flex-wrap: wrap; 
  background-color: #EDF0F5;
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
  margin-left: 100px;
}

.form-section {
  flex-grow: 1;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 640px;
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
@media(max-width: 1880px) {
  .wrapper {
    gap: 30px;
    padding: 20px;
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
  .wrapper {
    gap: 30px;
    padding: 20px;
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
    max-width: 500px;
  }
}
@media (max-width: 500px) {
  .wrapper {
    flex-direction: column;
    gap: 30px;
    padding: 20px;
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
