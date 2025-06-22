import { defineStore } from 'pinia'
import CheckinoutService from 'src/services/checkinout'
import type { Checkinout } from 'src/types/checkinout'
import { ref } from 'vue'

export const useCheckinoutStore = defineStore('checkinout', () => {
  const checkinout = ref<Checkinout[]>([])
  async function checkin(studentId: string, uuid: string) {
    await CheckinoutService.checkin(studentId, uuid)
  }
  return { checkinout, checkin }
})
