<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from 'src/stores/admin'
import RemoveDialog from 'src/components/Dialog/RemoveDialog.vue'
const adminStore = useAdminStore()
const router = useRouter()
const show = ref(false)
const admins = computed(() => adminStore.admins ?? [])
const query = computed(() => adminStore.query)
const isRemoveDialogOpen = ref(false)
const selectedId = ref<string | null>(null)


async function onRequest(requestProp: {
  pagination: { sortBy: string; descending: boolean; page: number; rowsPerPage: number }
}) {
  query.value.page = requestProp.pagination.page
  query.value.limit = requestProp.pagination.rowsPerPage
  query.value.sortBy = requestProp.pagination.sortBy
  query.value.order = requestProp.pagination.descending ? 'desc' : 'asc'
  await data()
}

const pagination = ref({
  sortBy: query.value.sortBy || '',
  descending: query.value.order === 'desc',
  page: query.value.page || 1,
  rowsPerPage: query.value.limit || 5,
  rowsNumber: 0,
})
// const manageDialogRef = ref<InstanceType<typeof ManageAdminDialog> | null>(null)
const goToDetail = (id: string, editMode: boolean = false) => {
  void router.push({
    path: `/Admin/AdminManagement/AdminDetail/${id}`,
    query: { edit: editMode ? 'true' : 'false' },
  })
}
const goToAdd = () => {
  void router.push('/Admin/AdminManagement/CreateAdmin')
}
const openRemoveDialog = (id: string) => {
  selectedId.value = id
  isRemoveDialogOpen.value = true
}
const removeAdmin = async () => {
  if (!selectedId.value) return
  try {
    await adminStore.removeAdmin(selectedId.value)
    isRemoveDialogOpen.value = false
    selectedId.value = null
    await data() // 🔁 refresh table
  } catch (err) {
    console.error('Delete error:', err)
  }
}
const columns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'left' as const },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const },
  {
    name: 'name',
    label: 'ชื่อ-สกุล',
    field: 'name',
    align: 'left' as const,
  },

  { name: 'action', label: '', field: 'action', align: 'center' as const },
]
const data = async () => {
  await adminStore.getAdmins() // ✅ เรียกจาก store

  // อัปเดต pagination ให้ sync
  pagination.value.page = adminStore.query.page || 1
  pagination.value.rowsPerPage = adminStore.query.limit || 5
  pagination.value.sortBy = adminStore.query.sortBy || ''
  pagination.value.rowsNumber = adminStore.totalAdminsCount
}
onMounted(async () => {
  show.value = false
  adminStore.query = {
    page: 1,
    limit: 10,
    sortBy: 'name',
    order: 'asc',
    search: '',
  }
  await data()
  show.value = true
})
</script>

<template>
  <q-page class="q-pa-md">
    <!-- ชื่อหน้า -->
    <div class="row justify-between items-center" style="margin-top: 20px">
      <div class="texttitle">จัดการข้อมูลผู้ดูแล</div>
      <q-btn
        v-if="show"
        dense
        outlined
        label="เพิ่มผู้ดูแล"
        @click="goToAdd"
        class="btnadd"
        style="width: 130px"
      >
      </q-btn>
    </div>

    <section class="q-mt-lg" v-if="show">
      <div class="search-filter-wrapper row wrap justify-end items-start">
        <!-- Search box -->
        <q-input
          dense
          outlined
          v-model="adminStore.query.search"
          label="ค้นหา ชื่อผู้ดูแล"
          class="q-mr-sm searchbox"
          :style="{ border: 'none' }"
          @keyup.enter="data"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <!-- Buttons -->
      </div>

      <!-- ตาราง -->
      <q-table
        bordered
        flat
        :rows="admins"
        :columns="columns"
        v-model:pagination="pagination"
        @request="onRequest"
        row-key="id"
        class="q-mt-md my-table"
      >
        <!-- <q-table bordered flat :rows="admins" :columns="columns" @request="applyFilters" row-key="id" class="q-mt-md"> -->
        <!-- หัวตาราง Sticky -->
        <template v-slot:header="props">
          <q-tr :props="props" class="sticky-header">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <!-- เนื้อหาตาราง -->
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="index">{{
              (pagination.page - 1) * pagination.rowsPerPage + props.rowIndex + 1
            }}</q-td>
            <q-td key="email">{{ props.row.email }}</q-td>
            <q-td
              key="name"
              style="
                max-width: 200px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            >
              {{ props.row.name }}
            </q-td>

            <q-td key="action" class="q-gutter-x-sm">
              <q-btn
                flat
                dense
                icon="edit"
                class="bg-primary text-white q-pa-xs rounded-borders q-mr-sm"
                @click="goToDetail(props.row.id, true)"
              >
                <q-tooltip>แก้ไข</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                icon="visibility"
                class="bg-black text-white q-pa-xs rounded-borders q-mr-sm"
                @click="goToDetail(props.row.id)"
              >
                <q-tooltip>ดูรายละเอียด</q-tooltip>
              </q-btn>

              <q-btn
                flat
                dense
                icon="delete"
                class="bg-red-7 text-red-1"
                @click.stop="openRemoveDialog(props.row.id)"
              >
                <q-tooltip>ลบ</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width text-center q-pa-md text-grey" style="font-size: 20px">
            ไม่มีรายชื่อผู้ดูแล
          </div>
        </template>
      </q-table>
    </section>
    <RemoveDialog v-model="isRemoveDialogOpen" @confirm="removeAdmin" />
  </q-page>
</template>

<style scoped>
.clickable-row:hover {
  background-color: #f5f5f5;
}
.info-icon {
  cursor: pointer;
  width: 60px;
}
.my-table {
  min-height: 580px;
}
.status-badge {
  height: 32px;
  line-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  text-align: center;
  display: inline-block;
  font-size: 15px;
}

@media (max-width: 620px) {
  .search-filter-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 10px; /* เพิ่มระยะห่างระหว่างกล่อง search กับปุ่มทั้งชุด */
  }
  .searchbox {
    width: 100% !important;
    margin-bottom: 0 !important; /* ใช้ gap แทน */
  }

  .btn-filter-wrapper {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 5px;
    flex-wrap: nowrap;
  }

  .btn-filter-wrapper .btnadd {
    width: 90%;
  }

  .btn-filter-wrapper .q-mr-sm {
    margin-right: 0 !important;
  }
}

@media (max-width: 450px) {
  .texttitle {
    font-size: 28px;
    font-weight: 400;
  }
}
</style>
