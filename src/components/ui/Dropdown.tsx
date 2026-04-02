import React, { useRef, useEffect, useState } from 'react'
import { cn } from '../../utils'

interface DropdownItem {
  label: string
  icon?: React.ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick: (...args: any[]) => void
  danger?: boolean
  disabled?: boolean
}

interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
}

export function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className={cn(
          'absolute z-40 top-full mt-1 w-48 bg-white rounded-xl shadow-modal border border-gray-100 py-1 animate-fade-in',
          align === 'right' ? 'right-0' : 'left-0'
        )}>
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => { item.onClick(); setOpen(false) }}
              disabled={item.disabled}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                item.danger
                  ? 'text-red-500 hover:bg-red-50'
                  : 'text-gray-700 hover:bg-gray-50',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {item.icon && <span className="text-current opacity-70">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
