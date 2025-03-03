<template>
  <q-page class="q-pa-md">
    <!-- Breadcrumbs -->
    <q-breadcrumbs class="q-mb-md breadcrumbs-custom">
      <q-breadcrumbs>
        <q-icon name="event" class="q-mr-sm" size="18px" />
        <span class="breadcrumb-text">กิจกรรมทั้งหมด</span>
      </q-breadcrumbs>

      <q-breadcrumbs-separator>
        <q-icon name="chevron_right" size="18px" color="black" />
      </q-breadcrumbs-separator>

      <q-breadcrumbs-el label="รายละเอียดกิจกรรม" />
    </q-breadcrumbs>

    <div class="text-h5 text-bold q-mb-md">รายละเอียดกิจกรรม</div>
    <!-- <div class="column items-end" style="font-size: 18px">รายละเอียดกิจกรรม</div> -->
    <div class="activity-detail-card">
      <q-card-section class="row">
        <div class="col-12 col-md-4 text-center">
          <q-img class="activity-img" />
        </div>

        <div class="col-12 col-md-8 activity-details">
          <q-list dense>
            <q-item>
              <q-item-section class="col-8 col-md-3 text-right">
                <q-item-label class="q-mb-lg q-ml-md">ชื่อกิจกรรม : </q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">วันที่จัดกิจกรรม : </q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">เวลาที่จัดกิจกรรม : </q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">จำนวนชั่วโมงที่ได้รับ : </q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">สถานที่จัดกิจกรรม : </q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">ประเภทกิจกรรม : </q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">วิทยากร : </q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">รายละเอียดอื่นๆ : </q-item-label>
              </q-item-section>
              <q-item-section class="col-8 col-md-11">
                <q-item-label class="q-mb-lg q-ml-md">{{ activity?.name }}</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">{{ activity?.date }}</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">{{ activity?.time }}</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">{{ activity?.hours }} ชั่วโมง</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">{{ activity?.location }}</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">{{ activity?.category }}</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">{{ activity?.speaker }}</q-item-label>
                <q-item-label class="q-mb-lg q-ml-md">{{ activity?.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <q-btn
          v-if="activity"
          label="ลงทะเบียน"
          class="q-mt-md register-button"
          @click="handleRegisterClick"
        />
      </q-card-section>
    </div>
    <!-- Confirm Dialog-->
    <RegisterConfirmDialog v-model="showDialog" @confirm="register" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { type Activity } from './ActivitiesTablePage.vue'
import RegisterConfirmDialog from './RegisterConfirmDialog.vue'

// ดึงค่าจาก route
const route = useRoute()
const activityId = Number(route.params.id)
const showDialog = ref(false)

// กําหนดค่าเริ่มต้น
const activity = ref<Activity>()

onMounted(() => {
  activity.value = activities.value.find((activity) => activity.id === activityId)
})

const handleRegisterClick = () => {
  showDialog.value = true
  console.log('Button clicked, showDialog:', showDialog.value)
}

// จำลองข้อมูลกิจกรรม
const activities = ref<Activity[]>([
  {
    id: 1,
    name: 'โครงการเตรียมความพร้อม SoftSkill กับบริษัท IRPC',
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
    name: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้าน SoftSkill กับบริษัท IRPC จำกัด (มหาชน)',
    date: '10 มกราคม 2568',
    time: '08:00 - 12:00',
    hours: 4,
    location: '4M210',
    category: 'ชั่วโมงทักษะทางวิชาการ',
    speaker: 'บริษัท IRPC จำกัด (มหาชน)',
    description: 'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน) แบบ2',
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
    description:
      'โครงการเตรียมความพร้อมสหกิจศึกษาด้านSoftskill กับ บริษัท IRPC จำกัด (มหาชน)fkdsdjkjl;kjksjdfsakla;jsfjdskfjlkdaslkoejfiroejfjksdodejfldskoekfkfsdjikdsfidjskjdsjlsa;sdjieifhdeiwijdsolasjasiwjdkewlajdusjdklskdiwsjl',
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

const register = () => {
  console.log('ลงทะเบียนสำเร็จ!')
}
</script>

<style scoped>
.activity-detail-card {
  /* ระยะห่างระหว่างรูปภาพและข้อมูล */
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  font-size: 18px;
}

.activity-img {
  width: 300px;
  max-width: 300px;
  height: 300px;
  background-color: #d9d9d9;
  border-radius: 10px;
  /* ทำขอบมน */
}

.activity-details {
  flex-direction: column;
  justify-content: center;
}

.register-button {
  background-color: #2fa54d;
  color: white;
  padding: 5px 20px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 18px;
  margin: auto;
  width: 180px;
}
.q-item-label {
  margin-bottom: 25px !important;
}

.q-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.q-item-section {
  padding-bottom: 25px !important;
}
</style>
