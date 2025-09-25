<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { StudentService } from 'src/services/student'
import { EnrollmentService } from 'src/services/enrollment'
import type { ProgramHistory } from 'src/types/program'
import type { CheckinoutRecord } from 'src/types/checkinout'
import type{ Pagination } from 'src/types/pagination'

const auth = useAuthStore()
const router = useRouter()
// const $q = useQuasar()
// const isSmallScreen = computed(() => !$q.screen.gt.xs)
const allPrograms = ref<ProgramHistory[]>([])
// interface ProgramHistory {
//   program: {
//     name: string
//     skill: 'soft' | 'hard'
//     programItem: {
//       id: string
//       name: string
//       description: string
//       hour: number
//       operator: string
//       dates: {
//         date: string
//         stime: string
//         etime: string
//       }[]
//     }
//     programState: string
//     id: string
//     type: string
//   }
//   registrationDate: string
// }

// interface ProgramDisplay {
//   id: string
//   title: string
//   type: 'academic' | 'preparation'
//   date: string
//   time: string
//   room: string
//   hours: number
// }

const studentData = ref({
  name: '',
  major: '',
  email: '',
  studentId: '',
})
const query = ref<Pagination>({
  page: 1,
  limit: -1,
  search: '',
  sortBy: '_id',
  order: 'desc',
  skill: [],
  programState: ['open', 'close'],
  major: [],
  studentYear: [],
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
    AAI: 'ปัญญาประดิษฐ์ประยุกต์',
    ITDI: 'นวัตกรรมดิจิทัล',
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

const onClick = async (id: string) => {
  await router.push(`/Student/Program/MyProgramDetail/${id}`)
}

const getProgramItemStatus = (program: ProgramHistory): number => {
  const status = program?.programItems?.[0]?.status;
  return typeof status === 'number' ? status : 1;
}

const getStatusDotClass = (program: ProgramHistory) => {
  const s = getProgramItemStatus(program)
  if (s === 2) return 'status-dot--green'
  if (s === 3) return 'status-dot--red'
  return 'status-dot--yellow'
}

const getCheckinRecords = (program: ProgramHistory): CheckinoutRecord[] => {
  const records = program?.programItems?.[0]?.checkinoutRecord
  return Array.isArray(records) ? records : []
}

const formatDateTime = (iso?: string) => {
  if (!iso) return '-'
  const d = new Date(iso)
  try {
    return d.toLocaleString('th-TH', {
      year: '2-digit', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return d.toISOString()
  }
}
const fetchData = async () => {
  try {
    const studentId = `${auth.getUser?.id}`
    const response = await EnrollmentService.getEnrollmentsByStudentID(studentId, query.value)
    allPrograms.value = response.data
    // programs.value = response.data
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลโครงการ:', error)
  }
}
onMounted(async () => {
  const code = auth.getUser?.code
  if (!code) return

  try {
    const summary = await StudentService.getSummaryByCode(code)

    studentData.value = {
      name: summary.name,
      major: summary.major,
      email: summary.email || '',
      studentId: summary.code,
    }

    academicData.value.current = summary.hardSkill
    prepData.value.current = summary.softSkill

    await fetchData()
  } catch (err) {
    console.error('โหลดข้อมูล student summary ไม่สำเร็จ', err)
  }
})
</script>

<template>
  <q-page class="q-pa-md">
    <div class="container q-mx-auto q-px-sm q=mb-md" style="max-width: 1000px">
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

      <!-- Program History -->
      <q-card bordered class="q-mb-md shadow-2 rounded-borders">
        <q-card-section class="bg-primary">
          <div class="row justify-between items-center">
            <div class="text-h6 text-bold text-white">
              <q-icon name="history" class="q-mr-sm" />
              ประวัติการเข้าโครงการ
            </div>
            <!-- <q-btn
              v-if="allPrograms.length > 3"
              flat
              dense
              color="white"
              :icon="showAllPrograms ? 'expand_less' : 'expand_more'"
              :label="showAllPrograms ? 'ดูน้อยลง' : 'ดูทั้งหมด'"
              @click="showAllPrograms = !showAllPrograms"
            /> -->
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none">
          <q-list>
            <q-item
              v-for="(program, index) in allPrograms"
              :key="index"
              clickable
              v-ripple
              @click="onClick(program.id!)"
            >
              <div class="status-dot" :class="getStatusDotClass(program)"></div>
              <!-- <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  <q-icon :name="programColors[program.type].icon" />
                </q-avatar>
              </q-item-section> -->

              <q-item-section>
                <!-- ✅ ชื่อโครงการ แสดงตลอด -->
                <q-item-label class="text-weight-medium ellipsis" :title="program.name">
                  {{ program.name }}
                </q-item-label>

                <!-- ✅ แสดงวัน เวลา ชั่วโมงในจอใหญ่ และ label ในจอเล็ก -->
                <q-item-label caption>
                  <template v-if="getCheckinRecords(program).length">
                    <div v-for="(r, i) in getCheckinRecords(program)" :key="i">
                      <span>เช็คอิน: {{ formatDateTime(r.checkin) }}</span>
                      <span v-if="r.checkout"> • เช็คเอาท์: {{ formatDateTime(r.checkout) }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <span class="text-grey">ไม่มีข้อมูลเช็คชื่อ</span>
                  </template>
                </q-item-label>
              </q-item-section>


            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
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
  box-shadow: 0 0 0 2px rgba(0,0,0,0.05);
}
.status-dot--yellow { background-color: #FFD740; }
.status-dot--green  { background-color: #00C853; }
.status-dot--red    { background-color: #FF3D00; }

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
</style>
