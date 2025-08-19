<script setup lang="ts">
import { ref, computed } from 'vue'
import type { QTableProps } from 'quasar'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import ManageCerDialog from './ManageCerDialog.vue'

const search1 = ref('')
const showFilterDialog1 = ref(false)
const filterCategories1 = ref(['major', 'statusCertificate'])

const filteredRows = computed(() =>
  rows.value.filter((row) => row.name.includes(search.value) || row.code.includes(search.value)),
)

const columns: QTableProps['columns'] = [
  { name: 'id', label: 'ลำดับ', field: 'id', align: 'left' },
  { name: 'code', label: 'รหัสนิสิต', field: 'code', align: 'left' },
  { name: 'name', label: 'ชื่อ-สกุล', field: 'name', align: 'left' },
  { name: 'major', label: 'สาขา', field: 'major', align: 'left' },
  { name: 'certName', label: 'ชื่อหัวข้อการอบรม', field: 'certName', align: 'left' },
  { name: 'uploadDate', label: 'วันที่อัปโหลด', field: 'uploadDate', align: 'left' },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' },
  { name: 'action', label: '', field: 'action', align: 'center' },
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

const showDialog = ref(false)
const selectedCert = ref({
  code: '',
  name: '',
  certName: '',
  imageUrl: '',
  skill: '',
  hour: 0,
  status: '',
  note: '',
})

const openManageCer = (row: CertificateRow) => {
  const found = certList.value.find((cert) => cert.code === row.code)
  if (found) {
    selectedCert.value = { ...found }
    showDialog.value = true
  }
}

const viewDetail = (row: CertificateRow) => {
  const found = certList.value.find((cert) => cert.code === row.code)
  if (found) {
    selectedCert.value = { ...found }
    console.log(selectedCert.value)

    showDialog.value = true
  }
  console.log(row)
}

const handleConfirm = (updated: typeof selectedCert.value & { status: string }) => {
  const found = certList.value.find((c) => c.code === updated.code)
  if (found) {
    found.status = updated.status
  }
}

interface CertificateRow {
  id: number
  code: string
  name: string
  major: string
  certName: string
  status: 'รออนุมัติ' | 'อนุมัติ' | 'ไม่อนุมัติ'
  uploadDate: string
}

const search = ref('')

//Mock up
//Mock up
const rows = ref<CertificateRow[]>([
  {
    id: 1,
    code: '65160305',
    name: 'ศิวะ รัตนวงศ์',
    major: 'CS',
    certName:
      'จิตวิทยาประยุกต์ในการทํางาน เพื่อความสำเร็จ ความสุข และความมั่งคั่ง | Applied Psychology to Work through Success Happiness and Wealth',
    status: 'รออนุมัติ',
    uploadDate: '10 พ.ค. 2568',
  },
  {
    id: 2,
    code: '65160332',
    name: 'กรณิษา ทองเยี่ยม',
    major: 'CS',
    certName:
      'ประกาศนียบัตร 2022 ประกาศนียบัตร 2022 ประกาศนียบัตร 2022 ประกาศนียบัตร 2022 ประกาศนียบัตร 2022 ประกาศนีย',
    status: 'รออนุมัติ',
    uploadDate: '10 พ.ค. 2568',
  },
  {
    id: 3,
    code: '65160302',
    name: 'อุดม เมธีสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสส',
    major: 'ITDI',
    certName: 'ประกาศนียบัตร 2022',
    status: 'รออนุมัติ',
    uploadDate: '10 พ.ค. 2568',
  },
  {
    id: 6,
    code: '65160333',
    name: 'กรรณา สีประสงค์',
    major: 'CS',
    certName: 'ประกาศนียบัตร 2022',
    status: 'อนุมัติ',
    uploadDate: '10 พ.ค. 2568',
  },
  {
    id: 9,
    code: '65160334',
    name: 'กฤติภัค รัตน์โพธิ์โรจน์',
    major: 'CS',
    certName: 'ประกาศนียบัตร 2022',
    status: 'ไม่อนุมัติ',
    uploadDate: '10 พ.ค. 2568',
  },
])

const certList = ref([
  {
    code: '65160333',
    name: 'กรรณา สีประสงค์',
    certName: 'ประกาศนียบัตร 2022',
    status: 'อนุมัติ',
    imageUrl: '/images/sample_cert.png',
    skill: 'เตรียมความพร้อม',
    hour: 3,
    note: '',
  },
  {
    code: '65160305',
    name: 'ศิวะ รัตนวงศ์',
    certName:
      'จิตวิทยาประยุกต์ในการทํางาน เพื่อความสำเร็จ ความสุข และความมั่งคั่ง | Applied Psychology to Work through Success Happiness and Wealth',
    status: 'รออนุมัติ',
    imageUrl: '/images/sample_cert.png',
    skill: '',
    hour: 0,
    note: '',
  },
  {
    code: '65160332',
    name: 'กรณิษา ทองเยี่ยม',
    certName:
      'ประกาศนียบัตร 2022 ประกาศนียบัตร 2022 ประกาศนียบัตร 2022 ประกาศนียบัตร 2022 ประกาศนียบัตร 2022 ประกาศนีย',
    status: 'รออนุมัติ',
    imageUrl: '/images/sample_cert.png',
    skill: '',
    hour: 0,
    note: 'เอกสารไม่ถูกต้อง',
  },
  {
    code: '65160302',
    name: 'อุดม เมธีสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสสส',
    certName: 'ประกาศนียบัตร 2022',
    status: 'รออนุมัติ',
    imageUrl: '/images/sample_cert.png',
    skill: '',
    hour: 0,
    note: '',
  },
  {
    code: '65160334',
    name: 'กฤติภัค รัตน์โพธิ์โรจน์',
    certName: 'ประกาศนียบัตร 2022',
    status: 'ไม่อนุมัติ',
    imageUrl: '/images/sample_cert.png',
    skill: '',
    hour: 0,
    note: 'ชื่อไม่ตรงกับระบบ',
  },
])
</script>
<template>
  <q-page class="q-pa-md">
    <!-- ชื่อหน้า -->
    <div class="row justify-between items-center q-mb-md" style="margin-top: 20px">
      <div class="texttitle">จัดการใบประกาศนียบัตร</div>
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
            label="ค้นหา ชื่อ รหัสนิสิต"
            class="q-mr-sm searchbox"
            :style="{ boxShadow: 'none', border: 'none' }"
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
        :rows-per-page-options="[5, 7, 10, 15, 20]"
        row-key="id"
        class="q-mt-md my-sticky-header-table"
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
            <q-td
              key="name"
              style="
                max-width: 300px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
              >{{ props.row.name }}</q-td
            >
            <q-td key="major">{{ props.row.major }}</q-td>
            <q-td
              key="certName"
              style="
                max-width: 350px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
              >{{ props.row.certName }}</q-td
            >
            <q-td key="uploadDate">{{ props.row.uploadDate }}</q-td>
            <q-td key="status" class="text-center">
              <q-badge
                :label="props.row.status"
                class="status-badge"
                :class="getStatusClass(props.row.status)"
              />
            </q-td>
            <td key="action" class="text-center q-gutter-x-sm">
              <q-icon
                v-if="props.row.status === 'รออนุมัติ'"
                clickable
                name="edit"
                class="bg-primary text-white q-pa-xs rounded-borders q-mr-sm"
                @click="openManageCer(props.row)"
              >
                <q-tooltip>แก้ไข</q-tooltip>
              </q-icon>

              <q-icon
                v-else
                clickable
                name="visibility"
                class="bg-black text-white q-pa-xs rounded-borders q-mr-sm"
                @click="viewDetail(props.row)"
              >
                <q-tooltip>ดูรายละเอียด</q-tooltip>
              </q-icon>
            </td>
          </q-tr>
        </template>
      </q-table>
      <ManageCerDialog v-model="showDialog" :data="selectedCert" @confirm="handleConfirm" />
    </section>
  </q-page>
</template>

<style scoped>
.my-sticky-header-table {
  min-height: 340px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

/* Sticky thead (ใช้ภายใน q-table ได้เลย) */
.my-sticky-header-table thead tr {
  background-color: #162aae;
  font-weight: bold;
  font-size: 16px;
  color: #ffffff;
  border-bottom: 2px solid #d0d0d0;
  transition: background-color 0.3s ease;
}
.my-sticky-header-table td,
.my-sticky-header-table th {
  padding: 10px 12px;
  font-size: 15px;
}
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
  border: 1px solid #00bb16;
  padding: 3px 30px;
  width: 130px;
}

.status-waiting {
  background-color: #ffe7ba;
  color: #ff6f00;
  border: 1px solid #ffa500;
  padding: 3px 30px;
  width: 130px;
}

.status-rejected {
  background-color: #ffc5c5;
  color: #ff0000;
  border: 1px solid #f32323;
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
