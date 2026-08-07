'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  BarChart3,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  Settings,
  LogOut,
  Menu,
  Home,
  ClipboardList,
  FileText,
  Upload,
  Printer,
  Search,
  Filter,
  ChevronDown,
  X,
  Save,
  RefreshCw,
  UserPlus,
  Mail,
  Lock,
  Calendar,
  BookPlus,
  MessageSquare,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'

// Types
interface Student {
  id: string
  email: string
  first_name: string
  last_name: string
  admission_number: string
  class_id: string
  class?: { name: string }
  score?: number
  grade?: string
  date_of_birth?: string
  parent_phone?: string
  parent_email?: string
}

interface Subject {
  id: string
  name: string
  class_id: string
  class?: { name: string }
  teacher_id?: string
}

interface Class {
  id: string
  name: string
  teacher_id?: string
}

interface Result {
  id: string
  student_id: string
  subject_id: string
  ca1: number
  ca2: number
  exam_score: number
  score: number
  grade: string
  remark: string
  session: string
  term: string
  published: boolean
  created_at: string
  student?: {
    first_name: string
    last_name: string
    admission_number: string
  }
  subject?: {
    name: string
  }
}

// One row per student in the selected class, for the live entry grid.
// result_id is null until the student has a saved result — the grid
// shows every student regardless of whether they have one yet, so
// teachers fill in blanks instead of hunting for missing rows.
interface GridRow {
  student_id: string
  first_name: string
  last_name: string
  admission_number: string
  result_id: string | null
  ca1: number | ''
  ca2: number | ''
  exam_score: number | ''
  published: boolean
  dirty: boolean
}

// Types for Excel imports
interface ExcelRow {
  first_name: string
  last_name: string
  admission_number: string
  password: string
}

interface ResultRow {
  admission_number: string
  ca1: number
  ca2: number
  exam_score: number
}

interface AcademicSession {
  id: string
  name: string
  current: boolean
  terms: { id: string; name: string; current: boolean }[]
}

