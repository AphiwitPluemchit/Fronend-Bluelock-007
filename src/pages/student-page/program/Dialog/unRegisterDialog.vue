<template>
  <q-dialog
    @update:model-value="emit('update:modelValue', $event)"
    persistent
  >
    <q-card class="q-pa-md" rounded>
      <!-- Header with icon centered -->
      <q-card-section class="text-center q-pb-none q-mb-md">
        <q-icon name="warning" color="red" size="56px" />
      </q-card-section>

      <q-card-section class="text-center q-pt-sm">
        <div class="text-h5">ยกเลิกการลงทะเบียน</div>
      </q-card-section>

      <!-- Confirmation message -->
      <q-card-section>
        <div class="text-body1">ยกเลิกการลงทะเบียน</div>
        <div class="text-body2 text-grey-7">คุณต้องยกเลิกการลงทะเบียนใช่หรือไม่ โปรดยืนยัน</div>
      </q-card-section>

      <!-- Action buttons -->
      <q-card-actions align="right">
        <q-btn class="btnreject" label="ยกเลิก" color="red" @click="cancel" />
        <q-btn
          class="btnsecces"
          label="ยืนยัน"
          @click="confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue'



const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const cancel = () => {
  emit('update:modelValue', false)
}

const confirm = () => {
  emit('update:modelValue', false)
  emit('confirm')
}
</script>

<style scoped>
.q-card {
  border-radius: 15px;
  width: 350px;
}
</style>
