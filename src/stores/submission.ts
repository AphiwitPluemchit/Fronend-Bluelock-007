import { defineStore } from 'pinia'
import type { Submission } from 'src/types/submission'
import { createSubmission, getSubmission } from 'src/services/submission'

export const useSubmissionStore = defineStore('submission', {
  state: () => ({
    submissions: [] as Submission[],
    current: null as Submission | null
  }),
  actions: {
    async fetchSubmission(id: string) {
      this.current = await getSubmission(id)
    },
    async addSubmission(sub: Submission) {
      const created = await createSubmission(sub)
      this.submissions.push(created)
      console.log('Submission added:', created)
    }
  }
})
