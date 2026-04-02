import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, FileText, Building2, User, Calendar, Send,
  CheckCircle, XCircle, Printer, Download, Edit2, Clock,
  Package, Plus, Trash2, ChevronRight, Eye, EyeOff,
  DollarSign,
} from 'lucide-react'
import { Button, Badge, Modal, Input, Textarea, Select, Avatar } from '../components/ui'
import {
  useQuoteStore, useContactStore, useCompanyStore,
  useDealStore, useUserStore, useUIStore, useProductStore,
} from '../store'
import { formatCurrency, formatDate, getStatusColor, generateId, cn } from '../utils'
import type { QuoteStatus, QuoteLineItem } from '../types'

// ─── Status meta ──────────────────────────────────────────

const STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: 'Borrador',
  pending: 'Pendiente de aprobación',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  expired: 'Expirada',
}

// ─── Add Line Item Modal ──────────────────────────────────

interface AddLineModalProps {
  open: boolean
  currency: string
  onAdd: (item: QuoteLineItem) => void
  onClose: () => void
}

function AddLineModal({ open, currency, onAdd, onClose }: AddLineModalProps) {
  const { products } = useProductStore()
  const activeProducts = products.filter(p => p.isActive)

  const [mode, setMode] = useState<'catalog' | 'custom'>('catalog')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
  })

  React.useEffect(() => {
    if (open) {
      setMode('catalog')
      setSelectedProductId('')
      setForm({ name: '', description: '', quantity: 1, unitPrice: 0, discount: 0 })
    }
  }, [open])

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId)
    const p = products.find(pr => pr.id === productId)
    if (p) {
      setForm(f => ({
        ...f,
        name: p.name,
        description: p.description ?? '',
        unitPrice: p.price,
      }))
    }
  }

  const lineTotal = useMemo(() => {
    const subtotal = form.quantity * form.unitPrice
    const disc = subtotal * (form.discount / 100)
    return subtotal - disc
  }, [form])

  const set = (key: keyof typeof form, val: string | number) =>
    setForm(f => ({ ...f, [key]: val }))

  const handleAdd = () => {
    if (!form.name.trim()) return
    const item: QuoteLineItem = {
      id: generateId(),
      productId: mode === 'catalog' ? selectedProductId || undefined : undefined,
      name: form.name,
      description: form.description || undefined,
      quantity: form.quantity,
      unitPrice: form.unitPrice,
      discount: form.discount,
      total: lineTotal,
    }
    onAdd(item)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Agregar línea"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleAdd} disabled={!form.name.trim()}>
            Agregar línea
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Mode selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('catalog')}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors',
              mode === 'catalog'
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            )}
          >
            Desde catálogo
          </button>
          <button
            onClick={() => setMode('custom')}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors',
              mode === 'custom'
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            )}
          >
            Línea personalizada
          </button>
        </div>

        {mode === 'catalog' && (
          <Select
            label="Seleccionar producto"
            value={selectedProductId}
            onChange={e => handleProductSelect(e.target.value)}
            options={[
              { label: 'Selecciona un producto...', value: '' },
              ...activeProducts.map(p => ({
                label: `${p.name} — ${formatCurrency(p.price, p.currency)}`,
                value: p.id,
              })),
            ]}
          />
        )}

        <Input
          label="Nombre"
          required
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Nombre del producto o servicio"
        />
        <Input
          label="Descripción (opcional)"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Descripción breve"
        />
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Cantidad"
            type="number"
            value={form.quantity}
            onChange={e => set('quantity', parseFloat(e.target.value) || 1)}
            min={1}
            step={1}
          />
          <Input
            label={`Precio unit. (${currency})`}
            type="number"
            value={form.unitPrice}
            onChange={e => set('unitPrice', parseFloat(e.target.value) || 0)}
            min={0}
            step={0.01}
          />
          <Input
            label="Descuento %"
            type="number"
            value={form.discount}
            onChange={e => set('discount', Math.min(100, parseFloat(e.target.value) || 0))}
            min={0}
            max={100}
            step={1}
          />
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
          <span className="text-sm text-gray-500">Total línea:</span>
          <span className="text-base font-bold text-gray-900">{formatCurrency(lineTotal, currency)}</span>
        </div>
      </div>
    </Modal>
  )
}

// ─── Editable Line Item Row ───────────────────────────────

interface LineRowProps {
  item: QuoteLineItem
  currency: string
  editable: boolean
  onChange: (updated: QuoteLineItem) => void
  onDelete: () => void
}