export default function TeacherDashboard() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [teacherData, setTeacherData] = useState<any>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedSession, setSelectedSession] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    admission_number: '',
    password: ''
  })
  const [newSubject, setNewSubject] = useState({
    name: '',
    class_id: ''
  })

  // Fetch teacher data on load
  useEffect(() => {
    fetchTeacherData()
  }, [])

  const fetchTeacherData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login/staff')
        return
      }

      // Get teacher info. We fetch the plain teacher row (no nested
      // subject join here) so that a problem with that join can never
      // block classes/students from loading — those are independent
      // of whether the teacher's own profile join succeeds.
      const { data: teacher, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('[teacher/dashboard] Error fetching teacher:', error)
        toast.error(`Failed to load teacher data: ${error.message}`)
      } else if (!teacher) {
        console.error('[teacher/dashboard] No teacher row found for auth user:', user.id)
        toast.error(`No teacher profile found for logged-in user ID: ${user.id}`)
      } else {
        setTeacherData(teacher)
      }

      // Get ALL classes in the school — a teacher can create a student
      // in any class, not just ones formally assigned to them. This
      // runs regardless of whether the teacher-info fetch above
      // succeeded, so a profile problem never blocks "Add Student".
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .order('name')

      if (classError) {
        console.error('[teacher/dashboard] Error fetching classes:', classError)
        toast.error(`Failed to load classes: ${classError.message}`)
      }

      setClasses(classData || [])

      // Get subjects this teacher specifically teaches (subjects stay
      // teacher-specific, unlike classes).
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*, class:classes(name)')
        .eq('teacher_id', user.id)

      if (subjectError) {
        console.error('[teacher/dashboard] Error fetching subjects:', subjectError)
      }

      setSubjects(subjectData || [])

      // Sessions/terms are admin-managed (via /api/sessions) rather than
      // hardcoded, so a newly added session shows up here without a
      // code change. Default to whichever session/term is flagged current.
      try {
        const sessionsRes = await fetch('/api/sessions', { cache: 'no-store' })
        const sessionsJson = await sessionsRes.json()
        const sessionData: AcademicSession[] = sessionsJson.sessions || []
        setAcademicSessions(sessionData)

        const current = sessionData.find((s) => s.current) || sessionData[0]
        if (current) {
          setSelectedSession(current.name)
          const currentTerm = (current.terms || []).find((t) => t.current) || current.terms?.[0]
          if (currentTerm) setSelectedTerm(currentTerm.name)
        }
      } catch (sessionsError) {
        console.error('[teacher/dashboard] Error fetching sessions:', sessionsError)
      }

      if (classData && classData.length > 0) {
        setSelectedClass(classData[0].id)
        fetchStudents(classData[0].id)
      }

    } catch (error) {
      console.error('[teacher/dashboard] Error fetching teacher data:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Fetch students for a class
  const fetchStudents = async (classId: string) => {
    const { data } = await supabase
      .from('students')
      .select('*, class:classes(name)')
      .eq('class_id', classId)

    setStudents(data || [])
  }

  // Fetch results
  const fetchResults = async () => {
    if (!selectedSubject) return

    const { data } = await supabase
      .from('results')
      .select('*, student:students(first_name, last_name, admission_number), subject:subjects(name)')
      .eq('subject_id', selectedSubject)
      .eq('session', selectedSession)
      .eq('term', selectedTerm)

    setResults(data || [])
  }

  // Live entry grid: one row per student in the selected class,
  // pre-filled with any existing result for this subject/session/term
  // so the teacher can see and edit everything in one table instead
  // of downloading/uploading a file.
  const [gridRows, setGridRows] = useState<GridRow[]>([])
  const [gridLoading, setGridLoading] = useState(false)
  const [gridSaving, setGridSaving] = useState(false)

  const fetchGrid = async () => {
    if (!selectedSubject || !selectedClass) return
    setGridLoading(true)
    try {
      const { data: classStudents, error: studentsError } = await supabase
        .from('students')
        .select('id, first_name, last_name, admission_number')
        .eq('class_id', selectedClass)
        .order('first_name')

      if (studentsError) throw studentsError

      const { data: existingResults, error: resultsError } = await supabase
        .from('results')
        .select('id, student_id, ca1, ca2, exam_score, published')
        .eq('subject_id', selectedSubject)
        .eq('session', selectedSession)
        .eq('term', selectedTerm)

      if (resultsError) throw resultsError

      // Keep the plain results list in sync too — it backs the
      // "Results Uploaded" stat on the dashboard tab.
      fetchResults()

      const resultsByStudent = new Map(
        (existingResults || []).map(r => [r.student_id, r])
      )

      const rows: GridRow[] = (classStudents || []).map(s => {
        const existing = resultsByStudent.get(s.id)
        return {
          student_id: s.id,
          first_name: s.first_name,
          last_name: s.last_name,
          admission_number: s.admission_number,
          result_id: existing?.id || null,
          ca1: existing?.ca1 ?? '',
          ca2: existing?.ca2 ?? '',
          exam_score: existing?.exam_score ?? '',
          published: existing?.published || false,
          dirty: false,
        }
      })

      setGridRows(rows)
    } catch (error: any) {
      console.error('Error loading grid:', error)
      toast.error('Failed to load student list')
    } finally {
      setGridLoading(false)
    }
  }

  const updateGridCell = (studentId: string, field: 'ca1' | 'ca2' | 'exam_score', value: string) => {
    setGridRows(prev => prev.map(row => {
      if (row.student_id !== studentId) return row
      const numValue = value === '' ? '' : Math.max(0, Number(value))
      return { ...row, [field]: numValue, dirty: true }
    }))
  }

  const gridRowTotal = (row: GridRow) => {
    const ca1 = row.ca1 === '' ? 0 : row.ca1
    const ca2 = row.ca2 === '' ? 0 : row.ca2
    const exam = row.exam_score === '' ? 0 : row.exam_score
    return ca1 + ca2 + exam
  }

  const handleSaveGrid = async () => {
    const dirtyRows = gridRows.filter(r => r.dirty)
    if (dirtyRows.length === 0) {
      toast('Nothing to save — no scores were changed', { icon: 'ℹ️' })
      return
    }

    // Rows with every field still blank aren't a real entry yet —
    // skip them rather than saving a 0/0/0 result.
    const rowsToSave = dirtyRows.filter(r => r.ca1 !== '' || r.ca2 !== '' || r.exam_score !== '')
    if (rowsToSave.length === 0) {
      toast('Nothing to save — no scores were entered', { icon: 'ℹ️' })
      return
    }

    setGridSaving(true)
    let successCount = 0
    let errorCount = 0

    for (const row of rowsToSave) {
      try {
        const ca1 = row.ca1 === '' ? 0 : row.ca1
        const ca2 = row.ca2 === '' ? 0 : row.ca2
        const examScore = row.exam_score === '' ? 0 : row.exam_score
        const total = ca1 + ca2 + examScore
        const grade = calculateGrade(total)
        const remark = getRemark(total)

        if (row.result_id) {
          const { error } = await supabase
            .from('results')
            .update({ ca1, ca2, exam_score: examScore, grade, remark })
            .eq('id', row.result_id)
          if (error) throw error
        } else {
          const { error } = await supabase.from('results').insert({
            student_id: row.student_id,
            subject_id: selectedSubject,
            ca1,
            ca2,
            exam_score: examScore,
            grade,
            remark,
            session: selectedSession,
            term: selectedTerm,
            published: false,
          })
          if (error) throw error
        }
        successCount++
      } catch (error) {
        console.error('Error saving result for student:', row.student_id, error)
        errorCount++
      }
    }

    setGridSaving(false)

    if (successCount > 0) {
      toast.success(`Saved ${successCount} result${successCount === 1 ? '' : 's'}${errorCount > 0 ? `, ${errorCount} failed` : ''}`)
    } else {
      toast.error('Failed to save results')
    }

    fetchGrid()
  }

  // 1. ADD STUDENT
  // Students have no login account (only the public result checker,
  // looked up by admission_number, is used), so this is a plain table
  // insert via /api/students — no Supabase Auth account is created.
  const handleAddStudent = async () => {
    if (!newStudent.first_name || !newStudent.last_name || !newStudent.admission_number || !newStudent.password) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!selectedClass) {
      toast.error('Please select a class first')
      return
    }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Your session expired. Please log in again.')
        router.push('/login/staff')
        return
      }

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          firstName: newStudent.first_name,
          lastName: newStudent.last_name,
          admissionNumber: newStudent.admission_number,
          classId: selectedClass,
          password: newStudent.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add student')
      }

      toast.success('Student added successfully')
      setShowAddStudent(false)
      setNewStudent({
        first_name: '',
        last_name: '',
        admission_number: '',
        password: ''
      })
      fetchStudents(selectedClass)

    } catch (error: any) {
      console.error('Error adding student:', error)
      toast.error(error.message || 'Failed to add student')
    } finally {
      setLoading(false)
    }
  }

  // 2. BULK UPLOAD STUDENTS
  const handleBulkUploadStudents = async (file: File) => {
    setLoading(true)
    try {
      const reader = new FileReader()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Your session expired. Please log in again.')
        router.push('/login/staff')
        setLoading(false)
        return
      }

      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(sheet)

        let successCount = 0
        let errorCount = 0

        for (const row of jsonData) {
          try {
            if (!row.password) {
              errorCount++
              console.error('Missing password for row:', row)
              continue
            }

            const response = await fetch('/api/students', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                firstName: row.first_name,
                lastName: row.last_name,
                admissionNumber: row.admission_number,
                classId: selectedClass,
                password: row.password,
              }),
            })

            if (!response.ok) {
              const data = await response.json()
              throw new Error(data.error || 'Failed to create student')
            }

            successCount++
          } catch (err) {
            errorCount++
            console.error('Error importing student:', row, err)
          }
        }

        toast.success(`Imported ${successCount} students${errorCount > 0 ? `, ${errorCount} failed` : ''}`)
        fetchStudents(selectedClass)
        setLoading(false)
      }
      reader.readAsArrayBuffer(file)
    } catch (error) {
      toast.error('Failed to import students')
      setLoading(false)
    }
  }

  // 3. ADD SUBJECT
  const handleAddSubject = async () => {
    if (!newSubject.name || !newSubject.class_id) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('subjects')
        .insert({
          name: newSubject.name,
          class_id: newSubject.class_id,
          teacher_id: user?.id
        })

      if (error) throw error

      toast.success('Subject created successfully!')
      setShowAddSubject(false)
      setNewSubject({ name: '', class_id: '' })
      
      // Refresh subjects
      const { data } = await supabase
        .from('subjects')
        .select('*, class:classes(name)')
        .eq('teacher_id', user?.id)
      setSubjects(data || [])

    } catch (error: any) {
      toast.error(error.message || 'Failed to create subject')
    } finally {
      setLoading(false)
    }
  }

  // 4. UPLOAD RESULTS (Excel)
  const handleUploadResults = async (file: File) => {
    if (!selectedSubject) {
      toast.error('Please select a subject first')
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData: ResultRow[] = XLSX.utils.sheet_to_json(sheet)

        let successCount = 0
        let errorCount = 0

        for (const row of jsonData) {
          try {
            // Find student by admission number
            const { data: student } = await supabase
              .from('students')
              .select('id')
              .eq('admission_number', row.admission_number)
              .single()

            if (!student) {
              errorCount++
              console.error('Student not found:', row.admission_number)
              continue
            }

            const ca1 = parseFloat(String(row.ca1))
            const ca2 = parseFloat(String(row.ca2))
            const examScore = parseFloat(String(row.exam_score))

            if (
              isNaN(ca1) || ca1 < 0 || ca1 > 20 ||
              isNaN(ca2) || ca2 < 0 || ca2 > 20 ||
              isNaN(examScore) || examScore < 0 || examScore > 60
            ) {
              errorCount++
              console.error('Invalid CA1/CA2/Exam score:', row)
              continue
            }

            const totalScore = ca1 + ca2 + examScore
            const grade = calculateGrade(totalScore)
            const remark = getRemark(totalScore)

            // Check if result already exists
            const { data: existing } = await supabase
              .from('results')
              .select('id')
              .eq('student_id', student.id)
              .eq('subject_id', selectedSubject)
              .eq('session', selectedSession)
              .eq('term', selectedTerm)
              .single()

            if (existing) {
              // Update existing result
              // (score is a generated column — updating ca1/ca2/exam_score
              // is enough for it to recompute automatically)
              await supabase
                .from('results')
                .update({
                  ca1,
                  ca2,
                  exam_score: examScore,
                  grade: grade,
                  remark: remark
                })
                .eq('id', existing.id)
            } else {
              // Insert new result
              await supabase.from('results').insert({
                student_id: student.id,
                subject_id: selectedSubject,
                ca1,
                ca2,
                exam_score: examScore,
                grade: grade,
                remark: remark,
                session: selectedSession,
                term: selectedTerm,
                published: false
              })
            }

            successCount++
          } catch (err) {
            errorCount++
            console.error('Error importing result:', row, err)
          }
        }

        toast.success(`Uploaded ${successCount} results${errorCount > 0 ? `, ${errorCount} failed` : ''}`)
        fetchGrid()
      }
      reader.readAsArrayBuffer(file)
    } catch (error) {
      toast.error('Failed to upload results')
    } finally {
      setLoading(false)
    }
  }

  // 5. PUBLISH RESULTS
  const handlePublishResults = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('results')
        .update({ published: true })
        .eq('subject_id', selectedSubject)
        .eq('session', selectedSession)
        .eq('term', selectedTerm)

      if (error) throw error

      toast.success('Results published successfully! Students can now view them.')
      fetchGrid()

    } catch (error: any) {
      toast.error(error.message || 'Failed to publish results')
    } finally {
      setLoading(false)
    }
  }

  // 8. DOWNLOAD RESULT TEMPLATE
  const downloadResultTemplate = () => {
    const template = [
      { admission_number: 'PIS/24/0001', ca1: 18, ca2: 17, exam_score: 55 },
      { admission_number: 'PIS/24/0002', ca1: 15, ca2: 14, exam_score: 48 },
      { admission_number: 'PIS/24/0003', ca1: 12, ca2: 13, exam_score: 40 }
    ]
    
    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Results')
    XLSX.writeFile(wb, `results_template_${new Date().getTime()}.xlsx`)
    toast.success('Template downloaded!')
  }

  // Helper functions
  const calculateGrade = (score: number): string => {
    if (score >= 70) return 'A'
    if (score >= 60) return 'B'
    if (score >= 50) return 'C'
    if (score >= 45) return 'D'
    if (score >= 40) return 'E'
    return 'F'
  }

  const getRemark = (score: number): string => {
    if (score >= 70) return 'Excellent'
    if (score >= 60) return 'Very Good'
    if (score >= 50) return 'Good'
    if (score >= 45) return 'Fair'
    if (score >= 40) return 'Pass'
    return 'Fail'
  }

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      B: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      C: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      D: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      E: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      F: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    return colors[grade] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'results', label: 'Results', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Mobile backdrop - tap outside the sidebar to close it */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">GF</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Teacher Portal</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Good Foundation</p>
                </div>
              </div>
              {/* Close button - only needed/shown on mobile where the sidebar overlays content */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                  {teacherData?.first_name?.charAt(0) || 'T'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {teacherData?.first_name} {teacherData?.last_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">ID: {teacherData?.staff_id}</p>
                <p className="text-xs text-primary-600 dark:text-primary-400 truncate">
                  {teacherData?.subject?.name || 'No subject assigned'}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    if (item.id === 'results' && selectedSubject) fetchGrid()
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <button 
              onClick={() => router.push('/')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Back to Website</span>
            </button>
            <button 
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/login/staff')
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Content based on active tab */}
        <main className="p-6 space-y-6">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Students</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{students.length}</p>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">My Subjects</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{subjects.length}</p>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">My Classes</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{classes.length}</p>
                      </div>
                      <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Results Uploaded</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{results.length}</p>
                      </div>
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => { setActiveTab('students'); setShowAddStudent(true); }}
                >
                  <CardContent className="p-6 text-center">
                    <UserPlus className="h-10 w-10 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Add Student</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add a new student</p>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => setActiveTab('subjects')}
                >
                  <CardContent className="p-6 text-center">
                    <BookPlus className="h-10 w-10 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Add Subject</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Create a new subject</p>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => setActiveTab('results')}
                >
                  <CardContent className="p-6 text-center">
                    <Upload className="h-10 w-10 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Enter Results</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Type in scores or upload Excel</p>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => setActiveTab('results')}
                >
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-10 w-10 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Publish Results</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Make results visible</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* STUDENTS TAB */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              {/* Class Selection */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Class</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value)
                      fetchStudents(e.target.value)
                    }}
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={() => setShowAddStudent(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
                <Button variant="outline" onClick={() => document.getElementById('bulkUpload')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload
                </Button>
                <input
                  id="bulkUpload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleBulkUploadStudents(e.target.files[0])
                    }
                  }}
                />
              </div>

              {/* Student List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Students ({students.length})</CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search students..."
                        className="pl-10 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">#</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Admission No</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Class</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students
                          .filter(s => 
                            `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.admission_number.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((student, index) => (
                            <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800/50">
                              <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                              <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                                {student.first_name} {student.last_name}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{student.admission_number}</td>
                              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{student.class?.name}</td>
                              <td className="py-3 px-4 text-right">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        {students.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                              No students in this class. Add students to get started.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Add Student Modal */}
              {showAddStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Add New Student</h2>
                      <button onClick={() => setShowAddStudent(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class *</label>
                        <select
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700"
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                        >
                          <option value="">Select a class</option>
                          {classes.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                        <Input
                          placeholder="First name"
                          value={newStudent.first_name}
                          onChange={(e) => setNewStudent({...newStudent, first_name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                        <Input
                          placeholder="Last name"
                          value={newStudent.last_name}
                          onChange={(e) => setNewStudent({...newStudent, last_name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admission Number *</label>
                        <Input
                          placeholder="GFI/24/0001"
                          value={newStudent.admission_number}
                          onChange={(e) => setNewStudent({...newStudent, admission_number: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Result Checker Password *</label>
                        <Input
                          placeholder="Password for checking results"
                          value={newStudent.password}
                          onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Share this privately with the student/parent — needed alongside the admission number on the public result checker.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <Button variant="outline" onClick={() => setShowAddStudent(false)}>Cancel</Button>
                      <Button onClick={handleAddStudent} disabled={loading}>
                        {loading ? 'Adding...' : 'Add Student'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUBJECTS TAB */}
          {activeTab === 'subjects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">My Subjects</h2>
                <Button onClick={() => setShowAddSubject(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {subject.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {subject.class?.name || 'No class assigned'}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedSubject(subject.id)
                            setActiveTab('results')
                            fetchGrid()
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {subjects.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
                    No subjects assigned. Click "Add Subject" to create one.
                  </div>
                )}
              </div>

              {/* Add Subject Modal */}
              {showAddSubject && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        Add New Subject
                      </h2>
                      <button onClick={() => setShowAddSubject(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Subject Name *
                        </label>
                        <Input
                          placeholder="e.g., Mathematics"
                          value={newSubject.name}
                          onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Class *
                        </label>
                        <select
                          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          value={newSubject.class_id}
                          onChange={(e) => setNewSubject({ ...newSubject, class_id: e.target.value })}
                        >
                          <option value="">Select Class</option>
                          {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <Button variant="outline" onClick={() => setShowAddSubject(false)}>Cancel</Button>
                      <Button onClick={handleAddSubject} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Subject'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RESULTS TAB */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value)
                      if (e.target.value) fetchGrid()
                    }}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subj) => (
                      <option key={subj.id} value={subj.id}>{subj.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={selectedSession}
                    onChange={(e) => {
                      setSelectedSession(e.target.value)
                      setSelectedTerm('')
                      if (selectedSubject) fetchGrid()
                    }}
                  >
                    <option value="">Select Session</option>
                    {academicSessions.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Term</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={selectedTerm}
                    onChange={(e) => {
                      setSelectedTerm(e.target.value)
                      if (selectedSubject) fetchGrid()
                    }}
                    disabled={!selectedSession}
                  >
                    <option value="">Select Term</option>
                    {(academicSessions.find((s) => s.name === selectedSession)?.terms || []).map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Entry Grid */}
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle>
                      {selectedSubject ? subjects.find(s => s.id === selectedSubject)?.name : 'Results'}
                      {gridRows.length > 0 && ` (${gridRows.length} students)`}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => fetchGrid()} disabled={!selectedSubject}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSaveGrid}
                        disabled={!selectedSubject || gridSaving || !gridRows.some(r => r.dirty)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {gridSaving ? 'Saving...' : 'Save All'}
                      </Button>
                      <Button variant="success" onClick={handlePublishResults} disabled={loading || !selectedSubject}>
                        Publish All
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Type scores directly into the table below, then hit Save All. 1st CA and 2nd CA are out of 20, Exam is out of 60.
                  </p>
                </CardHeader>
                <CardContent>
                  {!selectedSubject ? (
                    <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                      Select a subject to start entering results.
                    </p>
                  ) : gridLoading ? (
                    <p className="py-8 text-center text-gray-500 dark:text-gray-400">Loading students...</p>
                  ) : gridRows.length === 0 ? (
                    <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No students in this class yet.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-800">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">#</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Student</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Admission No</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">1st CA</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">2nd CA</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Exam</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Total</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Grade</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gridRows.map((row, index) => {
                            const total = gridRowTotal(row)
                            return (
                              <tr key={row.student_id} className={`border-b border-gray-100 dark:border-gray-800/50 ${row.dirty ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''}`}>
                                <td className="py-2 px-4 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                                <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                  {row.first_name} {row.last_name}
                                </td>
                                <td className="py-2 px-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                  {row.admission_number}
                                </td>
                                <td className="py-2 px-4">
                                  <input
                                    type="number"
                                    min={0}
                                    max={20}
                                    value={row.ca1}
                                    onChange={(e) => updateGridCell(row.student_id, 'ca1', e.target.value)}
                                    className="w-16 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <input
                                    type="number"
                                    min={0}
                                    max={20}
                                    value={row.ca2}
                                    onChange={(e) => updateGridCell(row.student_id, 'ca2', e.target.value)}
                                    className="w-16 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <input
                                    type="number"
                                    min={0}
                                    max={60}
                                    value={row.exam_score}
                                    onChange={(e) => updateGridCell(row.student_id, 'exam_score', e.target.value)}
                                    className="w-16 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  />
                                </td>
                                <td className="py-2 px-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  {total}
                                </td>
                                <td className="py-2 px-4">
                                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getGradeColor(calculateGrade(total))}`}>
                                    {calculateGrade(total)}
                                  </span>
                                </td>
                                <td className="py-2 px-4">
                                  {row.dirty ? (
                                    <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                      Unsaved
                                    </span>
                                  ) : row.published ? (
                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                      Published
                                    </span>
                                  ) : row.result_id ? (
                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                      Draft
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                      Not entered
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Excel upload — secondary option, mainly for bulk-importing
                  historic data rather than routine entry */}
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-500 dark:text-gray-400 select-none">
                  Prefer uploading a spreadsheet instead?
                </summary>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => document.getElementById('resultUpload')?.click()} disabled={!selectedSubject}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Excel
                  </Button>
                  <input
                    id="resultUpload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleUploadResults(e.target.files[0])
                      }
                    }}
                  />
                  <Button variant="outline" onClick={downloadResultTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                </div>
              </details>

              {/* Edit Result Modal */}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
