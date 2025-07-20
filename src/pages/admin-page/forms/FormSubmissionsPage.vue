<template>
  <q-page class="form-submissions-page">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="breadcrumb">
            <q-btn flat label="Forms" @click="goBack" />
            <q-icon name="chevron_right" />
            <span class="breadcrumb-text">{{ formTitle }}</span>
          </div>
          <h1 class="page-title">Form Submissions</h1>
          <p class="page-subtitle">View and analyze responses to "{{ formTitle }}"</p>
        </div>
        <div class="header-actions">
          <q-btn
            color="secondary"
            label="Export CSV"
            icon="download"
            @click="exportSubmissions"
            :disable="!submissions.length"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="formsStore.isLoading" class="loading-container">
        <q-spinner-dots size="50px" color="primary" />
        <p class="q-mt-md">Loading submissions...</p>
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

      <!-- Submissions Content -->
      <div v-else-if="submissions.length > 0" class="submissions-content">
        <!-- Statistics -->
        <div class="stats-section q-mb-lg">
          <q-card class="stats-card">
            <q-card-section>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-value">{{ submissions.length }}</div>
                  <div class="stat-label">Total Submissions</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ latestSubmission }}</div>
                  <div class="stat-label">Latest Submission</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ averageCompletionTime }}</div>
                  <div class="stat-label">Avg. Completion Time</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Submissions List -->
        <div class="submissions-list">
          <q-card
            v-for="(submission, index) in submissions"
            :key="submission.id || `submission-${index}`"
            class="submission-card q-mb-md"
          >
            <q-card-section>
              <div class="submission-header">
                <div class="submission-info">
                  <h3 class="submission-title">Submission #{{ submissions.length - index }}</h3>
                  <p class="submission-date">
                    Submitted on {{ formatDate(submission.submittedAt) }}
                  </p>
                </div>
                <div class="submission-actions">
                  <q-btn
                    flat
                    color="primary"
                    label="View Details"
                    icon="visibility"
                    @click="viewSubmissionDetails(submission)"
                  />
                </div>
              </div>

              <!-- Quick Answers Preview -->
              <div class="answers-preview">
                <div
                  v-for="answer in submission.answers.slice(0, 3)"
                  :key="answer.questionId"
                  class="answer-preview-item"
                >
                  <span class="answer-label">{{ getQuestionText(answer.questionId) }}:</span>
                  <span class="answer-value">{{ formatAnswerValue(answer.value) }}</span>
                </div>
                <div v-if="submission.answers.length > 3" class="more-answers">
                  +{{ submission.answers.length - 3 }} more answers
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Pagination -->
        <div class="pagination-container q-mt-lg">
          <q-pagination
            v-model="currentPage"
            :max="formsStore.getPagination.totalPages"
            :max-pages="6"
            boundary-numbers
            @update:model-value="handlePageChange"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <q-icon name="inbox" size="80px" color="grey-4" />
        <h3 class="empty-title">No Submissions Yet</h3>
        <p class="empty-description">
          This form hasn't received any submissions yet. Share the form link with students to start collecting responses.
        </p>
        <q-btn
          color="primary"
          label="Share Form"
          icon="share"
          @click="shareForm"
        />
      </div>
    </div>

    <!-- Submission Details Dialog -->
    <q-dialog v-model="showSubmissionDialog" maximized>
      <q-card class="submission-dialog">
        <q-card-section class="dialog-header">
          <h2 class="dialog-title">Submission Details</h2>
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="showSubmissionDialog = false"
          />
        </q-card-section>
        <q-card-section class="dialog-content">
          <div v-if="selectedSubmission" class="submission-details">
            <div class="detail-header">
              <h3>Submission #{{ getSubmissionNumber(selectedSubmission) }}</h3>
              <p class="detail-date">
                Submitted on {{ formatDate(selectedSubmission.submittedAt) }}
              </p>
            </div>

            <div class="answers-section">
              <h4>Responses</h4>
              <div
                v-for="answer in selectedSubmission.answers"
                :key="answer.questionId"
                class="answer-detail-item"
              >
                <div class="question-text">{{ getQuestionText(answer.questionId) }}</div>
                <div class="answer-content">
                  <div v-if="typeof answer.value === 'string'" class="text-answer">
                    {{ answer.value }}
                  </div>
                  <div v-else-if="Array.isArray(answer.value)" class="array-answer">
                    <q-chip
                      v-for="item in answer.value"
                      :key="item"
                      color="primary"
                      text-color="white"
                      size="sm"
                      class="q-mr-xs q-mb-xs"
                    >
                      {{ item }}
                    </q-chip>
                  </div>
                  <div v-else-if="typeof answer.value === 'object'" class="object-answer">
                    <div
                      v-for="(value, key) in answer.value"
                      :key="key"
                      class="grid-answer-item"
                    >
                      <span class="grid-key">{{ key }}:</span>
                      <span class="grid-value">
                        <span v-if="Array.isArray(value)">
                          <q-chip
                            v-for="item in value"
                            :key="item"
                            color="secondary"
                            text-color="white"
                            size="sm"
                            class="q-mr-xs q-mb-xs"
                          >
                            {{ item }}
                          </q-chip>
                        </span>
                        <span v-else>{{ value }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useFormsStore } from 'src/stores/forms'
