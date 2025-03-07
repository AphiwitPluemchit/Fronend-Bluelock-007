<script setup lang="ts">
import { ref } from 'vue';

// ข้อมูลการประเมินผลความพึงพอใจ
const evaluationResults = ref([
    { id: "1.1", topic: "ความรู้และความเข้าใจในเรื่องเนื้อหากิจกรรม", most: 47, high: 31, medium: 24, low: 3, lowest: 0, avg: 3.42 },
    { id: "1.2", topic: "ความรู้และความเข้าใจในเรื่องเนื้อหากิจกรรม", most: 63, high: 13, medium: 6, low: 2, lowest: 0, avg: 4.12 },
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
                    <th>ข้อ</th>
                    <th>หัวข้อความพึงพอใจ</th>
                    <th>มากที่สุด</th>
                    <th>มาก</th>
                    <th>ปานกลาง</th>
                    <th>น้อย</th>
                    <th>น้อยที่สุด</th>
                    <th>ค่าเฉลี่ย</th>
                </tr>
            </thead>
            <tbody>
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
    margin-top: 30px;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
}

.evaluation-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
}

.evaluation-table th,
.evaluation-table td {
    border: 1px solid #000;
    padding: 8px;
    text-align: center;
}

.evaluation-table th {
    background-color: #D9D9D9;
    font-weight: bold;
}

.evaluation-table td {
    background-color: #FFF;
}
</style>
