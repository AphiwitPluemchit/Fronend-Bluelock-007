<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import { useAdminStore } from 'src/stores/admin'
import type { Admin } from 'src/types/admin'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

// ---------- State ----------
const show = ref(false)
const adminId = ref<string | null>((route.params.id as string) || null)
const isEditMode = ref<boolean>(route.query.edit === 'true')
const originalAdminData = ref<Admin | null>(null)

const breadcrumbs = computed(() => ({
  previousPage: { title: 'จัดการข้อมูลผู้ดูแล', path: '/Admin/AdminManagement' },
  currentPage: {
    title: !isEditMode.value
      ? 'สร้างผู้ดูแล'
      : isEditMode.value
        ? 'แก้ไขผู้ดูแล'
        : 'รายละเอียดผู้ดูแล',
    path: route.fullPath,
  },
  icon: 'people',
}))

// ---------- Helpers ----------
const emptyAdmin = (): Admin => ({
  id: '', // ให้ store/service ใส่ตอนสร้างเสร็จ หรือปล่อยว่าง
  name: '',
  email: '',
  // เพิ่มฟิลด์อื่นของ Admin ที่ระบบใช้อยู่ เช่น role ฯลฯ
})

// ---------- Actions ----------

const startEdit = () => {
  isEditMode.value = true
  originalAdminData.value = { ...adminStore.admin }
  // sync query ?edit=true (optional)
}

const cancelEdit = () => {
  if (!adminId.value) {
    void router.push('/Admin/AdminManagement')
  }
  if (!isEditMode.value) {
    adminStore.admin = emptyAdmin()
  } else if (originalAdminData.value) {
    adminStore.admin = { ...originalAdminData.value }
  }
  isEditMode.value = false
  // sync query ?edit=false (optional)
  // ถ้าสร้างอยู่ให้คงเป็นแก้ไข, ถ้าแก้ไขให้กลับไป view
  if (isEditMode.value) {
    const q = { ...route.query }
    delete q.edit
    void router.replace({ query: q })
  }
}

const validate = (): boolean => {
  const { name, email } = adminStore.admin
  if (!name || name.trim().length < 2) {
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return false
  }
  return true
}

const save = async () => {
  console.log(adminStore.admin)
  if (!validate()) {
    console.log('val')
  }

  if (!adminId.value) {
    await adminStore.createAdmin(adminStore.admin) // ให้รีเทิร์น id ใหม่
    void router.push('/Admin/AdminManagement')
  } else {
    await adminStore.updateAdmin(adminId.value, adminStore.admin)
    originalAdminData.value = { ...adminStore.admin }
    isEditMode.value = false
    const q = { ...route.query }
    delete q.edit
    void router.replace({ query: q })
  }
}
const loadData = async () => {
  show.value = false
  if (!adminId.value) {
    adminStore.admin = emptyAdmin()
    originalAdminData.value = { ...adminStore.admin }
    isEditMode.value = true
  } else {
    await adminStore.getAdminById(adminId.value)
    originalAdminData.value = { ...adminStore.admin }
  }
  show.value = true
}
// ---------- Lifecycle ----------
onMounted(async () => {
  await loadData()
})

// ปรับโหมดเมื่อเปลี่ยน route แบบ in-place
watch(
  () => route.fullPath,
  async () => {
    adminId.value = (route.params.id as string) || null
    await loadData()
  },
)
</script>

<template>
  <q-page class="q-pa-md">
    <div style="margin-top: 20px">
      <AppBreadcrumbs :breadcrumbs="breadcrumbs" />
    </div>

    <q-card flat class="q-mt-lg" v-if="show">
      <div class="row q-col-gutter-md">
        <!-- แถวข้อมูลผู้ดูแล -->
        <div class="col-12 row items-center q-pa-sm">
          <div class="col-12 col-md-1 text-right q-pr-md"><p class="q-my-none">ชื่อ :</p></div>
          <div class="col-12 col-md-4">
            <q-input
              v-model="adminStore.admin.name"
              :readonly="!isEditMode"
              :class="isEditMode ? 'editable' : 'readonly'"
              class="qinput"
              borderless
              dense
              :rules="[(val) => (!!val && val.length >= 2) || 'กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร']"
            />
          </div>

          <div class="col-12 col-md-2 text-right q-pr-md"><p class="q-my-none">Email :</p></div>
          <div class="col-12 col-md-4">
            <q-input
              v-model="adminStore.admin.email"
              :readonly="!isEditMode"
              :class="isEditMode ? 'editable' : 'readonly'"
              class="qinput"
              borderless
              dense
              :rules="[(val) => !!val || 'กรุณากรอกอีเมล']"
            />
          </div>
        </div>
      </div>

      <div class="q-mt-md q-pa-md text-right">
        <template v-if="!isEditMode">
          <q-btn label="แก้ไข" class="btnedit" unelevated rounded @click="startEdit" />
        </template>
        <template v-else>
          <q-btn label="ยกเลิก" class="btnreject q-mr-md" unelevated rounded @click="cancelEdit" />
          <q-btn label="บันทึก" class="btnconfirm" unelevated rounded @click="save" />
        </template>
      </div>
    </q-card>

    <q-skeleton v-else type="rect" height="200px" />
  </q-page>
</template>

<style scoped>
.qinput {
  border: 1px solid #757575;
  border-radius: 5px;
  padding-left: 10px;
}
.readonly {
  background-color: #e4e4e4;
  color: #757575;
}
.editable {
  background-color: white;
}
</style>
