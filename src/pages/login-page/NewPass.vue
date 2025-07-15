<template>
  <div>
    <!-- Login Form -->
    <div class="col-6 right-side flex flex-center">
      <div class="login-form-container">
        <!-- Check if isResetPassword is false, show login form, else show RecoverPassword component -->
        <div >
          <div class="text-h5 text-primary text-center q-mb-lg login-title">Confirm Password</div>
          <div class="text-body2 text-grey-8 q-mb-lg">Please enter your new password.</div>
          
          <q-input
            v-model="auth.form.password"
            :type="isPwd ? 'password' : 'text'"
            outlined
            dense
            class="q-mb-lg login-input"
            :rules="[(val) => !!val]"
            label="New Password"
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
            label="Confirm Password"
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
            @click="goToLogin"
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
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()
const isPwd = ref(true)

const goToLogin = () => {
  void router.push({ name: 'Login' });
};
</script>