function LineRow({ item, currency, editable, onChange, onDelete }: LineRowProps) {
  const handleChange = (key: keyof QuoteLineItem, val: number) => {
    const updated = { ...item, [key]: val }
    const subtotal = updated.quantity * updated.unitPrice
    updated.total = subtotal - subtotal * (updated.discount / 100)
    onChange(updated)
  }

  return (
    <tr className="border-b border-gray-100 group">
      {/* Name + description */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-300 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm text-gray-900">{item.name}</p>
            {item.description && (
              <p className="text-xs text-gray-400">{item.description}</p>
            )}
          </div>
        </div>
      </td>

      {/* Quantity */}
      <td className="px-4 py-3 text-right w-20">
        {editable ? (
          <input
            type="number"
            value={item.quantity}
            min={1}
            step={1}
            onChange={e => handleChange('quantity', parseFloat(e.target.value) || 1)}
            className="input-field w-16 text-right text-sm py-1"
          />
        ) : (
          <span className="text-sm text-gray-600">{item.quantity}</span>
        )}
      </td>

      {/* Unit price */}
      <td className="px-4 py-3 text-right w-32">
        {editable ? (
          <input
            type="number"
            value={item.unitPrice}
            min={0}
            step={0.01}
            onChange={e => handleChange('unitPrice', parseFloat(e.target.value) || 0)}
            className="input-field w-28 text-right text-sm py-1"
          />
        ) : (
          <span className="text-sm text-gray-600">{formatCurrency(item.unitPrice, currency)}</span>
        )}
      </td>

      {/* Discount */}
      <td className="px-4 py-3 text-right w-24">
        {editable ? (
          <input
            type="number"
            value={item.discount}
            min={0}
            max={100}
            step={1}
            onChange={e => handleChange('discount', Math.min(100, parseFloat(e.target.value) || 0))}
            className="input-field w-20 text-right text-sm py-1"
          />
        ) : (
          <span className={cn('text-sm', item.discount > 0 ? 'text-orange-600 font-medium' : 'text-gray-300')}>
            {item.discount > 0 ? `${item.discount}%` : '—'}
          </span>
        )}
      </td>

      {/* Total */}
      <td className="px-4 py-3 text-right">
        <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.total, currency)}</span>
      </td>

      {/* Delete */}
      {editable && (
        <td className="px-3 py-3 w-10">
          <button
            onClick={onDelete}
            className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </td>
      )}
    </tr>
  )
}

