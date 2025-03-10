<script setup lang="ts">
import type { Activity } from 'src/types/activity';
import { ActivityService } from "src/services/activity";
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

// ดึง activityId จาก URL
const route = useRoute();
const activityId = route.params.activityId as string;

// โหลดรูปจาก Local Storage (ถ้ามี)
const savedImageUrl = ref(localStorage.getItem('savedImageUrl') || '');

// เก็บข้อมูลกิจกรรม
const activityData = ref<Activity | null>(null);
const registeredStudents = ref(0);
const maxParticipants = ref(0);
const remainingSeats = ref(0);

// รายชื่อนิสิตที่ลงทะเบียน (แยกตามสาขา)
const studentRegistrations = ref<{ major: string; count: number }[]>([]);

// ผลการเลือกอาหาร
const foodSelections = ref<{ name: string; count: number }[]>([]);

// ฟังก์ชันโหลดข้อมูลกิจกรรมจาก API
const fetchActivity = async () => {
    try {
        const response = await ActivityService.getOne(activityId);
        activityData.value = response;

        maxParticipants.value = response.activityItems?.[0]?.maxParticipants || 0;
        registeredStudents.value = response.registeredStudents || 0;
        remainingSeats.value = maxParticipants.value - registeredStudents.value;

        // โหลดข้อมูลนิสิตแยกตามสาขา
        studentRegistrations.value = response.studentRegistrations || [];

        // โหลดข้อมูลการเลือกอาหาร
        foodSelections.value = response.foodSelections || [];
    } catch (error) {
        console.error("Error fetching activity:", error);
    }
};

// โหลดข้อมูลเมื่อ Component ถูกสร้าง
onMounted(async () => {
    if (activityId) {
        await fetchActivity(); // ใช้ await เพื่อรอให้ fetchActivity() ทำงานเสร็จ
    }
});

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
                    <span class="value">{{ maxParticipants }}</span>
                    <span class="unit">คน</span>
                </div>
                <div class="info-row-header">
                    <span class="label">จำนวนนิสิตที่ลงทะเบียน :</span>
                    <span class="value">{{ registeredStudents }}</span>
                    <span class="unit">คน</span>
                </div>
                <div class="info-row-header">
                    <span class="label">จำนวนที่ว่าง :</span>
                    <span class="value">{{ remainingSeats }}</span>
                    <span class="unit">คน</span>
                </div>
            </div>

            <!-- ผลการลงทะเบียนนิสิต -->
            <div class="info-row">
                <span class="label">ผลการลงทะเบียนนิสิต :</span>
                <div class="registration-info">
                    <div class="row" v-for="student in studentRegistrations" :key="student.major">
                        <span class="major">นิสิตสาขา {{ student.major }}</span>
                        <span class="text">จำนวน</span>
                        <span class="number">{{ student.count }}</span>
                        <span class="unit">คน</span>
                    </div>
                </div>
            </div>
            
            <!-- แสดงเฉพาะเมื่อ foodSelections มีข้อมูล -->
            <div class="info-row" v-if="foodSelections.length > 0">
                <span class="label">ผลการเลือกอาหาร :</span>
                <div class="registration-info">
                    <div class="row" v-for="food in foodSelections" :key="food.name">
                        <span class="major">{{ food.name }}</span>
                        <span class="text">จำนวน</span>
                        <span class="number">{{ food.count }}</span>
                        <span class="unit">คน</span>
                    </div>
                </div>
            </div>

            <!-- แสดงข้อความเมื่อไม่มีข้อมูลการเลือกอาหาร -->
            <div class="info-row" v-else>
                <span class="label">ผลการเลือกอาหาร :</span>
                <span class="text">ไม่มีข้อมูลการเลือกอาหารสำหรับกิจกรรมนี้</span>
            </div>

        </div>
    </div>
</template>

<style scoped>
.registration-container {
    display: flex;
    align-items: flex-start;
    gap: 180px;
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
    gap: 30px;
    /* padding: 10px; */
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
    gap: 30px;
    /* flex-wrap: nowrap; */
}

.info-row {
    display: flex;
    align-items: flex-start;
    gap: 30px;
    margin-top: 50px;
    flex-wrap: nowrap;
    /* ป้องกันการขึ้นบรรทัดใหม่ */
}

.row {
    display: flex;
    align-items: center;
    gap: 30px;
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
    min-width: 250px;
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
    /* font-weight: 500; */
    font-size: 20px;
    color: #000000;
}
</style>
