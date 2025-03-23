<script setup lang="ts">
import { ref, defineEmits, defineProps, computed } from 'vue'

// Props
const props = defineProps<{
  categories: string[]
  years?: number[]
  majors?: string[]
  statusActivities?: string[]
  categoryActivities?: string[]
  statusStudent?: string[]
}>()

const emit = defineEmits(['update:modelValue', 'apply'])
const showFilterDialog = ref(false)

// ตัวเลือก
const options = {
  year: ['1', '2', '3', '4'],
  major: ['CS', 'SE', 'ITDI', 'AAI'],
  statusStudent: ['3', '2', '1', '0'],
  statusActivity: ['planning', 'open', 'close', 'success', 'cancel'],
  categoryActivity: ['soft', 'hard'],
}

// 'ชั่วโมงเตรียมความพร้อม', 'ชั่วโมงทักษะทางวิชาการ'
function activityStatusLebel(status: string) {
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
}

function activityCategoryLebel(category: string) {
  switch (category) {
    case 'soft':
      return 'ชั่วโมงเตรียมความพร้อม'
    case 'hard':
      return 'ชั่วโมงทักษะทางวิชาการ'
  }
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
    default:
      return '-'
  }
}

// ฟิลเตอร์ที่เลือก
const filters = ref({
  year: props.years ? props.years?.map((year) => year.toString()) : ([] as string[]),
  major: props.majors ? props.majors : ([] as string[]),
  statusActivity: props.statusActivities ? props.statusActivities : ([] as string[]),
  categoryActivity: props.categoryActivities ? props.categoryActivities : ([] as string[]),
  statusStudent: props.statusStudent ? props.statusStudent : ([] as string[]),
})

// ตรวจสอบหมวดที่ต้องแสดง
const availableCategories = computed(() => props.categories)

// ฟังก์ชันสำหรับเลือก/ยกเลิกการเลือก
const toggleFilter = (category: keyof typeof filters.value, value: string) => {
  const index = filters.value[category].indexOf(value)
  if (index === -1) {
    filters.value[category].push(value) // เพิ่มค่า
  } else {
    filters.value[category].splice(index, 1) // เอาค่าออก
  }
}

const closeMenu = () => {
  showFilterDialog.value = false
  emit('update:modelValue', false)
}

const applyFilters = () => {
  emit('apply', filters.value)
  closeMenu()
}
</script>

<template>
  <q-btn class="btnfilter">
    <img src="icons\sort.svg" alt="Sort Icon" width="30" height="30" />
    <q-menu
      v-model="showFilterDialog"
      :transition-show="'jump-down'"
      :transition-hide="'jump-up'"
      :offset="[0, 5]"
      style="border-radius: 10px; overflow: visible"
    >
      <q-card class="q-pa-md" style="min-width: 450px; max-width: 450px; border-radius: 10px">
        <q-card-section>
          <!-- categoryActivity -->
          <div v-if="availableCategories.includes('categoryActivity')" class="q-mt-md">
            <p class="q-mb-sm text-h6">ประเภทกิจกรรม</p>
            <q-chip
              v-for="categoryActivity in options.categoryActivity"
              :key="categoryActivity"
              clickable
              :class="{ selected: filters.categoryActivity.includes(categoryActivity) }"
              @click="toggleFilter('categoryActivity', categoryActivity)"
              style="height: 35px; width: 170px"
            >
              <div style="margin: auto">{{ activityCategoryLebel(categoryActivity) }}</div>
            </q-chip>
          </div>
          <!-- statusActivity -->
          <div v-if="availableCategories.includes('statusActivity')" class="q-mt-md">
            <p class="q-mb-sm text-h6">สถานะกิจกรรม</p>
            <q-chip
              v-for="statusActivity in options.statusActivity"
              :key="statusActivity"
              clickable
              :class="{ selected: filters.statusActivity.includes(statusActivity) }"
              @click="toggleFilter('statusActivity', statusActivity)"
              style="height: 35px; width: 120px"
            >
              <div style="margin: auto">{{ activityStatusLebel(statusActivity) }}</div>
            </q-chip>
          </div>
          <!-- major -->
          <div v-if="availableCategories.includes('major')" class="q-mt-md">
            <p class="q-mb-sm text-h6">สาขา</p>
            <q-chip
              v-for="major in options.major"
              :key="major"
              clickable
              :class="{ selected: filters.major.includes(major) }"
              @click="toggleFilter('major', major)"
              style="height: 35px; width: 80px"
            >
              <div style="margin: auto">{{ major }}</div>
            </q-chip>
          </div>
          <!-- availableCategories -->
          <div v-if="availableCategories.includes('year')" class="q-mt-md">
            <p class="q-mb-sm text-h6">ชั้นปี</p>
            <q-chip
              v-for="year in options.year"
              :key="year"
              clickable
              :class="{ selected: filters.year.includes(year) }"
              @click="toggleFilter('year', year)"
              style="height: 35px; width: 80px"
            >
              <div style="margin: auto">{{ year }}</div>
            </q-chip>
          </div>
          <!-- statusStudent -->
          <div v-if="availableCategories.includes('statusStudent')" class="q-mt-md">
            <p class="q-mb-sm text-h6">สถานะนิสิต</p>

            <q-chip
              v-for="statusStudent in options.statusStudent"
              :key="statusStudent"
              clickable
              :class="{ selected: filters.statusStudent.includes(statusStudent) }"
              @click="toggleFilter('statusStudent', statusStudent)"
              style="height: 35px; width: 120px"
            >
              <div style="margin: auto">{{ getStatusText(statusStudent) }}</div>
            </q-chip>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="ยกเลิก" class="btnreject" @click="closeMenu" />
          <q-btn label="ยืนยัน" class="btnconfirm" @click="applyFilters" />
        </q-card-actions>
      </q-card> </q-menu
  ></q-btn>
</template>

<style scoped>
</style>