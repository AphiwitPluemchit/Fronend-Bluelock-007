import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Course } from 'src/types/course'
import { CourseService } from 'src/services/course'

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
  })

  const fetchCourses = async () => {
    const data = await CourseService.getAll()
    courses.value = data.data
  }

  const addCourse = async (course: Course) => {
    await CourseService.createCourse(course)
    await fetchCourses()
  }

  const getOneCourse = async (id: string) => {
    const course = await CourseService.getOne(id)
    return course
  }

  const updateCourse = async (id: string, data: Course) => {
    try {
      const res = await CourseService.updateOne(id, data)
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
  }
})
