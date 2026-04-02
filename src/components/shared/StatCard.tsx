import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  color?: 'primary' | 'teal' | 'purple' | 'orange'
  onClick?: () => void
}

const colors = {
  primary: { bg: 'bg-primary/10', icon: 'text-primary', badge: 'bg-primary' },
  teal: { bg: 'bg-teal/10', icon: 'text-teal-600', badge: 'bg-teal' },
  purple: { bg: 'bg-purple-100', icon: 'text-purple-600', badge: 'bg-purple-500' },
  orange: { bg: 'bg-orange-100', icon: 'text-orange-600', badge: 'bg-orange-500' },
}

export function StatCard({ title, value, change, changeLabel, icon, color = 'primary', onClick }: StatCardProps) {
  const c = colors[color]
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  return (
    <div
      className={cn('card p-5 flex items-start gap-4', onClick && 'cursor-pointer hover:shadow-card-hover transition-shadow')}
      onClick={onClick}
    >
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', c.bg)}>
        <span className={c.icon}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium mb-0.5">{title}</p>
        <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {isPositive && <TrendingUp className="w-3.5 h-3.5 text-teal-600" />}
            {isNegative && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
            {change === 0 && <Minus className="w-3.5 h-3.5 text-gray-400" />}
            <span className={cn('text-xs font-medium', isPositive ? 'text-teal-600' : isNegative ? 'text-red-500' : 'text-gray-400')}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            {changeLabel && <span className="text-xs text-gray-400">{changeLabel}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
