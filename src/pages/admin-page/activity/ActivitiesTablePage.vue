<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md" style="display: flex; justify-content: space-between; align-items: center">
      <h5>จัดการกิจกรรม</h5>
      <q-btn class="btnAdd" icon="add" label="เพิ่มกิจกรรม" @click="goToCreateActivity" />
    </div>
    <div class="q-mb-md" style="display: flex; justify-content: space-between; align-items: center">
      <h6>กิจกรรมที่กำลังเปิดและปิดลงทะเบียนแล้ว</h6>
      <q-input class="searchBox" filled v-model="searchQuery" />
      <q-select
        filled
        v-model="selectedFilter"
        :options="filterOptions"
        label="ตัวกรอง"
        class="filterDropdown"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const searchQuery = ref('')
const selectedFilter = ref(null)
const filterOptions = ref([
  { label: 'ชั่วโมงเตรียมความพร้อม', value: 'option1' },
  { label: 'ชั่วโมงทักษะทางวิชาการ', value: 'option2' },
])
const goToCreateActivity = async () => {
  await router.push('/ActivitiesManagement/CreateActivity')
}
</script>

<style scoped>
h5 {
  font-weight: semibold;
  font-size: 30px;
  font-family: 'Noto Serif Thai', serif;
}
.btnAdd {
  font-weight: medium;
  font-size: 20px;
  font-family: 'Noto Serif Thai', serif;
  border-radius: 20px;
  width: 200px;
  height: 50px;
  margin-top: 20px;
}
.searchBox {
  width: 400px;
  height: 50px;
  border-radius: 20px;
}
</style>
