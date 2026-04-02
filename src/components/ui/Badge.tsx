import React from 'react'
import { cn } from '../../utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'teal'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  dot?: boolean
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-600',
  success: 'bg-green-50 text-green-700',
  warning: 'bg-yellow-50 text-yellow-700',
  error: 'bg-red-50 text-red-600',
  info: 'bg-blue-50 text-blue-700',
  primary: 'bg-primary/10 text-primary',
  teal: 'bg-teal/10 text-teal-700',
}

export function Badge({ children, className, dot, variant }: BadgeProps) {
  return (
    <span className={cn('badge', variant && variantClasses[variant], className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1" />}
      {children}
    </span>
  )
}
