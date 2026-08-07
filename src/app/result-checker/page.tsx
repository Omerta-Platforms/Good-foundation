'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from "next/image";
import { 
  Search, 
  Download, 
  Printer, 
  GraduationCap,
  User,
  Lock,
  Calendar,
  BookOpen,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  ChevronRight,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { calculateTotal, calculateAverage } from '@/lib/utils/grading'
import { generateReportCard, downloadPdfBytes } from '@/lib/utils/pdf'

interface CheckedResult {
  student: {
    name: string
    admission_number: string
    class: string
  }
  session: string
  term: string
  subjects: { name: string; ca1: number; ca2: number; exam_score: number; score: number; grade: string; remark: string }[]
  total: number
  average: number
  position: number | null
}

interface AcademicSession {
  id: string
  name: string
  current: boolean
  terms: { id: string; name: string; current: boolean }[]
}

export default function ResultCheckerPage() {
  const [admissionNumber, setAdmissionNumber] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState('')
  const [term, setTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CheckedResult | null>(null)
  const [error, setError] = useState('')
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([])

  // Sessions/terms come from the admin-managed academic_sessions table
  // (via our own API route, since this page has no logged-in Supabase
  // session and RLS would otherwise block a direct read) rather than a
  // hardcoded list, so a newly added session shows up here automatically.
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/sessions', { cache: 'no-store' })
        const data = await res.json()
        const sessionData: AcademicSession[] = data.sessions || []
        setAcademicSessions(sessionData)

        const current = sessionData.find((s) => s.current)
        if (current) {
          setSession(current.name)
          const currentTerm = (current.terms || []).find((t) => t.current)
          if (currentTerm) setTerm(currentTerm.name)
        }
      } catch (err) {
        console.error('[result-checker] Error fetching sessions:', err)
      }
    }
    fetchSessions()
  }, [])

  const selectedSessionTerms = academicSessions.find((s) => s.name === session)?.terms || []

  const handleCheckResult = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setResult(null)

    if (!admissionNumber || !password || !session || !term) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      const { data, error: rpcError } = await supabase.rpc('check_student_results', {
        p_admission_number: admissionNumber.trim(),
        p_password: password,
        p_session: session,
        p_term: term,
      })

      if (rpcError) {
        // The RPC raises a generic "Invalid admission number or
        // password" exception for both a wrong password and an
        // unknown admission number, so this message is safe to show
        // as-is without leaking which one was wrong.
        setError(rpcError.message.includes('Invalid admission number')
          ? 'Invalid admission number or password.'
          : 'Something went wrong. Please try again.')
        return
      }

      if (!data || data.length === 0) {
        setError('No published result found for the details provided. Double-check your admission number, session, and term.')
        return
      }

      const first = data[0]
      const scores = data.map((row: any) => row.score)

      setResult({
        student: {
          name: `${first.first_name} ${first.last_name}`,
          admission_number: first.admission_number,
          class: first.class_name || 'N/A',
        },
        session,
        term,
        subjects: data.map((row: any) => ({
          name: row.subject_name,
          ca1: row.ca1,
          ca2: row.ca2,
          exam_score: row.exam_score,
          score: row.score,
          grade: row.grade,
          remark: row.remark,
        })),
        total: calculateTotal(scores),
        average: calculateAverage(scores),
        position: first.position ?? null,
      })
    } catch (err) {
      console.error('Result checker error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!result) return

    try {
      const pdfBytes = await generateReportCard({
        student_name: result.student.name,
        admission_number: result.student.admission_number,
        class_name: result.student.class,
        session: result.session,
        term: result.term,
        subjects: result.subjects,
        total: result.total,
        average: result.average,
        position: result.position ? ordinal(result.position) : undefined,
      })

      downloadPdfBytes(
        pdfBytes,
        `${result.student.admission_number}-${result.session}-${result.term}-report-card.pdf`.replace(/\s+/g, '-')
      )
    } catch (err) {
      console.error('Error generating report card PDF:', err)
      setError('Failed to generate the PDF. Please try again.')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const ordinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
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

  const getRemarkColor = (remark: string) => {
    if (remark === 'Excellent') return 'text-green-600 dark:text-green-400'
    if (remark === 'Very Good') return 'text-blue-600 dark:text-blue-400'
    if (remark === 'Good') return 'text-yellow-600 dark:text-yellow-400'
    if (remark === 'Fair') return 'text-orange-600 dark:text-orange-400'
    if (remark === 'Pass') return 'text-gray-600 dark:text-gray-400'
    return 'text-red-600 dark:text-red-500'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GF</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary-700 dark:text-primary-400">
                  Good Foundation 
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Group of Schools</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Result Checker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your admission number and academic session to view your results
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleCheckResult} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Admission Number
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <Input
                        type="text"
                        placeholder="e.g., GFI/24/1234"
                        className="pl-10"
                        value={admissionNumber}
                        onChange={(e) => setAdmissionNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <Input
                        type="password"
                        placeholder="Password given by your school"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Academic Session
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <select
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={session}
                        onChange={(e) => {
                          setSession(e.target.value)
                          setTerm('')
                        }}
                        required
                      >
                        <option value="">Select Session</option>
                        {academicSessions.map((s) => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Term
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <select
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        required
                        disabled={!session}
                      >
                        <option value="">Select Term</option>
                        {selectedSessionTerms.map((t) => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
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
                      Checking...
                    </div>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Check Result
                    </>
                  )}
                </Button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Display */}
          {result && (
            <div className="space-y-6">
              {/* Student Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {result.student.name}
                      </h2>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm">
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Admission No:</span> {result.student.admission_number}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Class:</span> {result.student.class}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Session:</span> {result.session}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Term:</span> {result.term}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4 md:mt-0">
                      <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button variant="default" size="sm" onClick={handleDownloadPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Subject</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">1st CA</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">2nd CA</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Exam</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Total</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Grade</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Remark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.subjects.map((subject, index) => (
                          <tr key={index} className="border-b border-gray-100 dark:border-gray-800/50">
                            <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{subject.name}</td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{subject.ca1}</td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{subject.ca2}</td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{subject.exam_score}</td>
                            <td className="py-3 px-4 text-sm font-semibold text-gray-800 dark:text-gray-200">{subject.score}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(subject.grade)}`}>
                                {subject.grade}
                              </span>
                            </td>
                            <td className={`py-3 px-4 text-sm font-medium ${getRemarkColor(subject.remark)}`}>
                              {subject.remark}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Score</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{result.total}</p>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{result.average}%</p>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Subjects</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{result.subjects.length}</p>
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
                        <p className="text-xs text-gray-500 dark:text-gray-400">Class Position</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                          {result.position ? ordinal(result.position) : 'N/A'}
                        </p>
                      </div>
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Grading Scale */}
              <Card>
                <CardHeader>
                  <CardTitle>Grading Scale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {[
                      { grade: 'A', min: 70, max: 100, remark: 'Excellent' },
                      { grade: 'B', min: 60, max: 69, remark: 'Very Good' },
                      { grade: 'C', min: 50, max: 59, remark: 'Good' },
                      { grade: 'D', min: 45, max: 49, remark: 'Fair' },
                      { grade: 'E', min: 40, max: 44, remark: 'Pass' },
                      { grade: 'F', min: 0, max: 39, remark: 'Fail' },
                    ].map((item) => (
                      <div key={item.grade} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className={`text-2xl font-bold ${getGradeColor(item.grade)}`}>{item.grade}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.min} - {item.max}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{item.remark}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Good Foundation Group of Schools. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-1">Knowledge for Progress</p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-3 mt-4">
          <div className="border-t border-gray-800 mt-4 pt-6 text-center text-sm text-gray-400">
            powered by
          </div>
            <Image
              src="/omerta.png"
              alt="origin"
              width={100}
              height={30}
              className="object-contain"
          />
        </div>
      </footer>
    </div>
  )
}
