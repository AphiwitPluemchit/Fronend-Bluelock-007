// stores/form.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Form } from 'src/types/form'
import { FormService } from 'src/services/forms'

export const useFormStore = defineStore('form', () => {
  const forms = ref<Form[]>([])
  const currentForm = ref<Form | null>(null)
  const loading = ref(false)

  /** โหลดฟอร์มทั้งหมด */
  const fetchForms = async () => {
    loading.value = true
    const res = await FormService.getForms()
    console.log('✅ Forms loaded:', res) 
    forms.value = res
    loading.value = false
  }

  /** โหลดฟอร์มตาม id */
/** โหลดฟอร์มตาม id */
const fetchFormById = async (id: string): Promise<Form | null> => {
  loading.value = true
  const form = await FormService.getFormById(id)
  currentForm.value = form
  loading.value = false
  return form // ✅ ต้องมี return form
}

  /** สร้างฟอร์มใหม่ */
  const createForm = async (form: Form) => {
    const created = await FormService.createForm(form)
    console.log('✅ Form created:', created)
    if (created) {
      forms.value.push(created)
    }
    return created
  }

  /** แก้ไขฟอร์ม */
  const updateForm = async (id: string, update: Partial<Form>) => {
    const updated = await FormService.updateForm(id, update)
    if (updated) {
      const index = forms.value.findIndex(f => f.id === id)
      if (index !== -1) {
        forms.value[index] = updated
      }
    }
    return updated
  }

  /** ลบฟอร์ม */
  const deleteForm = async (id: string) => {
    const ok = await FormService.deleteForm(id)
    if (ok) {
      forms.value = forms.value.filter(f => f.id !== id)
    }
    return ok
  }

  return {
    forms,
    currentForm,
    loading,
    fetchForms,
    fetchFormById,
    createForm,
    updateForm,

    deleteForm,
  }
})
