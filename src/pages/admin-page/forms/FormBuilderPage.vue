<template>
  <q-page class="form-builder-page">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Form Builder</h1>
          <p class="page-subtitle">Create and customize forms for students</p>
        </div>
        <div class="header-actions">
          <q-btn
            color="secondary"
            label="Preview"
            icon="visibility"
            @click="showPreview = true"
            :disable="!formData.title || formData.questions.length === 0"
          />
          <q-btn
            color="primary"
            label="Save Form"
            icon="save"
            @click="saveForm"
            :loading="saving"
            :disable="!isFormValid"
          />
        </div>
      </div>

      <div class="builder-content">
        <!-- Form Settings Panel -->
        <div class="settings-panel">
          <q-card class="settings-card">
            <q-card-section>
              <h3 class="section-title">Form Settings</h3>

              <div class="form-field q-mb-md">
                <label class="field-label">Form Title *</label>
                <q-input
                  v-model="formData.title"
                  outlined
                  dense
                  placeholder="Enter form title"
                  :rules="[val => !!val || 'Title is required']"
                />
              </div>

              <div class="form-field">
                <label class="field-label">Description</label>
                <q-input
                  v-model="formData.description"
                  type="textarea"
                  outlined
                  dense
                  placeholder="Enter form description"
                  rows="3"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Questions Panel -->
        <div class="questions-panel">
          <q-card class="questions-card">
            <q-card-section>
              <div class="questions-header">
                <h3 class="section-title">Questions</h3>
                <q-btn
                  color="primary"
                  label="Add Question"
                  icon="add"
                  @click="showQuestionDialog = true"
                />
              </div>

              <!-- Questions List -->
              <div v-if="formData.questions.length === 0" class="empty-questions">
                <q-icon name="quiz" size="60px" color="grey-4" />
                <p class="empty-text">No questions added yet</p>
                <p class="empty-subtext">Click "Add Question" to get started</p>
              </div>

              <div v-else class="questions-list">
                <div
                  v-for="(question, index) in formData.questions"
                  :key="question.id || `question-${index}`"
                  class="question-item"
                  :class="{ 'question-selected': selectedQuestionIndex === index }"
                  @click="selectQuestion(index)"
                >
                  <div class="question-content">
                    <div class="question-header">
                      <div class="question-type-badge">
                        {{ getQuestionTypeLabel(question.type) }}
                      </div>
                      <div class="question-actions">
                        <q-btn
                          flat
                          round
                          dense
                          icon="edit"
                          size="sm"
                          @click.stop="editQuestion(index)"
                        />
                        <q-btn
                          flat
                          round
                          dense
                          icon="delete"
                          size="sm"
                          color="negative"
                          @click.stop="deleteQuestion(index)"
                        />
                      </div>
                    </div>
                    <div class="question-text">{{ question.questionText }}</div>
                    <div class="question-meta">
                      <q-chip
                        v-if="question.isRequired"
                        color="warning"
                        text-color="white"
                        size="sm"
                        label="Required"
                      />
                      <span class="question-order">Question {{ index + 1 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Question Editor Panel -->
        <template v-if="selectedQuestionIndex !== null && editingQuestion">
          <div class="editor-panel">
            <q-card class="editor-card">
              <q-card-section>
                <div class="editor-header">
                  <h3 class="section-title">Edit Question</h3>
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    @click="selectedQuestionIndex = null"
                  />
                </div>

                <div class="editor-content">
                  <div class="form-field q-mb-md">
                    <label class="field-label">Question Type</label>
                    <q-select
                      v-model="editingQuestion.type"
                      :options="questionTypeOptions"
                      outlined
                      dense
                      @update:model-value="onQuestionTypeChange"
                    />
                  </div>

                  <div class="form-field q-mb-md">
                    <label class="field-label">Question Text *</label>
                    <q-input
                      v-model="editingQuestion.questionText"
                      type="textarea"
                      outlined
                      dense
                      placeholder="Enter your question"
                      :rules="[val => !!val || 'Question text is required']"
                      rows="2"
                    />
                  </div>

                  <div class="form-field q-mb-md">
                    <q-checkbox
                      v-model="editingQuestion.isRequired"
                      label="Required question"
                    />
                  </div>

                  <!-- Choice-based questions -->
                  <div v-if="isChoiceQuestion" class="form-field q-mb-md">
                    <label class="field-label">Choices</label>
                    <div
                      v-for="(choice, index) in editingQuestion.choices ?? []"
                      :key="index"
                      class="choice-item"
                    >
                      <q-input
                        v-model="editingQuestion.choices![index]"
                        outlined
                        dense
                        placeholder="Enter choice text"
                      />
                      <q-btn
                        flat
                        round
                        dense
                        icon="remove"
                        color="negative"
                        @click="removeChoice(index)"
                        :disable="(editingQuestion.choices?.length ?? 0) <= 2"
                      />
                    </div>
                    <q-btn
                      flat
                      color="primary"
                      icon="add"
                      label="Add Choice"
                      @click="addChoice"
                    />
                  </div>

                  <!-- Grid questions -->
                  <div v-if="isGridQuestion" class="grid-settings">
                    <div class="form-field q-mb-md">
                      <label class="field-label">Rows</label>
                      <div
                        v-for="(row, index) in editingQuestion.rows ?? []"
                        :key="index"
                        class="choice-item"
                      >
                        <q-input
                          v-model="editingQuestion.rows![index]"
                          outlined
                          dense
                          placeholder="Enter row text"
                        />
                        <q-btn
                          flat
                          round
                          dense
                          icon="remove"
                          color="negative"
                          @click="removeRow(index)"
                          :disable="(editingQuestion.rows?.length ?? 0) <= 1"
                        />
                      </div>
                      <q-btn
                        flat
                        color="primary"
                        icon="add"
                        label="Add Row"
                        @click="addRow"
                      />
                    </div>

                    <div class="form-field">
                      <label class="field-label">Columns</label>
                      <div
                        v-for="(column, index) in editingQuestion.columns ?? []"
                        :key="index"
                        class="choice-item"
                      >
                        <q-input
                          v-model="editingQuestion.columns![index]"
                          outlined
                          dense
                          placeholder="Enter column text"
                        />
                        <q-btn
                          flat
                          round
                          dense
                          icon="remove"
                          color="negative"
                          @click="removeColumn(index)"
                          :disable="(editingQuestion.columns?.length ?? 0) <= 1"
                        />
                      </div>
                      <q-btn
                        flat
                        color="primary"
                        icon="add"
                        label="Add Column"
                        @click="addColumn"
                      />
                    </div>
                  </div>

                  <div class="editor-actions">
                    <q-btn
                      color="primary"
                      label="Save Question"
                      @click="saveQuestion"
                      :disable="!isQuestionValid"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </div>
    </div>

    <!-- Question Type Dialog -->
    <q-dialog v-model="showQuestionDialog">
      <q-card class="question-type-dialog">
        <q-card-section>
          <h3 class="dialog-title">Select Question Type</h3>
          <div class="question-types-grid">
            <div
              v-for="type in questionTypes"
              :key="type.value"
              class="question-type-option"
              @click="addQuestion(type.value)"
            >
              <q-icon :name="type.icon" size="32px" color="primary" />
              <h4 class="type-title">{{ type.label }}</h4>
              <p class="type-description">{{ type.description }}</p>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Preview Dialog -->
    <q-dialog v-model="showPreview" maximized>
      <q-card class="preview-dialog">
        <q-card-section class="preview-header">
          <h2 class="preview-title">Form Preview</h2>
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="showPreview = false"
          />
        </q-card-section>
        <q-card-section class="preview-content">
          <div class="preview-form">
            <div class="form-header">
              <h1 class="form-title">{{ formData.title }}</h1>
              <p class="form-description">{{ formData.description }}</p>
            </div>
            <div class="questions-section">
              <QuestionRenderer
                v-for="(question, index) in formData.questions"
                :key="question.id || index"
                :question="question"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useFormsStore } from 'src/stores/forms'
import QuestionRenderer from 'src/components/forms/QuestionRenderer.vue'
import type { Question, QuestionType, CreateFormRequest } from 'src/types/form'
import { QUESTION_TYPES, validateQuestion, validateForm } from 'src/types/form'

const $q = useQuasar()
const router = useRouter()
const formsStore = useFormsStore()

// Form data
const formData = reactive<CreateFormRequest>({
  title: '',
  description: '',
  questions: []
})

// UI state
const showQuestionDialog = ref(false)
const showPreview = ref(false)
const selectedQuestionIndex = ref<number | null>(null)
const saving = ref(false)

// Question type options
const questionTypes = Object.values(QUESTION_TYPES)

const questionTypeOptions = questionTypes.map(type => ({
  label: type.label,
  value: type.value
}))

// Computed properties
const isFormValid = computed(() => {
  return validateForm(formData)
})

const editingQuestion = computed(() => {
  if (selectedQuestionIndex.value === null) return null
  return { ...formData.questions[selectedQuestionIndex.value] }
})

const isChoiceQuestion = computed(() => {
  if (!editingQuestion.value) return false
  return ['multiple_choice', 'checkbox', 'dropdown'].includes(editingQuestion.value.type!)
})

const isGridQuestion = computed(() => {
  if (!editingQuestion.value) return false
  return ['grid_multiple_choice', 'grid_checkbox'].includes(editingQuestion.value.type!)
})

const isQuestionValid = computed(() => {
  if (!editingQuestion.value) return false
  // Check if all required properties are present
  if (!editingQuestion.value.type || !editingQuestion.value.questionText) return false
  return validateQuestion(editingQuestion.value as Question)
})

// Methods
const getQuestionTypeLabel = (type: QuestionType): string => {
  const questionType = questionTypes.find(t => t.value === type)
  return questionType ? questionType.label : type
}

const addQuestion = (type: QuestionType) => {
  const newQuestion: Question = {
    id: `q${Date.now()}`,
    type,
    questionText: '',
    isRequired: false,
    order: formData.questions.length + 1
  }

  // Initialize based on question type
  if (['multiple_choice', 'checkbox', 'dropdown'].includes(type)) {
    newQuestion.choices = ['Option 1', 'Option 2']
  } else if (['grid_multiple_choice', 'grid_checkbox'].includes(type)) {
    newQuestion.rows = ['Row 1']
    newQuestion.columns = ['Column 1', 'Column 2']
  }

  formData.questions.push(newQuestion)
  selectedQuestionIndex.value = formData.questions.length - 1
  showQuestionDialog.value = false
}

const selectQuestion = (index: number) => {
  selectedQuestionIndex.value = index
}

const editQuestion = (index: number) => {
  selectedQuestionIndex.value = index
}

const deleteQuestion = (index: number) => {
  $q.dialog({
    title: 'Delete Question',
    message: 'Are you sure you want to delete this question?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    formData.questions.splice(index, 1)
    // Reorder questions
    formData.questions.forEach((q, i) => {
      q.order = i + 1
    })
    if (selectedQuestionIndex.value === index) {
      selectedQuestionIndex.value = null
    } else if (selectedQuestionIndex.value !== null && selectedQuestionIndex.value > index) {
      selectedQuestionIndex.value--
    }
  })
}

const onQuestionTypeChange = () => {
  if (!editingQuestion.value) return

  // Reset choices/rows/columns based on new type
  if (['multiple_choice', 'checkbox', 'dropdown'].includes(editingQuestion.value.type!)) {
    editingQuestion.value.choices = ['Option 1', 'Option 2']
    editingQuestion.value.rows = []
    editingQuestion.value.columns = []
  } else if (['grid_multiple_choice', 'grid_checkbox'].includes(editingQuestion.value.type!)) {
    editingQuestion.value.rows = ['Row 1']
    editingQuestion.value.columns = ['Column 1', 'Column 2']
    editingQuestion.value.choices = []
  } else {
    editingQuestion.value.choices = []
    editingQuestion.value.rows = []
    editingQuestion.value.columns = []
  }
}

const addChoice = () => {
  if (editingQuestion.value) {
    const currentChoices = editingQuestion.value.choices || []
    editingQuestion.value.choices = [...currentChoices, `Option ${currentChoices.length + 1}`]
  }
}

const removeChoice = (index: number) => {
  if (editingQuestion.value && editingQuestion.value.choices) {
    editingQuestion.value.choices.splice(index, 1)
  }
}

const addRow = () => {
  if (editingQuestion.value) {
    const currentRows = editingQuestion.value.rows || []
    editingQuestion.value.rows = [...currentRows, `Row ${currentRows.length + 1}`]
  }
}

const removeRow = (index: number) => {
  if (editingQuestion.value && editingQuestion.value.rows) {
    editingQuestion.value.rows.splice(index, 1)
  }
}

const addColumn = () => {
  if (editingQuestion.value) {
    const currentColumns = editingQuestion.value.columns || []
    editingQuestion.value.columns = [...currentColumns, `Column ${currentColumns.length + 1}`]
  }
}

const removeColumn = (index: number) => {
  if (editingQuestion.value && editingQuestion.value.columns) {
    editingQuestion.value.columns.splice(index, 1)
  }
}

const saveQuestion = () => {
  if (selectedQuestionIndex.value !== null && editingQuestion.value) {
    formData.questions[selectedQuestionIndex.value] = { ...editingQuestion.value } as Question
    selectedQuestionIndex.value = null
  }
}

const saveForm = async () => {
  if (!isFormValid.value) return

  saving.value = true
  try {
    await formsStore.createForm(formData)

    $q.notify({
      type: 'positive',
      message: 'Form saved successfully!',
      position: 'top'
    })

    // Reset form
    formData.title = ''
    formData.description = ''
    formData.questions = []
    selectedQuestionIndex.value = null

    // Navigate to forms list
    await router.push('/Admin/forms')
  } catch  {
    $q.notify({
      type: 'negative',
      message: 'Failed to save form. Please try again.',
      position: 'top'
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.form-builder-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #202124;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #5f6368;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.builder-content {
  display: grid;
  grid-template-columns: 300px 1fr 400px;
  gap: 24px;
  align-items: start;
}

.settings-panel,
.questions-panel,
.editor-panel {
  position: sticky;
  top: 24px;
}

.settings-card,
.questions-card,
.editor-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #202124;
  margin: 0 0 16px 0;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #5f6368;
  margin-bottom: 8px;
}

.questions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.empty-questions {
  text-align: center;
  padding: 40px 20px;
}

.empty-text {
  font-size: 16px;
  color: #5f6368;
  margin: 16px 0 8px 0;
}

.empty-subtext {
  font-size: 14px;
  color: #80868b;
  margin: 0;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-item {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
}

.question-item:hover {
  border-color: #4285f4;
  box-shadow: 0 2px 4px rgba(66, 133, 244, 0.1);
}

.question-item.question-selected {
  border-color: #4285f4;
  background-color: #f8f9ff;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.question-type-badge {
  background-color: #e8f0fe;
  color: #1967d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.question-actions {
  display: flex;
  gap: 4px;
}

.question-text {
  font-size: 14px;
  color: #202124;
  margin-bottom: 8px;
  line-height: 1.4;
}

.question-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-order {
  font-size: 12px;
  color: #80868b;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.choice-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.choice-item .q-input {
  flex: 1;
}

.editor-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.question-type-dialog {
  min-width: 600px;
}

.dialog-title {
  font-size: 20px;
  font-weight: 600;
  color: #202124;
  margin: 0 0 24px 0;
  text-align: center;
}

.question-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.question-type-option {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
}

.question-type-option:hover {
  border-color: #4285f4;
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.15);
}

.type-title {
  font-size: 14px;
  font-weight: 600;
  color: #202124;
  margin: 12px 0 8px 0;
}

.type-description {
  font-size: 12px;
  color: #5f6368;
  margin: 0;
  line-height: 1.4;
}

.preview-dialog {
  background-color: #f8f9fa;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.preview-title {
  font-size: 24px;
  font-weight: 600;
  color: #202124;
  margin: 0;
}

.preview-content {
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
}

.preview-form {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 32px;
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.form-title {
  font-size: 28px;
  font-weight: 600;
  color: #202124;
  margin: 0 0 8px 0;
}

.form-description {
  font-size: 16px;
  color: #5f6368;
  margin: 0;
}

@media (max-width: 1200px) {
  .builder-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .settings-panel,
  .questions-panel,
  .editor-panel {
    position: static;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .q-btn {
    flex: 1;
  }

  .question-types-grid {
    grid-template-columns: 1fr;
  }

  .preview-content {
    padding: 16px;
  }

  .preview-form {
    padding: 20px;
  }
}
</style>
