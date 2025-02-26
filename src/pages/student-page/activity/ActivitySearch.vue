<template>
  <div>
    <q-input rounded standout v-model="searchQuery" dense outlined class="search-input" borderless>
      <template v-slot:append>
        <q-icon name="search" class="q-mr-sm" />
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')
</script>

<style scoped>
/* ค้นหา */
.search-input {
  width: 300px;
  max-width: 100%;
  /*background-color: white !important;*/
  padding: 8px 12px;
  box-shadow: none;
}
</style>
