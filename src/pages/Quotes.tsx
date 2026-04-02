import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, FileText, MoreHorizontal, Eye, Edit2, Trash2,
  Send, CheckCircle, XCircle, Clock, TrendingUp,
  DollarSign, AlertCircle, Search,
} from 'lucide-react'
import {
  Button, Badge, Modal, Input, Textarea, Select,
  EmptyState, Dropdown, Avatar, SearchInput,
} from '../components/ui'
import {
  useQuoteStore, useContactStore, useCompanyStore,
  useDealStore, useUserStore, useUIStore,
} from '../store'
import { formatCurrency, formatDate, getStatusColor, generateId, cn } from '../utils'
import type { QuoteStatus } from '../types'

// ─── Constants ────────────────────────────────────────────

const STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: 'Borrador',
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  expired: 'Vencida',
}

const STATUS_ICONS: Record<QuoteStatus, React.ReactNode> = {
  draft: <Edit2 className="w-3 h-3" />,
  pending: <Clock className="w-3 h-3" />,
  approved: <CheckCircle className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />,
  expired: <AlertCircle className="w-3 h-3" />,
}

const FILTER_TABS: { label: string; value: string }[] = [
  { label: 'Todas', value: '' },
  { label: 'Borrador', value: 'draft' },
  { label: 'Pendiente', value: 'pending' },
  { label: 'Aprobada', value: 'approved' },
  { label: 'Rechazada', value: 'rejected' },
  { label: 'Vencida', value: 'expired' },
]

// ─── New Quote Modal ───────────────────────────────────────

interface NewQuoteModalProps {
  open: boolean
  onClose: () => void
}

