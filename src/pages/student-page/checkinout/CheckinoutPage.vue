<script setup lang="ts">
import { useRoute } from 'vue-router'
import Checkinpage from 'src/pages/student-page/checkinout/Checkin/CheckinPage.vue'
import Checkoutpage from 'src/pages/student-page/checkinout/Checkout/CheckoutPage.vue'

const route = useRoute()
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h4 text-weight-bold">การเช็คชื่อ</div>

    <Checkinpage v-if="route.path.startsWith('/checkin')" />
    <Checkoutpage v-else-if="route.path.startsWith('/checkout')" />

    <div v-else class="text-negative">ไม่พบหน้าเช็คชื่อ</div>
  </q-page>
</template>
