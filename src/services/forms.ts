import axios from 'axios'
import type {
  FormWithQuestions,
  CreateFormRequest,
  SubmitFormRequest,
  PaginatedFormsResponse,
  PaginatedSubmissionsResponse,
  ApiResponse,
  Submission
} from 'src/types/form'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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

  // Get all forms with pagination
  async getForms(page: number = 1, limit: number = 10): Promise<PaginatedFormsResponse> {
    try {
      const response = await api.get<ApiResponse<PaginatedFormsResponse>>('/forms', {
        params: { page, limit }
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
      const response = await api.post<ApiResponse<Submission>>(`/forms/${formId}/submissions`, submissionData)
      return response.data.data
    } catch (error) {
      console.error('Error submitting form:', error)
      throw error
    }
  },

  // Get form submissions
  async getFormSubmissions(formId: string, page: number = 1, limit: number = 10): Promise<PaginatedSubmissionsResponse> {
    try {
      const response = await api.get<ApiResponse<PaginatedSubmissionsResponse>>(`/forms/${formId}/submissions`, {
        params: { page, limit }
      })
      return response.data.data
    } catch (error) {
      console.error('Error fetching submissions:', error)
      throw error
    }
  }
}

// Mock data for development/testing
export const mockForms = [
  {
    id: '1',
    title: 'Student Feedback Form',
    description: 'Please provide your feedback about the course and instructor',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Tech Conference Registration',
    description: 'Register for the annual technology conference',
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  }
]

export const mockFormWithQuestions: FormWithQuestions = {
  form: {
    id: '1',
    title: 'Student Feedback Form',
    description: 'Please provide your feedback about the course and instructor',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  questions: [
    {
      id: 'q1',
      formId: '1',
      type: 'short_answer',
      questionText: 'What is your student ID?',
      isRequired: true,
      order: 1
    },
    {
      id: 'q2',
      formId: '1',
      type: 'paragraph',
      questionText: 'Please describe your overall experience with this course.',
      isRequired: true,
      order: 2
    },
    {
      id: 'q3',
      formId: '1',
      type: 'multiple_choice',
      questionText: 'How would you rate the course difficulty?',
      isRequired: true,
      choices: ['Very Easy', 'Easy', 'Moderate', 'Difficult', 'Very Difficult'],
      order: 3
    },
    {
      id: 'q4',
      formId: '1',
      type: 'checkbox',
      questionText: 'Which aspects of the course did you find most helpful? (Select all that apply)',
      isRequired: false,
      choices: ['Lectures', 'Assignments', 'Group Projects', 'Office Hours', 'Online Resources', 'Textbook'],
      order: 4
    },
    {
      id: 'q5',
      formId: '1',
      type: 'dropdown',
      questionText: 'What is your major?',
      isRequired: true,
      choices: ['Computer Science', 'Engineering', 'Business', 'Arts', 'Science', 'Other'],
      order: 5
    },
    {
      id: 'q6',
      formId: '1',
      type: 'grid_multiple_choice',
      questionText: 'Rate the following aspects of the course:',
      isRequired: true,
      rows: ['Course Content', 'Instructor', 'Assignments', 'Grading', 'Course Materials'],
      columns: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
      order: 6
    },
    {
      id: 'q7',
      formId: '1',
      type: 'grid_checkbox',
      questionText: 'Which learning activities did you participate in? (Select all that apply for each)',
      isRequired: false,
      rows: ['Class Discussions', 'Group Projects', 'Individual Assignments', 'Presentations', 'Research Papers'],
      columns: ['Regularly', 'Sometimes', 'Rarely', 'Never'],
      order: 7
    }
  ]
}
