<script setup lang="ts">
import { nextTick, ref } from 'vue'
import UploadStudentDialog from './UploadStudentDialog.vue'

// ตัวแปรควบคุม dialog
const dialog = ref(false)
const uploadDialogRef = ref<InstanceType<typeof UploadStudentDialog> | null>(null)

// เปิด ManageStudentDialog
const openDialog = () => {
  dialog.value = true
}

// ปิด ManageStudentDialog
const closeDialog = () => {
  dialog.value = false
}

// เปิดอัปโหลด dialog แล้วปิด manage dialog
const openUploadDialog = async () => {
  await nextTick()
  if (uploadDialogRef.value) {
    uploadDialogRef.value.openDialogUpload()
  }
  closeDialog()
}

// ให้ parent เรียก openDialog ได้
defineExpose({ openDialog })
</script>

<template>
  <q-menu :transition-show="'jump-down'" :transition-hide="'jump-up'" :offset="[0, 5]"
    style="border-radius: 10px; overflow: visible">
    <q-card class="q-pa-md" style="width: 300px; border-radius: 10px" v-model="dialog">
      <div class="q-mt-md q-mb-md">
        <q-btn class="custom-btn cursor-pointer q-mb-sm" @click="openUploadDialog">
          อัพโหลดข้อมูลนิสิต
        </q-btn>
  
      </div>
    </q-card>
  </q-menu>

  <!-- Dialog อัปโหลดข้อมูลนิสิต -->
  <UploadStudentDialog ref="uploadDialogRef" />
</template>

<style scoped>
.custom-btn:hover {
  background-color: #f0f0f0;
}

.custom-btn {
  border-radius: 20px;
  height: 42px;
  width: 265px;
}
</style>
