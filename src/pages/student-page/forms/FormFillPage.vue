<template>
  <q-page class="form-fill-page">
    <div class="container">
      <!-- Loading State -->
      <div v-if="formsStore.isLoading" class="loading-container">
        <q-spinner-dots size="50px" color="primary" />
        <p class="q-mt-md">Loading form...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="formsStore.getError" class="error-container">
        <q-banner class="bg-negative text-white">
          {{ formsStore.getError }}
          <template v-slot:action>
            <q-btn flat color="white" label="Go Back" @click="goBack" />
          </template>
        </q-banner>
      </div>

      <!-- Form Content -->
      <div v-else-if="formsStore.getCurrentForm" class="form-content">
        <!-- Form Header -->
        <div class="form-header">
          <div class="form-title-section">
            <h1 class="form-title">{{ formsStore.getCurrentForm.form.title }}</h1>
            <p class="form-description">{{ formsStore.getCurrentForm.form.description }}</p>
          </div>
          <div class="form-meta">
            <q-chip color="info" text-color="white" size="sm">
              {{ formsStore.getCurrentForm.questions.length }} questions
            </q-chip>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-section q-mb-lg">
          <div class="progress-info">
            <span class="progress-text">Progress</span>
            <span class="progress-percentage">{{ progressPercentage }}%</span>
          </div>
          <q-linear-progress
            :value="progressValue"
            color="primary"
            size="md"
            class="q-mt-sm"
          />
        </div>

        <!-- Questions -->
        <div class="questions-section">
          <!-- <QuestionRenderer
            v-for="(question) in formsStore.getCurrentForm"
            :key="question.id || 'temp'"
            :question="question"
            :model-value="getAnswerForQuestion(question.id!)"
            @update:model-value="updateAnswer"
          /> -->
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <q-btn
            color="secondary"
            label="Save Draft"
            icon="save"
            @click="saveDraft"
            :loading="saving"
          />
          <!-- <q-btn
            color="primary"
            label="Submit Form"
            icon="send"
            @click="submitForm"
            :loading="submitting"
            :disable="!isFormValid"
          /> -->
        </div>
      </div>

      <!-- Form Not Found -->
      <div v-else class="not-found-container">
        <q-icon name="error" size="80px" color="grey-4" />
        <h3 class="not-found-title">Form Not Found</h3>
        <p class="not-found-description">
          The form you're looking for doesn't exist or has been removed.
        </p>
        <q-btn
          color="primary"
          label="Go Back"
          icon="arrow_back"
          @click="goBack"
        />
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="showConfirmation" persistent>
      <q-card class="confirmation-dialog">
        <q-card-section class="row items-center">
          <q-avatar icon="check_circle" color="positive" text-color="white" />
          <span class="q-ml-sm">Form Submitted Successfully!</span>
        </q-card-section>

        <q-card-section>
          <p>Thank you for your submission. Your responses have been recorded.</p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" @click="handleSubmissionComplete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useFormsStore } from 'src/stores/forms'
// import QuestionRenderer from 'src/components/forms/QuestionRenderer.vue'
import type { Answer } from 'src/types/form'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const formsStore = useFormsStore()

const formId = route.params.id as string
const answers = ref<Map<string, Answer>>(new Map())
const saving = ref(false)
// const submitting = ref(false)
const showConfirmation = ref(false)

// Computed properties
// const sortedQuestions = computed(() => {
//   if (!formsStore.getCurrentForm) return []
//   return [...formsStore.getCurrentForm.questions].sort((a, b) => (a.order || 0) - (b.order || 0))
// })

const progressValue = computed(() => {
  if (!formsStore.getCurrentForm) return 0
  const totalQuestions = formsStore.getCurrentForm.questions.length
  const answeredQuestions = Array.from(answers.value.values()).length
  return totalQuestions > 0 ? answeredQuestions / totalQuestions : 0
})

const progressPercentage = computed(() => {
  return Math.round(progressValue.value * 100)
})

// const isFormValid = computed(() => {
//   if (!formsStore.getCurrentForm) return false