function NewQuoteModal({ open, onClose }: NewQuoteModalProps) {
  const { addQuote } = useQuoteStore()
  const { contacts } = useContactStore()
  const { companies } = useCompanyStore()
  const { deals } = useDealStore()
  const { users, currentUser } = useUserStore()
  const { addToast } = useUIStore()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    dealId: '',
    contactId: '',
    companyId: '',
    ownerId: currentUser.id,
    validUntil: '',
    notes: '',
    terms: '',
    currency: 'MXN',
  })
  const [errors, setErrors] = useState<{ contactId?: string; validUntil?: string }>({})

  React.useEffect(() => {
    if (open) {
      setForm({
        dealId: '',
        contactId: '',
        companyId: '',
        ownerId: currentUser.id,
        validUntil: '',
        notes: '',
        terms: '',
        currency: 'MXN',
      })
      setErrors({})
    }
  }, [open])

  const set = (key: keyof typeof form, val: string) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  // Auto-fill company when deal is selected
  const handleDealChange = (dealId: string) => {
    const deal = deals.find(d => d.id === dealId)
    setForm(f => ({
      ...f,
      dealId,
      companyId: deal?.companyId ?? f.companyId,
      contactId: deal?.contactIds?.[0] ?? f.contactId,
    }))
  }

  const validate = () => {
    const e: typeof errors = {}
    if (!form.validUntil) e.validUntil = 'La fecha de validez es requerida'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const quoteNumber = `COT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
    const newQuote = {
      quoteNumber,
      dealId: form.dealId || undefined,
      contactId: form.contactId || undefined,
      companyId: form.companyId || undefined,
      status: 'draft' as QuoteStatus,
      validUntil: form.validUntil,
      currency: form.currency,
      lineItems: [],
      subtotal: 0,
      discountTotal: 0,
      tax: 0,
      total: 0,
      notes: form.notes || undefined,
      terms: form.terms || undefined,
      ownerId: form.ownerId,
    }
    addQuote(newQuote)
    addToast({ type: 'success', title: 'Cotización creada', message: `${quoteNumber} fue creada como borrador.` })
    onClose()
    // Navigate to the new quote — get the freshly added quote
    const { quotes } = useQuoteStore.getState()
    const latest = quotes[quotes.length - 1]
    if (latest) navigate(`/quotes/${latest.id}`)
  }

  const contactOptions = contacts.map(c => ({
    label: `${c.firstName} ${c.lastName}`,
    value: c.id,
  }))

  const companyOptions = companies.map(c => ({ label: c.name, value: c.id }))
  const dealOptions = deals.filter(d => d.status === 'open').map(d => ({ label: d.name, value: d.id }))
  const userOptions = users.map(u => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva Cotización"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>Crear Cotización</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="Deal asociado (opcional)"
          value={form.dealId}
          onChange={e => handleDealChange(e.target.value)}
          options={[{ label: 'Sin deal asociado', value: '' }, ...dealOptions]}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Contacto"
            value={form.contactId}
            onChange={e => set('contactId', e.target.value)}
            options={[{ label: 'Sin contacto', value: '' }, ...contactOptions]}
          />
          <Select
            label="Empresa"
            value={form.companyId}
            onChange={e => set('companyId', e.target.value)}
            options={[{ label: 'Sin empresa', value: '' }, ...companyOptions]}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Responsable"
            value={form.ownerId}
            onChange={e => set('ownerId', e.target.value)}
            options={userOptions}
          />
          <Select
            label="Moneda"
            value={form.currency}
            onChange={e => set('currency', e.target.value)}
            options={[
              { label: 'MXN — Peso Mexicano', value: 'MXN' },
              { label: 'USD — Dólar', value: 'USD' },
            ]}
          />
        </div>
        <Input
          label="Válida hasta"
          required
          type="date"
          value={form.validUntil}
          onChange={e => set('validUntil', e.target.value)}
          error={errors.validUntil}
        />
        <Textarea
          label="Notas internas"
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Notas visibles para el equipo..."
          rows={2}
        />
        <Textarea
          label="Términos y condiciones"
          value={form.terms}
          onChange={e => set('terms', e.target.value)}
          placeholder="Términos y condiciones de la cotización..."
          rows={2}
        />
      </div>
    </Modal>
  )
}

// ─── Quotes Page ──────────────────────────────────────────

export default function Quotes() {
  const navigate = useNavigate()
  const { quotes, filterStatus, setFilterStatus, deleteQuote, updateQuote } = useQuoteStore()
  const { contacts } = useContactStore()
  const { companies } = useCompanyStore()
  const { deals } = useDealStore()
  const { users } = useUserStore()
  const { addToast } = useUIStore()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  // ── Helpers ──────────────────────────────────────────────
  const getContactName = (id?: string) => {
    if (!id) return '—'
    const c = contacts.find(c => c.id === id)
    return c ? `${c.firstName} ${c.lastName}` : '—'
  }
  const getCompanyName = (id?: string) =>
    id ? (companies.find(c => c.id === id)?.name ?? '—') : '—'
  const getDealName = (id?: string) =>
    id ? (deals.find(d => d.id === id)?.name ?? '—') : '—'
  const getOwnerName = (id: string) => {
    const u = users.find(u => u.id === id)
    return u ? `${u.firstName} ${u.lastName}` : '—'
  }

  // ── Filtered list ────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = quotes
    if (filterStatus) list = list.filter(q => q.status === filterStatus)
    if (search) {
      const sq = search.toLowerCase()
      list = list.filter(q =>
        q.quoteNumber.toLowerCase().includes(sq) ||
        getCompanyName(q.companyId).toLowerCase().includes(sq) ||
        getContactName(q.contactId).toLowerCase().includes(sq) ||
        getDealName(q.dealId).toLowerCase().includes(sq)
      )
    }
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [quotes, filterStatus, search])

  // ── Stats ────────────────────────────────────────────────
  const stats = useMemo(() => {
    const pending = quotes.filter(q => q.status === 'pending')
    const approved = quotes.filter(q => q.status === 'approved')
    return {
      totalValue: quotes.reduce((s, q) => s + q.total, 0),
      pendingCount: pending.length,
      pendingValue: pending.reduce((s, q) => s + q.total, 0),
      approvedCount: approved.length,
      approvedValue: approved.reduce((s, q) => s + q.total, 0),
      draftCount: quotes.filter(q => q.status === 'draft').length,
    }
  }, [quotes])

  // ── Actions ──────────────────────────────────────────────
  const handleSend = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    updateQuote(id, { status: 'pending', sentAt: new Date().toISOString() })
    addToast({ type: 'success', title: 'Cotización enviada', message: 'El estado fue actualizado a Pendiente.' })
  }

  const handleApprove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    updateQuote(id, { status: 'approved', signedAt: new Date().toISOString() })
    addToast({ type: 'success', title: 'Cotización aprobada' })
  }

  const handleReject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    updateQuote(id, { status: 'rejected' })
    addToast({ type: 'info', title: 'Cotización rechazada' })
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteQuote(id)
    addToast({ type: 'success', title: 'Cotización eliminada' })
  }

  const isExpired = (dateStr: string) => {
    try { return new Date(dateStr) < new Date() } catch { return false }
  }

  const tabCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = { '': quotes.length }
    quotes.forEach(q => { counts[q.status] = (counts[q.status] ?? 0) + 1 })
    return counts
  }, [quotes])

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Cotizaciones</h1>
          <span className="badge bg-primary/10 text-primary font-semibold">{quotes.length}</span>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setFormOpen(true)}
        >
          Nueva Cotización
        </Button>
      </div>

      {/* ── Stats ──────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: 'Valor total',
              primary: formatCurrency(stats.totalValue, 'MXN'),
              sub: `${quotes.length} cotizaciones`,
              icon: <DollarSign className="w-5 h-5" />,
              color: 'text-primary',
              bg: 'bg-primary/10',
              iconColor: 'text-primary',
            },
            {
              label: 'Pendientes',
              primary: String(stats.pendingCount),
              sub: formatCurrency(stats.pendingValue, 'MXN'),
              icon: <Clock className="w-5 h-5" />,
              color: 'text-yellow-700',
              bg: 'bg-yellow-50',
              iconColor: 'text-yellow-500',
            },
            {
              label: 'Aprobadas',
              primary: String(stats.approvedCount),
              sub: formatCurrency(stats.approvedValue, 'MXN'),
              icon: <CheckCircle className="w-5 h-5" />,
              color: 'text-teal-700',
              bg: 'bg-teal-50',
              iconColor: 'text-teal-500',
            },
            {
              label: 'Borradores',
              primary: String(stats.draftCount),
              sub: 'sin enviar',
              icon: <Edit2 className="w-5 h-5" />,
              color: 'text-gray-700',
              bg: 'bg-gray-100',
              iconColor: 'text-gray-500',
            },
          ].map(s => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.bg)}>
                <span className={s.iconColor}>{s.icon}</span>
              </div>
              <div className="min-w-0">
                <p className={cn('text-xl font-bold leading-tight', s.color)}>{s.primary}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{s.sub}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter Tabs + Search ────────────────────── */}
      <div className="px-6 py-3 border-b border-gray-100 bg-white flex-shrink-0 space-y-3">
        <div className="flex items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por número, empresa, contacto..."
            className="w-72"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={cn('filter-chip text-xs', filterStatus === tab.value && 'active')}
            >
              {tab.label}
              {tabCounts[tab.value] !== undefined && (
                <span className={cn(
                  'ml-1.5 text-xs font-medium px-1.5 py-0.5 rounded-full',
                  filterStatus === tab.value ? 'bg-white/30' : 'bg-gray-100 text-gray-500'
                )}>
                  {tabCounts[tab.value]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-8 h-8" />}
            title="Sin cotizaciones"
            description={
              search || filterStatus
                ? 'No hay cotizaciones que coincidan con los filtros aplicados.'
                : 'Crea tu primera cotización para comenzar.'
            }
            action={
              !search && !filterStatus
                ? { label: 'Nueva Cotización', onClick: () => setFormOpen(true) }
                : undefined
            }
          />
        ) : (
          <table className="w-full min-w-[1000px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-gray-100">
                <th className="table-header pl-6">Cotización #</th>
                <th className="table-header">Deal</th>
                <th className="table-header">Contacto</th>
                <th className="table-header">Empresa</th>
                <th className="table-header">Estado</th>
                <th className="table-header text-right pr-4">Total</th>
                <th className="table-header">Válida hasta</th>
                <th className="table-header">Creada</th>
                <th className="table-header w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => {
                const expired = q.status !== 'approved' && q.status !== 'rejected' && isExpired(q.validUntil)
                const owner = users.find(u => u.id === q.ownerId)

                return (
                  <tr
                    key={q.id}
                    className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/quotes/${q.id}`)}
                  >
                    {/* Quote number */}
                    <td className="table-cell pl-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="font-mono font-semibold text-sm text-gray-900">{q.quoteNumber}</span>
                      </div>
                    </td>

                    {/* Deal */}
                    <td className="table-cell max-w-[140px]">
                      <span className="text-sm text-gray-600 truncate block">{getDealName(q.dealId)}</span>
                    </td>

                    {/* Contact */}
                    <td className="table-cell">
                      <span className="text-sm text-gray-700">{getContactName(q.contactId)}</span>
                    </td>

                    {/* Company */}
                    <td className="table-cell">
                      <span className="text-sm font-medium text-gray-800">{getCompanyName(q.companyId)}</span>
                    </td>

                    {/* Status */}
                    <td className="table-cell">
                      <span className={cn(
                        'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium',
                        getStatusColor(q.status)
                      )}>
                        {STATUS_ICONS[q.status]}
                        {STATUS_LABELS[q.status]}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="table-cell text-right pr-4">
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(q.total, q.currency)}
                      </span>
                    </td>

                    {/* Valid Until */}
                    <td className="table-cell">
                      <span className={cn(
                        'text-sm',
                        expired ? 'text-red-600 font-medium' : 'text-gray-500'
                      )}>
                        {formatDate(q.validUntil)}
                        {expired && <span className="ml-1 text-xs">(vencida)</span>}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        {owner && <Avatar name={`${owner.firstName} ${owner.lastName}`} size="xs" />}
                        <span className="text-xs text-gray-400">{formatDate(q.createdAt)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="table-cell pr-4" onClick={e => e.stopPropagation()}>
                      <Dropdown
                        trigger={
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        }
                        items={[
                          {
                            label: 'Ver detalle',
                            icon: <Eye className="w-4 h-4" />,
                            onClick: () => navigate(`/quotes/${q.id}`),
                          },
                          ...(q.status === 'draft' ? [{
                            label: 'Enviar cotización',
                            icon: <Send className="w-4 h-4" />,
                            onClick: (e: React.MouseEvent) => handleSend(q.id, e),
                          }] : []),
                          ...(q.status === 'pending' ? [
                            {
                              label: 'Aprobar',
                              icon: <CheckCircle className="w-4 h-4" />,
                              onClick: (e: React.MouseEvent) => handleApprove(q.id, e),
                            },
                            {
                              label: 'Rechazar',
                              icon: <XCircle className="w-4 h-4" />,
                              onClick: (e: React.MouseEvent) => handleReject(q.id, e),
                            },
                          ] : []),
                          {
                            label: 'Eliminar',
                            icon: <Trash2 className="w-4 h-4" />,
                            onClick: (e: React.MouseEvent) => handleDelete(q.id, e),
                            danger: true,
                          },
                        ]}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal ──────────────────────────────────── */}
      <NewQuoteModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
