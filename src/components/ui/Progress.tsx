import React from 'react'
import { cn } from '../../utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  color?: 'primary' | 'teal' | 'green' | 'red' | 'yellow'
  size?: 'sm' | 'md'
}

const colors = {
  primary: 'bg-primary',
  teal: 'bg-teal',
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
}

export function Progress({ value, max = 100, className, color = 'primary', size = 'md' }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn('w-full bg-gray-100 rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', colors[color])}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
