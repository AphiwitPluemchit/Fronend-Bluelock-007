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
          <div class="button-group">
            <q-btn class="cancel-btn Font" @click="goToActivitiesManagement">ยกเลิก</q-btn>
            <q-btn class="submit-btn Font">เสร็จสิ้น</q-btn>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import CreateActivity_Image from './CreateActivity_Image.vue'
import FormSingleDay from './FormSingleDay.vue.vue'
import FormMultipleDays from './FormMultipleDays.vue'
import FormMultipleActivities from './FormMultipleActivities.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {})

const goToActivitiesManagement = async () => {
  await router.push('/ActivitiesManagement')
}

const activityOptions = ['กิจกรรมวันเดียว', 'กิจกรรมหลายวัน', 'หลายกิจกรรม']
const selectedActivityType = ref('กิจกรรมวันเดียว')

const getFormComponent = computed(() => {
  switch (selectedActivityType.value) {
    case 'กิจกรรมวันเดียว':
      return FormSingleDay
    case 'กิจกรรมหลายวัน':
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
  max-width: 1400px;
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
  min-width: 600px; 
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  flex: 2; 
}
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 25px;
  margin-top: 30px;
}

.cancel-btn {
  width: 90px;
  height: 50px;
  border-radius: 15px;
  background-color: #f03b2d;
}

.submit-btn {
  width: 90px;
  height: 50px;
  border-radius: 15px;
  background-color: #2fa54d;
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
