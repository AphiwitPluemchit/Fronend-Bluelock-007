<script setup lang="ts">
import { computed, ref } from 'vue'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'

import ActivityDetailTab from './ActivityDetailTab/ActivityDetailTab.vue'
import CheckInCheckOutTab from './CheckInCheckOutTab/CheckInCheckOutTab.vue'
// import { route } from 'quasar/wrappers';

const currentBreadcrumb = computed(() => {
  if (tab.value === 'activity') return 'รายละเอียดกิจกรรม'
  if (tab.value === 'checkInOut') return 'เช็คชื่อเข้า/ออกกิจกรรม'
  return 'รายละเอียดกิจกรรม' // ค่าเริ่มต้น
})

const tab = ref<string>('activity')
const breadcrumbs = computed(() => ({
  previousPage: { title: 'กิจกรรมของฉัน', path: '/Student/MyActivitiesPage' },
  currentPage: {
    title: currentBreadcrumb.value,
    path: `/Student/ActivityTablePage/ActivityDetail`,
  },
  icon: 'description',
}))
</script>

<template>
  <q-page class="q-pa-md">
    <!-- Tabs -->
    <AppBreadcrumbs :breadcrumbs="breadcrumbs" />
    <q-tabs v-model="tab" align="right" class="custom-tabs" indicator-color="transparent">
      <q-tab name="activity" label="รายละเอียดกิจกรรม" />
      <q-tab name="checkInOut" label="เช็คชื่อเข้า/ออกกิจกรรม" />
    </q-tabs>

    <!-- Tab Panels -->
    <q-tab-panels v-model="tab" animated class="custom-panels">
      <q-tab-panel name="activity" class="q-my-md">
        <ActivityDetailTab />
      </q-tab-panel>

      <q-tab-panel name="checkInOut" class="q-my-md">
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
  padding: 20px;
  font-size: 20px;
  height: 700px;
  overflow: hidden;
}
</style>
