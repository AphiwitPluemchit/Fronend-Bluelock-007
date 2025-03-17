import { defineStore } from 'pinia'
import { ActivityService } from 'src/services/activity'
import type { ActivityPagination } from 'src/types/pagination'
import type { Activity } from 'src/types/activity'
import { ref } from 'vue'

type TitleForm = 'New Activity' | 'Edit Activity'

export const useActivityStore = defineStore('activity', () => {
  const activitys1 = ref<Activity[]>([]) // Open and Close Enrollment Table
  const activitys2 = ref<Activity[]>([]) // Planning Table
  const activitys3 = ref<Activity[]>([]) // Success Table
  const titleForm = ref<TitleForm>('New Activity')
  const initForm: Activity = {
    id: '', // เพิ่ม `id` เพื่อป้องกันปัญหาเวลาแก้ไข
    name: '',
    activityItems: [],
  }
  const activity = ref<Activity>(initForm)

  const query1 = ref<ActivityPagination>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: '_id',
    order: 'desc',
    skill: [],
    activityState: ['open', 'close'],
    major: [],
    studentYear: [],
  })
  const query2 = ref<ActivityPagination>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: '_id',
    order: 'desc',
    skill: [],
    activityState: ['planning'],
    major: [],
    studentYear: [],
  })

  const query3 = ref<ActivityPagination>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: '_id',
    order: 'desc',
    skill: [],
    activityState: ['success', 'cancel'],
    major: [],
    studentYear: [],
  })

  // **Wrapper function to fetch
  async function getActivities() {
    const data1 = await ActivityService.getAll(query1.value)
    const data2 = await ActivityService.getAll(query2.value)
    const data3 = await ActivityService.getAll(query3.value)

    activitys1.value = data1.data
    activitys2.value = data2.data
    activitys3.value = data3.data
    console.log(data1.data)
    console.log(data2.data)
    console.log(data3.data)
  }

  return {
    getActivities,
    titleForm,
    activity,
    activitys1,
    activitys2,
    activitys3,
    query1,
    query2,
    query3,
  }
})
