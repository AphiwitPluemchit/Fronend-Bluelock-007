<script setup lang="ts">
import type { Program, ProgramItem } from 'src/types/program'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
dayjs.locale('th')
dayjs.extend(buddhistEra)

function formatDateToThai(dateString: string): string {
  if (!dateString) return '-'
  return dayjs(dateString).format('D MMMM BBBB')
}

defineProps<{ program: Program }>()

// วันที่จาก programItems
const getProgramdates = (programItems: ProgramItem[] | null | undefined): string => {
  const firstItem = programItems?.find((item) => item.dates && item.dates.length > 0)
  return firstItem?.dates
    ? firstItem.dates.map((d) => formatDateToThai(d.date)).join(', ')
    : 'ไม่ระบุ'
}

// เวลา
const getProgramTime = (programItems: ProgramItem[] | null | undefined): string => {
  const firstItem = programItems?.find((item) => item.dates && item.dates.length > 0)
  return firstItem?.dates
    ? firstItem.dates.map((d) => `${d.stime} - ${d.etime}`).join(', ')
    : 'ไม่ระบุ'
}

/** ---------- ทำให้รายละเอียดเป็นลิงก์คลิกได้ ---------- **/
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

// เรียกใช้ใน template
function linkifyText(text?: string) {
  const val = text?.trim()
  return val && val.length > 0 ? linkify(val) : 'ไม่ระบุ'
}
</script>

<template>
  <div class="textcontent1">
    <!-- ข้อมูลทั่วไป -->
    <div class="field-pair">
      <div class="field-label">ชื่อโครงการหลัก :</div>
      <div class="field-value">{{ program?.name ?? 'ไม่ระบุ' }}</div>
    </div>
    <div class="field-pair">
      <div class="field-label">วันที่จัดโครงการ :</div>
      <div class="field-value">{{ getProgramdates(program?.programItems) }}</div>
    </div>
    <div class="field-pair">
      <div class="field-label">เวลาที่จัดโครงการ :</div>
      <div class="field-value">{{ getProgramTime(program?.programItems) }}</div>
    </div>
    <div class="field-pair">
      <div class="field-label">ประเภทโครงการ :</div>
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
      <div class="field-label">จำนวนโครงการ :</div>
      <div class="field-value">{{ program.programItems?.length }} โครงการ</div>
    </div>

    <q-separator spaced />

    <!-- รายการรอบโครงการ -->
    <div v-for="item in program.programItems" :key="item.id || ''">
      <div class="field-pair">
        <div class="field-label">ชื่อโครงการย่อย :</div>
        <div class="field-value">{{ item.name ?? 'ไม่ระบุ' }}</div>
      </div>
      <div class="field-pair">
        <div class="field-label">สถานที่จัดโครงการ :</div>
        <div class="field-value">
          {{ Array.isArray(item.rooms) ? item.rooms.join(', ') : (item.rooms ?? 'ไม่ระบุ') }}
        </div>
      </div>
      <div class="field-pair">
        <div class="field-label">จำนวนชั่วโมงที่ได้รับ :</div>
        <div class="field-value">{{ item.hour ?? '-' }} ชั่วโมง</div>
      </div>
      <div class="field-pair">
        <div class="field-label">จำนวนที่ลงทะเบียน :</div>
        <div class="field-value">
          {{ item.enrollmentCount ?? 'ไม่ระบุ' }}/{{ item.maxParticipants ?? 'ไม่ระบุ' }}
        </div>
      </div>
      <div class="field-pair">
        <div class="field-label">วิทยากร :</div>
        <div class="field-value">{{ item.operator ?? 'ไม่ระบุ' }}</div>
      </div>

      <!-- ✅ ใช้ v-html เพื่อให้ลิงก์คลิกได้ -->
      <div class="field-pair">
        <div class="field-label">รายละเอียดอื่น ๆ :</div>
        <div class="field-value" v-html="linkifyText(item.description ?? 'ไม่ระบุ')"></div>
      </div>

      <q-separator spaced />
    </div>
  </div>
</template>

<style scoped>
.field-pair {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}
.field-label {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}
.field-value {
  color: #555;
  word-break: break-word;
  overflow-wrap: anywhere; /* กัน URL ยาวล้น */
}
.field-value a {
  text-decoration: underline;
}

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
