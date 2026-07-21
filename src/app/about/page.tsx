'use client'

import Link from 'next/link'
import Image from 'next/image'
import { 
  Award, 
  Users, 
  BookOpen, 
  Target, 
  Eye, 
  Heart, 
  Shield,
  CheckCircle,
  ChevronRight,
  Building2,
  GraduationCap,
  Calendar,
  Star,
  Quote,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const managementTeam = [
  { name: 'Mr. Michael Obala', position: 'Principal', image: '/images/principal.jpg' },
  { name: 'Mr. Stephen', position: 'Vice Principal (Academics)', image: '/images/vp-academics.jpg' },
  { name: 'Mrs. Ruth Sunday', position: 'Head of Academics', image: '/images/head-academics.jpg' },
  { name: 'Mr. Audu Ejeh', position: 'Technical Designer', image: '/images/head-admin.jpg' },
  { name: 'Mr. Joshua Oghene-Tega', position: 'Head of Students Affairs', image: '/images/head-students.jpg' },
]

const coreValues = [
  { icon: Shield, label: 'Integrity', description: 'Upholding honesty and moral principles in all our endeavors' },
  { icon: Target, label: 'Excellence', description: 'Striving for the highest standards in everything we do' },
  { icon: Heart, label: 'Compassion', description: 'Showing care and understanding to all members of our community' },
  { icon: Users, label: 'Community', description: 'Building a supportive and collaborative learning environment' },
]

const milestones = [
  { year: '2000', title: 'Foundation', description: 'Progress International School was established with 50 students' },
  { year: '2005', title: 'Expansion', description: 'Expanded to include secondary education and new campus' },
  { year: '2010', title: 'Recognition', description: 'Awarded Best Private School in Lafia' },
  { year: '2015', title: 'Technology Integration', description: 'Introduced smart classrooms and digital learning' },
  { year: '2020', title: 'Global Partnership', description: 'Established international exchange programs' },
  { year: '2024', title: 'Excellence', description: 'Celebrating 24 years of educational excellence' },
]

export default function AboutPage() {
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
                <Link href="/about" className="text-primary-600 dark:text-primary-400 font-medium">About</Link>
                <Link href="/admissions" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Admissions</Link>
                <Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</Link>
              </nav>
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-900 to-primary-700 dark:from-primary-950 dark:to-primary-800 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              About Progress International
            </h1>
            <p className="text-xl text-primary-100">
              Committed to excellence in education and holistic development since 2000
            </p>
          </div>
        </div>
      </section>

      {/* School History */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8">
              Our History
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Progress International Group of Schools was founded in the year 2000 with a vision to provide 
                world-class education to the children of Lafia and its environs. What started as a small 
                nursery school with just 50 students has grown into a comprehensive educational institution 
                offering education from preschool through secondary school.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                Over the past two decades, we have consistently maintained our commitment to academic excellence, 
                character development, and holistic education. Our alumni have gone on to excel in various fields 
                including medicine, law, engineering, business, and the arts, both in Nigeria and internationally.
              </p>
            </div>

            {/* Timeline */}
            <div className="mt-12 relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary-200 dark:bg-primary-800"></div>
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="w-1/2 px-4">
                      <div className={`p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{milestone.year}</div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{milestone.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="w-10 flex items-center justify-center">
                      <div className="w-4 h-4 bg-primary-600 dark:bg-primary-400 rounded-full border-4 border-white dark:border-gray-900"></div>
                    </div>
                    <div className="w-1/2 px-4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-primary-50 dark:bg-primary-950 rounded-full">
                    <Target className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Our Mission</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  To provide a nurturing and challenging educational environment that fosters academic excellence, 
                  character development, and lifelong learning, preparing students to become responsible global citizens.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-primary-50 dark:bg-primary-950 rounded-full">
                    <Eye className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Our Vision</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  To be a world-class educational institution that produces exceptional leaders and innovators 
                  who will positively impact society and contribute to the progress of humanity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-12">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {coreValues.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="inline-flex p-3 bg-primary-50 dark:bg-primary-950 rounded-full mb-4">
                      <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      {value.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Management Team */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-4">
            Management Team
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Our dedicated leadership team brings years of experience and passion for education
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {managementTeam.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-32 h-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary-600 dark:text-primary-400">
                    {member.position}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-12">
            Why Choose Progress International?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Academic Excellence</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Consistently high performance in national examinations with students gaining admission to top universities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Modern Facilities</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  State-of-the-art classrooms, laboratories, libraries, and sports facilities for holistic development
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Quality Teachers</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Experienced and qualified educators dedicated to nurturing each student's unique potential
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Character Development</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Strong emphasis on moral values, leadership skills, and community service
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Technology Integration</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Smart classrooms, digital learning resources, and technology-enhanced teaching methods
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Safe Environment</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Secure and conducive learning environment with comprehensive safety measures
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-900 to-primary-700 dark:from-primary-950 dark:to-primary-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Community
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Give your child the gift of quality education at Progress International Group of Schools
          </p>
          <Link href="/admissions">
            <Button variant="default" size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
              Apply Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
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
                  <span>123 Education Avenue, Lafia, Nasarawa State</span>
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
