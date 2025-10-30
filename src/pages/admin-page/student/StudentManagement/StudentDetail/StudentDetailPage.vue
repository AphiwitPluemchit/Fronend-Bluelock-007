<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import { useStudentStore } from 'src/stores/student'
import type { Student } from 'src/types/student'
import { useHourHistoryStore } from 'src/stores/hourHistory'
import ProgramHistory from './programHistory.vue'
import CertificateHistory from './CertificateHistory.vue'
import EditHourDialog from './editHourDialog.vue'
const majorOptions = ['CS', 'AAI', 'ITDI', 'SE']
const hourHistoryStore = useHourHistoryStore()
const originalStudentData = ref<Student | null>(null)
const show = ref(false)
const route = useRoute()
const studentCode = ref(route.params.code as unknown as string)
const isEditMode = ref(route.query.edit === 'true')
const studentStore = useStudentStore()
const searchText = ref('')
const tab = ref('program')

const breadcrumbs = ref({
  previousPage: { title: 'จัดการข้อมูลนิสิต', path: '/Admin/StudentManagement' },
  currentPage: {
    title: 'รายละเอียดนิสิต',
    path: route.fullPath,
  },
  icon: 'people',
})

const showCancelDialog = ref(false)
const showEditDialog = ref(false)
const onSearch = async () => {
  hourHistoryStore.params.search = searchText.value
  hourHistoryStore.params.page = 1
  await fetchProgramHistory()
}
async function fetchProgramHistory() {
  await hourHistoryStore.fetchProgramHistories(studentStore.student.id || '')
}

const cancelEdit = () => {
  studentStore.student = { ...originalStudentData.value } as Student
  isEditMode.value = false
}

const enableEditMode = () => {
  isEditMode.value = true
  originalStudentData.value = { ...studentStore.student }
}

const saveChanges = async () => {
  const result = await studentStore.updateStudent(studentStore.student)
  if (result) {
    isEditMode.value = false
  }
}
const openEditDialog = () => {
  showEditDialog.value = true
}
const confirmCancel = () => {
  showCancelDialog.value = true
}

const onHourDialogSaved = async () => {
  // Refresh student data and hour history after saving
  if (studentCode.value) {
    await studentStore.getSummaryByCodeWithHours(studentCode.value)
    await fetchProgramHistory()
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
const DEBOUNCE_MS = 300

watch(searchText, () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
  searchTimer = setTimeout(() => {
    void onSearch()
    searchTimer = null
  }, DEBOUNCE_MS)
})

onUnmounted(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
})
onMounted(async () => {
  show.value = false
  if (!studentCode.value) return
  // await studentStore.getStudentByCode(studentCode.value)
  await studentStore.getSummaryByCodeWithHours(studentCode.value)

  originalStudentData.value = { ...studentStore.student }
  await fetchProgramHistory()

  console.log(hourHistoryStore.histories)

  show.value = true
})
</script>

