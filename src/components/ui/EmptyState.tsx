import React from 'react'
import { cn } from '../../utils'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void } | React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-8 text-center', className)}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 text-gray-300">
          {icon}
        </div>
      )}
      <h3 className="text-gray-700 font-semibold text-base mb-1">{title}</h3>
      {description && <p className="text-gray-400 text-sm max-w-sm mb-6">{description}</p>}
      {action && (
        React.isValidElement(action)
          ? action
          : <Button onClick={(action as { label: string; onClick: () => void }).onClick}>{(action as { label: string; onClick: () => void }).label}</Button>
      )}
    </div>
  )
}
