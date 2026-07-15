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
  Home,
  LogOut,
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronRight,
  DollarSign,
  AlertCircle,
  UserPlus,
  ClipboardList,
  CreditCard,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0
  })

  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showAddTeacher, setShowAddTeacher] = useState(false)
  const [showAddClass, setShowAddClass] = useState(false)
  const [showAddSubject, setShowAddSubject] = useState(false)

  const [newStudent, setNewStudent] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    admission_number: '',
    class_id: '',
    date_of_birth: '',
    parent_phone: '',
    parent_email: ''
  })

  const [newTeacher, setNewTeacher] = useState({
    email: '',
    password: '',
    staff_id: '',
    first_name: '',
    last_name: '',
    phone: '',
    subject_id: ''
  })

  const [newClass, setNewClass] = useState({
    name: '',
    teacher_id: '',
    capacity: ''
  })

  const [newSubject, setNewSubject] = useState({
    name: '',
    class_id: '',
    teacher_id: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  // Admin is authorized via a cookie, not a Supabase Auth session, so
  // the anon-key browser client would be blocked by RLS ("authenticated"
  // policies). All admin reads/writes go through our own API routes,
  // which use the service role key server-side after checking the
  // admin_session cookie.
  const fetchData = async () => {
    setLoading(true)
    try {
      const [studentsRes, teachersRes, classesRes, subjectsRes] = await Promise.all([
        fetch('/api/students').then(r => r.json()),
        fetch('/api/teachers').then(r => r.json()),
        fetch('/api/classes').then(r => r.json()),
        fetch('/api/subjects').then(r => r.json()),
      ])

      const studentData = studentsRes.students || []
      const teacherData = teachersRes.teachers || []
      const classData = classesRes.classes || []
      const subjectData = subjectsRes.subjects || []

      setStudents(studentData)
      setTeachers(teacherData)
      setClasses(classData)
      setSubjects(subjectData)

      setStats({
        totalStudents: studentData.length,
        totalTeachers: teacherData.length,
        totalClasses: classData.length
      })

    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // ADD STUDENT - Uses API route (server-side)
  const handleAddStudent = async () => {
    if (!newStudent.email || !newStudent.password || !newStudent.first_name || !newStudent.last_name || !newStudent.admission_number) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newStudent.email,
          password: newStudent.password,
          role: 'student',
          firstName: newStudent.first_name,
          lastName: newStudent.last_name,
          admissionNumber: newStudent.admission_number,
          classId: newStudent.class_id || null,
          dateOfBirth: newStudent.date_of_birth || null,
          parentPhone: newStudent.parent_phone || null,
          parentEmail: newStudent.parent_email || null
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to add student')
        setLoading(false)
        return
      }

      toast.success('Student added successfully')
      setShowAddStudent(false)
      setNewStudent({ email: '', password: '', first_name: '', last_name: '', admission_number: '', class_id: '', date_of_birth: '', parent_phone: '', parent_email: '' })
      fetchData()

    } catch (error: any) {
      console.error('Error adding student:', error)
      toast.error(error.message || 'Failed to add student')
    } finally {
      setLoading(false)
    }
  }

  // ADD TEACHER - Uses API route (server-side)
  const handleAddTeacher = async () => {
    if (!newTeacher.email || !newTeacher.password || !newTeacher.first_name || !newTeacher.last_name || !newTeacher.staff_id) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newTeacher.email,
          password: newTeacher.password,
          role: 'teacher',
          firstName: newTeacher.first_name,
          lastName: newTeacher.last_name,
          staffId: newTeacher.staff_id,
          phone: newTeacher.phone || null,
          subjectId: newTeacher.subject_id || null
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to add teacher')
        setLoading(false)
        return
      }

      toast.success('Teacher added successfully')
      setShowAddTeacher(false)
      setNewTeacher({ email: '', password: '', staff_id: '', first_name: '', last_name: '', phone: '', subject_id: '' })
      fetchData()

    } catch (error: any) {
      console.error('Error adding teacher:', error)
      toast.error(error.message || 'Failed to add teacher')
    } finally {
      setLoading(false)
    }
  }

  // DELETE STUDENT
  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Delete this student?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/students?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete')
      toast.success('Student deleted')
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  // DELETE TEACHER
  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('Delete this teacher?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/teachers?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete')
      toast.success('Teacher deleted')
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  // ADD CLASS
  const handleAddClass = async () => {
    if (!newClass.name) {
      toast.error('Class name is required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClass.name,
          teacher_id: newClass.teacher_id || null,
          capacity: parseInt(newClass.capacity) || null
        })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to add class')

      toast.success('Class added successfully')
      setShowAddClass(false)
      setNewClass({ name: '', teacher_id: '', capacity: '' })
      fetchData()

    } catch (error: any) {
      toast.error(error.message || 'Failed to add class')
    } finally {
      setLoading(false)
    }
  }

  // DELETE CLASS
  const handleDeleteClass = async (id: string) => {
    if (!confirm('Delete this class?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/classes?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete')
      toast.success('Class deleted')
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  // ADD SUBJECT
  const handleAddSubject = async () => {
    if (!newSubject.name || !newSubject.class_id) {
      toast.error('Subject name and class are required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSubject.name,
          class_id: newSubject.class_id,
          teacher_id: newSubject.teacher_id || null
        })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to add subject')

      toast.success('Subject added successfully')
      setShowAddSubject(false)
      setNewSubject({ name: '', class_id: '', teacher_id: '' })
      fetchData()

    } catch (error: any) {
      toast.error(error.message || 'Failed to add subject')
    } finally {
      setLoading(false)
    }
  }

  // DELETE SUBJECT
  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Delete this subject?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/subjects?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete')
      toast.success('Subject deleted')
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'teachers', label: 'Teachers', icon: GraduationCap },
    { id: 'classes', label: 'Classes', icon: BookOpen },
    { id: 'subjects', label: 'Subjects', icon: ClipboardList },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PI</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Admin Portal</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Progress International</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">A</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Super Administrator</p>
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
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
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
                await fetch('/api/admin/login', { method: 'DELETE' })
                window.location.href = '/login/admin'
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 lg:ml-72">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <Bell className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500">Students</p>
                            <p className="text-2xl font-bold">{stats.totalStudents}</p>
                          </div>
                          <Users className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500">Teachers</p>
                            <p className="text-2xl font-bold">{stats.totalTeachers}</p>
                          </div>
                          <GraduationCap className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500">Classes</p>
                            <p className="text-2xl font-bold">{stats.totalClasses}</p>
                          </div>
                          <BookOpen className="h-8 w-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowAddStudent(true)}>
                      <CardContent className="p-4 text-center">
                        <UserPlus className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Add Student</p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowAddTeacher(true)}>
                      <CardContent className="p-4 text-center">
                        <GraduationCap className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Add Teacher</p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowAddClass(true)}>
                      <CardContent className="p-4 text-center">
                        <BookOpen className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Add Class</p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowAddSubject(true)}>
                      <CardContent className="p-4 text-center">
                        <ClipboardList className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Add Subject</p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {activeTab === 'students' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Students ({students.length})</h2>
                    <Button onClick={() => setShowAddStudent(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Add Student
                    </Button>
                  </div>
                  <Card>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-4">Name</th>
                              <th className="text-left py-2 px-4">Admission No</th>
                              <th className="text-left py-2 px-4">Class</th>
                              <th className="text-right py-2 px-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.map((s) => (
                              <tr key={s.id} className="border-b">
                                <td className="py-2 px-4">{s.first_name} {s.last_name}</td>
                                <td className="py-2 px-4">{s.admission_number}</td>
                                <td className="py-2 px-4">{s.class?.name}</td>
                                <td className="py-2 px-4 text-right">
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteStudent(s.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'teachers' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Teachers ({teachers.length})</h2>
                    <Button onClick={() => setShowAddTeacher(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Add Teacher
                    </Button>
                  </div>
                  <Card>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-4">Name</th>
                              <th className="text-left py-2 px-4">Staff ID</th>
                              <th className="text-left py-2 px-4">Email</th>
                              <th className="text-right py-2 px-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {teachers.map((t) => (
                              <tr key={t.id} className="border-b">
                                <td className="py-2 px-4">{t.first_name} {t.last_name}</td>
                                <td className="py-2 px-4">{t.staff_id}</td>
                                <td className="py-2 px-4">{t.email}</td>
                                <td className="py-2 px-4 text-right">
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteTeacher(t.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'classes' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Classes ({classes.length})</h2>
                    <Button onClick={() => setShowAddClass(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Add Class
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {classes.map((c) => (
                      <Card key={c.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold">{c.name}</h3>
                              <p className="text-sm text-gray-500">Capacity: {c.capacity || 'N/A'}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClass(c.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'subjects' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Subjects ({subjects.length})</h2>
                    <Button onClick={() => setShowAddSubject(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Add Subject
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {subjects.map((s) => (
                      <Card key={s.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold">{s.name}</h3>
                              <p className="text-sm text-gray-500">Class: {s.class?.name || 'N/A'}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSubject(s.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ADD STUDENT MODAL */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add Student</h2>
              <button onClick={() => setShowAddStudent(false)}><X className="h-6 w-6" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="First Name *" value={newStudent.first_name} onChange={(e) => setNewStudent({...newStudent, first_name: e.target.value})} />
              <Input placeholder="Last Name *" value={newStudent.last_name} onChange={(e) => setNewStudent({...newStudent, last_name: e.target.value})} />
              <Input placeholder="Email *" type="email" value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} />
              <Input placeholder="Password *" type="password" value={newStudent.password} onChange={(e) => setNewStudent({...newStudent, password: e.target.value})} />
              <Input placeholder="Admission Number *" value={newStudent.admission_number} onChange={(e) => setNewStudent({...newStudent, admission_number: e.target.value})} />
              <select className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-900" value={newStudent.class_id} onChange={(e) => setNewStudent({...newStudent, class_id: e.target.value})}>
                <option value="">Select Class</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Input placeholder="Date of Birth" type="date" value={newStudent.date_of_birth} onChange={(e) => setNewStudent({...newStudent, date_of_birth: e.target.value})} />
              <Input placeholder="Parent Phone" value={newStudent.parent_phone} onChange={(e) => setNewStudent({...newStudent, parent_phone: e.target.value})} />
              <div className="col-span-2">
                <Input placeholder="Parent Email" type="email" value={newStudent.parent_email} onChange={(e) => setNewStudent({...newStudent, parent_email: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddStudent(false)}>Cancel</Button>
              <Button onClick={handleAddStudent} disabled={loading}>{loading ? 'Adding...' : 'Add Student'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TEACHER MODAL */}
      {showAddTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add Teacher</h2>
              <button onClick={() => setShowAddTeacher(false)}><X className="h-6 w-6" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="First Name *" value={newTeacher.first_name} onChange={(e) => setNewTeacher({...newTeacher, first_name: e.target.value})} />
              <Input placeholder="Last Name *" value={newTeacher.last_name} onChange={(e) => setNewTeacher({...newTeacher, last_name: e.target.value})} />
              <Input placeholder="Email *" type="email" value={newTeacher.email} onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})} />
              <Input placeholder="Password *" type="password" value={newTeacher.password} onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})} />
              <Input placeholder="Staff ID *" value={newTeacher.staff_id} onChange={(e) => setNewTeacher({...newTeacher, staff_id: e.target.value})} />
              <Input placeholder="Phone" value={newTeacher.phone} onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})} />
              <div className="col-span-2">
                <select className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900" value={newTeacher.subject_id} onChange={(e) => setNewTeacher({...newTeacher, subject_id: e.target.value})}>
                  <option value="">Select Subject</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddTeacher(false)}>Cancel</Button>
              <Button onClick={handleAddTeacher} disabled={loading}>{loading ? 'Adding...' : 'Add Teacher'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CLASS MODAL */}
      {showAddClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add Class</h2>
              <button onClick={() => setShowAddClass(false)}><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <Input placeholder="Class Name *" value={newClass.name} onChange={(e) => setNewClass({...newClass, name: e.target.value})} />
              <select className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900" value={newClass.teacher_id} onChange={(e) => setNewClass({...newClass, teacher_id: e.target.value})}>
                <option value="">Select Class Teacher</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
              </select>
              <Input placeholder="Capacity" type="number" value={newClass.capacity} onChange={(e) => setNewClass({...newClass, capacity: e.target.value})} />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddClass(false)}>Cancel</Button>
              <Button onClick={handleAddClass} disabled={loading}>{loading ? 'Adding...' : 'Add Class'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SUBJECT MODAL */}
      {showAddSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add Subject</h2>
              <button onClick={() => setShowAddSubject(false)}><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <Input placeholder="Subject Name *" value={newSubject.name} onChange={(e) => setNewSubject({...newSubject, name: e.target.value})} />
              <select className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900" value={newSubject.class_id} onChange={(e) => setNewSubject({...newSubject, class_id: e.target.value})}>
                <option value="">Select Class *</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900" value={newSubject.teacher_id} onChange={(e) => setNewSubject({...newSubject, teacher_id: e.target.value})}>
                <option value="">Select Teacher</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
              </select>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddSubject(false)}>Cancel</Button>
              <Button onClick={handleAddSubject} disabled={loading}>{loading ? 'Adding...' : 'Add Subject'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
