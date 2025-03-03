<template>
  <q-layout>
    <q-page-container>
      <q-page class="q-pa-md">
        <!-- กล่องค้นหาและปุ่ม Filter -->
        <div class="row items-center justify-end q-gutter-sm q-mb-md q-mr-md">
          <!-- กล่องค้นหา -->
          <div class="col-auto">
            <ActivitySearch />
          </div>

          <!-- ปุ่ม Filter -->
          <div class="col-auto">
            <FilterCard />
          </div>
        </div>

        <!-- แสดงกิจกรรม -->
        <div class="row q-col-gutter-md">
          <div
            class="col-xs-12 col-sm-6 col-md-6"
            v-for="activity in activities"
            :key="activity.id"
          >
            <ActivityCard :activity="activity" :activities="activities" />
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ActivityCard from '../activity/ActivityCard.vue'
import ActivitySearch from '../activity/ActivitySearch.vue'
import FilterCard from '../activity/FilterCard.vue'

export interface Activity {
  id: number
  name: string
  date: string
  time: string
  hours: number
  location: string
  category: string
  speaker: string
  description: string
  availableSeats: number
  maxSeats: number
  image: string
}

// จำลองข้อมูลกิจกรรม
const activities = ref<Activity[]>([
  {
    id: 1,
    name: 'โครงการเตรียมความพร้อม SoftSkill กับบริษัท IRPCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    date: '10 มกราคม 2568',
    time: '08:00 - 12:00',
    hours: 4,
    location: '4M210',
    category: 'ชั่วโมงทักษะทางวิชาการ',
    speaker: 'บริษัท IRPC จำกัด (มหาชน)',
    description: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน)',
    availableSeats: 50,
    maxSeats: 100,
    image: 'https://your-image-url.com/image1.jpg',
  },
  {
    id: 2,
    name: 'โครงการเตรียมความพร้อมสหกิจศึกษา',
    date: '10 มกราคม 2568',
    time: '08:00 - 12:00',
    hours: 4,
    location: '4M210',
    category: 'ชั่วโมงทักษะทางวิชาการ',
    speaker: 'บริษัท IRPC จำกัด (มหาชน)',
    description: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน)',
    availableSeats: 50,
    maxSeats: 100,
    image: 'https://your-image-url.com/image1.jpg',
  },
  {
    id: 3,
    name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
    date: '10 มกราคม 2568',
    time: '08:00 - 12:00',
    hours: 4,
    location: '4M210',
    category: 'ชั่วโมงทักษะทางวิชาการ',
    speaker: 'บริษัท IRPC จำกัด (มหาชน)',
    description: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน)',
    availableSeats: 50,
    maxSeats: 100,
    image: 'https://your-image-url.com/image1.jpg',
  },
  {
    id: 4,
    name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
    date: '10 มกราคม 2568',
    time: '08:00 - 12:00',
    hours: 4,
    location: '4M210',
    category: 'ชั่วโมงทักษะทางวิชาการ',
    speaker: 'บริษัท IRPC จำกัด (มหาชน)',
    description: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน)',
    availableSeats: 50,
    maxSeats: 100,
    image: 'https://your-image-url.com/image1.jpg',
  },
  {
    id: 5,
    name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
    date: '10 มกราคม 2568',
    time: '08:00 - 12:00',
    hours: 4,
    location: '4M210',
    category: 'ชั่วโมงทักษะทางวิชาการ',
    speaker: 'บริษัท IRPC จำกัด (มหาชน)',
    description: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน)',
    availableSeats: 50,
    maxSeats: 100,
    image: 'https://your-image-url.com/image1.jpg',
  },
  {
    id: 6,
    name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
    date: '10 มกราคม 2568',
    time: '08:00 - 12:00',
    hours: 4,
    location: '4M210',
    category: 'ชั่วโมงทักษะทางวิชาการ',
    speaker: 'บริษัท IRPC จำกัด (มหาชน)',
    description: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน)',
    availableSeats: 50,
    maxSeats: 100,
    image: 'https://your-image-url.com/image1.jpg',
  },
  {
    id: 7,
    name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
    date: '10 มกราคม 2568',
    time: '08:00 - 12:00',
    hours: 4,
    location: '4M210',
    category: 'ชั่วโมงทักษะทางวิชาการ',
    speaker: 'บริษัท IRPC จำกัด (มหาชน)',
    description: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน)',
    availableSeats: 50,
    maxSeats: 100,
    image: 'https://your-image-url.com/image1.jpg',
  },
  {
    id: 8,
    name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
    date: '10 มกราคม 2568',
    time: '08:00 - 12:00',
    hours: 4,
    location: '4M210',
    category: 'ชั่วโมงทักษะทางวิชาการ',
    speaker: 'บริษัท IRPC จำกัด (มหาชน)',
    description: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน)',
    availableSeats: 50,
    maxSeats: 100,
    image: 'https://your-image-url.com/image1.jpg',
  },
])
</script>
