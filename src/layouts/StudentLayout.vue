<template>
  <q-layout view="hHh lpR fFf">
    <MenuNavbar @toggleSidebar="studentSidebar?.toggleSidebar" />
    <MenuStudentSidebar ref="studentSidebar" />
    <q-page-container>
      <div class="q-mx-auto form-section" style="width: 1600px"><router-view /></div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import MenuNavbar from 'src/components/menu/MenuNavbar.vue'
import MenuStudentSidebar from 'src/components/menu/MenuStudentSidebar.vue'
import { ref } from 'vue'

const studentSidebar = ref<InstanceType<typeof MenuStudentSidebar> | null>(null)
</script>
<style scoped>
.form-section {
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 920px;
}
.form-section::-webkit-scrollbar {
  display: none;
}
</style>
