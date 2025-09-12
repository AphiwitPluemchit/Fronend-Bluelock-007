<template>
  <q-page class="q-pa-md">
    <div class="form_answer bg-blue-1 q-pa-md">
      <!-- Header -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h5 q-mb-sm">{{ form?.title || '...' }}</div>
          <div class="text-subtitle2 text-grey-7">{{ form?.description }}</div>
        </q-card-section>
      </q-card>

      <q-inner-loading :showing="loading">
        <q-spinner size="32px" color="primary" />
      </q-inner-loading>

      <!-- Content -->
      <div
        v-for="(block, index) in visibleBlocks"
        :key="block.id || index"
        class="q-mb-md flex flex-center"
      >
        <q-card class="q-pa-md card-answer">
          <!-- Title Card -->
          <template v-if="block.type === 'title'">
            <div class="text-h6">{{ block.title }}</div>
            <div v-if="block.description" class="text-subtitle2 text-grey-7 q-mt-sm">
              {{ block.description }}
            </div>
          </template>

          <!-- Short Answer -->
          <template v-else-if="block.type === 'short_answer'">
            <div class="text-subtitle1 q-mb-xs">
              {{ block.title }}
              <span v-if="block.isRequired" class="text-red">*</span>
            </div>
            <q-input
              dense
              outlined
              :model-value="(answers[blockKey(block)] as string) ?? ''"
              @update:model-value="(val) => (answers[blockKey(block)] = val)"
              placeholder="คำตอบของคุณ..."
              class="full-width"
              :error="showErrors && isRequiredInvalid(block)"
              :error-message="'จำเป็นต้องกรอกข้อมูล'"
            />
          </template>

          <!-- Paragraph -->
          <template v-else-if="block.type === 'paragraph'">
            <div class="text-subtitle1 q-mb-xs">
              {{ block.title }}
              <span v-if="block.isRequired" class="text-red">*</span>
            </div>
            <q-input
              type="textarea"
              dense
              outlined
              :model-value="(answers[blockKey(block)] as string) ?? ''"
              @update:model-value="(val) => (answers[blockKey(block)] = val)"
              placeholder="คำตอบของคุณ..."
              class="full-width"
              :error="showErrors && isRequiredInvalid(block)"
              :error-message="'จำเป็นต้องกรอกข้อมูล'"
            />
          </template>

          <!-- Multiple Choice -->
          <template v-else-if="block.type === 'multiple_choice'">
            <div class="text-subtitle1 q-mb-xs">
              {{ block.title }}
              <span v-if="block.isRequired" class="text-red">*</span>
            </div>
            <q-option-group
              :options="(block.choices || []).map((c) => ({ label: c.title, value: c.title }))"
              type="radio"
              :model-value="(answers[blockKey(block)] as string) ?? null"
              @update:model-value="(val) => (answers[blockKey(block)] = val)"
              :error="showErrors && isRequiredInvalid(block)"
            />
          </template>

          <!-- Checkbox -->
          <template v-else-if="block.type === 'checkbox'">
            <div class="text-subtitle1 q-mb-xs">
              {{ block.title }}
              <span v-if="block.isRequired" class="text-red">*</span>
            </div>
            <q-option-group
              :options="(block.choices || []).map((c) => ({ label: c.title, value: c.title }))"
              type="checkbox"
              :model-value="
                Array.isArray(answers[blockKey(block)])
                  ? (answers[blockKey(block)] as string[])
                  : []
              "
              @update:model-value="(val) => (answers[blockKey(block)] = val)"
              :error="showErrors && isRequiredInvalid(block)"
            />
          </template>

          <!-- Dropdown -->
          <template v-else-if="block.type === 'dropdown'">
            <div class="text-subtitle1 q-mb-xs">
              {{ block.title }}
              <span v-if="block.isRequired" class="text-red">*</span>
            </div>
            <q-select
              :options="(block.choices || []).map((c) => c.title)"
              :model-value="(answers[blockKey(block)] as string) ?? null"
              @update:model-value="(val) => (answers[blockKey(block)] = val)"
              outlined
              dense
              placeholder="กรุณาเลือก"
              class="full-width"
              :error="showErrors && isRequiredInvalid(block)"
            />
          </template>

          <!-- Rating -->
          <template v-else-if="block.type === 'rating'">
            <div class="text-subtitle1 q-mb-sm">
              {{ block.title }}
              <span v-if="block.isRequired" class="text-red">*</span>
            </div>
            <div class="row items-end q-gutter-lg q-mt-sm">
              <div
                v-for="i in block.max || 5"
                :key="i"
                class="column items-center"
                style="width: 50px"
                @click="answers[blockKey(block)] = i"
              >
                <q-icon
                  :name="block.icon || 'star'"
                  :class="[
                    'rating-icon',
                    block.icon || 'star',
                    { 'text-yellow': i <= ((answers[blockKey(block)] as number) || 0) },
                  ]"
                  size="28px"
                  style="cursor: pointer"
                />
                <div class="text-caption q-mt-xs">{{ i }}</div>
              </div>
            </div>
            <q-input
              v-show="false"
              :model-value="(answers[blockKey(block)] as number) ?? 0"
              :error="showErrors && isRequiredInvalid(block)"
              error-message="กรุณาให้คะแนน"
            />
          </template>

          <!-- Grid: Multiple Choice (one per row) -->
          <template v-else-if="block.type === 'grid_multiple_choice'">
            <div class="text-subtitle1 q-mb-sm">
              {{ block.title }} <span v-if="block.isRequired" class="text-red">*</span>
            </div>

            <q-markup-table flat bordered dense class="grid-table">
              <thead>
                <tr>
                  <th class="row-header"></th>
                  <th v-for="(col, colIndex) in getCols(block)" :key="colIndex" class="col-choice">
                    {{ col.title }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in getRows(block)" :key="rowIndex">
                  <td class="text-weight-medium row-header">{{ row.title }}</td>
                  <td v-for="(col, colIndex) in getCols(block)" :key="colIndex" class="col-choice">
                    <q-radio :val="col.title" v-model="getGridSingle(blockKey(block))[row.title]" />
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </template>

          <!-- Grid: Checkbox (multi per row) -->
          <template v-else-if="block.type === 'grid_checkbox'">
            <div class="text-subtitle1 q-mb-sm">
              {{ block.title }} <span v-if="block.isRequired" class="text-red">*</span>
            </div>

            <q-markup-table flat bordered dense class="grid-table">
              <thead>
                <tr>
                  <th class="row-header"></th>
                  <th v-for="(col, colIndex) in getCols(block)" :key="colIndex" class="col-choice">
                    {{ col.title }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in getRows(block)" :key="rowIndex">
                  <td class="text-weight-medium row-header">{{ row.title }}</td>
                  <td v-for="(col, colIndex) in getCols(block)" :key="colIndex" class="col-choice">
                    <q-checkbox
                      :model-value="
                        getGridMulti(blockKey(block))[row.title]?.includes(col.title) || false
                      "
                      @update:model-value="
                        (val) => toggleGridMulti(blockKey(block), row.title, col.title, val)
                      "
                    />
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </template>
        </q-card>
      </div>

      <!-- Actions -->
      <q-card-actions class="q-mt-md justify-between">
        <!-- ปุ่มซ้าย -->
        <div>
          <q-btn
            v-if="totalSessions > 1 && currentSession > 1"
            flat
            label="ย้อนกลับ"
            class="btnback"
            @click="currentSession--"
          />
        </div>

        <!-- ปุ่มขวา -->
        <div class="row q-gutter-sm">
          <q-btn
            v-if="totalSessions > 1 && currentSession < totalSessions"
            flat
            label="ถัดไป"
            class="btnconfirm"
            @click="handleNext"
          />

          <q-btn
            v-if="totalSessions === 1 || currentSession === totalSessions"
            flat
            label="ส่ง"
            class="btnsecces"
            @click="handleSubmit"
          />
        </div>
      </q-card-actions>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useFormStore } from 'src/stores/forms'
import type { Block, Form } from 'src/types/form'
import type { Submission, Response as SubmissionResponse } from 'src/types/submission'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useSubmissionStore } from 'src/stores/submission'
import { useCheckinoutStore } from 'src/stores/checkinout'
import type { AxiosError } from 'axios'
import type { ErrorResponse } from 'src/types/pagination'

