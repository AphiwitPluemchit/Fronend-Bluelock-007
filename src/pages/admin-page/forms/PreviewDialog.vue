<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    maximized
  >
    <q-card class="flex justify-center bg-purple-3">
      <div class="form_preview bg-purple-1">
        <!-- Header -->
        <q-card-section>
          <div class="text-h5 q-mb-sm">{{ form.title }}</div>
          <div class="text-subtitle2 text-grey-7">{{ form.description }}</div>
        </q-card-section>

        <q-separator />

        <!-- Preview Content -->
        <q-card-section class="scroll">
          <div
            v-for="(block, index) in form.blocks"
            :key="block.id || index"
            class="q-mb-md flex flex-center"
          >
            <q-card class="q-pa-md card-preview" bordered>
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
        </q-card-section>

        <!-- Actions -->
        <q-card-actions align="right">
          <q-btn flat label="ปิด" color="primary" @click="emit('update:modelValue', false)" />
        </q-card-actions>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { Form } from 'src/types/form'
import type{ Block } from 'src/types/form';

defineProps({
  modelValue: Boolean,
  form: {
    type: Object as PropType<Form>,
    required: true,
  },
})
// ---- types & guards ----
type MaybeItem =
  | string
  | number
  | { id?: string; title?: unknown; label?: unknown; name?: unknown }

type GridBlockLite = Partial<Block> & {
  rows?: MaybeItem[]
  choices?: MaybeItem[]
  columns?: MaybeItem[]   // 👈 บางบล็อกใช้คีย์นี้แทน choices
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object'

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
  Array.isArray(arr)
    ? arr.map(x => ({ title: toTitle(x) })).filter(o => o.title !== '')
    : []

// ---- accessors (ไม่มี any) ----
const getCols = (block: GridBlockLite) =>
  normList((block.choices && block.choices.length ? block.choices : block.columns) ?? [])

const getRows = (block: GridBlockLite) =>
  normList(block.rows)

const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
.card-preview {
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
.form_preview {
  max-width: 1000px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}
.rating-icon.star {
  color: black;
}

</style>
