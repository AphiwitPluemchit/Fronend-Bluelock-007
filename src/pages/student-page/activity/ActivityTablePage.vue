<template>
  <q-layout>
    <q-page-container>
      <q-page class="q-pa-md">
        <!-- กล่องค้นหาและปุ่ม Filter -->
        <!-- <div class="row items-center justify-end q-gutter-sm q-mb-md q-mr-md">
          <div class="col-auto">
            <ActivitySearch />
          </div>

          <div class="col-auto">
            <FilterCard />
          </div>
        </div> -->
        <div class="row justify-start items-center">
          <div class="text-h4">กิจกรรมทั้งหมด</div>
        </div>

        <div class="row justify-between items-center">
          <div class="text-h6"></div>
          <div class="row">
            <q-input
              dense
              outlined
              v-model="search"
              placeholder="ค้นหา"
              class="q-mr-sm searchbox"
              :style="{ boxShadow: 'none' }"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn class="btnfilter" @click="showFilterDialog = true">
              <img src="icons\sort.svg" alt="Sort Icon" width="30" height="30" />
              <FilterDialog
                v-model="showFilterDialog"
                :categories="filterCategories"
                @apply="applyFilters"
              />
            </q-btn>
          </div>
        </div>
        <!-- แสดงกิจกรรม -->
        <div class="row q-col-gutter-md">
          <div
            class="col-xs-12 col-sm-6 col-md-6"
            v-for="activity in activitys"
            :key="activity.id || ''"
          >
            <ActivityCard :activity="activity" />
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ActivityCard from '../activity/ActivityCard.vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import { useStudentActivitystore } from 'src/stores/student-activity'
const StudentActivityStore = useStudentActivitystore()
const activitys = ref(StudentActivityStore.activity)
const search = ref()
const showFilterDialog = ref(false)
const filters = ref<{
  year: string[]
  major: string[]
  categoryActivity: string[]
}>({
  year: [],
  major: [],
  categoryActivity: [],
})
const filterCategories = ref(['year', 'major', 'categoryActivity'])
const applyFilters = (selectedFilters: {
  year: string[]
  major: string[]

  categoryActivity: string[]
}) => {
  filters.value = selectedFilters
  console.log('Filters Applied:', filters.value)
}
onMounted(async () => {
  await StudentActivityStore.fetchData()
})
// จำลองข้อมูลกิจกรรม
// const activities = ref<Activity[]>([
//   {
//     id: '1',
//     name: 'โครงการเตรียมความพร้อม SoftSkill กับบริษัท IRPCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
//     date: '10 มกราคม 2568',
//     time: '08:00 - 12:00',
//     hours: 4,
//     location: '4M210',
//     category: 'ชั่วโมงทักษะทางวิชาการ',
//     speaker: 'บริษัท IRPC จำกัด (มหาชน)',
//     description: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน)',
//     availableSeats: 50,
//     maxSeats: 100,
//     image: 'https://your-image-url.com/image1.jpg',
//   },
//   {
//     id: '2',
//     name: 'โครงการเตรียมความพร้อมสหกิจศึกษา',
//     date: '10 มกราคม 2568',
//     time: '08:00 - 12:00',
//     hours: 4,
//     location: '4M210',
//     category: 'ชั่วโมงทักษะทางวิชาการ',
//     speaker: 'บริษัท IRPC จำกัด (มหาชน)',
//     description: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน)',
//     availableSeats: 50,
//     maxSeats: 100,
//     image: 'https://your-image-url.com/image1.jpg',
//   },
//   {
//     id: '3',
//     name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
//     date: '10 มกราคม 2568',
//     time: '08:00 - 12:00',
//     hours: 4,
//     location: '4M210',
//     category: 'ชั่วโมงทักษะทางวิชาการ',
//     speaker: 'บริษัท IRPC จำกัด (มหาชน)',
//     description: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน)',
//     availableSeats: 50,
//     maxSeats: 100,
//     image: 'https://your-image-url.com/image1.jpg',
//   },
//   {
//     id: '4',
//     name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
//     date: '10 มกราคม 2568',
//     time: '08:00 - 12:00',
//     hours: 4,
//     location: '4M210',
//     category: 'ชั่วโมงทักษะทางวิชาการ',
//     speaker: 'บริษัท IRPC จำกัด (มหาชน)',
//     description: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน)',
//     availableSeats: 50,
//     maxSeats: 100,
//     image: 'https://your-image-url.com/image1.jpg',
//   },
//   {
//     id: '5',
//     name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
//     date: '10 มกราคม 2568',
//     time: '08:00 - 12:00',
//     hours: 4,
//     location: '4M210',
//     category: 'ชั่วโมงทักษะทางวิชาการ',
//     speaker: 'บริษัท IRPC จำกัด (มหาชน)',
//     description: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน)',
//     availableSeats: 50,
//     maxSeats: 100,
//     image: 'https://your-image-url.com/image1.jpg',
//   },
//   {
//     id: '6',
//     name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
//     date: '10 มกราคม 2568',
//     time: '08:00 - 12:00',
//     hours: 4,
//     location: '4M210',
//     category: 'ชั่วโมงทักษะทางวิชาการ',
//     speaker: 'บริษัท IRPC จำกัด (มหาชน)',
//     description: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน)',
//     availableSeats: 50,
//     maxSeats: 100,
//     image: 'https://your-image-url.com/image1.jpg',
//   },
//   {
//     id: '7',
//     name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
//     date: '10 มกราคม 2568',
//     time: '08:00 - 12:00',
//     hours: 4,
//     location: '4M210',
//     category: 'ชั่วโมงทักษะทางวิชาการ',
//     speaker: 'บริษัท IRPC จำกัด (มหาชน)',
//     description: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน)',
//     availableSeats: 50,
//     maxSeats: 100,
//     image: 'https://your-image-url.com/image1.jpg',
//   },
//   {
//     id: '8',
//     name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
//     date: '10 มกราคม 2568',
//     time: '08:00 - 12:00',
//     hours: 4,
//     location: '4M210',
//     category: 'ชั่วโมงทักษะทางวิชาการ',
//     speaker: 'บริษัท IRPC จำกัด (มหาชน)',
//     description: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน)',
//     availableSeats: 50,
//     maxSeats: 100,
//     image: 'https://your-image-url.com/image1.jpg',
//   },
// ])
</script>
