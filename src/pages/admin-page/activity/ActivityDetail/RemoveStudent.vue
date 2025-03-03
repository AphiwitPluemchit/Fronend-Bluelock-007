<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ id: number }>();

const showDialog = ref(false);

// ฟังก์ชันยืนยันการลบ (ตอนนี้แค่ console.log)
const confirmRemove = () => {
    console.log(`ลบนิสิต ID: ${props.id} สำเร็จ`);
    showDialog.value = false;
};
</script>

<template>
    <div>
        <!-- ไอคอนกากบาท -->
        <q-icon name="close" class="remove-icon" @click="showDialog = true" />

        <!-- Pop-up Dialog ยืนยันการลบ -->
        <q-dialog v-model="showDialog">
            <q-card class="dialog-box">
                <q-card-section class="dialog-header">
                    <div class="text-h6">ยืนยันการลบข้อมูลนิสิต</div>
                </q-card-section>

                <q-card-section class="dialog-body">
                    <p>คุณต้องการลบข้อมูลนี้หรือไม่ ?</p>
                </q-card-section>

                <q-card-actions align="center" class="dialog-actions">
                    <q-btn class="dialog-btn cancel-btn" label="ยกเลิก" v-close-popup />
                    <q-btn class="dialog-btn confirm-btn" label="ตกลง" @click="confirmRemove" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<style scoped>
.dialog-box {
    width: 400px;
    max-width: 90%;
    border-radius: 12px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

.dialog-header {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    padding: 16px;
    border-bottom: 1px solid #ddd;
}

.dialog-body {
    padding: 16px;
    text-align: center;
    font-size: 15px;
    color: #555;
}

/* ปรับปุ่มกด */
.dialog-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
    padding-bottom: 16px;
}

/* ปรับสไตล์ปุ่ม */
.dialog-btn {
    width: 120px;
    font-size: 14px;
    border-radius: 8px;
    font-weight: bold;
}

.cancel-btn {
    background-color: #F03B2D;
    color: white;
}

.confirm-btn {
    background-color: #2FA54D;
    color: white;
}

.remove-icon {
    font-size: 24px;
    color: red;
    cursor: pointer;
    transition: transform 0.2s, color 0.2s;
}

.remove-icon:hover {
    color: rgb(156, 12, 12);
    transform: scale(1.2);
}
</style>
