<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="val => emit('update:modelValue', val)"
    @hide="emit('update:modelValue', false)"
  >
    <q-card class="cancel-card">
      <q-card-section>
        <div class="text-h6">ลบแบบประเมิน</div>
      </q-card-section>

      <q-card-section>
        หากคุณกดยืนยันแบบประเมินนี้จะถูกลบออก
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="ยกเลิก"
          class="btnreject"
          @click="emit('update:modelValue', false)"
        />
        <q-btn
          flat
          label="ยืนยัน"
          class="btnconfirm"
          @click="emit('confirm')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm'): void
}>()

defineProps<{
  modelValue: boolean
}>()
</script>

<style scoped>
.cancel-card {
  background-color: white;
  width: 600px;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 2px 2px 10px rgba(0,0,0,.2);
}
</style>
