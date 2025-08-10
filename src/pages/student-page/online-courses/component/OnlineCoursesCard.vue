<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  type: 'soft' | 'hard'
  description?: string
  platformType: 'Buu Mooc' | 'Thai Mooc'
  hours: number
  link: string
}
const props = defineProps<Props>()

const typeLabel = computed(() =>
  props.type === 'soft' ? 'ทักษะเตรียมความพร้อม' : 'ทักษะความรู้ทางวิชาการ',
)
const typeClass = computed(() => (props.type === 'soft' ? 'pill-soft' : 'pill-hard'))
</script>

<template>
  <q-card class="oc-card">
    <q-card-section class="outer-box">
      <div class="inner-box">
        <!-- ปุ่มแสดงประเภทคอร์ส -->
        <div class="oc-type q-mb-sm">
          <q-chip :class="[typeClass]">
            {{ typeLabel }}
          </q-chip>
        </div>

        <div class="oc-title text-h6 text-bold ellipsis-2-lines q-mb-sm">{{ title }}</div>
        <div class="text-subtitle2 q-mb-sm">รายละเอียด : {{ description ?? '-' }}</div>
        <div class="text-subtitle2 q-mb-sm">ประเภท : {{ platformType }}</div>
        <div class="text-subtitle2 q-mb-sm">ชั่วโมง : {{ hours }} ชม.</div>
      </div>

      <!-- ปุ่มอยู่ในกรอบ และถูกดันไปก้นการ์ดเสมอ -->
      <q-btn
        class="oc-cta q-mt-auto"
        :href="link"
        target="_blank"
        label="ไปยังหน้าอบรม"
        color="grey-2"
        text-color="black"
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

.outer-box {
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.inner-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
}

.oc-type {
  display: flex;
  justify-content: flex-end;
}

.pill-soft {
  color: #009812;
  border: 1px solid #00bb16;
  background-color: #d2ffc7;
}

.pill-hard {
  color: #001780;
  border: 1px solid #002dff;
  background-color: #cfd7ff;
}

.oc-cta {
  margin-top: 16px;
  width: 100%;
  border-radius: 10px;
  height: 44px;
}
</style>
