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
}

export interface ExcelStudentRow {
  name: string
  engName: string
  code: string | number
  major: string
  password?: string | number
  softSkill?: number
  hardSkill?: number
}

// เพิ่ม interface สำหรับประวัติการอบรม
export interface TrainingHistoryItem {
  name: string         // ชื่อกิจกรรม
  date: string         // วันที่ เช่น "14 มกราคม 2566"
  time: string         // เวลา เช่น "08:00-12:00"
  location: string     // สถานที่ เช่น "IF-3C02"
  skill: 'soft' | 'hard'  // ประเภทชั่วโมง
  hours: number        // จำนวนชั่วโมง อาจเป็นบวกหรือลบ
}