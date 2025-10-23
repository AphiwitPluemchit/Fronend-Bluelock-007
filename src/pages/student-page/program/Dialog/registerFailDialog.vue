<template>
  <q-dialog :model-value="props.modelValue" persistent>
    <q-card class="q-pa-md" style="min-width: 300px; max-width: 500px" rounded standout>
      <q-card-actions align="left">
        <div class="text-h5">ลงทะเบียนไม่สำเร็จ</div>
      </q-card-actions>
      <q-card-section>
        <div v-if="props.errorMessage" style="white-space: pre-line">
          {{ props.errorMessage }}
        </div>
        <div v-else>กรุณาติดต่อเจ้าหน้าที่</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          class="btnconfirm"
          label="ยืนยัน"
          style="background-color: #3676f4; color: white"
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
