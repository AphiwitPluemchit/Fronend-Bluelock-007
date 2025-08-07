import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { Form } from 'src/types/form'

// 🔔 แสดงข้อความ error
const showError = (message: string) => {
  Notify.create({
    message,
    type: 'negative',
    position: 'bottom',
    timeout: 3000,
  })
}

export class FormService {
  static path = '/forms' // ✅ ต้องตรงกับ backend เช่น /forms หรือ /api/forms ตามที่ backend set

  /** สร้างฟอร์มใหม่ */
  static async createForm(form: Form): Promise<Form | null> {
    try {
      const res = await api.post<Form>(this.path, form)
      return res.data
    } catch (error) {
      showError('ไม่สามารถสร้างฟอร์มได้')
      console.error('CreateForm error:', error)
      return null
    }
  }

  /** ดึงฟอร์มทั้งหมด */
  static async getForms(): Promise<Form[]> {
    try {
      const res = await api.get<Form[]>(this.path)
      return res.data
    } catch (error) {
      showError('โหลดรายการฟอร์มไม่สำเร็จ')
      console.error('GetForms error:', error)
      return []
    }
  }

  /** ดึงฟอร์มตาม ID */
  static async getFormById(id: string): Promise<Form | null> {
    try {
      const res = await api.get<Form>(`${this.path}/${id}`)
      return res.data
    } catch (error) {
      showError('ไม่พบฟอร์มที่ต้องการ')
      console.error('GetFormById error:', error)
      return null
    }
  }

  /** ลบฟอร์ม */
  static async deleteForm(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.path}/${id}`)
      return true
    } catch (error) {
      showError('ไม่สามารถลบฟอร์มได้')
      console.error('DeleteForm error:', error)
      return false
    }
  }

  /** แก้ไขฟอร์ม */
  static async updateForm(id: string, update: Partial<Form>): Promise<Form | null> {
    try {
      const res = await api.put<Form>(`${this.path}/${id}`, update)
      return res.data
    } catch (error) {
      showError('ไม่สามารถแก้ไขฟอร์มได้')
      console.error('UpdateForm error:', error)
      return null
    }
  }
}