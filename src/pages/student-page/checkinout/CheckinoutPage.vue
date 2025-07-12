<script setup lang="ts">
import { useRoute } from 'vue-router'
import Checkinpage from 'src/pages/student-page/checkinout/Checkin/CheckinPage.vue'
import Checkoutpage from 'src/pages/student-page/checkinout/Checkout/CheckoutPage.vue'
import { onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
const auth = useAuthStore()
const route = useRoute()
const uuid = route.params.uuid
onMounted(() => {
  console.log(auth.getUser?.id)
  console.log(uuid)
})
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h4 text-weight-bold">การเช็คชื่อ</div>

    <Checkinpage
      v-if="route.path.startsWith('/checkin')"
      :studentId="auth.getUser?.id?.toString() || ''"
      :uuid="uuid?.toString() || ''"
    />
    <Checkoutpage
      v-else-if="route.path.startsWith('/checkout')"
      :studentId="auth.getUser?.id?.toString() || ''"
      :evaluationId="'123'"
      :uuid="uuid?.toString() || ''"
    />

    <div v-else class="text-negative">ไม่พบหน้าเช็คชื่อ</div>
  </q-page>
</template>
