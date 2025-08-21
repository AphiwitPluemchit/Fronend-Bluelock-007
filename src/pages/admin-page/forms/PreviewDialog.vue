<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    maximized
  >
    <q-card>
      <div class="form_preview bg-blue-1 q-pa-md">
        <!-- Header -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h5 q-mb-sm">{{ form.title }}</div>
            <div class="text-subtitle2 text-grey-7">{{ form.description }}</div>
          </q-card-section>
        </q-card>

        <q-separator />

        <!-- Preview Content -->
        <div
          v-for="(block, index) in visibleBlocks"
          :key="block.id || index"
          class="q-mb-md flex flex-center"
        >
          <q-card class="q-pa-md card-preview">
            <!-- Title Card -->
            <template v-if="block.type === 'title'">
              <div class="text-h6">{{ block.title }}</div>
              <div v-if="block.description" class="text-subtitle2 text-grey-7 q-mt-sm">
                {{ block.description }}
              </div>
            </template>

            <!-- Short Answer -->
            <template v-else-if="block.type === 'short_answer'">
              <div class="text-subtitle1 q-mb-sm">{{ block.title }}</div>
              <q-input
                dense
                outlined
                readonly
                placeholder="คำตอบของคุณ..."
                class="full-width"
                :model-value="null"
              />
            </template>

            <!-- Paragraph -->
            <template v-else-if="block.type === 'paragraph'">
              <div class="text-subtitle1 q-mb-sm">{{ block.title }}</div>
              <q-input
                type="textarea"
                dense
                outlined
                readonly
                placeholder="คำตอบของคุณ..."
                class="full-width"
                :model-value="null"
              />
            </template>

            <!-- Multiple Choice -->
            <template v-else-if="block.type === 'multiple_choice'">
              <div class="text-subtitle1 q-mb-sm">{{ block.title }}</div>
              <q-option-group
                :options="(block.choices || []).map((c) => ({ label: c.title, value: c.title }))"
                type="radio"
                model-value="null"
                disable
              />
            </template>

            <!-- Checkbox -->
            <template v-else-if="block.type === 'checkbox'">
              <div class="text-subtitle1 q-mb-sm">{{ block.title }}</div>
              <div
                v-for="(choice, idx) in block.choices"
                :key="idx"
                class="row items-center q-gutter-sm q-ml-sm q-my-xs"
              >
                <q-checkbox :model-value="false" disable />
                <div>{{ choice.title }}</div>
              </div>
            </template>

            <!-- Dropdown -->
            <template v-else-if="block.type === 'dropdown'">
              <div class="text-subtitle1 q-mb-sm">{{ block.title }}</div>
              <q-select
                :options="block.choices.map((c) => c.title)"
                :model-value="null"
                outlined
                dense
                disable
                placeholder="กรุณาเลือก"
                class="full-width"
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
                >
                  <q-icon
                    :name="block.icon || 'star'"
                    :class="['rating-icon', block.icon || 'star']"
                    size="28px"
                  />
                  <div class="text-caption q-mt-xs">{{ i }}</div>
                </div>
              </div>
            </template>

            <!-- Grid: Multiple Choice -->
            <template v-else-if="block.type === 'grid_multiple_choice'">
              <div class="text-subtitle1 q-mb-sm">{{ block.title }}</div>
              <q-markup-table flat bordered dense class="grid-preview-table">
                <thead>
                  <tr>
                    <th></th>
                    <th v-for="(col, i) in getCols(block)" :key="i">{{ col.title }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, r) in getRows(block)" :key="r">
                    <td class="row-label">{{ row.title }}</td>
                    <td v-for="(col, c) in getCols(block)" :key="c" class="cell-center">
                      <q-radio :val="col.title" :model-value="undefined" disable />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </template>

            <!-- Grid: Checkbox -->
            <template v-else-if="block.type === 'grid_checkbox'">
              <div class="text-subtitle1 q-mb-sm">{{ block.title }}</div>
              <q-markup-table flat bordered dense class="grid-preview-table">
                <thead>
                  <tr>
                    <th></th>
                    <th v-for="(col, i) in getCols(block)" :key="i">{{ col.title }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, r) in getRows(block)" :key="r">
                    <td class="row-label">{{ row.title }}</td>
                    <td v-for="(col, c) in getCols(block)" :key="c" class="cell-center">
                      <q-checkbox :val="col.title" :model-value="undefined" disable />
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
              @click="currentSession++"
            />

            <q-btn
              v-if="totalSessions === 1 || currentSession === totalSessions"
              flat
              label="ส่ง"
              class="btnsecces"
              @click="emit('update:modelValue', false)"
            />
          </div>
        </q-card-actions>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PropType } from 'vue'
import type { Form } from 'src/types/form'
import type { Block } from 'src/types/form'

const props = defineProps({
  modelValue: Boolean,
  form: {
    type: Object as PropType<Form>,
    required: true,
  },
})

// Track current session
const currentSession = ref(1)

const totalSessions = computed(() => {
  const sessions = (props.form.blocks ?? []).map((b) => Number(b.session || 1))
  return sessions.length ? Math.max(...sessions) : 1
})

// Filter blocks to show only current session
const visibleBlocks = computed(() =>
  props.form.blocks.filter(
    (b) => b.type !== 'session' && (b.session || 1) === currentSession.value,
  ),
)

// Reset to first session when dialog is opened
watch(
  () => props.modelValue,
  (open) => {
    if (open) currentSession.value = 1
  },
)

// Declare emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// ---- types & guards ----
type MaybeItem = string | number | { id?: string; title?: unknown; label?: unknown; name?: unknown }

type GridBlockLite = Partial<Block> & {
  rows?: MaybeItem[]
  choices?: MaybeItem[]
  columns?: MaybeItem[] // บางบล็อกใช้คีย์นี้แทน choices
}

const isObj = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object'

// ---- normalizers ----
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

const normList = (arr?: MaybeItem[]) =>
  Array.isArray(arr) ? arr.map((x) => ({ title: toTitle(x) })).filter((o) => o.title !== '') : []

// ---- accessors (ไม่มี any) ----
const getCols = (block: GridBlockLite) =>
  normList((block.choices && block.choices.length ? block.choices : block.columns) ?? [])

const getRows = (block: GridBlockLite) => normList(block.rows)
</script>

<style scoped>
.card-preview {
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

.form_preview {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.card-preview {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.rating-icon.star {
  color: black;
}
/* .btnnext {
  background-color: #2196f3;
  color: white;
  min-width: 100px;
} */

/* .btnback {
  background-color: #e1e1e1;
  color: rgb(0, 0, 0);
  min-width: 100px;
} */
</style>
