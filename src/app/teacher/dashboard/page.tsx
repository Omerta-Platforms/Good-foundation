'use client'

import { useState, useEffect } from 'react'
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
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

// Mock data - replace with API calls
const teacherData = {
  id: 'TCH001',
  name: 'Dr. Sarah Johnson',
  staff_id: 'STAFF001',
  subject: 'Mathematics',
  email: 'teacher@progress.edu',
  classes: ['SS 3A', 'SS 3B', 'SS 2A']
}

const students = [
  { id: 1, name: 'John Doe', admission: 'PIS/24/1001', class: 'SS 3A', score: 85, grade: 'A' },
  { id: 2, name: 'Jane Smith', admission: 'PIS/24/1002', class: 'SS 3A', score: 72, grade: 'B' },
  { id: 3, name: 'Michael Johnson', admission: 'PIS/24/1003', class: 'SS 3A', score: 68, grade: 'B' },
  { id: 4, name: 'Sarah Williams', admission: 'PIS/24/1004', class: 'SS 3A', score: 55, grade: 'C' },
  { id: 5, name: 'David Brown', admission: 'PIS/24/1005', class: 'SS 3A', score: 90, grade: 'A' },
]

const subjects = [
  { id: 1, name: 'Mathematics', class: 'SS 3A', students: 35 },
  { id: 2, name: 'Further Mathematics', class: 'SS 3A', students: 20 },
  { id: 3, name: 'Mathematics', class: 'SS 2A', students: 38 },
]

export default function TeacherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedClass, setSelectedClass] = useState('SS 3A')
  const [selectedSubject, setSelectedSubject] = useState('Mathematics')
  const [editingScore, setEditingScore] = useState<number | null>(null)
  const [scores, setScores] = useState(students)
  const [isLoading, setIsLoading] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'classes', label: 'My Classes', icon: BookOpen },
    { id: 'subjects', label: 'Subjects', icon: ClipboardList },
    { id: 'results', label: 'Results Management', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
  ]

  const handleScoreChange = (studentId: number, newScore: number) => {
    setScores(scores.map(s => 
      s.id === studentId 
        ? { 
            ...s, 
            score: newScore,
            grade: calculateGrade(newScore)
          } 
        : s
    ))
  }

  const calculateGrade = (score: number): string => {
    if (score >= 70) return 'A'
    if (score >= 60) return 'B'
    if (score >= 50) return 'C'
    if (score >= 45) return 'D'
    if (score >= 40) return 'E'
    return 'F'
  }

  const handleSaveResults = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Results saved successfully!')
    } catch (error) {
      toast.error('Error saving results')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublishResults = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Results published successfully!')
    } catch (error) {
      toast.error('Error publishing results')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteResult = (studentId: number) => {
    if (confirm('Are you sure you want to delete this result?')) {
      setScores(scores.filter(s => s.id !== studentId))
      toast.success('Result deleted successfully!')
    }
  }

  const handleUploadExcel = () => {
    toast.success('Excel upload functionality will be implemented')
  }

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20',
      B: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20',
      C: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20',
      D: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20',
      E: 'text-red-400 bg-red-50 dark:bg-red-950/20',
      F: 'text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-950/20',
    }
    return colors[grade] || 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'
  }

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
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Teacher Portal</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Progress International</p>
              </div>
            </div>
          </div>

          {/* Teacher Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                  {teacherData.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{teacherData.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">ID: {teacherData.staff_id}</p>
                <p className="text-xs text-primary-600 dark:text-primary-400">{teacherData.subject}</p>
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
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Students</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{students.length}</p>
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Classes</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{teacherData.classes.length}</p>
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Subjects</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{subjects.length}</p>
                  </div>
                  <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Average Score</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">74%</p>
                  </div>
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Class and Subject Selection */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Class
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {teacherData.classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Subject
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.name}>{subj.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" size="sm" className="h-10" onClick={handleUploadExcel}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Excel
              </Button>
              <Button variant="default" size="sm" className="h-10" onClick={handleSaveResults} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save Results
              </Button>
              <Button variant="success" size="sm" className="h-10" onClick={handlePublishResults} disabled={isLoading}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedSubject} - {selectedClass} Results
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
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
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Student Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Admission No</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Score</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Grade</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Remark</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map((student, index) => (
                      <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800/50">
                        <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{student.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{student.admission}</td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={student.score}
                            onChange={(e) => handleScoreChange(student.id, parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(student.grade)}`}>
                            {student.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {student.score >= 70 ? 'Excellent' :
                           student.score >= 60 ? 'Very Good' :
                           student.score >= 50 ? 'Good' :
                           student.score >= 45 ? 'Fair' :
                           student.score >= 40 ? 'Pass' : 'Fail'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                              <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                            <button 
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                              onClick={() => handleDeleteResult(student.id)}
                            >
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

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Upload Results</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Excel/CSV format</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto" onClick={handleUploadExcel}>
                    Upload
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-xl">
                    <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">View Analytics</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Class performance</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-xl">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Student List</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">View all students</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto">
                    View
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
