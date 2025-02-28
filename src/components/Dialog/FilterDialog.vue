<script setup lang="ts">
import { ref, defineEmits, defineProps, computed } from 'vue'

// Props
const props = defineProps<{
  modelValue: boolean // ควบคุมการเปิด-ปิด dialog
  categories: string[]
}>()

const emit = defineEmits(['update:modelValue', 'apply'])

// ตัวเลือก
const options = {
  year: ['1', '2', '3', '4'],
  major: ['CS', 'SE', 'ITDI', 'AAI'],
  statusStudent: ['ชั่วโมงครบแล้ว', 'ชั่วโมงน้อย', 'ชั่วโมงน้อยมาก', 'พ้นสภาพ'],
  statusActivity: ['กำลังวางแผน', 'เปิดลงทะเบียน', 'ปิดลงทะเบียน', 'เสร็จสิ้น', 'ยกเลิก'],
  categoryActivity: ['ชั่วโมงเตรียมความพร้อม', 'ชั่วโมงทักษะทางวิชาการ'],
}

// ฟิลเตอร์ที่เลือก
const filters = ref({
  year: [] as string[],
  major: [] as string[],
  statusStudent: [] as string[],
  statusActivity: [] as string[],
  categoryActivity: [] as string[],
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
  emit('update:modelValue', false)
}

const applyFilters = () => {
  emit('apply', filters.value)
  closeMenu()
}
</script>

<template>
  <q-menu :model-value="modelValue"  :transition-show="'jump-down'" :transition-hide="'jump-up'"   :offset="[0, 5]" >
    <q-card class="q-pa-md" style="min-width: 450px; max-width: 450px; overflow: hidden;">
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
            <div style="margin: auto">{{ categoryActivity }}</div>
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
            <div style="margin: auto">{{ statusActivity }}</div>
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
            <div style="margin: auto">{{ statusStudent }}</div>
          </q-chip>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Cancel" class="btnreject" @click="closeMenu" />
        <q-btn label="Apply" class="btnconfirm" @click="applyFilters" />
      </q-card-actions>
    </q-card>
  </q-menu>
</template>

<style scoped>

</style>
