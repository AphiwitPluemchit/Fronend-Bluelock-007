<script setup lang="ts">
import { computed, ref ,onMounted} from 'vue'
import ActivityDetailTab from './ActivityDetailTab.vue'
import StudentList from './StudentList.vue'
import RegistrationDetails from './RegistrationDetails.vue'
import SummaryResult from './SummaryResult.vue'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import { useRoute } from 'vue-router'
import { ActivityService } from 'src/services/activity'
import type { Activity } from 'src/types/activity'
// import { route } from 'quasar/wrappers';
const route = useRoute()
const activity = ref<Activity | null>(null)
const tab = ref<string>('activity')
const search = ref<string>('')

// const router = useRouter()

// const goToActivitiesManagement = async () => {
//   await router.push('/ActivitiesManagement')
// }

// Breadcrumb ตามแท็บที่เลือก
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
</script>

<template>
  <q-page class="q-pa-md">
    <AppBreadcrumbs :breadcrumbs="breadcrumbs" />

    <!-- Tabs -->
    <q-tabs v-model="tab" align="right" class="custom-tabs" indicator-color="transparent">
      <q-tab name="activity" label="รายละเอียดกิจกรรม" />
      <q-tab name="registration" label="รายละเอียดการลงทะเบียน" />
      <q-tab name="students" label="รายชื่อนิสิต" />
      <q-tab name="summary" label="สรุปผลกิจกรรม" />
    </q-tabs>

    <!-- Tab Panels -->
    <q-tab-panels v-model="tab" animated class="custom-panels">
      <q-tab-panel name="activity" class="q-my-md">
        <ActivityDetailTab 
        v-if="activity"
        :activity="activity"/>
      </q-tab-panel>

      <q-tab-panel name="registration" class="q-my-md">
        <RegistrationDetails :activity="activity" />
      </q-tab-panel>

      <q-tab-panel name="students" class="q-my-md">
        <StudentList :search="search" :activity="activity" />
      </q-tab-panel>

      <q-tab-panel name="summary" class="q-my-md">
        <SummaryResult :activity="activity" />
      </q-tab-panel>
    </q-tab-panels>
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
  margin: auto;
  background-color: #edf0f5;
  max-height: 680px;
}
</style>
