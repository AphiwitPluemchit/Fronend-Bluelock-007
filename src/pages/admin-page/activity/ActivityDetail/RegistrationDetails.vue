<script setup lang="ts">
import { ref } from 'vue';

// โหลดรูปจาก Local Storage (ถ้ามี)
const savedImageUrl = ref(localStorage.getItem('savedImageUrl') || '');

</script>

<template>
    <div class="registration-container">
        <!-- แสดงรูปภาพที่เลือกไว้ -->
        <q-img :src="savedImageUrl || 'path_to_placeholder_image'" class="registration-image" />

        <!-- รายละเอียดข้อมูล -->
        <div class="registration-details">
            <div class="info-group-header">
                <div class="info-row-header">
                    <span class="label">จำนวนที่รับ :</span>
                    <span class="value">200</span>
                    <span class="unit">คน</span>
                </div>
                <div class="info-row-header">
                    <span class="label">จำนวนนิสิตที่ลงทะเบียน :</span>
                    <span class="value">165</span>
                    <span class="unit">คน</span>
                </div>
                <div class="info-row-header">
                    <span class="label">จำนวนที่ว่าง :</span>
                    <span class="value">35</span>
                    <span class="unit">คน</span>
                </div>
            </div>

            <!-- ผลการลงทะเบียนนิสิต -->
            <div class="info-row">
                <span class="label">ผลการลงทะเบียนนิสิต :</span>
                <div class="registration-info">
                    <div class="row">
                        <span class="major">นิสิตสาขา CS</span>
                        <span class="text">จำนวน</span>
                        <span class="number">35</span>
                        <span class="unit">คน</span>
                    </div>
                    <div class="row">
                        <span class="major">นิสิตสาขา SE</span>
                        <span class="text">จำนวน</span>
                        <span class="number">10</span>
                        <span class="unit">คน</span>
                    </div>
                    <div class="row">
                        <span class="major">นิสิตสาขา AAI</span>
                        <span class="text">จำนวน</span>
                        <span class="number">120</span>
                        <span class="unit">คน</span>
                    </div>
                    <div class="row">
                        <span class="major">นิสิตสาขา ITDI</span>
                        <span class="text">จำนวน</span>
                        <span class="number">-</span>
                        <span class="unit">คน</span>
                    </div>
                </div>
            </div>

            <!-- ผลการเลือกอาหาร -->
            <div class="info-row">
                <span class="label">ผลการเลือกอาหาร :</span>
                <div class="registration-info">
                    <div class="row">
                        <span class="major">ข้าวกะเพราไก่</span>
                        <span class="text">จำนวน</span>
                        <span class="number">1</span>
                        <span class="unit">คน</span>
                    </div>
                    <div class="row">
                        <span class="major">ข้าวผัดหมู</span>
                        <span class="text">จำนวน</span>
                        <span class="number">12</span>
                        <span class="unit">คน</span>
                    </div>
                    <div class="row">
                        <span class="major">ข้าวหมูกระเทียม</span>
                        <span class="text">จำนวน</span>
                        <span class="number">42</span>
                        <span class="unit">คน</span>
                    </div>
                    <div class="row">
                        <span class="major">พิซซ่า</span>
                        <span class="text">จำนวน</span>
                        <span class="number">240</span>
                        <span class="unit">คน</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
.registration-container {
    display: flex;
    align-items: flex-start;
    gap: 150px;
    background-color: #EDF0F5;
    padding: 30px;
    border-radius: 12px;
}

.registration-image {
    width: 430px;
    height: 330px;
    background-color: #D9D9D9;
    border-radius: 10px;
}

.registration-details {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.registration-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.info-group-header {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.info-row-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 20px;
    /* flex-wrap: nowrap; */
}

.info-row {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    margin-top: 20px;
    flex-wrap: nowrap;
    /* ป้องกันการขึ้นบรรทัดใหม่ */
}

.row {
    display: flex;
    align-items: center;
    gap: 20px;
}

.major {
    min-width: 120px;
    margin-left: 5px;
}

.number {
    min-width: 30px;
    text-align: left;
    margin-left: 5px;
}

.label {
    white-space: nowrap;
    text-align: right;
    margin-right: 15px;
    min-width: 180px;
}

.value {
    min-width: 30px;
    text-align: left;
    margin-left: 5px;
    /* เพิ่มระยะห่างระหว่างตัวเลขกับหน่วย */
}

.unit {
    min-width: 30px;
    text-align: left;
    margin-left: 5px;
}

.text {
    min-width: 30px;
    text-align: left;
    margin-left: 5px;
}

.label,
.value,
.unit,
.major,
.text,
.number {
    font-weight: 500;
    font-size: 16px;
    color: #000000;
}
</style>