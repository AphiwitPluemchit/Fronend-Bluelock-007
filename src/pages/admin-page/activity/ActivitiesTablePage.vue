<template>
  <!-- ปุ่มไปหน้า CreateActivity -->
  <q-btn @click="goToPage('/ActivitiesManagement/CreateActivity')"> ไปหน้าเหนือ </q-btn>

  <!-- ปุ่มไปหน้า StudentEnrollmentPage -->
  <q-btn @click="goToPage('/ActivitiesManagement/ActivityDetail/StudentEnrollmentPage')">
    ไปหน้าเดีย
  </q-btn>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToPage = async (path: string) => {
  await router.push(path)
}
</script>
