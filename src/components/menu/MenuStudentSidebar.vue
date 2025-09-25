<template>
  <q-header class="bg-primary text-white shadow-2" elevated>
    <q-toolbar class="justify-between">
      <!-- เมนูหลัก -->
      <div class="row items-center q-gutter-x-lg">
        <!-- ปุ่มเมนูหลัก -->
        <q-btn flat no-caps label="หน้าหลัก" to="/Student/Home" />

        <!-- เมนูมีโครงการ (dropdown) -->
        <q-btn flat no-caps label="โครงการ">
          <q-menu fit>
            <q-list style="min-width: 150px">
              <q-item clickable v-ripple to="/Student/ProgramCalendar">
                <q-item-section>ปฏิทิน</q-item-section>
              </q-item>
              <q-item clickable v-ripple to="/Student/ProgramTablePage">
                <q-item-section>โครงการ</q-item-section>
              </q-item>
              <q-item clickable v-ripple to="/Student/OnlineCoursesPage">
                <q-item-section>อบรมออนไลน์</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <!-- ข้อมูลผู้ใช้ + เมนู dropdown -->
      <div class="row items-center">
        <div class="text-right" v-show="$q.screen.gt.xs">
          <div>{{ authStore.getName }}</div>
          <div style="font-size: 13px">
            {{ authStore.getRole === EnumUserRole.STUDENT ? 'นิสิต' : 'ผู้ดูแล' }}
          </div>
        </div>
        <q-btn flat no-caps>
          <q-avatar size="32px" class="bg-white text-primary">
            <q-icon name="person" />
          </q-avatar>

          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 150px">
              <q-item clickable v-ripple to="/Student/RecordPage">
                <q-item-section>ประวัติ</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="logout">
                <q-item-section>ออกจากระบบ</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { EnumUserRole } from 'src/data/roles'
import { useQuasar } from 'quasar'
const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

async function logout() {
  try {
    await authStore.logout()
    await router.push('/')
  } catch {
    authStore.clearLocalStorage()
    await router.push('/')
  }
}
</script>
