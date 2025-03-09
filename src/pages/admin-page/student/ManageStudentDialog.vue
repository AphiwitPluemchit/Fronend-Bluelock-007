<script setup lang="ts">
// ตัวเลือก
const options = {
  manage: ['อัพโหลดข้อมูลนิสิต', 'จัดเก็บข้อมูลนิสิต'],
}
</script>

<template>
  <q-menu style="border-radius: 10px; overflow: visible">
    <q-card class="q-pa-md" style="width: 300px; border-radius: 10px">
      <div class="q-mt-md justify-center">
        <q-chip
          v-for="manage in options.manage"
          :key="manage"
          style="height: 42px; width: 265px"
          class="custom-chip"
        >
          <div style="margin: auto">{{ manage }}</div>
        </q-chip>
      </div>
    </q-card>
  </q-menu>
</template>

<style scoped>
.custom-chip:hover {
  background-color: #3676f4;
  color: #fff;
  cursor: pointer;
}
</style>
