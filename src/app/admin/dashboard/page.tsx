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
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const [payments, setPayments] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])

  // Fetch real data on load
  useEffect(() => {
    fetchDashboardData()
  }, [])

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
      
      setClasses(classData || [])
      setStudents(studentData || [])
      setPayments(paymentData || [])
      setTeachers([])
      
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
                  onClick={() => setActiveTab(item.id)}
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

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Admin Dashboard
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

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search students by name, admission number..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchStudents()}
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="all">All Classes</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm" className="h-10" onClick={searchStudents}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="default" size="sm" className="h-10" onClick={() => window.location.href = '/admin/students/add'}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                </div>
              </div>

              {/* Recent Students */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Students</CardTitle>
                    <Button variant="outline" size="sm">
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
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Student Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Class</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Admission No</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800/50">
                            <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                              {student.first_name} {student.last_name}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{student.class?.name}</td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{student.admission_number}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                                Active
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                  <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </button>
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {students.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                              No students found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Payments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Payments</CardTitle>
                      <Button variant="outline" size="sm">View All</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {payment.student?.first_name} {payment.student?.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(payment.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(payment.amount)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            payment.status === 'paid' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          }`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {payments.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No payments found
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Link href="/admin/students/add">
                        <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2 w-full">
                          <UserPlus className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                          <span className="text-sm">Add Student</span>
                        </Button>
                      </Link>
                      <Link href="/admin/teachers/add">
                        <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2 w-full">
                          <GraduationCap className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                          <span className="text-sm">Add Teacher</span>
                        </Button>
                      </Link>
                      <Link href="/admin/classes/add">
                        <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2 w-full">
                          <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                          <span className="text-sm">Add Class</span>
                        </Button>
                      </Link>
                      <Link href="/admin/results/publish">
                        <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2 w-full">
                          <BarChart3 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                          <span className="text-sm">Publish Results</span>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
