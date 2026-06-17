'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageSquare,
  User,
  ChevronRight,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import toast from 'react-hot-toast'

const contactInfo = [
  { icon: MapPin, label: 'Address', value: '123 Education Avenue, Lafia, Nasarawa State, Nigeria' },
  { icon: Phone, label: 'Phone', value: '+234 800 123 4567' },
  { icon: Mail, label: 'Email', value: 'info@progressschools.edu.ng' },
  { icon: Clock, label: 'Working Hours', value: 'Monday - Friday: 7:30 AM - 4:00 PM' },
]

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Message sent successfully! We will get back to you soon.')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      toast.error('Error sending message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
                <Link href="/admissions" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Admissions</Link>
                <Link href="/contact" className="text-primary-600 dark:text-primary-400 font-medium">Contact</Link>
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
              Get in Touch
            </h1>
            <p className="text-xl text-primary-100">
              We're here to help. Reach out to us for any inquiries or assistance
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex p-3 bg-primary-50 dark:bg-primary-950 rounded-full mb-4">
                      <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {info.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {info.value}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                    Send Us a Message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <Input
                          type="text"
                          placeholder="Your full name"
                          className="pl-10"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <Input
                          type="email"
                          placeholder="you@email.com"
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subject *
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <Input
                          type="text"
                          placeholder="Subject of your message"
                          className="pl-10"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Message *
                      </label>
                      <textarea
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[150px]"
                        placeholder="Write your message here..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
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
                          Sending...
                        </div>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Social Links */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Connect With Us
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {socialLinks.map((social, index) => {
                      const Icon = social.icon
                      return (
                        <Link
                          key={index}
                          href={social.href}
                          className="flex items-center justify-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{social.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Response */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Quick Response
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">24-Hour Response</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">We respond within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Dedicated Support</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">We're here to help</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Multilingual Support</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">English, Hausa, Yoruba, Igbo</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Google Map */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8">
            Find Us on Map
          </h2>
          <div className="max-w-5xl mx-auto">
            <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Google Maps Integration
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    123 Education Avenue, Lafia, Nasarawa State
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-900 to-primary-700 dark:from-primary-950 dark:to-primary-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Visit Our School
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            We welcome you to visit our campus and see firsthand what makes Progress International special
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/admissions">
              <Button variant="default" size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/20">
                Schedule Visit
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