import type { Submission, AnswerValue } from 'src/types/form'
import { isStringAnswer, isArrayAnswer, isGridAnswer } from 'src/types/form'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const formsStore = useFormsStore()

const formId = route.params.id as string
const currentPage = ref(1)
const showSubmissionDialog = ref(false)
const selectedSubmission = ref<Submission | null>(null)

// Computed properties
const submissions = computed(() => formsStore.getSubmissions)
const formTitle = computed(() => formsStore.getCurrentForm?.form.title || 'Loading...')

const latestSubmission = computed(() => {
  if (submissions.value.length === 0) return 'N/A'
  const latest = submissions.value[0]
  return formatDate(latest?.submittedAt)
})

const averageCompletionTime = computed(() => {
  // Mock calculation - in real app, you'd calculate actual completion times
  return '5-10 minutes'
})

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  try {
    await Promise.all([
      formsStore.fetchFormById(formId),
      formsStore.fetchSubmissions(formId, currentPage.value, 10)
    ])
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

const handlePageChange = async (page: number) => {
  currentPage.value = page
  await formsStore.fetchSubmissions(formId, page, 10)
}

const getQuestionText = (questionId: string): string => {
  if (!formsStore.getCurrentForm) return 'Unknown Question'
  const question = formsStore.getCurrentForm.questions.find(q => q.id === questionId)
  return question?.questionText || 'Unknown Question'
}

const formatAnswerValue = (value: AnswerValue): string => {
  if (isStringAnswer(value)) {
    return value.length > 50 ? value.substring(0, 50) + '...' : value
  }
  if (isArrayAnswer(value)) {
    return value.join(', ')
  }
  if (isGridAnswer(value)) {
    return Object.keys(value).length + ' responses'
  }
  return String(value)
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewSubmissionDetails = (submission: Submission) => {
  selectedSubmission.value = submission
  showSubmissionDialog.value = true
}

const getSubmissionNumber = (submission: Submission): number => {
  const index = submissions.value.findIndex(s => s.id === submission.id)
  return submissions.value.length - index
}

const exportSubmissions = () => {
  // TODO: Implement CSV export
  $q.notify({
    type: 'info',
    message: 'Export feature coming soon!',
    position: 'top'
  })
}

const shareForm = () => {
  // TODO: Implement form sharing
  $q.notify({
    type: 'info',
    message: 'Share feature coming soon!',
    position: 'top'
  })
}

const goBack = async () => {
  await router.push('/Admin/forms')
}
</script>

<style scoped>
.form-submissions-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
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

.breadcrumb {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #5f6368;
}

.breadcrumb-text {
  margin-left: 8px;
  font-weight: 500;
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
  margin-left: 24px;
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

.stats-section {
  margin-bottom: 24px;
}

.stats-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #4285f4;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #5f6368;
}

.submission-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.submission-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.submission-title {
  font-size: 18px;
  font-weight: 600;
  color: #202124;
  margin: 0 0 4px 0;
}

.submission-date {
  font-size: 14px;
  color: #5f6368;
  margin: 0;
}

.answers-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.answer-preview-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.answer-label {
  font-weight: 500;
  color: #5f6368;
  min-width: 120px;
}

.answer-value {
  color: #202124;
  flex: 1;
}

.more-answers {
  font-size: 12px;
  color: #80868b;
  font-style: italic;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-title {
  font-size: 24px;
  font-weight: 500;
  color: #5f6368;
  margin: 16px 0 8px 0;
}

.empty-description {
  font-size: 16px;
  color: #80868b;
  margin: 0 0 24px 0;
  max-width: 400px;
}

.pagination-container {
  display: flex;
  justify-content: center;
}

.submission-dialog {
  background-color: #f8f9fa;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-title {
  font-size: 24px;
  font-weight: 600;
  color: #202124;
  margin: 0;
}

.dialog-content {
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
}

.submission-details {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 32px;
}

.detail-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.detail-header h3 {
  font-size: 24px;
  font-weight: 600;
  color: #202124;
  margin: 0 0 8px 0;
}

.detail-date {
  font-size: 16px;
  color: #5f6368;
  margin: 0;
}

.answers-section h4 {
  font-size: 20px;
  font-weight: 600;
  color: #202124;
  margin: 0 0 24px 0;
}

.answer-detail-item {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.answer-detail-item:last-child {
  border-bottom: none;
}

.question-text {
  font-size: 16px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 12px;
}

.answer-content {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
}

.text-answer {
  font-size: 14px;
  color: #202124;
  line-height: 1.5;
}

.array-answer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.object-answer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.grid-answer-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.grid-key {
  font-weight: 500;
  color: #5f6368;
  min-width: 100px;
}

.grid-value {
  flex: 1;
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
    margin-left: 0;
    width: 100%;
  }

  .page-title {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .submission-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .answer-preview-item {
    flex-direction: column;
    gap: 4px;
  }

  .answer-label {
    min-width: auto;
  }

  .dialog-content {
    padding: 16px;
  }

  .submission-details {
    padding: 20px;
  }
}
</style>
