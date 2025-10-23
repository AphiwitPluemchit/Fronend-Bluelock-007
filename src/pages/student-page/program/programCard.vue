<script setup lang="ts">
import type { Program, ProgramItem } from 'src/types/program'
import { api } from 'boot/axios'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import { useQuasar } from 'quasar'
import { computed } from 'vue'
import ProgramType from 'src/components/programType.vue'

const baseurl = api.defaults.baseURL
const $q = useQuasar()
const isMobile = computed(() => $q.screen.lt.sm)

dayjs.locale('th')
dayjs.extend(buddhistEra)

defineProps<{ program: Program }>()

function getProgramDate(programItems: ProgramItem[] | null | undefined): string {
  if (!programItems || programItems.length === 0 || !programItems[0]?.dates) {
    return 'ไม่ระบุ'
  }

  const firstDate = programItems[0].dates[0]?.date
  return firstDate ? dayjs(firstDate).format('D MMMM BBBB') : 'ไม่ระบุ'
}

function getProgramTime(programItems: ProgramItem[] | null | undefined): string {
  if (!programItems || programItems.length === 0 || !programItems[0]?.dates) {
    return '-'
  }

  const stime = programItems[0].dates[0]?.stime ?? ''
  const etime = programItems[0].dates[0]?.etime ?? ''
  return stime && etime ? `${stime} - ${etime}` : '-'
}

function enrollmentSummary(programItems: ProgramItem[]) {
  if (!programItems || programItems.length === 0) return '-'
  const totalEnrolled = programItems.reduce((total, item) => total + (item.enrollmentCount || 0), 0)
  const totalAccepted = programItems.reduce((total, item) => total + (item.maxParticipants ?? 0), 0)
  return `${totalEnrolled}/${totalAccepted}`
}

function getProgramLocation(programItems: ProgramItem[] | null | undefined): string {
  if (!programItems || programItems.length === 0 || !programItems[0]?.rooms) {
    return 'ไม่ระบุ'
  }
  
  const rooms = programItems[0].rooms
  return rooms && rooms.length > 0 ? rooms.join(', ') : 'ไม่ระบุ'
}
</script>

<template>
  <q-card
    class="program-card cursor-pointer shadow-3"
    :class="{ 'clickable-card': !isMobile }"
    @click="!isMobile && $router.push(`/Student/Program/ProgramDetail/${program.id}`)"
    shadow-3
  >
    <q-card-section class="outer-box">
      <div class="inner-box">
        <!-- รูปโครงการ -->
        <div class="program-image-container">
          <q-img
            :src="
              program?.file
                ? `${baseurl}/uploads/program/images/${program.file}`
                : `${baseurl}/uploads/no-image.jpg`
            "
            class="program-img"
            :ratio="4 / 3"
          />
        </div>

        <!-- รายละเอียดโครงการ -->
        <div class="program-content">
          <div class="text-h6 text-bold ellipsis-2-lines q-mb-md">
            {{ program.name }}
          </div>

          <div class="q-mb-md">
            <ProgramType
              v-if="program.skill === 'hard' || program.skill === 'soft'"
              :skill="program.skill === 'hard' ? 'hardSkill' : 'softSkill'"
            />
          </div>

          <div class="text-subtitle2 q-mt-sm label">
            <q-icon name="today" class="q-mb-xs" />
            วันที่จัด : {{ getProgramDate(program.programItems) }}
          </div>
          <div class="text-subtitle2 q-mt-sm label">
            <q-icon name="schedule" class="q-mb-xs" />
            เวลาที่จัด : {{ getProgramTime(program.programItems) }}
          </div>
          <div class="text-subtitle2 q-mt-sm label">
            <q-icon name="chair" class="q-mb-xs" />
            จำนวนที่รับ : {{ enrollmentSummary(program.programItems ?? []) }}
          </div>
          <div class="text-subtitle2 q-mt-sm label">
            <q-icon name="place" class="q-mb-xs" />
            สถานที่ : {{ getProgramLocation(program.programItems) }}
          </div>
        </div>

        <!-- ✅ ปุ่มรายละเอียดเฉพาะจอมือถือ -->
        <div v-if="isMobile" class="program-button">
          <q-btn
            label="รายละเอียด"
            dense
            unelevated
            class="btnconfirm full-width"
            color="btnconfirm"
            @click.stop="$router.push(`/Student/Program/ProgramDetail/${program.id}`)"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.program-card {
  height: 100%;
  border-radius: 16px;
  /* box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08); */
  background-color: #fff; /* สีปกติ */
  transition:
    background-color 0.3s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.clickable-card:hover {
  background-color: #f0f4ff; /* สีตอน hover */
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.outer-box {
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.inner-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: transparent; /* ไม่ต้อง fix สีในนี้ */
}

.program-image-container {
  margin-bottom: 16px;
}

.program-img {
  /* width: 100%;
  height: 200px; */
  object-fit: cover;
  border-radius: 12px;
}

.program-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.program-button {
  margin-top: auto;
  padding-top: 16px;
}

.label {
  color: #6b7280;
}

.label .q-icon {
  color: #3c4556;
}

@media (max-width: 600px) {
  /* .program-img {
    height: 120px;
  } */
}

@media (max-width: 400px) {
  .program-img {
    /* height: 100px; */
    border-radius: 8px;
  }
}

.btnconfirm {
  width: 100%;
}
</style>
