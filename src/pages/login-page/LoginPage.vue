<template>
  <q-page class="row items-center justify-center login-page">
    <q-card class="login-container">
      <!-- Desktop Layout -->
      <div class="row no-wrap full-height hidden-xs hidden-sm">
        <!-- ซ้าย: โลโก้ -->
        <div class="col-6 left-side flex flex-center column">
          <div class="logo-section text-center">
            <div class="icon-container q-mb-md">
              <q-icon name="school" size="80px" color="white" />
            </div>
            <div class="text-h4 text-white q-mb-xs brand-title">Cooperative<br />Education</div>
            <div class="text-subtitle1 text-white brand-subtitle">ระบบบริหารจัดการสหกิจศึกษา</div>
          </div>

          <!-- Decorative circles -->
          <div class="decorative-circles">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
          </div>
        </div>

        <!-- ขวา: ฟอร์ม -->
        <div class="col-6 right-side flex flex-center">
          <div class="login-form-container">
            <div v-if="!isResetPassword">
              <div class="text-h5 text-primary text-center q-mb-lg login-title">เข้าสู่ระบบ</div>
              <div class="login-divider q-mb-lg"></div>

              <q-form @submit.prevent="handleLogin">
                <div class="text-body2 text-grey-8 q-mb-xs">ที่อยู่อีเมล</div>
                <q-input
                  v-model="auth.form.email"
                  type="email"
                  autocomplete="email"
                  outlined
                  dense
                  class="q-mb-md login-input"
                  :rules="[(val) => !!val]"
                  aria-label="Email"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" color="primary" />
                  </template>
                </q-input>

                <div class="text-body2 text-grey-8 q-mb-xs">รหัสผ่าน</div>
                <q-input
                  v-model="auth.form.password"
                  :type="isPwd ? 'password' : 'text'"
                  autocomplete="current-password"
                  outlined
                  dense
                  class="q-mb-lg login-input"
                  :rules="[(val) => !!val]"
                  aria-label="Password"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="primary" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer text-grey-6"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>

                <q-btn
                  label="เข้าสู่ระบบ"
                  type="submit"
                  color="primary"
                  class="full-width login-btn q-mb-md"
                  unelevated
                  no-caps
                  :loading="isLoggingIn"
                  :disable="isLoggingIn"
                />

                <div class="text-right">
                  <q-btn
                    label="ลืมรหัสผ่าน?"
                    flat
                    color="primary"
                    size="sm"
                    @click="isResetPassword = true"
                    class="forgot-password-btn"
                    no-caps
                  />
                </div>
              </q-form>
            </div>
            <div v-else>
              <RecoverPassword @backToLogin="resetToLogin" />
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Layout -->
      <div
        class="mobile-layout column items-center justify-center q-pa-lg hidden-md hidden-lg hidden-xl"
      >
        <!-- โลโก้ -->
        <div class="mobile-logo-section text-center q-mb-lg">
          <div class="mobile-icon-container q-mb-md">
            <q-icon name="school" size="60px" color="primary" />
          </div>
          <div class="text-h5 text-primary q-mb-xs">Cooperative<br />Education</div>
        </div>

        <!-- ฟอร์ม -->
        <div class="mobile-form-container full-width">
          <div v-if="!isResetPassword">
            <q-form @submit.prevent="handleLogin">
              <div class="text-body2 text-grey-8 q-mb-xs">ที่อยู่อีเมล</div>
              <q-input
                v-model="auth.form.email"
                type="email"
                autocomplete="email"
                outlined
                dense
                class="q-mb-md login-input"
                aria-label="Email"
              >
                <template v-slot:prepend>
                  <q-icon name="email" color="primary" />
                </template>
              </q-input>

              <div class="text-body2 text-grey-8 q-mb-xs">รหัสผ่าน</div>
              <q-input
                v-model="auth.form.password"
                :type="isPwd ? 'password' : 'text'"
                autocomplete="current-password"
                outlined
                dense
                class="q-mb-lg login-input"
                :rules="[(val) => !!val]"
                aria-label="Password"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" color="primary" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer text-grey-6"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>

              <q-btn
                label="เข้าสู่ระบบ"
                type="submit"
                color="primary"
                class="full-width login-btn q-mb-md"
                unelevated
                no-caps
                :loading="isLoggingIn"
                :disable="isLoggingIn"
              />

              <div class="text-right">
                <q-btn
                  label="ลืมรหัสผ่าน?"
                  flat
                  color="primary"
                  size="sm"
                  class="forgot-password-btn"
                  no-caps
                  @click="isResetPassword = true"
                />
              </div>
            </q-form>
          </div>
          <div v-else>
            <OTPPage @backToLogin="$emit('backToLogin')" />
          </div>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { EnumUserRole } from 'src/data/roles'
import RecoverPassword from './RecoverPassword.vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const auth = useAuthStore()
const router = useRouter()
const isPwd = ref(true)
const isResetPassword = ref(false)
const isLoggingIn = ref(false)

function resetToLogin() {
  isResetPassword.value = false
}
const handleLogin = async () => {
  try {
    isLoggingIn.value = true
    const result = await auth.login()

    if (result) {
      const redirect = localStorage.getItem('redirectAfterLogin')
      if (redirect) {
        localStorage.removeItem('redirectAfterLogin')
        await router.push(redirect)
      }

      const role = result.user?.role
      if (role === EnumUserRole.ADMIN) {
        await router.push(`/${EnumUserRole.ADMIN}/ActivitiesCalendar`)
      } else if (role === EnumUserRole.STUDENT) {
        await router.push(`/${EnumUserRole.STUDENT}/ActivitiesCalendar`)
      } else {
        throw new Error('ไม่มีสิทธิ์เข้าใช้งาน')
      }
    } else {
      $q.notify({
        color: 'negative',
        message: 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลหรือรหัสผ่าน',
        position: 'top',
        timeout: 3000,
      })
    }
  } catch (error) {
    console.error('Login error:', error)
    $q.notify({
      color: 'negative',
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
      position: 'top',
      timeout: 3000,
    })
  } finally {
    isLoggingIn.value = false
    auth.clearForm()
  }
}
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #4a5fbf 0%, #2e3f80 50%, #1a2b5c 100%);
  min-height: 100vh;
  padding: 2rem;
}

.login-container {
  width: 900px;
  max-width: 95vw;
  height: 600px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.8s ease-out;
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Desktop Left Side */
.left-side {
  background: linear-gradient(135deg, #4a5fbf 0%, #2e3f80 60%, #1a2b5c 100%);
  position: relative;
  overflow: hidden;
}

.logo-section {
  z-index: 2;
  position: relative;
}

.icon-container {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  padding: 30px;
  display: inline-block;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.brand-title {
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
}

.brand-subtitle {
  opacity: 0.9;
  font-weight: 400;
}

/* Decorative Circles */
.decorative-circles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  animation: circleFloat 8s infinite linear;
}

.circle-1 {
  width: 100px;
  height: 100px;
  top: 10%;
  left: 5%;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 70%;
  right: 10%;
}

.circle-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 70%;
}

@keyframes circleFloat {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.3;
  }
}

/* Desktop Right Side */
.right-side {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  padding: 2rem;
}

.login-form-container {
  width: 100%;
  max-width: 400px;
}

.login-title {
  color: #2e3f80;
  font-weight: 600;
  margin-bottom: 1rem;
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