//   const requiredQuestions = formsStore.getCurrentForm.questions.filter(q => q.isRequired)
//   return requiredQuestions.every(question => {
//     const answer = answers.value.get(question.id!)
//     return answer && isValidAnswer(answer.value)
//   })
// })

onMounted(async () => {
  await loadForm()
})

const loadForm = async () => {
  try {
    await formsStore.fetchFormById(formId)
  } catch (error) {
    console.error('Error loading form:', error)
  }
}

// const getAnswerForQuestion = (questionId: string): Answer | undefined => {
//   return answers.value.get(questionId)
// }

// const updateAnswer = (answer: Answer) => {
//   answers.value.set(answer.questionId, answer)
// }

// const isValidAnswer = (value: AnswerValue): boolean => {
//   if (value === null || value === undefined) return false
//   if (isStringAnswer(value)) return value.trim() !== ''
//   if (isArrayAnswer(value)) return value.length > 0
//   if (isGridAnswer(value)) {
//     // For grid questions, check if at least one row has a value
//     return Object.values(value).some(v => {
//       if (Array.isArray(v)) return v.length > 0
//       return v !== null && v !== undefined && v !== ''
//     })
//   }
//   return true
// }

const saveDraft =  () => {
  saving.value = true
  try {
    // Save to localStorage for now
    const draft = {
      formId,
      answers: Array.from(answers.value.values()),
      timestamp: new Date().toISOString()
    }
    localStorage.setItem(`form-draft-${formId}`, JSON.stringify(draft))

    $q.notify({
      type: 'positive',
      message: 'Draft saved successfully',
      position: 'top'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to save draft',
      position: 'top'
    })
  } finally {
    saving.value = false
  }
}

// const submitForm = async () => {
//   if (!isFormValid.value) {
//     $q.notify({
//       type: 'warning',
//       message: 'Please fill in all required fields',
//       position: 'top'
//     })
//     return
//   }

//   submitting.value = true
//   try {
//     const submissionData = {
//       answers: Array.from(answers.value.values())
//     }

//     await formsStore.submitForm(formId, submissionData)

//     // Clear draft
//     localStorage.removeItem(`form-draft-${formId}`)

//     showConfirmation.value = true
//   } catch{
//     $q.notify({
//       type: 'negative',
//       message: 'Failed to submit form. Please try again.',
//       position: 'top'
//     })
//   } finally {
//     submitting.value = false
//   }
// }

const handleSubmissionComplete = async () => {
  showConfirmation.value = false
  await goBack()
}

const goBack = async () => {
  await router.push('/student/forms')
}

// Load draft on form load
watch(() => formsStore.getCurrentForm, (form) => {
  if (form) {
    const draft = localStorage.getItem(`form-draft-${formId}`)
    if (draft) {
      try {
        const draftData = JSON.parse(draft)
        if (draftData.answers) {
          draftData.answers.forEach((answer: Answer) => {
            answers.value.set(answer.questionId, answer)
          })
        }
      } catch (error) {
        console.error('Error loading draft:', error)
      }
    }
  }
}, { immediate: true })
</script>

<style scoped>
.form-fill-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.error-container {
  margin: 20px 0;
}

.form-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 32px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.form-title-section {
  flex: 1;
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
  line-height: 1.5;
}

.form-meta {
  margin-left: 24px;
}

.progress-section {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-text {
  font-size: 14px;
  color: #5f6368;
}

.progress-percentage {
  font-size: 14px;
  font-weight: 600;
  color: #202124;
}

.questions-section {
  margin-bottom: 32px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.not-found-title {
  font-size: 24px;
  font-weight: 500;
  color: #5f6368;
  margin: 16px 0 8px 0;
}

.not-found-description {
  font-size: 16px;
  color: #80868b;
  margin: 0 0 24px 0;
  max-width: 400px;
}

.confirmation-dialog {
  min-width: 400px;
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }

  .form-content {
    padding: 20px;
  }

  .form-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-meta {
    margin-left: 0;
    margin-top: 16px;
  }

  .form-title {
    font-size: 24px;
  }

  .form-actions {
    flex-direction: column;
    gap: 12px;
  }

  .form-actions .q-btn {
    width: 100%;
  }
}
</style>
