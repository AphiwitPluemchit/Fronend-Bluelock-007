// file: src/stores/submission.ts
import { defineStore } from 'pinia'
import type { Submission } from 'src/types/submission'
import {
  createSubmission,
  getSubmission,
  getSubmissionsByForm,
  getFormBlocksAnalytics,
  getBlockAnalytics,
  type BlockCountItem,
} from 'src/services/submission'

export const useSubmissionStore = defineStore('submission', {
  state: () => ({
    // รายการทั้งหมดที่เพิ่งสร้างผ่านแอป (optional)
    submissions: [] as Submission[],

    // ใช้ดูรายละเอียดทีละตัว
    current: null as Submission | null,

    formSubmissions: {} as Record<string, Submission[]>,

    // แคช analytics ทั้งฟอร์ม: { [formId]: BlockCountItem[] }
    analyticsForm: {} as Record<string, BlockCountItem[]>,

    // แคช analytics รายบล็อก: { [`${formId}:${blockId}`]: BlockCountItem[] }
    analyticsBlock: {} as Record<string, BlockCountItem[]>,

    loading: false,
    error: null as string | null,
  }),

  actions: {
    /* ---------- CRUD: submission ---------- */
    async fetchSubmission(id: string) {
      this.loading = true
      this.error = null
      try {
        this.current = await getSubmission(id)
        return this.current
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch submission'
        throw err
      } finally {
        this.loading = false
      }
    },

    async addSubmission(sub: Submission) {
      this.loading = true
      this.error = null
      try {
        const created = await createSubmission(sub)
        this.submissions.push(created)
        return created
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to create submission'
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * ดึง submissions ของฟอร์ม (รองรับ limit/sort) + cache
     */
    async fetchSubmissionsByForm(
      formId: string,
      opts?: { limit?: number; sort?: string },
      forceRefresh = false
    ): Promise<Submission[]> {
      if (!forceRefresh && this.formSubmissions[formId]) {
        return this.formSubmissions[formId]
      }

      this.loading = true
      this.error = null
      try {
        const list = await getSubmissionsByForm(formId, opts)
        this.formSubmissions[formId] = list
        return list
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch submissions'
        throw err
      } finally {
        this.loading = false
      }
    },

    clearFormSubmissions(formId?: string) {
      if (formId) delete this.formSubmissions[formId]
      else this.formSubmissions = {}
    },

    /* ---------- Analytics ---------- */
    async fetchFormBlocksAnalytics(formId: string, forceRefresh = false) {
      if (!forceRefresh && this.analyticsForm[formId]) {
        return this.analyticsForm[formId]
      }

      this.loading = true
      this.error = null
      try {
        const data = await getFormBlocksAnalytics(formId)
        this.analyticsForm[formId] = data
        return data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch form analytics'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchBlockAnalytics(formId: string, blockId: string, forceRefresh = false) {
      const key = `${formId}:${blockId}`
      if (!forceRefresh && this.analyticsBlock[key]) {
        return this.analyticsBlock[key]
      }

      this.loading = true
      this.error = null
      try {
        const data = await getBlockAnalytics(formId, blockId)
        this.analyticsBlock[key] = data
        return data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch block analytics'
        throw err
      } finally {
        this.loading = false
      }
    },

    clearAnalytics(target?: { formId?: string; blockKey?: string }) {
      if (target?.blockKey) {
        delete this.analyticsBlock[target.blockKey]
      } else if (target?.formId) {
        delete this.analyticsForm[target.formId]
        // ลบ cache รายบล็อกของฟอร์มนี้ด้วย
        Object.keys(this.analyticsBlock).forEach((k) => {
          if (k.startsWith(`${target.formId}:`)) delete this.analyticsBlock[k]
        })
      } else {
        this.analyticsForm = {}
        this.analyticsBlock = {}
      }
    },
  },

  getters: {

    getFormSubmissions: (state) => (formId: string) =>
      state.formSubmissions[formId] || [],

    getFormAnalytics: (state) => (formId: string): BlockCountItem[] =>
    state.analyticsForm[formId] || [],

    getBlockAnalytics: (state) => (formId: string, blockId: string): BlockCountItem[] =>
    state.analyticsBlock[`${formId}:${blockId}`] || [],
      
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },
})
