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

const currentBreadcrumb = computed(() => {
  if (tab.value === 'activity') return 'รายละเอียดกิจกรรม'
  if (tab.value === 'registration') return 'รายละเอียดการลงทะเบียน'
  if (tab.value === 'students') return 'รายชื่อนิสิต'
  if (tab.value === 'summary') return 'สรุปผลกิจกรรม'
  return 'รายละเอียดกิจกรรม' // ค่าเริ่มต้น
})
onMounted(async () => {
  const id = route.params.id as string
  const res = await ActivityService.getOne(id)
  console.log('📦 ได้ activity:', res)
  activity.value = res.data
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
</script>

<template>
  <q-page class="q-pa-md">
    <div style="margin-top: 20px;">
    <AppBreadcrumbs :breadcrumbs="breadcrumbs" />

    <!-- Tabs -->
    <q-tabs v-model="tab" align="right" class="custom-tabs" indicator-color="transparent">
      <q-tab name="activity" label="รายละเอียดกิจกรรม" />
      <q-tab name="registration" label="รายละเอียดการลงทะเบียน" :disable="isPlanning" />
      <q-tab name="students" label="รายชื่อนิสิต" :disable="isPlanning" />
      <q-tab name="summary" label="สรุปผลกิจกรรม" :disable="isPlanning" />
    </q-tabs>

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
.breadcrumb-text {
  color: black !important;
}

.active-breadcrumb {
  text-decoration: underline;
  color: black;
}

.q-tabs {
  max-width: 100%;
  margin-left: 20px;
}

.custom-tabs {
  background-color: transparent;
  border-bottom: none !important;
}

.custom-tabs .q-tab--active,
.custom-tabs .q-tab:hover {
  background-color: #edf0f5 !important;
  border-radius: 12px 12px 0 0;
}

.custom-panels {
  max-width: 1600px;
  max-height: 680px;
}
@media(max-width: 1650px) {
  .custom-panels {
  max-height: unset;
}
}
</style>
