export interface CalendarEvent {
  id: string
  programName: string        // ชื่อกิจกรรมหลัก
  programItemName: string    // ชื่อกิจกรรมย่อย
  programState: string
  category: 'soft' | 'hard'
  date: string
  time: string
  location: string
  participants: string
}
