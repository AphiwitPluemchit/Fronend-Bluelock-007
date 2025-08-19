<script setup lang="ts">
//import
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
dayjs.locale('th')
const $q = useQuasar()
const isMobile = computed(() => $q.screen.width <= 600)

const filterCategories1 = ref(['year', 'major'])

const submissionColumns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'left' as const },
  { name: 'date', label: 'วันที่อัปโหลด', field: 'date', align: 'left' as const },
  { name: 'studentCode', label: 'รหัสนิสิต', field: 'studentCode', align: 'left' as const },
  { name: 'studentName', label: 'ชื่อ-สกุล', field: 'studentName', align: 'left' as const },
  { name: 'major', label: 'สาขา', field: 'major', align: 'left' as const },
]

const submissionHistory = ref([
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160030',
    studentName: 'นายชนะพล จงอยู่ดีไพศาล',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160011',
    studentName: 'นางสาวศศิธร รัตนกาญจน์',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160030',
    studentName: 'นายธนพล จงอุทัยไพศาล',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160031',
    studentName: 'นางสาวธนมล บุญช่วย',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160033',
    studentName: 'นายธันวา ดีศิริ',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160034',
    studentName: 'นายนนธวัช นิลสนธิ',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160035',
    studentName: 'นายปุณยวีร์ นามวงษ์',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160036',
    studentName: 'นายพลพล คุ้มไข่น้ำ',
    major: 'CS',
  },
])

// Pagination แบบ "load more"
const rowsPerPage = ref(5)
const paginatedRows = computed(() => submissionHistory.value.slice(0, rowsPerPage.value))
//const canLoadMore = computed(() => rowsPerPage.value < submissionHistory.value.length)

// function loadMore() {
//   rowsPerPage.value += 5
// }
</script>

<template>
  <div class="q-mb-sm student-container">
    <div class="student-table-wrapper">
      <div class="row q-col-gutter-sm form-toolbar">
        <!-- Row 2 -->
        <div class="select-filter-row">
          <FilterDialog :categories="filterCategories1" />
        </div>
      </div>

      <div>
        <!-- แสดงข้อความปัดซ้ายเฉพาะ Desktop -->
        <!-- <div v-if="!isMobile" class="scroll-indicator q-mb-sm text-caption text-grey-7">
          <q-icon name="swipe_left" size="sm" class="q-mr-xs" />
          ปัดไปทางซ้ายเพื่อดูข้อมูลทั้งหมด
        </div> -->

        <!-- TABLE MODE (Desktop) -->
        <q-table
          v-if="!isMobile"
          :columns="submissionColumns"
          :rows="paginatedRows"
          row-key="studentCode"
          bordered
          flat
          class="tableHisAct q-mt-md"
          no-data-label="ไม่พบข้อมูล"
        >
          <template v-slot:body="props">
            <q-tr :props="props" class="sticky-header">
              <q-td key="index">{{ props.rowIndex + 1 }}</q-td>
              <q-td key="date">{{ props.row.date }}</q-td>
              <q-td key="studentCode">{{ props.row.studentCode }}</q-td>
              <q-td key="studentName">{{ props.row.studentName }}</q-td>
              <q-td key="major">{{ props.row.major }}</q-td>
            </q-tr>
          </template>
        </q-table>

        <!-- CARD MODE (Mobile) -->
        <!-- <div v-else>
          <q-card
            v-for="(row, index) in paginatedRows"
            :key="row.studentCode"
            class="q-mb-sm"
            bordered
          >
            <q-card-section>
              <div class="text-subtitle1">{{ index + 1 }}. {{ row.studentName }}</div>
              <div class="text-caption">รหัสนิสิต: {{ row.studentCode }}</div>
              <div class="text-caption">วันที่: {{ row.date }}</div>
              <div class="text-caption">สาขา: {{ row.major }}</div>
            </q-card-section>
          </q-card>
        </div> -->

        <!-- ปุ่ม "แสดงเพิ่ม" -->
        <!-- <div class="q-mt-md text-center" v-if="canLoadMore">
          <q-btn flat label="แสดงเพิ่ม" icon="expand_more" color="primary" @click="loadMore" />
        </div> -->
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.student-container {
  height: 680px;
  width: 100%;
}
.q-table table {
  table-layout: fixed;
}
.ActivityNamelabel {
  font-size: 16px;
  font-weight: 600;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.my-sticky-header-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #f5f5f5;
}

.new-sticky-header {
  .my-sticky-header-table {
    /* Fix header */
    thead tr:first-child th {
      background-color: #f5f5f5;
    }

    /* Make tbody scrollable */
    tbody {
      display: block;
      overflow-y: auto;
    }

    /* Ensure header and body columns align */
    thead,
    tbody tr {
      display: table;
      width: 100%;
      table-layout: fixed;
    }

    /* Optional: ปรับ scrollbar ไม่ทับ */
    tbody::-webkit-scrollbar {
      width: 12px;
    }

    tbody::-webkit-scrollbar-thumb {
      background: #a7a7a7;
      border-radius: 10px;
      cursor: pointer;
    }
  }
}
.label {
  font-weight: 600;
  font-size: 16px;
  min-width: 200px;
  margin-top: 2px;
}
.value {
  font-size: 16px;
  margin-top: 2px;
}
.ellipsis-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-complete {
  background-color: #cfd7ff;
  color: #001780;
  border: 1px solid #002dff;
  padding: 3px 30px;
  width: 130px;
}

.status-medium {
  background-color: #ffe7ba;
  color: #ff6f00;
  border: 1px solid #ffa500;
  padding: 3px 30px;
  width: 130px;
}

.status-low {
  background-color: #ffc5c5;
  color: #ff0000;
  border: 1px solid #f32323;
  padding: 3px 30px;
  width: 130px;
}

.status-out {
  background-color: #dadada;
  color: #000000;
  border: 1px solid #575656;
  padding: 3px 30px;
  width: 130px;
}
.status-graduated {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #28a745;
  padding: 3px 30px;
  width: 130px;
}
.status-badge {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 15px;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}
.form-toolbar {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}

.select-filter-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.dropdown-menu {
  max-width: 300px !important;
  width: 100% !important;
  box-sizing: border-box;
}
.backgroundheader {
  background-color: #90b2ee;
}

.student-header-row {
  flex-direction: column !important;
  align-items: stretch !important;
}
.student-header-actions {
  margin-top: 10px !important;
  justify-content: space-between;
}

.ActivityNamelabel .student-name {
  flex-grow: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ActivityNamelabel .q-icon {
  margin-left: auto;
}
@media (max-width: 690px) {
  .form-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .searchbox {
    width: 100% !important;
  }

  .select-filter-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .dropdown {
    width: 90% !important;
  }
}

@media (max-width: 600px) {
  .student-table-wrapper {
    padding: 0;
  }
  .student-card {
    margin-bottom: 12px;
    font-size: 16px;
  }
}
@media (max-width: 450px) {
  .ActivityNamelabel {
    font-size: 12px;
  }
}
</style>