// ─── QuoteDetail ──────────────────────────────────────────

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { quotes, updateQuote } = useQuoteStore()
  const { contacts } = useContactStore()
  const { companies } = useCompanyStore()
  const { deals } = useDealStore()
  const { users } = useUserStore()
  const { addToast } = useUIStore()

  const [addLineOpen, setAddLineOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [localNotes, setLocalNotes] = useState<string | undefined>()
  const [localTerms, setLocalTerms] = useState<string | undefined>()
  const [applyTax, setApplyTax] = useState(true)

  const quote = useMemo(() => quotes.find(q => q.id === id), [quotes, id])

  // Sync notes/terms from store when quote changes
  React.useEffect(() => {
    if (quote) {
      setLocalNotes(quote.notes ?? '')
      setLocalTerms(quote.terms ?? '')
      setApplyTax(quote.tax > 0)
    }
  }, [quote?.id])

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <FileText className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500">Cotización no encontrada</p>
        <Button variant="secondary" onClick={() => navigate('/quotes')}>Volver a cotizaciones</Button>
      </div>
    )
  }

  const contact = contacts.find(c => c.id === quote.contactId)
  const company = companies.find(c => c.id === quote.companyId)
  const deal = deals.find(d => d.id === quote.dealId)
  const owner = users.find(u => u.id === quote.ownerId)
  const isEditable = quote.status === 'draft' && editMode

  // ── Totals calculation ───────────────────────────────────
  const { subtotal, discountTotal, tax, total } = useMemo(() => {
    const items = quote.lineItems
    const sub = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    const disc = items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.discount / 100), 0)
    const taxed = applyTax ? (sub - disc) * 0.16 : 0
    return {
      subtotal: sub,
      discountTotal: disc,
      tax: taxed,
      total: sub - disc + taxed,
    }
  }, [quote.lineItems, applyTax])

  // ── Actions ──────────────────────────────────────────────
  const handleSend = () => {
    updateQuote(quote.id, { status: 'pending', sentAt: new Date().toISOString() })
    addToast({ type: 'success', title: 'Cotización enviada al cliente' })
  }

  const handleApprove = () => {
    updateQuote(quote.id, { status: 'approved', signedAt: new Date().toISOString() })
    addToast({ type: 'success', title: 'Cotización aprobada' })
  }

  const handleReject = () => {
    updateQuote(quote.id, { status: 'rejected' })
    addToast({ type: 'info', title: 'Cotización marcada como rechazada' })
  }

  const handleAddLine = (item: QuoteLineItem) => {
    const newItems = [...quote.lineItems, item]
    const sub = newItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    const disc = newItems.reduce((s, i) => s + i.quantity * i.unitPrice * (i.discount / 100), 0)
    const taxed = applyTax ? (sub - disc) * 0.16 : 0
    updateQuote(quote.id, {
      lineItems: newItems,
      subtotal: sub,
      discountTotal: disc,
      tax: taxed,
      total: sub - disc + taxed,
    })
    addToast({ type: 'success', title: 'Línea agregada' })
  }

  const handleUpdateLine = (idx: number, updated: QuoteLineItem) => {
    const newItems = quote.lineItems.map((it, i) => i === idx ? updated : it)
    const sub = newItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    const disc = newItems.reduce((s, i) => s + i.quantity * i.unitPrice * (i.discount / 100), 0)
    const taxed = applyTax ? (sub - disc) * 0.16 : 0
    updateQuote(quote.id, {
      lineItems: newItems,
      subtotal: sub,
      discountTotal: disc,
      tax: taxed,
      total: sub - disc + taxed,
    })
  }

  const handleDeleteLine = (idx: number) => {
    const newItems = quote.lineItems.filter((_, i) => i !== idx)
    const sub = newItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    const disc = newItems.reduce((s, i) => s + i.quantity * i.unitPrice * (i.discount / 100), 0)
    const taxed = applyTax ? (sub - disc) * 0.16 : 0
    updateQuote(quote.id, {
      lineItems: newItems,
      subtotal: sub,
      discountTotal: disc,
      tax: taxed,
      total: sub - disc + taxed,
    })
  }

  const handleSaveNotes = () => {
    updateQuote(quote.id, { notes: localNotes, terms: localTerms })
    addToast({ type: 'success', title: 'Notas y términos guardados' })
  }

  const handleTaxChange = (checked: boolean) => {
    setApplyTax(checked)
    const sub = quote.lineItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    const disc = quote.lineItems.reduce((s, i) => s + i.quantity * i.unitPrice * (i.discount / 100), 0)
    const taxed = checked ? (sub - disc) * 0.16 : 0
    updateQuote(quote.id, { tax: taxed, total: sub - disc + taxed })
  }

  // ── Status timeline ──────────────────────────────────────
  const statusHistory = [
    { label: 'Creada', date: quote.createdAt, done: true, icon: <Edit2 className="w-3 h-3" /> },
    { label: 'Enviada', date: quote.sentAt, done: !!quote.sentAt, icon: <Send className="w-3 h-3" /> },
    {
      label: quote.status === 'approved' ? 'Aprobada' : quote.status === 'rejected' ? 'Rechazada' : 'Pendiente',
      date: quote.signedAt,
      done: !!quote.signedAt || quote.status === 'rejected',
      icon: quote.status === 'approved'
        ? <CheckCircle className="w-3 h-3" />
        : quote.status === 'rejected'
        ? <XCircle className="w-3 h-3" />
        : <Clock className="w-3 h-3" />,
      color: quote.status === 'approved' ? 'text-teal-500' : quote.status === 'rejected' ? 'text-red-500' : 'text-gray-400',
    },
  ]

  return (
    <div className={cn('flex flex-col h-full', previewMode && 'bg-gray-100')}>
      {/* ── Top bar ─────────────────────────────────── */}
      {!previewMode && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
          <button
            onClick={() => navigate('/quotes')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Cotizaciones
          </button>
          <div className="flex items-center gap-2">
            {quote.status === 'draft' && (
              <Button
                variant="ghost"
                size="sm"
                icon={editMode ? <EyeOff className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? 'Modo vista' : 'Editar'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={<Eye className="w-4 h-4" />}
              onClick={() => setPreviewMode(true)}
            >
              Previsualización
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={() => { addToast({ type: 'info', title: 'Generando PDF...', message: 'La descarga comenzará en breve.' }) }}
            >
              PDF
            </Button>
            {quote.status === 'draft' && (
              <Button
                variant="primary"
                size="sm"
                icon={<Send className="w-4 h-4" />}
                onClick={handleSend}
              >
                Enviar
              </Button>
            )}
            {quote.status === 'pending' && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<XCircle className="w-4 h-4" />}
                  onClick={handleReject}
                >
                  Rechazar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<CheckCircle className="w-4 h-4" />}
                  onClick={handleApprove}
                >
                  Aprobar
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <div className={cn(
        'flex-1 overflow-auto',
        previewMode ? 'flex justify-center p-8' : 'flex gap-6 p-6'
      )}>
        {/* ── Main document ────────────────────────── */}
        <div className={cn(
          previewMode
            ? 'w-full max-w-3xl bg-white shadow-xl rounded-2xl overflow-hidden'
            : 'flex-1 min-w-0 space-y-5'
        )}>
          {/* Document header */}
          <div className={cn(
            'bg-gradient-to-r from-primary to-navy px-8 py-6 text-white',
            !previewMode && 'rounded-2xl'
          )}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1 opacity-80">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase tracking-wide">Cotización</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">{quote.quoteNumber}</h1>
                <p className="text-sm opacity-70 mt-0.5">
                  Válida hasta: {formatDate(quote.validUntil)}
                </p>
              </div>
              <span className={cn(
                'inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full mt-1',
                quote.status === 'approved' ? 'bg-teal-400/20 text-teal-100' :
                quote.status === 'rejected' ? 'bg-red-400/20 text-red-100' :
                quote.status === 'pending' ? 'bg-yellow-400/20 text-yellow-100' :
                'bg-white/10 text-white/80'
              )}>
                {STATUS_LABELS[quote.status]}
              </span>
            </div>
          </div>

          <div className={cn('space-y-6', previewMode ? 'p-8' : '')}>
            {/* Info grid */}
            <div className={cn('grid grid-cols-3 gap-6', !previewMode && 'card p-6')}>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">De</p>
                <p className="font-semibold text-gray-900">CRM Central</p>
                {owner && (
                  <>
                    <p className="text-sm text-gray-600">{owner.firstName} {owner.lastName}</p>
                    <p className="text-xs text-gray-400">{owner.email}</p>
                    {owner.title && <p className="text-xs text-gray-400">{owner.title}</p>}
                  </>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Para</p>
                {company && (
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <p className="font-semibold text-gray-900">{company.name}</p>
                  </div>
                )}
                {contact && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-sm text-gray-600">{contact.firstName} {contact.lastName}</p>
                  </div>
                )}
                {contact?.email && <p className="text-xs text-gray-400 ml-5">{contact.email}</p>}
                {!company && !contact && <p className="text-sm text-gray-300">Sin destinatario</p>}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Fechas</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500">Emitida:</span>
                    <span className="font-medium text-gray-900">{formatDate(quote.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500">Válida hasta:</span>
                    <span className="font-medium text-gray-900">{formatDate(quote.validUntil)}</span>
                  </div>
                  {quote.sentAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Send className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-500">Enviada:</span>
                      <span className="font-medium text-gray-900">{formatDate(quote.sentAt)}</span>
                    </div>
                  )}
                  {quote.signedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                      <span className="text-gray-500">Aprobada:</span>
                      <span className="font-medium text-teal-700">{formatDate(quote.signedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Deal association */}
            {deal && (
              <div className={cn(
                'flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10',
                !previewMode && ''
              )}>
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ChevronRight className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Asociada al deal</p>
                  <p className="text-sm font-semibold text-primary truncate">{deal.name}</p>
                </div>
                <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                  {formatCurrency(deal.value, deal.currency)}
                </span>
              </div>
            )}

            {/* Line Items */}
            <div className={cn(!previewMode && 'card overflow-hidden')}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Productos / Servicios
                </p>
                {isEditable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => setAddLineOpen(true)}
                  >
                    Agregar línea
                  </Button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-2.5 font-medium text-gray-500">Descripción</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-500 w-20">Cant.</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-500 w-32">Precio unit.</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-500 w-24">Desc. %</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-500">Total</th>
                      {isEditable && <th className="w-10" />}
                    </tr>
                  </thead>
                  <tbody>
                    {quote.lineItems.length === 0 ? (
                      <tr>
                        <td colSpan={isEditable ? 6 : 5} className="px-4 py-8 text-center text-gray-400 text-sm">
                          {isEditable
                            ? 'Agrega líneas de productos o servicios usando el botón de arriba.'
                            : 'Sin líneas de productos.'}
                        </td>
                      </tr>
                    ) : (
                      quote.lineItems.map((item, idx) => (
                        <LineRow
                          key={item.id}
                          item={item}
                          currency={quote.currency}
                          editable={isEditable}
                          onChange={updated => handleUpdateLine(idx, updated)}
                          onDelete={() => handleDeleteLine(idx)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add line button (bottom shortcut) */}
              {isEditable && quote.lineItems.length > 0 && (
                <button
                  onClick={() => setAddLineOpen(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-primary hover:bg-primary/5 transition-colors border-t border-gray-100"
                >
                  <Plus className="w-4 h-4" />
                  Agregar línea
                </button>
              )}
            </div>

            {/* Notes + Terms */}
            <div className={cn('grid grid-cols-2 gap-4', !previewMode && '')}>
              <div className={cn(!previewMode ? 'card p-4' : '')}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notas</p>
                {isEditable ? (
                  <textarea
                    className="input-field w-full text-sm resize-none"
                    rows={4}
                    value={localNotes ?? quote.notes ?? ''}
                    onChange={e => setLocalNotes(e.target.value)}
                    placeholder="Notas para el cliente..."
                  />
                ) : (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {quote.notes || <span className="text-gray-300">Sin notas</span>}
                  </p>
                )}
              </div>
              <div className={cn(!previewMode ? 'card p-4' : '')}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Términos y condiciones
                </p>
                {isEditable ? (
                  <textarea
                    className="input-field w-full text-sm resize-none"
                    rows={4}
                    value={localTerms ?? quote.terms ?? ''}
                    onChange={e => setLocalTerms(e.target.value)}
                    placeholder="Términos y condiciones..."
                  />
                ) : (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {quote.terms || <span className="text-gray-300">Sin términos definidos</span>}
                  </p>
                )}
              </div>
            </div>

            {isEditable && (
              <div className="flex justify-end">
                <Button variant="secondary" size="sm" onClick={handleSaveNotes}>
                  Guardar notas y términos
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar (totals + info) ──────────── */}
        {!previewMode && (
          <div className="w-72 flex-shrink-0 space-y-4">
            {/* Totals panel */}
            <div className="card p-5 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Resumen</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal, quote.currency)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Descuentos</span>
                    <span className="font-medium">-{formatCurrency(discountTotal, quote.currency)}</span>
                  </div>
                )}
                {/* IVA toggle */}
                <div className="flex items-center justify-between text-sm text-gray-600 py-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyTax}
                      onChange={e => handleTaxChange(e.target.checked)}
                      className="w-3.5 h-3.5 rounded accent-primary"
                      disabled={!isEditable && quote.status !== 'draft'}
                    />
                    IVA (16%)
                  </label>
                  <span className="font-medium">{formatCurrency(tax, quote.currency)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>TOTAL</span>
                  <span className="text-primary text-lg">{formatCurrency(total, quote.currency)}</span>
                </div>
              </div>
            </div>

            {/* Status history */}
            <div className="card p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Historial</p>
              <div className="space-y-3">
                {statusHistory.map((step, i) => (
                  <div key={step.label} className="flex items-start gap-3">
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                      step.done
                        ? (step.color ? `${step.color} bg-current/10` : 'text-teal-500 bg-teal-50')
                        : 'text-gray-300 bg-gray-100'
                    )}>
                      {step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium',
                        step.done ? 'text-gray-900' : 'text-gray-400'
                      )}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-xs text-gray-400">{formatDate(step.date)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick info */}
            <div className="card p-5 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Información</p>
              {owner && (
                <div className="flex items-center gap-2">
                  <Avatar name={`${owner.firstName} ${owner.lastName}`} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Responsable</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{owner.firstName} {owner.lastName}</p>
                  </div>
                </div>
              )}
              {contact && (
                <div>
                  <p className="text-xs text-gray-500">Contacto</p>
                  <p className="text-sm font-medium text-gray-900">{contact.firstName} {contact.lastName}</p>
                  <p className="text-xs text-gray-400">{contact.email}</p>
                </div>
              )}
              {company && (
                <div>
                  <p className="text-xs text-gray-500">Empresa</p>
                  <p className="text-sm font-medium text-gray-900">{company.name}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Moneda</p>
                <p className="text-sm font-medium text-gray-900">{quote.currency}</p>
              </div>
            </div>

            {/* Preview button */}
            <Button
              variant="secondary"
              className="w-full"
              icon={<Printer className="w-4 h-4" />}
              onClick={() => setPreviewMode(true)}
            >
              Previsualización
            </Button>
          </div>
        )}
      </div>

      {/* Preview close bar */}
      {previewMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-navy text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-4 z-50">
          <span className="text-sm font-medium">Modo previsualización</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPreviewMode(false)}
          >
            Salir
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Printer className="w-3.5 h-3.5" />}
            onClick={() => window.print()}
          >
            Imprimir
          </Button>
        </div>
      )}

      {/* Add line modal */}
      <AddLineModal
        open={addLineOpen}
        currency={quote.currency}
        onAdd={handleAddLine}
        onClose={() => setAddLineOpen(false)}
      />
    </div>
  )
}
