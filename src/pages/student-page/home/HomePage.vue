<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import type { Program } from 'src/types/program'
import ProgramType from 'src/components/programType.vue'
import { useAuthStore } from 'src/stores/auth'
const router = useRouter()
const authStore = useAuthStore()

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
const goToDetail = async (id?: string) => {
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
  }, 5000)
}

// const visibleActivities = computed(() => {
//   if (activities.value.length === 0) return []

//   const current = slide.value

//   return [
//     { activity: activities.value[current], position: 'current', index: current }
//   ]
// })

const visibleActivities = computed(() => {
  if (activities.value.length === 0) return []

  const prev = (slide.value - 1 + activities.value.length) % activities.value.length
  const current = slide.value
  const next = (slide.value + 1) % activities.value.length

  return [
    { activity: activities.value[prev], position: 'prev', index: prev },
    { activity: activities.value[current], position: 'current', index: current },
    { activity: activities.value[next], position: 'next', index: next },
  ]
})

// const nextSlide = () => {
//   slide.value = (slide.value + 1) % activities.value.length
//   startAutoSlide()
// }

// const prevSlide = () => {
//   slide.value = (slide.value - 1 + activities.value.length) % activities.value.length
//   startAutoSlide()
// }

const goToSlide = (index: number) => {
  slide.value = index
  startAutoSlide()
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
  <q-page class="q-pa-md page-wrap">
    <div class="row justify-between items-center q-mb-md" style="margin-top: 20px">
      <div class="texttitle">สวัสดี, {{ authStore.getName }}</div>
    </div>
    <div class="q-mt-md activity-carousel">
      <div class="carousel-container">
        <!-- Cards Container -->
        <div class="cards-container">
          <transition-group name="card-slide" tag="div" class="cards-wrapper">
            <div
              v-for="item in visibleActivities"
              :key="`card-${item.index}`"
              :class="['activity-card', item.position]"
              @click="item.activity && goToDetail(item.activity.id)"
            >
              <q-card :class="['my-card', { 'active-card': item.position === 'current' }]">
                <div class="image-wrapper">
                  <q-img
                    :src="
                      item.activity
                        ? api.defaults.baseURL + '/uploads/program/images/' + item.activity.file
                        : ''
                    "
                    class="activity-image"
                  />
                </div>

                <q-card-section>
                  <div class="row items-center q-gutter-sm justify-between">
                    <div class="text-h6 q-mb-sm">{{ item.activity?.name }}</div>
                    <ProgramType
                      style="align-items: end"
                      v-if="
                        item.activity &&
                        (item.activity.skill === 'hard' || item.activity.skill === 'soft')
                      "
                      :skill="
                        item.activity && item.activity.skill === 'hard' ? 'hardSkill' : 'softSkill'
                      "
                    />
                  </div>

                  <!-- ข้อมูลวันที่ / เวลา / จำนวน -->
                  <div
                    class="text-subtitle2 q-mt-xs activity-info"
                    v-if="item.activity && item.activity.programItems?.[0]?.dates?.[0]"
                  >
                    <span class="info-block">
                      <q-icon name="calendar_today" />
                      วันที่จัด:
                      {{
                        new Date(item.activity.programItems[0].dates[0].date).toLocaleDateString(
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
                      {{ item.activity.programItems[0].dates[0].stime }} -
                      {{ item.activity.programItems[0].dates[0].etime }}
                    </span>

                    <span class="info-block">
                      <q-icon name="weekend" />
                      จำนวนที่รับ:
                      {{ item.activity.programItems[0].enrollmentCount }}/
                      {{ item.activity.programItems[0].maxParticipants }}
                    </span>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </transition-group>
        </div>
      </div>

      <!-- Indicators -->
      <div class="carousel-indicators">
        <div
          v-for="(activity, index) in activities"
          :key="`indicator-${index}`"
          :class="['indicator', { active: index === slide }]"
          @click="goToSlide(index)"
        ></div>
      </div>
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
  </q-page>
</template>

<style scoped>
/* Base styles */
.page-wrap {
  width: 100%;
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 16px;
  overflow-x: hidden;
  overflow-y: visible;
}

.activity-carousel {
  margin-bottom: 40px;
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  min-height: 550px;
}

.cards-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
  perspective: 1500px;
}

.cards-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  position: relative;
  width: 100%;
  max-width: 1400px;
}

.activity-card {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  flex-shrink: 0;
}

.activity-card.prev,
.activity-card.next {
  transform: scale(0.85) translateY(20px);
  opacity: 0.6;
  filter: brightness(0.7);
}

.activity-card.prev {
  transform: scale(0.85) translateY(20px) translateX(30px);
}

.activity-card.next {
  transform: scale(0.85) translateY(20px) translateX(-30px);
}

.activity-card.current {
  transform: scale(1) translateY(0);
  opacity: 1;
  z-index: 10;
  filter: brightness(1);
}

.activity-card:hover.current {
  transform: scale(1.02) translateY(-5px);
}

.activity-card:hover.prev,
.activity-card:hover.next {
  transform: scale(0.88) translateY(15px);
  opacity: 0.8;
}

.activity-card.current {
  transform: scale(1) translateY(0);
  opacity: 1;
  z-index: 10;
  filter: brightness(1);
}

.activity-card:hover.current {
  transform: scale(1.02) translateY(-5px);
}

.my-card {
  width: 900px;
  height: 100%;
  transition: all 0.4s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.my-card.active-card {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.image-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 10px 10px 0 10px;
}

.activity-image {
  height: 300px;
  width: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin: 10px 10px 0 10px;
}

.activity-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.info-block {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.info-block q-icon {
  font-size: 18px;
  color: #3b82f6;
}

/* Navigation buttons removed - no manual sliding */

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #d1d5db;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator:hover {
  background: #9ca3af;
  transform: scale(1.2);
}

.indicator.active {
  background: #3b82f6;
  width: 30px;
  border-radius: 5px;
}

/* Animations */
.card-slide-enter-active,
.card-slide-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-slide-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.8);
}

.card-slide-leave-to {
  opacity: 0;
  transform: translateX(-100px) scale(0.8);
}

.menu {
  margin-top: 40px;
}

.menu-title {
  font-size: 20px;
  font-weight: bold;
  text-align: left;
  margin-bottom: 20px;
  color: #1f2937;
}

.menu-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  justify-content: start;
}

