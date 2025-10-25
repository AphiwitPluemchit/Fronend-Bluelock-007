<script setup lang="ts">
import EnrollmentType from 'src/components/enrollmentType.vue'
import ProgramType from 'src/components/programType.vue'
// import HourChangeFilterDialog from 'src/components/Dialog/HourChangeFilterDialog.vue'

import { useAuthStore } from 'src/stores/auth'
import { useHourHistoryStore } from 'src/stores/hourHistory'
import type { HourChangeHistory } from 'src/types/hourHistory'
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()
const hourHistoryStore = useHourHistoryStore()

// Simple, shared-like state similar to CertificateHistory
const searchText = ref('')
const selectedFilters = ref({ skillType: [] as string[], status: [] as string[] })

const histories = computed(() => hourHistoryStore.histories)
const loading = computed(() => hourHistoryStore.loading)

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

const onClick = async (id: string) => {
  await router.push(`/Student/Program/MyProgramDetail/${id}`)
}

// Search & debounce
const onSearch = async () => {
  hourHistoryStore.params.search = searchText.value
  hourHistoryStore.params.page = 1
  await fetchProgramHistory()
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

// Apply filters from dialog
// const applyFilters = async (filters: { skillType: string[]; status: string[] }) => {
//   selectedFilters.value = filters

//   if (filters.status.length > 0) {
//     hourHistoryStore.params.status = filters.status.join(',')
//   } else {
//     delete hourHistoryStore.params.status
//   }

//   hourHistoryStore.params.page = 1
//   await fetchProgramHistory()
// }

// Frontend skillType filter (if backend doesn't support it)
const filteredHistories = computed(() => {
  if (!selectedFilters.value.skillType || selectedFilters.value.skillType.length === 0)
    return histories.value
  return histories.value.filter((h) => selectedFilters.value.skillType.includes(h.skillType))
})

// Fetch program histories (wrapper)
const fetchProgramHistory = async () => {
  const studentId = auth.getUser?.id
  if (!studentId) return
  await hourHistoryStore.fetchProgramHistories(studentId)
}

onMounted(async () => {
  await fetchProgramHistory()
})
</script>
<template>
  <!-- Program History -->
  <div class="row justify-between items-right q-mb-md search-filter-wrapper q-col-gutter-md">
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

      <!-- <div class="filter-btn-wrapper">
        <HourChangeFilterDialog @apply="applyFilters" />
      </div> -->
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
        @click="onClick(history.sourceId)"
      >
        <div class="program-card__stripe" :class="typeStripeClass(history)"></div>

        <q-card-section class="q-pt-md q-pb-sm">
          <div class="row items-center justify-between q-mb-sm">
            <div class="row items-center q-gutter-xs">
              <EnrollmentType :status="history.status" />
            </div>
            <ProgramType
              v-if="history.skillType === 'hard' || history.skillType === 'soft'"
              :skill="history.skillType === 'hard' ? 'hardSkill' : 'softSkill'"
            />
          </div>

          <div class="text-weight-medium text-body1 ellipsis-2 q-mb-sm" :title="history.title">
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
</template>
<style scoped>
.search-filter-wrapper {
  flex-wrap: wrap;
}
.searchbox {
  flex-grow: 1;
  min-width: 0;
}

.label {
  color: #6b7280;
}

.label .q-icon {
  color: #3c4556;
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
