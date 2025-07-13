<script setup lang="ts">
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import ActivityType from './ActivityType.vue'
import type { Activity, ActivityItem } from 'src/types/activity'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import { computed } from 'vue'
import { useQuasar } from 'quasar'

dayjs.locale('th')
dayjs.extend(buddhistEra)

const $q = useQuasar()
const isMobile = computed(() => $q.screen.lt.sm) // sm = <600px

function formatDateToThai(dateString: string): string {
  if (!dateString) return '-'
  return dayjs(dateString).format('D MMMM BBBB') // D = วัน, MMM = เดือน, BBBB = ปี พ.ศ.
}

// ฟังก์ชันดึงวันที่
const getActivitydates = (activityItems: ActivityItem[] | null | undefined): string => {
  const firstItem = activityItems?.find((item) => item.dates && item.dates.length > 0)
  return firstItem?.dates
    ? firstItem.dates.map((d) => formatDateToThai(d.date)).join(' ')
    : 'ไม่ระบุ'
}

// ฟังก์ชันดึงเวลา
const getActivityTime = (activityItems: ActivityItem[] | null | undefined): string => {
  const firstItem = activityItems?.find((item) => item.dates && item.dates.length > 0)
  return firstItem?.dates
    ? firstItem.dates.map((d) => `${d.stime} - ${d.etime}`).join(' ')
    : 'ไม่ระบุ'
}

defineProps<{ myActivity: Activity }>()
const router = useRouter()
const baseurl = api.defaults.baseURL
const onClick = async (id: string) => {
  await router.push(`/Student/Activity/MyActivityDetail/${id}`)
}

const getActivityRooms = (activityItems: ActivityItem[] | null | undefined): string => {
  if (!activityItems || activityItems.length === 0) return 'ไม่ระบุ'
  const rooms = activityItems[0]?.rooms
  return Array.isArray(rooms) && rooms.length > 0 ? rooms.join(' ') : 'ไม่ระบุ'
}
const getActivityDescription = (activityItems: ActivityItem[] | null | undefined): string => {
  if (!activityItems || activityItems.length === 0) return 'ไม่ระบุ'
  const rooms = activityItems[0]?.description
  return Array.isArray(rooms) && rooms.length > 0 ? rooms.join(' ') : 'ไม่ระบุ'
}
</script>

<template>
  <q-card class="activity-card q-pa-md q-mt-sm q-mb-sm">
    <div class="row q-col-gutter-md items-start">
      <!-- รูปกิจกรรม -->
      <div :class="isMobile ? 'full-width q-mb-sm' : 'col-4 q-pr-md'">
      
        <q-img
          :src="baseurl + '/uploads/activity/images/' + myActivity.file"
          :ratio="4 / 3"
          style="height: 160px;"
          class="activity-img"
        />

      </div>

      <!-- ข้อมูลกิจกรรม + ปุ่ม -->
      <div class="col-12 col-sm-8 column justify-between">
        <!-- ชื่อ + ประเภท -->
        <div>
          <div class="text-h6 text-bold activity-name">
            {{ myActivity.name }}
          </div>
          <div class="side top q-mt-xs">
            <ActivityType
              v-if="myActivity.skill === 'hard' || myActivity.skill === 'soft'"
              :skill="myActivity.skill === 'hard' ? 'hardSkill' : 'softSkill'"
            />
          </div>
        </div>


        <!-- รายละเอียดกิจกรรม -->
        <div class="text-body2 q-mt-sm">
          วันที่ : {{ getActivitydates(myActivity.activityItems) }}
        </div>
        <div class="text-body2">เวลา : {{ getActivityTime(myActivity.activityItems) }}</div>
        <div class="text-body2">ห้อง : {{ getActivityRooms(myActivity.activityItems) }}</div>
        <div class="text-body2">
          รายละเอียด : {{ getActivityDescription(myActivity.activityItems) }}
        </div>

        <!-- ปุ่มรายละเอียด -->
      <div class="text-right full-width q-mt-sm">
        <q-btn
          label="รายละเอียด"
          dense
          unelevated
          class="btnconfirm"
            @click="onClick(myActivity.id!)"
          />
        </div>
      </div>
    </div>
  </q-card>
</template>

<style scoped>
.activity-card {
  margin: 12px 0; /* เดิมอาจเป็น margin-bottom เยอะกว่าบน */
  padding: 16px;  /* ปรับตาม q-pa-md = 16px */
  border-radius: 20px;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}




.activity-img {
  width: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.activity-name {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; /* จำกัด 2 บรรทัด */
  line-height: 1.4em;
  max-height: calc(1.4em * 2); /* บังคับความสูงไม่ให้เกิน 2 บรรทัด */
  word-break: break-word; /* ตัดคำถ้าจำเป็น */
  font-size: 1rem; /* responsive font size */
}




.btnconfirm {
  background-color: #2e74ff;
  color: white;
  border-radius: 8px;
  padding: 6px 16px;
}

@media (max-width: 600px) {
  .btnconfirm {
    width: 100%;
    text-align: center;
  }
}



@media (max-width: 600px) {
  .activity-card {
    min-height: 280px; /* เพิ่มความสูงให้พอดีกับ layout mobile */
    padding: 12px;
    font-size: 15px;
    border-radius: 16px;
    margin: 4px 0; /* จาก 8px เป็น 4px */

  }

  .activity-img {
    max-height: 120px;
  }

  .btnconfirm {
    width: 100%; /* ให้ปุ่มขนาดเต็ม */
  }
}

@media (max-width: 400px) {
  .activity-card {
    padding: 10px;
    font-size: 14px;
    border-radius: 12px;
  }

  .activity-img {
    max-height: 100px;
    border-radius: 8px;
  }

  .activity-name {
    font-size: 1px;
    -webkit-line-clamp: 2;
    max-height: 2.8em; /* 1.4em * 2 */
  }

  .btnconfirm {
    font-size: 13px;
    padding: 6px 12px;
    width: 100%;
  }
}



</style>
