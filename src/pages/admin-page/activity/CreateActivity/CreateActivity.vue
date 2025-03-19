<template>
  <q-page class="q-pa-md">
    <AppBreadcrumbs :breadcrumbs="breadcrumbs" />

    <div class="wrapper">
      <div class="container">
        <div class="image-section">
          <CreateActivity_Image
            ref="imageComponentRef"
            @file-selected="handleFileSelected"
          />

          <q-select
            v-model="selectedActivityType"
            :options="activityOptions"
            outlined
            class="dropdown no-border bg-white"
            popup-content-class="custom-dropdown"
          >
            <template v-slot:selected>
              <div v-if="selectedActivityType">{{ selectedActivityType }}</div>
              <div v-else class="text-grey">เลือกประเภท</div>
            </template>
          </q-select>
        </div>

        <div class="form-section">
          <!-- ✅ เปลี่ยนตรงนี้ -->
          <FormMultipleDays
            v-if="selectedActivityType === 'กิจกรรมเดียว'"
            :image-file="selectedImageFile"
          />
          <FormMultipleActivities
            v-else
            :image-file="selectedImageFile"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CreateActivity_Image from './CreateActivity_Image.vue'
import FormMultipleDays from './FormMultipleDays.vue'
import FormMultipleActivities from './FormMultipleActivities.vue'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'

const imageComponentRef = ref<InstanceType<typeof CreateActivity_Image> | null>(null)
const selectedImageFile = ref<File | null>(null)

const handleFileSelected = (file: File) => {
  selectedImageFile.value = file
}

const activityOptions = ['กิจกรรมเดียว', 'หลายกิจกรรม']
const selectedActivityType = ref('กิจกรรมเดียว')

const breadcrumbs = ref({
  previousPage: { title: 'จัดการกิจกรรม', path: '/ActivitiesManagement' },
  currentPage: { title: 'สร้างกิจกรรม', path: '/ActivitiesManagement/CreateActivity' },
  icon: 'description',
})
</script>


<style scoped>
.wrapper {
  display: flex;
  align-items: flex-start;
  gap: 150px;
  background-color: #edf0f5;
  padding: 30px;
  border-radius: 12px;
  margin-top: 20px;
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
  max-height: 660px;
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