<template>
  <q-page class="q-pa-md">
    <div style="margin-top: 20px">
      <AppBreadcrumbs :breadcrumbs="breadcrumbs" />
    </div>
    <div class="q-mb-lg" v-if="show">
      <q-card flat class="q-mt-lg">
        <div class="row q-col-gutter-md">
          <!-- แถวข้อมูลนิสิต -->
          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md"><p class="q-my-none">ชื่อ :</p></div>
            <div class="col-4">
              <q-input
                v-model="studentStore.student.name"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
                class="qinput"
                borderless
                dense
              />
            </div>
            <div class="col-2 text-right q-pr-md"><p class="q-my-none">Email :</p></div>
            <div class="col-4">
              <q-input
                v-model="studentStore.student.email"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
                class="qinput"
                borderless
                dense
              />
            </div>
          </div>

          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md"><p class="q-my-none">รหัสนิสิต :</p></div>
            <div class="col-4">
              <q-input
                v-model="studentStore.student.code"
                class="readonly qinput"
                readonly
                borderless
                dense
              />
            </div>
            <div class="col-2 text-right q-pr-md">
              <p class="q-my-none">ชั่วโมงเตรียมความพร้อม :</p>
            </div>
            <div class="col-4">
              <q-input
                v-model="studentStore.student.softSkill"
                :readonly="!isEditMode"
                class="readonly qinput"
                disable
                borderless
                dense
                type="number"
              />
            </div>
          </div>

          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md"><p class="q-my-none">สาขา :</p></div>

            <div class="col-4">
              <q-select
                v-if="isEditMode"
                v-model="studentStore.student.major"
                :options="majorOptions"
                dense
                outlined
                emit-value
                map-options
              />
              <q-input
                v-else
                v-model="studentStore.student.major"
                readonly
                class="readonly qinput"
                borderless
                dense
              />
            </div>
            <div class="col-2 text-right q-pr-md">
              <p class="q-my-none">ชั่วโมงทักษะทางวิชาการ :</p>
            </div>
            <div class="col-4">
              <q-input
                v-model="studentStore.student.hardSkill"
                :readonly="!isEditMode"
                class="readonly qinput"
                disable
                borderless
                dense
                type="number"
              />
            </div>
          </div>
        </div>
      </q-card>
      <div class="q-mt-md q-pa-md text-right">
        <template v-if="!isEditMode">
          <q-btn label="แก้ไข" class="btnedit" unelevated rounded @click="enableEditMode" />
        </template>
        <template v-else>
          <q-btn
            label="ยกเลิก"
            class="btnreject q-mr-md"
            unelevated
            rounded
            @click="confirmCancel"
          ></q-btn>
          <q-btn label="บันทึก" class="btnconfirm" unelevated rounded @click="saveChanges" />
        </template>
      </div>

      <div class="q-mb-md q-mt-xl">
        <!-- <q-card bordered class="rounded-borders shadow-2 full-height"> -->
        <div class="row justify-between items-center q-mb-sm" style="margin-top: 20px">
          <div class="textsubtitle">ประวัติการอบรม</div>
          <q-btn
            v-if="isEditMode"
            dense
            outlined
            label="เพิ่มชั่วโมง"
            class="btnadd"
            style="width: 130px"
            @click="openEditDialog"
          >
          </q-btn>
        </div>
        <div>
          <q-tabs v-model="tab" align="right" class="custom-tabs" indicator-color="transparent">
            <q-tab name="program" label="โครงการ" />
            <q-tab name="certificate" label="ใบรับรอง" />
          </q-tabs>

          <q-tab-panels v-model="tab" animated class="custom-panels">
            <q-tab-panel name="program" class="q-my-none">
              <ProgramHistory
                v-if="studentStore.student?.id"
                :student-id="studentStore.student.id"
                :key="studentStore.student.id"
              />
            </q-tab-panel>
            <q-tab-panel name="certificate" class="q-my-none">
              <CertificateHistory
                v-if="studentStore.student?.id"
                :student-id="studentStore.student.id"
                :key="studentStore.student.id"
              />
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>

    <!-- Dialog -->
    <EditHourDialog v-model="showEditDialog" @saved="onHourDialogSaved"></EditHourDialog>
    <q-dialog v-model="showCancelDialog">
      <q-card
        style="
          background-color: white;
          width: 600px;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
        "
      >
        <q-card-section><div class="text-h6">ยืนยันการยกเลิก</div></q-card-section>
        <q-card-section
          >คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการแก้ไข?
          การเปลี่ยนแปลงทั้งหมดจะไม่ถูกบันทึก</q-card-section
        >
        <q-card-actions align="right">
          <q-btn flat label="ยกเลิก" class="btnreject q-mr-md" v-close-popup />
          <q-btn flat label="ยืนยัน" class="btnconfirm" @click="cancelEdit" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped>
.search-filter-wrapper {
  flex-wrap: wrap;
}

.negative-hours {
  color: #f03b2d;
}
.filter-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
.qinput {
  border: 1px solid #757575;
  border-radius: 5px;
  padding-left: 10px;
}

.readonly {
  background-color: #e4e4e4;
  color: #757575;
}
.editable {
  background-color: white;
}

.custom-tabs .q-tab--active,
.custom-tabs .q-tab:hover {
  background-color: #edf0f5 !important;
  border-radius: 12px 12px 0 0;
  color: rgb(0, 0, 0);
}
.custom-panels {
  background-color: #edf0f5;
  height: 100%;
}

/* Ensure tabs stay rounded on all interaction states (hover, focus, active, keyboard focus)
   Quasar may add focus/active styles that override border-radius; force rounded corners
   and remove default outlines/box-shadows that produce square visuals. */
.custom-tabs .q-tab {
  border-radius: 12px 12px 0 0 !important;
  overflow: hidden;
}
.custom-tabs .q-tab,
.custom-tabs .q-tab:hover,
.custom-tabs .q-tab:active,
.custom-tabs .q-tab:focus,
.custom-tabs .q-tab:focus-visible,
.custom-tabs .q-tab--active,
.custom-tabs .q-tab--active:focus,
.custom-tabs .q-tab--active:active {
  border-radius: 12px 12px 0 0 !important;
  outline: none !important;
  box-shadow: none !important;
}

/* If Quasar inserts inner elements that receive focus, make sure they don't show square outlines */
.custom-tabs .q-focus-helper,
.custom-tabs .q-focus-helper:before,
.custom-tabs .q-focus-helper:after {
  outline: none !important;
  box-shadow: none !important;
}

@media (max-width: 600px) {
  .search-filter-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .searchbox {
    width: 100%;
  }
}
</style>
