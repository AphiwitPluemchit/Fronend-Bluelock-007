<script setup lang="ts">
// import { useUserStore } from 'src/stores/user-store'
import { useAuthStore } from 'src/stores/auth'
import { EnumUserRole } from 'src/data/roles'
import { useQuasar } from 'quasar'
const $q = useQuasar()
const store = useAuthStore()
// const userStore = useUserStore()
const emit = defineEmits(['toggleSidebar'])

// const switchRole = () => {
//   userStore.setRole(userStore.role === 'admin' ? 'user' : 'admin')
// }

// แจ้ง Layout ให้เปลี่ยนสถานะ Sidebar
const toggleLeftDrawer = () => {
  emit('toggleSidebar')
}
</script>

<template>
  <q-header position="fixed" style="height: 64px" class="content-center shadow-2">
    <q-toolbar class="justify-between">
      <!-- ปุ่มกดเปิด/ปิด Sidebar -->
      <q-toolbar-title class="flex items-center q-gutter-x-sm"
        ><q-btn
          flat
          dense
          round
          icon="menu"
          size="lg"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <img width="45" src="/icons/Logo_of_Burapha_University.png" alt="Logo" class="logo-img" />
        <div class="hidden-xs" v-show="$q.screen.gt.xs">
          <div class="text-weight-bold textcontent1" >คณะวิทยาการสารสนเทศ</div>
          <div class="textcontent2">มหาวิทยาลัยบูรพา</div>
        </div>
      </q-toolbar-title>
      <!-- โลโก้ + ชื่อ -->

      <!-- ข้อมูลผู้ใช้ -->
      <div class="row items-center q-gutter-sm textcontent2" >
        <div >
          <div>{{ store.getName }}</div>
          <div class="flex justify-end">
            {{ store.getRole === EnumUserRole.STUDENT ? 'นิสิต' : 'ผู้ดูแล' }}
          </div>
        </div>
      </div>
    </q-toolbar>
  </q-header>
</template>

<style scoped>
.logo-img {
  width: 38px;
  height: auto;
}
</style>
