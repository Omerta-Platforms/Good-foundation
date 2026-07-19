'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  BarChart3,
  Bell, 
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

// Types for Excel imports
interface ExcelRow {
  email: string
  password?: string
  first_name: string
  last_name: string
  admission_number: string
  date_of_birth?: string
  parent_phone?: string
  parent_email?: string
}

interface ResultRow {
  admission_number: string
  score: number
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
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedSession, setSelectedSession] = useState('2024/2025')
  const [selectedTerm, setSelectedTerm] = useState('First Term')
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [showEditResult, setShowEditResult] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [editingResult, setEditingResult] = useState<Result | null>(null)
  const [newStudent, setNewStudent] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    admission_number: '',
    date_of_birth: '',
    parent_phone: '',
    parent_email: ''
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
        toast.error('Your teacher profile could not be found. Please contact the admin.')
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

  // 1. ADD STUDENT
  // Account creation (auth.admin.createUser) requires the service role
  // key, which must never run in the browser. This calls our server
  // API route instead, authenticated with the teacher's own session
  // token so the server can verify they're really logged in.
  const handleAddStudent = async () => {
    if (!newStudent.email || !newStudent.password || !newStudent.first_name || !newStudent.last_name || !newStudent.admission_number) {
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

      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: newStudent.email,
          password: newStudent.password,
          role: 'student',
          firstName: newStudent.first_name,
          lastName: newStudent.last_name,
          admissionNumber: newStudent.admission_number,
          classId: selectedClass,
          dateOfBirth: newStudent.date_of_birth || null,
          parentPhone: newStudent.parent_phone || null,
          parentEmail: newStudent.parent_email || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add student')
      }

      toast.success('Student added successfully! They can now login with their email and password.')
      setShowAddStudent(false)
      setNewStudent({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        admission_number: '',
        date_of_birth: '',
        parent_phone: '',
        parent_email: ''
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
            const response = await fetch('/api/admin/create-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                email: row.email,
                password: row.password || 'password123',
                role: 'student',
                firstName: row.first_name,
                lastName: row.last_name,
                admissionNumber: row.admission_number,
                classId: selectedClass,
                dateOfBirth: row.date_of_birth || null,
                parentPhone: row.parent_phone || null,
                parentEmail: row.parent_email || null,
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

            const score = parseFloat(String(row.score))
            if (isNaN(score) || score < 0 || score > 100) {
              errorCount++
              console.error('Invalid score:', row.score)
              continue
            }

            const grade = calculateGrade(score)
            const remark = getRemark(score)

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
              await supabase
                .from('results')
                .update({
                  score: score,
                  grade: grade,
                  remark: remark
                })
                .eq('id', existing.id)
            } else {
              // Insert new result
              await supabase.from('results').insert({
                student_id: student.id,
                subject_id: selectedSubject,
                score: score,
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
        fetchResults()
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
      fetchResults()

    } catch (error: any) {
      toast.error(error.message || 'Failed to publish results')
    } finally {
      setLoading(false)
    }
  }

  // 6. EDIT RESULT
  const handleEditResult = async () => {
    if (!editingResult) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('results')
        .update({
          score: editingResult.score,
          grade: calculateGrade(editingResult.score),
          remark: getRemark(editingResult.score)
        })
        .eq('id', editingResult.id)

      if (error) throw error

      toast.success('Result updated successfully!')
      setShowEditResult(false)
      setEditingResult(null)
      fetchResults()

    } catch (error: any) {
      toast.error(error.message || 'Failed to update result')
    } finally {
      setLoading(false)
    }
  }

  // 7. DELETE RESULT
  const handleDeleteResult = async (resultId: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('results')
        .delete()
        .eq('id', resultId)

      if (error) throw error

      toast.success('Result deleted successfully!')
      fetchResults()

    } catch (error: any) {
      toast.error(error.message || 'Failed to delete result')
    } finally {
      setLoading(false)
    }
  }

  // 8. DOWNLOAD RESULT TEMPLATE
  const downloadResultTemplate = () => {
    const template = [
      { admission_number: 'PIS/24/0001', score: 85 },
      { admission_number: 'PIS/24/0002', score: 72 },
      { admission_number: 'PIS/24/0003', score: 68 }
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
                  <span className="text-white font-bold text-sm">PI</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Teacher Portal</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Progress International</p>
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
                    if (item.id === 'results') fetchResults()
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
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
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
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Upload Results</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Upload Excel results</p>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => { setActiveTab('results'); handlePublishResults(); }}
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
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Class</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students
                          .filter(s => 
                            `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.admission_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.email?.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((student, index) => (
                            <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800/50">
                              <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                              <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                                {student.first_name} {student.last_name}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{student.admission_number}</td>
                              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{student.email || 'Not set'}</td>
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
                            <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            type="email"
                            placeholder="student@email.com"
                            className="pl-10"
                            value={newStudent.email}
                            onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            type="password"
                            placeholder="Min 6 characters"
                            className="pl-10"
                            value={newStudent.password}
                            onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admission Number *</label>
                        <Input
                          placeholder="PIS/24/0001"
                          value={newStudent.admission_number}
                          onChange={(e) => setNewStudent({...newStudent, admission_number: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                        <Input
                          type="date"
                          value={newStudent.date_of_birth}
                          onChange={(e) => setNewStudent({...newStudent, date_of_birth: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Phone</label>
                        <Input
                          placeholder="+234 800 123 4567"
                          value={newStudent.parent_phone}
                          onChange={(e) => setNewStudent({...newStudent, parent_phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Email</label>
                        <Input
                          type="email"
                          placeholder="parent@email.com"
                          value={newStudent.parent_email}
                          onChange={(e) => setNewStudent({...newStudent, parent_email: e.target.value})}
                        />
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
                            fetchResults()
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
                      if (e.target.value) fetchResults()
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
                      if (selectedSubject) fetchResults()
                    }}
                  >
                    <option value="2024/2025">2024/2025</option>
                    <option value="2023/2024">2023/2024</option>
                    <option value="2022/2023">2022/2023</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Term</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={selectedTerm}
                    onChange={(e) => {
                      setSelectedTerm(e.target.value)
                      if (selectedSubject) fetchResults()
                    }}
                  >
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Third Term">Third Term</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => document.getElementById('resultUpload')?.click()}>
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
                  <Button variant="success" onClick={handlePublishResults} disabled={loading || !selectedSubject}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Publish All
                  </Button>
                </div>
              </div>

              {/* Results Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Results {selectedSubject && subjects.find(s => s.id === selectedSubject)?.name} 
                      ({results.length} students)
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => fetchResults()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">#</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Student</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Admission No</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Score</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Grade</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Remark</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((result, index) => (
                          <tr key={result.id} className="border-b border-gray-100 dark:border-gray-800/50">
                            <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                            <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                              {result.student?.first_name} {result.student?.last_name}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                              {result.student?.admission_number}
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {result.score}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(result.grade)}`}>
                                {result.grade}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{result.remark}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                result.published 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}>
                                {result.published ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingResult(result)
                                    setShowEditResult(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteResult(result.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {results.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-gray-500 dark:text-gray-400">
                              {selectedSubject 
                                ? 'No results found for this subject. Upload results to get started.'
                                : 'Select a subject to view results.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Edit Result Modal */}
              {showEditResult && editingResult && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        Edit Result
                      </h2>
                      <button 
                        onClick={() => {
                          setShowEditResult(false)
                          setEditingResult(null)
                        }} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Student: <span className="font-medium text-gray-800 dark:text-gray-200">
                            {editingResult.student?.first_name} {editingResult.student?.last_name}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Admission: <span className="font-medium text-gray-800 dark:text-gray-200">
                            {editingResult.student?.admission_number}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Score *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter score (0-100)"
                          value={editingResult.score}
                          onChange={(e) => setEditingResult({
                            ...editingResult,
                            score: parseInt(e.target.value) || 0
                          })}
                        />
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Grade: <span className={`font-semibold ${getGradeColor(calculateGrade(editingResult.score))}`}>
                            {calculateGrade(editingResult.score)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Remark: <span className="font-medium text-gray-800 dark:text-gray-200">
                            {getRemark(editingResult.score)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <Button variant="outline" onClick={() => {
                        setShowEditResult(false)
                        setEditingResult(null)
                      }}>Cancel</Button>
                      <Button onClick={handleEditResult} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
