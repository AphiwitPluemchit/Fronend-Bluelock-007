<template>
  <q-page class="row no-wrap">
    <!-- ซ้าย: พื้นหลังน้ำเงิน -->
    <div class="left-side col-6 flex flex-center">
      <!-- ใส่รูปหรือ icon ตรงนี้ได้ -->
      <div class="icon-placeholder" />
      <div class="text-white text-subtitle2 q-mt-md">(example)</div>
    </div>

    <!-- ขวา: กล่อง login -->
    <div class="col-6 flex flex-center">
      <q-card class="login-card q-pa-xl shadow-2">
        <div class="text-h6 text-center q-mb-md text-weight-bold">
          ระบบสารสนเทศเพื่อการเก็บ<br />
          ชั่วโมงอบรมสหกิจศึกษา
        </div>

        <q-form @submit.prevent="handleLogin">
          <q-input
            v-model="auth.form.email"
            outlined
            dense
            placeholder="ชื่อผู้ใช้งาน"
            class="q-mb-md"
          >
            <template #prepend><q-icon name="person" /></template>
          </q-input>

          <q-input
            v-model="auth.form.password"
            outlined
            dense
            type="password"
            placeholder="รหัสผ่าน"
            class="q-mb-sm"
          >
            <template #prepend><q-icon name="lock" /></template>
            <template #append>
              <q-icon name="visibility" class="cursor-pointer" />
            </template>
          </q-input>

          <div class="text-right text-caption q-mb-md text-primary cursor-pointer">
            ลืมรหัสผ่านใช่หรือไม่?
          </div>

          <q-btn
            label="เข้าสู่ระบบ"
            unelevated
            color="primary"
            class="full-width q-mt-sm text-white"
            type="submit"
          />
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'
import { EnumUserRole } from 'src/data/roles'

const auth = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  try {
    const result = await auth.login()
    if (result) {
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
</script>

<style scoped>
.login-page {
  height: 100vh;
}

/* ซ้าย: พื้นหลังน้ำเงิน */
.left-side {
  background-color: #0c2d63;
  width: 50%;
  min-height: 100%;
  color: white;
  text-align: center;
}

.icon-placeholder {
  width: 180px;
  height: 180px;
  background-color: #ffffff20;
  border-radius: 50%;
}

/* ขวา: กล่อง login */
.right-side {
  background-color: #f5f5f5;
  width: 50%;
  min-height: 100%;
  display: flex;
  justify-content: center;
}

.login-card {
  width: 90%;
  max-width: 400px;
  border-radius: 20px;
}
</style>
