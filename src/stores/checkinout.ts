import { defineStore } from 'pinia'
import CheckinoutService from 'src/services/checkinout'
import type { Checkinout } from 'src/types/checkinout'
import { ref } from 'vue'

export const useCheckinoutStore = defineStore('checkinout', () => {
  const checkinout = ref<Checkinout[]>([])
  async function checkin(studentId: string, uuid: string) {
    await CheckinoutService.checkin(studentId, uuid)
  }
  async function checkout(studentId: string, evaluationId: string, uuid: string) {
    await CheckinoutService.checkout(studentId, evaluationId, uuid)
  }
  async function getStatus(studentId: string, activityItemId: string) {
    const res = await CheckinoutService.getStatus(studentId, activityItemId)
    return res
  }
  return { checkinout, checkin, checkout, getStatus }
})
