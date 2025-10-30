<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useHourHistoryStore } from 'src/stores/hourHistory'

import CertificateStatusType from 'src/components/CertificateStatusType.vue'
import ProgramType from 'src/components/programType.vue'
import HourChangeFilterDialog from 'src/components/Dialog/HourChangeFilterDialog.vue'

const hourHistoryStore = useHourHistoryStore()

const props = defineProps<{
  studentId: string
  showFilter?: boolean // สำหรับ admin page ที่ต้องการ filter
}>()

// State
const searchText = ref('')
const selectedFilters = ref({
  skillType: [] as string[],
  status: [] as string[],
})

// Computed
const histories = computed(() => hourHistoryStore.histories)
const loading = computed(() => hourHistoryStore.loading)

// Format date
const formatDateTime = (iso?: string) => {
  if (!iso) return '-'
  const d = new Date(iso)
  try {
    return d.toLocaleString('th-TH', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return d.toISOString()
  }
}

// Search
const onSearch = async () => {
  hourHistoryStore.params.search = searchText.value
  hourHistoryStore.params.page = 1
  await fetchCertificateHistory()
}

// Debounce
let searchTimer: ReturnType<typeof setTimeout> | null = null
const DEBOUNCE_MS = 600

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

// Apply filters
const applyFilters = async (filters: { skillType: string[]; status: string[] }) => {
  selectedFilters.value = filters

  if (filters.status.length > 0) {
    hourHistoryStore.params.status = filters.status.join(',')
  } else {
    delete hourHistoryStore.params.status
  }

  hourHistoryStore.params.page = 1
  await fetchCertificateHistory()
}

// Frontend skillType filter
const filteredHistories = computed(() => {
  if (selectedFilters.value.skillType.length === 0) {
    return histories.value
  }
  return histories.value.filter((h) => selectedFilters.value.skillType.includes(h.skillType))
})

// Fetch data
const fetchCertificateHistory = async () => {
  if (!props.studentId) return
  await hourHistoryStore.fetchCertificateHistories(props.studentId)
}

// Watch for studentId changes (for admin page)
watch(
  () => props.studentId,
  async (newId) => {
    if (!newId) return
    hourHistoryStore.params.page = 1
    await fetchCertificateHistory()
  },
)

onMounted(async () => {
  await fetchCertificateHistory()
})
</script>

<template>
  <div>
    <!-- Search and Filter -->
    <div class="row justify-between items-right q-mb-md search-filter-wrapper q-col-gutter-md">
      <div class="text-h6"></div>
      <div class="row search-filter-inner items-center no-wrap">
        <q-input
          dense
          outlined
          v-model="searchText"
          placeholder="ค้นหา ชื่อใบรับรอง"
          class="q-mr-sm searchbox"
          :style="{ boxShadow: 'none' }"
          clearable
          @keyup.enter="onSearch"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <div v-if="showFilter" class="filter-btn-wrapper">
          <HourChangeFilterDialog @apply="applyFilters" />
        </div>
      </div>
    </div>

    <div class="column q-gutter-md">
      <!-- Loading -->
      <div v-if="loading" class="row justify-center q-my-lg">
        <q-spinner color="primary" size="3em" />
      </div>

      <!-- History Cards -->
      <template v-else-if="filteredHistories && filteredHistories.length > 0">
        <q-card
          v-for="history in filteredHistories"
          :key="history.id"
          class="program-card"
          flat
          bordered
        >
          <q-card-section class="q-pt-md q-pb-sm">
            <!-- Status and Type -->
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center q-gutter-xs">
                <CertificateStatusType :status="history.status" />
              </div>
              <ProgramType
                v-if="history.skillType === 'hard' || history.skillType === 'soft'"
                :skill="history.skillType === 'hard' ? 'hardSkill' : 'softSkill'"
              />
            </div>

            <!-- Title -->
            <div class="text-weight-medium text-body1 ellipsis-2 q-mb-sm" :title="history.title">
              {{ history.title }}
            </div>

            <!-- Details -->
            <div class="text-weight-medium text-subtitle2 ellipsis-2 q-mb-xs label">
              <q-icon name="event" size="18px" />
              วันที่อนุมัติ :
              {{ formatDateTime(history.changeAt) }}
            </div>

            <div class="text-weight-medium text-subtitle2 ellipsis-2 q-mb-xs label">
              <q-icon name="schedule" size="18px" />
              จำนวนชั่วโมง :
              {{ history.hourChange }}
            </div>

            <!-- Remark -->
            <div v-if="history.remark" class="text-weight-medium text-subtitle2 q-mt-xs label">
              <q-icon name="note" size="18px" />
              หมายเหตุ : {{ history.remark }}
            </div>
          </q-card-section>
        </q-card>
      </template>

      <!-- Empty State -->
      <div v-else class="row justify-center q-my-lg">
        <div class="text-center">
          <q-icon name="assignment" size="4em" color="grey-5" />
          <div class="text-h6 text-grey-6 q-mt-md">ไม่พบประวัติใบรับรอง</div>
          <div class="text-caption text-grey-5">ยังไม่มีการยื่นใบรับรองในระบบ</div>
        </div>
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

.program-card {
  position: relative;
  cursor: default;
  transition: all 0.2s ease;
}

.program-card__stripe {
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  border-radius: 4px 0 0 4px;
}

.stripe--blue {
  background: linear-gradient(180deg, #2196f3 0%, #1976d2 100%);
}

.stripe--green {
  background: linear-gradient(180deg, #4caf50 0%, #388e3c 100%);
}

.ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

@media (max-width: 600px) {
  .search-filter-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .searchbox {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .filter-btn-wrapper {
    width: 100%;
  }
}
</style>