const $q = useQuasar()
const userStore = useAuthStore()
const submissionStore = useSubmissionStore()
const checkinoutStore = useCheckinoutStore()
const route = useRoute()
const formStore = useFormStore()
const form = ref<Form | null>(null)
const loading = ref(false)
const showErrors = ref(false)

// Types for answer values
type GridSingle = Record<string, string>
type GridMulti = Record<string, string[]>
type AnswerValue = string | string[] | number | GridSingle | GridMulti | null

const answers = reactive<Record<string, AnswerValue>>({})

const blockKey = (block: Block) => block.id || `${block.type}_${block.sequence}`

const currentSession = ref(1)

const totalSessions = computed(() => {
  const arr = (form.value?.blocks || []).map((b) => Number(b.session || 1))
  return arr.length ? Math.max(...arr) : 1
})

const visibleBlocks = computed(() => {
  if (!form.value) return []
  const s = currentSession.value
  return (form.value.blocks || [])
    .filter((b) => b.type !== 'session') // ❌ ไม่แสดงเส้นคั่นในหน้าตอบ
    .filter((b) => (b.session || 1) === s) // ✅ เฉพาะบล็อกของ session ปัจจุบัน
})

onMounted(async () => {
  const id = (route.params.id as string) || ''
  if (!id) return
  loading.value = true
  try {
    const res = await formStore.fetchFormById(id)
    form.value = res
    ;(form.value?.blocks || []).forEach((b) => initAnswer(b))
  } finally {
    loading.value = false
  }
})

