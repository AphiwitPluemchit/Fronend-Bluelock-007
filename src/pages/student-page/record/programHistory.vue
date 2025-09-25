<script setup lang="ts">
import EnrollmentType from 'src/components/enrollmentType.vue'
import ProgramType from 'src/components/programType.vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'

import { EnrollmentService } from 'src/services/enrollment'
import { useAuthStore } from 'src/stores/auth'
import type { Pagination } from 'src/types/pagination'
import type { ProgramHistory } from 'src/types/program'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const auth = useAuthStore()
const allPrograms = ref<ProgramHistory[]>([])
const showFilterDialog = ref(false)
const filterCategories = ref(['categoryProgram'])
const selectedFilters = ref({
  categoryProgram: [] as string[],
})
const query = ref<Pagination>({
  page: 1,
  limit: -1,
  search: '',
  sortBy: '_id',
  order: 'desc',
  skill: [],
  programState: ['open', 'close'],
  major: [],
  studentYear: [],
})
interface SelectedFilters {
  categoryProgram: string[]
}
const onClick = async (id: string) => {
  await router.push(`/Student/Program/MyProgramDetail/${id}`)
}

const getProgramItemStatus = (program: ProgramHistory): number => {
  const status = program?.programItems?.[0]?.status
  return typeof status === 'number' ? status : 1
}

const formatDateTime = (iso?: string) => {
  if (!iso) return '-'
  const d = new Date(iso)
  try {
    return d.toLocaleString('th-TH', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return d.toISOString()
  }
}
const getApprovedAt = (program: ProgramHistory): string | undefined => {
  const item = program?.programItems?.[0]
  if (!item) return '-'

  // 1) ถ้า Backend ส่งมาเป็นฟิลด์ตรง ๆ เลย
  if (item.approvedAt) return item.approvedAt
}

// สีแถบซ้ายตามประเภทกิจกรรม
const typeStripeClass = (p: ProgramHistory) => {
  const t = p.type === 'academic' || p?.skill === 'hard' ? 'stripe--blue' : 'stripe--green'
  return t
}

// ชั่วโมง (เอาจาก programItems[0].hour)
const getHours = (p: ProgramHistory): number | undefined => {
  const h = p?.programItems?.[0]?.hour
  return typeof h === 'number' ? h : undefined
}
const applyFilters = (filters: SelectedFilters) => {
  selectedFilters.value = filters
}
const fetchData = async () => {
  try {
    const studentId = `${auth.getUser?.id}`
    const response = await EnrollmentService.getEnrollmentsByStudentID(studentId, query.value)
    allPrograms.value = response.data
    // programs.value = response.data
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลโครงการ:', error)
  }
}
onMounted(async () => {
  await fetchData()
})
</script>
<template>
  <!-- Program History -->
  <div class="row justify-between items-right q-mb-md search-filter-wrapper q-col-gutter-md">
    <div class="text-h6"></div>
    <div class="row search-filter-inner items-center no-wrap">
      <q-input
        dense
        outlined
        v-model="query.search"
        placeholder="ค้นหา ชื่อโครงการ"
        class="q-mr-sm searchbox"
        :style="{ boxShadow: 'none' }"
        clearable
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>

      <div class="filter-btn-wrapper">
        <FilterDialog
          :model-value="showFilterDialog"
          :categories="filterCategories"
          @apply="applyFilters"
          :years="query.studentYear || []"
          :majors="query.major || []"
          :status-programs="query.programState || []"
          :category-programs="selectedFilters.categoryProgram"
        />
      </div>
    </div>
  </div>
  <div class="column q-gutter-md">
    <!-- การ์ดต่อกิจกรรม -->
    <q-card
      v-for="(program, idx) in allPrograms"
      :key="idx"
      class="program-card cursor-pointer"
      flat
      bordered
      @click="onClick(program.id!)"
    >
      <div class="program-card__stripe" :class="typeStripeClass(program)"></div>

      <q-card-section class="q-pt-md q-pb-sm">
        <!-- แถวบน: สถานะซ้าย / ทักษะขวา -->
        <div class="row items-center justify-between q-mb-sm">
          <div class="row items-center q-gutter-xs">
            <EnrollmentType :status="getProgramItemStatus(program)" />
          </div>
          <ProgramType
            v-if="program.skill === 'hard' || program.skill === 'soft'"
            :skill="program.skill === 'hard' ? 'hardSkill' : 'softSkill'"
          />
        </div>

        <!-- ชื่อกิจกรรม -->
        <div class="text-weight-medium text-body1 ellipsis-2 q-mb-xs q-mb-sm" :title="program.name">
          {{ program.name }}
        </div>

        <!-- รายละเอียดวันที่อนุมัติ / ชั่วโมง -->
        <div class="row text-weight-medium text-body1 ellipsis-2 q-mb-xs q-mb-sm">
          <q-icon name="event" size="18px" />
          <div class="text-body2">
            วันที่อนุมัติ :
            {{ getApprovedAt(program) ? formatDateTime(getApprovedAt(program)!) : '-' }}
          </div>
        </div>

        <div class="row text-weight-medium text-body1 ellipsis-2 q-mb-xs q-mb-sm">
          <q-icon name="schedule" size="18px" />
          <div class="text-body2">
            จำนวนชั่วโมง : {{ getApprovedAt(program) ? getHours(program) : '-' }}
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>
<style scoped>
.search-filter-wrapper {
  flex-wrap: wrap;
}
.searchbox {
  flex-grow: 1;
  min-width: 0;
}

@media (max-width: 600px) {
  .search-filter-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .searchbox {
    width: 100%;
  }
}
</style>
