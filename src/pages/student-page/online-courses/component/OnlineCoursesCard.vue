<script setup lang="ts">
import { computed } from 'vue'
import ProgramType from 'src/pages/student-page/program/component/programType.vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import type { Course } from 'src/types/course'

const $q = useQuasar()
const router = useRouter()
const isMobile = computed(() => $q.screen.lt.sm)

interface Props {
  course: Course
}
const props = defineProps<Props>()

// แปลง Course properties เป็นค่าที่ต้องใช้ใน template
const title = computed(() => props.course.name)
const skillType = computed(() => (props.course.isHardSkill ? 'hardSkill' : 'softSkill'))
const platformType = computed(() => (props.course.type === 'buumooc' ? 'Buu Mooc' : 'Thai Mooc'))
const hours = computed(() => props.course.hour)
const link = computed(() => props.course.link)

// ฟังก์ชันสำหรับไปยังหน้าอัปโหลดใบประกาศ
const goToCertificatePage = () => {
  void router.push(`/student/UploadCertificate/${props.course.id}`)
}
</script>

<template>
  <q-card
    class="oc-card cursor-pointer"
    :class="{ 'clickable-card': !isMobile }"
    @click="goToCertificatePage"
  >
    <q-card-section class="outer-box">
      <div class="inner-box">
        <!-- ปุ่มแสดงประเภทคอร์ส -->
        <div class="oc-title text-h6 text-bold ellipsis-2-lines q-mb-sm">{{ title }}</div>
        <div class="oc-type q-mb-sm">
          <ProgramType :skill="skillType" />
        </div>
        <!-- <div class="text-subtitle2 q-mb-sm">รายละเอียด : {{ description ?? '-' }}</div> -->
        <div class="text-subtitle2 q-mb-sm">
          <q-icon name="domain" class="q-mb-xs" /> แหล่งที่มา : {{ platformType }}
        </div>
        <div class="text-subtitle2 q-mb-sm">
          <q-icon name="schedule" class="q-mb-xs" /> จำนวนชั่วโมง : {{ hours }} ชั่วโมง
        </div>
      </div>

      <q-btn
        v-if="isMobile"
        class="oc-cta q-mt-auto"
        :href="link"
        target="_blank"
        label="ไปยังหน้าอบรม"
        text-color="white"
        no-caps
        unelevated
      />
    </q-card-section>
  </q-card>
</template>

<style scoped>
.oc-card {
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  background-color: #fff; /* สีปกติ */
  transition:
    background-color 0.3s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.clickable-card:hover {
  background-color: #f0f4ff; /* สีตอน hover */
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.outer-box {
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.inner-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  background: transparent; /* ใช้สีพื้นหลังจาก q-card */
}

.oc-type {
  display: flex;
  justify-content: flex-start;
}

.oc-cta {
  background-color: #2e74ff;
  margin-top: 16px;
  width: 100%;
  border-radius: 10px;
  height: 44px;
}
</style>