function initAnswer(block: Block) {
  if (block.type === 'session') return
  const key = blockKey(block)
  if (block.type === 'checkbox') answers[key] = []
  else if (block.type === 'grid_multiple_choice') answers[key] = {} as GridSingle
  else if (block.type === 'grid_checkbox') answers[key] = {} as GridMulti
  else answers[key] = answers[key] ?? null
}

type GridLike = { rows?: unknown; choices?: unknown; columns?: unknown }

const isObj = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object'

const toTitle = (v: unknown): string => {
  if (typeof v === 'number') return String(v)
  if (typeof v === 'string') return v.trim()
  if (isObj(v)) {
    const t = v.title
    const l = v.label
    const n = v.name
    if (typeof t === 'string') return t.trim()
    if (typeof l === 'string') return l.trim()
    if (typeof n === 'string') return n.trim()
  }
  return ''
}
const normList = (arr: unknown): Array<{ title: string }> =>
  Array.isArray(arr) ? arr.map((x) => ({ title: toTitle(x) })).filter((o) => o.title !== '') : []

// columns อาจมาใน choices หรือ columns
const getCols = (block: Block | GridLike): Array<{ title: string }> => {
  const gl = block as GridLike
  const choices = Array.isArray(gl.choices) ? gl.choices : undefined
  const columns = Array.isArray(gl.columns) ? gl.columns : undefined
  // ถ้า choices ไม่มีหรือเป็น [] ให้ fallback ไป columns
  return normList(choices && choices.length > 0 ? choices : columns)
}
const getRows = (block: Block | GridLike): Array<{ title: string }> =>
  normList((block as GridLike).rows)

function isRequiredInvalid(block: Block): boolean {
  if (!block.isRequired) return false
  const key = blockKey(block)
  const v = answers[key]
  if (block.type === 'checkbox') return !Array.isArray(v) || v.length === 0
  if (block.type === 'grid_multiple_choice') {
    const rows = block.rows || []
    const map = v as GridSingle | undefined
    return rows.some((r) => !map || !map[r.title])
  }
  if (block.type === 'grid_checkbox') {
    const rows = block.rows || []
    const map = v as GridMulti | undefined
    return rows.some((r) => !map || !Array.isArray(map[r.title]))
  }
  return v === null || v === ''
}

function getGridMulti(key: string): Record<string, string[]> {
  if (!answers[key]) answers[key] = {} as GridMulti
  return answers[key] as GridMulti
}

function getGridSingle(key: string): Record<string, string> {
  if (!answers[key]) answers[key] = {} as GridSingle
  return answers[key] as GridSingle
}

