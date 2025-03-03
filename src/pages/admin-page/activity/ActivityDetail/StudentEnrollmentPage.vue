<script setup lang="ts">
import { computed, ref } from 'vue';
import FilterSearchStudentList from './FilterSearchStudentList.vue';
import TableStudentList from './TableStudentList.vue';
import RegistrationDetails from './RegistrationDetails.vue';
import { useRouter } from 'vue-router';
import SummaryResult from './SummaryResult.vue';

// import { route } from 'quasar/wrappers';

const tab = ref<string>('students');
const search = ref<string>('');

const router = useRouter()

const goToActivitiesManagement = async () => {
  await router.push('/ActivitiesManagement')
}

// Breadcrumb ตามแท็บที่เลือก
const currentBreadcrumb = computed(() => {
  if (tab.value === "activity") return "รายละเอียดกิจกรรม";
  if (tab.value === "registration") return "รายละเอียดการลงทะเบียน";
  if (tab.value === "students") return "รายชื่อนิสิต";
  if (tab.value === "summary") return "สรุปผลกิจกรรม";
  return "รายละเอียดกิจกรรม"; // ค่าเริ่มต้น
});

// กำหนด breadcrumb ตาม route ปัจจุบัน
// const currentBreadcrumb = computed(() => {
//   switch (route.name) {
//     case "activity":
//       return "รายละเอียดกิจกรรม";
//     case "registration":
//       return "รายละเอียดการลงทะเบียน";
//     case "students":
//       return "รายชื่อนิสิต";
//     case "summary":
//       return "สรุปผลกิจกรรม";
//     default:
//       return "จัดการกิจกรรม";
//   }
// });

</script>

<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs class="q-mb-md breadcrumbs-custom" separator="">
      <q-breadcrumbs-el>
        <img src="src/pages/admin-page/activity/icon pics/compose.png" alt="icon" width="18" height="18"
          class="q-mr-sm" />
        <a @click="goToActivitiesManagement" style="cursor: pointer; text-decoration: none; color: black">
          จัดการกิจกรรม
        </a>
      </q-breadcrumbs-el>

      <q-breadcrumbs-separator>
        <q-icon name="chevron_right" size="18px" color="black" />
      </q-breadcrumbs-separator>

      <!-- ทำให้ breadcrumb เปลี่ยนตาม tab ที่เลือก -->
      <q-breadcrumbs-el :label="currentBreadcrumb" :class="{ 'active-breadcrumb': true }" />
    </q-breadcrumbs>



    <!-- หัวข้อแสดงอยู่ข้างบน-->
    <div class="q-mb-md text-left text-h6 page-title">
      <span v-if="tab === 'students'">รายชื่อนิสิต</span>
      <span v-else-if="tab === 'activity'">รายละเอียดกิจกรรม</span>
      <span v-else-if="tab === 'registration'">รายละเอียดการลงทะเบียน</span>
      <span v-else-if="tab === 'summary'">สรุปผลกิจกรรม</span>
    </div>

    <!-- Tabs -->
    <q-tabs v-model="tab" align="right" class="q-mb-md">
      <q-tab name="activity" label="รายละเอียดกิจกรรม" />
      <q-tab name="registration" label="รายละเอียดการลงทะเบียน" />
      <q-tab name="students" label="รายชื่อนิสิต" />
      <q-tab name="summary" label="สรุปผลกิจกรรม" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="activity">
        <div class="text-center text-h6"></div>
      </q-tab-panel>

      <q-tab-panel name="registration">
        <RegistrationDetails />
      </q-tab-panel>

      <q-tab-panel name="students">
        <div class="text-h6 q-mb-md"></div>

        <FilterSearchStudentList v-model:search="search" />
        <TableStudentList :search="search" />
      </q-tab-panel>

      <q-tab-panel name="summary">
        <SummaryResult />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<style scoped>
.breadcrumb-text {
  color: black !important;
}

.page-title {
  font-weight: bold !important;
}

.active-breadcrumb {
  text-decoration: underline;
  color: black;
}
</style>