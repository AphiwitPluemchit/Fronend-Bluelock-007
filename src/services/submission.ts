import type { Submission } from 'src/types/submission'
import { api } from 'boot/axios'

// สร้าง submission ใหม่
export async function createSubmission(sub: Submission) {
  const { data } = await api.post<Submission>('/submissions', sub)
  return data
}

// ดึง submission ตาม id
export async function getSubmission(id: string) {
  const { data } = await api.get<Submission>(`/submissions/${id}`)
  return data
}
