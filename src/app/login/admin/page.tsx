'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Lock, 
  Eye, 
  EyeOff,
  Shield,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password) {
      toast.error('Please enter the admin password')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Incorrect password')
        setIsLoading(false)
        return
      }

      toast.success('Welcome Admin!')

      // Hard redirect so the middleware re-checks the freshly-set cookie
      window.location.href = '/admin/dashboard'

    } catch (error) {
      toast.error('Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 bg-primary-50 dark:bg-primary-950 rounded-full mb-4">
                <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h1 className="font-display text-2xl font-semibold text-ink dark:text-gray-200">
                Admin Login
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enter the admin password to continue
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter admin password"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
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

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2" />
                    Logging in...
                  </div>
                ) : (
                  <>
                    Login →
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:underline block">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
