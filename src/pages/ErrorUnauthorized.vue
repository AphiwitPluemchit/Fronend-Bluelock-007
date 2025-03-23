<template>
  <q-page class="flex flex-center column q-pa-xl">
    <q-icon name="lock" size="100px" color="red-5" />
    <div class="text-h4 q-mt-md text-weight-bold">Access Denied</div>
    <div class="text-subtitle2 q-mt-sm text-grey-7">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>

    <q-btn
      class="q-mt-xl btnconfirm"
      color="primary"
      label="กลับหน้าเข้าสู่ระบบ"
      icon="arrow_back"
      @click="goHome"
    />
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const goHome = () => {
  void router.push('/') // หรือเปลี่ยนเป็น push ตาม role ได้
}
</script>

<style scoped>
.q-page {
  min-height: 100vh;
}
</style>
