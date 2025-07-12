<script setup lang="ts">
import { ref, defineEmits } from 'vue';

// รับค่า ID ของนิสิต
const props = defineProps<{ id: string }>();

// ส่งอีเวนต์ออกไปให้ component แม่
const emit = defineEmits(['removeStudent']);

const showDialog = ref(false);

const removeStudentFromActivity = () => {
    emit('removeStudent', props.id);
    showDialog.value = false;
};
</script>

<template>
    <div>
        <!-- ไอคอนกากบาท -->
        <q-icon name="delete"  class="bg-red-7  text-red-1 text-white q-pa-xs rounded-borders q-mr-sm" @click="showDialog = true" />

        <!-- Pop-up Dialog ยืนยันการลบ -->
        <q-dialog v-model="showDialog">
            <q-card class="dialog-box">
                <q-card-section class="dialog-header">
                    <div class="text-h6">ยืนยันการลบข้อมูลนิสิต</div>
                </q-card-section>

                <q-card-section class="dialog-body">
                    <p>คุณต้องการลบข้อมูลนี้หรือไม่ ?</p>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn class="cancel-btn" label="ยกเลิก" v-close-popup />
                    <q-btn class="confirm-btn" label="ตกลง" @click="removeStudentFromActivity" />
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
    text-align: left;
    font-size: 20px;
    padding: 20px;
    border-bottom: 1px solid #ddd;
}

.dialog-body {
    text-align: center;
    font-size: 16px;
    color: #000000;
}

/* ปรับปุ่มกด */
.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 5px;
    padding: 16px;
}

.cancel-btn {
    background-color: #F03B2D;
    color: white;
    height: 40px;
    min-width: 70px;
    border-radius: 10px;
}

.confirm-btn {
    background-color: #2FA54D;
    color: white;
    height: 40px;
    min-width: 70px;
    border-radius: 10px;
}
@media (max-width: 600px){
  .dialog-box{
    width: 100%;
  }
}
</style>
