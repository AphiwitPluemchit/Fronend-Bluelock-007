<template>
  <!-- <router-view /> -->
  <component :is="userStore.role === 'admin' ? AdminLayout : StudentLayout" />
</template>

<script setup lang="ts">
import { useUserStore } from 'src/stores/user-store'
import AdminLayout from './layouts/AdminLayout.vue'
import StudentLayout from './layouts/StudentLayout.vue'

const userStore = useUserStore()
</script>
