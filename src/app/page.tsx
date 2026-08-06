'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Users,
  Award,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Quote,
  UserCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { formatDate } from '@/lib/utils'

// Mock data - replace with real data from API
const quickLinks = [
  { label: 'Result Checker', icon: GraduationCap, href: '/result-checker' }
]

export default function HomePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-milk dark:bg-gray-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-milk/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-11 h-11 bg-ink dark:bg-gray-50 rounded-full flex items-center justify-center">
                <span className="text-milk dark:text-gray-950 font-display font-semibold text-base">GF</span>
              </div>
              <div>
                <h1 className="font-display text-xl font-semibold text-ink dark:text-gray-50 leading-tight tracking-tight">
                  Good Foundation
                </h1>
                <p className="text-xs tracking-wide uppercase text-gray-500 dark:text-gray-400">Group of Schools</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
              <Link href="/about" className="text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About</Link>
              <Link href="/admissions" className="text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Admissions</Link>
              <Link href="/contact" className="text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</Link>
              <Link href="/result-checker" className="text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Check Results</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/result-checker">
                <Button variant="default" size="sm">
                  Results
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero — split panel: wordmark on milk, seal on ink */}
      <section className="pt-20">
        <div className="grid md:grid-cols-2 min-h-[560px]">
          <div className="flex items-center px-6 md:px-16 py-16 bg-milk dark:bg-gray-950">
            <div className="max-w-lg">
              <p className="text-xs tracking-[0.2em] uppercase text-primary-600 dark:text-primary-400 mb-5">
                Est. 2000 &middot; Lafia, Nasarawa State
              </p>
              <h1 className="font-display text-5xl md:text-6xl font-semibold text-ink dark:text-gray-50 leading-[1.05] mb-6">
                Good Foundation
                <br />
                Group of Schools
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-9 font-light">
                Knowledge for Progress — a rigorous, values-led education for every child who walks through our gates.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/result-checker">
                  <Button variant="default" size="lg">
                    Check Results
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Signature element: engraved seal on ink panel, standing in for a photograph */}
          <div className="relative bg-ink dark:bg-gray-900 flex items-center justify-center py-16 px-10 overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(135deg, #F7F5F0 0px, #F7F5F0 1px, transparent 1px, transparent 28px)',
              }}
            />
            <div className="relative flex flex-col items-center text-center">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border border-primary-400/60 flex items-center justify-center mb-8">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border border-primary-400/40 flex items-center justify-center">
                  <span className="font-display text-5xl md:text-6xl text-milk">GF</span>
                </div>
              </div>
              <p className="text-primary-300 text-xs tracking-[0.3em] uppercase mb-2">Excellence &middot; Integrity &middot; Leadership</p>
              <p className="text-gray-400 text-sm max-w-xs">
                Nurturing the leaders of tomorrow, one foundation at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* School Motto & Welcome */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary-50 dark:bg-primary-950 rounded-full mb-6">
              <Quote className="h-7 w-7 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="font-display text-4xl font-semibold text-ink dark:text-gray-50 mb-4">
              Knowledge for Progress
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 font-light italic">
              &ldquo;Empowering the next generation with excellence, integrity, and leadership&rdquo;
            </p>

            <Card className="text-left">
              <CardContent className="p-8">
                <h3 className="font-display text-2xl font-semibold text-ink dark:text-gray-100 mb-4">
                  Principal&apos;s Welcome Message
                </h3>
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-primary-50 dark:bg-primary-950 rounded-full flex items-center justify-center">
                      <UserCircle className="h-16 w-16 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      Welcome to Good Foundation Group of Schools, where we nurture young minds
                      and prepare them for excellence in a rapidly changing world. Our commitment to
                      holistic education ensures that every student develops academically, socially,
                      and spiritually.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      We invite you to explore our website and discover the opportunities that await
                      your child at Good Foundation.
                    </p>
                    <p className="mt-4 font-semibold text-ink dark:text-gray-200">
                      - Mr Audu Ejeh 
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Principal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-semibold text-ink dark:text-gray-200 text-center mb-8">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-md mx-auto">
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

      {/* Admissions CTA */}
      <section className="py-20 bg-ink dark:bg-gray-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-semibold text-milk mb-4">
            Ready to Join Good Foundation?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto font-light">
            Enroll your child today and give them the gift of quality education.
          </p>
          <Button
            variant="default"
            size="lg"
            onClick={() => {
              window.location.href = 'mailto:info@progressschools.edu.ng?subject=Admission%20Inquiry&body=Hello%20Good%20Foundation%2C%0A%0AI%20am%20interested%20in%20applying%20for%20my%20child.'
            }}
          >
            Apply Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-milk rounded-full flex items-center justify-center">
                  <span className="font-display font-semibold text-ink">GF</span>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg">Good Foundation</h3>
                  <p className="text-sm text-gray-400">Group of Schools</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Providing quality education and nurturing future leaders since 2000.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                  <span>Behind Tomato Market, Lafia, Nasarawa State, Nigeria</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-primary-400" />
                  <span>07035667900</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-primary-400" />
                  <span>info@progressschools.edu.ng</span>
                </li>
              </ul>
            </div>
         </div>

          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Good Foundation Group of Schools. All rights reserved.</p>
            <p className="mt-1">Knowledge for Progress</p>
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
        </div>
      </footer>
    </div>
  )
}
