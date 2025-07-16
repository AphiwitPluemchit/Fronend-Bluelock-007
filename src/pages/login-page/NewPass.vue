<template>
  <div>
    <!-- Login Form -->
    <div class="col-6 right-side flex flex-center">
      <div class="login-form-container">
        <!-- Check if isResetPassword is false, show login form, else show RecoverPassword component -->
        <div >
          <div class="text-h5 text-primary text-center q-mb-lg login-title">สร้างรหัสผ่านใหม่</div>
          <div class="text-body2 text-grey-8 q-mb-lg">กรุณากรอกรหัสผ่านใหม่ของคุณ</div>
          
          <q-input
            v-model="auth.form.password"
            :type="isPwd ? 'password' : 'text'"
            outlined
            dense
            class="q-mb-lg login-input"
            :rules="[(val) => !!val]"
            label="รหัสผ่านใหม่"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer text-grey-6"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <q-input
            v-model="auth.form.password"
            :type="isPwd ? 'password' : 'text'"
            outlined
            dense
            class="q-mb-lg login-input"
            :rules="[(val) => !!val]"
            label="ยืนยันรหัสผ่าน"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer text-grey-6"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <q-btn
            label="Confirm"
            color="primary"
            class="full-width login-btn q-mb-md"
            unelevated
            @click="handleConfirm"
            no-caps
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { defineEmits } from 'vue'

const auth = useAuthStore()
const isPwd = ref(true)
const emit = defineEmits(['backToLogin'])

function handleConfirm() {
  emit('backToLogin') // ส่งสัญญาณกลับไปที่ LoginPage.vue
}
</script>

<style scoped>
.login-btn {
  height: 48px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  background: linear-gradient(135deg, #4a5fbf 0%, #2e3f80 100%);
}
</style>
