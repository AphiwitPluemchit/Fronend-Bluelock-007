<template>
  <q-layout view="hHh lpR fFf">
    <!-- ส่ง event จาก Navbar ไป Sidebar -->
    <MenuNavbar @toggleSidebar="adminSidebar?.toggleSidebar()" />
    <MenuAdminSidebar ref="adminSidebar" />
    <q-page-container style="display: flex">
      <div class="q-mx-auto" style="width: 1600px"><router-view /></div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import MenuAdminSidebar from 'src/components/menu/MenuAdminSidebar.vue'
import MenuNavbar from 'src/components/menu/MenuNavbar.vue'
import { ref } from 'vue'

const adminSidebar = ref<InstanceType<typeof MenuAdminSidebar> | null>(null)
</script>
