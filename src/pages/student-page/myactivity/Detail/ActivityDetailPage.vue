<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import ActivityDetailTab from './ActivityDetailTab/ActivityDetailTab.vue'
import CheckInCheckOutTab from './CheckInCheckOutTab/CheckInCheckOutTab.vue'

const route = useRoute()
const router = useRouter()

// แท็บที่รองรับ
const VALID_TABS = ['activity', 'checkInOut'] as const

// state ของแท็บ (จะ sync กับ URL)
const tab = ref<string>('') // จะตั้งค่าจาก URL ตอน mount

// อ่าน tab จาก URL → ใส่ state (รองรับ default)
const syncTabFromRoute = () => {
  const fromParam = (route.params.tab as string) || 'activity'
  const normalized = VALID_TABS.includes(fromParam as typeof VALID_TABS[number]) ? fromParam : 'activity'
  if (tab.value !== normalized) tab.value = normalized
}

// state tab เปลี่ยน → อัปเดต URL (คง query/hash เดิม)
const pushTabToRoute = async (nextTab: string) => {
  if (!VALID_TABS.includes(nextTab as typeof VALID_TABS[number])) return
  const id = route.params.id as string
  await router.replace({
    name: 'MyActivityDetail',
    params: { ...route.params, id, tab: nextTab },
    query: { ...route.query },
    hash: route.hash,
  }).catch(() => {}) // กัน duplicated navigation error
}

// ชื่อ breadcrumb
const currentBreadcrumb = computed(() => {
  if (tab.value === 'activity') return 'รายละเอียดกิจกรรม'
  if (tab.value === 'checkInOut') return 'เช็คชื่อเข้า/ออกกิจกรรม'
  return 'รายละเอียดกิจกรรม'
})

// ลิงก์ breadcrumb (อ้างจากชื่อ route + params ให้ชัวร์)
const breadcrumbPath = computed(() => {
  const id = route.params.id as string
  return router.resolve({
    name: 'MyActivityDetail',
    params: { id, tab: tab.value || 'activity' },
  }).href
})

const breadcrumbs = computed(() => ({
  previousPage: { title: 'กิจกรรมของฉัน', path: '/Student/MyActivitiesPage' },
  currentPage: { title: currentBreadcrumb.value, path: breadcrumbPath.value },
  icon: 'description',
}))

onMounted(() => {
  // sync ครั้งแรก
  syncTabFromRoute()

  // ถ้า URL ไม่มี :tab ให้เติมค่าเริ่มต้น
  if (!route.params.tab) {
    tab.value = 'activity'
    void pushTabToRoute('activity')
  }
})

// เมื่อ tab ใน state เปลี่ยน → อัปเดต URL
watch(tab, (next) => {
  const inUrl = route.params.tab as string
  if (next !== inUrl) void pushTabToRoute(next)
})

// เมื่อ URL เปลี่ยน (Back/Forward) → sync เข้า state
watch(
  () => route.params.tab,
  () => { syncTabFromRoute() }
)
</script>

<template>
  <q-page class="q-pa-md">
    <AppBreadcrumbs :breadcrumbs="breadcrumbs" />

    <q-tabs v-model="tab" align="right" class="custom-tabs" indicator-color="transparent">
      <q-tab name="activity" label="รายละเอียดกิจกรรม" />
      <q-tab name="checkInOut" label="เช็คชื่อเข้า/ออกกิจกรรม" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated class="custom-panels">
      <q-tab-panel name="activity" class="q-my-none">
        <ActivityDetailTab />
      </q-tab-panel>
      <q-tab-panel name="checkInOut" class="q-my-none">
        <CheckInCheckOutTab />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<style scoped>
.custom-tabs .q-tab--active,
.custom-tabs .q-tab:hover {
  background-color: #edf0f5 !important;
  border-radius: 12px 12px 0 0;
}
.custom-panels {
  background-color: #edf0f5;
  font-size: 20px;
  height: 700px;
  overflow: hidden;
}
</style>
