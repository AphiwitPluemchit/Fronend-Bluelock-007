<script setup lang="ts">
import { defineProps, defineEmits, ref, watch, nextTick } from 'vue'
import { QInput } from 'quasar'

const props = defineProps<{
  modelValue: number | null
  disable?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void
}>()

const localHours = ref<number | null>(props.modelValue ?? null)
const hoursError = ref('')
const inputRef = ref<InstanceType<typeof QInput> | null>(null)

watch(localHours, (newVal) => {
  emit('update:modelValue', newVal ?? 0)

  if (newVal !== null && newVal >= 0) {
    hoursError.value = ''
  }
})

watch(
  () => props.modelValue,
  (newVal) => {
    localHours.value = newVal ?? null
  },
)

const isNumber = (event: KeyboardEvent) => {
  const charCode = event.which ? event.which : event.keyCode
  if (charCode < 48 || charCode > 57) {
    event.preventDefault()
  }
}

const validate = async (): Promise<boolean> => {
  if (localHours.value === null || localHours.value < 0) {
    hoursError.value = 'กรุณากรอกจำนวนชั่วโมง'
    await nextTick()

    inputRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })

    return false
  }

  hoursError.value = ''
  return true
}

defineExpose({ validate })
</script>

<template>
  <div class="input-group">
    <p class="label label_minWidth" :class="{ 'label-error-shift': hoursError !== '' }">
      จำนวนชั่วโมง :
    </p>
    <div class="input-container">
      <q-input
        ref="inputRef"
        outlined
        class="fix-q-input-height"
        v-model.number="localHours"
        type="number"
        @keypress="isNumber"
        :disable="disable"
        :error="hoursError !== ''"
      />
      <div v-if="hoursError" class="text-negative text-subtitle2 q-mt-xs">
        {{ hoursError }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.fix-q-input-height ::v-deep(.q-icon) {
  font-size: 16px;
}
.fix-q-input-height ::v-deep(.q-field__control) {
  height: 40px !important;
  min-height: 40px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  display: flex;
  align-items: center;
}

.fix-q-input-height ::v-deep(.q-field__append) {
  align-items: center;
  display: flex;
}
.label-error-shift {
  transform: translateY(-12px);
}
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

.input-group p {
  align-self: center;
  margin: 0;
  line-height: normal;
  text-align: right;
}
.input-container {
    max-width: 220px;
    width: 100%;
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
    width: 100%;
    max-width: 100%;
  }
}

</style>
