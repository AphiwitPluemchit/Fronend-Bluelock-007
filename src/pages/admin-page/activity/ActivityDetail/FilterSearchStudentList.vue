<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{ search: string }>();
const emit = defineEmits(['update:search']);
</script>

<template>
    <div class="row q-mb-md justify-end items-center">
        <q-input :model-value="props.search" @update:model-value="(value) => emit('update:search', value)" outlined
            dense debounce="450" rounded style="width: 250px;" class="rounded-input">
            <template v-slot:append>
                <q-icon name="search" size="20px" />
            </template>
        </q-input>

        <q-btn round outline dense class="rounded-filter-btn q-ml-sm">
            <q-icon name="arrow_downward" size="16px" />
        </q-btn>
    </div>
</template>
