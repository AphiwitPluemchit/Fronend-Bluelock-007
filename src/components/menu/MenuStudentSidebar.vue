<template>
  <q-header class="text-white shadow-2" elevated>
    <q-toolbar class="justify-between bg-primary">
      <!-- เมนูหลัก -->
      <div class="row items-center q-gutter-x-md">
        <img
          src="/icons/Logo_of_Burapha_University.png"
          alt="Logo"
          style="width: 45px; height: 45px"
          class="q-ml-lg"
        />
        <div class="text-left textsubtitle" v-show="$q.screen.gt.xs">
          <div>ระบบเก็บชั่วโมงอบรมสหกิจศึกษา</div>
        </div>
        <!-- ปุ่มเมนูหลัก -->
      </div>

      <!-- ข้อมูลผู้ใช้ + เมนู dropdown -->
      <div class="row items-center q-mt-sm">
        <div class="text-right textsubtitle" v-show="$q.screen.gt.sm">
          <div>{{ authStore.getName }}</div>
          <div>
            {{ authStore.getRole === EnumUserRole.STUDENT ? 'นิสิต' : 'ผู้ดูแล' }}
          </div>
        </div>
        <q-btn flat no-caps>
          <q-avatar size="45px" class="bg-white text-primary">
            <q-icon name="person" />
          </q-avatar>

          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 180px">
              <q-item clickable v-ripple tag="router-link" to="/Student/RecordPage">
                <q-item-section avatar>
                  <q-icon name="person" color="indigo-10" />
                </q-item-section>
                <q-item-section class="textcontent">ประวัติของฉัน</q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" color="red" />
                </q-item-section>
                <q-item-section class="textcontent">ออกจากระบบ</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-toolbar>
    <q-toolbar class="justify-start bg-accent" style="max-height: 30px;">
      <q-btn dense flat no-caps label="หน้าหลัก" to="/Student/Home" class="q-mx-md textsubtitle" />

      <!-- เมนูมีโครงการ (dropdown) -->
      <q-btn dense flat no-caps label="โครงการ" class="q-mx-md textsubtitle">
        <q-menu fit>
          <q-list style="min-width: 150px">
            <q-item clickable v-ripple to="/Student/ProgramCalendar">
              <q-item-section class="textcontent">ปฏิทิน</q-item-section>
            </q-item>
            <q-item clickable v-ripple to="/Student/ProgramTablePage">
              <q-item-section class="textcontent">โครงการ</q-item-section>
            </q-item>
            <q-item clickable v-ripple to="/Student/OnlineCoursesPage">
              <q-item-section class="textcontent">หลักสูตร</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
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
<style scoped></style>
