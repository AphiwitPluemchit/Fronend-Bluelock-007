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
import { formsService, mockForms, mockFormWithQuestions } from 'src/services/forms'

export const useFormsStore = defineStore('forms', () => {
  // State
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

  // Getters
  const getForms = computed(() => forms.value)
  const getCurrentForm = computed(() => currentForm.value)
  const getSubmissions = computed(() => submissions.value)
  const isLoading = computed(() => loading.value)
  const getError = computed(() => error.value)
  const getPagination = computed(() => pagination.value)

  // Actions
  const fetchForms = async (page: number = 1, limit: number = 10) => {
    loading.value = true
    error.value = null

    try {
      // For development, use mock data
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
        forms.value = mockForms
        pagination.value = {
          page,
          limit,
          total: mockForms.length,
          totalPages: Math.ceil(mockForms.length / limit)
        }
      } else {
        const response: PaginatedFormsResponse = await formsService.getForms(page, limit)
        forms.value = response.forms
        pagination.value = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch forms'
      console.error('Error fetching forms:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchFormById = async (formId: string) => {
    loading.value = true
    error.value = null

    try {
      // For development, use mock data
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
        currentForm.value = mockFormWithQuestions
      } else {
        const response = await formsService.getFormById(formId)
        currentForm.value = response
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch form'
      console.error('Error fetching form:', err)
    } finally {
      loading.value = false
    }
  }

  const createForm = async (formData: CreateFormRequest) => {
    loading.value = true
    error.value = null

    try {
      // For development, simulate creation
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
        const newForm: FormWithQuestions = {
          form: {
            id: Date.now().toString(),
            title: formData.title,
            description: formData.description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          questions: formData.questions.map((q, index) => ({
            ...q,
            id: `q${Date.now()}_${index}`,
            order: index + 1
          }))
        }
        currentForm.value = newForm
        forms.value.unshift(newForm.form)
        return newForm
      } else {
        const response = await formsService.createForm(formData)
        currentForm.value = response
        forms.value.unshift(response.form)
        return response
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create form'
      console.error('Error creating form:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const submitForm = async (formId: string, submissionData: SubmitFormRequest) => {
    loading.value = true
    error.value = null

    try {
      // For development, simulate submission
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
        const submission = {
          id: Date.now().toString(),
          formId,
          submittedAt: new Date().toISOString(),
          answers: submissionData.answers
        }
        submissions.value.push(submission)
        return submission
      } else {
        const response = await formsService.submitForm(formId, submissionData)
        submissions.value.push(response)
        return response
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to submit form'
      console.error('Error submitting form:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchSubmissions = async (formId: string, page: number = 1, limit: number = 10) => {
    loading.value = true
    error.value = null

    try {
      // For development, use mock data
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
        const mockSubmissions = [
          {
            id: '1',
            formId,
            submittedAt: '2024-01-15T11:00:00Z',
            answers: [
              { questionId: 'q1', value: '12345' },
              { questionId: 'q2', value: 'Great course!' },
              { questionId: 'q3', value: 'Moderate' }
            ]
          },
          {
            id: '2',
            formId,
            submittedAt: '2024-01-15T12:00:00Z',
            answers: [
              { questionId: 'q1', value: '67890' },
              { questionId: 'q2', value: 'Very informative' },
              { questionId: 'q3', value: 'Difficult' }
            ]
          }
        ]
        submissions.value = mockSubmissions
        pagination.value = {
          page,
          limit,
          total: mockSubmissions.length,
          totalPages: Math.ceil(mockSubmissions.length / limit)
        }
      } else {
        const response: PaginatedSubmissionsResponse = await formsService.getFormSubmissions(formId, page, limit)
        submissions.value = response.submissions
        pagination.value = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch submissions'
      console.error('Error fetching submissions:', err)
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
