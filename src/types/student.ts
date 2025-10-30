export interface Student {
  id?: string
  code: string
  name: string
  email: string
  password: string
  status: number
  softSkill: number
  hardSkill: number
  major: string
  year?: string // ปีการศึกษา (2 หลัก) เช่น "68"
}

export interface ExcelStudentRow {
  name: string
  engName: string
  code: string | number
  major: string
  softSkill?: number
  hardSkill?: number
}

// เพิ่ม interface สำหรับประวัติการอบรม
export interface TrainingHistoryItem {
  name: string // ชื่อกิจกรรม
  date: string // วันที่ เช่น "14 มกราคม 2566"
  time: string // เวลา เช่น "08:00-12:00"
  location: string // สถานที่ เช่น "IF-3C02"
  skill: 'soft' | 'hard' // ประเภทชั่วโมง
  hours: number // จำนวนชั่วโมง อาจเป็นบวกหรือลบ
}

export interface SummaryReport {
  // จำนวนชั่วโมง อาจเป็นบวกหรือล
  total: number
  completed: number
  notCompleted: number
  completionRate: number
  softSkill: {
    completed: number
    notCompleted: number
    progress: number
  }
  hardSkill: {
    completed: number
    notCompleted: number
    progress: number
  }
}
