export interface Student {
  id: string
  email: string
  first_name: string
  last_name: string
  admission_number: string
  class_id: string
  passport_url?: string
  date_of_birth?: string
  parent_phone?: string
  parent_email?: string
  address?: string
  created_at: string
}

export interface Teacher {
  id: string
  email: string
  staff_id: string
  first_name: string
  last_name: string
  phone?: string
  subject_id?: string
  created_at: string
}

export interface Admin {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  created_at: string
}

export interface Class {
  id: string
  name: string
  teacher_id?: string
  capacity?: number
  created_at: string
}

export interface Subject {
  id: string
  name: string
  class_id: string
  teacher_id?: string
  created_at: string
}

export interface Result {
  id: string
  student_id: string
  subject_id: string
  score: number
  grade: string
  remark: string
  session: string
  term: string
  published: boolean
  created_at: string
}

export interface Payment {
  id: string
  student_id: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  description: string
  date: string
  created_at: string
}

export interface Attendance {
  id: string
  student_id: string
  date: string
  status: 'present' | 'absent' | 'late'
  created_at: string
}

export interface Notification {
  id: string
  title: string
  message: string
  target: string
  read: boolean
  created_at: string
}

export interface AcademicSession {
  id: string
  name: string
  start_date: string
  end_date: string
  current: boolean
  created_at: string
}

export interface Term {
  id: string
  name: string
  session_id: string
  current: boolean
  created_at: string
}

export interface Grade {
  letter: string
  min: number
  max: number
  remark: string
}

export const GRADES: Grade[] = [
  { letter: 'A', min: 70, max: 100, remark: 'Excellent' },
  { letter: 'B', min: 60, max: 69, remark: 'Very Good' },
  { letter: 'C', min: 50, max: 59, remark: 'Good' },
  { letter: 'D', min: 45, max: 49, remark: 'Fair' },
  { letter: 'E', min: 40, max: 44, remark: 'Pass' },
  { letter: 'F', min: 0, max: 39, remark: 'Fail' },
]

export interface LoginCredentials {
  email?: string
  password: string
  staff_id?: string
}

export interface ResultSummary {
  student_name: string
  admission_number: string
  class_name: string
  session: string
  term: string
  subjects: {
    name: string
    score: number
    grade: string
    remark: string
  }[]
  total: number
  average: number
  position: number
}
