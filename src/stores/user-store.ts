import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const role = ref('admin') // ค่าเริ่มต้นเป็น User

  const setRole = (newRole: string) => {
    role.value = newRole
  }

  return { role, setRole }
})
