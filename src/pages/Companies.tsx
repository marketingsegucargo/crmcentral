import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Building2, Globe, Users, DollarSign, MoreHorizontal,
  Edit2, Trash2, ChevronUp, ChevronDown, X, Briefcase,
} from 'lucide-react'
import {
  Button, Badge, Modal, Input, Textarea, Select,
  Avatar, SearchInput, Dropdown, EmptyState, Card,
} from '../components/ui'
import { StatCard } from '../components/shared/StatCard'
import { useCompanyStore, useContactStore, useUserStore, useUIStore } from '../store'
import { useDealStore } from '../store'
import {
  formatCurrency, formatRelativeTime, getStatusColor,
  INDUSTRIES, COMPANY_SIZES,
} from '../utils'
import type { Company, CompanyType, CompanySize } from '../types'

// ─── Types ────────────────────────────────────────────────

interface CompanyFormData {
  name: string
  domain: string
  industry: string
  type: CompanyType
  size: CompanySize | ''
  employeeCount: string
  annualRevenue: string
  phone: string
  website: string
  description: string
  ownerId: string
}

const COMPANY_TYPE_OPTIONS: { label: string; value: CompanyType }[] = [
  { label: 'Prospecto', value: 'prospect' },
  { label: 'Cliente', value: 'customer' },
  { label: 'Partner', value: 'partner' },
  { label: 'Competidor', value: 'competitor' },
  { label: 'Proveedor', value: 'vendor' },
]

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

// ─── Company Form Modal ────────────────────────────────────

interface CompanyFormModalProps {
  open: boolean
  onClose: () => void
  editing: Company | null
}

function CompanyFormModal({ open, onClose, editing }: CompanyFormModalProps) {
  const { addCompany, updateCompany } = useCompanyStore()
  const { users } = useUserStore()
  const { addToast } = useUIStore()

  const defaultForm: CompanyFormData = {
    name: '',
    domain: '',
    industry: '',
    type: 'prospect',
    size: '',
    employeeCount: '',
    annualRevenue: '',
    phone: '',
    website: '',
    description: '',
    ownerId: users[0]?.id ?? '',
  }

  const [form, setForm] = useState<CompanyFormData>(defaultForm)
  const [errors, setErrors] = useState<Partial<Record<keyof CompanyFormData, string>>>({})

  React.useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          name: editing.name,
          domain: editing.domain ?? '',
          industry: editing.industry ?? '',
          type: editing.type,
          size: editing.size ?? '',
          employeeCount: editing.employeeCount?.toString() ?? '',
          annualRevenue: editing.annualRevenue?.toString() ?? '',
          phone: editing.phone ?? '',
          website: editing.website ?? '',
          description: editing.description ?? '',
          ownerId: editing.ownerId,
        })
      } else {
        setForm(defaultForm)
      }
      setErrors({})
    }
  }, [open, editing])

  function set(field: keyof CompanyFormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof CompanyFormData, string>> = {}
    if (!form.name.trim()) newErrors.name = 'Nombre requerido'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    const data = {
      name: form.name.trim(),
      domain: form.domain.trim() || undefined,
      industry: form.industry || undefined,
      type: form.type,
      size: (form.size as CompanySize) || undefined,
      employeeCount: form.employeeCount ? parseInt(form.employeeCount) : undefined,
      annualRevenue: form.annualRevenue ? parseFloat(form.annualRevenue) : undefined,
      phone: form.phone.trim() || undefined,
      website: form.website.trim() || undefined,
      description: form.description.trim() || undefined,
      ownerId: form.ownerId,
      tags: editing?.tags ?? [],
    }
    if (editing) {
      updateCompany(editing.id, data)
      addToast({ type: 'success', title: 'Empresa actualizada', message: `${form.name} fue actualizada.` })
    } else {
      addCompany(data)
      addToast({ type: 'success', title: 'Empresa creada', message: `${form.name} fue agregada.` })
    }
    onClose()
  }

  const industryOptions = INDUSTRIES.map((i) => ({ label: i, value: i }))
  const userOptions = users.map((u) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar Empresa' : 'Nueva Empresa'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editing ? 'Guardar Cambios' : 'Crear Empresa'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre de la empresa"
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            error={errors.name}
            placeholder="Tecnova Solutions"
          />
          <Input
            label="Dominio"
            value={form.domain}
            onChange={(e) => set('domain', e.target.value)}
            placeholder="tecnova.mx"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Industria"
            value={form.industry}
            onChange={(e) => set('industry', e.target.value)}
            options={industryOptions}
            placeholder="Seleccionar industria..."
          />
          <Select
            label="Tipo"
            value={form.type}
            onChange={(e) => set('type', e.target.value as CompanyType)}
            options={COMPANY_TYPE_OPTIONS}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Tamaño"
            value={form.size}
            onChange={(e) => set('size', e.target.value)}
            options={COMPANY_SIZES}
            placeholder="Seleccionar tamaño..."
          />
          <Input
            label="Número de empleados"
            type="number"
            value={form.employeeCount}
            onChange={(e) => set('employeeCount', e.target.value)}
            placeholder="150"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ingresos anuales (USD)"
            type="number"
            value={form.annualRevenue}
            onChange={(e) => set('annualRevenue', e.target.value)}
            placeholder="5000000"
          />
          <Input
            label="Teléfono"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+52 55 1234-5678"
          />
        </div>
        <Input
          label="Sitio web"
          type="url"
          value={form.website}
          onChange={(e) => set('website', e.target.value)}
          placeholder="https://empresa.com"
        />
        <Select
          label="Responsable"
          value={form.ownerId}
          onChange={(e) => set('ownerId', e.target.value)}
          options={userOptions}
        />
        <Textarea
          label="Descripción"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Describe brevemente la empresa..."
          rows={3}
        />
      </div>
    </Modal>
  )
}

