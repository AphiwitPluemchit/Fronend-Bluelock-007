<script setup lang="ts">
import { computed, ref } from 'vue'

type ActivityType = 'academic' | 'preparation'


const studentData = ref({
  name: 'นายยอดชาย ต้นไม้โลก',
  major: 'วิทยาการคอมพิวเตอร์',
  email: '65160099@go.buu.ac.th',
  year: 3,
  studentId: '65160099',
})

const academicData = ref({ current: 11, required: 12 })
const prepData = ref({ current: 10, required: 30 })

const calculateMissingHours = (data: { current: number; required: number }) =>
  data.required > data.current ? data.required - data.current : 0

const prepProgressRatio = computed(() =>
  Math.min(prepData.value.current / prepData.value.required, 1)
)
const academicProgressRatio = computed(() =>
  Math.min(academicData.value.current / academicData.value.required, 1)
)

const getProgressColor = (ratio: number) => {
  if (ratio >= 1) return 'positive'
  if (ratio >= 0.8) return 'orange'
  return 'negative'
}

const showAllActivities = ref(false)

const activities = ref<Array<{
  title: string
  type: ActivityType
  date: string
  time: string
  room: string
  hours: number
}>>([
  {
    title: 'กิจกรรมเตรียมความพร้อม',
    type: 'preparation',
    date: '24 กรกฎาคม 2568',
    time: '09:00 - 12:00',
    room: 'Online',
    hours: 3,
  },
  {
    title: 'กิจกรรมเตรียมความพร้อม',
    type: 'academic',
    date: '24 กรกฎาคม 2568',
    time: '09:00 - 12:00',
    room: 'Online',
    hours: 3,
  },{
    title: 'กิจกรรมเตรียมความพร้อม',
    type: 'preparation',
    date: '24 กรกฎาคม 2568',
    time: '09:00 - 12:00',
    room: 'Online',
    hours: 3,
  },{
    title: 'กิจกรรมเตรียมความพร้อม',
    type: 'academic',
    date: '24 กรกฎาคม 2568',
    time: '09:00 - 12:00',
    room: 'Online',
    hours: 3,
  },{
    title: 'กิจกรรมเตรียมความพร้อม',
    type: 'preparation',
    date: '24 กรกฎาคม 2568',
    time: '09:00 - 12:00',
    room: 'Online',
    hours: 3,
  },{
    title: 'กิจกรรมเตรียมความพร้อม',
    type: 'academic',
    date: '24 กรกฎาคม 2568',
    time: '09:00 - 12:00',
    room: 'Online',
    hours: 3,
  },
  // ... อื่น ๆ
])


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
              <div class="row q-col-gutter-sm text-body2 q-py-xs">
                <div class="col-4 text-right text-weight-medium">ชั้นปี :</div>
                <div class="col-8">{{ studentData.year }}</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Hours Progress Cards -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-6">
          <q-card bordered class="rounded-borders shadow-2 full-height">
            <q-card-section class="bg-blue-1 q-pb-xs">
              <div class="text-h6 text-bold text-primary">
                <q-icon :name="activityColors.academic.icon" class="q-mr-sm" />
                {{ activityColors.academic.label }}
              </div>
            </q-card-section>

            <q-card-section class="column items-center">
              <q-circular-progress
                rounded
                show-value
                :value="(academicData.current / academicData.required) * 100"
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
                    {{ Math.round((academicData.current / academicData.required) * 100) }}%
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
                      เหลืออีก {{ calculateMissingHours(academicData) }} ชั่วโมง
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
            <q-card-section class="bg-blue-1 q-pb-xs">
              <div class="text-h6 text-bold text-primary">
                <q-icon :name="activityColors.preparation.icon" class="q-mr-sm" />
                {{ activityColors.preparation.label }}
              </div>
            </q-card-section>

            <q-card-section class="column items-center">
              <q-circular-progress
                rounded
                show-value
                :value="(prepData.current / prepData.required) * 100"
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
                    {{ Math.round((prepData.current / prepData.required) * 100) }}%
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
                      เหลืออีก {{ calculateMissingHours(prepData) }} ชั่วโมง
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
        <q-card-section class="bg-blue-1 q-pb-xs">
          <div class="row justify-between items-center">
            <div class="text-h6 text-bold text-primary">
              <q-icon name="history" class="q-mr-sm" />
              ประวัติการเข้ากิจกรรม
            </div>
            <q-btn
              v-if="activities.length > 5"
              flat
              dense
              color="primary"
              icon="more_horiz"
              :label="showAllActivities ? 'แสดงน้อยลง' : 'ดูทั้งหมด'"
              @click="showAllActivities = !showAllActivities"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none">
          <q-list>
  <q-item
    v-for="(activity, index) in (showAllActivities ? activities : activities.slice(0, 5))"
    :key="index"
    class="q-py-md"
  >
    <q-item-section avatar>
      <q-avatar color="primary" text-color="white">
        <q-icon :name="activityColors[activity.type].icon" />
      </q-avatar>
    </q-item-section>

    <q-item-section>
      <q-item-label class="text-weight-medium">{{ activity.title }}</q-item-label>
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

    <q-item-section side>
      <q-badge
        rounded
        class="q-px-sm q-py-xs text-weight-medium"
        :style="`
          background-color: ${activityColors[activity.type].bgColor};
          color: ${activityColors[activity.type].textColor};
          border: 2px solid ${activity.type === 'preparation' ? activityColors[activity.type].border : activityColors[activity.type].textColor};
        `"
        :label="activityColors[activity.type].label"
      />
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
</style>

