<template>
  <div class="question-container q-mb-lg">
    <q-card class="question-card" flat bordered>
      <q-card-section>
        <div class="question-header">
          <div class="question-text">
            {{ question.questionText }}
            <span v-if="question.isRequired" class="required-indicator">*</span>
          </div>
        </div>

        <!-- Dynamic question content based on type -->
        <div class="question-content q-mt-md">
          <!-- Short Answer -->
          <div v-if="question.type === 'short_answer'">
            <q-input
              v-model="answerValue"
              outlined
              dense
              placeholder="Your answer"
              :rules="question.isRequired ? [val => !!val || 'This field is required'] : []"
              @update:model-value="updateAnswer"
            />
          </div>

          <!-- Paragraph -->
          <div v-else-if="question.type === 'paragraph'">
            <q-input
              v-model="answerValue"
              type="textarea"
              outlined
              dense
              placeholder="Your answer"
              :rules="question.isRequired ? [val => !!val || 'This field is required'] : []"
              @update:model-value="updateAnswer"
            />
          </div>

          <!-- Multiple Choice -->
          <div v-else-if="question.type === 'multiple_choice'">
            <q-option-group
              v-model="answerValue"
              :options="question.choices?.map(choice => ({ label: choice, value: choice })) || []"
              color="primary"
              inline
              @update:model-value="updateAnswer"
            />
          </div>

          <!-- Checkbox -->
          <div v-else-if="question.type === 'checkbox'">
            <q-checkbox
              v-for="choice in question.choices"
              :key="choice"
              v-model="checkboxValues"
              :val="choice"
              :label="choice"
              color="primary"
              @update:model-value="updateCheckboxAnswer"
            />
          </div>

          <!-- Dropdown -->
          <div v-else-if="question.type === 'dropdown'">
            <q-select
              v-model="answerValue"
              :options="question.choices || []"
              outlined
              dense
              placeholder="Select an option"
              :rules="question.isRequired ? [val => !!val || 'This field is required'] : []"
              @update:model-value="updateAnswer"
            />
          </div>

          <!-- Grid Multiple Choice -->
          <div v-else-if="question.type === 'grid_multiple_choice'">
            <div class="grid-container">
              <div class="grid-header">
                <div class="grid-corner"></div>
                <div
                  v-for="column in question.columns"
                  :key="column"
                  class="grid-column-header"
                >
                  {{ column }}
                </div>
              </div>
              <div
                v-for="row in question.rows"
                :key="row"
                class="grid-row"
              >
                <div class="grid-row-label">{{ row }}</div>
                <div class="grid-row-options">
                  <q-radio
                    v-for="column in question.columns"
                    :key="column"
                    v-model="gridValues[row]"
                    :val="column"
                    :name="`grid-${question.id}-${row}`"
                    color="primary"
                    @update:model-value="updateGridAnswer"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Grid Checkbox -->
          <div v-else-if="question.type === 'grid_checkbox'">
            <div class="grid-container">
              <div class="grid-header">
                <div class="grid-corner"></div>
                <div
                  v-for="column in question.columns"
                  :key="column"
                  class="grid-column-header"
                >
                  {{ column }}
                </div>
              </div>
              <div
                v-for="row in question.rows"
                :key="row"
                class="grid-row"
              >
                <div class="grid-row-label">{{ row }}</div>
                <div class="grid-row-options">
                  <q-checkbox
                    v-for="column in question.columns"
                    :key="column"
                    v-model="gridCheckboxValues[row]"
                    :val="column"
                    color="primary"
                    @update:model-value="updateGridCheckboxAnswer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Question, Answer } from 'src/types/form'
import { isStringAnswer, isArrayAnswer, isGridMultipleChoiceAnswer, isGridCheckboxAnswer } from 'src/types/form'

interface Props {
  question: Question
  modelValue?: Answer | undefined
}

interface Emits {
  (e: 'update:modelValue', value: Answer): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Reactive values for different question types
const answerValue = ref<string>('')
const checkboxValues = ref<string[]>([])
const gridValues = ref<Record<string, string>>({})
const gridCheckboxValues = ref<Record<string, string[]>>({})

// Initialize values based on question type
onMounted(() => {
  initializeValues()
})

watch(() => props.modelValue, () => {
  initializeValues()
}, { immediate: true })

const initializeValues = () => {
  if (!props.modelValue) {
    // Initialize empty values based on question type
    if (props.question.type === 'checkbox') {
      checkboxValues.value = []
    } else if (props.question.type === 'grid_multiple_choice') {
      gridValues.value = {}
      props.question.rows?.forEach(row => {
        gridValues.value[row] = ''
      })
    } else if (props.question.type === 'grid_checkbox') {
      gridCheckboxValues.value = {}
      props.question.rows?.forEach(row => {
        gridCheckboxValues.value[row] = []
      })
    } else {
      answerValue.value = ''
    }
  } else {
    // Load existing values using type guards
    if (props.question.type === 'checkbox') {
      checkboxValues.value = isArrayAnswer(props.modelValue.value) ? props.modelValue.value : []
    } else if (props.question.type === 'grid_multiple_choice') {
      gridValues.value = isGridMultipleChoiceAnswer(props.modelValue.value) ? props.modelValue.value : {}
    } else if (props.question.type === 'grid_checkbox') {
      gridCheckboxValues.value = isGridCheckboxAnswer(props.modelValue.value) ? props.modelValue.value : {}
    } else {
      answerValue.value = isStringAnswer(props.modelValue.value) ? props.modelValue.value : ''
    }
  }
}

const updateAnswer = (value: string | number | null) => {
  emit('update:modelValue', {
    questionId: props.question.id!,
    value: value as string
  })
}

const updateCheckboxAnswer = (value: string[]) => {
  emit('update:modelValue', {
    questionId: props.question.id!,
    value
  })
}

const updateGridAnswer = (value: Record<string, string>) => {
  console.log('value', value);
  emit('update:modelValue', {
    questionId: props.question.id!,
    value: gridValues.value
  })
}

const updateGridCheckboxAnswer = (value: Record<string, string[]>) => {
  console.log('value', value);

  emit('update:modelValue', {
    questionId: props.question.id!,
    value: gridCheckboxValues.value
  })
}
</script>

<style scoped>
.question-container {
  max-width: 800px;
  margin: 0 auto;
}

.question-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.question-header {
  margin-bottom: 16px;
}

.question-text {
  font-size: 16px;
  font-weight: 500;
  color: #202124;
  line-height: 1.5;
}

.required-indicator {
  color: #d93025;
  margin-left: 4px;
}

.question-content {
  margin-top: 16px;
}

.grid-container {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.grid-header {
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.grid-corner {
  width: 120px;
  min-width: 120px;
  padding: 12px;
  border-right: 1px solid #e0e0e0;
  font-weight: 500;
  color: #5f6368;
}

.grid-column-header {
  flex: 1;
  padding: 12px 8px;
  text-align: center;
  font-weight: 500;
  color: #5f6368;
  border-right: 1px solid #e0e0e0;
}

.grid-column-header:last-child {
  border-right: none;
}

.grid-row {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.grid-row:last-child {
  border-bottom: none;
}

.grid-row-label {
  width: 120px;
  min-width: 120px;
  padding: 12px;
  border-right: 1px solid #e0e0e0;
  font-size: 14px;
  color: #202124;
  display: flex;
  align-items: center;
}

.grid-row-options {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px;
}

.grid-row-options .q-radio,
.grid-row-options .q-checkbox {
  margin: 0 4px;
}
</style>
