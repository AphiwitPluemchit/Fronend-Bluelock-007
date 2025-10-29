<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import { useStudentStore } from 'src/stores/student'
import type { Student, StudentLegacyHours } from 'src/types/student'
import { useHourHistoryStore } from 'src/stores/hourHistory'
import ProgramHistory from './programHistory.vue'
import CertificateHistory from './CertificateHistory.vue'

const majorOptions = ['CS', 'AAI', 'ITDI', 'SE']
const hourHistoryStore = useHourHistoryStore()
const originalStudentData = ref<Student | null>(null)
const originalLegacyHours = ref<{ softSkill: number; hardSkill: number } | null>(null)
const show = ref(false)
const route = useRoute()
const studentCode = ref(route.params.code as unknown as string)
const isEditMode = ref(route.query.edit === 'true')
const studentStore = useStudentStore()
const searchText = ref('')
const tab = ref('program')

// เพิ่ม state สำหรับ legacy hours
const legacyHours = ref<{ softSkill: number; hardSkill: number }>({ softSkill: 0, hardSkill: 0 })
const studentLegacyData = ref<StudentLegacyHours | null>(null)

const breadcrumbs = ref({
  previousPage: { title: 'จัดการข้อมูลนิสิต', path: '/Admin/StudentManagement' },
  currentPage: {
    title: 'รายละเอียดนิสิต',
    path: route.fullPath,
  },
  icon: 'people',
})

const showCancelDialog = ref(false)

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
  legacyHours.value = { ...originalLegacyHours.value } as { softSkill: number; hardSkill: number }
  isEditMode.value = false
}

const enableEditMode = () => {
  isEditMode.value = true
  originalStudentData.value = { ...studentStore.student }
  originalLegacyHours.value = { ...legacyHours.value }
}

const saveChanges = async () => {
  try {
    // อัปเดต legacy hours ก่อน
    const legacyResult = await studentStore.updateLegacyHours(
      studentStore.student.code,
      legacyHours.value,
    )

    // อัปเดตข้อมูลนิสิต
    const studentResult = await studentStore.updateStudent(studentStore.student)

    if (legacyResult && studentResult) {
      // รีโหลดข้อมูลใหม่เพื่อให้ total hours อัปเดต
      await loadStudentData()
      isEditMode.value = false
    }
  } catch (error) {
    console.error('Error saving changes:', error)
  }
}

const confirmCancel = () => {
  showCancelDialog.value = true
}

// เพิ่มฟังก์ชันโหลดข้อมูลนิสิต
const loadStudentData = async () => {
  if (!studentCode.value) return

  // โหลดข้อมูลทั่วไปของนิสิต
  await studentStore.getSummaryByCodeWithHours(studentCode.value)

  // โหลดข้อมูล legacy hours แยกต่างหาก
  try {
    const legacyData = await studentStore.getLegacyHours(studentCode.value)
    studentLegacyData.value = legacyData
    legacyHours.value = {
      softSkill: legacyData.legacyHours.softSkill,
      hardSkill: legacyData.legacyHours.hardSkill,
    }
  } catch (error) {
    console.error('Error loading legacy hours:', error)
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

  // โหลดข้อมูลนิสิตและ legacy hours
  await loadStudentData()

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
              <p class="q-my-none">ชั่วโมงเตรียมความพร้อม (Legacy) :</p>
            </div>
            <div class="col-4">
              <q-input
                v-model.number="legacyHours.softSkill"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
                class="qinput"
                borderless
                dense
                type="number"
                hint="ชั่วโมงจากระบบเก่า - สามารถแก้ไขได้"
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
              <p class="q-my-none">ชั่วโมงทักษะทางวิชาการ (Legacy) :</p>
            </div>
            <div class="col-4">
              <q-input
                v-model.number="legacyHours.hardSkill"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
                class="qinput"
                borderless
                dense
                type="number"
                hint="ชั่วโมงจากระบบเก่า - สามารถแก้ไขได้"
              />
            </div>
          </div>

          <!-- แสดง Total Hours (Read-only) -->
          <div class="col-12 q-pa-sm">
            <q-separator class="q-my-md" />
            <p class="text-subtitle2 text-bold q-mb-md text-blue-8">
              ชั่วโมงรวมทั้งหมด (อ่านอย่างเดียว)
            </p>
          </div>

          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md">
              <p class="q-my-none text-blue-8">รวมเตรียมความพร้อม :</p>
            </div>
            <div class="col-4">
              <q-input
                :model-value="studentLegacyData?.totalHours.softSkill || 0"
                readonly
                class="readonly qinput total-hours"
                borderless
                dense
                type="number"
                hint="รวมทั้งหมดจากทุกแหล่ง"
              />
            </div>
            <div class="col-2 text-right q-pr-md">
              <p class="q-my-none text-blue-8">รวมทักษะทางวิชาการ :</p>
            </div>
            <div class="col-4">
              <q-input
                :model-value="studentLegacyData?.totalHours.hardSkill || 0"
                readonly
                class="readonly qinput total-hours"
                borderless
                dense
                type="number"
                hint="รวมทั้งหมดจากทุกแหล่ง"
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
              <CertificateHistory />
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>

    <!-- Dialog -->
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

.total-hours {
  background-color: #f0f8ff;
  border-color: #2196f3;
  font-weight: 600;
}

.total-hours .q-field__native {
  color: #1976d2;
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
