<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
  >
    <q-card class="q-pa-md" rounded>
      <!-- Header with icon centered -->
      <q-card-section class="text-center q-pb-none q-mb-md">
        <q-icon name="error_outline" color="red" size="56px" />
      </q-card-section>

      <q-card-section class="text-center q-pt-sm">
        <div class="text-h6">ลงทะเบียนไม่สำเร็จ</div>
      </q-card-section>

      <!-- Error Message -->
      <q-card-section>
        <div class="text-body1 text-start">
          {{ errorMessage || 'กรุณาติดต่อเจ้าหน้าที่' }}
        </div>
      </q-card-section>

      <!-- Action Buttons -->
      <q-card-actions align="right">
        <q-btn
          class="btnconfirm"
          label="ปิด"
          style="background-color: #ff0000; color: white"
          @click="confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  modelValue: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const confirm = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.q-card {
  border-radius: 15px;
  width: 350px;
}
</style>
