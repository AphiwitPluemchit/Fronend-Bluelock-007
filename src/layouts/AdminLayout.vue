<template>
  <q-layout view="hHh Lpr lFf">
    <!-- ส่ง event จาก Navbar ไป Sidebar -->
    <MenuNavbar @toggleSidebar="adminSidebar?.toggleSidebar()" />
     <div class="custom-drawer-wrapper">
      <MenuAdminSidebar ref="adminSidebar" />
    </div>
    <q-page-container>
      <div class="q-mx-auto" style="max-width: 1600px"><router-view /></div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import MenuAdminSidebar from 'src/components/menu/MenuAdminSidebar.vue'
import MenuNavbar from 'src/components/menu/MenuNavbar.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const adminSidebar = ref<InstanceType<typeof MenuAdminSidebar> | null>(null)
const router = useRouter()
const authStore = useAuthStore()

// ตรวจสอบสิทธิ์การเข้าถึง Admin Layout
onMounted(() => {
  // ตรวจสอบว่า user เป็น admin หรือไม่
  if (!authStore.isAdmin) {
    console.warn('Non-admin user trying to access admin layout, redirecting')
    if (authStore.isStudent) {
      void router.replace('/Student/ProgramCalendar')
    } else {
      // ถ้าไม่มี role ที่ชัดเจน ให้ไปหน้า login
      void router.replace('/')
    }
    return
  }

  // ตรวจสอบความถูกต้องของข้อมูล user
  if (!authStore.validateUserData()) {
    console.warn('Invalid user data in admin layout, redirecting to login')
    authStore.clearLocalStorage()
    void router.replace('/')
    return
  }
})
</script>
<style scoped></style>
