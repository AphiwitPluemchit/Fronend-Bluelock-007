<template>
  <div class="input-group">
    <p class="label label_minWidth">จำนวนที่รับ :</p>
    <q-input
      outlined
      style="width: 240px"
      v-model.number="localSeats"
      type="number"
      @keypress="isNumber($event)"
      @blur="validatePositive"
      :disable="disable"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: number
  disable?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void
}>()

// ✅ ใช้ number type
const localSeats = ref<number>(props.modelValue)

watch(localSeats, (newVal) => {
  emit('update:modelValue', newVal)
})

const isNumber = (event: KeyboardEvent) => {
  const charCode = event.which ? event.which : event.keyCode
  if (charCode < 48 || charCode > 57) {
    event.preventDefault()
  }
}

const validatePositive = () => {
  if (isNaN(localSeats.value) || localSeats.value < 0) {
    localSeats.value = 0
  }
}
</script>

<style scoped>
.label {
  font-size: 20px;
  font-weight: normal;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 40px;
}

.input-group p {
  align-self: center;
  margin: 0;
  line-height: normal;
  text-align: right;
}
</style>
