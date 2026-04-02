import React from 'react'
import { cn } from '../../utils'

interface FieldProps {
  label?: string
  error?: string
  required?: boolean
  hint?: string
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, FieldProps {}
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, FieldProps {}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, FieldProps {
  options: { label: string; value: string }[]
  placeholder?: string
}

function FieldWrapper({ label, error, hint, required, children }: FieldProps & { children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Input({ label, error, hint, required, className, ...props }: InputProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required}>
      <input
        className={cn('input-field', error && 'border-red-400 focus:border-red-400 focus:ring-red-100', className)}
        {...props}
      />
    </FieldWrapper>
  )
}

export function Textarea({ label, error, hint, required, className, ...props }: TextareaProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required}>
      <textarea
        className={cn('input-field resize-none', error && 'border-red-400', className)}
        {...props}
      />
    </FieldWrapper>
  )
}

export function Select({ label, error, hint, required, options, placeholder, className, ...props }: SelectProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required}>
      <select
        className={cn('input-field bg-white', error && 'border-red-400', className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </FieldWrapper>
  )
}
