<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import type { Program } from 'src/types/program'
import ProgramType from 'src/components/programType.vue'

const router = useRouter()

defineProps<{ program: Program }>()

const activities = ref<Program[]>([])
const slide = ref(0)
let slideTimer: number | null = null

const gotoCalendarPage = async () => {
  await router.push('/Student/ProgramCalendar')
}
const gotoProfile = async () => {
  await router.push('/Student/RecordPage')
}
const gotoProgramTablePage = async () => {
  await router.push('/Student/ProgramTablePage')
}
const OnlineCoursesPage = async () => {
  await router.push('/Student/OnlineCoursesPage')
}
const goToDetail = async(id?: string) => {
  await router.push(`/Student/Program/ProgramDetail/${id}`)
}

const fetchActivities = async () => {
  try {
    const response = await api.get('/programs', {
      params: {
        status: 'open',
        limit: 10,
      },
    })
    activities.value = response.data.data
    if (activities.value.length > 0) {
      startAutoSlide()
    }
  } catch (error) {
    console.error('Error fetching activities:', error)
  }
}

const startAutoSlide = () => {
  if (slideTimer) {
    clearInterval(slideTimer)
  }

  slideTimer = window.setInterval(() => {
    slide.value = (slide.value + 1) % activities.value.length
  }, 10000)
}

onMounted(async () => {
  await fetchActivities()
  return () => {
    if (slideTimer) {
      clearInterval(slideTimer)
    }
  }
})
</script>

<template>
  <q-page>
    <div class="container">
      <div class="activity-carousel">
        <q-carousel v-model="slide" animated infinite height="450px">
          <q-carousel-slide
            v-for="(activity, index) in activities"
            :key="`activity-${activity.id || index}`"
            :name="index"
            class="no-wrap flex-center"
          >
            <div class="card-wrapper">
              <!-- ปุ่มเลื่อนซ้าย -->
              <q-btn
                flat
                round
                dense
                icon="chevron_left"
                class="nav-btn left"
                @click="slide = (slide - 1 + activities.length) % activities.length"
              />

              <!-- การ์ดกิจกรรม -->
              <q-card class="my-card" @click="goToDetail(activity.id)" clickable hover>
                <div class="image-wrapper">
                  <q-img
                    :src="api.defaults.baseURL + '/uploads/program/images/' + activity.file"
                    class="activity-image"
                  />
                </div>

                <q-card-section>
                  <div class="row items-center q-gutter-sm justify-between">
                    <div class="text-h6 q-mb-none">{{ activity.name }}</div>
                    <ProgramType
                      style="align-items: end"
                      v-if="activity.skill === 'hard' || activity.skill === 'soft'"
                      :skill="activity.skill === 'hard' ? 'hardSkill' : 'softSkill'"
                    />
                  </div>

                  <!-- ข้อมูลวันที่ / เวลา / จำนวน -->
                  <div
                    class="text-subtitle2 q-mt-xs activity-info"
                    v-if="activity.programItems?.[0]?.dates?.[0]"
                  >
                    <span class="info-block">
                      <q-icon name="calendar_today" />
                      วันที่จัด:
                      {{
                        new Date(activity.programItems[0].dates[0].date).toLocaleDateString(
                          'th-TH',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          },
                        )
                      }}
                    </span>

                    <span class="info-block">
                      <q-icon name="access_time" />
                      เวลา:
                      {{ activity.programItems[0].dates[0].stime }} -
                      {{ activity.programItems[0].dates[0].etime }}
                    </span>

                    <span class="info-block">
                      <q-icon name="weekend" />
                      จำนวนที่รับ:
                      {{ activity.programItems[0].enrollmentCount }}/
                      {{ activity.programItems[0].maxParticipants }}
                    </span>
                  </div>
                </q-card-section>
              </q-card>

              <!-- ปุ่มเลื่อนขวา -->
              <q-btn
                flat
                round
                dense
                icon="chevron_right"
                class="nav-btn right"
                @click="slide = (slide + 1) % activities.length"
              />
            </div>
          </q-carousel-slide>
        </q-carousel>
      </div>

      <div class="menu">
        <p class="menu-title">เมนู</p>
        <div class="menu-row">
          <!-- calendar -->
          <q-card class="menu-card" @click="gotoCalendarPage">
            <q-icon name="calendar_today" class="icon" />
            <p class="label-title">ตารางโครงการ</p>
            <p class="label">ตรวจสอบโครงการทั้งหมด</p>
            <p class="label">เพื่อลงทะเบียนเข้าร่วม</p>
          </q-card>

          <!-- activity -->
          <q-card class="menu-card" @click="gotoProgramTablePage">
            <q-icon name="event" class="icon" />
            <p class="label-title">โครงการทั้งหมด</p>
            <p class="label">ตรวจสอบกิจกรรมทั้งหมด</p>
            <p class="label">เพื่อลงทะเบียนเข้าร่วม</p>
          </q-card>

          <!-- course -->
          <q-card class="menu-card" @click="OnlineCoursesPage">
            <q-icon name="book" class="icon" />
            <p class="label-title">หลักสูตรทั้งหมด</p>
            <p class="label">ตรวจสอบหลักสูตรทั้งหมด</p>
            <p class="label">เพื่อเข้าเรียนและขออนุมัติชั่วโมง</p>
          </q-card>

          <!-- profile -->
          <q-card class="menu-card" @click="gotoProfile">
            <q-icon name="account_circle" class="icon" />
            <p class="label-title">โปรไฟล์</p>
            <p class="label">ตรวจสอบจำนวนชั่วโมง</p>
            <p class="label">และโครงการที่ลงทะเบียน และใบรับรองที่ขออนุมัติ</p>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.container {
  width: 100%;
  max-width: 1150px;
  margin: 0 auto;
  padding: 20px;
}
.menu-title {
  font-size: 20px;
  font-weight: bold;
  text-align: left;
  margin-bottom: 20px;
}

.menu-row {
  display: flex;
  justify-content: start;
  gap: 30px;
  flex-wrap: wrap;
}

.menu-card {
  width: 350px;
  height: 150px;
  padding: 20px;
  text-align: left;
}
.menu-card:hover {
  cursor: pointer;
  transform: scale(1.05);
}
.label {
  font-size: 14px;
  margin: 0;
}

.label-title {
  font-size: 16px;
  font-weight: bold;
  margin: 15px 0 4px 0;
}

.my-card {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}
.icon {
  font-size: 35px;
}
.image-wrapper {
  display: flex;
  justify-content: center;
  padding: 10px 10px 0 10px;
}

.activity-image {
  height: 300px;
  width: 100%;
  object-fit: cover;
}
.activity-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 25px;
}

.info-block {
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-block q-icon {
  font-size: 20px;
}

.card-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
  transition: all 0.3s;
  font-size: 25px;
}

.nav-btn:hover {
  background: #e0e7ff;
}

.nav-btn.left {
  left: 100px;
}

.nav-btn.right {
  right: 100px;
}
</style>
