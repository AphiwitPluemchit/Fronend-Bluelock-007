<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{ id: number }>();

const removeStudent = (id: number) => {
    console.log(`Remove student with ID: ${id}`);
};

</script>

<template>
    <q-btn dense flat round icon="close" color="red" @click="removeStudent(props.id)" />
</template>
