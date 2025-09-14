<template>
  <q-layout view="hHh Lpr lFf">
    <!-- <MenuNavbar @toggleSidebar="studentSidebar?.toggleSidebar" /> -->
    <MenuStudentSidebar ref="studentSidebar" />
    <q-page-container>
      <div class="q-mx-auto" style="max-width: 1600px"><router-view /></div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// import MenuNavbar from 'src/components/menu/MenuNavbar.vue'
import MenuStudentSidebar from 'src/components/menu/MenuStudentSidebar.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const studentSidebar = ref<InstanceType<typeof MenuStudentSidebar> | null>(null)
const router = useRouter()
const authStore = useAuthStore()

// ตรวจสอบสิทธิ์การเข้าถึง Student Layout
onMounted(() => {
  // ตรวจสอบว่า user เป็น student หรือไม่
  if (!authStore.isStudent) {
    console.warn('Non-student user trying to access student layout, redirecting')
    if (authStore.isAdmin) {
      void router.replace('/Admin/ProgramCalendar')
    } else {
      // ถ้าไม่มี role ที่ชัดเจน ให้ไปหน้า login
      void router.replace('/')
    }
    return
  }

  // ตรวจสอบความถูกต้องของข้อมูล user
  if (!authStore.validateUserData()) {
    console.warn('Invalid user data in student layout, redirecting to login')
    authStore.clearLocalStorage()
    void router.replace('/')
    return
  }
})
</script>
<style scoped></style>
