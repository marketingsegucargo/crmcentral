import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, Building2, TrendingUp, ArrowRight } from 'lucide-react'
import { useContactStore, useCompanyStore, useDealStore, useUIStore } from '../../store'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { contacts } = useContactStore()
  const { companies } = useCompanyStore()
  const { deals } = useDealStore()

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    const res: { type: string; label: string; sub: string; to: string }[] = []
    contacts.filter(c => `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(q)).slice(0, 4).forEach(c => {
      res.push({ type: 'contact', label: `${c.firstName} ${c.lastName}`, sub: c.email, to: `/contacts/${c.id}` })
    })
    companies.filter(c => c.name.toLowerCase().includes(q)).slice(0, 3).forEach(c => {
      res.push({ type: 'company', label: c.name, sub: c.industry || '', to: `/companies/${c.id}` })
    })
    deals.filter(d => d.name.toLowerCase().includes(q)).slice(0, 3).forEach(d => {
      res.push({ type: 'deal', label: d.name, sub: `$${d.value.toLocaleString()} MXN`, to: `/deals/${d.id}` })
    })
    return res
  }, [query, contacts, companies, deals])

  const typeIcons: Record<string, React.ReactNode> = {
    contact: <Users className="w-4 h-4" />,
    company: <Building2 className="w-4 h-4" />,
    deal: <TrendingUp className="w-4 h-4" />,
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-modal animate-scale-in overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar contactos, empresas, deals..."
            className="flex-1 text-base outline-none text-gray-900 placeholder-gray-400"
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          />
          <kbd className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-500">ESC</kbd>
        </div>

        {results.length > 0 ? (
          <div className="max-h-80 overflow-y-auto py-1">
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => { navigate(r.to); onClose() }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-gray-400 flex-shrink-0">{typeIcons[r.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.label}</p>
                  <p className="text-xs text-gray-400 truncate">{r.sub}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        ) : query ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">
            No se encontraron resultados para "{query}"
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-gray-400 text-sm">
            Escribe para buscar en contactos, empresas y deals
          </div>
        )}
      </div>
    </div>
  )
}
