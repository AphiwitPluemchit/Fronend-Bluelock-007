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
            <ActivityCard :activity="activity" />
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import ActivityCard from '../activity/ActivityCard.vue'
import ActivitySearch from '../activity/ActivitySearch.vue'
import FilterCard from '../activity/FilterCard.vue'

interface Activity {
  id: number
  name: string
  date: string
  availableSeats: number
  maxSeats: number
  image: string
}

// จำลองข้อมูลกิจกรรม
const activities: Activity[] = [
  {
    id: 1,
    name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
    date: '10 มกราคม 2568',
    availableSeats: 50,
    maxSeats: 100,
    image: 'image',
  },
  {
    id: 2,
    name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
    date: '10 มกราคม 2568',
    availableSeats: 30,
    maxSeats: 100,
    image: 'image',
  },
  {
    id: 3,
    name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
    date: '10 มกราคม 2568',
    availableSeats: 50,
    maxSeats: 200,
    image: 'image',
  },
  {
    id: 4,
    name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
    date: '10 มกราคม 2568',
    availableSeats: 40,
    maxSeats: 120,
    image: 'image',
  },
  {
    id: 5,
    name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
    date: '10 มกราคม 2568',
    availableSeats: 50,
    maxSeats: 100,
    image: 'image',
  },
  {
    id: 6,
    name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
    date: '10 มกราคม 2568',
    availableSeats: 50,
    maxSeats: 100,
    image: 'image',
  },
  {
    id: 7,
    name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
    date: '10 มกราคม 2568',
    availableSeats: 50,
    maxSeats: 100,
    image: 'image',
  },
  {
    id: 8,
    name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
    date: '10 มกราคม 2568',
    availableSeats: 50,
    maxSeats: 100,
    image: 'image',
  },
]
</script>
