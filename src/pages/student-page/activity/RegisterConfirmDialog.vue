<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
  >
    <q-card class="q-pa-md" style="min-width: 300px" rounded standout>
      <q-card-section>
        <div class="text-h6">ยืนยันการลงทะเบียน</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn class="cancel-btn" label="ยกเลิก" color="red" @click="cancel" />
        <q-btn
          class="confirm-btn"
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

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const cancel = () => {
  emit('update:modelValue', false)
}

const confirm = () => {
  if (props.modelValue) {
    console.log('Model value is true')
  }
  emit('update:modelValue', false)
  emit('confirm')
}
</script>
<style scoped>
/*ปรับปุ่ม */
.cancel-btn,
.confirm-btn {
  border-radius: 15px;
  padding: 10px 20px;
  font-size: 16px;
}

.q-card {
  border-radius: 15px;
  width: 350px;
}
</style>
