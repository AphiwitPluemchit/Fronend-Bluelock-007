<template>
  <div>
    <!-- Login Form -->
    <div class="col-6 right-side flex flex-center">
      <div class="login-form-container">
        <!-- Check if isResetPassword is false, show login form, else show RecoverPassword component -->
        <div v-if="!isResetPassword">
          <div class="text-h5 text-primary text-center q-mb-lg login-title">Login</div>
          <div class="text-body2 text-grey-8 q-mb-lg">Please enter email address to receive the OTP for login.</div>
          <div class="text-body2 text-black-8 q-mb-xs">Email address</div>
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
            label="Send OTP"
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
