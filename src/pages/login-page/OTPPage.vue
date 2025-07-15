<template>
  <div class="col-6 right-side flex flex-center">
    <div class="login-form-container">
      <!-- Check if isResetPassword is false, show login form, else show RecoverPassword component -->
      <div v-if="!isResetPassword">
        <div class="text-h5 text-primary text-center q-mb-lg login-title">OTP</div>
        <div class="text-body2 text-grey-8 q-mb-lg">
          Please enter the OTP received on the email someone@example.com
        </div>
        <div class="text-body2 text-black-8 q-mb-xs">OTP</div>
        <div class="otp-input-container">
          <!-- Each input box for a digit -->
          <q-input
            v-model="otp[0]"
            type="number"
            min="0"
            max="9"
            outlined
            dense
            maxlength="1"
            class="otp-input"
            ref="otp1"
            @input="() => { filterSingleDigit(0); moveToNext(0); }"
            @paste="handlePaste($event, 0)"
          />
          <q-input
            v-model="otp[1]"
            type="number"
            min="0"
            max="9"
            outlined
            dense
            maxlength="1"
            class="otp-input"
            ref="otp2"
            @input="() => { filterSingleDigit(1); moveToNext(1); }"
            @paste="handlePaste($event, 1)"
          />
          <q-input
            v-model="otp[2]"
            type="number"
            min="0"
            max="9"
            outlined
            dense
            maxlength="1"
            class="otp-input"
            ref="otp3"
            @input="() => { filterSingleDigit(2); moveToNext(2); }"
            @paste="handlePaste($event, 2)"
          />
          <q-input
            v-model="otp[3]"
            type="number"
            min="0"
            max="9"
            outlined
            dense
            maxlength="1"
            class="otp-input"
            ref="otp4"
            @input="() => { filterSingleDigit(3); moveToNext(3); }"
            @paste="handlePaste($event, 3)"
          />
        </div>
        <q-btn
          label="Confirm"
          color="primary"
          class="full-width login-btn q-mb-md"
          unelevated
            @click="isResetPassword = true"  
          no-caps
        />
        <div class="text-center q-mb-lg">
          <span>OTP not received? </span>
          <q-btn label="Send again" color="primary" flat no-caps />
        </div>  
      </div>
    </div>
  </div>
  <div v-if="isResetPassword">
          <NewPass /> 
        </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NewPass from './NewPass.vue';

const otp = ref(['', '', '', '']) 
const isResetPassword = ref(false)

const filterSingleDigit = (index: number) => {
  let val = otp.value[index] ?? '';
  // Remove non-digits and keep only the first digit
  val = val.replace(/\D/g, '').slice(0, 1);
  otp.value[index] = val;
  // Prevent additional input after one digit
  if (otp.value[index].length === 1 && index < 3) {
    moveToNext(index);
  }
};

const moveToNext = (index: number) => {
  // Automatically move focus to the next input when a digit is entered
  if (otp.value[index] && otp.value[index].length === 1 && index < 3) {
    const nextInput = document.querySelectorAll('.otp-input')[index + 1] as HTMLInputElement;
    nextInput?.focus();
  }
};

const handlePaste = (event: ClipboardEvent, index: number) => {
  event.preventDefault();
  const pasted = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 1);
  otp.value[index] = pasted;
  moveToNext(index);
};


</script>

<style scoped>
.otp-input-container {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
}

.otp-input {
  width: 50px;
  height: 50px;
  text-align: center; /* Centers the text horizontally */
  font-size: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: center; /* Centers text horizontally using flexbox */
  align-items: center; /* Centers text vertically */
}

.otp-input .q-field__control {
  padding: 0 !important;
  border: 2px solid #4A5FBF;
}

.otp-input:focus {
  border-color: #2e3f80;
  box-shadow: 0 0 0 1px #2e3f80;
}

::v-deep(input[type='number'])::-webkit-inner-spin-button,
::v-deep(input[type='number'])::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

::v-deep(input[type='number']) {
  -moz-appearance: textfield;
}
</style>
