import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount)
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export function generateAdmissionNumber(): string {
  const year = new Date().getFullYear().toString().slice(-2)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `PIS/${year}/${random}`
}

export function generateStaffId(): string {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `STAFF/${random}`
}
