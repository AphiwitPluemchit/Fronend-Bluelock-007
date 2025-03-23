<script setup lang="ts">
import { ref } from 'vue'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'

import DetailSum from './DetailSum.vue'
// import { route } from 'quasar/wrappers';

const tab = ref<string>('activity')
const breadcrumbs = ref({
  previousPage: { title: 'กิจกรรมของฉัน', path: '/Student/ActivityTablePage' },
  currentPage: {
    title: 'รายละเอียดกิจกรรมของฉัน',
    path: `/Student/ActivityTablePage/ActivityDetail`,
  },
  icon: 'description',
})
// onMounted(async () => {
//   const id = route.params.id as string
//   const res = await ActivityService.getOne(id)
//   console.log('📦 ได้ activity:', res)
//   activity.value = res.data
// })
</script>

<template>
  <q-page class="q-pa-md">
    <!-- Tabs -->
    <AppBreadcrumbs :breadcrumbs="breadcrumbs" />
    <q-tabs v-model="tab" align="right" class="custom-tabs" indicator-color="transparent">
      <q-tab name="activity" label="อัพโหลดใบประกาศนียบัตร" />
      <q-tab name="history" label="ประวัติ" />
    </q-tabs>

    <!-- Tab Panels -->
    <q-tab-panels v-model="tab" animated class="custom-panels">
      <q-tab-panel name="activity" class="q-my-md">
        <DetailSum />
      </q-tab-panel>

      <q-tab-panel name="history" class="q-my-md">
        <!-- <RegistrationDetails :activity="activity" /> -->
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
  margin: auto;
  background-color: #edf0f5;
}
</style>
