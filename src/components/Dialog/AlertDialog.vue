<script setup lang="ts">
const emit = defineEmits(['update:modelValue'])
defineProps<{
  modelValue: boolean
  title: string
  message: string
}>()
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
    persistent
  >
    <q-card class="cancel-card">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>
      <q-card-section>
        {{ message }}
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="ตกลง" class="btnconfirm" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.cancel-card {
  background-color: white;
  width: 500px;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}
</style>
