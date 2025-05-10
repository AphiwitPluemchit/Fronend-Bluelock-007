<template>
  <q-page class="q-pa-md">
    <!-- หัวข้อ -->
    <div class="row justify-start items-center">
      <div class="text-h4">จัดการใบประกาศนียบัตร</div>
    </div>

    <!-- แถวค้นหาและไอคอน -->
    <section class="q-mt-lg">
      <div class="row justify-end items-center">
        <div class="text-h6"></div>
        <div class="row">
          <q-input
            dense
            outlined
            v-model="search1"
            label="ค้นหา ชื่อนิสิต"
            class="q-mr-sm searchbox"
            :style="{ boxShadow: 'none' }"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <FilterDialog
            v-model="showFilterDialog1"
            :categories="filterCategories1"
            class="q-mr-sm"
          />
        </div>
      </div>

      <!-- ตาราง -->
      <q-table
        bordered
        flat
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        class="q-mt-md customtable"
        :pagination="{ rowsPerPage: 10 }"
      >
        <!-- Header Sticky -->
        <template v-slot:header="props">
          <q-tr :props="props" class="sticky-header">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Body -->
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="id">{{ props.row.id }}</q-td>
            <q-td key="code">{{ props.row.code }}</q-td>
            <q-td key="name">{{ props.row.name }}</q-td>
            <q-td key="major">{{ props.row.major }}</q-td>
            <q-td key="certName">{{ props.row.certName }}</q-td>
            <q-td key="status" class="text-center">
              <q-badge
                :label="props.row.status"
                :class="getStatusClass(props.row.status)"
                class="status-badge"
              />
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { QTableProps } from 'quasar'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'

const search1 = ref('')
const showFilterDialog1 = ref(false)
const filterCategories1 = ref(['major', 'year', 'status'])

interface CertificateRow {
  id: number
  code: string
  name: string
  major: string
  certName: string
  status: 'รออนุมัติ' | 'อนุมัติ' | 'ไม่อนุมัติ'
}

const search = ref('')
const rows = ref<CertificateRow[]>([
  {
    id: 1,
    code: '65160305',
    name: 'ศิวะ รัตนวงศ์',
    major: 'CS',
    certName: 'ประกาศนียบัตร 2022',
    status: 'รออนุมัติ',
  },
  {
    id: 2,
    code: '65160332',
    name: 'กรณิษา ทองเยี่ยม',
    major: 'CS',
    certName: 'ประกาศนียบัตร 2022',
    status: 'รออนุมัติ',
  },
  {
    id: 3,
    code: '65160332',
    name: 'อุดม เมธี',
    major: 'ITDI',
    certName: 'ประกาศนียบัตร 2022',
    status: 'รออนุมัติ',
  },
  {
    id: 6,
    code: '65160332',
    name: 'กรรณา สีประสงค์',
    major: 'CS',
    certName: 'ประกาศนียบัตร 2022',
    status: 'อนุมัติ',
  },
  {
    id: 9,
    code: '65160332',
    name: 'กฤติภัค รัตน์โพธิ์โรจน์',
    major: 'CS',
    certName: 'ประกาศนียบัตร 2022',
    status: 'ไม่อนุมัติ',
  },
])

const filteredRows = computed(() =>
  rows.value.filter((row) => row.name.includes(search.value) || row.code.includes(search.value)),
)

const columns: QTableProps['columns'] = [
  { name: 'id', label: 'ลำดับ', field: 'id', align: 'left' },
  { name: 'code', label: 'รหัสนิสิต', field: 'code', align: 'left' },
  { name: 'name', label: 'ชื่อ-สกุล', field: 'name', align: 'left' },
  { name: 'major', label: 'สาขา', field: 'major', align: 'left' },
  { name: 'certName', label: 'ชื่อ', field: 'certName', align: 'left' },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' },
]

function getStatusClass(status: CertificateRow['status']) {
  switch (status) {
    case 'อนุมัติ':
      return 'status-approved'
    case 'รออนุมัติ':
      return 'status-waiting'
    case 'ไม่อนุมัติ':
      return 'status-rejected'
  }
}
</script>

<style scoped>
.status-badge {
  height: 32px;
  line-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  text-align: center;
  display: inline-block;
  font-size: 15px;
  width: 130px;
}

.status-approved {
  background-color: #d0ffc5;
  color: #009812;
  border: 2px solid #00bb16;
  padding: 3px 30px;
  width: 130px;
}

.status-waiting {
  background-color: #ffe7ba;
  color: #ff6f00;
  border: 2px solid #ffa500;
  padding: 3px 30px;
  width: 130px;
}

.status-rejected {
  background-color: #ffc5c5;
  color: #ff0000;
  border: 2px solid #f32323;
  padding: 3px 30px;
  width: 130px;
}

.sticky-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}
</style>
