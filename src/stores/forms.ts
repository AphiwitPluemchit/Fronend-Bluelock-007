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
  const insertedIdVal = obj['insertedId']
  if (typeof insertedIdVal === 'string' && insertedIdVal) return insertedIdVal
  return null
}

const pickOriginId = (v: unknown): string | null =>
  isIndexable(v) && typeof v['originId'] === 'string' && v['originId'].length > 0
    ? v['originId']
    : null

const normalizeTitle = (s: unknown): string => (typeof s === 'string' ? s.trim() : '')

const unwrapMaybeWrapped = (raw: unknown): { payload: unknown; idHint?: string } => {
  if (!isIndexable(raw)) return { payload: raw }
  if ('form' in raw) {
    const inner = raw['form']
    const inserted = raw['insertedId']
    if (typeof inserted === 'string' && inserted.length > 0) {
      return { payload: inner, idHint: inserted }
    }
    return { payload: inner }
  }
  return { payload: raw }
}

const normalizeForm = (f: unknown): Form | null => {
  const { payload, idHint } = unwrapMaybeWrapped(f)
  if (!isIndexable(payload)) return null
  const rf = payload as RawForm
  const id = idHint ?? pickId(rf)
  const out: Form = { ...(rf as Form), ...(id ? { id } : {}) }
  return out
}

const normalizeForms = (arr: unknown): Form[] =>
  Array.isArray(arr) ? arr.map(normalizeForm).filter((x): x is Form => x !== null) : []

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

  const resolveOriginId = async (id: string): Promise<string | null> => {
    const f = forms.value.find((x) => x.id === id) ?? (await fetchFormById(id))
    if (!f) return null

    const formId = pickId(f)

    // เป็น origin
    if ((f as unknown as { isOrigin?: boolean }).isOrigin === true) {
      return formId ?? null
    }

    // มี originId
    const viaOriginField = pickOriginId(f)
    if (viaOriginField) return viaOriginField

    // fallback: เทียบชื่อกับ origin ใน store
    const title = normalizeTitle(f.title)
    if (title) {
      const origin = forms.value.find(
        (x) =>
          (x as unknown as { isOrigin?: boolean }).isOrigin === true &&
          normalizeTitle(x.title) === title,
      )
      return origin?.id ?? null
    }

    return null
  }

  /** โหลดฟอร์มตาม id */
  const fetchFormById = async (id: string): Promise<Form | null> => {
    loading.value = true
    error.value = null
    try {
      const res = await FormService.getFormById(id)
      const form = normalizeForm(res) // res อาจเป็น null -> normalizeForm จะได้ null
      currentForm.value = form
      return form
    } catch (e) {
      // (ปกติจะไม่เข้าเพราะ service คืน null แล้ว)
      error.value = e
      currentForm.value = null
      return null
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
      forms.value.find((f) => f.id === originFormId) ?? (await fetchFormById(originFormId))
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
    resolveOriginId,
  }
})
