<template>
  <div class="input-group">
    <p class="label label_minWidth">จำนวนชั่วโมง :</p>
    <q-input outlined style="width: 220px" v-model="localHours" type="number" :disable="disable"
      @keypress="isNumber"
      />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps<{
  modelValue: number | null;
  disable?: boolean;
}>();

const emit = defineEmits<{ (event: 'update:modelValue', value: number): void }>();

const localHours = ref<number | null>(props.modelValue ?? null)

watch(localHours, (newVal) => {
  emit('update:modelValue', newVal ?? 0)
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
