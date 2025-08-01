<template>
  <q-drawer
    v-model="leftDrawerOpen"
    show-if-above
    :behavior="drawerBehavior"
    side="left"
    bordered
    :width="260"
    style="font-size: 18px; font-weight: 500; margin-right: 10px; background-color: #edf0f5"
  >
    <!-- ให้ q-list เต็มความสูง และแบ่งพื้นที่ระหว่างเมนู กับ Logout -->
    <q-list padding style="" class="menu-list flex column justify-between full-height">
      <div>
        <router-link v-for="link in linksList" :key="link.title" :to="link.link" class="no-link">
          <q-item
            v-ripple
            clickable
            class="q-pa-md q-my-md q-mr-sm"
            :class="{ 'active-menu': router.currentRoute.value.path.includes(link.link) }"
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
      <q-item clickable @click="logout" class="q-pa-md q-mr-sm logout-button">
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const leftDrawerOpen = ref(false)

const linksList = [
  { title: 'ตารางกิจกรรม', icon: 'event', link: '/Student/ActivitiesCalendar' },
  { title: 'กิจกรรมทั้งหมด', icon: 'build', link: '/Student/ActivityTablePage' },
  { title: 'กิจกรรมของฉัน', icon: 'assignment_ind', link: '/Student/MyActivitiesPage' },
  { title: 'บันทึกชั่วโมงอบรม', icon: 'history', link: '/Student/RecordPage' },
  { title: 'ใบประกาศนียบัตร', icon: 'school', link: '/Student/CertificatePage' },
]

const drawerBehavior = computed(() => {
  return $q.screen.width < 1100 ? 'mobile' : 'desktop' // ถ้าหน้าจอเล็กกว่า lg (<1100px) ใช้ mobile
})

async function logout() {
  try {
    await authStore.logout()
  } catch (error) {
    console.error('Logout error:', error)
    // แม้ว่า logout จะล้มเหลว ก็ให้เคลีย localStorage และ redirect ไปหน้า login
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    await router.push('/')
  }
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
