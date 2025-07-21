<template>
  <q-layout view="hHh lpR fFf">
    <!-- ส่ง event จาก Navbar ไป Sidebar -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
defineOptions({ name: 'LoginLayout' })
</script>