.menu-card {
  width: 100%;
  height: 150px;
  padding: 20px;
  text-align: left;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  background: white;
}

.menu-card:hover {
  cursor: pointer;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.label {
  font-size: 14px;
  margin: 0;
  color: #6b7280;
  line-height: 1.4;
}

.label-title {
  font-size: 16px;
  font-weight: bold;
  margin: 15px 0 4px 0;
  color: #1f2937;
}

.icon {
  font-size: 35px;
  color: #3b82f6;
}

/* Tablet styles */
@media (max-width: 1024px) {
  .page-wrap {
    padding: 0 20px;
  }

  .my-card {
    width: 700px;
  }

  .activity-image {
    height: 250px;
  }

  .menu-row {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .menu-card {
    height: 140px;
    padding: 16px;
  }
}

/* Mobile styles */
@media (max-width: 768px) {
  .page-wrap {
    padding: 0 16px;
  }

  .texttitle {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .activity-carousel {
    margin-bottom: 30px;
  }

  .carousel-container {
    padding: 20px 0;
    min-height: 400px;
  }

  .my-card {
    width: 450px;
    height: 100%;
    margin: 0 auto;
  }

  .activity-image {
    height: 200px;
  }

  /* Navigation buttons removed */

  .menu {
    margin-top: 30px;
  }

  .menu-title {
    font-size: 18px;
    margin-bottom: 16px;
  }

  .menu-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .menu-card {
    height: auto;
    min-height: 120px;
    padding: 16px;
  }

  .label-title {
    font-size: 15px;
    margin: 12px 0 4px 0;
  }

  .label {
    font-size: 13px;
  }

  .icon {
    font-size: 30px;
  }

  .activity-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .info-block {
    font-size: 12px;
  }
}

/* Small mobile styles */
@media (max-width: 480px) {
  .page-wrap {
    padding: 0 12px;
  }

  .texttitle {
    font-size: 18px;
  }

  .carousel-container {
    padding: 16px 0;
    min-height: 350px;
  }

  .my-card {
    width: 350px;
    height: 100%;
  }

  .activity-image {
    height: 180px;
  }

  /* Navigation buttons removed */

  .menu-title {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .menu-card {
    min-height: 100px;
    padding: 12px;
  }

  .label-title {
    font-size: 14px;
    margin: 10px 0 3px 0;
  }

  .label {
    font-size: 12px;
  }

  .icon {
    font-size: 28px;
  }

  .activity-info {
    gap: 6px;
  }

  .info-block {
    font-size: 11px;
  }

  .info-block q-icon {
    font-size: 16px;
  }

  .indicator {
    width: 8px;
    height: 8px;
  }

  .indicator.active {
    width: 20px;
  }
}

/* Extra small screens */
@media (max-width: 360px) {
  .page-wrap {
    padding: 0 8px;
  }

  .texttitle {
    font-size: 16px;
  }

  .my-card {
    width: 200px;
    height: 100%;
  }

  .activity-image {
    height: 160px;
  }

  .menu-card {
    padding: 10px;
  }

  .label-title {
    font-size: 13px;
  }

  .label {
    font-size: 11px;
  }

  .icon {
    font-size: 24px;
  }
}
</style>
