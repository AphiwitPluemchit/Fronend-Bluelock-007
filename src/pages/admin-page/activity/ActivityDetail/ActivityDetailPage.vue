<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Activity } from 'src/types/activity'
import { ActivityService } from 'src/services/activity'
import Tab_Summary from './Summary/Tab_Summary.vue'
import Tab_StudentList from './StudentList/Tab_StudentList.vue'
import Tab_ActivityDetail from './ActivityDetail/Tab_ActivityDetail.vue'
import Tab_EnrollmentDetail from './EnrollmentDetail/Tab_EnrollmentDetail.vue'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'

const route = useRoute()
const router = useRouter()

const activity = ref<Activity | null>(null)
const tab = ref<string>('') // จะ sync จาก URL
const search = ref<string>('')

/** ---------- เงื่อนไข disable ---------- */
// 1) มาจาก query: ?disable=true|false
const disableFromQuery = computed(() => String(route.query.disable) === 'true')
// 2) มาจากสถานะกิจกรรม (planning)
const isPlanning = computed(() => activity.value?.activityState === 'planning')
// 3) รวมทุกเงื่อนไข
const isDisabled = computed(() => disableFromQuery.value || isPlanning.value)

/** ---------- responsive ---------- */
const isSmallScreen = ref(false)
const checkScreen = () => {
  const width = window.innerWidth
  isSmallScreen.value = width <= 610
}

/** ---------- tab ที่รองรับ ---------- */
const VALID_TABS = ['activity', 'registration', 'students', 'summary'] as const

/** อ่าน tab จาก URL → ใส่ลง state */
const syncTabFromRoute = () => {
  const fromParam = (route.params.tab as string) || 'activity'
  const normalized = VALID_TABS.includes(fromParam as (typeof VALID_TABS)[number])
    ? fromParam
    : 'activity'
  if (tab.value !== normalized) tab.value = normalized
}

/** state tab เปลี่ยน → อัปเดต URL (คง query/hash เดิมไว้) */
const pushTabToRoute = async (nextTab: string) => {
  if (!VALID_TABS.includes(nextTab as (typeof VALID_TABS)[number])) return
  const id = route.params.id as string
  await router
    .replace({
      name: 'ActivityDetail',
      params: { ...route.params, id, tab: nextTab },
      query: { ...route.query }, // preserve query (เช่น disable)
      hash: route.hash,
    })
    .catch(() => {}) // กัน duplicated navigation
}

/** breadcrumb */
const currentBreadcrumb = computed(() => {
  if (tab.value === 'activity') return 'รายละเอียดกิจกรรม'
  if (tab.value === 'registration') return 'รายละเอียดการลงทะเบียน'
  if (tab.value === 'students') return 'รายชื่อนิสิต'
  if (tab.value === 'summary') return 'สรุปผลกิจกรรม'
  return 'รายละเอียดกิจกรรม'
})

const breadcrumbs = computed(() => {
  const id = route.params.id as string
  return {
    previousPage: { title: 'จัดการกิจกรรม', path: '/Admin/ActivitiesManagement' },
    currentPage: {
      title: currentBreadcrumb.value,
      path: `/Admin/ActivitiesManagement/ActivityDetail/${id}/${tab.value}`,
    },
    icon: 'edit_calendar',
  }
})

/** ---------- lifecycle ---------- */
onMounted(async () => {
  const id = route.params.id as string
  const res = await ActivityService.getOne(id)
  activity.value = res.data

  // sync tab จาก URL ครั้งแรก
  syncTabFromRoute()

  // ถ้า URL ไม่มี tab ให้ใส่ activity เป็นค่าเริ่มต้น
  if (!route.params.tab) {
    tab.value = 'activity'
    void pushTabToRoute('activity')
  }

  // ถ้าโดน disable (query/planning) บังคับกลับ activity
  if (isDisabled.value && tab.value !== 'activity') {
    tab.value = 'activity'
    void pushTabToRoute('activity')
  }
})

onMounted(() => {
  checkScreen()
  window.addEventListener('resize', checkScreen)
})

