<script setup lang="ts">
import { ref } from 'vue'

interface UploadHistoryRow {
  id: number
  certName: string
  skill: string
  hour: number | null
  status: 'รออนุมัติ' | 'อนุมัติ' | 'ไม่อนุมัติ'
  note?: string
  uploadDate: string
}
//mockUp
const rows = ref<UploadHistoryRow[]>([
  {
    id: 4,
    certName: 'ประกาศนียบัตร 2022',
    skill: '',
    hour: null,
    status: 'รออนุมัติ',
    note: '',
    uploadDate: '10 พ.ค. 2568',
  },
  {
    id: 3,
    certName: 'ประกาศนียบัตร 2022',
    skill: '',
    hour: null,
    status: 'รออนุมัติ',
    note: '',
    uploadDate: '10 พ.ค. 2568',
  },
  {
    id: 2,
    certName: 'ประกาศนียบัตร 2022',
    skill: '',
    hour: null,
    status: 'ไม่อนุมัติ',
    note: 'รูปไม่ชัดเจน',
    uploadDate: '10 พ.ค. 2568',
  },
  {
    id: 1,
    certName: 'ประกาศนียบัตร 2022',
    skill: 'hard',
    hour: 16,
    status: 'อนุมัติ',
    note: '',
    uploadDate: '10 พ.ค. 2568',
  },
])

const columns = [
  { name: 'id', label: 'ลำดับ', field: 'id', align: 'left' as const },
  { name: 'certName', label: 'ชื่อ', field: 'certName', align: 'left' as const },
  { name: 'skill', label: 'ประเภทกิจกรรม', field: 'skill', align: 'left' as const },
  { name: 'hour', label: 'ชั่วโมงที่ได้รับ', field: 'hour', align: 'center' as const },
  { name: 'uploadDate', label: 'วันที่อัปโหลด', field: 'uploadDate', align: 'left' as const },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' as const },
  { name: 'note', label: 'หมายเหตุ', field: 'note', align: 'center' as const },
]

function getStatusClass(status: string) {
  switch (status) {
    case 'รออนุมัติ':
      return 'status-waiting'
    case 'อนุมัติ':
      return 'status-approved'
    case 'ไม่อนุมัติ':
      return 'status-rejected'
    default:
      return ''
  }
}
function translateSkillType(skill: string) {
  switch (skill) {
    case 'hard':
      return 'ทักษะทางวิชาการ'
    case 'soft':
      return 'เตรียมความพร้อม'
    default:
      return '-'
  }
}
</script>
<template>
  <q-page>
    <div class="q-pa-md q-mb-md">
      <div class="text-h6">ประวัติการอัพโหลด</div>
    </div>
    <div class="left-align-container">
      <q-table flat bordered :rows="rows" :columns="columns" row-key="id" class="custom-table">
        <template v-slot:body-cell-status="props">
          <q-td class="flex flex-center">
            <q-badge
              :label="props.value"
              :class="getStatusClass(props.value)"
              class="status-badge"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-skill="props">
          <q-td>{{ translateSkillType(props.value) }}</q-td>
        </template>
        <template v-slot:body-cell-hour="props">
          <q-td class="text-center">{{ props.value !== null ? props.value : '-' }}</q-td>
        </template>
        <template v-slot:body-cell-note="props">
          <q-td class="text-center">{{ props.value || '-' }}</q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<style scoped>
.left-align-container {
  margin-left: 0;
  margin-right: auto;
}

.custom-table .q-td,
.custom-table .q-th {
  font-size: 14px;
  padding: 12px 16px;
}

.status-badge {
  width: 100px;
  font-size: 14px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 999px;
}

.status-waiting {
  background-color: #ffe7ba;
  color: #ff6f00;
  border: 1px solid #ffa500;
}

.status-approved {
  background-color: #d0ffc5;
  color: #009812;
  border: 1px solid #00bb16;
}

.status-rejected {
  background-color: #ffc5c5;
  color: #ff0000;
  border: 1px solid #f32323;
}
</style>
