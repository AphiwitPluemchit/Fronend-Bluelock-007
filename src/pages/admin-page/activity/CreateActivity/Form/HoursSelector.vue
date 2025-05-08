<template>
  <div class="input-group">
    <p class="label label_minWidth">จำนวนชั่วโมง :</p>
    <q-input
      outlined
      style="width: 220px"
      v-model="localHours"
      type="number"
      @keypress="isNumber($event)"
      :disable="disable" 
      :rules="[val => val >= 0 || 'กรุณากรอกชั่วโมงให้ถูกต้อง']"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps<{ 
  modelValue: number;
  disable?: boolean; 
}>();

const emit = defineEmits<{ (event: 'update:modelValue', value: number): void }>();

const localHours = ref(props.modelValue);

watch(localHours, (newVal) => {
  emit('update:modelValue', newVal);
});
watch(
  () => props.modelValue,
  (newVal) => {
    localHours.value = newVal
  }
)

const isNumber = (event: KeyboardEvent) => {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
};

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
.label_minWidth {
  min-width: 200px;
}
.input-group p {
  align-self: center;
  margin: 0;
  line-height: normal;
  text-align: right;
}
</style>
