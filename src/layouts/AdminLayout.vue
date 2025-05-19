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
import { ref } from 'vue'

const adminSidebar = ref<InstanceType<typeof MenuAdminSidebar> | null>(null)
</script>
<style scoped></style>
