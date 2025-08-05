// services/form.ts
import { api } from 'boot/axios'
import type { Form } from 'src/types/form'

export const FormService = {
  async createForm(form: Form) {
    const res = await api.post<Form>('/api/forms', form)
    return res.data
  },

  async getFormById(id: string) {
    const res = await api.get<Form>(`/api/forms/${id}`)
    return res.data
  },

  async getAllForms() {
    const res = await api.get<Form[]>('/api/forms')
    return res.data
  },

  async deleteForm(id: string) {
    await api.delete(`/api/forms/${id}`)
  },

  async updateForm(id: string, form: Partial<Form>) {
    const res = await api.put<Form>(`/api/forms/${id}`, form)
    return res.data
  }
}