// ─── Delete Confirm Modal ──────────────────────────────────

interface DeleteModalProps {
  open: boolean
  companyName: string
  onConfirm: () => void
  onClose: () => void
}

function DeleteModal({ open, companyName, onConfirm, onClose }: DeleteModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Eliminar Empresa"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm}>Eliminar</Button>
        </>
      }
    >
      <p className="text-gray-600 text-sm">
        ¿Estás seguro de que deseas eliminar{' '}
        <span className="font-semibold text-gray-900">{companyName}</span>?
        Esta acción no se puede deshacer.
      </p>
    </Modal>
  )
}

// ─── Main Companies Page ───────────────────────────────────

export default function Companies() {
  const navigate = useNavigate()
  const {
    companies, searchQuery, filterType,
    isFormOpen, editingCompany,
    setSearch, setFilterType,
    openForm, closeForm, deleteCompany, getFiltered,
  } = useCompanyStore()
  const { contacts } = useContactStore()
  const { deals } = useDealStore()
  const { users } = useUserStore()
  const { addToast } = useUIStore()

  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null)

  const filtered = getFiltered()

  const TYPE_FILTER_CHIPS = [
    { label: 'Todas', value: '' },
    { label: 'Prospecto', value: 'prospect' },
    { label: 'Cliente', value: 'customer' },
    { label: 'Partner', value: 'partner' },
    { label: 'Competidor', value: 'competitor' },
    { label: 'Proveedor', value: 'vendor' },
  ]

  function getContactCount(companyId: string) {
    return contacts.filter((c) => c.companyId === companyId).length
  }

  function getOpenDealCount(companyId: string) {
    return deals.filter((d) => d.companyId === companyId && d.status === 'open').length
  }

  function handleDelete(company: Company) {
    setDeleteTarget(company)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    deleteCompany(deleteTarget.id)
    addToast({ type: 'success', title: 'Empresa eliminada', message: `${deleteTarget.name} fue eliminada.` })
    setDeleteTarget(null)
  }

  // Stats
  const customerCount = companies.filter((c) => c.type === 'customer').length
  const prospectCount = companies.filter((c) => c.type === 'prospect').length
  const totalRevenue = companies.reduce((sum, c) => sum + (c.annualRevenue ?? 0), 0)

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Empresas</h1>
          <span className="badge bg-primary/10 text-primary font-semibold">{companies.length}</span>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => openForm()}
        >
          Nueva Empresa
        </Button>
      </div>

      {/* ── Filters ────────────────────────────────── */}
      <div className="px-6 py-3 border-b border-gray-100 bg-white flex-shrink-0 space-y-3">
        <div className="flex items-center gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearch}
            placeholder="Buscar por nombre, dominio, industria..."
            className="w-72"
          />
          {(filterType || searchQuery) && (
            <button
              onClick={() => { setSearch(''); setFilterType('') }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Limpiar
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {TYPE_FILTER_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setFilterType(chip.value)}
              className={`filter-chip ${filterType === chip.value ? 'active' : ''}`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────── */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Total Empresas"
            value={companies.length}
            icon={<Building2 className="w-5 h-5" />}
            color="primary"
          />
          <StatCard
            title="Clientes"
            value={customerCount}
            icon={<Users className="w-5 h-5" />}
            color="teal"
          />
          <StatCard
            title="Prospectos"
            value={prospectCount}
            icon={<Briefcase className="w-5 h-5" />}
            color="orange"
          />
          <StatCard
            title="Ingresos totales"
            value={formatCurrency(totalRevenue)}
            icon={<DollarSign className="w-5 h-5" />}
            color="purple"
          />
        </div>
      </div>

      {/* ── Table ──────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-8 h-8" />}
            title="No se encontraron empresas"
            description={searchQuery || filterType
              ? 'Intenta ajustar los filtros de búsqueda.'
              : 'Agrega tu primera empresa para comenzar.'}
            action={!searchQuery && !filterType ? {
              label: 'Nueva Empresa',
              onClick: () => openForm(),
            } : undefined}
          />
        ) : (
          <table className="w-full min-w-[900px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-gray-100">
                <th className="table-header pl-6">Empresa</th>
                <th className="table-header">Industria</th>
                <th className="table-header">Tipo</th>
                <th className="table-header">Tamaño</th>
                <th className="table-header text-center">Contactos</th>
                <th className="table-header text-center">Deals abiertos</th>
                <th className="table-header">Ingresos anuales</th>
                <th className="table-header">Responsable</th>
                <th className="table-header">Última actividad</th>
                <th className="table-header w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((company) => {
                const owner = users.find((u) => u.id === company.ownerId)
                const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : '—'
                const contactCount = getContactCount(company.id)
                const dealCount = getOpenDealCount(company.id)

                return (
                  <tr
                    key={company.id}
                    className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/companies/${company.id}`)}
                  >
                    {/* Name + Logo */}
                    <td className="table-cell pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={company.name}
                          src={company.logoUrl}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{company.name}</p>
                          {company.domain && (
                            <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {company.domain}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="table-cell">
                      <span className="text-sm text-gray-600">{company.industry ?? '—'}</span>
                    </td>

                    {/* Type */}
                    <td className="table-cell">
                      <Badge className={TYPE_COLORS[company.type]}>
                        {TYPE_LABELS[company.type]}
                      </Badge>
                    </td>

                    {/* Size */}
                    <td className="table-cell">
                      <span className="text-sm text-gray-600">{company.size ?? '—'}</span>
                    </td>

                    {/* Contact count */}
                    <td className="table-cell text-center">
                      <span className={`text-sm font-semibold ${contactCount > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                        {contactCount}
                      </span>
                    </td>

                    {/* Open deals */}
                    <td className="table-cell text-center">
                      <span className={`text-sm font-semibold ${dealCount > 0 ? 'text-primary' : 'text-gray-300'}`}>
                        {dealCount}
                      </span>
                    </td>

                    {/* Revenue */}
                    <td className="table-cell">
                      <span className="text-sm text-gray-700 font-medium">
                        {company.annualRevenue ? formatCurrency(company.annualRevenue) : '—'}
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Avatar name={ownerName} size="xs" />
                        <span className="text-sm text-gray-600 truncate max-w-[100px]">{ownerName}</span>
                      </div>
                    </td>

                    {/* Last Activity */}
                    <td className="table-cell">
                      <span className="text-sm text-gray-400">
                        {company.lastActivityAt ? formatRelativeTime(company.lastActivityAt) : '—'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="table-cell pr-4" onClick={(e) => e.stopPropagation()}>
                      <Dropdown
                        trigger={
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        }
                        items={[
                          {
                            label: 'Ver detalle',
                            icon: <Building2 className="w-4 h-4" />,
                            onClick: () => navigate(`/companies/${company.id}`),
                          },
                          {
                            label: 'Editar',
                            icon: <Edit2 className="w-4 h-4" />,
                            onClick: () => openForm(company),
                          },
                          {
                            label: 'Eliminar',
                            icon: <Trash2 className="w-4 h-4" />,
                            onClick: () => handleDelete(company),
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

      {/* ── Modals ─────────────────────────────────── */}
      <CompanyFormModal open={isFormOpen} onClose={closeForm} editing={editingCompany} />
      <DeleteModal
        open={!!deleteTarget}
        companyName={deleteTarget?.name ?? ''}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
