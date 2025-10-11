<script setup lang="ts">
import { ref, defineEmits, computed, watch } from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const emit = defineEmits(['apply'])
const showFilterDialog = ref(false)

// ตัวเลือก
const options = {
  skillType: ['hard', 'soft'],
  status: ['pending', 'approved', 'rejected'],
}

// Labels
function getSkillTypeLabel(skillType: string) {
  switch (skillType) {
    case 'hard':
      return 'ทักษะทางวิชาการ'
    case 'soft':
      return 'ทักษะเตรียมความพร้อม'
    default:
      return skillType
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'pending':
      return 'รออนุมัติ'
    case 'approved':
      return 'อนุมัติแล้ว'
    case 'rejected':
      return 'ปฏิเสธ'
    default:
      return status
  }
}

// ฟิลเตอร์
const filters = ref({
  skillType: [] as string[],
  status: [] as string[],
})

const initialFilters = ref<typeof filters.value>(cloneDeep(filters.value))
const tempFilters = ref(cloneDeep(filters.value))

watch(showFilterDialog, (val) => {
  if (val) {
    initialFilters.value = cloneDeep(filters.value)
    tempFilters.value = cloneDeep(filters.value)
  }
})

const closeMenu = () => {
  tempFilters.value = cloneDeep(initialFilters.value)
  showFilterDialog.value = false
}

const applyFilters = () => {
  filters.value = cloneDeep(tempFilters.value)
  emit('apply', filters.value)
  showFilterDialog.value = false
}

// Responsive
const isMobilePortrait = computed(() => $q.screen.lt.sm && $q.screen.height > $q.screen.width)
const isMobileLandscape = computed(() => $q.screen.lt.sm && $q.screen.width > $q.screen.height)
const isTablet = computed(() => $q.screen.gt.xs && $q.screen.lt.md)

function getChipClass(category: keyof typeof tempFilters.value, value: string) {
  const baseClass = 'q-mb-sm'
  const selectedClass = tempFilters.value[category].includes(value) ? 'selected' : ''

  if (isMobilePortrait.value) return `${baseClass} mobile-portrait ${selectedClass}`
  if (isMobileLandscape.value) return `${baseClass} mobile-landscape ${selectedClass}`
  if (isTablet.value) return `${baseClass} tablet ${selectedClass}`
  return `${baseClass} ${selectedClass}`
}

function toggleFilter(category: keyof typeof tempFilters.value, value: string) {
  const index = tempFilters.value[category].indexOf(value)
  if (index === -1) {
    tempFilters.value[category].push(value)
  } else {
    tempFilters.value[category].splice(index, 1)
  }
}
</script>

<template>
  <q-btn class="btnfilter" :style="{ border: '1px solid #ccc' }">
    <q-icon name="filter_list_alt"></q-icon>
    <q-menu
      v-model="showFilterDialog"
      :transition-show="'jump-down'"
      :transition-hide="'jump-up'"
      :offset="[0, 5]"
      style="border-radius: 10px; overflow: visible"
    >
      <q-card
        class="q-pa-md"
        style="
          width: 90vw;
          max-width: 450px;
          max-height: 80vh;
          overflow-y: auto;
          border-radius: 10px;
        "
      >
        <q-card-section class="filter-section" style="max-height: 55vh; overflow-y: auto">
          <!-- ประเภททักษะ -->
          <div class="q-mt-md">
            <p class="q-mb-sm text-h6">ประเภททักษะ</p>
            <div class="chip-container">
              <q-chip
                v-for="skillType in options.skillType"
                :key="skillType"
                clickable
                :class="['medium-width-chip', getChipClass('skillType', skillType)]"
                @click="toggleFilter('skillType', skillType)"
              >
                <div class="text-center full-width">
                  {{ getSkillTypeLabel(skillType) }}
                </div>
              </q-chip>
            </div>
          </div>

          <!-- สถานะใบรับรอง -->
          <div class="q-mt-md">
            <p class="q-mb-sm text-h6">สถานะใบรับรอง</p>
            <div class="chip-container">
              <q-chip
                v-for="status in options.status"
                :key="status"
                clickable
                :class="['medium-width-chip', getChipClass('status', status)]"
                @click="toggleFilter('status', status)"
              >
                <div class="text-center full-width">{{ getStatusLabel(status) }}</div>
              </q-chip>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="ยกเลิก" class="btnreject" @click="closeMenu" />
          <q-btn label="ยืนยัน" class="btnconfirm" @click="applyFilters" />
        </q-card-actions>
      </q-card>
    </q-menu>
  </q-btn>
</template>

<style scoped>
.full-width {
  width: 100% !important;
}

.mobile-portrait {
  width: 90% !important;
}

.mobile-landscape {
  width: 70% !important;
}

.tablet {
  width: 60% !important;
}

.chip-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.medium-width-chip {
  height: 35px;
  flex: 0 1 48%;
  margin: 1%;
  min-width: 100px;
  max-width: 200px;
  text-align: center;
  justify-content: center;
}

/* Desktop (PC) */
@media (min-width: 1025px) {
  .medium-width-chip {
    flex: 0 1 48%;
    min-width: 150px;
    height: 35px;
    font-size: 14px;
    padding: 4px 10px;
  }
}

/* Responsive - ลดขนาด */
@media (max-width: 1024px) {
  .medium-width-chip {
    flex: 0 1 48%;
    min-width: 100px;
    height: 28px;
    font-size: 12px;
    padding: 2px 6px;
  }

  .filter-section {
    padding-top: 0px !important;
  }

  .q-mt-md {
    margin-top: 3px !important;
  }
}

/* Chip selected state */
.selected {
  background-color: #1976d2 !important;
  color: white !important;
}
</style>
