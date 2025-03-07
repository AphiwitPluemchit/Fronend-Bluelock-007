<script setup lang="ts">
import { ref } from 'vue';

// ข้อมูลการประเมินผลความพึงพอใจ
const evaluationResults = ref([
    { id: "1.1", topic: "ความรู้และความเข้าใจในเรื่องเนื้อหากิจกรรมก่อนการอบรม", most: 47, high: 31, medium: 24, low: 3, lowest: 0, avg: 3.42 },
    { id: "1.2", topic: "ความรู้และความเข้าใจในเรื่องเนื้อหากิจกรรมหลังการอบรม", most: 63, high: 13, medium: 6, low: 2, lowest: 0, avg: 4.12 },
    { id: "1.3", topic: "ท่านได้รับความรู้ แนวคิด ประสบการณ์ใหม่จากโครงการ", most: 63, high: 13, medium: 6, low: 1, lowest: 0, avg: 4.65 },
    { id: "1.4", topic: "ท่านสามารถนำสิ่งที่ได้รับจากโครงการไปใช้ประโยชน์ในการปฏิบัติงานได้", most: 24, high: 24, medium: 6, low: 0, lowest: 0, avg: 4.65 },
    { id: "1.5", topic: "รูปแบบและวิธีการกิจกรรมมีความเหมาะสมกับสถานการณ์ปัจจุบัน", most: 34, high: 24, medium: 1, low: 0, lowest: 0, avg: 3.42 }
]);
</script>

<template>
    <div>
        <h3 class="evaluation-title">ผลการประเมิน</h3>
        <table class="evaluation-table">
            <thead>
                <tr>
                    <th rowspan="2">ข้อ</th>
                    <th rowspan="2">หัวข้อความพึงพอใจ</th>
                    <th colspan="5">ระดับความพึงพอใจ</th>
                    <th rowspan="2">ค่าเฉลี่ย</th>
                </tr>
                <tr>
                    <th>มากที่สุด</th>
                    <th>มาก</th>
                    <th>ปานกลาง</th>
                    <th>น้อย</th>
                    <th>น้อยที่สุด</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="bold-text">1.</td>
                    <td class="bold-text">ประเมินผลเนื้อหาการอบรม</td>
                    <td colspan="6"></td> <!-- ลบช่องว่างที่ไม่จำเป็น -->
                </tr>
                <tr v-for="result in evaluationResults" :key="result.id">
                    <td>{{ result.id }}</td>
                    <td>{{ result.topic }}</td>
                    <td>{{ result.most }}</td>
                    <td>{{ result.high }}</td>
                    <td>{{ result.medium }}</td>
                    <td>{{ result.low }}</td>
                    <td>{{ result.lowest }}</td>
                    <td>{{ result.avg }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.evaluation-title {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
}

.evaluation-table {
    width: 100%;
    border-collapse: collapse;
    text-align: center;
}

.evaluation-table th,
.evaluation-table td {
    border: 1px solid #000;
    padding: 8px;
}

.evaluation-table th {
    background-color: #D9D9D9;
    font-weight: bold;
}

.bold-text {
    font-weight: bold;
    text-align: left;
    padding-left: 10px;
}
</style>
