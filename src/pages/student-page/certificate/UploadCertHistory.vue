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
    <!-- Header Card -->
    <div class="q-pa-md q-mb-md">
      <div class="text-h6">ประวัติการอัพโหลด</div>
    </div>

    <!-- Table Container -->
    <div class="table-container">
      <!-- Desktop Table -->
      <div class="desktop-table">
        <q-table
          flat
          bordered
          :rows="rows"
          :columns="columns"
          row-key="id"
          class="custom-table"
          :pagination="{ rowsPerPage: 10 }"
        >
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

      <!-- Mobile Cards -->
      <div class="mobile-cards">
        <q-card v-for="row in rows" :key="row.id" class="mobile-card q-mb-md" flat bordered>
          <q-card-section class="q-pa-md">
            <div class="row q-col-gutter-md">
              <!-- Left Column -->
              <div class="col-12 col-sm-8">
                <div class="text-weight-bold text-body1 q-mb-xs">
                  {{ row.certName }}
                </div>
                <div class="text-grey-7 text-body2 q-mb-sm">ลำดับ: {{ row.id }}</div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <div class="col-6">
                    <div class="text-caption text-grey-6">ประเภทกิจกรรม</div>
                    <div class="text-body2">{{ translateSkillType(row.skill) }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-6">ชั่วโมงที่ได้รับ</div>
                    <div class="text-body2">{{ row.hour !== null ? row.hour : '-' }}</div>
                  </div>
                </div>
                <div class="text-caption text-grey-6 q-mb-xs">วันที่อัปโหลด</div>
                <div class="text-body2">{{ row.uploadDate }}</div>
              </div>

              <!-- Right Column -->
              <div class="col-12 col-sm-4 text-right">
                <div class="q-mb-md">
                  <q-badge
                    :label="row.status"
                    :class="getStatusClass(row.status)"
                    class="status-badge mobile-status-badge"
                  />
                </div>
                <div v-if="row.note" class="mobile-note">
                  <div class="text-caption text-grey-6">หมายเหตุ</div>
                  <div class="text-body2 text-negative">{{ row.note }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.history-header-card {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

/* Desktop Table */
.desktop-table {
  display: block;
  padding: 2px;
}

.mobile-cards {
  display: none;
  padding: 16px;
}

.mobile-card {
  background-color: white;
  border-radius: 8px;
}

.mobile-status-badge {
  width: 100px !important;
}

.mobile-note {
  text-align: left;
  margin-top: 8px;
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

/* Responsive Breakpoints */
@media (max-width: 1024px) {
  .desktop-table {
    display: none;
  }

  .mobile-cards {
    display: block;
  }
}

@media (max-width: 600px) {
  .history-header-card {
    padding: 16px;
    margin-bottom: 12px;
  }

  .table-container {
    margin: 0 -8px;
  }

  .mobile-cards {
    padding: 12px;
  }

  .mobile-card {
    margin-bottom: 12px;
  }

  .mobile-card .q-card-section {
    padding: 16px;
  }

  .status-badge,
  .mobile-status-badge {
    width: 80px !important;
    font-size: 12px;
    height: 24px;
  }
}
</style>
