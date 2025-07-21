import axios from 'axios'
import type {
  FormWithQuestions,
  CreateFormRequest,
  SubmitFormRequest,
  PaginatedFormsResponse,
  PaginatedSubmissionsResponse,
  ApiResponse,
  Submission,
} from 'src/types/form'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Forms API Service
export const formsService = {
  // Create a new form
  async createForm(formData: CreateFormRequest): Promise<FormWithQuestions> {
    try {
      const response = await api.post<ApiResponse<FormWithQuestions>>('/forms', formData)
      return response.data.data
    } catch (error) {
      console.error('Error creating form:', error)
      throw error
    }
  },

  // Delete a form by ID
  async deleteForm(formId: string): Promise<void> {
    await api.delete(`/forms/${formId}`) // ต้องเป็น DELETE
  },
  // Get all forms with pagination
  async getForms(page: number = 1, limit: number = 10): Promise<PaginatedFormsResponse> {
    try {
      const response = await api.get<ApiResponse<PaginatedFormsResponse>>('/forms', {
        params: { page, limit },
      })
      return response.data.data
    } catch (error) {
      console.error('Error fetching forms:', error)
      throw error
    }
  },

  // Get a specific form with questions
  async getFormById(formId: string): Promise<FormWithQuestions> {
    try {
      const response = await api.get<ApiResponse<FormWithQuestions>>(`/forms/${formId}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching form:', error)
      throw error
    }
  },

  // Submit answers to a form
  async submitForm(formId: string, submissionData: SubmitFormRequest): Promise<Submission> {
    try {
      const response = await api.post<ApiResponse<Submission>>(
        `/forms/${formId}/submissions`,
        submissionData,
      )
      return response.data.data
    } catch (error) {
      console.error('Error submitting form:', error)
      throw error
    }
  },

  // Get form submissions
  async getFormSubmissions(
    formId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedSubmissionsResponse> {
    try {
      const response = await api.get<ApiResponse<PaginatedSubmissionsResponse>>(
        `/forms/${formId}/submissions`,
        {
          params: { page, limit },
        },
      )
      return response.data.data
    } catch (error) {
      console.error('Error fetching submissions:', error)
      throw error
    }
  },
}
