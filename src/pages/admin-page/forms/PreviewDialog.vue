<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    maximized
  >
    <q-card class="q-pa-md">
      <!-- Header -->
      <q-card-section>
        <div class="text-h5 q-mb-sm">{{ form.title }}</div>
        <div class="text-subtitle2 text-grey-7">{{ form.description }}</div>
      </q-card-section>

      <q-separator />

      <!-- Questions Preview -->
      <q-card-section class="scroll" style="max-height: 80vh; overflow-y: auto">
        <div v-for="(q, index) in form.questions" :key="index" class="q-mb-md">
          <q-card class="q-pa-md" bordered>
            <!-- Title Card -->
            <template v-if="isTitleCard(q)">
              <div class="text-h6">{{ q.title }}</div>
              <div v-if="q.showDescription" class="text-subtitle2 text-grey-7 q-mt-sm">
                {{ q.description }}
              </div>
            </template>

            <!-- Short Answer -->
            <template v-else-if="q.type === 'short_answer'">
              <div class="text-subtitle1 q-mb-sm">{{ q.questionText }}</div>
              <q-input
                v-model="dummyShort"
                dense
                outlined
                readonly
                placeholder="คำตอบของคุณ..."
                class="full-width"
              />
            </template>

            <!-- Paragraph -->
            <template v-else-if="q.type === 'paragraph'">
              <div class="text-subtitle1 q-mb-sm">{{ q.questionText }}</div>
              <q-input
                v-model="dummyParagraph"
                type="textarea"
                outlined
                dense
                readonly
                placeholder="คำตอบของคุณ..."
                class="full-width"
              />
            </template>

            <!-- Checkbox -->
            <template v-else-if="q.type === 'checkbox'">
              <div class="text-subtitle1 q-mb-sm">{{ q.questionText }}</div>
              <div
                v-for="(choice, idx) in q.choices"
                :key="idx"
                class="row items-center q-gutter-sm q-ml-sm q-my-xs"
              >
                <q-checkbox :model-value="false" disable />
                <div>{{ choice }}</div>
              </div>
            </template>

            <!-- Multiple Choice -->
            <template v-else-if="q.type === 'multiple_choice'">
              <div class="text-subtitle1 q-mb-sm">{{ q.questionText }}</div>
              <q-option-group
                :options="(q.choices || []).map((c) => ({ label: c, value: c }))"
                type="radio"
                model-value="null"
                disable
              />
            </template>

            <!-- Dropdown -->
            <template v-else-if="q.type === 'dropdown'">
              <div class="text-subtitle1 q-mb-sm">{{ q.questionText }}</div>
              <q-select
                :options="q.choices"
                :model-value="null"
                outlined
                dense
                disable
                placeholder="กรุณาเลือก"
                class="full-width"
              />
            </template>

            <!-- Rating -->
            <template v-else-if="q.type === 'rating'">
              <div class="text-subtitle1 q-mb-sm">
                {{ q.questionText }}
                <span v-if="q.isRequired" class="text-red">*</span>
              </div>
              <div class="row q-gutter-md q-mt-sm">
                <div v-for="i in 5" :key="i" class="column items-center" style="width: 60px">
                  <q-icon name="star" size="24px" color="grey-6" />
                  <div class="text-caption q-mt-xs">{{ i }}</div>
                </div>
              </div>
            </template>

            <!-- Multiple Choice Grid -->
            <template v-else-if="q.type === 'grid_multiple_choice'">
              <div class="text-subtitle1 q-mb-sm">{{ q.questionText }}</div>
              <q-markup-table flat bordered dense>
                <thead>
                  <tr>
                    <th></th>
                    <th v-for="col in q.columns" :key="col">{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in q.rows" :key="row">
                    <td>{{ row }}</td>
                    <td v-for="col in q.columns" :key="col">
                      <q-radio :model-value="null" disable :val="col" />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </template>

            <!-- Checkbox Grid -->
            <template v-else-if="q.type === 'grid_checkbox'">
              <div class="text-subtitle1 q-mb-sm">{{ q.questionText }}</div>
              <q-markup-table flat bordered dense>
                <thead>
                  <tr>
                    <th></th>
                    <th v-for="col in q.columns" :key="col">{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in q.rows" :key="row">
                    <td>{{ row }}</td>
                    <td v-for="col in q.columns" :key="col">
                      <q-checkbox :model-value="null" disable :val="col" />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </template>
          </q-card>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="ปิด" color="primary" @click="emit('update:modelValue', false)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue'
import type { FormElement } from 'src/types/form'
import type { TitleCard } from 'src/types/form'

function isTitleCard(q: FormElement): q is TitleCard {
  return 'isTitleCard' in q
}
defineProps<{
  modelValue: boolean
  form: {
    title: string
    description: string
    questions: FormElement[]
  }
}>()
const dummyShort = ref('')
const dummyParagraph = ref('')

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>
