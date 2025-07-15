export interface CalendarEvent {
  id: string
  activityName: string        // ชื่อกิจกรรมหลัก
  activityItemName: string    // ชื่อกิจกรรมย่อย
  activityState: string
  category: 'soft' | 'hard'
  date: string
  time: string
  location: string
  participants: string
}
