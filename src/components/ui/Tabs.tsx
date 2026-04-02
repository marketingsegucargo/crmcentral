import React from 'react'
import { cn } from '../../utils'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  active?: string
  activeTab?: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, active, activeTab, onChange, className }: TabsProps) {
  const current = active ?? activeTab ?? ''
  return (
    <div className={cn('flex gap-1 border-b border-gray-200', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'nav-tab flex items-center gap-1.5',
            current === tab.id && 'active'
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              'ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium',
              current === tab.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
