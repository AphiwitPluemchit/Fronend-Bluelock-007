<template>
  <q-layout view="hHh lpR fFf">
    <!-- ส่ง event จาก Navbar ไป Sidebar -->
    <q-page-container>
      <div class="q-mx-auto"><router-view /></div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
defineOptions({ name: 'LoginLayout' })
</script>
