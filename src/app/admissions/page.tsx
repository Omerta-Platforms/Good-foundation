'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  GraduationCap,
  ChevronRight,
  ArrowRight,
  Check,
  AlertCircle,
  Building2,
  Users,
  Award,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import toast from 'react-hot-toast'

const admissionSteps = [
  { step: 1, title: 'Fill Application Form', description: 'Complete the online application form with required details' },
  { step: 2, title: 'Submit Documents', description: 'Upload required documents including birth certificate and previous reports' },
  { step: 3, title: 'Entrance Assessment', description: 'Take the entrance assessment to determine placement' },
  { step: 4, title: 'Interview', description: 'Interview with school administration' },
  { step: 5, title: 'Admission Offer', description: 'Receive admission offer and complete registration' },
]

const requirements = [
  { icon: FileText, label: 'Birth Certificate', description: 'Original or certified copy' },
  { icon: FileText, label: 'Previous School Reports', description: 'Academic transcripts from last 2 years' },
  { icon: FileText, label: 'Medical Records', description: 'Immunization records and health history' },
  { icon: FileText, label: 'Passport Photos', description: '6 recent passport-sized photographs' },
  { icon: FileText, label: 'Recommendation Letter', description: 'From previous school or community leader' },
  { icon: FileText, label: 'Parent/Guardian ID', description: 'Valid ID of parent or guardian' },
]

const documents = [
  { name: 'Admission Application Form', size: 'PDF, 250KB' },
  { name: 'Student Health Form', size: 'PDF, 180KB' },
  { name: 'Parent Consent Form', size: 'PDF, 150KB' },
  { name: 'Academic Reference Form', size: 'PDF, 200KB' },
  { name: 'Fee Structure Document', size: 'PDF, 320KB' },
]

export default function AdmissionsPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    class: '',
    previousSchool: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Application submitted successfully! We will contact you soon.')
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        address: '',
        class: '',
        previousSchool: '',
        message: ''
      })
    } catch (error) {
      toast.error('Error submitting application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownload = (docName: string) => {
    toast.success(`Downloading ${docName}...`)
    // In production, this would download the actual document
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PI</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary-700 dark:text-primary-400">
                  Progress International
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Group of Schools</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
                <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About</Link>
                <Link href="/admissions" className="text-primary-600 dark:text-primary-400 font-medium">Admissions</Link>
                <Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</Link>
              </nav>
              <ThemeToggle />
              <Link href="/login">
                <Button variant="default" size="sm">
                  Login
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-900 to-primary-700 dark:from-primary-950 dark:to-primary-800 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Admissions
            </h1>
            <p className="text-xl text-primary-100">
              Begin your journey with Progress International Group of Schools
            </p>
          </div>
        </div>
      </section>

      {/* Admission Requirements */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-4">
            Admission Requirements
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Ensure you have all the required documents and meet the qualifications for admission
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Required Documents
              </h3>
              <div className="space-y-4">
                {requirements.map((req, index) => {
                  const Icon = req.icon
                  return (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{req.label}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{req.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Age Requirements
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Nursery School</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Ages 2 - 4 years</p>
                    </div>
                    <GraduationCap className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Primary School</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Ages 5 - 11 years</p>
                    </div>
                    <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Secondary School</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Ages 12 - 18 years</p>
                    </div>
                    <Award className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800 rounded-xl">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">
                      Note: Age requirements are flexible based on assessment results
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admission Steps */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-4">
            Admission Process
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Follow these steps to complete your child's admission to Progress International
          </p>

          <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {admissionSteps.map((step) => (
              <div key={step.step} className="relative">
                <Card className="text-center h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                        {step.step}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-2">
                      {step.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                {step.step < 5 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-gray-300 dark:text-gray-700">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-4">
            Apply Online
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Fill out the application form below and we'll get back to you within 24 hours
          </p>

          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Student's full name"
                      className="pl-10"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Class Applying For *
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <select
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      required
                    >
                      <option value="">Select Class</option>
                      <option value="Nursery 1">Nursery 1</option>
                      <option value="Nursery 2">Nursery 2</option>
                      <option value="Primary 1">Primary 1</option>
                      <option value="Primary 2">Primary 2</option>
                      <option value="Primary 3">Primary 3</option>
                      <option value="Primary 4">Primary 4</option>
                      <option value="Primary 5">Primary 5</option>
                      <option value="JS 1">JS 1</option>
                      <option value="JS 2">JS 2</option>
                      <option value="JS 3">JS 3</option>
                      <option value="SS 1">SS 1</option>
                      <option value="SS 2">SS 2</option>
                      <option value="SS 3">SS 3</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      type="email"
                      placeholder="student@email.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      type="tel"
                      placeholder="+234 800 123 4567"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Parent/Guardian Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Parent's full name"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Parent/Guardian Phone *
                  </label>
                  <Input
                    type="tel"
                    placeholder="+234 800 123 4567"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parent/Guardian Email
                </label>
                <Input
                  type="email"
                  placeholder="parent@email.com"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Home Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <textarea
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]"
                    placeholder="Enter your home address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Previous School
                </label>
                <Input
                  type="text"
                  placeholder="Name of previous school (if any)"
                  value={formData.previousSchool}
                  onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Information
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                  placeholder="Any additional information or special requirements..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full bg-primary-600 hover:bg-primary-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2" />
                    Submitting Application...
                  </div>
                ) : (
                  <>
                    Submit Application
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Download Documents */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-4">
            Download Documents
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Download admission forms and other important documents
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {documents.map((doc, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary-50 dark:bg-primary-950 rounded-xl">
                      <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                        {doc.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{doc.size}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleDownload(doc.name)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-900 to-primary-700 dark:from-primary-950 dark:to-primary-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Apply?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Take the first step towards a brighter future for your child
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="#application-form">
              <Button variant="default" size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/20">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white">PI</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Progress International</h3>
                  <p className="text-sm text-gray-400">Group of Schools</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Providing quality education and nurturing future leaders since 2000.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/admissions" className="hover:text-white transition-colors">Admissions</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/result-checker" className="hover:text-white transition-colors">Check Results</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                  <span>123 Education Avenue, Lafia</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-primary-400" />
                  <span>+234 800 123 4567</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-primary-400" />
                  <span>info@progressschools.edu.ng</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Stay Updated</h4>
              <p className="text-sm text-gray-400 mb-3">
                Subscribe to our newsletter for updates and announcements.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button variant="default" size="sm" className="rounded-l-none bg-primary-600 hover:bg-primary-700">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Progress International Group of Schools. All rights reserved.</p>
            <p className="mt-1">Knowledge for Progress</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
