import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Course } from 'src/types/course'
import type { CourseQuery } from 'src/services/course'
import { CourseService } from 'src/services/course'
import type { Meta } from 'src/types/pagination'

export const useCourseStore = defineStore('course', () => {
  const courses = ref<Course[]>([])
  const loading = ref(false)

  const course = ref<Course>({
    id: '',
    name: '',
    link: '',
    isHardSkill: false,
    isActive: false,
    issuer: '',
    hour: 0,
    type: '',
    description: '',
  })

  const params = ref<CourseQuery>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'name',
    order: 'asc',
    isActive: undefined,
    isHardSkill: undefined,
    type: undefined,
  })

  const meta = ref<Meta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const search = ref('')

  const fetchCourses = async () => {
    loading.value = true
    try {
      // ✅ ดึงข้อมูลจาก API
      const res = await CourseService.getAll(params.value)
      console.log('Courses from API:', res)
      console.log('Courses from Params:', params.value)

      // ✅ เก็บข้อมูลคอร์ส
      courses.value = res.data

      // ✅ กำหนด meta
      meta.value = {
        ...res.meta,
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      loading.value = false
    }
  }

  const changePage = async (page: number) => {
    params.value.page = page
    await fetchCourses()
  }

  const changeLimit = async (limit: number) => {
    params.value.limit = limit
    meta.value.page = 1
    await fetchCourses()
  }

  const addCourse = async (course: Course) => {
    await CourseService.createCourse(course)
    await fetchCourses()
    console.log('Mock addCourse:', course)
    return Promise.resolve()
  }

  const getOneCourse = async (id: string) => {
    const course = await CourseService.getOne(id)
    return course
  }

  const updateCourse = async (id: string, data: Course) => {
    try {
      const res: Course = await CourseService.updateOne(id, data)
      console.log('Update success:', res)
      return true
    } catch (error) {
      console.error('Update failed:', error)
      return false
    }
  }

  const deleteCourse = async (id: string) => {
    await CourseService.deleteOne(id)
    await fetchCourses()
  }

  const getCourseByType = async (type: string) => {
    const courses = await CourseService.getByType(type)
    return courses
  }

  return {
    courses,
    loading,
    fetchCourses,
    addCourse,
    getOneCourse,
    updateCourse,
    deleteCourse,
    getCourseByType,
    course,
    meta,
    changePage,
    changeLimit,
    search,
    params,
  }
})
