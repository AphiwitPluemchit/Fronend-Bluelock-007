<template>
  <q-header position="fixed" style="height: 7cap" class="content-center shadow-2">
    <q-toolbar>
      <!-- ปุ่มกดเปิด/ปิด Sidebar -->
      <q-btn flat dense round icon="menu" size="lg" aria-label="Menu" @click="toggleLeftDrawer" />
      <q-toolbar-title class="flex items-center q-gutter-md q-pl-xl">
        <img width="45" src="/icons/Logo_of_Burapha_University.png" alt="Logo" class="logo-img" />
        <div>
          <div class="text-weight-bold" style="line-height: 1.2">คณะวิทยาการสารสนเทศ</div>
          <div style="font-size: 16px; line-height: 1.2">มหาวิทยาลัยบูรพา</div>
        </div>
      </q-toolbar-title>
      <div class="flex q-gutter-md">
        <div style="font-size: 16px">
          <div>
            {{ 'กมลวรรณ แสงระวี' }}
          </div>
          <div class="flex justify-end">
            {{ userStore.role === 'admin' ? 'เจ้าหน้าที่' : 'นิสิต' }}
          </div>
        </div>
        <q-btn outline dense color="white" @click="switchRole">
          {{ userStore.role === 'admin' ? 'Admin' : 'Student' }}
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>
</template>
<script setup lang="ts">
import { useUserStore } from 'src/stores/user-store'

const userStore = useUserStore()
const emit = defineEmits(['toggleSidebar'])

const switchRole = () => {
  userStore.setRole(userStore.role === 'admin' ? 'user' : 'admin')
}

// แจ้ง Layout ให้เปลี่ยนสถานะ Sidebar
const toggleLeftDrawer = () => {
  emit('toggleSidebar')
}
</script>
<style scoped>
.navbar {
  left: 0;
  right: 0;
  width: 100%;
}
</style>
