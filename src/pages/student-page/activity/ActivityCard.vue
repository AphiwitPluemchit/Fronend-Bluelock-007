<template>
  <q-card style="border-radius: 30px; height: 210px" class="q-pa-md q-ma-md activity-card">
    <div class="row q-pa-md items-stretch">
      <!-- รูปกิจกรรม -->
      <div class="col-md-4">
        <q-img :src="activity.image" class="rounded-borders activity-img" />
      </div>

      <!-- รายละเอียดกิจกรรม -->
      <div class="col-md-8 column justify-between text-h6">
        <div>
          <div class="content-wrapper q-mb-md">
            <q-item-label class="text-bold activity-name">{{ activity.name }}</q-item-label>
          </div>
          <div class="positionText q-mb-md">
            <q-item-label class="q-mb-md">{{ activity.date }}</q-item-label>
            <q-item-label
              >ที่นั่งว่าง {{ activity.availableSeats }}/{{ activity.maxSeats }}</q-item-label
            >
          </div>
        </div>

        <!-- ปุ่มรายละเอียด -->
        <div class="q-mt-auto text-right">
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
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
}

.activity-img {
  width: 150px;
  height: 150px;
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
  position: absolute;
  bottom: 25px;
  right: 30px;
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
.positionText {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 50px;
}
.content-wrapper {
  min-height: 70px;
  display: flex;
  align-items: center;
}
</style>
