import React from 'react'
import { cn } from '../../utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export function Card({ children, className, onClick, hover }: CardProps) {
  return (
    <div
      className={cn(
        'card',
        hover && 'cursor-pointer hover:shadow-card-hover transition-shadow',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