function toggleGridMulti(key: string, rowTitle: string, colTitle: string, checked: boolean) {
  const group = getGridMulti(key)
  const arr = group[rowTitle] || []
  if (checked) {
    if (!arr.includes(colTitle)) arr.push(colTitle)
  } else {
    group[rowTitle] = arr.filter((c) => c !== colTitle)
  }
  group[rowTitle] = [...(group[rowTitle] || arr)]
}
function validateSession(sessionNo: number): boolean {
  const blocks = (form.value?.blocks || [])
    .filter((b) => b.type !== 'session')
    .filter((b) => (b.session || 1) === sessionNo)

  const hasError = blocks.some((b) => isRequiredInvalid(b))
  showErrors.value = hasError
  return !hasError
}
// หา id ของ choice จาก title
function findChoiceIdByTitle(block: Block, title: string | null | undefined): string | null {
  if (!title) return null
  const hit = (block.choices || []).find((c) => toTitle(c) === title || c.title === title)
  return hit?.id ?? null
}

// หา id ของ row จาก title
function findRowIdByTitle(block: Block, title: string | null | undefined): string | null {
  if (!title) return null
  const hit = (block.rows || []).find((r) => toTitle(r) === title || r.title === title)
  return hit?.id ?? null
}

const isString = (x: unknown): x is string => typeof x === 'string'
const isNumber = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)
const isStringArray = (x: unknown): x is string[] => Array.isArray(x) && x.every(isString)
type Dict<T = unknown> = Record<string, T>
const isPlainObject = (x: unknown): x is Dict => !!x && typeof x === 'object' && !Array.isArray(x)

// เฉพาะการแปลงเป็นข้อความแบบปลอดภัย: รองรับเฉพาะ string/number เท่านั้น
const toSafeText = (x: unknown): string => (isString(x) ? x : isNumber(x) ? String(x) : '')

function buildResponses(form: Form): SubmissionResponse[] {
  const out: SubmissionResponse[] = []
  const blocks = (form.blocks || []).filter((b) => b.type !== 'session')

  for (const block of blocks) {
    const key = blockKey(block)
    const v = answers[key]

    if (v == null || (typeof v === 'string' && v.trim() === '')) {
      if (block.isRequired) {
        /* empty */
      } else {
        continue
      }
    }

    if (block.type === 'short_answer' || block.type === 'paragraph') {
      const text = toSafeText(v)
      out.push({
        blockId: block.id!,
        answerText: text,
      })
    } else if (block.type === 'multiple_choice' || block.type === 'dropdown') {
      const title = typeof v === 'string' ? v : null
      const choiceId = findChoiceIdByTitle(block, title)
      // ถ้าไม่เจอ id จะเก็บเป็น answerText (กันข้อมูลหาย) เผื่อกรณีฟอร์มเก่าไม่มี id
      if (choiceId) {
        out.push({ blockId: block.id!, choiceId })
      } else if (title) {
        out.push({ blockId: block.id!, answerText: title })
      }
    } else if (block.type === 'checkbox') {
      const arr = isStringArray(v) ? v : []
      for (const title of arr) {
        const choiceId = findChoiceIdByTitle(block, title)
        if (choiceId) out.push({ blockId: block.id!, choiceId })
        else out.push({ blockId: block.id!, answerText: toSafeText(title) })
      }
    } else if (block.type === 'rating') {
      const num = isNumber(v) ? v : 0
      out.push({
        blockId: block.id!,
        answerText: String(num), // backend เก็บที่ answerText (string)
      })
    } else if (block.type === 'grid_multiple_choice') {
      // v เป็น { [rowTitle]: colTitle }
      const rowMap = isPlainObject(v) ? (v as Record<string, string>) : {}
      for (const [rowTitle, colTitle] of Object.entries(rowMap)) {
        const rowId = findRowIdByTitle(block, rowTitle)
        const choiceId = findChoiceIdByTitle(block, colTitle)
        if (rowId && choiceId) out.push({ blockId: block.id!, rowId, choiceId })
        else {
          out.push({ blockId: block.id!, rowId: rowId ?? null, answerText: toSafeText(colTitle) })
        }
      }
    } else if (block.type === 'grid_checkbox') {
      // v เป็น { [rowTitle]: string[] }
      const rowMap = isPlainObject(v) ? (v as Record<string, string[]>) : {}
      for (const [rowTitle, cols] of Object.entries(rowMap)) {
        const rowId = findRowIdByTitle(block, rowTitle)
        for (const colTitle of cols || []) {
          const choiceId = findChoiceIdByTitle(block, colTitle)
          if (rowId && choiceId) out.push({ blockId: block.id!, rowId, choiceId })
          else {
            out.push({ blockId: block.id!, rowId: rowId ?? null, answerText: toSafeText(colTitle) })
          }
        }
      }
    }
  }

  return out
}

