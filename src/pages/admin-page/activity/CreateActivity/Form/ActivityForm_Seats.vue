<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: number |null
  disable?: boolean
}>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void
}>()
const localSeats = ref<number | null>(props.modelValue ?? null)
watch(localSeats, (newVal) => {
  emit('update:modelValue', newVal ?? 0)  
})
watch(() => props.modelValue, (newVal) => {
  localSeats.value = newVal ?? null
})
const isNumber = (event: KeyboardEvent) => {
  const charCode = event.which ? event.which : event.keyCode
  if (charCode < 48 || charCode > 57) {
    event.preventDefault()
  }
}
</script>

<template>
  <div class="input-group">
    <p class="label label_minWidth">จำนวนที่รับ :</p>
    <q-input outlined class="input-container" v-model="localSeats" type="number" @keypress="isNumber($event)"
      :disable="disable"
      />

  </div>
</template>

<style scoped>
.label {
  font-size: 20px;
  font-weight: normal;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 40px;
}

.label_minWidth {
  min-width: 200px;
}
.input-container {
    max-width: 220px;
    width: 100%;
  }
.input-group p {
  align-self: center;
  margin: 0;
  line-height: normal;
  text-align: right;
}
::v-deep(input[type='number'])::-webkit-inner-spin-button,
::v-deep(input[type='number'])::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

::v-deep(input[type='number']) {
  -moz-appearance: textfield;
}
@media(max-width: 1880px){
  .input-container {
    width: 200px;
    max-width: 100%;
  }
  .label_minWidth {
    min-width: 180px!important;
  }
}
@media (max-width: 850px) {
   .input-group:not(.no-wrap) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 10px !important;
    gap: 5px !important;
  }
  .label {
    justify-content: flex-start;
  }

  .label_minWidth {
    min-width: unset !important;
    width: 100% !important;
    text-align: left;
    padding-left: 0;
    margin-left: 0;
  }
}
@media (max-width: 550px) {
  .input-container {
    width: 170px;
    max-width: 100%; 
  }

}
@media (max-width: 500px) {
  .input-group {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 10px !important;
    gap: 5px !important; 
  }

   .label {
    justify-content: flex-start; 
  }

  .label_minWidth {
    min-width: unset;
    width: 100%;
    text-align: left;
    padding-left: 0;
    margin-left: 0;
    
  }
   .input-container {
    max-width: 100%;
    width: 100%;
  }
}

 

</style>
