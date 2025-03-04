import { defineStore } from 'pinia'
import {  Notify } from 'quasar'
import { ActivityService } from 'src/services/activity'
import type { Activity } from 'src/types/activity'

type TitleForm = 'New Activity' | 'Edit Activity'

const initForm: Activity = {
  id: '', // เพิ่ม `id` เพื่อป้องกันปัญหาเวลาแก้ไข
  name: '',
}

export const useActivityStore = defineStore('activity', {
  state: () => ({
    dialogState: false,
    activitys: [] as Activity[],
    form: { ...initForm }, // ใช้ Spread Operator เพื่อป้องกันการเปลี่ยนค่าโดยตรง
    editMode: false,
    titleForm: '' as TitleForm,
    search: '',
  }),

  getters: {
    getData: (state) => state.activitys,
  },

  actions: {
    async fetchData() {
      const data = await ActivityService.getAll()
      this.activitys = JSON.parse(JSON.stringify(data))
    },

    async fetchOneData(id: string) {
      const data = await ActivityService.getOne(id)
      this.form = { ...data }
    },

    async createOne() {
      const status = await ActivityService.createOne(this.form)
      if (status === 201) {
        await this.fetchData()
        this.notifySuccess('เพิ่มกิจกรรมสำเร็จ')
        this.dialogState = false
        this.resetForm()
      }
    },

    async updateOne() {
      const status = await ActivityService.updateOne(this.form)
      if (status === 200) {
        await this.fetchData()
        this.notifySuccess('อัปเดตกิจกรรมสำเร็จ')
        this.dialogState = false
        this.resetForm()
      }
    },

    async removeOne(id: string) {
      await ActivityService.removeOne(id)
    },

    resetForm() {
      this.form = { ...initForm }
    },

    notifySuccess(message: string) {
      Notify.create({ type: 'positive', message })
    },

    notifyError(message: string) {
      Notify.create({ type: 'negative', message })
    },
  },
})
