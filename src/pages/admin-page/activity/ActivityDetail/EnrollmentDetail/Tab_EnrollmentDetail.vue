<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ActivityService } from 'src/services/activity'
import type { Activity, EnrollmentSummary } from 'src/types/activity'

const route = useRoute()
const activityId = route.params.id as string
const expandedIndices = ref<number[]>([])

const toggleExpanded = (index: number) => {
  if (expandedIndices.value.includes(index)) {
    expandedIndices.value = expandedIndices.value.filter((i) => i !== index)
  } else {
    expandedIndices.value.push(index)
  }
}
const enrollmentSummary = ref<EnrollmentSummary | null>(null)
const majorList = [
  { majorName: 'CS' },
  { majorName: 'SE' },
  { majorName: 'AAI' },
  { majorName: 'ITDI' },
]

const registrationRows = computed(() => {
  return (enrollmentSummary.value?.activityItemSums ?? []).map((item, index) => {
    const activity = activityDetail.value?.activityItems?.[index]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseRow: Record<string, any> = {
      activity: activity?.name ?? '-',
      max: activity?.maxParticipants ?? 0,
      enrolled: activity?.enrollmentCount ?? 0,
      remaining: (activity?.maxParticipants ?? 0) - (activity?.enrollmentCount ?? 0),
    }

    majorList.forEach((m) => {
      baseRow[m.majorName] =
        item.registeredByMajor?.find((x) => x.majorName === m.majorName)?.count || 0
    })

    return baseRow
  })
})

const foodRows = computed(() => activityDetail.value?.foodVotes ?? [])

const fetchEnrollmentSummary = async () => {
  try {
    const response = await ActivityService.getEnrollmentSummary(activityId)
    enrollmentSummary.value = response
  } catch (error) {
    console.error('Error fetching enrollment summary:', error)
  }
}

const activityDetail = ref<Activity | null>(null)

const fetchActivityDetail = async () => {
  try {
    const response = await ActivityService.getOne(activityId)
    activityDetail.value = response.data
  } catch (error) {
    console.error('Error fetching activity detail:', error)
  }
}
const totalByMajor = computed(() => {
  const result: Record<string, number> = {}
  majorList.forEach((m) => {
    result[m.majorName] = 0
  })

  enrollmentSummary.value?.activityItemSums?.forEach((item) => {
    if (Array.isArray(item.registeredByMajor)) {
      item.registeredByMajor.forEach((major) => {
        result[major.majorName] = (result[major.majorName] ?? 0) + major.count
      })
    }
  })

  return result
})
onMounted(async () => {
  await fetchEnrollmentSummary()
  await fetchActivityDetail()
})
</script>

<template>
  <div class="panel">
    <div class="mainActivity">
      <div class="header_Name">{{ activityDetail?.name }}</div>
      <div class="row cards-wrapper">
        <q-card class="card bg-blue-2 text-center q-pa-md">
          <div class="text-h5">{{ enrollmentSummary?.maxParticipants || 0 }}</div>
          <div class="text-subtitle2">จำนวนที่รับ</div>
        </q-card>

        <q-card class="card bg-green-2 text-center q-pa-md">
          <div class="text-h5">{{ enrollmentSummary?.totalRegistered || 0 }}</div>
          <div class="text-subtitle2">จำนวนนิสิตที่ลงทะเบียน</div>
        </q-card>

        <q-card class="card bg-yellow-2 text-center q-pa-md">
          <div class="text-h5">{{ enrollmentSummary?.remainingSlots || 0 }}</div>
          <div class="text-subtitle2">จำนวนที่ว่าง</div>
        </q-card>
      </div>

      <div class="header_Name">รายละเอียดตามสาขา</div>
      <div class="columns cards-wrapper">
        <q-card
          class="card bg-yellow-2 text-center q-pa-md"
          v-for="major in majorList"
          :key="major.majorName"
        >
          <div class="text-h5">{{ totalByMajor[major.majorName] || 0 }}</div>
          <div class="text-subtitle2">{{ major.majorName }}</div>
        </q-card>
      </div>

      <!-- อาหาร (เฉพาะกรณีมีข้อมูล) -->
      <div v-if="activityDetail?.foodVotes?.length">
        <div class="header_Name">ผลการเลือกอาหาร</div>
        <div v-for="(food, index) in foodRows" :key="index" class="Food-wrapper">
          <span class="TextFood">{{ food.foodName }}</span>
          <span class="ValueFood">: {{ food.vote }} คน</span>
        </div>
      </div>
    </div>

    <div class="subActivity" v-for="(row, index) in registrationRows" :key="index">
      <div class="row justify-between items-center">
        <span class="header_Name">{{ row.activity }}</span>
        <q-icon
          :name="expandedIndices.includes(index) ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          class="cursor-pointer"
          size="md"
          @click="toggleExpanded(index)"
        />
      </div>

      <div class="cards-wrapper">
        <q-card class="card bg-blue-2 text-center q-pa-md">
          <div class="text-h5">{{ row.max }}</div>
          <div class="text-subtitle2">จำนวนที่รับ</div>
        </q-card>
        <q-card class="card bg-blue-2 text-center q-pa-md">
          <div class="text-h5">{{ row.enrolled }}</div>
          <div class="text-subtitle2">จํานวนที่ลงทะเบียน</div>
        </q-card>
        <q-card class="card bg-blue-2 text-center q-pa-md">
          <div class="text-h5">{{ row.remaining }}</div>
          <div class="text-subtitle2">จํานวนที่ว่าง</div>
        </q-card>
      </div>
      <div v-if="expandedIndices.includes(index)">
        <span class="text-h6">รายละเอียดตามสาขา</span>
        <div class="cards-wrapper">
          <q-card
            class="card bg-yellow-2 text-center q-pa-md"
            v-for="major in majorList"
            :key="major.majorName"
          >
            <div class="text-h5">{{ row[major.majorName] }}</div>
            <div class="text-subtitle2">{{ major.majorName }}</div>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel {
  max-height: 600px;
  overflow-y: auto;
}
.panel::-webkit-scrollbar {
  display: none;
}
.mainActivity {
  background-color: rgb(211, 202, 191);
  padding: 20px;
  width: 60%;
  border-radius: 20px;
}
.subActivity {
  background-color: rgb(211, 202, 191);
  padding: 20px;
  width: 60%;
  border-radius: 20px;
  margin-top: 20px;
}

.header_Name {
  font-size: 20px;
  font-weight: bold;
}
.card {
  max-width: 200px;
  width: 100%;
}
.cards-wrapper {
  display: flex;
  gap: 20px;
  margin-top: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}
.Food-wrapper {
  display: flex;
  margin-top: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.TextFood {
  font-size: 16px;
  font-weight: 600;
  min-width: 200px;
  display: inline-block;
}
.ValueFood {
  font-size: 16px;
}
</style>
