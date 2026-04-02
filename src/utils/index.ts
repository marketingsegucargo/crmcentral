import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO, isToday, isTomorrow, isPast } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-MX').format(n)
}

export function formatDate(dateStr: string, fmt = 'dd MMM yyyy'): string {
  try {
    return format(parseISO(dateStr), fmt, { locale: es })
  } catch {
    return dateStr
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: es })
  } catch {
    return dateStr
  }
}

export function formatDateLabel(dateStr: string): string {
  try {
    const d = parseISO(dateStr)
    if (isToday(d)) return 'Hoy'
    if (isTomorrow(d)) return 'Mañana'
    return format(d, 'dd MMM', { locale: es })
  } catch {
    return dateStr
  }
}

export function isOverdue(dateStr: string): boolean {
  try {
    return isPast(parseISO(dateStr))
  } catch {
    return false
  }
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getLifecycleLabel(stage: string): string {
  const labels: Record<string, string> = {
    subscriber: 'Suscriptor',
    lead: 'Lead',
    marketing_qualified: 'MQL',
    sales_qualified: 'SQL',
    opportunity: 'Oportunidad',
    customer: 'Cliente',
    evangelist: 'Evangelista',
  }
  return labels[stage] ?? stage
}

export function getLifecycleColor(stage: string): string {
  const colors: Record<string, string> = {
    subscriber: 'bg-gray-100 text-gray-600',
    lead: 'bg-blue-50 text-blue-600',
    marketing_qualified: 'bg-purple-50 text-purple-600',
    sales_qualified: 'bg-indigo-50 text-indigo-700',
    opportunity: 'bg-orange-50 text-orange-600',
    customer: 'bg-teal-50 text-teal-700',
    evangelist: 'bg-green-50 text-green-700',
  }
  return colors[stage] ?? 'bg-gray-100 text-gray-600'
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-green-50 text-green-700',
    normal: 'bg-blue-50 text-blue-700',
    medium: 'bg-yellow-50 text-yellow-700',
    high: 'bg-orange-50 text-orange-700',
    urgent: 'bg-red-50 text-red-700',
  }
  return colors[priority] ?? 'bg-gray-100 text-gray-600'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-teal-50 text-teal-700',
    open: 'bg-blue-50 text-blue-700',
    pending: 'bg-yellow-50 text-yellow-700',
    resolved: 'bg-teal-50 text-teal-700',
    closed: 'bg-gray-100 text-gray-600',
    won: 'bg-green-50 text-green-700',
    lost: 'bg-red-50 text-red-600',
    draft: 'bg-gray-100 text-gray-600',
    sent: 'bg-blue-50 text-blue-700',
    scheduled: 'bg-purple-50 text-purple-700',
    paused: 'bg-yellow-50 text-yellow-700',
    approved: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-600',
    expired: 'bg-gray-100 text-gray-600',
    completed: 'bg-teal-50 text-teal-700',
    not_started: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-50 text-blue-700',
    deferred: 'bg-yellow-50 text-yellow-700',
    inactive: 'bg-gray-100 text-gray-500',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-600'
}

export function getTaskTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    call: '📞',
    email: '📧',
    meeting: '📅',
    follow_up: '🔄',
    other: '✓',
  }
  return icons[type] ?? '✓'
}

export function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    note: '📝',
    email_sent: '📤',
    email_received: '📥',
    call: '📞',
    meeting: '📅',
    task_completed: '✅',
    deal_created: '💼',
    deal_won: '🏆',
    deal_lost: '❌',
    deal_stage_changed: '🔄',
    contact_created: '👤',
    company_created: '🏢',
    ticket_created: '🎫',
    ticket_resolved: '✅',
    email_opened: '👁️',
    email_clicked: '🔗',
  }
  return icons[type] ?? '•'
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export const INDUSTRIES = [
  'Tecnología', 'SaaS', 'Finanzas', 'Salud', 'Retail', 'Manufactura',
  'Consultoría', 'Educación', 'Real Estate', 'Media', 'Logística', 'Energía', 'Otro',
]

export const COMPANY_SIZES: { label: string; value: string }[] = [
  { label: '1-10 empleados', value: '1-10' },
  { label: '11-50 empleados', value: '11-50' },
  { label: '51-200 empleados', value: '51-200' },
  { label: '201-500 empleados', value: '201-500' },
  { label: '501-1000 empleados', value: '501-1000' },
  { label: '1001-5000 empleados', value: '1001-5000' },
  { label: '+5000 empleados', value: '5000+' },
]

export const LEAD_SOURCES = [
  { label: 'Búsqueda orgánica', value: 'organic_search' },
  { label: 'Publicidad pagada', value: 'paid_ads' },
  { label: 'Referido', value: 'referral' },
  { label: 'Redes sociales', value: 'social_media' },
  { label: 'Email', value: 'email' },
  { label: 'Evento', value: 'event' },
  { label: 'Directo', value: 'direct' },
  { label: 'Otro', value: 'other' },
]
