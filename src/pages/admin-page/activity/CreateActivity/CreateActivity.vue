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
            label="เลือกประเภท"
            class="dropdown Font bg-white"
            popup-content-class="custom-dropdown"
          />
        </div>

        <div class="form-section">
          <CreateActivity_Form />
          <div class="button-group">
            <q-btn class="cancel-btn Font">ยกเลิก</q-btn>
            <q-btn class="submit-btn Font">เสร็จสิ้น</q-btn>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CreateActivity_Image from './CreateActivity_Image.vue'
import CreateActivity_Form from './CreateActivity_Form.vue'

import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  
})

const goToActivitiesManagement = async () => {
  await router.push('/ActivitiesManagement')
}

const activityOptions = ['กิจกรรมวันเดียว', 'กิจกรรมหลายวัน', 'หลายกิจกรรม']
const selectedActivityType = ref(null) // ค่าเริ่มต้นเป็น null
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
  gap: 150px;
  align-items: flex-start;
}

.form-section {
  display: flex;
  flex-direction: column;
  width: 100%;
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
  border-radius: 10px;
  width: 200px;
  height: 50px;
  margin-top: 10px;
}
</style>
