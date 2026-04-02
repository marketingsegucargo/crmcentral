import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Globe, Phone, Building2, Edit2, Check, X,
  Users, DollarSign, Tag, Plus, Briefcase, Mail, User,
} from 'lucide-react'
import { Button, Badge, Avatar } from '../components/ui'
import { ActivityTimeline } from '../components/shared/ActivityTimeline'
import { useCompanyStore, useContactStore, useUserStore, useUIStore } from '../store'
import { useDealStore } from '../store'
import {
  formatCurrency, formatDate, formatRelativeTime,
  getLifecycleColor, getLifecycleLabel, INDUSTRIES,
} from '../utils'
import type { CompanyType, CompanySize } from '../types'

// ─── Type / size constants ─────────────────────────────────

const TYPE_COLORS: Record<CompanyType, string> = {
  prospect: 'bg-blue-50 text-blue-700',
  customer: 'bg-teal-50 text-teal-700',
  partner: 'bg-purple-50 text-purple-700',
  competitor: 'bg-red-50 text-red-600',
  vendor: 'bg-orange-50 text-orange-700',
}

const TYPE_LABELS: Record<CompanyType, string> = {
  prospect: 'Prospecto',
  customer: 'Cliente',
  partner: 'Partner',
  competitor: 'Competidor',
  vendor: 'Proveedor',
}

const COMPANY_TYPE_OPTIONS: { label: string; value: CompanyType }[] = [
  { label: 'Prospecto', value: 'prospect' },
  { label: 'Cliente', value: 'customer' },
  { label: 'Partner', value: 'partner' },
  { label: 'Competidor', value: 'competitor' },
  { label: 'Proveedor', value: 'vendor' },
]

const COMPANY_SIZE_OPTIONS: { label: string; value: CompanySize }[] = [
  { label: '1-10', value: '1-10' },
  { label: '11-50', value: '11-50' },
  { label: '51-200', value: '51-200' },
  { label: '201-500', value: '201-500' },
  { label: '501-1000', value: '501-1000' },
  { label: '1001-5000', value: '1001-5000' },
  { label: '5000+', value: '5000+' },
]

// ─── Inline editable field ─────────────────────────────────

