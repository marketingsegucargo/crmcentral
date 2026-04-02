import React from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useUIStore } from '../../store'
import { cn } from '../../utils'

const toastConfig = {
  success: { icon: CheckCircle, bg: 'bg-green-50 border-green-200', title: 'text-green-800', icon_: 'text-green-500' },
  error: { icon: XCircle, bg: 'bg-red-50 border-red-200', title: 'text-red-800', icon_: 'text-red-500' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-50 border-yellow-200', title: 'text-yellow-800', icon_: 'text-yellow-500' },
  info: { icon: Info, bg: 'bg-blue-50 border-blue-200', title: 'text-blue-800', icon_: 'text-blue-500' },
}

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        const config = toastConfig[toast.type]
        const Icon = config.icon
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border shadow-card animate-slide-in',
              config.bg
            )}
          >
            <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.icon_)} />
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-semibold', config.title)}>{toast.title}</p>
              {toast.message && <p className="text-xs text-gray-500 mt-0.5">{toast.message}</p>}
            </div>
            <button onClick={() => removeToast(toast.id)} className="p-0.5 rounded hover:bg-black/10 text-gray-400 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
