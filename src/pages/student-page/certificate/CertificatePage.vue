<script setup lang="ts">
import { ref } from 'vue'

import UploadCertificate from './UploadCertificate.vue'
import CertificateHistory from './UploadCertHistory.vue'

// import { route } from 'quasar/wrappers';

const tab = ref<string>('certificate')

// onMounted(async () => {
//   const id = route.params.id as string
//   const res = await ProgramService.getOne(id)
//   console.log('📦 ได้ program:', res)
//   program.value = res.data
// })
</script>

<template>
  <q-page class="q-pa-md">
    <!-- Tabs -->
    <q-tabs v-model="tab" align="right" class="custom-tabs" indicator-color="transparent">
      <q-tab name="certificate" label="อัปโหลดใบประกาศนียบัตร" />
      <q-tab name="history" label="ประวัติ" />
    </q-tabs>

    <!-- Tab Panels -->
    <q-tab-panels v-model="tab" animated class="custom-panels">
      <q-tab-panel name="certificate" class="q-my-md">
        <UploadCertificate />
      </q-tab-panel>

      <q-tab-panel name="history" class="q-my-md">
        <CertificateHistory />
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
