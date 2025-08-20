<template>
  <q-page class="q-pa-md bg-purple-3">
    <div class="form_answer bg-purple-1">
      <!-- Header -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h5 q-mb-sm">{{ form?.title || '...' }}</div>
          <div class="text-subtitle2 text-grey-7">{{ form?.description }}</div>
        </q-card-section>
      </q-card>

      <q-inner-loading :showing="loading">
        <q-spinner size="32px" color="primary" />
      </q-inner-loading>

      <!-- Content -->
      <q-card flat bordered class="q-pa-md" v-if="form">
        <div
          v-for="(block, index) in form.blocks"
          :key="block.id || index"
          class="q-mb-md flex flex-center"
        >
          <q-card class="q-pa-md card-answer" bordered>
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
              <div class="text-subtitle1 q-mb-xs">
                {{ block.title }}
                <span v-if="block.isRequired" class="text-red">*</span>
              </div>
              <q-rating
                :model-value="(answers[blockKey(block)] as number) ?? 0"
                @update:model-value="(val) => (answers[blockKey(block)] = val)"
                :max="block.max || 5"
                :icon="block.icon || 'star'"
                size="40px"
                color="black"
                color-selected="yellow"
              />
            </template>

            <!-- Grid: Multiple Choice (one per row) -->
            <template v-else-if="block.type === 'grid_multiple_choice'">
              <div class="text-subtitle1 q-mb-sm">
                {{ block.title }} <span v-if="block.isRequired" class="text-red">*</span>
              </div>

              <q-markup-table flat bordered dense>
                <thead>
                  <tr>
                    <th></th>
                    <th v-for="(col, colIndex) in getCols(block)" :key="colIndex">
                      {{ col.title }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in getRows(block)" :key="rowIndex">
                    <td class="text-weight-medium">{{ row.title }}</td>
                    <td v-for="(col, colIndex) in getCols(block)" :key="colIndex">
                      <q-radio
                        :val="col.title"
                        v-model="getGridSingle(blockKey(block))[row.title]"
                        dense
                      />
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

              <q-markup-table flat bordered dense>
                <thead>
                  <tr>
                    <th></th>
                    <th v-for="(col, colIndex) in getCols(block)" :key="colIndex">
                      {{ col.title }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in getRows(block)" :key="rowIndex">
                    <td class="text-weight-medium">{{ row.title }}</td>
                    <td v-for="(col, colIndex) in getCols(block)" :key="colIndex">
                      <q-checkbox
                        :model-value="
                          getGridMulti(blockKey(block))[row.title]?.includes(col.title) || false
                        "
                        @update:model-value="
                          (val) => toggleGridMulti(blockKey(block), row.title, col.title, val)
                        "
                        dense
                      />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </template>
          </q-card>
        </div>

        <!-- Actions -->
        <q-card-actions align="right">
          <q-btn flat label="ยกเลิก" color="grey-8" @click="goBack" />
          <q-btn unelevated color="primary" label="ส่งคำตอบ" @click="handleSubmit" />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFormStore } from 'src/stores/forms'
import type { Block, Form } from 'src/types/form'
import { Notify } from 'quasar'

const route = useRoute()
const router = useRouter()
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
  const key = blockKey(block)
  if (block.type === 'checkbox') answers[key] = []
  else if (block.type === 'grid_multiple_choice') answers[key] = {} as GridSingle
  else if (block.type === 'grid_checkbox')       answers[key] = {} as GridMulti
  else answers[key] = answers[key] ?? null
}
type GridLike = { rows?: unknown; choices?: unknown; columns?: unknown }

const isObj = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object'

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
  Array.isArray(arr)
    ? arr.map((x) => ({ title: toTitle(x) })).filter((o) => o.title !== '')
    : []

// columns อาจมาใน choices หรือ columns
const getCols = (block: Block | GridLike): Array<{ title: string }> => {
  const gl = block as GridLike
  const choices = Array.isArray(gl.choices) ? gl.choices : undefined
  const columns = Array.isArray(gl.columns) ? gl.columns : undefined
  // ✅ ถ้า choices ไม่มีหรือเป็น [] ให้ fallback ไป columns
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

function validateAll(): boolean {
  if (!form.value) return false
  return !(form.value.blocks || []).some((b) => isRequiredInvalid(b))
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

function goBack() {
  router.back()
}

function handleSubmit() {
  showErrors.value = true
  if (!validateAll()) {
    Notify.create({ type: 'negative', message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' })
    return
  }
  console.log('Submitting answers for form:', form.value?.id, answers)
  Notify.create({ type: 'positive', message: 'บันทึกคำตอบเรียบร้อย (ตัวอย่าง)' })
  router.back()
}

</script>

<style scoped>
.card-answer {
  max-width: 1000px;
  width: 100%;
  border-radius: 15px;
  border: 1px solid #e0e0e0;
}
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.form_answer {
  max-width: 1000px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}
</style>
