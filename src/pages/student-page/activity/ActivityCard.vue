<template>
  <q-card style="border-radius: 30px" class="q-pa-md q-ma-md">
    <div class="row q-pa-md">
      <!-- รูปกิจกรรม -->
      <div class="col-3">
        <q-img :src="activity.image" class="rounded-borders activity-img" />
      </div>

      <div class="col-9 activity-card">
        <div class="details">
          <q-item-label class="text-bold text-h6 activity-name">{{ activity.name }}</q-item-label>
          <br />
          <q-item-label>{{ activity.date }} </q-item-label><br />
          <q-item-label>
            ที่นั่งว่าง {{ activity.availableSeats }}/{{ activity.maxSeats }}
          </q-item-label>
        </div>

        <!-- ปุ่มรายละเอียด -->
        <div class="col-md-3 offset-md-3 self-end">
          <q-btn
            label="รายละเอียด"
            dense
            unelevated
            class="detail-btn"
            :to="`/StudentActivityDetail/${activity.id}`"
          />
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
interface Activity {
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

defineProps<{ activity: Activity }>()
</script>

<style scoped>
/* ปรับขนาดการ์ด */
.activity-card {
  border-radius: 30px;
  min-height: 120px;
  display: flex;
  align-items: center;
  font-size: 18px;
}

.activity-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.detail-btn {
  border-radius: 15px;
  font-weight: bold;
  padding: 6px 12px;
  font-size: 18px;
  background-color: #3676f4;
  color: white;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.activity-name {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* จำกัดให้แสดง 2 บรรทัด */
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  width: 100%; /* ป้องกันไม่ให้เกินขอบเขต */
  padding-top: 5px; /* ป้องกันตัวอักษรถูกตัดด้านบน */
}
</style>
