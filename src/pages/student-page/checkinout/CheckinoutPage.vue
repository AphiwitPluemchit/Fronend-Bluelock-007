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
    <q-page class="flex flex-center q-pa-md background">
    <q-card class="q-pa-xl text-center success-card">
      <div class="icon-wrapper">
        <q-icon name="question_mark" size="64px" style="color: #162aae" />
      </div>
      <div class="text-h6 text-green-7 q-mt-md">Success</div>
      <div class="text-body2 q-mt-xs">Your account has been created.</div>
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
    </q-card>
  </q-page>


    
   
</template>

<style scoped>
.background{
  background-color: #57ac57;
}
.success-card {
  width: 500px;
  height: 400px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 128, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.success-card::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  width: 120%;
  height: 120%;
  background-image: radial-gradient(#8793df 4px, transparent 4px);
  background-size: 20px 20px;
  opacity: 0.2;
  z-index: 0;
}

.icon-wrapper {
  background: #e6f4ea;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  box-shadow: 0 0 0 6px #c8e6c9;
}
</style>