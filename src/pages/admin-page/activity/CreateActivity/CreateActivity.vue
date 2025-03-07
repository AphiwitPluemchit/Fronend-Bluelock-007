<template>
  <q-page class="q-pa-md">
    <div
      style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; margin-top: 20px"
    >
      <span class="material-icons"> border_color </span>
      <a
        @click="goToActivitiesManagement"
        style="cursor: pointer; text-decoration: none; color: black"
      >
        จัดการกิจกรรม
      </a>
      <p style="margin: 0">></p>
      <a style="text-decoration: underline; color: black"> สร้างกิจกรรม </a>
    </div>
    <h5 style="margin-top: 0; margin-bottom: 20px">สร้างกิจกรรม</h5>

    <!-- กล่องครอบ image และ form -->
    <div class="wrapper">
      <div class="container">
        <div class="image-section">
          <CreateActivity_Image />
          <!-- Dropdown ใต้รูป -->
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
          <component :is="getFormComponent || 'div'" />
      
          
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import CreateActivity_Image from './CreateActivity_Image.vue'
import FormMultipleDays from './FormMultipleDays.vue'
import FormMultipleActivities from './FormMultipleActivities.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {})

const goToActivitiesManagement = async () => {
  await router.push('/ActivitiesManagement')
}

const activityOptions = ['กิจกรรมเดียว', 'หลายกิจกรรม']
const selectedActivityType = ref('กิจกรรมเดียว')

const getFormComponent = computed(() => {
  switch (selectedActivityType.value) {
    case 'กิจกรรมเดียว':
      return FormMultipleDays
    case 'หลายกิจกรรม':
      return FormMultipleActivities
    default:
      return null
  }
})
</script>

<style scoped>
.wrapper {
  background-color: #edf0f5;
  width: 1500px;
  height: auto;
  border-radius: 15px;
  padding: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  max-width: 1500px;
  display: flex;
  gap: 50px;
  align-items: flex-start;
  width: 100%;
}

.image-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  flex: 1;
}

.form-section {
  display: flex;
  flex-direction: column;
  flex-grow: 1; 
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 700px;
}


.form-section::-webkit-scrollbar {
  width: 8px; 
  margin-right: 50px; 
}
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 25px;
  margin-top: 30px; 
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
