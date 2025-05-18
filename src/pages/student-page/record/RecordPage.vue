<script setup lang="ts">
import { computed, ref } from 'vue'

const studentData = ref({
  name: 'นายยอดชาย ต้นไม้โลก',
  major: 'วิทยาการคอมพิวเตอร์',
  email: '65169999@go.buu.ac.th',
  year: 3,
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
  },
  {
    title: 'กิจกรรมเสริมสร้างความรู้และประสบการณ์ทางด้านวิชาการ กับ บริษัท My Oder',
    type: 'academic',
    date: '18 มกราคม 2568',
    time: '08.30 - 16.30 น.',
    hours: 3,
  },
])
</script>

<template>
  <q-page class="q-py-md q-px-lg" style="max-width: 1000px; margin: auto">
    <!-- Profile Title -->
    <div class="text-h4 q-mb-md">โปรไฟล์นิสิต</div>

    <!-- Student Profile Card -->
    <q-card bordered class="q-my-md shadow-2 rounded-borders">
      <q-card-section>
        <div class="row q-col-gutter-sm text-h7">
          <div class="col-2 text-right text-weight-medium">ชื่อ :</div>
          <div class="col-10">{{ studentData.name }}</div>
        </div>
        <div class="row q-col-gutter-sm text-h7">
          <div class="col-2 text-right text-weight-medium">สาขา :</div>
          <div class="col-10">{{ studentData.major }}</div>
        </div>
        <div class="row q-col-gutter-sm text-h7">
          <div class="col-2 text-right text-weight-medium">อีเมล์ :</div>
          <div class="col-10">{{ studentData.email }}</div>
        </div>
        <div class="row q-col-gutter-sm text-h7">
          <div class="col-2 text-right text-weight-medium">ชั้นปี :</div>
          <div class="col-10">{{ studentData.year }}</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Hours Circles -->
    <q-card
      ><div class="row justify-center q-col-gutter-xl q-my-lg">
        <!-- Academic Skills Circle -->
        <div class="col-auto">
          <div class="column items-center">
            <q-circular-progress
              rounded
              show-value
              :value="(academicData.current / academicData.required) * 100"
              size="180px"
              :thickness="0.2"
              color="primary"
              track-color="grey-5"
              class="text-primary"
            >
              <div class="column items-center">
                <div class="text-h5 text-black">
                  {{ academicData.current }}/{{ academicData.required }}
                </div>
                <div class="text-h5 text-black">ชั่วโมง</div>
              </div>
            </q-circular-progress>
            <div class="text-h6 text-center q-pt-md">ทักษะทางวิชาการ</div>
          </div>
        </div>

        <!-- Preparation Skills Circle -->
        <div class="col-auto">
          <div class="column items-center">
            <q-circular-progress
              rounded
              show-value
              :value="(prepData.current / prepData.required) * 100"
              size="180px"
              :thickness="0.2"
              color="primary"
              track-color="grey-5"
              class="text-primary"
            >
              <div class="column items-center">
                <div class="text-h5 text-black">{{ prepData.current }}/{{ prepData.required }}</div>
                <div class="text-black text-h5">ชั่วโมง</div>
              </div>
            </q-circular-progress>
            <div class="text-h5 text-center q-pt-md">เตรียมความพร้อม</div>
          </div>
        </div>
      </div></q-card
    >

    <!-- Progress Bars -->
    <div class="q-my-lg">
      <!-- Academic Progress -->
      <div class="column">
        <div class="row items-center">
          <div class="col-2">
            <q-badge :color="getProgressColor(academicProgressRatio)" class="text-h7">
              ขาดอีก {{ calculateMissingHours(academicData) }}
            </q-badge>
          </div>
          <div class="col-8">
            <q-linear-progress
              size="md"
              :value="academicProgressRatio"
              :color="getProgressColor(academicProgressRatio)"
            />
          </div>
          <div class="col-2 text-caption text-right">มีอยู่ {{ academicData.current }} ชม.</div>
        </div>
        <div class="row">
          <div class="col-12 text-caption q-p-none">ชั่วโมงทักษะทางวิชาการ</div>
        </div>
      </div>
      <!-- Preparation Progress -->
      <div class="column q-mb-md">
        <div class="row items-center">
          <div class="col-2">
            <q-badge :color="getProgressColor(prepProgressRatio)">
              ขาดอีก {{ calculateMissingHours(prepData) }}
            </q-badge>
          </div>
          <div class="col-8">
            <q-linear-progress
              size="md"
              :value="prepProgressRatio"
              :color="getProgressColor(prepProgressRatio)"
            />
          </div>
          <div class="col-2 text-caption text-right">มีอยู่ {{ prepData.current }} ชม.</div>
        </div>
        <div class="row">
          <div class="col-12 text-caption">ชั่วโมงเตรียมความพร้อม</div>
        </div>
      </div>
    </div>

    <!-- Activity History -->
    <div class="q-my-lg">
      <div class="row justify-between items-center q-mb-sm">
        <div class="text-subtitle2">
          <q-icon name="history" class="q-mr-sm" />
          ประวัติการเข้ากิจกรรม
        </div>
        <q-btn flat dense color="primary" label="ดูทั้งหมด" class="text-caption" />
      </div>

      <q-card
        v-for="(activity, index) in activities"
        :key="index"
        bordered
        class="q-mt-sm q-pa-sm shadow-1 rounded-borders"
      >
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <img src="/api/placeholder/40/40" alt="activity" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <div class="text-body2">{{ activity.title }}</div>
          </q-item-section>
          <q-item-section side class="column items-end">
            <q-badge
              class="q-mb-sm"
              outline
              rounded
              size="sm"
              :color="activity.type === 'preparation' ? 'primary' : 'red'"
              :label="activity.type === 'preparation' ? 'เตรียมความพร้อม' : 'ทักษะทางวิชาการ'"
              dense
            />
            <div class="text-caption">{{ activity.date }}</div>
            <div class="text-caption">{{ activity.time }}</div>
            <div class="text-caption">{{ activity.hours }} ชั่วโมง</div>
          </q-item-section>
        </q-item>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.rounded-borders {
  border-radius: 12px;
}
</style>
