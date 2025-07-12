<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Activity } from 'src/types/activity'
import { ActivityService } from 'src/services/activity'
import Tab_Summary from './Summary/Tab_Summary.vue'
import Tab_StudentList from './StudentList/Tab_StudentList.vue'
import Tab_ActivityDetail from './ActivityDetail/Tab_ActivityDetail.vue'
import Tab_EnrollmentDetail from './EnrollmentDetail/Tab_EnrollmentDetail.vue'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'

const route = useRoute()
const activity = ref<Activity | null>(null)
const tab = ref<string>('activity')
const search = ref<string>('')
const isPlanning = computed(() => activity.value?.activityState === 'planning')
const isSmallScreen = ref(false)
const checkScreen = () => {
  const width = window.innerWidth
  isSmallScreen.value = width <= 610
}
const currentBreadcrumb = computed(() => {
  if (tab.value === 'activity') return 'รายละเอียดกิจกรรม'
  if (tab.value === 'registration') return 'รายละเอียดการลงทะเบียน'
  if (tab.value === 'students') return 'รายชื่อนิสิต'
  if (tab.value === 'summary') return 'สรุปผลกิจกรรม'
  return 'รายละเอียดกิจกรรม'
})
onMounted(async () => {
  const id = route.params.id as string
  const res = await ActivityService.getOne(id)
  activity.value = res.data
})
onMounted(() => {
  checkScreen()
  window.addEventListener('resize', checkScreen)
})
const breadcrumbs = computed(() => ({
  previousPage: { title: 'จัดการกิจกรรม', path: '/Admin/ActivitiesManagement' },
  currentPage: {
    title: currentBreadcrumb.value,
    path: '/Admin/ActivitiesManagement/ActivityDetail',
  },
  icon: 'description',
}))
watch([tab, isPlanning], () => {
  if (isPlanning.value && tab.value !== 'activity') {
    tab.value = 'activity'
  }
})
const tabOptions = [
  { label: 'รายละเอียดกิจกรรม', value: 'activity' },
  { label: 'รายละเอียดการลงทะเบียน', value: 'registration', disable: isPlanning },
  { label: 'รายชื่อนิสิต', value: 'students', disable: isPlanning },
  { label: 'สรุปผลกิจกรรม', value: 'summary', disable: isPlanning },
]
</script>

<template>
  <q-page class="q-pa-md">
    <div style="margin-top: 20px">
      <AppBreadcrumbs :breadcrumbs="breadcrumbs" />

      <!-- Tabs -->
      <div class="tab-scroll-wrapper">
        <!-- ✅ จอใหญ่: ใช้ q-tabs -->
        <q-tabs
          v-if="!isSmallScreen"
          v-model="tab"
          align="left"
          dense
          class="tab-no-arrow"
          indicator-color="transparent"
        >
          <q-tab name="activity" label="รายละเอียดกิจกรรม" />
          <q-tab name="registration" label="รายละเอียดการลงทะเบียน" :disable="isPlanning" />
          <q-tab name="students" label="รายชื่อนิสิต" :disable="isPlanning" />
          <q-tab name="summary" label="สรุปผลกิจกรรม" :disable="isPlanning" />
        </q-tabs>

        <!-- ✅ จอเล็ก: ใช้ q-select dropdown -->
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
          style="min-width: 250px;"
          menu-anchor="bottom start"
          menu-self="top start"
            :popup-content-style="{ maxHeight: '200px', overflowY: 'auto' }"
        />
      </div>

      <!-- Tab Panels -->
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
  min-width: unset; /* ยกเลิก min-width เดิม */
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
