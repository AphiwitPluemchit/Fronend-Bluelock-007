<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
  >
    <q-card class="cancel-card">
      <q-card-section>
        <div class="text-h6">ลบข้อมูล</div>
      </q-card-section>
      <q-card-section>
        หากคุณกดยืนยัน ข้อมูลนี้จะถูกลบออก
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="ยกเลิก" class="btnreject" v-close-popup />
        <q-btn flat label="ยืนยัน" class="btnconfirm" @click="emit('confirm')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
const emit = defineEmits(['update:modelValue', 'confirm']) // ✅ เพิ่ม confirm
defineProps<{
  modelValue: boolean;
}>();

</script>

<style scoped>
.cancel-card {
  background-color: white;
  width: 600px;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}
</style>
