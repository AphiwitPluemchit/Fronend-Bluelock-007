// src/stores/forms.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Form } from 'src/types/form'
import { FormService } from 'src/services/forms'

// ---------- helpers & normalizers ----------
type RawForm = Partial<Form> & { _id?: string }
const isIndexable = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object'

const pickId = (obj: unknown): string | null => {
  if (!isIndexable(obj)) return null
  const idVal = obj['id']
  if (typeof idVal === 'string' && idVal) return idVal
  const mongoIdVal = obj['_id']
  if (typeof mongoIdVal === 'string' && mongoIdVal) return mongoIdVal
  const insertedIdVal = obj['insertedId']              // ✅ รองรับรูปแบบที่ backend ส่งมา
  if (typeof insertedIdVal === 'string' && insertedIdVal) return insertedIdVal
  return null
}

const unwrapMaybeWrapped = (
  raw: unknown,
): { payload: unknown; idHint?: string } => {
  if (!isIndexable(raw)) return { payload: raw }

  // ที่นี่ raw ถูก narrowed เป็น Record<string, unknown> แล้ว
  if ('form' in raw) {
    const inner = raw['form']           // unknown
    const inserted = raw['insertedId']  // unknown

    if (typeof inserted === 'string' && inserted.length > 0) {
      // ✅ ใส่ idHint เฉพาะเมื่อมีค่าเป็น string
      return { payload: inner, idHint: inserted }
    }
    // ✅ ถ้าไม่ใช่ string ให้ "ละคีย์" ไปเลย (อย่าใส่ undefined)
    return { payload: inner }
  }

  return { payload: raw }
}



const normalizeForm = (f: unknown): Form | null => {
  const { payload, idHint } = unwrapMaybeWrapped(f)    // ✅ แกะห่อก่อน
  if (!isIndexable(payload)) return null
  const rf = payload as RawForm
  const id = idHint ?? pickId(rf)                      // ✅ ใช้ insertedId เป็นไพ่ใบแรก
  const out: Form = { ...(rf as Form), ...(id ? { id } : {}) }
  return out
}

const normalizeForms = (arr: unknown): Form[] =>
  Array.isArray(arr)
    ? arr.map(normalizeForm).filter((x): x is Form => x !== null)
    : []


export const useFormStore = defineStore('forms', () => {
  const forms = ref<Form[]>([])
  const currentForm = ref<Form | null>(null)
  const loading = ref(false)
  const error = ref<unknown>(null)

  /** โหลดฟอร์มทั้งหมด */
  const fetchForms = async (): Promise<Form[]> => {
    loading.value = true
    error.value = null
    try {
      const res = await FormService.getForms()
      forms.value = normalizeForms(res)
      return forms.value
    } catch (e) {
      error.value = e
      forms.value = []
      throw e
    } finally {
      loading.value = false
    }
  }

  /** โหลดฟอร์มตาม id */
  const fetchFormById = async (id: string): Promise<Form | null> => {
    loading.value = true
    error.value = null
    try {
      const res = await FormService.getFormById(id)
      const form = normalizeForm(res)
      currentForm.value = form
      return form
    } catch (e) {
      error.value = e
      currentForm.value = null
      throw e
    } finally {
      loading.value = false
    }
  }

  /** สร้างฟอร์มใหม่ */
  const createForm = async (form: Form) => {
    const createdRaw = await FormService.createForm(form)
    const created = normalizeForm(createdRaw)
    if (created) forms.value.push(created)
    return created
  }

  /** แก้ไขฟอร์ม */
  const updateForm = async (id: string, update: Partial<Form>) => {
    const updatedRaw = await FormService.updateForm(id, update)
    const updated = normalizeForm(updatedRaw)
    if (updated) {
      const index = forms.value.findIndex((f) => f.id === id)
      if (index !== -1) forms.value[index] = updated
    }
    return updated
  }

  /** ลบฟอร์ม */
  const deleteForm = async (id: string) => {
    const ok = await FormService.deleteForm(id)
    if (ok) forms.value = forms.value.filter((f) => f.id !== id)
    return ok
  }

// stores/forms.ts
const duplicateForm = async (originFormId: string): Promise<Form> => {
  console.log('[dup][store] originFormId =', originFormId)

  const origin =
    forms.value.find(f => f.id === originFormId) ?? (await fetchFormById(originFormId))
  console.log('[dup][store] origin =', origin)

  if (!origin) throw new Error('Origin form not found')

  const body = JSON.parse(JSON.stringify(origin)) as Record<string, unknown>
  delete body['id']
  delete body['_id']

  type FormWithoutId = Omit<Form, 'id'>
  const toCreate: Form = { ...(body as unknown as FormWithoutId), isOrigin: false }

  const created = await createForm(toCreate)
  console.log('[dup][store] created (raw) =', created)

  if (!created) throw new Error('Create duplicated form failed')

  const id = pickId(created)
  console.log('[dup][store] normalized new id =', id)

  if (!id) throw new Error('Create duplicated form failed (no id)')

  const normalized: Form = { ...created, id }
  console.log('[dup][store] normalized new form =', normalized)

  forms.value = [normalized, ...forms.value]
  return normalized
}


  return {
    forms,
    currentForm,
    loading,
    error,
    fetchForms,
    fetchFormById,
    createForm,
    updateForm,
    deleteForm,
    duplicateForm,
  }
})
