<template>
  <q-drawer
    v-model="leftDrawerOpen"
    show-if-above
    behavior="desktop"
    side="left"
    bordered
    :width="260"
    style="font-size: 18px; font-weight: 500; margin-right: 10px"
  >
    <!-- ให้ q-list เต็มความสูง และแบ่งพื้นที่ระหว่างเมนู กับ Logout -->
    <q-list padding style="" class="menu-list flex column justify-between full-height q-pt-sm">
      <div>
        <router-link v-for="link in linksList" :key="link.title" :to="link.link" class="no-link">
          <q-item
            v-ripple
            clickable
            class="q-pa-md q-my-md q-mr-sm"
            :class="{ 'active-menu': router.currentRoute.value.path === link.link }"
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.title }}</q-item-label>
            </q-item-section>
          </q-item>
        </router-link>
      </div>

      <!-- q-space ดันปุ่ม Logout ไปด้านล่าง -->
      <q-space />
      <q-item clickable @click="logout" class="q-pa-md q-my-md q-mr-sm logout-button">
        <q-item-section avatar>
          <q-icon name="exit_to_app" />
        </q-item-section>
        <q-item-section>
          <q-item-label>ออกจากระบบ</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const leftDrawerOpen = ref(false)

const linksList = [
  { title: 'ตารางกิจกรรม', icon: 'event', link: '/ActivitiesCalendarPage' },
  { title: 'กิจกรรมทั้งหมด', icon: 'build', link: '/ActivityTablePage' },
  { title: 'กิจกรรมของฉัน', icon: 'assignment_ind', link: '/MyActivitiesPage' },
  { title: 'บันทึกชั่วโมงอบรม', icon: 'history', link: '/RecordPage' },
  { title: 'ใบประกาศนียบัตร', icon: 'school', link: '/CertificateTablePage' },
]

async function logout() {
  await router.push('/')
}

// ฟังก์ชันเปิด/ปิด Sidebar
const toggleSidebar = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// ให้ Layout เรียกใช้งานได้
defineExpose({ toggleSidebar })
</script>

<style scoped>
/* ปิดขีดเส้นใต้ของ router-link */
.no-link {
  text-decoration: none;
  color: inherit;
}

/* ทำให้ Hover เปลี่ยนสี */
.menu-list .q-item:hover {
  background-color: rgba(236, 236, 236, 0.021);
}

/* ปุ่มที่ถูกเลือกให้เป็นสี primary */
.active-menu {
  background-color: var(--q-primary) !important;
  color: white !important;
}

/* ปรับสีของไอคอนใน active menu */
.active-menu .q-icon {
  color: white !important;
}

/* ทำให้ปุ่ม Logout เปลี่ยนสีเป็นแดงเมื่อ Hover */
.logout-button:hover {
  background-color: #ff2222d7 !important; /* สีแดง */
  color: white !important;
  transition: background-color 0.3s ease;
}

/* ปรับสีไอคอนของ Logout เมื่อ Hover */
.logout-button:hover .q-icon {
  color: white !important;
}
</style>

<style lang="sass" scoped>
/* กำหนด Border Radius ให้ q-item */
.menu-list .q-item
  border-radius: 0 32px 32px 0
</style>
