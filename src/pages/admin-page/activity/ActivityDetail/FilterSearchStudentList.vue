<script setup lang="ts">
import { ref } from 'vue';

const search = ref(''); 
</script>

<template>
    <div class="row q-mb-md justify-end items-center">
        <!-- ช่องค้นหา -->
        <q-input v-model="search" outlined dense debounce="450" rounded style="width: 250px;" class="rounded-input"
            placeholder="ค้นหานิสิต">
            <template v-slot:append>
                <q-icon name="search" size="20px" />
            </template>
        </q-input>

        <!-- ปุ่ม Filter (ตอนนี้ยังไม่ได้ใช้งาน) -->
        <q-btn round outline dense class="rounded-filter-btn q-ml-sm">
            <q-icon name="arrow_downward" size="16px" />
        </q-btn>
    </div>
</template>
