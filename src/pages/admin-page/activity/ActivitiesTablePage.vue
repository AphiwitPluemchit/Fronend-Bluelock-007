<template>
  <q-page class="q-pa-md">
    <!-- ชื่อหน้า -->
    <div class="row justify-start items-center">
      <div class="text-h4">จัดการกิจกรรม</div>
    </div>
    <div class="row justify-end items-center">
      <q-btn dense outlined icon="add" label="เพิ่มข้อมูล" class="btnadd" @click="goToPage()" />
    </div>
    <!-- ตาราง 1 -->
    <section class="q-mt-lg">
      <div class="row justify-between items-center">
        <div class="text-h6">กิจกรรมที่กำลังเปิดและปิดลงทะเบียนแล้ว</div>
        <div class="row">
          <q-input
            dense
            outlined
            v-model="search1"
            placeholder="ค้นหา"
            class="q-mr-sm searchbox"
            :style="{ boxShadow: 'none' }"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn class="btnfilter" @click="showFilterDialog1 = true">
            <img src="icons\sort.svg" alt="Sort Icon" width="30" height="30" />
            <FilterDialog
              v-model="showFilterDialog1"
              :categories="filterCategories1"
              @apply="applyFilters"
            />
          </q-btn>
        </div>
      </div>
      <q-table
        bordered
        flat
        :rows="mapActivitiesToTableRows(activityStore.activitys1)"
        :columns="columns"
        row-key="id"
        class="q-mt-md customtable"
      >
        <template #body-cell-action="props">
          <q-td class="q-gutter-x-sm">
            <q-btn
              icon="info"
              padding="none"
              flat
              color="grey-8"
              @click="() => { console.log(props.row); void goToPageDetail(props.row.id) }"
            ></q-btn
          ></q-td> </template
      ></q-table>
    </section>

    <!-- ตาราง 2 -->
    <section class="q-mt-lg">
      <div class="row justify-between items-center">
        <div class="text-h6">กิจกรรมที่กำลังวางแผน</div>
        <div class="row">
          <q-input
            dense
            outlined
            v-model="search2"
            placeholder="ค้นหา"
            class="q-mr-sm searchbox"
            :style="{ boxShadow: 'none' }"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn class="btnfilter" @click="showFilterDialog2 = true">
            <img src="icons\sort.svg" alt="Sort Icon" width="30" height="30" />
            <FilterDialog
              v-model="showFilterDialog2"
              :categories="filterCategories2"
              @apply="applyFilters"
            />
          </q-btn>
        </div>
      </div>
      <q-table
        :rows="mapActivitiesToTableRows(activityStore.activitys2)"
        :columns="columns"
        row-key="id"
        class="q-mt-md"
      >
        <template #body-cell-action="props">
          <q-td class="q-gutter-x-sm" style="min-width: 100px">
            <q-btn
              icon="edit"
              padding="none"
              flat
              color="grey-8"
              @click="goToPageDetail(props.row.action)"
            ></q-btn
          ></q-td> </template
      ></q-table>
    </section>

    <!-- ตาราง 3 -->
    <section class="q-mt-lg">
      <div class="row justify-between items-center">
        <div class="text-h6">อื่น ๆ</div>
        <div class="row">
          <q-input
            dense
            outlined
            v-model="search3"
            placeholder="ค้นหา"
            class="q-mr-sm searchbox"
            :style="{ boxShadow: 'none' }"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn class="btnfilter" @click="showFilterDialog3 = true">
            <img src="icons\sort.svg" alt="Sort Icon" width="30" height="30" />
            <FilterDialog
              v-model="showFilterDialog3"
              :categories="filterCategories3"
              @apply="applyFilters"
            />
          </q-btn>
        </div>
      </div>
      <q-table
        :rows="mapActivitiesToTableRows(activityStore.activitys3)"
        :columns="columns"
        row-key="id"
        class="q-mt-md"
      >
        <template #body-cell-action="props">
          <q-td class="q-gutter-x-sm" style="min-width: 100px">
            <q-btn
              icon="edit"
              padding="none"
              flat
              color="grey-8"
              @click="() => void goToPageDetail(props.row.id)"
            ></q-btn
          ></q-td> </template
      ></q-table>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import { useActivityStore } from 'src/stores/activity'
