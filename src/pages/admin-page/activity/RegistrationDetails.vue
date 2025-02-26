<template>
    <div class="registration-container">
        <!-- รูปภาพ -->
        <q-img src="path_to_placeholder_image" class="registration-image" />

        <!-- รายละเอียดข้อมูล -->
        <div class="registration-details">
            <div class="info-row">
                <span class="label">จำนวนที่รับ:</span>
                <span class="value">200 คน</span>
            </div>
            <div class="info-row">
                <span class="label">จำนวนนิสิตที่ลงทะเบียน:</span>
                <span class="value">165 คน</span>
            </div>
            <div class="info-row">
                <span class="label">จำนวนที่ว่าง:</span>
                <span class="value">35 คน</span>
            </div>

            <!-- ผลการลงทะเบียนนิสิต -->
            <div class="row section-title">ผลการลงทะเบียนนิสิต:</div>
            <div class="row">
                <div class="label">นิสิตสาขา CS</div>
                <div class="value">จำนวน 35 คน</div>
            </div>
            <div class="row">
                <div class="label">นิสิตสาขา SE</div>
                <div class="value">จำนวน 10 คน</div>
            </div>
            <div class="row">
                <div class="label">นิสิตสาขา AAI</div>
                <div class="value">จำนวน 120 คน</div>
            </div>
            <div class="row">
                <div class="label">นิสิตสาขา ITDI</div>
                <div class="value">จำนวน - คน</div>
            </div>

            <!-- ผลการเลือกอาหาร -->
            <div class="row section-title">ผลการเลือกอาหาร:</div>
            <div class="row">
                <div class="label">ข้าวกะเพราไก่</div>
                <div class="value">จำนวน 1 คน</div>
            </div>
            <div class="row">
                <div class="label">ข้าวผัดหมู</div>
                <div class="value">จำนวน 12 คน</div>
            </div>
            <div class="row">
                <div class="label">ข้าวหมูกระเทียม</div>
                <div class="value">จำนวน 42 คน</div>
            </div>
            <div class="row">
                <div class="label">พิซซ่า</div>
                <div class="value">จำนวน 240 คน</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.registration-container {
    display: flex;
    align-items: center;
    gap: 80px;
    /* ระยะห่างระหว่างรูปภาพและข้อมูล */
    background-color: #f5f7fa;
    padding: 20px;
    border-radius: 8px;
}

.registration-image {
    width: 430px;
    height: 330px;
    background-color: #d9d9d9;
    border-radius: 10px;
    /* ทำขอบมน */
}

.registration-details {
    display: flex;
    flex-direction: column;
    gap: 15px;
    /* ระยะห่างระหว่างแต่ละแถว */
}

.info-row {
    display: flex;
    justify-content: space-between;
    min-width: 300px;
}

.label {
    font-weight: 400;
    font-size: 16px;
    color: #333;
}

.value {
    font-weight: 400;
    font-size: 16px;
    color: #333;
}
</style>