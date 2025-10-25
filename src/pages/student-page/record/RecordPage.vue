<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { StudentService } from 'src/services/student'
// import type { CheckinoutRecord } from 'src/types/checkinout'
import ProgramHistory from 'src/pages/student-page/record/programHistory.vue'
import CertificateHistory from 'src/pages/student-page/record/CertificateHistory.vue'

const auth = useAuthStore()
// const $q = useQuasar()
// const isSmallScreen = computed(() => !$q.screen.gt.xs)
const tab = ref('program')
const studentData = ref({
  name: '',
  major: '',
  email: '',
  studentId: '',
})

const academicData = ref({ current: 0, required: 12 })
const prepData = ref({ current: 0, required: 30 })

const programColors = {
  academic: {
    bgColor: '#D6E4FF',
    textColor: '#001780',
    label: 'ทักษะความรู้ทางวิชาการ',
    icon: 'school',
  },
  preparation: {
    bgColor: '#d2ffc7',
    textColor: '#009812',
    border: '#00bb16',
    label: 'ทักษะเตรียมความพร้อม',
    icon: 'book',
  },
}

const majorFullName = computed(() => {
  const majorMap: Record<string, string> = {
    CS: 'วิทยาการคอมพิวเตอร์',
    SE: 'วิศวกรรมซอฟต์แวร์',
    AAI: 'ปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ',
    ITDI: 'เทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจิทัล',
  }
  return majorMap[studentData.value.major] || studentData.value.major
})

const prepProgressRatio = computed(() =>
  Math.min(prepData.value.current / (prepData.value.required || 1), 1),
)

const academicProgressRatio = computed(() =>
  Math.min(academicData.value.current / (academicData.value.required || 1), 1),
)

const getProgressColor = (ratio: number) => {
  if (ratio >= 1) return 'positive'
  if (ratio >= 0.8) return 'orange'
  return 'negative'
}

const calculateMissingHours = (data: { current: number; required: number }) =>
  data.required > data.current ? data.required - data.current : 0

const getProgressValue = (data: { current: number; required: number }) =>
  data.required ? (data.current / data.required) * 100 : 0

onMounted(async () => {
  const code = auth.getUser?.code
  if (!code) return

  try {
    // ใช้ API ใหม่ที่ดึงชั่วโมงจาก hour history แทนที่จะใช้ค่าจาก student collection
    const summary = await StudentService.getSummaryByCodeWithHours(code)
    // const summary = await StudentService.getSummaryByCode(code)

    studentData.value = {
      name: summary.name,
      major: summary.major,
      email: summary.email || '',
      studentId: summary.code,
    }

    // ใช้ชั่วโมงที่คำนวณจาก hour history
    academicData.value.current = summary.hardSkill
    prepData.value.current = summary.softSkill
  } catch (err) {
    console.error('โหลดข้อมูล student summary ไม่สำเร็จ', err)
  }
})
</script>

