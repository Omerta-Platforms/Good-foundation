'use client'

import { useState } from 'react'
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
  X,
  ChevronDown,
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

// Mock data - replace with API calls
const statsData = {
  totalStudents: 2547,
  totalTeachers: 156,
  totalClasses: 45,
  publishedResults: 12,
  revenue: 45300000,
  pendingFees: 3200000
}

const recentStudents = [
  { id: 1, name: 'Adeola Johnson', class: 'SS 3A', admission: 'PIS/24/1001', status: 'Active' },
  { id: 2, name: 'Chidi Okonkwo', class: 'SS 2B', admission: 'PIS/24/1002', status: 'Active' },
  { id: 3, name: 'Fatima Bello', class: 'SS 1C', admission: 'PIS/24/1003', status: 'Active' },
  { id: 4, name: 'Emeka Nwosu', class: 'JS 3A', admission: 'PIS/24/1004', status: 'Active' },
]

const recentPayments = [
  { id: 1, student: 'Adeola Johnson', amount: 150000, date: '2024-02-15', status: 'Paid' },
  { id: 2, student: 'Chidi Okonkwo', amount: 150000, date: '2024-02-14', status: 'Paid' },
  { id: 3, student: 'Fatima Bello', amount: 150000, date: '2024-02-13', status: 'Pending' },
]

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('all')

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
    { id: 'reports', label: 'Reports', icon: FileText },
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
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Admin Portal</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Progress International</p>
              </div>
            </div>
          </div>

          {/* Admin Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">A</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">Admin User</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Super Administrator</p>
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
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors">
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
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Students</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{statsData.totalStudents}</p>
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
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{statsData.totalTeachers}</p>
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
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{statsData.totalClasses}</p>
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
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{statsData.publishedResults}</p>
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
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{formatCurrency(statsData.revenue)}</p>
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
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(statsData.pendingFees)}</p>
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
                placeholder="Search students by name, admission number, or class..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="all">All Classes</option>
                <option value="ss3">SS 3</option>
                <option value="ss2">SS 2</option>
                <option value="ss1">SS 1</option>
                <option value="js3">JS 3</option>
              </select>
              <Button variant="outline" size="sm" className="h-10">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="default" size="sm" className="h-10">
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
                  <ChevronDown className="ml-1 h-4 w-4" />
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
                    {recentStudents.map((student) => (
                      <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800/50">
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{student.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{student.class}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{student.admission}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                            {student.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                              <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                              <Edit className="h-4 w-4 text-blue-500" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments and Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Payments</CardTitle>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{payment.student}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(payment.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(payment.amount)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        payment.status === 'Paid' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Management Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2">
                    <UserPlus className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    <span className="text-sm">Add Student</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2">
                    <GraduationCap className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    <span className="text-sm">Add Teacher</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2">
                    <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    <span className="text-sm">Add Class</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2">
                    <BarChart3 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    <span className="text-sm">Publish Results</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2">
                    <CreditCard className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    <span className="text-sm">Manage Fees</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2">
                    <Bell className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    <span className="text-sm">Send Notification</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
