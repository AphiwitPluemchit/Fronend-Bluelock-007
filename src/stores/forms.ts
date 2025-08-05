// stores/form.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Form } from 'src/types/form'
import { FormService } from 'src/services/forms'

export const useFormStore = defineStore('form', () => {
  const forms = ref<Form[]>([])
  const currentForm = ref<Form | null>(null)

  const fetchForms = async () => {
    forms.value = await FormService.getAllForms()
  }

  const fetchFormById = async (id: string) => {
    currentForm.value = await FormService.getFormById(id)
  }

  const createForm = async (form: Form) => {
    const created = await FormService.createForm(form)
    forms.value.push(created)
    return created
  }

  const updateForm = async (id: string, update: Partial<Form>) => {
    const updated = await FormService.updateForm(id, update)
    const index = forms.value.findIndex(f => f.id === id)
    if (index !== -1) forms.value[index] = updated
    return updated
  }

  const deleteForm = async (id: string) => {
    await FormService.deleteForm(id)
    forms.value = forms.value.filter(f => f.id !== id)
  }

  return {
    forms,
    currentForm,
    fetchForms,
    fetchFormById,
    createForm,
    updateForm,
    deleteForm
  }
})
