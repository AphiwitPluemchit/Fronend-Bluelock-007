<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const dialog = ref(false)
const router = useRouter()

const openDialog = () => {
  dialog.value = true
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const closeDialog = () => {
  dialog.value = false
}

const goToUploadPage = () => {
  void router.push('/Admin/StudentManagement/UploadStudentDialog')
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
    <q-card class="q-pa-md" style="width: 300px; border-radius: 10px" v-model="dialog">
      <div class="q-mt-md q-mb-md">
        <q-btn class="custom-btn cursor-pointer q-mb-sm" @click="goToUploadPage">
          อัปโหลดข้อมูลนิสิต
        </q-btn>
      </div>
    </q-card>
  </q-menu>
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
