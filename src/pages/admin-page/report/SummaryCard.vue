<template>
  <div class="row q-col-gutter-md">
    <!-- การ์ด 1 -->
    <q-card class="col-xs-12 col-sm-6 col-md-3 bg-blue-1" flat bordered>
      <q-card-section class="row items-center q-gutter-sm">
        <q-icon name="group" color="blue" size="md" />
        <div>
          <div class="text-subtitle2">จำนวนนิสิตทั้งหมด</div>
          <div class="text-caption">3,000 คน</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- การ์ด 2 -->
    <q-card class="col-xs-12 col-sm-6 col-md-3 bg-green-1" flat bordered>
      <q-card-section class="row items-center q-gutter-sm">
        <q-icon name="check_circle" color="green" size="md" />
        <div>
          <div class="text-subtitle2">นิสิตที่ชั่วโมงครบแล้ว</div>
          <div class="text-caption">2,500 คน</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- การ์ด 3 -->
    <q-card class="col-xs-12 col-sm-6 col-md-3 bg-red-1" flat bordered>
      <q-card-section class="row items-center q-gutter-sm">
        <q-icon name="error" color="red" size="md" />
        <div>
          <div class="text-subtitle2">นิสิตที่ชั่วโมงยังไม่ครบ</div>
          <div class="text-caption">500 คน</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- การ์ด 4 -->
    <q-card class="col-xs-12 col-sm-6 col-md-3 bg-orange-1" flat bordered>
      <q-card-section class="row items-center q-gutter-sm">
        <q-icon name="percent" color="orange" size="md" />
        <div>
          <div class="text-subtitle2">จำนวนนิสิตที่ไม่ผ่าน</div>
          <div class="text-caption">100 คน</div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.q-card {
  min-height: 100px;
}
</style>
