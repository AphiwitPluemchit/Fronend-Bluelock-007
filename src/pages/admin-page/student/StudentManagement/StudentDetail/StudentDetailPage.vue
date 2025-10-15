<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import { useStudentStore } from 'src/stores/student'
import type { Student } from 'src/types/student'
import ProgramType from 'src/components/programType.vue'
import { useHourHistoryStore } from 'src/stores/hourHistory'
import type { HourChangeHistory } from 'src/types/hourHistory'
import HourChangeFilterDialog from 'src/components/Dialog/HourChangeFilterDialog.vue'

const majorOptions = ['CS', 'AAI', 'ITDI', 'SE']
const hourHistoryStore = useHourHistoryStore()
const originalStudentData = ref<Student | null>(null)
const show = ref(false)
const route = useRoute()
const studentCode = ref(route.params.code as unknown as string)
const isEditMode = ref(route.query.edit === 'true')
const studentStore = useStudentStore()
const searchText = ref('')
const histories = computed(() => hourHistoryStore.histories)
const loading = computed(() => hourHistoryStore.loading)
const selectedFilters = ref({ skillType: [] as string[], status: [] as string[] })

const breadcrumbs = ref({
  previousPage: { title: 'จัดการข้อมูลนิสิต', path: '/Admin/StudentManagement' },
  currentPage: {
    title: 'รายละเอียดนิสิต',
    path: route.fullPath,
  },
  icon: 'people',
})

const showFilterDialog = ref(false)
const selectedType = ref<string[]>([])

function applyFilters(selected: { categoryProgram: string[] }) {
  selectedType.value = selected.categoryProgram
  showFilterDialog.value = false
}
const filteredHistories = computed(() => {
  if (!selectedFilters.value.skillType || selectedFilters.value.skillType.length === 0)
    return histories.value
  return histories.value.filter((h) => selectedFilters.value.skillType.includes(h.skillType))
})
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

const showCancelDialog = ref(false)
const confirmCancel = () => {
  showCancelDialog.value = true
}

const cancelEdit = () => {
  studentStore.student = { ...originalStudentData.value } as Student
  isEditMode.value = false
}
const formatDateTime = (iso?: string) => {
  if (!iso) return '-'
  const d = new Date(iso)
  try {
    return d.toLocaleString('th-TH', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      // hour: '2-digit',
      // minute: '2-digit',
    })
  } catch {
    return d.toISOString()
  }
}
const typeStripeClass = (history: HourChangeHistory) => {
  return history.skillType === 'hard' ? 'stripe--blue' : 'stripe--green'
}
const onSearch = async () => {
  hourHistoryStore.params.search = searchText.value
  hourHistoryStore.params.page = 1
  await fetchProgramHistory()
}
async function fetchProgramHistory() {
  await hourHistoryStore.fetchProgramHistories(studentStore.student.id || '')
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
  await studentStore.getStudentByCode(studentCode.value)
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
    <div class="q-mb-lg">
      <q-card flat class="q-mt-lg">
        <div v-if="show" class="row q-col-gutter-md">
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
                :class="isEditMode ? 'editable' : 'readonly'"
                class="qinput"
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
                :class="isEditMode ? 'editable' : 'readonly'"
                class="qinput"
                borderless
                dense
                type="number"
              />
            </div>
          </div>
        </div>
      </q-card>

      <q-card flat class="q-mt-md q-mx-md">
        <!-- ส่วนประวัติการอบรม -->
        <div class="q-pa-md">
          <div class="header-container q-mb-md" style="margin-top: 12px">
            <div class="text-h6 q-mt-lg text-center">ประวัติการอบรม</div>
            <!-- ค้นหา/ฟิลเตอร์ -->
          </div>

          <div
            class="row justify-between items-right q-mb-md search-filter-wrapper q-col-gutter-md"
          >
            <div class="text-h6"></div>
            <div class="row search-filter-inner items-center no-wrap">
              <q-input
                dense
                outlined
                v-model="searchText"
                placeholder="ค้นหา ชื่อโครงการ"
                class="q-mr-sm searchbox"
                :style="{ boxShadow: 'none' }"
                clearable
                @keyup.enter="onSearch"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>

              <div class="filter-btn-wrapper">
                <HourChangeFilterDialog @apply="applyFilters" />
              </div>
            </div>
          </div>

          <div class="column q-gutter-md">
            <!-- Loading -->
            <div v-if="loading" class="row justify-center q-my-lg">
              <q-spinner color="primary" size="3em" />
            </div>

            <!-- การ์ดต่อกิจกรรม -->
            <template v-else-if="filteredHistories && filteredHistories.length > 0">
              <q-card
                v-for="history in filteredHistories"
                :key="history.id"
                class="program-card cursor-pointer"
                flat
                bordered
              >
                <div class="program-card__stripe" :class="typeStripeClass(history)"></div>

                <q-card-section class="q-pt-md q-pb-sm">
                  <div class="row items-center justify-between q-mb-sm">
                    <div class="row items-center q-gutter-xs">
                      <EnrollmentType :status="/* map to numeric if needed */ 1" />
                    </div>
                    <ProgramType
                      v-if="history.skillType === 'hard' || history.skillType === 'soft'"
                      :skill="history.skillType === 'hard' ? 'hardSkill' : 'softSkill'"
                    />
                  </div>

                  <div
                    class="text-weight-medium text-body1 ellipsis-2 q-mb-sm"
                    :title="history.title"
                  >
                    {{ history.title }}
                  </div>

                  <div class="text-weight-medium text-subtitle2 ellipsis-2 q-mb-xs label">
                    <q-icon name="event" size="18px" />
                    วันที่อนุมัติ : {{ history.changeAt ? formatDateTime(history.changeAt) : '-' }}
                  </div>

                  <div class="text-weight-medium text-subtitle2 ellipsis-2 q-mb-xs label">
                    <q-icon name="schedule" size="18px" />
                    จำนวนชั่วโมง : {{ history.hourChange }}
                  </div>
                </q-card-section>
              </q-card>
            </template>

            <!-- Empty State -->
            <div v-else class="row justify-center q-my-lg">
              <div class="text-center">
                <q-icon name="assignment" size="4em" color="grey-5" />
                <div class="text-h6 text-grey-6 q-mt-md">ไม่พบประวัติโครงการ</div>
                <div class="text-caption text-grey-5">ยังไม่มีการบันทึกโครงการในระบบ</div>
              </div>
            </div>
          </div>
        </div>
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
            />
            <q-btn label="บันทึก" class="btnconfirm" unelevated rounded @click="saveChanges" />
          </template>
        </div>
      </q-card>
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
