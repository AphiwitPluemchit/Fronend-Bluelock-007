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
    <q-list padding class="menu-list flex column justify-between full-height">
      <!-- <q-item-label header>เมนูแอดมิน</q-item-label> -->
      <div>
        <template v-for="link in linksList" :key="link.title">
          <!-- กรณีมี children (เมนูย่อย dropdown) -->
          <q-expansion-item
            v-if="link.children"
            :label="link.title"
            :icon="link.icon"
            :header-class="isActiveParent(link) ? 'active-menu' : ''"
            class="menu-list flex column justify-between"
          >
            <router-link
              v-for="sublink in link.children"
              :key="sublink.title"
              :to="sublink.link"
              class="no-link"
            >
              <q-item
                clickable
                v-ripple
                :class="['sub-menu-item', { 'active-menu': isActiveLink(sublink) }]"
              >
                <q-item-section>
                  {{ sublink.title }}
                </q-item-section>
              </q-item>
            </router-link>
          </q-expansion-item>

          <!-- กรณีไม่มี children -->
          <router-link v-else :to="link.link" class="no-link">
            <q-item
              clickable
              v-ripple
              class="q-pa-md q-my-md q-mr-sm"
              :class="{ 'active-menu': isActiveLink(link) }"
            >
              <q-item-section avatar>
                <q-icon :name="link.icon" />
              </q-item-section>
              <q-item-section>
                {{ link.title }}
              </q-item-section>
            </q-item>
          </router-link>
        </template>
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
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const leftDrawerOpen = ref(false)

const linksList = [
  { title: 'ตารางกิจกรรม', icon: 'event', link: '/Admin/ActivitiesCalendar' },
  { title: 'จัดการกิจกรรม', icon: 'description', link: '/Admin/ActivitiesManagement' },
  {
    title: 'จัดการนิสิต',
    icon: 'people',
    children: [
      { title: 'จัดการข้อมูลนิสิต', link: '/Admin/StudentManagement' },
      { title: 'จัดเก็บข้อมูลนิสิต', link: '/Admin/StudentStorage' },
    ],
  },
  { title: 'รายงานข้อมูล', icon: 'assessment', link: '/Admin/Report' },
  {
    title: 'จัดการใบประกาศนียบัตร',
    icon: 'school',
    children: [
      { title: 'จัดการหัวข้อการอบรม', link: '/Admin/CertificateTablePage' },
      { title: 'รายการใบประกาศนียบัตร', link: '/Admin/ManageCertificateTable' },
    ],
  },
  { title: 'จัดการฟอร์ม', icon: 'description', link: '/Admin/Forms' },
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isActiveLink = (link: any) => {
  return router.currentRoute.value.path.includes(link.link)
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isActiveParent = (parent: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return parent.children?.some((child: any) => isActiveLink(child))
}

// ฟังก์ชันเปิด/ปิด Sidebar
const toggleSidebar = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// ให้ Layout เรียกใช้งานได้
defineExpose({ toggleSidebar })
</script>

<style scoped>
.sub-menu-item {
  padding-left: 72px !important;
  margin-top: 10px !important;
}
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
.menu-list .q-item
  border-radius: 0 32px 32px 0
</style>

<style></style>