<template>
  <q-page class="q-pa-md">
    <div class="container q-mx-auto q-px-sm q-mb-md" style="max-width: 1024px">
      <div class="row justify-between items-center q-mb-md" style="margin-top: 20px">
        <div class="texttitle text-bold">ประวัติของฉัน</div>
      </div>
      <!-- Student Profile Card -->
      <q-card bordered class="q-mb-md shadow-3 rounded-borders">
        <q-card-section class="bg-primary">
          <div class="text-h6 text-bold text-white">
            <q-icon name="account_circle" class="q-mr-sm" />
            ข้อมูลนิสิต
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-body2">
            <div class="field-pair">
              <div class="field-label">ชื่อ - นามสกุล</div>
              <div class="field-value">: {{ studentData.name || 'ไม่ระบุ' }}</div>
            </div>

            <div class="field-pair">
              <div class="field-label">สาขาวิชา</div>
              <div class="field-value">: {{ majorFullName || 'ไม่ระบุ' }}</div>
            </div>

            <div class="field-pair">
              <div class="field-label">รหัสนิสิต</div>
              <div class="field-value">: {{ studentData.studentId || 'ไม่ระบุ' }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Progress Cards -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-6">
          <q-card bordered class="rounded-borders shadow-2 full-height">
            <q-card-section class="bg-primary q-mb-md">
              <div class="text-h6 text-bold text-white">
                <q-icon :name="programColors.academic.icon" class="q-mr-sm" />
                {{ programColors.academic.label }}
              </div>
            </q-card-section>

            <q-card-section class="column items-center">
              <q-circular-progress
                rounded
                show-value
                :value="getProgressValue(academicData)"
                size="150px"
                :thickness="0.2"
                color="primary"
                track-color="grey-3"
                class="text-primary q-my-md"
              >
                <div class="column items-center">
                  <div class="text-h5 text-black">
                    {{ academicData.current }}/{{ academicData.required }}
                  </div>
                  <div class="text-subtitle1 text-black">ชั่วโมง</div>
                </div>
              </q-circular-progress>

              <div class="full-width q-my-sm">
                <div class="row items-center q-mb-xs">
                  <div class="col text-subtitle2">ความคืบหน้า</div>
                  <div class="col-auto text-caption">
                    {{ Math.round(getProgressValue(academicData)) }}%
                  </div>
                </div>
                <q-linear-progress
                  size="md"
                  :value="academicProgressRatio"
                  :color="getProgressColor(academicProgressRatio)"
                  track-color="grey-3"
                  class="q-mb-xs"
                />
                <div class="flex justify-between text-caption">
                  <div>
                    <q-badge :color="getProgressColor(academicProgressRatio)" outline>
                      {{
                        calculateMissingHours(academicData) > 0
                          ? `เหลืออีก ${calculateMissingHours(academicData)} ชั่วโมง`
                          : 'ครบแล้ว'
                      }}
                    </q-badge>
                  </div>
                  <div class="text-grey-8">มีอยู่ {{ academicData.current }} ชั่วโมง</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card bordered class="rounded-borders shadow-2 full-height">
            <q-card-section class="bg-primary q-mb-md">
              <div class="text-h6 text-bold text-white">
                <q-icon :name="programColors.preparation.icon" class="q-mr-sm" />
                {{ programColors.preparation.label }}
              </div>
            </q-card-section>

            <q-card-section class="column items-center">
              <q-circular-progress
                rounded
                show-value
                :value="getProgressValue(prepData)"
                size="150px"
                :thickness="0.2"
                color="secondary"
                track-color="grey-3"
                class="text-secondary q-my-md"
              >
                <div class="column items-center">
                  <div class="text-h5 text-black">
                    {{ prepData.current }}/{{ prepData.required }}
                  </div>
                  <div class="text-subtitle1 text-black">ชั่วโมง</div>
                </div>
              </q-circular-progress>

              <div class="full-width q-my-sm">
                <div class="row items-center q-mb-xs">
                  <div class="col text-subtitle2">ความคืบหน้า</div>
                  <div class="col-auto text-caption">
                    {{ Math.round(getProgressValue(prepData)) }}%
                  </div>
                </div>
                <q-linear-progress
                  size="md"
                  :value="prepProgressRatio"
                  :color="getProgressColor(prepProgressRatio)"
                  track-color="grey-3"
                  class="q-mb-xs"
                />
                <div class="flex justify-between text-caption">
                  <div>
                    <q-badge :color="getProgressColor(prepProgressRatio)" outline>
                      {{
                        calculateMissingHours(prepData) > 0
                          ? `เหลืออีก ${calculateMissingHours(prepData)} ชั่วโมง`
                          : 'ครบแล้ว'
                      }}
                    </q-badge>
                  </div>
                  <div class="text-grey-8">มีอยู่ {{ prepData.current }} ชั่วโมง</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
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
              <ProgramHistory />
            </q-tab-panel>
            <q-tab-panel name="certificate" class="q-my-none">
              <CertificateHistory />
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.rounded-borders {
  border-radius: 12px;
}
.container {
  width: 100%;
}
.q-item-label.ellipsis {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: 8px 12px 0 0;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
}

.field-pair {
  display: flex;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.field-label {
  min-width: 120px;
  font-weight: 700;
  color: #000000;
}

.field-value {
  flex: 1;
  color: #000000;
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
</style>
