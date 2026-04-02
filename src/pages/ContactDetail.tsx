import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Mail, Phone, Briefcase, Calendar,
  Tag, Edit2, Check, X, Globe, Building2, User,
  Plus, TrendingUp, DollarSign,
} from 'lucide-react'
import { Button, Badge, Avatar, Progress, Input, Select } from '../components/ui'
import { ActivityTimeline } from '../components/shared/ActivityTimeline'
import { useContactStore, useCompanyStore, useUserStore, useUIStore } from '../store'
import { useDealStore } from '../store'
import {
  formatDate, formatRelativeTime, formatCurrency,
  getLifecycleColor, getLifecycleLabel, getStatusColor,
  LEAD_SOURCES,
} from '../utils'
import type { LifecycleStage, LeadSource } from '../types'

// ─── Inline editable field ────────────────────────────────

interface EditableFieldProps {
  label: string
  value: string
  icon?: React.ReactNode
  onSave: (value: string) => void
  type?: 'text' | 'email' | 'tel' | 'url'
  emptyLabel?: string
}

function EditableField({ label, value, icon, onSave, type = 'text', emptyLabel = 'Agregar...' }: EditableFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function handleSave() {
    onSave(draft.trim())
    setEditing(false)
  }

  function handleCancel() {
    setDraft(value)
    setEditing(false)
  }

  return (
    <div className="group">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      {editing ? (
        <div className="flex items-center gap-1">
          <input
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel() }}
            autoFocus
            className="input-field text-sm py-1.5 flex-1"
          />
          <button onClick={handleSave} className="p-1.5 rounded-lg bg-teal text-white hover:bg-teal-500 transition-colors">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleCancel} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors group/field"
          onClick={() => { setDraft(value); setEditing(true) }}
        >
          {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
          <span className={`text-sm flex-1 ${value ? 'text-gray-800' : 'text-gray-300 italic'}`}>
            {value || emptyLabel}
          </span>
          <Edit2 className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover/field:opacity-100 transition-opacity flex-shrink-0" />
        </div>
      )}
    </div>
  )
}

// ─── Editable Select Field ─────────────────────────────────

interface EditableSelectProps {
  label: string
  value: string
  options: { label: string; value: string }[]
  onSave: (value: string) => void
  icon?: React.ReactNode
  renderValue?: (value: string) => React.ReactNode
}

