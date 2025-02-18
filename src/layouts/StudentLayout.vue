<!-- src/layouts/StudentLayout.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Student Dashboard </q-toolbar-title>

        <div>Student</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <router-link
          v-for="link in linksList"
          :key="link.title"
          :to="link.link || '/'"
          class="no-link"
        >
          <q-item clickable>
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.title }}</q-item-label>
              <q-item-caption>{{ link.caption }}</q-item-caption>
            </q-item-section>
          </q-item>
        </router-link>

        <!-- Logout link at the bottom -->
        <q-item clickable @click="logout">
          <q-item-section avatar>
            <q-icon name="exit_to_app" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Logout</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { EssentialLinkProps } from 'components/EssentialLink.vue'
const router = useRouter()

const linksList: EssentialLinkProps[] = [
  { title: 'ตารางกิจกรรม', icon: 'event', link: '/ActivitiesCalendarPage' },
  { title: 'กิจกรรมทั้งหมด', icon: 'build', link: '/ActivitiesTablePage' },
  { title: 'กิจกรรมของฉัน', icon: 'assignment_ind', link: '/MyActivitiesPage' },
  { title: 'บันทึกชั่วโมงอบรม', icon: 'history', link: '/RecordPage' },
  { title: 'ใบประกาศนียบัตร', icon: 'school', link: '/CertificateTablePage' },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

async function logout() {
  await router.push('/') // เปลี่ยนหน้าไปที่หน้าล็อกอิน
}
</script>

<style scoped>
.no-link {
  text-decoration: none;
  color: inherit;
}
</style>
