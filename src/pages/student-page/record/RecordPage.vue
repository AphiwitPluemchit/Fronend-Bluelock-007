<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { StudentService } from 'src/services/student'

const auth = useAuthStore()

interface ActivityHistory {
  activity: {
    name: string
    skill: 'soft' | 'hard'
    activityItem: {
      id: string
      name: string
      description: string
      hour: number
      operator: string
      dates: {
        date: string
        stime: string
        etime: string
      }[]
    }
    activityState: string
    id: string
    type: string
  }
  registrationDate: string
}

interface ActivityDisplay {
  title: string
  type: 'academic' | 'preparation'
  date: string
  time: string
  room: string
  hours: number
}

const studentData = ref({
  name: '',
  major: '',
  email: '',
  studentId: '',
})

const academicData = ref({ current: 0, required: 12 })
const prepData = ref({ current: 0, required: 30 })

const activities = ref<ActivityDisplay[]>([])
const showAllActivities = ref(false)

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

    activities.value = Array.isArray(summary.history)
      ? summary.history
          .map((h: ActivityHistory) => {
            const a = h.activity
            const ai = a.activityItem
            const d = ai.dates?.[0]
            if (!d) return null

            return {
              title: a.name || '-',
              type: a.skill === 'soft' ? 'preparation' : 'academic',
              date: new Date(d.date).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              time: `${d.stime} - ${d.etime}`,
              room: !ai.operator || ai.operator.trim() === '-' ? 'ไม่ระบุ' : ai.operator,
              hours: ai.hour ?? 0,
            }
          })
          .filter(Boolean) as ActivityDisplay[]
      : []
  } catch (err) {
    console.error('โหลดข้อมูล student summary ไม่สำเร็จ', err)
  }
})

const calculateMissingHours = (data: { current: number; required: number }) =>
  data.required > data.current ? data.required - data.current : 0

const getProgressValue = (data: { current: number; required: number }) =>
  data.required ? (data.current / data.required) * 100 : 0

const prepProgressRatio = computed(() =>
  Math.min(prepData.value.current / (prepData.value.required || 1), 1)
)
const academicProgressRatio = computed(() =>
  Math.min(academicData.value.current / (academicData.value.required || 1), 1)
)

const getProgressColor = (ratio: number) => {
  if (ratio >= 1) return 'positive'
  if (ratio >= 0.8) return 'orange'
  return 'negative'
}

const activityColors = {
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
</script>

<template>
  <q-page>
    <div class="container q-mx-auto q-px-sm q-py-md" style="max-width: 1000px">
      <!-- Student Profile Card -->
      <q-card bordered class="q-mb-md shadow-3 rounded-borders">
        <q-card-section class="bg-blue-1">
          <div class="text-h6 text-bold text-primary">
            <q-icon name="account_circle" class="q-mr-sm" />
            ข้อมูลนิสิต
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="row q-col-gutter-sm text-body2 q-py-xs">
                <div class="col-4 text-right text-weight-medium">ชื่อ :</div>
                <div class="col-8">{{ studentData.name }}</div>
              </div>
              <div class="row q-col-gutter-sm text-body2 q-py-xs">
                <div class="col-4 text-right text-weight-medium">สาขา :</div>
                <div class="col-8">{{ studentData.major }}</div>
              </div>
              <div class="row q-col-gutter-sm text-body2 q-py-xs">
                <div class="col-4 text-right text-weight-medium">รหัสนิสิต :</div>
                <div class="col-8">{{ studentData.studentId }}</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Progress Cards -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-6">
          <q-card bordered class="rounded-borders shadow-2 full-height">
            <q-card-section class="bg-blue-1 q-mb-md">
              <div class="text-h6 text-bold text-primary">
                <q-icon :name="activityColors.academic.icon" class="q-mr-sm" />
                {{ activityColors.academic.label }}
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
                      {{ calculateMissingHours(academicData) > 0
                        ? `เหลืออีก ${calculateMissingHours(academicData)} ชั่วโมง`
                        : 'ครบแล้ว' }}
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
            <q-card-section class="bg-blue-1 q-mb-md">
              <div class="text-h6 text-bold text-primary">
                <q-icon :name="activityColors.preparation.icon" class="q-mr-sm" />
                {{ activityColors.preparation.label }}
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
                      {{ calculateMissingHours(prepData) > 0
                        ? `เหลืออีก ${calculateMissingHours(prepData)} ชั่วโมง`
                        : 'ครบแล้ว' }}
                    </q-badge>

                  </div>
                  <div class="text-grey-8">มีอยู่ {{ prepData.current }} ชั่วโมง</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Activity History -->
      <q-card bordered class="q-mb-md shadow-2 rounded-borders">
        <q-card-section class="bg-blue-1">
          <div class="row justify-between items-center">
            <div class="text-h6 text-bold text-primary">
              <q-icon name="history" class="q-mr-sm" />
              ประวัติการเข้ากิจกรรม
            </div>
            <q-btn
              v-if="activities.length > 3"
              flat
              dense
              color="primary"
              :icon="showAllActivities ? 'expand_less' : 'expand_more'"
              :label="showAllActivities ? 'แสดงน้อยลง' : 'ทั้งหมด'"
              @click="showAllActivities = !showAllActivities"
            />
          </div>
        </q-card-section>


        <q-separator />

        <q-card-section class="q-pa-none">
          <q-list>
            <q-item
              v-for="(activity, index) in (showAllActivities ? activities : activities.slice(0, 3))"
              :key="index"
            >
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  <q-icon :name="activityColors[activity.type].icon" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label
                  class="text-weight-medium ellipsis"
                  :title="activity.title"
                >
                  {{ activity.title }}
                </q-item-label>
                <q-item-label caption>
                  <div class="row items-center">
                    <q-icon name="event" size="xs" class="q-mr-xs" />
                    {{ activity.date }}
                    <q-separator vertical spaced class="q-mx-sm" />
                    <q-icon name="timer" size="xs" class="q-mr-xs" />
                    {{ activity.hours }} ชั่วโมง
                  </div>
                </q-item-label>
              </q-item-section>

              <q-item-section side top>
                <div class="row items-center">
                  <q-badge
                    rounded
                    class="q-px-sm q-py-xs text-weight-medium"
                    :style="`background-color: ${activityColors[activity.type].bgColor}; color: ${activityColors[activity.type].textColor}; border: 1px solid ${
                      activity.type === 'preparation' ? activityColors[activity.type].border : activityColors[activity.type].textColor
                    };`"
                    :label="activityColors[activity.type].label"
                  />
                </div>
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
</style>
