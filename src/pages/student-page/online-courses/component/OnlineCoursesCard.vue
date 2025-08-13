<script setup lang="ts">
import { computed } from 'vue'
import ActivityType from 'src/pages/student-page/activity/component/ActivityType.vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const isMobile = computed(() => $q.screen.lt.sm)

interface Props {
  title: string
  type: 'soft' | 'hard'
  description?: string
  platformType: 'Buu Mooc' | 'Thai Mooc'
  hours: number
  link: string
}
const props = defineProps<Props>()

// แปลง type เป็น skill format ที่ ActivityType ต้องการ
const skillType = computed(() => (props.type === 'hard' ? 'hardSkill' : 'softSkill'))

// ฟังก์ชันสำหรับคลิกการ์ด (เฉพาะ desktop)
const handleCardClick = () => {
  if (!isMobile.value) {
    // เปิดลิงก์ในแท็บใหม่
    window.open(props.link, '_blank')
  }
}
</script>

<template>
  <q-card 
    class="oc-card cursor-pointer"
    :class="{ 'clickable-card': !isMobile }"
    @click="handleCardClick"
  >
    <q-card-section class="outer-box">
      <div class="inner-box">
        <!-- ปุ่มแสดงประเภทคอร์ส -->
        <div class="oc-title text-h6 text-bold ellipsis-2-lines q-mb-sm">{{ title }}</div>
        <div class="oc-type q-mb-sm">
          <ActivityType :skill="skillType" />
        </div>
        <div class="text-subtitle2 q-mb-sm">รายละเอียด : {{ description ?? '-' }}</div>
        <div class="text-subtitle2 q-mb-sm">แหล่งที่มา : {{ platformType }}</div>
        <div class="text-subtitle2 q-mb-sm">จำนวนชั่วโมง : {{ hours }} ชั่วโมง</div>
      </div>

                <!-- ปุ่มอยู่ในกรอบ และถูกดันไปก้นการ์ดเสมอ -->
        <q-btn
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
}

.clickable-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clickable-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.outer-box {
  border-radius: 16px;
  /* padding: 16px; */
  display: flex;
  flex-direction: column;
  height: 100%;
}

.inner-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* border: 1px solid #ddd; */
  border-radius: 12px;
  /* padding: 16px; */
  background: #fff;
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
