import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { ProgramService } from 'src/services/program'
import { EnrollmentService } from 'src/services/enrollment'
import type { Program } from 'src/types/program'
import type { Pagination } from 'src/types/pagination'
import { ref } from 'vue'

// import { ref } from 'vue'
const query = ref<Pagination>({
  page: 1,
  limit: 10,
  search: '',
  sortBy: '_id',
  order: 'desc',
  skill: [],
  programState: ['open'],
  major: [],
  studentYear: [],
})
export const useStudentProgramstore = defineStore('program', {
  state: () => ({
    dialogState: false,
    program: [] as Program[],
    form: <Partial<Program>>{}, // ใช้ Spread Operator เพื่อป้องกันการเปลี่ยนค่าโดยตรง
    dataInit: true,
    search: '',
  }),

  getters: {
    getData: (state) => state.program,
  },

  actions: {
    async fetchData() {
      const data1 = await ProgramService.getAll(query.value)
      this.program = data1.data
    },

    async fetchOneData(id: string) {
      this.dataInit = false
      this.dataInit = false
      const data = await ProgramService.getOne(id)
      console.log(data.data)
      this.form = data.data
      this.dataInit = true
    },

    async enrollment(payload: object) {
      const status = await EnrollmentService.enrollment(payload)
      if (status === 201) {
        // await this.fetchData()
      }
    },
    async createOne() {
      // const status = await ProgramService.createOne(this.form)
      // if (status === 201) {
      //   // await this.fetchData()
      //   this.notifySuccess('เพิ่มกิจกรรมสำเร็จ')
      //   this.dialogState = false
      //   this.resetForm()
      // }
    },

    async updateOne() {
      const status = await ProgramService.updateOne(this.form)
      if (status === 200) {
        // await this.fetchData()
        this.notifySuccess('อัปเดตกิจกรรมสำเร็จ')
        this.dialogState = false
        this.resetForm()
      }
    },

    async removeOne(id: string) {
      await ProgramService.removeOne(id)
    },

    resetForm() {
      this.form = {}
    },

    notifySuccess(message: string) {
      Notify.create({ type: 'positive', message })
    },

    notifyError(message: string) {
      Notify.create({ type: 'negative', message })
    },
  },
})
