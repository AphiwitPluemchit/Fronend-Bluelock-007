<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)
const file = ref<File | null>(null)

const closeDialog = () => {
  isOpen.value = false
  file.value = null
}

const openDialogUpload = () => {
  isOpen.value = true
}

const uploadFile = () => {
  if (!file.value) {
    alert('กรุณาเลือกไฟล์ก่อนอัพโหลด!')
    return
  }
  console.log('Uploading file:', file.value.name)
  closeDialog()
}

defineExpose({ openDialogUpload, closeDialog })
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="q-pa-md q-dialog-plugin">
      <q-card-section class="text-center text-h6">อัพโหลดข้อมูลนิสิต</q-card-section>
      <q-card-section class="row justify-center">
        <q-icon name="cloud_upload" size="80px" color="black" style="width: 130px; height: 130px" />
      </q-card-section>
      <q-card-section class="q-gutter-md row justify-center">
        <q-file v-model="file" label="No Selected File" filled clearable accept=".csv, .xls, .xlsx"
          style="width: 350px">
          <template v-slot:append>
            <q-btn dense flat icon="delete" @click="file = null" />
          </template>
        </q-file>
      </q-card-section>
      <q-card-actions class="q-mt-md" style="position: absolute; bottom: 20px; right: 20px">
        <q-btn label="ยกเลิก" class="btnreject q-mr-sm" flat @click="closeDialog" />
        <q-btn label="ยืนยัน" class="btnconfirm" unelevated @click="uploadFile" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<style scoped>
.q-card {
  width: 870px;
  height: 400px;
  border-radius: 10px;
}
</style>
