<script setup lang="ts">
import { ref, defineEmits, defineProps, computed, watch } from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Props
const props = defineProps<{
  categories: string[]
  years?: string[]
  majors?: string[]
  statusPrograms?: string[]
  categoryPrograms?: string[]
  studentStatus?: string[]
  statusCertificate?: string[]
}>()

const emit = defineEmits(['update:modelValue', 'apply'])
const showFilterDialog = ref(false)

// ตัวเลือก
const options = {
  year: ['1', '2', '3', '4'],
  major: ['CS', 'SE', 'ITDI', 'AAI'],
  studentStatus: ['3', '2', '1', '4'],
  statusProgram: ['planning', 'open', 'close', 'success', 'cancel'],
  categoryProgram: ['soft', 'hard'],
  statusCertificate: ['pending', 'approved', 'rejected'],
}

// 'ชั่วโมงเตรียมความพร้อม', 'ชั่วโมงทักษะทางวิชาการ'
function programStatusLebel(status: string) {
  switch (status) {
    case 'planning':
      return 'กำลังวางแผน'
    case 'open':
      return 'เปิดลงทะเบียน'
    case 'close':
      return 'ปิดลงทะเบียน'
    case 'success':
      return 'เสร็จสิ้น'
    case 'cancel':
      return 'ยกเลิก'
  }
  return status
}
function programCategoryLebel(category: string) {
  switch (category) {
    case 'soft':
      return 'เตรียมความพร้อม'
    case 'hard':
      return 'ทักษะทางวิชาการ'
  }
  return category
}
const getStatusText = (status: string) => {
  const numStatus = parseInt(status, 10)
  switch (numStatus) {
    case 0:
      return 'พ้นสภาพ'
    case 1:
      return 'ชั่วโมงน้อยมาก'
    case 2:
      return 'ชั่วโมงน้อย'
    case 3:
      return 'ชั่วโมงครบแล้ว'
    case 4:
      return 'ออกผึกแล้ว'
    default:
      return '-'
  }
}
//สถานะใบCertificate
const getStatusCertificateText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'รออนุมัติ'
    case 'approved':
      return 'อนุมัติ'
    case 'rejected':
      return 'ไม่อนุมัติ'
  }
  return status
}

