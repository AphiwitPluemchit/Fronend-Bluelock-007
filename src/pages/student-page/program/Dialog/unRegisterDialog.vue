<template>
  <q-dialog :model-value="props.modelValue" persistent>
    <q-card class="q-pa-md" style="min-width: 300px" rounded standout>
      <q-card-actions align="left"> <div class="text-h5">ยกเลิกลงทะเบียน</div></q-card-actions>
      <q-card-section>
        <div>ยกเลิกลงทะเบียน</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn class="btnreject" label="ยกเลิก" color="red" @click="cancel" />
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
import { defineProps, defineEmits, ref, watch } from 'vue'
const modelvalue = ref()
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', modelValue: boolean): void
}>()
const cancel = () => {
  emit('update:modelValue', false)
}

const confirm = () => {
  emit('update:modelValue', false)
  emit('confirm', modelvalue.value)
}

watch(
  () => props.modelValue,
  (newValue) => {
    modelvalue.value = newValue
  },
)
</script>

<style scoped>
.q-card {
  border-radius: 15px;
  width: 350px;
}
</style>
