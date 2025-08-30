import { defineStore } from 'pinia'
import CheckinoutService from 'src/services/checkinout'
import type { Checkinout } from 'src/types/checkinout'
import { ref } from 'vue'

export const useCheckinoutStore = defineStore('checkinout', () => {
  const checkinout = ref<Checkinout[]>([])
  async function checkin(token: string) {
    await CheckinoutService.checkin(token)
  }
  async function checkout(token: string) {
    await CheckinoutService.checkout(token)
  }
  async function getStatus(studentId: string, activityId: string) {
    const res = await CheckinoutService.getStatus(studentId, activityId)
    return res
  }
  async function getActivityForm(activityId: string) {
    const res = await CheckinoutService.getActivityForm(activityId)
    return res
  }
  return { checkinout, checkin, checkout, getStatus, getActivityForm }
})
