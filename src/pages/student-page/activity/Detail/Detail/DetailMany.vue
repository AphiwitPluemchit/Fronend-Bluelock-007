<script setup lang="ts">
import type { Activity, ActivityItem } from 'src/types/activity'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
dayjs.locale('th')
dayjs.extend(buddhistEra)

function formatDateToThai(dateString: string): string {
  if (!dateString) return '-'
  return dayjs(dateString).format('D MMMM BBBB') // D = วัน, MMM = เดือน, BBBB = ปี พ.ศ.
}

defineProps<{ activity: Activity }>()

// ฟังก์ชันดึงวันที่จาก `activityItems`
const getActivitydates = (activityItems: ActivityItem[] | null | undefined): string => {
  const firstItem = activityItems?.find((item) => item.dates && item.dates.length > 0)
  return firstItem?.dates
    ? firstItem.dates.map((d) => formatDateToThai(d.date)).join(', ')
    : 'ไม่ระบุ'
}

// ฟังก์ชันดึงเวลา
const getActivityTime = (activityItems: ActivityItem[] | null | undefined): string => {
  const firstItem = activityItems?.find((item) => item.dates && item.dates.length > 0)
  return firstItem?.dates
    ? firstItem.dates.map((d) => `${d.stime} - ${d.etime}`).join(', ')
    : 'ไม่ระบุ'
}
</script>

<template>
  <div class="q-pa-sm">
    <!-- ข้อมูลทั่วไป -->
    <div class="field-pair">
      <div class="field-label">ชื่อกิจกรรมหลัก</div>
      <div class="field-value">: {{ activity?.name ?? 'ไม่ระบุ' }}</div>
    </div>
    <div class="field-pair">
      <div class="field-label">วันที่จัดกิจกรรม</div>
      <div class="field-value">: {{ getActivitydates(activity?.activityItems) }}</div>
    </div>
    <div class="field-pair">
      <div class="field-label">เวลาที่จัดกิจกรรม</div>
      <div class="field-value">: {{ getActivityTime(activity?.activityItems) }}</div>
    </div>
    <div class="field-pair">
      <div class="field-label">ประเภทกิจกรรม</div>
      <div class="field-value">: 
        {{
          activity?.skill === 'hard'
            ? 'ชั่วโมงทักษะทางวิชาการ'
            : activity?.skill === 'soft'
              ? 'ชั่วโมงทักษะเตรียมความพร้อม'
              : 'ไม่ระบุประเภท'
        }}
      </div>
    </div>
    <div class="field-pair">
      <div class="field-label">จำนวนกิจกรรม</div>
      <div class="field-value">: {{ activity.activityItems?.length }} กิจกรรม</div>
    </div>

    <q-separator spaced />

    <!-- รายการรอบกิจกรรม -->
    <div v-for="item in activity.activityItems" :key="item.id || ''">
      <div class="field-pair">
        <div class="field-label">ชื่อกิจกรรมย่อย</div>
        <div class="field-value">: {{ item.name ?? 'ไม่ระบุ' }}</div>
      </div>
      <div class="field-pair">
        <div class="field-label">สถานที่จัดกิจกรรม</div>
        <div class="field-value">: 
          {{ Array.isArray(item.rooms) ? item.rooms.join(', ') : (item.rooms ?? 'ไม่ระบุ') }}
        </div>
      </div>
      <div class="field-pair">
        <div class="field-label">จำนวนชั่วโมงที่ได้รับ</div>
        <div class="field-value">: {{ item.hour ?? '-' }} ชั่วโมง</div>
      </div>
      <div class="field-pair">
        <div class="field-label">จำนวนที่ลงทะเบียน</div>
        <div class="field-value">: 
          {{ item.enrollmentCount ?? 'ไม่ระบุ' }}/{{ item.maxParticipants ?? 'ไม่ระบุ' }}
        </div>
      </div>
      <div class="field-pair">
        <div class="field-label">วิทยากร</div>
        <div class="field-value">: {{ item.operator ?? 'ไม่ระบุ' }}</div>
      </div>
      <div class="field-pair">
        <div class="field-label">รายละเอียดอื่นๆ</div>
        <div class="field-value">: {{ item.description ?? 'ไม่ระบุ' }}</div>
      </div>
      <q-separator spaced />
    </div>
  </div>
</template>


<style scoped>
.field-pair {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.field-label {
  font-weight: bold;
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.field-value {
  font-size: 16px;
  color: #555;
  word-break: break-word;
}

/* แสดงแนวนอนเฉพาะจอใหญ่ขึ้นไป */
@media (min-width: 768px) {
  .field-pair {
    flex-direction: row;
    align-items: baseline;
  }

  .field-label {
    width: 200px;
    margin-bottom: 0;
  }

  .field-value {
    flex: 1;
  }
}
</style>

