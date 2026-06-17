'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Mail, 
  Lock, 
  User, 
  Building2, 
  Eye, 
  EyeOff,
  GraduationCap,
  Users,
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import toast from 'react-hot-toast'

type UserType = 'student' | 'staff' | 'admin'

export default function LoginPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<UserType>('student')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    staffId: '',
    password: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate authentication - Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Demo credentials
      if (userType === 'student' && formData.email === 'student@progress.edu' && formData.password === 'password') {
        toast.success('Login successful!')
        router.push('/student/dashboard')
      } else if (userType === 'staff' && formData.staffId === 'STAFF001' && formData.password === 'password') {
        toast.success('Login successful!')
        router.push('/teacher/dashboard')
      } else if (userType === 'admin' && formData.email === 'admin@progress.edu' && formData.password === 'password') {
        toast.success('Login successful!')
        router.push('/admin/dashboard')
      } else {
        toast.error('Invalid credentials. Please try again.')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const userTypes = [
    { id: 'student', label: 'Student', icon: GraduationCap, color: 'primary' },
    { id: 'staff', label: 'Staff', icon: Users, color: 'green' },
    { id: 'admin', label: 'Admin', icon: Shield, color: 'purple' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Panel */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-700 to-primary-900 dark:from-primary-800 dark:to-primary-950 p-8 flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">Progress International</h2>
                <p className="text-primary-200 text-sm">Group of Schools</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white">Welcome Back</h3>
              <p className="text-primary-100 text-lg">
                Sign in to access your dashboard, check results, and stay connected with your academic journey.
              </p>

              <div className="space-y-3 mt-8">
                <div className="flex items-center space-x-3 text-primary-100">
                  <CheckCircle className="h-5 w-5 text-primary-300" />
                  <span>Access your academic records</span>
                </div>
                <div className="flex items-center space-x-3 text-primary-100">
                  <CheckCircle className="h-5 w-5 text-primary-300" />
                  <span>Check results and performance</span>
                </div>
                <div className="flex items-center space-x-3 text-primary-100">
                  <CheckCircle className="h-5 w-5 text-primary-300" />
                  <span>View class schedules and events</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-primary-200 text-sm">
            <p>Need help? Contact support at support@progressschools.edu.ng</p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 p-6 md:p-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Sign In
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Choose your role to continue
              </p>
            </div>

            {/* User Type Selection */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {userTypes.map((type) => {
                const Icon = type.icon
                const isSelected = userType === type.id
                const colorClasses = {
                  primary: isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300',
                  green: isSelected ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-gray-200 dark:border-gray-700 hover:border-green-300',
                  purple: isSelected ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }
                const textColors = {
                  primary: isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400',
                  green: isSelected ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400',
                  purple: isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'
                }

                return (
                  <button
                    key={type.id}
                    onClick={() => setUserType(type.id as UserType)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      isSelected ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-950/20` : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <Icon className={`h-6 w-6 mx-auto mb-1 ${
                      isSelected ? `text-${type.color}-600 dark:text-${type.color}-400` : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    <p className={`text-xs font-medium ${
                      isSelected ? `text-${type.color}-600 dark:text-${type.color}-400` : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {type.label}
                    </p>
                  </button>
                )
              })}
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {userType === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      type="email"
                      placeholder="student@progress.edu"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              {userType === 'staff' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Staff ID
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      type="text"
                      placeholder="STAFF001"
                      className="pl-10"
                      value={formData.staffId}
                      onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              {userType === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      type="email"
                      placeholder="admin@progress.edu"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span>Remember me</span>
                </label>
                <Link href="#" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full bg-primary-600 hover:bg-primary-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2" />
                    Signing in...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Demo Credentials:
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="font-medium text-gray-700 dark:text-gray-300">Student</p>
                  <p className="text-gray-500 dark:text-gray-400">student@progress.edu</p>
                  <p className="text-gray-500 dark:text-gray-400">password</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="font-medium text-gray-700 dark:text-gray-300">Staff</p>
                  <p className="text-gray-500 dark:text-gray-400">STAFF001</p>
                  <p className="text-gray-500 dark:text-gray-400">password</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="font-medium text-gray-700 dark:text-gray-300">Admin</p>
                  <p className="text-gray-500 dark:text-gray-400">admin@progress.edu</p>
                  <p className="text-gray-500 dark:text-gray-400">password</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
