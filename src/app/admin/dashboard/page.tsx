'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  Bell, 
  Download,
  Eye,
  Printer,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Home,
  UserPlus,
  ClipboardList,
  CreditCard,
  MessageSquare,
  HelpCircle,
  PieChart,
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  X,
  Mail,
  Lock,
  Phone,
  Calendar as CalendarIcon,
  User,
  School,
  BookOpen as BookOpenIcon,
  Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { formatDate, formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('all')
  const [loading, setLoading] = useState(false)
  
  // Real data from Supabase
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    publishedResults: 0,
    totalRevenue: 0,
    pendingFees: 0
  })
  const [students, setStudents] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])

  // Modal states
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showAddTeacher, setShowAddTeacher] = useState(false)
  const [showAddClass, setShowAddClass] = useState(false)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [showEditStudent, setShowEditStudent] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any>(null)

  // New form states
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

  // Fetch real data on load
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('admin-sidebar')
      const toggleButton = document.getElementById('sidebar-toggle')
      
      if (sidebarOpen && sidebar && !sidebar.contains(event.target as Node) && 
          toggleButton && !toggleButton.contains(event.target as Node)) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sidebarOpen])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Get total students
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
      
      // Get total teachers
      const { count: teacherCount } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true })
      
      // Get total classes
      const { count: classCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
      
      // Get published results
      const { count: resultCount } = await supabase
        .from('results')
        .select('*', { count: 'exact', head: true })
        .eq('published', true)
      
      // Get recent students
      const { data: studentData } = await supabase
        .from('students')
        .select('*, class:classes(name)')
        .order('created_at', { ascending: false })
        .limit(10)
      
      // Get all teachers
      const { data: teacherData } = await supabase
        .from('teachers')
        .select('*, subject:subjects(name)')
      
      // Get recent payments
      const { data: paymentData } = await supabase
        .from('payments')
        .select('*, student:students(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5)
      
      // Get total revenue
      const { data: revenueData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid')
      
      const totalRevenue = revenueData?.reduce((sum, p) => sum + p.amount, 0) || 0
      
      // Get pending fees
      const { data: pendingData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'pending')
      
      const pendingFees = pendingData?.reduce((sum, p) => sum + p.amount, 0) || 0

      // Get classes for filter
      const { data: classData } = await supabase
        .from('classes')
        .select('*')
      
      // Get subjects
      const { data: subjectData } = await supabase
        .from('subjects')
        .select('*, class:classes(name)')
      
      setClasses(classData || [])
      setTeachers(teacherData || [])
      setStudents(studentData || [])
      setPayments(paymentData || [])
      setSubjects(subjectData || [])
      
      setStats({
        totalStudents: studentCount || 0,
        totalTeachers: teacherCount || 0,
        totalClasses: classCount || 0,
        publishedResults: resultCount || 0,
        totalRevenue: totalRevenue,
        pendingFees: pendingFees
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Search students
  const searchStudents = async () => {
    if (!searchQuery) {
      fetchDashboardData()
      return
    }

    setLoading(true)
    try {
      let query = supabase
        .from('students')
        .select('*, class:classes(name)')
      
      if (searchQuery) {
        query = query.or(
          `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,admission_number.ilike.%${searchQuery}%`
        )
      }
      
      if (selectedClass !== 'all') {
        query = query.eq('class_id', selectedClass)
      }
      
      const { data } = await query
      setStudents(data || [])
      
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  // ==================== STUDENT CRUD ====================

  const handleAddStudent = async () => {
    if (!newStudent.email || !newStudent.password || !newStudent.first_name || !newStudent.last_name || !newStudent.admission_number) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: newStudent.email,
        password: newStudent.password,
        email_confirm: true,
        user_metadata: { 
          role: 'student',
          first_name: newStudent.first_name,
          last_name: newStudent.last_name
        }
      })

      if (authError) throw authError

      const { error: studentError } = await supabase
        .from('students')
        .insert({
          id: authUser.user.id,
          email: newStudent.email,
          password: newStudent.password,
          first_name: newStudent.first_name,
          last_name: newStudent.last_name,
          admission_number: newStudent.admission_number,
          class_id: newStudent.class_id || null,
          date_of_birth: newStudent.date_of_birth || null,
          parent_phone: newStudent.parent_phone || null,
          parent_email: newStudent.parent_email || null
        })

      if (studentError) throw studentError

      toast.success('Student added successfully!')
      setShowAddStudent(false)
      setNewStudent({
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
      fetchDashboardData()

    } catch (error: any) {
      toast.error(error.message || 'Failed to add student')
    } finally {
      setLoading(false)
    }
  }

  const handleEditStudent = async () => {
    if (!editingStudent) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('students')
        .update({
          first_name: editingStudent.first_name,
          last_name: editingStudent.last_name,
          email: editingStudent.email,
          admission_number: editingStudent.admission_number,
          class_id: editingStudent.class_id,
          date_of_birth: editingStudent.date_of_birth,
          parent_phone: editingStudent.parent_phone,
          parent_email: editingStudent.parent_email
        })
        .eq('id', editingStudent.id)

      if (error) throw error

      toast.success('Student updated successfully!')
      setShowEditStudent(false)
      setEditingStudent(null)
      fetchDashboardData()

    } catch (error: any) {
      toast.error(error.message || 'Failed to update student')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Student deleted successfully!')
      fetchDashboardData()

    } catch (error: any) {
      toast.error(error.message || 'Failed to delete student')
    } finally {
      setLoading(false)
    }
  }

  // ==================== TEACHER CRUD ====================

  const handleAddTeacher = async () => {
    if (!newTeacher.email || !newTeacher.password || !newTeacher.first_name || !newTeacher.last_name || !newTeacher.staff_id) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: newTeacher.email,
        password: newTeacher.password,
        email_confirm: true,
        user_metadata: { 
          role: 'teacher',
          first_name: newTeacher.first_name,
          last_name: newTeacher.last_name
        }
      })

      if (authError) throw authError

      const { error: teacherError } = await supabase
        .from('teachers')
        .insert({
          id: authUser.user.id,
          email: newTeacher.email,
          staff_id: newTeacher.staff_id,
          password: newTeacher.password,
          first_name: newTeacher.first_name,
          last_name: newTeacher.last_name,
          phone: newTeacher.phone || null,
          subject_id: newTeacher.subject_id || null
        })

      if (teacherError) throw teacherError

      toast.success('Teacher added successfully!')
      setShowAddTeacher(false)
      setNewTeacher({
        email: '',
        password: '',
        staff_id: '',
        first_name: '',
        last_name: '',
        phone: '',
        subject_id: ''
      })
      fetchDashboardData()

    } catch (error: any) {
      toast.error(error.message || 'Failed to add teacher')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Teacher deleted successfully!')
      fetchDashboardData()

    } catch (error: any) {
      toast.error(error.message || 'Failed to delete teacher')
    } finally {
      setLoading(false)
    }
  }

  // ==================== CLASS CRUD ====================

  const handleAddClass = async () => {
    if (!newClass.name) {
      toast.error('Class name is required')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('classes')
        .insert({
          name: newClass.name,
          teacher_id: newClass.teacher_id || null,
          capacity: parseInt(newClass.capacity) || 0
        })

      if (error) throw error

      toast.success('Class added successfully!')
      setShowAddClass(false)
      setNewClass({
        name: '',
        teacher_id: '',
        capacity: ''
      })
      fetchDashboardData()

    } catch (error: any) {
      toast.error(error.message || 'Failed to add class')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Class deleted successfully!')
      fetchDashboardData()

    } catch (error: any) {
      toast.error(error.message || 'Failed to delete class')
    } finally {
      setLoading(false)
    }
  }

  // ==================== SUBJECT CRUD ====================

  const handleAddSubject = async () => {
    if (!newSubject.name || !newSubject.class_id) {
      toast.error('Subject name and class are required')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('subjects')
        .insert({
          name: newSubject.name,
          class_id: newSubject.class_id,
          teacher_id: newSubject.teacher_id || null
        })

      if (error) throw error

      toast.success('Subject added successfully!')
      setShowAddSubject(false)
      setNewSubject({
        name: '',
        class_id: '',
        teacher_id: ''
      })
      fetchDashboardData()

    } catch (error: any) {
      toast.error(error.message || 'Failed to add subject')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Subject deleted successfully!')
      fetchDashboardData()

    } catch (error: any) {
      toast.error(error.message || 'Failed to delete subject')
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
    { id: 'results', label: 'Results', icon: BarChart3 },
    { id: 'fees', label: 'Fees', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <aside 
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
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
                  onClick={() => {
                    setActiveTab(item.id)
                    if (item.id === 'dashboard') fetchDashboardData()
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
                router.push('/login/admin')
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay - click to close sidebar on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-4">
              <button
                id="sidebar-toggle"
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {sidebarOpen ? <X className="h-6 w-6 text-gray-600 dark:text-gray-400" /> : <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />}
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
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Students</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{stats.totalStudents}</p>
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
                            <p className="text-xs text-gray-500 dark:text-gray-400">Teachers</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{stats.totalTeachers}</p>
                          </div>
                          <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Classes</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{stats.totalClasses}</p>
                          </div>
                          <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                            <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Results Published</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{stats.publishedResults}</p>
                          </div>
                          <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                            <BarChart3 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{formatCurrency(stats.totalRevenue)}</p>
                          </div>
                          <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Pending Fees</p>
                            <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(stats.pendingFees)}</p>
                          </div>
                          <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowAddStudent(true)}>
                      <CardContent className="p-4 text-center">
                        <UserPlus className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Add Student</p>
                      </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowAddTeacher(true)}>
                      <CardContent className="p-4 text-center">
                        <GraduationCap className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Add Teacher</p>
                      </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowAddClass(true)}>
                      <CardContent className="p-4 text-center">
                        <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Add Class</p>
                      </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowAddSubject(true)}>
                      <CardContent className="p-4 text-center">
                        <ClipboardList className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Add Subject</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Students */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Recent Students</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('students')}>
                          View All
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Admission No</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Class</th>
                              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.slice(0, 5).map((student) => (
                              <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800/50">
                                <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                                  {student.first_name} {student.last_name}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{student.admission_number}</td>
                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{student.class?.name}</td>
                                <td className="py-3 px-4 text-right">
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    setEditingStudent(student)
                                    setShowEditStudent(true)
                                  }}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteStudent(student.id)}>
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
                </>
              )}

              {/* STUDENTS TAB */}
              {activeTab === 'students' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">All Students ({students.length})</h2>
                    <Button onClick={() => setShowAddStudent(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search students..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchStudents()}
                      />
                    </div>
                    <select
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      <option value="all">All Classes</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                    <Button variant="outline" onClick={searchStudents}>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>

                  <Card>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Admission No</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Class</th>
                              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.map((student) => (
                              <tr key={student.id} className="border-b border-gray-100">
                                <td className="py-3 px-4 text-sm text-gray-800">
                                  {student.first_name} {student.last_name}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">{student.admission_number}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{student.email}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{student.class?.name}</td>
                                <td className="py-3 px-4 text-right">
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    setEditingStudent(student)
                                    setShowEditStudent(true)
                                  }}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteStudent(student.id)}>
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

              {/* TEACHERS TAB */}
              {activeTab === 'teachers' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">All Teachers ({teachers.length})</h2>
                    <Button onClick={() => setShowAddTeacher(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Teacher
                    </Button>
                  </div>

                  <Card>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Staff ID</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Subject</th>
                              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {teachers.map((teacher) => (
                              <tr key={teacher.id} className="border-b border-gray-100">
                                <td className="py-3 px-4 text-sm text-gray-800">
                                  {teacher.first_name} {teacher.last_name}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">{teacher.staff_id}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{teacher.email}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{teacher.subject?.name || 'Not assigned'}</td>
                                <td className="py-3 px-4 text-right">
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteTeacher(teacher.id)}>
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

              {/* CLASSES TAB */}
              {activeTab === 'classes' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">All Classes ({classes.length})</h2>
                    <Button onClick={() => setShowAddClass(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Class
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((cls) => (
                      <Card key={cls.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{cls.name}</h3>
                              <p className="text-sm text-gray-500">Capacity: {cls.capacity || 'Not set'}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClass(cls.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBJECTS TAB */}
              {activeTab === 'subjects' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">All Subjects ({subjects.length})</h2>
                    <Button onClick={() => setShowAddSubject(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subject
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((subject) => (
                      <Card key={subject.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{subject.name}</h3>
                              <p className="text-sm text-gray-500">Class: {subject.class?.name || 'Not assigned'}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSubject(subject.id)}>
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

      {/* ==================== MODALS ==================== */}

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Add New Student</h2>
              <button onClick={() => setShowAddStudent(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                <Input value={newStudent.first_name} onChange={(e) => setNewStudent({...newStudent, first_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                <Input value={newStudent.last_name} onChange={(e) => setNewStudent({...newStudent, last_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <Input type="email" value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                <Input type="password" value={newStudent.password} onChange={(e) => setNewStudent({...newStudent, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admission Number *</label>
                <Input value={newStudent.admission_number} onChange={(e) => setNewStudent({...newStudent, admission_number: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
                <select className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900" value={newStudent.class_id} onChange={(e) => setNewStudent({...newStudent, class_id: e.target.value})}>
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                <Input type="date" value={newStudent.date_of_birth} onChange={(e) => setNewStudent({...newStudent, date_of_birth: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Phone</label>
                <Input value={newStudent.parent_phone} onChange={(e) => setNewStudent({...newStudent, parent_phone: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Email</label>
                <Input type="email" value={newStudent.parent_email} onChange={(e) => setNewStudent({...newStudent, parent_email: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddStudent(false)}>Cancel</Button>
              <Button onClick={handleAddStudent} disabled={loading}>{loading ? 'Adding...' : 'Add Student'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditStudent && editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Edit Student</h2>
              <button onClick={() => { setShowEditStudent(false); setEditingStudent(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                <Input value={editingStudent.first_name} onChange={(e) => setEditingStudent({...editingStudent, first_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                <Input value={editingStudent.last_name} onChange={(e) => setEditingStudent({...editingStudent, last_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <Input type="email" value={editingStudent.email} onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admission Number *</label>
                <Input value={editingStudent.admission_number} onChange={(e) => setEditingStudent({...editingStudent, admission_number: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
                <select className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900" value={editingStudent.class_id || ''} onChange={(e) => setEditingStudent({...editingStudent, class_id: e.target.value})}>
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                <Input type="date" value={editingStudent.date_of_birth || ''} onChange={(e) => setEditingStudent({...editingStudent, date_of_birth: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Phone</label>
                <Input value={editingStudent.parent_phone || ''} onChange={(e) => setEditingStudent({...editingStudent, parent_phone: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Email</label>
                <Input type="email" value={editingStudent.parent_email || ''} onChange={(e) => setEditingStudent({...editingStudent, parent_email: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => { setShowEditStudent(false); setEditingStudent(null); }}>Cancel</Button>
              <Button onClick={handleEditStudent} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Add New Teacher</h2>
              <button onClick={() => setShowAddTeacher(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                <Input value={newTeacher.first_name} onChange={(e) => setNewTeacher({...newTeacher, first_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                <Input value={newTeacher.last_name} onChange={(e) => setNewTeacher({...newTeacher, last_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <Input type="email" value={newTeacher.email} onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                <Input type="password" value={newTeacher.password} onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Staff ID *</label>
                <Input value={newTeacher.staff_id} onChange={(e) => setNewTeacher({...newTeacher, staff_id: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <Input value={newTeacher.phone} onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <select className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900" value={newTeacher.subject_id} onChange={(e) => setNewTeacher({...newTeacher, subject_id: e.target.value})}>
                  <option value="">Select Subject</option>
                  {subjects.map((subj) => (
                    <option key={subj.id} value={subj.id}>{subj.name}</option>
                  ))}
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

      {/* Add Class Modal */}
      {showAddClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Add New Class</h2>
              <button onClick={() => setShowAddClass(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class Name *</label>
                <Input value={newClass.name} onChange={(e) => setNewClass({...newClass, name: e.target.value})} placeholder="e.g., SS 3A" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class Teacher</label>
                <select className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900" value={newClass.teacher_id} onChange={(e) => setNewClass({...newClass, teacher_id: e.target.value})}>
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>{teacher.first_name} {teacher.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity</label>
                <Input type="number" value={newClass.capacity} onChange={(e) => setNewClass({...newClass, capacity: e.target.value})} placeholder="e.g., 40" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddClass(false)}>Cancel</Button>
              <Button onClick={handleAddClass} disabled={loading}>{loading ? 'Adding...' : 'Add Class'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Add New Subject</h2>
              <button onClick={() => setShowAddSubject(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Name *</label>
                <Input value={newSubject.name} onChange={(e) => setNewSubject({...newSubject, name: e.target.value})} placeholder="e.g., Mathematics" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class *</label>
                <select className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900" value={newSubject.class_id} onChange={(e) => setNewSubject({...newSubject, class_id: e.target.value})}>
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teacher</label>
                <select className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900" value={newSubject.teacher_id} onChange={(e) => setNewSubject({...newSubject, teacher_id: e.target.value})}>
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>{teacher.first_name} {teacher.last_name}</option>
                  ))}
                </select>
              </div>
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
