<template>
  <div>
    <!-- ปุ่ม Filter -->
    <q-btn rounded standout class="filter-button q-ml-sm" @click="toggleMenu">
      <q-icon name="sort" size="24px" />
    </q-btn>
  </div>

  <div>
    <!-- เมนูตัวกรอง -->
    <q-menu
      v-model="menu"
      rounded
      standout
      persistent
      anchor="bottom right"
      self="top right"
      style="border-radius: 20px; overflow: hidden"
    >
      <q-card-section>
        <div class="text-h6">ประเภทกิจกรรม</div>
      </q-card-section>

      <q-card-section class="q-gutter-sm">
        <q-btn class="filter-btn">ชั่วโมงเตรียมความร้อม</q-btn>
        <q-btn class="filter-btn">ชั่วโมงทักษะทางวิชาการ</q-btn>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn class="cancel-btn" label="ยกเลิก" color="red" @click="menu = false" />
        <q-btn
          class="confirm-btn"
          label="ยืนยัน"
          style="background-color: #3676f4; color: white"
          @click="menu = false"
        />
      </q-card-actions>
    </q-menu>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const menu = ref(false)

const toggleMenu = () => {
  menu.value = !menu.value
}
</script>

<style scoped>
/* ปรับขนาดของ popup */
/* .filter-card {
  width: 450px;
  padding: 20px;
  border-radius: 30px;
} */

/* ปุ่มตัวเลือก */
.filter-btn {
  padding: 10px 15px;
  border-radius: 25px;
  font-size: 16px;
  background-color: #f5f5f5;
  color: black;
  transition: 0.3s;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}

.filter-btn.active {
  background-color: #cce5ff;
}

/*ปรับปุ่ม */
.cancel-btn,
.confirm-btn {
  border-radius: 15px;
  padding: 10px 20px;
  font-size: 16px;
}
/* ปุ่มกรอง */
.filter-button {
  width: 50px;
  height: 30px;
  border-radius: 15px;
  border: 1px solid rgba(0, 0, 0, 0.459);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
