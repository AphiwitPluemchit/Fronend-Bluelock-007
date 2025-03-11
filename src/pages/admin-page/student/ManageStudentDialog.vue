<script setup lang="ts">
import { nextTick, ref } from 'vue'
import UploadStudentDialog from './UploadStudentDialog.vue'

const dialog = ref(false)

// ฟังก์ชันเปิด Dialog
const openDialog = () => {
  dialog.value = true
}

const uploadDialogRef = ref<InstanceType<typeof UploadStudentDialog> | null>(null)
const openUploadDialog = async () => {
  console.log('testClick')
  await nextTick()
  if (uploadDialogRef.value) {
    uploadDialogRef.value.openDialogUpload()
  }
}

defineExpose({ openDialog })
</script>

<template>
  <q-menu
    :transition-show="'jump-down'"
    :transition-hide="'jump-up'"
    :offset="[0, 5]"
    style="border-radius: 10px; overflow: visible"
  >
    <q-card class="q-pa-md" style="width: 300px; border-radius: 10px">
      <div class="q-mt-md q-mb-md">
        <q-btn class="custom-btn cursor-pointer q-mb-sm" @click="openUploadDialog"
          >อัพโหลดข้อมูลนิสิต
        </q-btn>
        <q-btn class="custom-btn cursor-pointer">จัดเก็บข้อมูลนิสิต </q-btn>
      </div>
    </q-card>
  </q-menu>
  <!-- Dialog อัปโหลดข้อมูลนิสิต -->
  <UploadStudentDialog ref="uploadDialogRef" />
</template>

<style scoped>
.custom-btn:hover {
  background-color: #f0f0f0; /* เปลี่ยนสีเมื่อ Hover */
}
.custom-btn {
  border-radius: 20px;
  height: 42px;
  width: 265px;
}
</style>
