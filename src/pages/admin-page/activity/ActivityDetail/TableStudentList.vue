<script setup lang="ts">
import { ref } from 'vue';
import StudentStatusBadge from './StudentStatusBadge.vue';
import RemoveStudent from './RemoveStudent.vue';

const students = ref([
    { id: 1, studentId: "65160305", name: "ศิวัช รัตนวงศ์", major: "CS", checkIn: "-", checkOut: "-", status: "ชั่วโมงมาก" },
    { id: 2, studentId: "65160332", name: "กรณิสา ทองเอี่ยม", major: "CS", checkIn: "-", checkOut: "-", status: "ชั่วโมงน้อยมาก" },
    { id: 3, studentId: "65160332", name: "อุดม เมธี", major: "ITDI", checkIn: "-", checkOut: "-", status: "ชั่วโมงน้อย" },
    { id: 4, studentId: "65160332", name: "ภัทรพล เกียรติคุณ", major: "ITDI", checkIn: "-", checkOut: "-", status: "ชั่วโมงน้อย" },
    { id: 5, studentId: "65160332", name: "วณิช สีสังข์", major: "AAI", checkIn: "-", checkOut: "-", status: "ชั่วโมงน้อย" },
    { id: 6, studentId: "65160332", name: "กรรณา สีประสงค์", major: "CS", checkIn: "-", checkOut: "-", status: "ชั่วโมงน้อย" },
    { id: 7, studentId: "65160332", name: "ธนัชชา วงศ์สุวรรณ", major: "CS", checkIn: "-", checkOut: "-", status: "ชั่วโมงน้อย" },
    { id: 8, studentId: "65160332", name: "พัชราภา รัตนาราห", major: "CS", checkIn: "-", checkOut: "-", status: "ชั่วโมงน้อย" },
    { id: 9, studentId: "65160332", name: "กฤติกา รัตนไพโรจน์", major: "CS", checkIn: "-", checkOut: "-", status: "ชั่วโมงน้อย" }
]);

const columns = [
    { name: "index", label: "ลำดับ", align: "center" as const, field: "index" },
    { name: "studentId", label: "รหัสนิสิต", field: "studentId", align: "left" as const, sortable: true },
    { name: "name", label: "ชื่อ-สกุล", field: "name", align: "left" as const, sortable: true },
    { name: "major", label: "สาขา", field: "major", align: "left" as const, sortable: true },
    { name: "checkIn", label: "เช็คชื่อเข้า", field: "checkIn", align: "center" as const },
    { name: "checkOut", label: "เช็คชื่อออก", field: "checkOut", align: "center" as const },
    { name: "status", label: "สถานะ", field: "status", align: "center" as const },
    { name: "actions", label: "", field: "actions", align: "center" as const }
];

</script>

<template>
    <q-table flat bordered :rows="students" :columns="columns" row-key="id" dense>
        <!-- ปรับขนาดตัวอักษรของลำดับ -->
        <template v-slot:body-cell-index="props">
            <q-td :props="props" class="text-center table-text bold-text">
                {{ props.rowIndex + 1 }}
            </q-td>
        </template>

        <template v-slot:body-cell-status="props">
            <q-td :props="props">
                <StudentStatusBadge :status="props.row.status" />
            </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
            <q-td :props="props">
                <RemoveStudent :id="props.row.id" />
            </q-td>
        </template>
    </q-table>
</template>

<style scoped>
/* ปรับขนาดตัวอักษรของตารางทั้งหมด */
:deep(.q-table) {
    font-size: 16px;
}
</style>