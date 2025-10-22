import { defineStore } from 'pinia'
import { AdminService } from 'src/services/admin'
import type { Admin } from 'src/types/admin'
import type { Pagination } from 'src/types/pagination'
import { ref } from 'vue'

export const useAdminStore = defineStore('admin', () => {
  const admins = ref<Admin[]>([])
  const totalAdminsCount = ref(0)
  const code = ref('')

  const admin = ref<Admin>({
    id: '',
    name: '',
    email: '',
    password: '',
  })

  // เพิ่ม state เก็บประวัติการอบรม

  // query
  const query = ref<Pagination>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'code',
    order: 'asc',
  })

  // ฟังก์ชันสร้างนิสิตใหม่ (จากไฟล์ Excel)
  const createAdmin = async (admin: Admin) => {
    await AdminService.createAdmin(admin)
  }

  // ฟังก์ชันดึงนิสิตทั้งหมด
  const getAdmins = async () => {
    const data = await AdminService.getAll(query.value)
    admins.value = data.data
    totalAdminsCount.value = data.meta.total
  }

  // ฟังก์ชันดึงนิสิตตามรหัส
  const getAdminById = async (id: string) => {
    const data = await AdminService.getOne(id)

    admin.value = data
  }

  // ฟังก์ชันอัปเดตนิสิต (รับ argument)
  const updateAdmin = async (id: string, updatedAdmin: Admin) => {
    try {
      const res = await AdminService.updateOne(id, updatedAdmin)
      console.log('Update success:', res)
      return true
    } catch (error) {
      console.error('Update failed:', error)
      return false
    }
  }

  return {
    createAdmin,
    getAdminById,
    getAdmins,
    admin,
    query,
    admins,
    code,
    totalAdminsCount,
    updateAdmin,
  }
})
