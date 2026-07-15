'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
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
  X,
  ChevronDown,
  Home,
  Users,
  ClipboardList,
  CreditCard,
  MessageSquare,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { supabase } from '@/lib/supabase/client'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ResultRow {
  id: string
  score: number
  grade: string
  remark: string
  session: string
  term: string
  subject?: { name: string }
}

export default function StudentDashboard() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(true)

  const [studentData, setStudentData] = useState<any>(null)
  const [recentResults, setRecentResults] = useState<ResultRow[]>([])
  const [attendance, setAttendance] = useState({ present: 0, absent: 0, late: 0, total: 0 })
  const [fees, setFees] = useState({ total: 0, paid: 0, pending: 0 })
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    fetchStudentDashboardData()
  }, [])

  const fetchStudentDashboardData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*, class:classes(name)')
        .eq('id', user.id)
        .single()

      if (studentError || !student) {
        toast.error('Could not load your student profile')
        return
      }

      setStudentData(student)

      // Published results only — students should never see unpublished
      // (draft) results a teacher hasn't finalized yet.
      const { data: results } = await supabase
        .from('results')
        .select('*, subject:subjects(name)')
        .eq('student_id', user.id)
        .eq('published', true)
        .order('created_at', { ascending: false })

      setRecentResults(results || [])

      const { data: attendanceRows } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', user.id)

      if (attendanceRows) {
        setAttendance({
          present: attendanceRows.filter(a => a.status === 'present').length,
          absent: attendanceRows.filter(a => a.status === 'absent').length,
          late: attendanceRows.filter(a => a.status === 'late').length,
          total: attendanceRows.length,
        })
      }

      const { data: paymentRows } = await supabase
        .from('payments')
        .select('amount, status')
        .eq('student_id', user.id)

      if (paymentRows) {
        const total = paymentRows.reduce((sum, p) => sum + Number(p.amount), 0)
        const paid = paymentRows.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0)
        setFees({ total, paid, pending: total - paid })
      }

      const { data: notifRows } = await supabase
        .from('notifications')
        .select('*')
        .in('target', ['all', 'students'])
        .order('created_at', { ascending: false })
        .limit(10)

      setNotifications(notifRows || [])

    } catch (error) {
      console.error('Error loading student dashboard:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const handleDownloadReport = () => {
    toast('Report card download is coming soon', { icon: 'ℹ️' })
  }

  const averageScore = recentResults.length > 0
    ? Math.round(recentResults.reduce((sum, r) => sum + r.score, 0) / recentResults.length)
    : 0

  const attendancePercent = attendance.total > 0
    ? Math.round((attendance.present / attendance.total) * 100)
    : 0

  const feesPercent = fees.total > 0
    ? Math.round((fees.paid / fees.total) * 100)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="spinner" />
      </div>
    )
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'results', label: 'My Results', icon: BarChart3 },
    { id: 'fees', label: 'Fees', icon: CreditCard },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PI</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Student Portal</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Progress International</p>
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {studentData?.first_name} {studentData?.last_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{studentData?.class?.name || 'No class assigned'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">ID: {studentData?.admission_number}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
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

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/login')
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
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Bell className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Attendance</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {attendancePercent}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{averageScore}%</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fees Status</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{feesPercent}%</p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl">
                    <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Subjects</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{recentResults.length}</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-xl">
                    <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Results</CardTitle>
                <Button variant="outline" size="sm">
                  View All
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Subject</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Score</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Grade</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Remark</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentResults.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          No published results yet
                        </td>
                      </tr>
                    ) : recentResults.map((result) => (
                      <tr key={result.id} className="border-b border-gray-100 dark:border-gray-800/50">
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{result.subject?.name}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-800 dark:text-gray-200">{result.score}</td>
                        <td className={`py-3 px-4 text-sm font-semibold grade-${result.grade.toLowerCase()}`}>
                          {result.grade}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{result.remark}</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notifications and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Notifications */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No notifications yet</p>
                  ) : notifications.map((notif) => (
                    <div key={notif.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                      notif.read ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-blue-50 dark:bg-blue-950/20'
                    }`}>
                      <div className={`p-2 rounded-full ${
                        notif.read ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-100 dark:bg-blue-900'
                      }`}>
                        <Bell className={`h-4 w-4 ${
                          notif.read ? 'text-gray-500 dark:text-gray-400' : 'text-blue-600 dark:text-blue-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{notif.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{notif.message}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(notif.created_at)}</p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="default" className="w-full justify-start" onClick={handleDownloadReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report Card
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Results
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    View Full Results
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
