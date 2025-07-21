import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Form,
  FormWithQuestions,
  CreateFormRequest,
  SubmitFormRequest,
  PaginatedFormsResponse,
  PaginatedSubmissionsResponse,
  Submission
} from 'src/types/form'
import { formsService } from 'src/services/forms'

export const useFormsStore = defineStore('forms', () => {
  const forms = ref<Form[]>([])
  const currentForm = ref<FormWithQuestions | null>(null)
  const submissions = ref<Submission[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // ✅ Getters
  const getForms = computed(() => forms.value ?? []) 
  const getCurrentForm = computed(() => currentForm.value)
  const getSubmissions = computed(() => submissions.value)
  const isLoading = computed(() => loading.value)
  const getError = computed(() => error.value)
  const getPagination = computed(() => pagination.value)

  // ✅ Actions
  const fetchForms = async (page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const response: PaginatedFormsResponse = await formsService.getForms(page, limit)
      forms.value = response.forms
      pagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch forms'
    } finally {
      loading.value = false
    }
  }

  const fetchFormById = async (formId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await formsService.getFormById(formId)
      currentForm.value = response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch form'
    } finally {
      loading.value = false
    }
  }

  const createForm = async (formData: CreateFormRequest) => {
    loading.value = true
    error.value = null
    try {
      const response = await formsService.createForm(formData)
      currentForm.value = response
      forms.value.unshift(response.form)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create form'
      throw err
    } finally {
      loading.value = false
    }
  }

  const submitForm = async (formId: string, submissionData: SubmitFormRequest) => {
    loading.value = true
    error.value = null
    try {
      const response = await formsService.submitForm(formId, submissionData)
      submissions.value.push(response)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to submit form'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchSubmissions = async (formId: string, page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const response: PaginatedSubmissionsResponse = await formsService.getFormSubmissions(formId, page, limit)
      submissions.value = response.submissions
      pagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch submissions'
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentForm = () => {
    currentForm.value = null
  }
  const deleteForm = async (formId: string) => {
    loading.value = true
    error.value = null
  
    try {
      await formsService.deleteForm(formId)
      forms.value = forms.value.filter(f => f.id !== formId) // ลบออกจาก state
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete form'
      throw err
    } finally {
      loading.value = false
    }
  }
  

  return {
    // State
    forms,
    currentForm,
    submissions,
    loading,
    error,
    pagination,

    // Getters
    getForms,
    getCurrentForm,
    getSubmissions,
    isLoading,
    getError,
    getPagination,
    deleteForm,

    // Actions
    fetchForms,
    fetchFormById,
    createForm,
    submitForm,
    fetchSubmissions,
    clearError,
    clearCurrentForm
  }
})
