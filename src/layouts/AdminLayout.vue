<template>
  <q-layout view="hHh lpR fFf">
    <!-- ส่ง event จาก Navbar ไป Sidebar -->
    <MenuNavbar @toggleSidebar="adminSidebar?.toggleSidebar()" />
    <MenuAdminSidebar ref="adminSidebar" style="max-height: 98%" />
    <q-page-container class="form-section">
      <div class="q-mx-auto q-px-lg"><router-view /></div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import MenuAdminSidebar from 'src/components/menu/MenuAdminSidebar.vue'
import MenuNavbar from 'src/components/menu/MenuNavbar.vue'
import { ref } from 'vue'

const adminSidebar = ref<InstanceType<typeof MenuAdminSidebar> | null>(null)
</script>
<style scoped>
.form-section {
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 100vh;
}
.form-section::-webkit-scrollbar {
  display: none;
}
</style>