function EditableSelect({ label, value, options, onSave, icon, renderValue }: EditableSelectProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function handleSave() {
    onSave(draft)
    setEditing(false)
  }

  const displayLabel = options.find((o) => o.value === value)?.label ?? value

  return (
    <div className="group">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      {editing ? (
        <div className="flex items-center gap-1">
          <select
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            className="input-field text-sm py-1.5 flex-1"
          >
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={handleSave} className="p-1.5 rounded-lg bg-teal text-white hover:bg-teal-500 transition-colors">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors group/field"
          onClick={() => { setDraft(value); setEditing(true) }}
        >
          {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
          <span className="flex-1">
            {renderValue ? renderValue(value) : <span className="text-sm text-gray-800">{displayLabel}</span>}
          </span>
          <Edit2 className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover/field:opacity-100 transition-opacity flex-shrink-0" />
        </div>
      )}
    </div>
  )
}

// ─── Lifecycle Options ────────────────────────────────────

const LIFECYCLE_OPTIONS: { label: string; value: LifecycleStage }[] = [
  { label: 'Suscriptor', value: 'subscriber' },
  { label: 'Lead', value: 'lead' },
  { label: 'MQL', value: 'marketing_qualified' },
  { label: 'SQL', value: 'sales_qualified' },
  { label: 'Oportunidad', value: 'opportunity' },
  { label: 'Cliente', value: 'customer' },
  { label: 'Evangelista', value: 'evangelist' },
]

// ─── Main ContactDetail Page ───────────────────────────────

export default function ContactDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { contacts, updateContact } = useContactStore()
  const { companies } = useCompanyStore()
  const { users } = useUserStore()
  const { addToast } = useUIStore()
  const { deals } = useDealStore()

  const contact = contacts.find((c) => c.id === id)

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          <User className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">Contacto no encontrado</p>
        <Button variant="secondary" onClick={() => navigate('/contacts')}>
          Volver a Contactos
        </Button>
      </div>
    )
  }

  const owner = users.find((u) => u.id === contact.ownerId)
  const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : '—'
  const contactDeals = deals.filter((d) => d.contactIds.includes(contact!.id))

  function save(updates: Parameters<typeof updateContact>[1]) {
    updateContact(contact!.id, updates)
    addToast({ type: 'success', title: 'Contacto actualizado' })
  }

  const userOptions = users.map((u) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }))

  const dealStatusColors: Record<string, string> = {
    open: 'bg-blue-50 text-blue-700',
    won: 'bg-green-50 text-green-700',
    lost: 'bg-red-50 text-red-600',
  }
  const dealStatusLabels: Record<string, string> = {
    open: 'Abierto', won: 'Ganado', lost: 'Perdido',
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/40">
      {/* ── Header bar ─────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <button
          onClick={() => navigate('/contacts')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Contactos
        </button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Mail className="w-4 h-4" />}
            onClick={() => addToast({ type: 'info', title: 'Email', message: contact.email })}>
            Email
          </Button>
          <Button variant="secondary" size="sm" icon={<Phone className="w-4 h-4" />}
            onClick={() => addToast({ type: 'info', title: 'Llamar', message: contact.phone ?? 'Sin teléfono' })}>
            Llamar
          </Button>
          <Button variant="secondary" size="sm" icon={<Calendar className="w-4 h-4" />}
            onClick={() => addToast({ type: 'info', title: 'Nueva tarea creada' })}>
            Nueva Tarea
          </Button>
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/deals')}>
            Crear Deal
          </Button>
        </div>
      </div>

      {/* ── Contact Hero ────────────────────────────── */}
      <div className="px-6 py-6 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-start gap-5">
          <Avatar
            name={`${contact.firstName} ${contact.lastName}`}
            src={contact.avatarUrl}
            size="xl"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {contact.firstName} {contact.lastName}
                </h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {contact.jobTitle && (
                    <span className="text-sm text-gray-500 font-medium">{contact.jobTitle}</span>
                  )}
                  {contact.companyName && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="flex items-center gap-1 text-sm text-primary font-medium cursor-pointer hover:underline"
                        onClick={() => contact.companyId && navigate(`/companies/${contact.companyId}`)}>
                        <Building2 className="w-3.5 h-3.5" />
                        {contact.companyName}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge className={getLifecycleColor(contact.lifecycleStage)}>
                  {getLifecycleLabel(contact.lifecycleStage)}
                </Badge>
              </div>
            </div>

            {/* Lead score bar */}
            <div className="flex items-center gap-3 mt-3 max-w-xs">
              <span className="text-xs text-gray-400 font-medium flex-shrink-0">Lead Score</span>
              <Progress
                value={contact.leadScore}
                color={contact.leadScore >= 70 ? 'teal' : contact.leadScore >= 40 ? 'primary' : 'yellow'}
                size="md"
                className="flex-1"
              />
              <span className="text-sm font-bold text-gray-700 flex-shrink-0 w-6 text-right">{contact.leadScore}</span>
            </div>

            {/* Quick info strip */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  {contact.email}
                </a>
              )}
              {contact.phone && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Phone className="w-3.5 h-3.5" />
                  {contact.phone}
                </span>
              )}
              {contact.lastActivityAt && (
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Última actividad {formatRelativeTime(contact.lastActivityAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column body ─────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <div className="flex gap-0 h-full">
          {/* Left: Activity Timeline (2/3) */}
          <div className="flex-[2] min-w-0 border-r border-gray-100 overflow-auto">
            <div className="p-6">
              <ActivityTimeline contactId={contact!.id} />
            </div>
          </div>

          {/* Right: Properties panel (1/3) */}
          <div className="w-[340px] flex-shrink-0 overflow-auto bg-white">
            {/* Properties */}
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Propiedades del Contacto</h3>
              <div className="space-y-4">
                <EditableField
                  label="Email"
                  value={contact.email}
                  icon={<Mail className="w-3.5 h-3.5" />}
                  type="email"
                  onSave={(v) => save({ email: v })}
                />
                <EditableField
                  label="Teléfono"
                  value={contact.phone ?? ''}
                  icon={<Phone className="w-3.5 h-3.5" />}
                  type="tel"
                  onSave={(v) => save({ phone: v || undefined })}
                  emptyLabel="Agregar teléfono..."
                />
                <EditableField
                  label="Empresa"
                  value={contact.companyName ?? ''}
                  icon={<Building2 className="w-3.5 h-3.5" />}
                  onSave={(v) => save({ companyName: v || undefined })}
                  emptyLabel="Agregar empresa..."
                />
                <EditableField
                  label="Cargo"
                  value={contact.jobTitle ?? ''}
                  icon={<Briefcase className="w-3.5 h-3.5" />}
                  onSave={(v) => save({ jobTitle: v || undefined })}
                  emptyLabel="Agregar cargo..."
                />
                <EditableSelect
                  label="Responsable"
                  value={contact.ownerId}
                  options={userOptions}
                  icon={<User className="w-3.5 h-3.5" />}
                  onSave={(v) => save({ ownerId: v })}
                  renderValue={(v) => {
                    const u = users.find((u) => u.id === v)
                    return u ? (
                      <div className="flex items-center gap-2">
                        <Avatar name={`${u.firstName} ${u.lastName}`} size="xs" />
                        <span className="text-sm text-gray-800">{u.firstName} {u.lastName}</span>
                      </div>
                    ) : <span className="text-sm text-gray-800">{v}</span>
                  }}
                />
                <EditableSelect
                  label="Etapa del ciclo de vida"
                  value={contact.lifecycleStage}
                  options={LIFECYCLE_OPTIONS}
                  onSave={(v) => save({ lifecycleStage: v as LifecycleStage })}
                  renderValue={(v) => (
                    <Badge className={getLifecycleColor(v)}>{getLifecycleLabel(v)}</Badge>
                  )}
                />
                <EditableSelect
                  label="Fuente"
                  value={contact.source}
                  options={LEAD_SOURCES}
                  onSave={(v) => save({ source: v as LeadSource })}
                />

                {/* Tags */}
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Etiquetas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {contact.tags.length > 0 ? (
                      contact.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-300 italic">Sin etiquetas</span>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="pt-2 border-t border-gray-50 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Creado</span>
                    <span className="text-gray-600 font-medium">{formatDate(contact.createdAt)}</span>
                  </div>
                  {contact.lastActivityAt && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Última actividad</span>
                      <span className="text-gray-600 font-medium">{formatRelativeTime(contact.lastActivityAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Associated Deals */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Deals asociados</h3>
                <button
                  onClick={() => navigate('/deals')}
                  className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Nuevo
                </button>
              </div>
              {contactDeals.length === 0 ? (
                <div className="text-center py-6">
                  <DollarSign className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Sin deals asociados</p>
                  <button
                    onClick={() => navigate('/deals')}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    Crear deal
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {contactDeals.map((deal) => (
                    <div
                      key={deal.id}
                      onClick={() => navigate(`/deals`)}
                      className="flex items-start justify-between gap-2 p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/2 transition-all cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-primary transition-colors">
                          {deal.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatCurrency(deal.value, deal.currency)}
                        </p>
                      </div>
                      <Badge className={dealStatusColors[deal.status]}>
                        {dealStatusLabels[deal.status]}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
