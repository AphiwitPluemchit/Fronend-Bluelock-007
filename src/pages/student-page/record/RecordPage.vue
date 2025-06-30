<script setup lang="ts">
import { computed, ref } from 'vue'

const studentData = ref({
  name: 'นายยอดชาย ต้นไม้โลก',
  major: 'วิทยาการคอมพิวเตอร์',
  email: '65169999@go.buu.ac.th',
  year: 3,
  studentId: '65169999',
})

const academicData = ref({
  current: 11,
  required: 12,
})

const prepData = ref({
  current: 10,
  required: 30,
})

const calculateMissingHours = (data: { current: number; required: number }) => {
  return data.required > data.current ? data.required - data.current : 0
}

const prepProgressRatio = computed(() =>
  Math.min(prepData.value.current / prepData.value.required, 1),
)
const academicProgressRatio = computed(() =>
  Math.min(academicData.value.current / academicData.value.required, 1),
)

const getProgressColor = (ratio: number) => {
  if (ratio >= 1) return 'positive'
  if (ratio >= 0.8) return 'amber'
  return 'negative'
}

const activities = ref([
  {
    title: 'กิจกรรมเสริมสร้างความรู้และประสบการณ์ทางด้านวิชาการ กับ บริษัท My Oder',
    type: 'preparation',
    date: '18 มกราคม 2568',
    time: '08.30 - 16.30 น.',
    hours: 3,
    icon: 'event',
  },
  {
    title: 'กิจกรรมเสริมสร้างความรู้และประสบการณ์ทางด้านวิชาการ กับ บริษัท My Oder',
    type: 'academic',
    date: '18 มกราคม 2568',
    time: '08.30 - 16.30 น.',
    hours: 3,
    icon: 'school',
  },
])
</script>

<template>
  <q-page class="bg-grey-1">
    <div class="container q-mx-auto q-px-sm q-py-md" style="max-width: 1000px">
      <!-- Student Profile Card -->
      <q-card bordered class="q-mb-md shadow-3 rounded-borders">
        <q-card-section class="bg-blue-1">
          <div class="text-h6 text-primary">
            <q-icon name="account_circle" class="q-mr-sm" />
            ข้อมูลนิสิต
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- Left column with student info -->
            <div class="col-12 col-md-6">
              <div class="row q-col-gutter-sm text-body1 q-py-xs">
                <div class="col-4 text-right text-weight-medium">ชื่อ :</div>
                <div class="col-8">{{ studentData.name }}</div>
              </div>
              <div class="row q-col-gutter-sm text-body1 q-py-xs">
                <div class="col-4 text-right text-weight-medium">สาขา :</div>
                <div class="col-8">{{ studentData.major }}</div>
              </div>
              <div class="row q-col-gutter-sm text-body1 q-py-xs">
                <div class="col-4 text-right text-weight-medium">อีเมล์ :</div>
                <div class="col-8">{{ studentData.email }}</div>
              </div>
              <div class="row q-col-gutter-sm text-body1 q-py-xs">
                <div class="col-4 text-right text-weight-medium">รหัสนิสิต :</div>
                <div class="col-8">{{ studentData.studentId }}</div>
              </div>
              <div class="row q-col-gutter-sm text-body1 q-py-xs">
                <div class="col-4 text-right text-weight-medium">ชั้นปี :</div>
                <div class="col-8">
                  <q-chip dense color="primary" text-color="white" size="sm">
                    ปี {{ studentData.year }}
                  </q-chip>
                </div>
              </div>
            </div>

         
          </div>
        </q-card-section>
      </q-card>

      <!-- Hours Progress Cards -->
      <div class="row q-col-gutter-md q-mb-md">
        <!-- Academic Skills Card -->
        <div class="col-12 col-md-6">
          <q-card bordered class="rounded-borders shadow-2 full-height">
            <q-card-section class="bg-blue-1 q-pb-xs">
              <div class="text-subtitle1 text-primary">
                <q-icon name="school" class="q-mr-sm" />
                ทักษะทางวิชาการ
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

        <!-- Preparation Skills Card -->
        <div class="col-12 col-md-6">
          <q-card bordered class="rounded-borders shadow-2 full-height">
            <q-card-section class="bg-blue-1 q-pb-xs">
              <div class="text-subtitle1 text-primary">
                <q-icon name="assignment" class="q-mr-sm" />
                เตรียมความพร้อม
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
            <div class="text-subtitle1 text-primary">
              <q-icon name="history" class="q-mr-sm" />
              ประวัติการเข้ากิจกรรม
            </div>
            <q-btn flat dense color="primary" icon="more_horiz" label="ดูทั้งหมด" />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none">
          <q-list>
            <q-item v-for="(activity, index) in activities" :key="index" class="q-py-md">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  <q-icon :name="activity.icon" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">{{ activity.title }}</q-item-label>
                <q-item-label caption>
                  <div class="row items-center">
                    <q-icon name="event" size="xs" class="q-mr-xs" />
                    {{ activity.date }}
                    <q-separator vertical spaced class="q-mx-sm" />
                    <q-icon name="schedule" size="xs" class="q-mr-xs" />
                    {{ activity.time }}
                    <q-separator vertical spaced class="q-mx-sm" />
                    <q-icon name="timer" size="xs" class="q-mr-xs" />
                    {{ activity.hours }} ชั่วโมง
                  </div>
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-badge
                  outline
                  rounded
                  :color="activity.type === 'preparation' ? 'secondary' : 'primary'"
                  :label="activity.type === 'preparation' ? 'เตรียมความพร้อม' : 'ทักษะทางวิชาการ'"
                />
              </q-item-section>
            </q-item>

            <q-separator v-if="activities.length > 0" />

     
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

.hover-card {
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
}

.container {
  width: 100%;
}
</style>