/** ---------- watchers ---------- */
// เมื่อ tab ใน state เปลี่ยน → อัปเดต URL (และ enforce disable)
watch(tab, (next) => {
  if (isDisabled.value && next !== 'activity') {
    tab.value = 'activity'
    void pushTabToRoute('activity')
    return
  }
  const inUrl = route.params.tab as string
  if (next !== inUrl) void pushTabToRoute(next)
})

// เมื่อ URL เปลี่ยน (Back/Forward) → sync เข้า state และ enforce disable
watch(
  () => route.params.tab,
  () => {
    syncTabFromRoute()
    if (isDisabled.value && tab.value !== 'activity') {
      tab.value = 'activity'
      void pushTabToRoute('activity')
    }
  },
)

/** dropdown options (จอเล็ก) */
const tabOptions = computed(() => [
  { label: 'รายละเอียดกิจกรรม', value: 'activity', disable: false },
  { label: 'รายละเอียดการลงทะเบียน', value: 'registration', disable: isDisabled.value },
  { label: 'รายชื่อนิสิต', value: 'students', disable: isDisabled.value },
  { label: 'สรุปผลกิจกรรม', value: 'summary', disable: isDisabled.value },
])
</script>

<template>
  <q-page class="q-pa-md">
    <div style="margin-top: 20px">
      <AppBreadcrumbs :breadcrumbs="breadcrumbs" />

      <div class="tab-scroll-wrapper">
        <!-- จอใหญ่ -->
        <q-tabs
          v-if="!isSmallScreen"
          v-model="tab"
          align="left"
          dense
          class="tab-no-arrow"
          indicator-color="transparent"
        >
          <q-tab name="activity" label="รายละเอียดกิจกรรม" />
          <q-tab name="registration" label="รายละเอียดการลงทะเบียน" :disable="isDisabled" />
          <q-tab name="students" label="รายชื่อนิสิต" :disable="isDisabled" />
          <q-tab name="summary" label="สรุปผลกิจกรรม" :disable="isDisabled" />
        </q-tabs>

        <!-- จอเล็ก -->
        <q-select
          v-else
          v-model="tab"
          :options="tabOptions"
          emit-value
          map-options
          label="เลือกหัวข้อ"
          dense
          outlined
          class="q-mb-md"
          style="min-width: 250px"
          menu-anchor="bottom start"
          menu-self="top start"
          :popup-content-style="{ maxHeight: '200px', overflowY: 'auto' }"
        />
      </div>

      <q-tab-panels v-model="tab" animated class="custom-panels">
        <q-tab-panel name="activity" class="q-my-md">
          <Tab_ActivityDetail
            v-if="activity"
            :activity="activity"
            @update-activity="(updated) => (activity = updated)"
          />
        </q-tab-panel>

        <q-tab-panel name="registration" class="q-my-md">
          <Tab_EnrollmentDetail :activity="activity" />
        </q-tab-panel>

        <q-tab-panel name="students" class="q-my-md">
          <Tab_StudentList :search="search" :activity="activity" />
        </q-tab-panel>

        <q-tab-panel name="summary" class="q-my-md">
          <Tab_Summary :activity="activity" />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<style scoped>
.q-tabs {
  max-width: 100%;
  margin-left: 20px;
}
.tab-scroll-wrapper {
  overflow-x: auto;
  max-width: 100%;
  white-space: nowrap;
  justify-self: end;
}
.tab-scroll-wrapper::-webkit-scrollbar {
  display: none;
}
.tab-no-arrow {
  display: flex;
}
.tab-no-arrow .q-tab {
  flex: 1 1 0;
  text-align: center;
  border-radius: 12px 12px 0 0;
  min-width: unset;
}
.tab-no-arrow .q-tab.q-tab--active {
  background-color: #edf0f5;
}
.custom-panels {
  max-height: unset;
  background-color: #edf0f5;
}
@media (max-width: 1650px) {
  .custom-panels {
    max-height: unset;
  }
}
</style>
