<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ status: string }>();

const statusClass = computed(() => {
    if (props.status === "ชั่วโมงมาก") return "green-border";
    if (props.status === "ชั่วโมงน้อยมาก") return "red-border";
    return "orange-border";
});
</script>

<template>
    <div class="status-wrapper">
        <q-chip :class="['status-chip', statusClass]" dense square>
            <span class="status-text">{{ status }}</span>
        </q-chip>
    </div>
</template>

<style scoped>
.status-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
}

.status-chip {
    width: 130px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-size: 14px;
    line-height: 32px;
    border-radius: 20px;
    box-sizing: border-box;
    white-space: nowrap;
}

/* ข้อความอยู่ตรงกลาง */
.status-text {
    width: 100%;
    text-align: center;
    line-height: 32px;
}

/* สีและขอบของแต่ละสถานะ */
.green-border {
    background-color: #D0FFC5;
    border: 2px solid #00BB16;
    color: #009812;
}

.red-border {
    background-color: #FFC5C5;
    border: 2px solid #F32323;
    color: #FF0000;
}

.orange-border {
    background-color: #FFE7BA;
    border: 2px solid #FFA500;
    color: #FF6F00;
}
</style>
