import { defineStore } from 'pinia'
import type { Activity } from 'src/types/activity'
import { ref } from 'vue'

type TitleForm = 'New Activity' | 'Edit Activity'

export const useActivityStore = defineStore('activity', () => {
  const titleForm = ref<TitleForm>('New Activity')
  const initForm: Activity = {
    id: '', // เพิ่ม `id` เพื่อป้องกันปัญหาเวลาแก้ไข
    name: '',
    activityItems: [],
  }
  const activity = ref<Activity>(initForm)

  return {
    titleForm,
    activity,
  }
})
