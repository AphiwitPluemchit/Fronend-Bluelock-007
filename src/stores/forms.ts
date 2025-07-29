import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Form } from 'src/types/form'
import { formsService } from 'src/services/forms'

export const useFormStore = defineStore('form', () => {
  // STATE
  const forms = ref<Form[]>([])
  const currentForm = ref<Form | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ACTIONS

  // ▶️ สร้างฟอร์มใหม่
  async function create(formData: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      loading.value = true
      const newForm = await formsService.createForm(formData)
      forms.value.push(newForm)
      return newForm
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to create form'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 📝 แก้ไขฟอร์ม
  async function update(formId: string, formData: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      loading.value = true
      const updatedForm = await formsService.updateForm(formId, formData)
      const index = forms.value.findIndex(f => f.id === formId)
      if (index !== -1) forms.value[index] = updatedForm
      if (currentForm.value?.id === formId) currentForm.value = updatedForm
      return updatedForm
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to create form'
      throw err
    }finally {
      loading.value = false
    }
  }


  async function remove(formId: string) {
    try {
      loading.value = true
      await formsService.deleteForm(formId)
      forms.value = forms.value.filter(f => f.id !== formId)
      if (currentForm.value?.id === formId) currentForm.value = null
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to create form'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    forms,
    currentForm,
    loading,
    error,
    create,
    update,
    remove,
  }
})
