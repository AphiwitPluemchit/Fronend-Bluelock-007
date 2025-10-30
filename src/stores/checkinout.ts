import { defineStore } from 'pinia'
import CheckinoutService from 'src/services/checkinout'
import type { Checkinout } from 'src/types/checkinout'
import { ref } from 'vue'

export const useCheckinoutStore = defineStore('checkinout', () => {
  const checkinout = ref<Checkinout[]>([])

  async function checkin(token: string) {
    await CheckinoutService.checkin(token)
  }

  async function checkinWithClaim(claimToken: string) {
    await CheckinoutService.checkin('', claimToken)
  }

  async function checkout(token: string) {
    await CheckinoutService.checkout(token)
  }

  async function checkoutWithClaim(claimToken: string) {
    await CheckinoutService.checkout('', claimToken)
  }

  async function getStatus(studentId: string, programId: string) {
    const res = await CheckinoutService.getStatus(studentId, programId)
    return res
  }

  async function getProgramForm(programId: string) {
    const res = await CheckinoutService.getProgramForm(programId)
    return res
  }

  return {
    checkinout,
    checkin,
    checkinWithClaim,
    checkout,
    checkoutWithClaim,
    getStatus,
    getProgramForm,
  }
})
