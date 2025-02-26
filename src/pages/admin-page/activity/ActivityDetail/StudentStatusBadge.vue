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
    <q-chip :class="['q-chip', statusClass]">
        {{ status }}
    </q-chip>
</template>

<style scoped>
.status-chip {
    width: 150px;
    /* ✅ กำหนดขนาดให้เท่ากันทุกอัน */
    height: 40px;
    /* ✅ ปรับความสูงให้เท่ากัน */
    display: flex;
    justify-content: center;
    /* ✅ จัดข้อความให้อยู่ตรงกลางแนวนอน */
    align-items: center;
    /* ✅ จัดข้อความให้อยู่ตรงกลางแนวตั้ง */
    text-align: center;
    font-weight: bold;
    font-size: 14px;
    border-radius: 20px;
    /* ✅ ทำให้โค้งมน */
    padding: 5px 10px;
    box-sizing: border-box;
    white-space: nowrap;
    /* ✅ ป้องกันข้อความขึ้นบรรทัดใหม่ */
}

.green-border {
    background-color: rgba(76, 175, 80, 0.2);
    border: 2px solid #4CAF50;
    color: #2E7D32;
}

.red-border {
    background-color: rgba(244, 67, 54, 0.2);
    border: 2px solid #F44336;
    color: #C62828;
}

.orange-border {
    background-color: rgba(255, 152, 0, 0.2);
    border: 2px solid #FF9800;
    color: #E65100;
}
</style>
