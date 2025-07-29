import axios from 'axios'
import type {
  Form,
} from 'src/types/form'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response wrapper
interface ApiResponse<T> {
  data: T
  message: string
}

export const formsService = {
  // ▶️ Create a new form
  async createForm(formData: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>): Promise<Form> {
    const res = await api.post<ApiResponse<Form>>('/forms', formData)
    return res.data.data
  },

  // 📝 Update form by ID
  async updateForm(formId: string, formData: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>): Promise<Form> {
    const res = await api.put<ApiResponse<Form>>(`/forms/${formId}`, formData)
    return res.data.data
  },

  // ❌ Delete form
  async deleteForm(formId: string): Promise<void> {
    await api.delete(`/forms/${formId}`)
  },
}
