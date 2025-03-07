import { defineStore } from 'pinia'
import { ActivityService } from 'src/services/activity'
import type { Pagination } from 'src/types/pagination'
import type { Activity } from 'src/types/activity'
import { onMounted, ref } from 'vue'

type TitleForm = 'New Activity' | 'Edit Activity'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref<Activity[]>([]) // Open and Close Enrollment Table
  const activities1 = ref<Activity[]>([]) // Open and Close Enrollment Table
  const activities2 = ref<Activity[]>([]) // Planning Table
  const activities3 = ref<Activity[]>([]) // Success Table
  const titleForm = ref<TitleForm>('New Activity')
  const initForm: Activity = {
    id: '', // เพิ่ม `id` เพื่อป้องกันปัญหาเวลาแก้ไข
    name: '',
    activityItems: [],
  }
  const activity = ref<Activity>(initForm)

  // query
  const query = ref<Pagination>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'id',
    order: 'DESC',
  })
  const query1 = ref<Pagination>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'id',
    order: 'DESC',
  })
  const query2 = ref<Pagination>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'id',
    order: 'DESC',
  })

  const query3 = ref<Pagination>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'id',
    order: 'DESC',
  })

  // **Wrapper function to fetch
  const getActivities = async () => {
    const data = await ActivityService.getAll(query.value)
    const data1 = await ActivityService.getAll(query1.value, 'open')
    const data2 = await ActivityService.getAll(query2.value, 'planning')
    const data3 = await ActivityService.getAll(query3.value, 'success')

    activities.value = data.data
    activities1.value = data1.data
    activities2.value = data2.data
    activities3.value = data3.data
    console.log(data.data)
    console.log(data1.data)
    console.log(data2.data)
    console.log(data3.data)
  }

  onMounted(async () => {
    await getActivities()
  })

  return {
    titleForm,
    activity,
    getActivities,
    activities1,
    activities2,
    activities3,
    query1,
    query2,
    query3,
  }
})
