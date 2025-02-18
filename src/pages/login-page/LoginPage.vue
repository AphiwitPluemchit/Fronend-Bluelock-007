<!-- src/pages/login-page/LoginPage.vue -->
<template>
  <q-page>
    <div class="login-form">
      <q-input label="Username" v-model="username" />
      <q-input label="Password" v-model="password" type="password" />
      <q-btn @click="login" label="Login" color="primary" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
// const router = useRouter()

function login() {
  if (username.value === 'admin' && password.value === 'password') {
    localStorage.setItem('user-token', 'sample-token') // ตั้งค่า token เพื่อให้สถานะการล็อกอินเป็นจริง
    // router.push('/ActivitiesCalendarPage') // ไปที่หน้า dashboard
  } else {
    alert('Invalid credentials')
  }
}
</script>
