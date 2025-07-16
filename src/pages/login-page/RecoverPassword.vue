<template>
  <div>
    <!-- Login Form -->
    <div class="col-6 right-side flex flex-center">
      <div class="login-form-container">
        <!-- Check if isResetPassword is false, show login form, else show RecoverPassword component -->
        <div v-if="!isResetPassword">
          <div class="text-h5 text-primary text-center q-mb-lg login-title">ยืนยันตัวตน</div>
          <div class="text-body2 text-grey-8 q-mb-lg">กรุณากรอกที่อยู่อีเมลเพื่อรับรหัส OTP สำหรับการยืนยันตัวตน</div>
          <div class="text-body2 text-black-8 q-mb-xs">ที่อยู่อีเมล</div>
          <q-input
            v-model="email"
            type="email"
            outlined
            dense
            class="q-mb-md login-input"
            :rules="[(val) => !!val]"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="primary" />
            </template>
          </q-input>
          <q-btn
            label="ส่งรหัส OTP"
            color="primary"
            class="full-width login-btn q-mb-md"
            unelevated
            @click="isResetPassword = true"  
            no-caps
          />
        </div>

        <div v-if="isResetPassword">
          <OTPPage /> 
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import OTPPage from './OTPPage.vue'

const email = ref('')
const isResetPassword = ref(false)
</script>

<style scoped>
.login-btn {
  height: 48px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  background: linear-gradient(135deg, #4a5fbf 0%, #2e3f80 100%);
}


.login-divider {
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #4a5fbf, #2e3f80);
  border-radius: 2px;
  margin: 0 auto;
}

.login-input {
  margin-bottom: 1rem;
}

.login-input .q-field__control {
  border-radius: 8px;
  background: #fafbff;
}

.login-btn {
  height: 48px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  background: linear-gradient(135deg, #4a5fbf 0%, #2e3f80 100%);
}

.forgot-password-btn {
  font-size: 14px;
  text-decoration: none;
}

/* Mobile Layout */
.mobile-layout {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  min-height: 500px;
  width: 100%;
}

.mobile-logo-section {
  padding-top: 1rem;
}

.mobile-icon-container {
  background: rgba(74, 95, 191, 0.1);
  border-radius: 50%;
  padding: 20px;
  display: inline-block;
  border: 2px solid rgba(74, 95, 191, 0);
}

.mobile-form-container {
  max-width: 400px;
  width: 100%;
}

/* Responsive */
@media (max-width: 599px) {
  .login-page {
    padding: 1rem;
  }

  .login-container {
    height: auto;
    min-height: 500px;
    border-radius: 15px;
  }

  .mobile-layout {
    padding: 1.5rem;
  }
}

@media (min-width: 600px) and (max-width: 1023px) {
  .login-container {
    width: 95vw;
    max-width: 600px;
    height: auto;
    min-height: 600px;
  }

  .mobile-layout {
    padding: 2rem;
  }
}

/* Focus States */
.login-input .q-field--focused .q-field__control {
  border-color: #4a5fbf;
  box-shadow: 0 0 0 1px #4a5fbf;
}

/* Hover Effects */
.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 95, 191, 0.3);
}

.forgot-password-btn:hover {
  text-decoration: underline;
}

/* ซ่อน Desktop Layout เมื่อจอกว้างระหว่าง 600px - 1024px */
@media (min-width: 100px) and (max-width: 1024px) {
  .login-container > .row.no-wrap {
    display: none !important;
  }

  .mobile-layout {
    display: flex !important;
  }
}
</style>