// ฟิลเตอร์จริง
const filters = ref({
  year: props.years ? props.years.map((y) => y.toString()) : ([] as string[]),
  major: props.majors ?? ([] as string[]),
  statusProgram: props.statusPrograms ?? ([] as string[]),
  categoryProgram: props.categoryPrograms ?? ([] as string[]),
  studentStatus: props.studentStatus ?? ([] as string[]),
  statusCertificate: props.statusCertificate ?? ([] as string[]),
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
  filters.value = cloneDeep(initialFilters.value)
  showFilterDialog.value = false
  emit('update:modelValue', false)
}
const applyFilters = () => {
  filters.value = cloneDeep(tempFilters.value)
  emit('apply', filters.value)
  showFilterDialog.value = false
}

const availableCategories = computed(() => props.categories)

// responsive
const isMobilePortrait = computed(() => $q.screen.lt.sm && $q.screen.height > $q.screen.width)
const isMobileLandscape = computed(() => $q.screen.lt.sm && $q.screen.width > $q.screen.height)
const isTablet = computed(() => $q.screen.gt.xs && $q.screen.lt.md)

function getChipClass(category: keyof typeof tempFilters.value, value: string) {
  const baseClass = 'q-mb-sm'
  const selectedClass = tempFilters.value[category].includes(value) ? 'selected' : ''

  if (isMobilePortrait.value) return `${baseClass} mobile-portrait ${selectedClass}`
  if (isMobileLandscape.value) return `${baseClass} mobile-landscape ${selectedClass}`
  if (isTablet.value) return `${baseClass} tablet ${selectedClass}`
  // จอ PC
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
watch(
  () => ({
    years: props.years,
    majors: props.majors,
    statusPrograms: props.statusPrograms,
    categoryPrograms: props.categoryPrograms,
    studentStatus: props.studentStatus,
    statusCertificate: props.statusCertificate,
  }),
  (p) => {
    // ✅ sync props -> filters ภายใน
    filters.value.year = (p.years ?? []).map(String)
    filters.value.major = p.majors ?? []
    filters.value.statusProgram = p.statusPrograms ?? []
    filters.value.categoryProgram = p.categoryPrograms ?? []
    filters.value.studentStatus = p.studentStatus ?? []
    filters.value.statusCertificate = p.statusCertificate ?? []

    // ✅ ให้ชิปใน UI สะท้อน “ค่าปัจจุบัน” เสมอ
    if (!showFilterDialog.value) {
      tempFilters.value = cloneDeep(filters.value)
    }
  },
  { immediate: true, deep: true },
)
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
        <q-card-section class="filter-section q-gutter-y-md" style="max-height: 55vh; overflow-y: auto">
          <!-- ประเภทโครงการ -->
          <div v-if="availableCategories.includes('categoryProgram')" class="">
            <p class="q-mb-sm text-h6">ประเภทโครงการ</p>
            <div class="chip-container">
              <q-chip
                v-for="categoryProgram in options.categoryProgram"
                :key="categoryProgram"
                clickable
                :class="['medium-width-chip', getChipClass('categoryProgram', categoryProgram)]"
                @click="toggleFilter('categoryProgram', categoryProgram)"
              >
                <div class="text-center full-width">
                  {{ programCategoryLebel(categoryProgram) }}
                </div>
              </q-chip>
            </div>
          </div>

          <!-- สถานะโครงการ -->
          <div v-if="availableCategories.includes('statusProgram')" class="">
            <p class="q-mb-sm text-h6">สถานะโครงการ</p>
            <div class="chip-container">
              <q-chip
                v-for="statusProgram in options.statusProgram"
                :key="statusProgram"
                clickable
                :class="['medium-width-chip', getChipClass('statusProgram', statusProgram)]"
                @click="toggleFilter('statusProgram', statusProgram)"
              >
                <div class="text-center full-width">{{ programStatusLebel(statusProgram) }}</div>
              </q-chip>
            </div>
          </div>

          <!-- สาขา -->
          <div v-if="availableCategories.includes('major')" class="">
            <p class="q-mb-sm text-h6">สาขา</p>
            <div class="chip-container">
              <q-chip
                v-for="major in options.major"
                :key="major"
                clickable
                :class="['quarter-width-chip', getChipClass('major', major)]"
                @click="toggleFilter('major', major)"
              >
                <div class="text-center full-width">{{ major }}</div>
              </q-chip>
            </div>
          </div>

          <!-- ชั้นปี -->
          <div v-if="availableCategories.includes('year')" class="">
            <p class="q-mb-sm text-h6">ชั้นปี</p>
            <div class="chip-container">
              <q-chip
                v-for="year in options.year"
                :key="year"
                clickable
                :class="['quarter-width-chip', getChipClass('year', year)]"
                @click="toggleFilter('year', year)"
              >
                <div class="text-center full-width">{{ year }}</div>
              </q-chip>
            </div>
          </div>

          <!-- สถานะนิสิต -->
          <div v-if="availableCategories.includes('studentStatus')" class="">
            <p class="q-mb-sm text-h6">สถานะนิสิต</p>
            <div class="chip-container">
              <q-chip
                v-for="studentStatus in options.studentStatus"
                :key="studentStatus"
                clickable
                :class="['quarter-width-chip', getChipClass('studentStatus', studentStatus)]"
                @click="toggleFilter('studentStatus', studentStatus)"
              >
                <div class="text-center full-width">{{ getStatusText(studentStatus) }}</div>
              </q-chip>
            </div>
          </div>

          <!-- สถานะCertificate -->
          <div v-if="availableCategories.includes('statusCertificate')" class="">
            <p class="q-mb-sm text-h6">สถานะใบรับรอง</p>
            <div class="chip-container">
              <q-chip
                v-for="statusCertificate in options.statusCertificate"
                :key="statusCertificate"
                clickable
                :class="['medium-width-chip', getChipClass('statusCertificate', statusCertificate)]"
                @click="toggleFilter('statusCertificate', statusCertificate)"
                style="height: 35px; width: 120px"
              >
                <div style="margin: auto">{{ getStatusCertificateText(statusCertificate) }}</div>
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
.half-width {
  width: 48% !important;
  margin-right: 2%;
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
/* ปุ่มประเภทโครงการ */
.category-chip {
  height: 35px;
  width: 170px;
}
/* ปุ่มสถานะโครงการ */
.status-chip {
  height: 35px;
  width: 120px;
}
/* ปุ่มสาขา */
.quarter-width-chip {
  height: 35px;
  flex: 0 1 48%;
  margin: 1%;
  min-width: 60px;
}
.medium-width-chip {
  height: 35px;
  flex: 0 1 48%;
  margin: 1%;
  min-width: 100px;
  max-width: 178px;
  text-align: center;
  justify-content: center;
}

.center-mobile-container {
  display: flex;
  flex-wrap: wrap;
}
.filter-section {
  padding-top: 0px !important;
}
@media (max-width: 1024px) {
  .center-mobile-container {
    justify-content: center;
  }
}
/* Desktop (PC) - คงขนาดเดิม */
@media (min-width: 1025px) {
  .quarter-width-chip {
    flex: 0 1 auto;
    min-width: 85px;
    height: 35px;
    font-size: 14px;
    padding: 4px 10px;
  }
}

/* Responsive - ลดขนาด */
@media (max-width: 1024px) {
  .quarter-width-chip {
    flex: 0 1 48%;
    min-width: 60px;
    height: 27px;
    font-size: 14px;
    padding: 2px 6px;
  }
  .category-chip,
  .status-chip {
    height: 28px;
    font-size: 12px;
    padding: 2px 6px;
  }
}

/* responsive: */
@media (max-width: 1024px) {
  .category-chip,
  .status-chip {
    flex: 0 1 100%;
    min-width: 150px;
  }
}
/* ลด padding-top เฉพาะในหน้าจอมือถือและแท็บเล็ต */
@media (max-width: 1024px) {
  .filter-section {
    padding-top: 0px !important; /* ปรับตามต้องการ เช่น 0px หรือ 4px */
  }

  /* ปรับ margin-top หัวข้อ เช่น 'ประเภทโครงการ' */
  /* .q-mt-md {
    margin-top: 3px !important;
  } */
}
</style>