async function handleNext() {
  if (!validateSession(currentSession.value)) return
  currentSession.value++
  await nextTick() // รอ DOM/reprogram อัปเดตให้เสร็จ
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleSubmit() {
  // ตรวจทุก session ก่อนส่ง
  const total = totalSessions.value
  for (let s = 1; s <= total; s++) {
    if (!validateSession(s)) {
      currentSession.value = s
      $q.notify({ type: 'negative', message: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
      return
    }
  }

  if (!form.value?.id) {
    $q.notify({ type: 'negative', message: 'ไม่พบแบบฟอร์ม' })
    return
  }

  const userId = userStore.getUser?.id
  if (!userId) {
    $q.notify({ type: 'negative', message: 'ไม่พบผู้ใช้ที่เข้าสู่ระบบ' })
    return
  }

  const responses = buildResponses(form.value)

  const payload: Submission = {
    formId: form.value.id,
    userId: userId,
    responses,
  }

  console.log('Sending submission payload:', JSON.parse(JSON.stringify(payload)))

  try {
    // ตรวจสอบว่ามี checkout token หรือไม่ (มาจาก checkout page)
    const checkoutToken = route.query.checkoutToken as string
    const programId = route.query.programId as string

    if (checkoutToken && programId) {
      try {
        // เช็คชื่อออกหลังจากส่ง form สำเร็จ
        await checkinoutStore.checkout(checkoutToken)
        await submissionStore.addSubmission(payload)
        $q.notify({ type: 'positive', message: 'ส่งคำตอบและเช็คชื่อออกเรียบร้อย' })
      } catch (checkoutError: unknown) {
        console.error('Checkout error:', checkoutError)
        let msg = 'ส่งคำตอบเรียบร้อย แต่เช็คชื่อออกไม่สำเร็จ'
        if (checkoutError && typeof checkoutError === 'object' && 'isAxiosError' in checkoutError) {
          const axiosErr = checkoutError as AxiosError
          const errData = axiosErr.response?.data as ErrorResponse
          if (errData && typeof errData === 'object' && typeof errData.error === 'string') {
            msg = errData.error
          } else if (axiosErr.message) {
            msg = axiosErr.message
          }
        } else if (checkoutError instanceof Error) {
          msg = checkoutError.message
        }
        $q.notify({ type: 'warning', message: msg })
      }
    } else {
      await submissionStore.addSubmission(payload)
      $q.notify({ type: 'positive', message: 'ส่งคำตอบเรียบร้อย' })
    }
  } catch (error: unknown) {
    console.error(error)
    let msg = 'เกิดข้อผิดพลาดในการส่งคำตอบ'
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      const axiosErr = error as AxiosError
      const errData = axiosErr.response?.data as ErrorResponse
      if (errData && typeof errData === 'object' && typeof errData.error === 'string') {
        msg = errData.error
      } else if (axiosErr.message) {
        msg = axiosErr.message
      }
    } else if (error instanceof Error) {
      msg = error.message
    }
    $q.notify({ type: 'negative', message: msg })
  }
}

watch(
  () => form.value,
  () => {
    currentSession.value = 1
  },
  { immediate: true },
)
</script>

<style scoped>
.grid-table {
  table-layout: fixed;
  width: 100%;
}

.grid-table th,
.grid-table td {
  text-align: center;
  vertical-align: middle;
}

.grid-table .row-header {
  width: 70%; /* คอลัมน์แรก (ข้อความ row) */
  text-align: left;
  padding: 6px 10px;
}

.card-answer {
  max-width: 1000px;
  width: 100%;
  border-radius: 5px;
  border: 1px solid #f3f3f3;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.form_answer {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
</style>