import type { Activity } from 'src/types/activity'
// import { useActivityStore } from 'src/stores/activity'
// const activityStore = useActivityStore()
// ใช้ Vue Router
const router = useRouter()

const activityStore = useActivityStore()

const goToPage = async () => {
  await router.push('/ActivitiesManagement/CreateActivity')
}
const goToPageDetail = async (id: string) => {
  await router.push(`/ActivitiesManagement/ActivityDetail/${id}`)
  console.log(id)
  // await activityStore.fetchOneData(id)
  // :to="`/Student/Activity/ActivityDetail/${activity.id}`"
  await router.push(`/Admin/ActivitiesManagement/ActivityDetail/${id}`)
}


const filters = ref<{
  year: string[]
  major: string[]
  statusStudent: string[]
  statusActivity: string[]
  categoryActivity: string[]
}>({
  year: [],
  major: [],
  statusStudent: [],
  statusActivity: [],
  categoryActivity: [],
})
const showFilterDialog1 = ref(false)
const filterCategories1 = ref([
  'year',
  'major',
  'statusStudent',
  'statusActivity',
  'categoryActivity',
])
const showFilterDialog2 = ref(false)
const filterCategories2 = ref([
  'year',
  'major',
  'statusStudent',
  'statusActivity',
  'categoryActivity',
])
const showFilterDialog3 = ref(false)
const filterCategories3 = ref([
  'year',
  'major',
  'statusStudent',
  'statusActivity',
  'categoryActivity',
])
const applyFilters = (selectedFilters: {
  year: string[]
  major: string[]
  statusStudent: string[]
  statusActivity: string[]
  categoryActivity: string[]
}) => {
  filters.value = selectedFilters
  console.log('Filters Applied:', filters.value)
}
// ตัวแปรสำหรับค้นหา
const search1 = ref('')
const search2 = ref('')
const search3 = ref('')

// กำหนดโครงสร้างของคอลัมน์ในตาราง
const columns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'left' as const },
  { name: 'name', label: 'ชื่อกิจกรรม', field: 'name', align: 'left' as const },
  { name: 'date', label: 'วันที่', field: 'date', align: 'left' as const },
  { name: 'time', label: 'เวลา', field: 'time', align: 'left' as const },
  { name: 'location', label: 'สถานที่', field: 'location', align: 'left' as const },
  {
    name: 'participants',
    label: 'จำนวน (ลง/รับ/เหลือ)',
    field: 'participants',
    align: 'left' as const,
  },
  { name: 'type', label: 'ประเภท', field: 'type', align: 'left' as const },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'left' as const },
  { name: 'action', label: '', field: '', align: 'left' as const },
]

onMounted(async () => {
  await activityStore.getActivities()
})

function mapActivitiesToTableRows(activitys: Activity[]) {
  if (!activitys || activitys.length === 0) {
    return [] // ✅ ถ้าไม่มี Activity เลย ให้คืนค่าเป็น Array ว่าง
  }

  return activitys.map((activity, index) => {
    const firstItem = activity.activityItems?.[0] || {} // ✅ ป้องกัน `undefined` หรือ `null`
    const firstDate = firstItem?.dates?.[0] || { date: '-', stime: '-', etime: '-' } // ✅ ตรวจสอบ `date`

    return {
      index: index + 1, // ✅ ลำดับ
      id: activity.id ?? '-',
      name: activity.name ?? '-', // ✅ ถ้า `name` เป็น `undefined` ให้ใช้ "-"
      date: firstDate.date ?? '-', // ✅ ถ้า `date` เป็น `null` หรือ `undefined` ให้ใช้ "-"
      time: firstItem.hour ? `${firstItem.hour} ชม.` : '-', // ✅ แสดงเวลา
      location: firstItem.rooms ?? '-', // ✅ ถ้า `room` เป็น `null` ให้ใช้ "-"
      participants: `${firstItem.maxParticipants ?? 0} / ${firstItem.maxParticipants ?? 0} / ${firstItem.maxParticipants ?? 0}`, // ✅ จำนวนผู้เข้าร่วม (Mock Data)
      type: activity.type ?? '-', // ✅ ประเภท
      status: activity.activityState ?? '-', // ✅ สถานะ
      action: '', // ✅ ปุ่ม Action (สามารถใส่ปุ่มเพิ่มได้)
    }
  })
}
</script>

<style scoped></style>
