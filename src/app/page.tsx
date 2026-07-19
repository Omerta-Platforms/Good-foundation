'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Calendar, 
  ChevronRight, 
  Clock, 
  GraduationCap, 
  BookOpen, 
  Users, 
  Award,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ArrowRight,
  Star,
  Quote,
  Building2,
  UserCircle,
  FileText,
  CheckCircle,
  PlayCircle,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { formatDate } from '@/lib/utils'

// Mock data - replace with real data from API
const latestNews = [
  {
    id: 1,
    title: '2024 Academic Session Commences',
    date: '2024-01-15',
    excerpt: 'The 2024 academic session has officially begun with full enrollment across all classes.'
  },
  {
    id: 2,
    title: 'Science Fair 2024',
    date: '2024-02-01',
    excerpt: 'Students showcase innovative projects at the annual Science Fair competition.'
  },
  {
    id: 3,
    title: 'Sports Day Announcement',
    date: '2024-02-15',
    excerpt: 'Annual inter-house sports competition scheduled for March 15th, 2024.'
  }
]

const upcomingEvents = [
  { id: 1, title: 'Parent-Teacher Meeting', date: '2024-03-10' },
  { id: 2, title: 'Mid-Term Break', date: '2024-03-20' },
  { id: 3, title: 'Examination Week', date: '2024-04-01' }
]

const quickLinks = [
  { label: 'Admissions', icon: FileText, href: '/admissions' },
  { label: 'Academic Calendar', icon: Calendar, href: '#' },
  { label: 'Student Portal', icon: UserCircle, href: '/login' },
  { label: 'Result Checker', icon: GraduationCap, href: '/result-checker' }
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Auto-rotate hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const heroSlides = [
    {
      title: 'Excellence in Education',
      subtitle: 'Nurturing the leaders of tomorrow',
      image: '/images/hero1.jpg'
    },
    {
      title: 'Progress International Group of Schools',
      subtitle: 'Knowledge for Progress',
      image: '/images/hero2.jpg'
    },
    {
      title: 'Empowering Young Minds',
      subtitle: 'Building a brighter future',
      image: '/images/hero3.jpg'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">PI</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-700 dark:text-primary-400 leading-tight">
                  Progress International
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Group of Schools</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About</Link>
              <Link href="/admissions" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Admissions</Link>
              <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</Link>
              <Link href="/result-checker" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Check Results</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/result-checker">
                <Button variant="default" size="sm">
                  check results
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 relative overflow-hidden">
        <div className="relative h-[600px] bg-gradient-to-r from-primary-900 to-primary-700 dark:from-primary-950 dark:to-primary-800">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 bg-black/50" />
              <div className="relative container mx-auto px-4 h-full flex items-center">
                <div className="max-w-3xl">
                  <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-xl text-gray-200 mb-8">{slide.subtitle}</p>
                  <div className="flex flex-wrap gap-4">
                    <Link href="/admissions">
                      <Button variant="default" size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
                        Apply Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/about">
                      <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/20">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slide indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* School Motto & Welcome */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary-50 dark:bg-primary-950 rounded-full mb-6">
              <Quote className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-4xl font-bold text-primary-700 dark:text-primary-400 mb-4">
              Knowledge for Progress
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 font-light">
              &ldquo;Empowering the next generation with excellence, integrity, and leadership&rdquo;
            </p>
            
            <Card className="text-left">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Principal&apos;s Welcome Message
                </h3>
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <UserCircle className="h-16 w-16 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      Welcome to Progress International Group of Schools, where we nurture young minds 
                      and prepare them for excellence in a rapidly changing world. Our commitment to 
                      holistic education ensures that every student develops academically, socially, 
                      and spiritually.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      We invite you to explore our website and discover the opportunities that await 
                      your child at Progress International.
                    </p>
                    <p className="mt-4 font-semibold text-gray-800 dark:text-gray-200">
                      - Dr. Adebayo Ogunlade
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Principal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, label: 'Students', value: '2,500+' },
              { icon: GraduationCap, label: 'Graduates', value: '5,000+' },
              { icon: BookOpen, label: 'Subjects', value: '45+' },
              { icon: Award, label: 'Awards', value: '120+' }
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <Icon className="h-10 w-10 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stat.value}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Latest News & Events */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              Latest News &amp; Events
            </h2>
            <Link href="#" className="text-primary-600 dark:text-primary-400 hover:underline flex items-center">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* News */}
            <div className="md:col-span-2">
              <div className="space-y-4">
                {latestNews.map((news) => (
                  <Card key={news.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            {news.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                            {news.excerpt}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(news.date)}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Events */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                    Upcoming Events
                  </h3>
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary-50 dark:bg-primary-950 rounded-lg flex flex-col items-center justify-center">
                          <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-lg font-bold text-primary-700 dark:text-primary-400">
                            {new Date(event.date).getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {event.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(event.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8">
            Quick Links
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link key={link.label} href={link.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex p-3 bg-primary-50 dark:bg-primary-950 rounded-full mb-3 group-hover:bg-primary-100 dark:group-hover:bg-primary-900 transition-colors">
                        <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {link.label}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8">
            School Gallery
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="relative aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImage(`/images/gallery${i}.jpg`)}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent to-black/30">
                  <div className="absolute bottom-2 left-2 text-white text-sm font-medium">
                    Gallery {i}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admissions CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-900 to-primary-700 dark:from-primary-950 dark:to-primary-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join Progress International?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Enroll your child today and give them the gift of quality education.
          </p>
          <Link href="/admissions">
            <Button variant="default" size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* About */}
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
              <div className="flex space-x-3">
                <Link href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <Youtube className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/admissions" className="hover:text-white transition-colors">Admissions</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/result-checker" className="hover:text-white transition-colors">Check Results</Link></li>
              </ul>
            </div>
              
             {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                  <span>123 Education Avenue, Lafia, Nasarawa State, Nigeria</span>
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

            {/* Newsletter */}
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
