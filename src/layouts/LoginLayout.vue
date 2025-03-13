<template>
  <q-layout view="hHh lpR fFf">
    <!-- ส่ง event จาก Navbar ไป Sidebar -->
    <q-page-container style="display: flex">
      <div class="q-mx-auto"><router-view /></div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts"></script>
