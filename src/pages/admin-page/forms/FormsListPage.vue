<template>
  <q-page class="forms-list-page">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Forms Management</h1>
          <p class="page-subtitle">Manage and view form submissions</p>
        </div>
        <div class="header-actions">
          <q-btn
            color="primary"
            label="Create New Form"
            icon="add"
            @click="createForm"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="formsStore.isLoading" class="loading-container">
        <q-spinner-dots size="50px" color="primary" />
        <p class="q-mt-md">Loading forms...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="formsStore.getError" class="error-container">
        <q-banner class="bg-negative text-white">
          {{ formsStore.getError }}
          <template v-slot:action>
            <q-btn flat color="white" label="Retry" @click="loadForms" />
          </template>
        </q-banner>
      </div>

      <!-- Forms List -->
      <div v-else-if="formsStore.getForms.length > 0" class="forms-grid">
        <q-card
          v-for="form in formsStore.getForms"
          :key="form.id || 'temp'"
          class="form-card"
        >
          <q-card-section>
            <div class="form-card-header">
              <div class="form-info">
                <h3 class="form-title">{{ form.title }}</h3>
                <p class="form-description">{{ form.description }}</p>
              </div>
              <div class="form-status">
                <q-chip
                  :color="form.createdAt ? 'positive' : 'warning'"
                  text-color="white"
                  size="sm"
                >
                  {{ form.createdAt ? 'Active' : 'Draft' }}
                </q-chip>
              </div>
            </div>

            <div class="form-stats">
              <div class="stat-item">
                <q-icon name="people" size="20px" color="primary" />
                <div class="stat-content">
                  <span class="stat-value">{{ getSubmissionCount(form.id!) }}</span>
                  <span class="stat-label">Submissions</span>
                </div>
              </div>
              <div class="stat-item">
                <q-icon name="event" size="20px" color="secondary" />
                <div class="stat-content">
                  <span class="stat-value">{{ formatDate(form.createdAt) }}</span>
                  <span class="stat-label">Created</span>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              color="primary"
              label="View Submissions"
              icon="visibility"
              @click="viewSubmissions(form.id!)"
            />
            <q-btn
              flat
              color="secondary"
              label="Edit"
              icon="edit"
              @click="editForm(form.id!)"
            />
            <q-btn
              flat
              color="negative"
              label="Delete"
              icon="delete"
              @click="deleteForm(form.id!)"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <q-icon name="description" size="80px" color="grey-4" />
        <h3 class="empty-title">No Forms Created</h3>
        <p class="empty-description">
          You haven't created any forms yet. Start by creating your first form.
        </p>
        <q-btn
          color="primary"
          label="Create Your First Form"
          icon="add"
          @click="createForm"
        />
      </div>

      <!-- Pagination -->
      <div v-if="formsStore.getForms.length > 0" class="pagination-container q-mt-lg">
        <q-pagination
          v-model="currentPage"
          :max="formsStore.getPagination.totalPages"
          :max-pages="6"
          boundary-numbers
          @update:model-value="handlePageChange"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useFormsStore } from 'src/stores/forms'

const router = useRouter()
const $q = useQuasar()
const formsStore = useFormsStore()
const currentPage = ref(1)

onMounted(async () => {
  await loadForms()
})

const loadForms = async () => {
  await formsStore.fetchForms(currentPage.value, 10)
}

const handlePageChange = async (page: number) => {
  currentPage.value = page
  await loadForms()
}

const createForm = async () => {
  await router.push('/Admin/forms/builder')
}

const editForm = async (formId: string) => {
  await router.push(`/Admin/forms/builder/${formId}`)
}

const viewSubmissions = async (formId: string) => {
  await router.push(`/Admin/forms/${formId}/submissions`)
}

const deleteForm = (formId: string) => {
  $q.dialog({
    title: 'Delete Form ' + formId,
    message: 'Are you sure you want to delete this form? This action cannot be undone.',
    cancel: true,
    persistent: true
  })
}

const getSubmissionCount = (formId: string): number => {
  // TODO: Get actual submission count from API
  console.log('formId', formId);

  return Math.floor(Math.random() * 50) + 1
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.forms-list-page {
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

.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.form-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.form-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.form-info {
  flex: 1;
  margin-right: 16px;
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  color: #202124;
  margin: 0 0 8px 0;
}

.form-description {
  font-size: 14px;
  color: #5f6368;
  margin: 0;
  line-height: 1.4;
}

.form-status {
  flex-shrink: 0;
}

.form-stats {
  display: flex;
  gap: 24px;
  margin-top: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #202124;
}

.stat-label {
  font-size: 12px;
  color: #5f6368;
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

  .forms-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .form-card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-info {
    margin-right: 0;
    margin-bottom: 12px;
  }

  .form-stats {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