interface EditableFieldProps {
  label: string
  value: string
  icon?: React.ReactNode
  onSave: (value: string) => void
  type?: 'text' | 'email' | 'tel' | 'url' | 'number'
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
    <div>
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
          {type === 'url' && value ? (
            <a
              href={value.startsWith('http') ? value : `https://${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex-1 truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {value}
            </a>
          ) : (
            <span className={`text-sm flex-1 ${value ? 'text-gray-800' : 'text-gray-300 italic'}`}>
              {value || emptyLabel}
            </span>
          )}
          <Edit2 className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover/field:opacity-100 transition-opacity flex-shrink-0" />
        </div>
      )}
    </div>
  )
}

// ─── Inline editable select ────────────────────────────────

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

  return (
    <div>
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
            {renderValue ? renderValue(value) : <span className="text-sm text-gray-800">{options.find((o) => o.value === value)?.label ?? value}</span>}
          </span>
          <Edit2 className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover/field:opacity-100 transition-opacity flex-shrink-0" />
        </div>
      )}
    </div>
  )
}

// ─── Main CompanyDetail Page ───────────────────────────────

export default function CompanyDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { companies, updateCompany } = useCompanyStore()
  const { contacts } = useContactStore()
  const { deals } = useDealStore()
  const { users } = useUserStore()
  const { addToast } = useUIStore()

  const company = companies.find((c) => c.id === id)

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Building2 className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">Empresa no encontrada</p>
        <Button variant="secondary" onClick={() => navigate('/companies')}>
          Volver a Empresas
        </Button>
      </div>
    )
  }

  const owner = users.find((u) => u.id === company.ownerId)
  const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : '—'
  const companyContacts = contacts.filter((c) => c.companyId === company!.id)
  const companyDeals = deals.filter((d) => d.companyId === company!.id)
  const openDeals = companyDeals.filter((d) => d.status === 'open')

  function save(updates: Parameters<typeof updateCompany>[1]) {
    updateCompany(company!.id, updates)
    addToast({ type: 'success', title: 'Empresa actualizada' })
  }

  const industryOptions = INDUSTRIES.map((i) => ({ label: i, value: i }))
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
          onClick={() => navigate('/companies')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Empresas
        </button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Mail className="w-4 h-4" />}
            onClick={() => addToast({ type: 'info', title: 'Email enviado' })}>
            Email
          </Button>
          <Button variant="secondary" size="sm" icon={<Phone className="w-4 h-4" />}
            onClick={() => addToast({ type: 'info', title: 'Llamar', message: company.phone ?? 'Sin teléfono' })}>
            Llamar
          </Button>
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/deals')}>
            Crear Deal
          </Button>
        </div>
      </div>

      {/* ── Company Hero ────────────────────────────── */}
      <div className="px-6 py-6 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-start gap-5">
          <Avatar name={company.name} src={company.logoUrl} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {company.domain && (
                    <a
                      href={`https://${company.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {company.domain}
                    </a>
                  )}
                  {company.industry && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-sm text-gray-500">{company.industry}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge className={TYPE_COLORS[company.type]}>
                  {TYPE_LABELS[company.type]}
                </Badge>
              </div>
            </div>

            {/* Quick stats strip */}
            <div className="flex items-center gap-5 mt-3 flex-wrap">
              {company.annualRevenue && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-semibold">{formatCurrency(company.annualRevenue)}</span>
                  <span className="text-gray-400 text-xs">ingresos anuales</span>
                </div>
              )}
              {company.employeeCount && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-semibold">{company.employeeCount}</span>
                  <span className="text-gray-400 text-xs">empleados</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold">{companyContacts.length}</span>
                <span className="text-gray-400 text-xs">contactos</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold">{openDeals.length}</span>
                <span className="text-gray-400 text-xs">deals abiertos</span>
              </div>
              {company.lastActivityAt && (
                <div className="text-xs text-gray-400">
                  Última actividad {formatRelativeTime(company.lastActivityAt)}
                </div>
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
              <ActivityTimeline contactId={undefined} dealId={undefined} />
            </div>
          </div>

          {/* Right: Properties + Associated (1/3) */}
          <div className="w-[340px] flex-shrink-0 overflow-auto bg-white">
            {/* Company Properties */}
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Propiedades</h3>
              <div className="space-y-4">
                <EditableField
                  label="Dominio"
                  value={company.domain ?? ''}
                  icon={<Globe className="w-3.5 h-3.5" />}
                  type="url"
                  onSave={(v) => save({ domain: v || undefined })}
                  emptyLabel="Agregar dominio..."
                />
                <EditableField
                  label="Teléfono"
                  value={company.phone ?? ''}
                  icon={<Phone className="w-3.5 h-3.5" />}
                  type="tel"
                  onSave={(v) => save({ phone: v || undefined })}
                  emptyLabel="Agregar teléfono..."
                />
                <EditableField
                  label="Sitio web"
                  value={company.website ?? ''}
                  icon={<Globe className="w-3.5 h-3.5" />}
                  type="url"
                  onSave={(v) => save({ website: v || undefined })}
                  emptyLabel="Agregar sitio web..."
                />
                <EditableSelect
                  label="Industria"
                  value={company.industry ?? ''}
                  options={[{ label: 'Sin industria', value: '' }, ...industryOptions]}
                  icon={<Building2 className="w-3.5 h-3.5" />}
                  onSave={(v) => save({ industry: v || undefined })}
                />
                <EditableSelect
                  label="Tipo"
                  value={company.type}
                  options={COMPANY_TYPE_OPTIONS}
                  onSave={(v) => save({ type: v as CompanyType })}
                  renderValue={(v) => (
                    <Badge className={TYPE_COLORS[v as CompanyType]}>
                      {TYPE_LABELS[v as CompanyType]}
                    </Badge>
                  )}
                />
                <EditableSelect
                  label="Tamaño"
                  value={company.size ?? ''}
                  options={[{ label: 'Sin especificar', value: '' }, ...COMPANY_SIZE_OPTIONS]}
                  onSave={(v) => save({ size: (v as CompanySize) || undefined })}
                />
                <EditableField
                  label="Ingresos anuales (USD)"
                  value={company.annualRevenue?.toString() ?? ''}
                  icon={<DollarSign className="w-3.5 h-3.5" />}
                  type="number"
                  onSave={(v) => save({ annualRevenue: v ? parseFloat(v) : undefined })}
                  emptyLabel="Agregar ingresos..."
                />
                <EditableSelect
                  label="Responsable"
                  value={company.ownerId}
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

                {/* Tags */}
                {company.tags.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Etiquetas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {company.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="pt-2 border-t border-gray-50 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Creada</span>
                    <span className="text-gray-600 font-medium">{formatDate(company.createdAt)}</span>
                  </div>
                  {company.lastActivityAt && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Última actividad</span>
                      <span className="text-gray-600 font-medium">{formatRelativeTime(company.lastActivityAt)}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {company.description && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Descripción</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{company.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Associated Contacts */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Contactos
                  {companyContacts.length > 0 && (
                    <span className="ml-2 text-xs font-medium text-gray-400">({companyContacts.length})</span>
                  )}
                </h3>
                <button
                  onClick={() => navigate('/contacts')}
                  className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Agregar
                </button>
              </div>
              {companyContacts.length === 0 ? (
                <div className="text-center py-5">
                  <Users className="w-7 h-7 text-gray-200 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-400">Sin contactos asociados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {companyContacts.slice(0, 5).map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => navigate(`/contacts/${contact.id}`)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      <Avatar name={`${contact.firstName} ${contact.lastName}`} src={contact.avatarUrl} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-primary transition-colors">
                          {contact.firstName} {contact.lastName}
                        </p>
                        {contact.jobTitle && (
                          <p className="text-xs text-gray-400 truncate">{contact.jobTitle}</p>
                        )}
                      </div>
                      <Badge className={`${getLifecycleColor(contact.lifecycleStage)} text-xs flex-shrink-0`}>
                        {getLifecycleLabel(contact.lifecycleStage)}
                      </Badge>
                    </div>
                  ))}
                  {companyContacts.length > 5 && (
                    <button
                      onClick={() => navigate('/contacts')}
                      className="w-full text-xs text-primary hover:underline py-1 text-center"
                    >
                      Ver {companyContacts.length - 5} más...
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Associated Deals */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Deals
                  {companyDeals.length > 0 && (
                    <span className="ml-2 text-xs font-medium text-gray-400">({companyDeals.length})</span>
                  )}
                </h3>
                <button
                  onClick={() => navigate('/deals')}
                  className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Nuevo
                </button>
              </div>
              {companyDeals.length === 0 ? (
                <div className="text-center py-5">
                  <Briefcase className="w-7 h-7 text-gray-200 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-400">Sin deals asociados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {companyDeals.map((deal) => (
                    <div
                      key={deal.id}
                      onClick={() => navigate('/deals')}
                      className="p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/2 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-800 truncate flex-1 group-hover:text-primary transition-colors">
                          {deal.name}
                        </p>
                        <Badge className={dealStatusColors[deal.status]}>
                          {dealStatusLabels[deal.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs font-semibold text-gray-600">
                          {formatCurrency(deal.value, deal.currency)}
                        </span>
                        {deal.closeDate && (
                          <span className="text-xs text-gray-400">
                            Cierre: {formatDate(deal.closeDate, 'dd MMM')}
                          </span>
                        )}
                      </div>
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
