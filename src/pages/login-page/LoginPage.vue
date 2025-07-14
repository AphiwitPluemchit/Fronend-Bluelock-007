<template>



  <q-page class="row items-center justify-center login-page">
    <q-card class="row login-container" style="flex-wrap: wrap;">
      <!-- ซ้าย: โลโก้ -->
      <div class="col-6 left-side flex flex-center column q-px-lg q-py-xl hidden-xs hidden-sm hidden-md">
        <div class="icon-container q-mb-lg">
          <q-icon name="school" size="120px" color="white" class="graduation-icon" />
        </div>
        <div class="text-h4 text-center text-white q-mb-sm brand-title">
          Cooperative<br />Education
        </div>
        <div class="text-h6 text-center text-white q-mb-sm brand-title">
          ระบบบริหารจัดการสหกิจศึกษา
        </div>
        <div class="decorative-circles">
          <div class="circle circle-1"></div>
          <div class="circle circle-2"></div>
          <div class="circle circle-3"></div>
        </div>
      </div>

      <!-- ขวา: ฟอร์ม -->
        <div
          class="right-side flex flex-center q-pa-xl"
          :class="$q.screen.lt.lg ? 'col-12' : 'col-lg-6'"
        >
        <q-card-section class="full-width login-form">
          <div class="text-h4 text-center text-weight-medium q-mb-lg login-title">
            เข้าสู่ระบบ
          </div>

          <q-form @submit.prevent="handleLogin" class="login-form-container">
            <!-- อีเมล -->
            <div class="text-body2 q-mt-sm q-mb-xs">ชื่อผู้ใช้</div>
            <q-input
              v-model="auth.form.email"
              type="email"
              outlined
              dense
              class="q-mb-md custom-input"
              :rules="[val => !!val || 'กรุณากรอกอีเมล', val => val.includes('@') || 'อีเมลไม่ถูกต้อง']"
              input-class="text-description"
            >
              <template v-slot:label>
                <div class="text-center full-width">อีเมล</div>
              </template>
              <template v-slot:prepend>
                <q-icon name="email" color="primary" />
              </template>
            </q-input>

            <!-- รหัสผ่าน -->
            <div class="text-body2 q-mt-sm q-mb-xs">รหัสผ่าน</div>
            <q-input
              v-model="auth.form.password"
              :type="isPwd ? 'password' : 'text'"
              outlined
              dense
              class="q-mb-lg custom-input"
              :rules="[val => !!val || 'กรุณากรอกรหัสผ่าน']"
              input-class="text-description"
            >
              <template v-slot:label>
                <div class="text-center full-width">รหัสผ่าน</div>
              </template>
              <template v-slot:prepend>
                <q-icon name="lock" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>

            <!-- ปุ่มเข้าสู่ระบบ -->
            <div class="q-mt-lg flex flex-center">
              <q-btn
                label="เข้าสู่ระบบ"
                type="submit"
                color="primary"
                class="login-btn"
                unelevated
              />
            </div>

            <!-- ลืมรหัสผ่าน -->
            <div class="text-right q-mt-sm">
              <q-btn
                label="ลืมรหัสผ่าน?"
                flat
                color="primary"
                size="sm"
                @click="handResetPassword"
                class="forgot-password-btn"
              />
            </div>
          </q-form>
        </q-card-section>
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'
import { EnumUserRole } from 'src/data/roles'

const auth = useAuthStore()
const router = useRouter()
const isPwd = ref(true)

const handleLogin = async () => {
  try {
    const result = await auth.login()
    if (result) {
      const redirectPath = localStorage.getItem('redirectAfterLogin')
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin')
        await router.push(redirectPath)
        return
      }
      const role = result.user?.role
      if (role === EnumUserRole.ADMIN) {
        await router.push(`/${EnumUserRole.ADMIN}/ActivitiesCalendar`)
      } else if (role === EnumUserRole.STUDENT) {
        await router.push(`/${EnumUserRole.STUDENT}/ActivitiesCalendar`)
      } else {
        throw new Error('ไม่มีสิทธิ์เข้าใช้งาน')
      }
    }
  } catch (err) {
    console.error(err)
  }
}

function handResetPassword() {
  console.log('ลืมรหัสผ่าน')
}
</script>

<style>* {
  box-sizing: border-box;
}

.login-page {
  background: linear-gradient(135deg, #334EAC 0%, #081F5C 50%, #7096D1 100%);
  min-height: 100vh;
  padding: 1rem;
}

.login-container {
  width: 900px;
  max-width: 90vw;
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.8s ease-out;
  height: auto;
}

@keyframes slideUp {
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
}

.left-side {
  background: linear-gradient(135deg, #334EAC 0%, #081F5C 60%, #7096D1 100%);
  position: relative;
  overflow: hidden;
}

.icon-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  padding: 40px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.brand-title {
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 1s ease-out 0.3s both;
}

@keyframes fadeInUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

.decorative-circles .circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  animation: circleFloat 8s infinite linear;
}

.circle-1 { width: 100px; height: 100px; top: 20%; left: 10%; }
.circle-2 { width: 150px; height: 150px; top: 60%; right: 20%; }
.circle-3 { width: 80px; height: 80px; bottom: 20%; left: 60%; }

@keyframes circleFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.right-side {
  background: linear-gradient(135deg, #FFF9F0 0%, #D0E3FF 100%);
  width: 100%;
  padding: 1.5rem !important;
  padding-top: 120px !important;
}

.login-form {
  animation: slideInRight 0.8s ease-out 0.2s both;
  max-width: 450px;
  width: 100%;
}

@keyframes slideInRight {
  0% { opacity: 0; transform: translateX(20px); }
  100% { opacity: 1; transform: translateX(0); }
}

.login-title {
  color: #081F5C;
  font-weight: 700;
  margin-bottom: 2rem;
  position: relative;
  font-size: 1.5rem;
}

.login-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #334EAC, #7096D1);
  border-radius: 2px;
}

.custom-input {
  margin-bottom: 1rem;
}

.login-btn {
  width: 100%;
  min-height: 45px;
}

.text-body2 {
  font-size: 0.9rem;
}

.forgot-password-btn {
  font-size: 0.8rem;
}

/* Mobile Logo Overlay */
.mobile-logo {
  display: none;
  position: absolute;
  top: 1rem;
  left: 0;
  right: 0;
  z-index: 10;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}

.mobile-logo .icon-container {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  padding: 1.5rem;
  margin: auto;
  width: fit-content;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.brand-title-mobile {
  font-weight: bold;
  margin-top: 0.5rem;
}

/* ✅ Responsive: มือถือ & iPad */
@media (max-width: 1023px) {
  .login-container {
    width: 95vw;
    max-width: 600px;
    border-radius: 15px;
    height: auto;
  }

  .left-side {
    display: none !important;
  }

  .mobile-logo {
    display: flex;
  }

  .login-form {
    max-width: 100%;
  }
}

@media (min-width: 1030px) and (max-width: 1500px) {
  .login-container {
    width: 95vw;
    max-width: 700px;
    border-radius: 16px;
    height: auto;
  }

  .left-side {
    display: none !important;
  }

  .right-side {
    width: 100%;
    padding: 2rem !important;
    padding-top: 120px !important;
  }

  .login-form {
    max-width: 100%;
  }

  .mobile-logo {
    display: flex;
  }
}

</style>
