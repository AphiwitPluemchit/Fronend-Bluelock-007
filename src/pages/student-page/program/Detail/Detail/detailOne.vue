<script setup lang="ts">
import type { Program, ProgramItem } from 'src/types/program'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
dayjs.locale('th')
dayjs.extend(buddhistEra)
defineProps<{ program: Program }>()
// ฟังก์ชันดึงวันที่
// const getProgramdates = (programItems: ProgramItem[] | null | undefined): string => {
//   if (!programItems || programItems.length === 0 || !programItems[0]?.dates) {
//     return 'ไม่ระบุ'
//   }

//   // ใช้ formatDateToThai เพื่อแปลงวันที่
//   const firstDate = programItems[0].dates[0]?.date // เลือกวันที่แรก
//   return firstDate ? formatDateToThai(firstDate) : 'ไม่ระบุ' // แสดงวันที่แรกในรูปแบบที่ต้องการ
// }
const getProgramdates = (programItems: ProgramItem[] | null | undefined): string => {
  const firstItem = programItems?.find((item) => item.dates && item.dates.length > 0)
  return firstItem?.dates
    ? firstItem.dates.map((d) => formatDateToThai(d.date)).join(', ')
    : 'ไม่ระบุ'
}
// ฟังก์ชันดึงเวลา
const getProgramTime = (programItems: ProgramItem[] | null | undefined): string => {
  const firstItem = programItems?.find((item) => item.dates && item.dates.length > 0)
  return firstItem?.dates
    ? firstItem.dates.map((d) => `${d.stime} - ${d.etime}`).join(', ')
    : 'ไม่ระบุ'
}

function formatDateToThai(dateString: string): string {
  if (!dateString) return '-'
  return dayjs(dateString).format('D MMMM BBBB') // D = วัน, MMM = เดือน, BBBB = ปี พ.ศ.
}

// ฟังก์ชันดึงจำนวนชั่วโมง
const getProgramHours = (programItems: ProgramItem[] | null | undefined): string => {
  return programItems?.reduce((total, item) => total + (item.hour ?? 0), 0).toString() ?? '0'
}
// ฟังก์ชันดึงรายชื่อห้องโครงการ
const getProgramRooms = (programItems: ProgramItem[] | null | undefined): string => {
  if (!programItems || programItems.length === 0) return 'ไม่ระบุ'
  const rooms = programItems[0]?.rooms
  return Array.isArray(rooms) && rooms.length > 0 ? rooms.join(', ') : 'ไม่ระบุ'
}
const getProgramEnrollments = (programItems: ProgramItem[] | null | undefined): string => {
  if (!programItems) return 'ไม่ระบุ'
  const total = programItems.reduce((sum, item) => sum + (item.enrollmentCount ?? 0), 0)
  const max = programItems.reduce((sum, item) => sum + (item.maxParticipants ?? 0), 0)
  return `${total} / ${max}`
}

const getProgramOperator = (programItems: ProgramItem[] | null | undefined): string => {
  const firstItem = programItems?.[0]
  return firstItem?.operator || 'ไม่ระบุ'
}

const URL_REGEX = /((https?:\/\/|www\.)[^\s<]+)/gi
const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function toAbsolute(url: string) {
  return url.startsWith('http') ? url : `https://${url}`
}

function linkify(text: string) {
  const escaped = escapeHtml(text)
  const withUrls = escaped.replace(URL_REGEX, (m) => {
    const href = toAbsolute(m)
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${m}</a>`
  })
  const withEmails = withUrls.replace(EMAIL_REGEX, (m) => `<a href="mailto:${m}">${m}</a>`)
  return withEmails.replace(/\n/g, '<br>')
}

const getProgramDetailHtml = (programItems: ProgramItem[] | null | undefined): string => {
  const firstItem = programItems?.[0]
  const text = firstItem?.description || 'ไม่มีรายละเอียดเพิ่มเติม'
  return linkify(text)
}

</script>

<template>
  <q-list dense class="textcontent1">
    <div class="field-pair">
      <div class="field-label">ชื่อโครงการ : </div>
      <div class="field-value">{{ program?.name ?? 'ไม่ระบุ' }}</div>
    </div>

    <div class="field-pair">
      <div class="field-label">วันที่จัดโครงการ : </div>
      <div class="field-value">{{ getProgramdates(program?.programItems) }}</div>
    </div>

    <div class="field-pair">
      <div class="field-label">เวลาที่จัดโครงการ : </div>
      <div class="field-value">{{ getProgramTime(program?.programItems) }}</div>
    </div>

    <div class="field-pair">
      <div class="field-label">ประเภทโครงการ : </div>
      <div class="field-value">
        {{
          program?.skill === 'hard'
            ? 'ชั่วโมงทักษะทางวิชาการ'
            : program?.skill === 'soft'
              ? 'ชั่วโมงทักษะเตรียมความพร้อม'
              : 'ไม่ระบุประเภท'
        }}
      </div>
    </div>

    <div class="field-pair">
      <div class="field-label">สถานที่จัดโครงการ : </div>
      <div class="field-value">{{ getProgramRooms(program?.programItems) }}</div>
    </div>

    <div class="field-pair">
      <div class="field-label">จำนวนชั่วโมงที่ได้รับ : </div>
      <div class="field-value">{{ getProgramHours(program?.programItems) }} ชั่วโมง</div>
    </div>

    <div class="field-pair">
      <div class="field-label">จำนวนที่ลงทะเบียน : </div>
      <div class="field-value">{{ getProgramEnrollments(program?.programItems) }}</div>
    </div>

    <div class="field-pair">
      <div class="field-label">วิทยากร : </div>
      <div class="field-value">{{ getProgramOperator(program?.programItems) }}</div>
    </div>

    <div class="field-pair">
      <div class="field-label">รายละเอียดอื่น ๆ : </div>
      <div class="field-value" v-html="getProgramDetailHtml(program?.programItems)"></div>
    </div>
  </q-list>
</template>

<style scoped>
.field-pair {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

/* มือถือ: แสดงแนวตั้งเหมือนเดิม */
.field-label {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.field-value {
  color: #555;
  word-break: break-word;
}

/* แสดงแนวนอนเฉพาะตอนจอใหญ่ */
@media (min-width: 768px) {
  .field-pair {
    flex-direction: row;
    align-items: baseline;
  }

  .field-label {
    width: 200px;
    text-align: right;
    margin-bottom: 0;
    padding-right: 8px;
    position: relative;
  }

  .field-label::after {
    position: absolute;
    right: 0;
  }

  .field-value {
    text-align: left;
    flex: 1;
  }
}
</style>


