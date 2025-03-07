import { defineStore } from 'pinia'
import {  Notify } from 'quasar'
import { StudentService } from 'src/services/student'
import type { Student } from 'src/types/student'

const data1: Student[] =([
  {
    id: '67c592a9d8dfb0b8db9a1d06',
    code: '65160001',
    name: 'Alice Johnson',
    email: 'alice.johnson@email.com',
    password: 'secret123',
    status: 'Active',
    softskill: 9,
    hardskill: 7,
    major: 'CS',
  },
  {
    id: '67c592c2d8dfb0b8db9a1d07',
    code: '65160002',
    name: 'Bob Smith',
    email: 'bob.smith@email.com',
    password: 'secure456',
    status: 'Inactive',
    softskill: 8,
    hardskill: 9,
    major: 'CS',
  },
  {
    id: '67c87b4aa9d3dbc3dd5ce77b',
    code: '65160003',
    name: 'Charlie Davis',
    email: 'charlie.davis@email.com',
    password: 'pass789',
    status: 'Active',
    softskill: 7,
    hardskill: 6,
    major: 'ITDI',
  },
  {
    id: '67c87b61a9d3dbc3dd5ce77c',
    code: '65160004',
    name: 'David White',
    email: 'david.white@email.com',
    password: 'mypassword',
    status: 'Active',
    softskill: 10,
    hardskill: 8,
    major: 'ITDI',
  },
  {
    id: '67c87b6aa9d3dbc3dd5ce77d',
    code: '65160005',
    name: 'Emma Brown',
    email: 'emma.brown@email.com',
    password: 'brownpass',
    status: 'Active',
    softskill: 6,
    hardskill: 7,
    major: 'AAI',
  },
  {
    id: '67c87b98a9d3dbc3dd5ce77f',
    code: '65160006',
    name: 'Frank Wilson',
    email: 'frank.wilson@email.com',
    password: 'wilson321',
    status: 'Inactive',
    softskill: 9,
    hardskill: 6,
    major: 'AAI',
  },
  {
    id: '67c87ba0a9d3dbc3dd5ce780',
    code: '65160007',
    name: 'Grace Miller',
    email: 'grace.miller@email.com',
    password: 'gracepass',
    status: 'Active',
    softskill: 7,
    hardskill: 10,
    major: 'SE',
  },
  {
    id: '67c87baaa9d3dbc3dd5ce781',
    code: '65160008',
    name: 'Henry Lee',
    email: 'henry.lee@email.com',
    password: 'lee_secret',
    status: 'Active',
    softskill: 8,
    hardskill: 9,
    major: 'SE',
  },
  {
    id: '67c87bbba9d3dbc3dd5ce783',
    code: '65160009',
    name: 'Isabella Martinez',
    email: 'isabella.martinez@email.com',
    password: 'martinez456',
    status: 'Inactive',
    softskill: 6,
    hardskill: 8,
    major: 'CS',
  },
  {
    id: '67c87bc1a9d3dbc3dd5ce784',
    code: '65160010',
    name: 'Jack Taylor',
    email: 'jack.taylor@email.com',
    password: 'taylorpass',
    status: 'Active',
    softskill: 10,
    hardskill: 7,
    major: 'CS',
  },
])
const initForm: Student = {
  id: '',
  code: '',
  name: '',
  email: '',
  password: '',
  status: '',
  softskill: 0,
  hardskill: 0,
  major: '',
}

export const useStudentStore = defineStore('student', {
  state: () => ({
    dialogState: false,
    students: [] as Student[],
    form: { ...initForm }, // ใช้ Spread Operator เพื่อป้องกันการเปลี่ยนค่าโดยตรง
    editMode: false,
    search: '',
  }),

  getters: {
    getData: (state) => state.students,
  },

  actions: {
     fetchData() {
      // const data = await StudentService.getAll()
      this.students = data1
      // this.students = JSON.parse(JSON.stringify(data))
    },

    async fetchOneData(id: string) {
      const data = await StudentService.getOne(id)
      this.form = { ...data }
    },

    async createOne() {
      const status = await StudentService.createOne(this.form)
      if (status === 201) {
         this.fetchData()
        this.notifySuccess('เพิ่มกิจกรรมสำเร็จ')
        this.dialogState = false
        this.resetForm()
      }
    },

    async updateOne() {
      const status = await StudentService.updateOne(this.form)
      if (status === 200) {
         this.fetchData()
        this.notifySuccess('อัปเดตกิจกรรมสำเร็จ')
        this.dialogState = false
        this.resetForm()
      }
    },

    async removeOne(id: string) {
      await StudentService.removeOne(id)
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
