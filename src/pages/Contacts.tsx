import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Upload, Users, Trash2, UserCheck, Download,
  MoreHorizontal, Mail, Phone, Briefcase, ChevronUp,
  ChevronDown, CheckSquare, Square, Edit2, X,
} from 'lucide-react'
import {
  Button, Badge, Modal, Input, Textarea, Select,
  Avatar, SearchInput, Dropdown, EmptyState, Progress,
} from '../components/ui'
import { StatCard } from '../components/shared/StatCard'
import { useContactStore, useUserStore, useUIStore } from '../store'
import {
  formatRelativeTime, getLifecycleColor, getLifecycleLabel,
  LEAD_SOURCES,
} from '../utils'
import type { Contact, LifecycleStage, LeadSource } from '../types'

// ─── Types ────────────────────────────────────────────────

interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  jobTitle: string
  companyName: string
  lifecycleStage: LifecycleStage
  source: LeadSource
  ownerId: string
  tags: string
  notes: string
}

const LIFECYCLE_STAGES: { label: string; value: LifecycleStage }[] = [
  { label: 'Suscriptor', value: 'subscriber' },
  { label: 'Lead', value: 'lead' },
  { label: 'MQL', value: 'marketing_qualified' },
  { label: 'SQL', value: 'sales_qualified' },
  { label: 'Oportunidad', value: 'opportunity' },
  { label: 'Cliente', value: 'customer' },
  { label: 'Evangelista', value: 'evangelist' },
]

const STAGE_FILTER_CHIPS: { label: string; value: string }[] = [
  { label: 'Todos', value: '' },
  { label: 'Lead', value: 'lead' },
  { label: 'MQL', value: 'marketing_qualified' },
  { label: 'SQL', value: 'sales_qualified' },
  { label: 'Oportunidad', value: 'opportunity' },
  { label: 'Cliente', value: 'customer' },
]

// ─── Contact Form Modal ────────────────────────────────────

interface ContactFormModalProps {
  open: boolean
  onClose: () => void
  editing: Contact | null
}

function ContactFormModal({ open, onClose, editing }: ContactFormModalProps) {
  const { addContact, updateContact } = useContactStore()
  const { users } = useUserStore()
  const { addToast } = useUIStore()

  const defaultForm: ContactFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    companyName: '',
    lifecycleStage: 'lead',
    source: 'direct',
    ownerId: users[0]?.id ?? '',
    tags: '',
    notes: '',
  }

  const [form, setForm] = useState<ContactFormData>(defaultForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({})

  React.useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          firstName: editing.firstName,
          lastName: editing.lastName,
          email: editing.email,
          phone: editing.phone ?? '',
          jobTitle: editing.jobTitle ?? '',
          companyName: editing.companyName ?? '',
          lifecycleStage: editing.lifecycleStage,
          source: editing.source,
          ownerId: editing.ownerId,
          tags: editing.tags.join(', '),
          notes: editing.notes ?? '',
        })
      } else {
        setForm(defaultForm)
      }
      setErrors({})
    }
  }, [open, editing])

  function set(field: keyof ContactFormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {}
    if (!form.firstName.trim()) newErrors.firstName = 'Nombre requerido'
    if (!form.lastName.trim()) newErrors.lastName = 'Apellido requerido'
    if (!form.email.trim()) newErrors.email = 'Email requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email inválido'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    if (editing) {
      updateContact(editing.id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        jobTitle: form.jobTitle.trim() || undefined,
        companyName: form.companyName.trim() || undefined,
        lifecycleStage: form.lifecycleStage,
        source: form.source,
        ownerId: form.ownerId,
        tags,
        notes: form.notes.trim() || undefined,
      })
      addToast({ type: 'success', title: 'Contacto actualizado', message: `${form.firstName} ${form.lastName} fue actualizado.` })
    } else {
      addContact({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        jobTitle: form.jobTitle.trim() || undefined,
        companyName: form.companyName.trim() || undefined,
        lifecycleStage: form.lifecycleStage,
        status: 'active',
        source: form.source,
        ownerId: form.ownerId,
        tags,
        notes: form.notes.trim() || undefined,
        leadScore: 0,
      })
      addToast({ type: 'success', title: 'Contacto creado', message: `${form.firstName} ${form.lastName} fue agregado.` })
    }
    onClose()
  }

  const userOptions = users.map((u) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar Contacto' : 'Nuevo Contacto'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editing ? 'Guardar Cambios' : 'Crear Contacto'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre"
            required
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            error={errors.firstName}
            placeholder="Roberto"
          />
          <Input
            label="Apellido"
            required
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            error={errors.lastName}
            placeholder="Guzmán"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            required
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            error={errors.email}
            placeholder="roberto@empresa.com"
          />
          <Input
            label="Teléfono"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+52 55 1234-5678"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cargo"
            value={form.jobTitle}
            onChange={(e) => set('jobTitle', e.target.value)}
            placeholder="Director de Ventas"
          />
          <Input
            label="Empresa"
            value={form.companyName}
            onChange={(e) => set('companyName', e.target.value)}
            placeholder="Tecnova Solutions"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Etapa del ciclo de vida"
            value={form.lifecycleStage}
            onChange={(e) => set('lifecycleStage', e.target.value as LifecycleStage)}
            options={LIFECYCLE_STAGES}
          />
          <Select
            label="Fuente"
            value={form.source}
            onChange={(e) => set('source', e.target.value as LeadSource)}
            options={LEAD_SOURCES}
          />
        </div>
        <Select
          label="Responsable"
          value={form.ownerId}
          onChange={(e) => set('ownerId', e.target.value)}
          options={userOptions}
        />
        <Input
          label="Etiquetas"
          value={form.tags}
          onChange={(e) => set('tags', e.target.value)}
          placeholder="enterprise, vip, tech (separadas por comas)"
          hint="Separa las etiquetas con comas"
        />
        <Textarea
          label="Notas"
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Notas adicionales sobre este contacto..."
          rows={3}
        />
      </div>
    </Modal>
  )
}

// ─── Delete Confirmation Modal ─────────────────────────────

interface DeleteModalProps {
  open: boolean
  contactName: string
  onConfirm: () => void
  onClose: () => void
}

function DeleteModal({ open, contactName, onConfirm, onClose }: DeleteModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Eliminar Contacto"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm}>Eliminar</Button>
        </>
      }
    >
      <p className="text-gray-600 text-sm">
        ¿Estás seguro de que deseas eliminar a{' '}
        <span className="font-semibold text-gray-900">{contactName}</span>?
        Esta acción no se puede deshacer.
      </p>
    </Modal>
  )
}

// ─── Sort Header ───────────────────────────────────────────

function SortHeader({
  label,
  field,
  sortField,
  sortDir,
  onSort,
}: {
  label: string
  field: keyof Contact
  sortField: keyof Contact
  sortDir: 'asc' | 'desc'
  onSort: (f: keyof Contact) => void
}) {
  const active = sortField === field
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700 transition-colors"
    >
      {label}
      <span className={active ? 'text-primary' : 'text-gray-300'}>
        {active && sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </span>
    </button>
  )
}

// ─── Main Contacts Page ────────────────────────────────────

export default function Contacts() {
  const navigate = useNavigate()
  const {
    contacts, searchQuery, filterStage, filterOwner,
    sortField, sortDir, isFormOpen, editingContact,
    setSearch, setFilterStage, setFilterOwner, setSort,
    openForm, closeForm, deleteContact, getFiltered,
  } = useContactStore()
  const { users } = useUserStore()
  const { addToast } = useUIStore()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkOwnerOpen, setBulkOwnerOpen] = useState(false)
  const [bulkOwnerValue, setBulkOwnerValue] = useState('')

  const filtered = getFiltered()

  // Stage counts for stats row
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    contacts.forEach((c) => {
      counts[c.lifecycleStage] = (counts[c.lifecycleStage] ?? 0) + 1
    })
    return counts
  }, [contacts])

  // Selection helpers
  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length
  const someSelected = selectedIds.size > 0 && !allSelected

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)))
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleDelete(contact: Contact) {
    setDeleteTarget(contact)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    deleteContact(deleteTarget.id)
    addToast({ type: 'success', title: 'Contacto eliminado', message: `${deleteTarget.firstName} ${deleteTarget.lastName} fue eliminado.` })
    setDeleteTarget(null)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(deleteTarget.id)
      return next
    })
  }

  function handleBulkDelete() {
    selectedIds.forEach((id) => deleteContact(id))
    addToast({ type: 'success', title: `${selectedIds.size} contactos eliminados` })
    setSelectedIds(new Set())
    setBulkDeleteOpen(false)
  }

  function handleBulkAssign() {
    if (!bulkOwnerValue) return
    const { updateContact } = useContactStore.getState()
    selectedIds.forEach((id) => updateContact(id, { ownerId: bulkOwnerValue }))
    addToast({ type: 'success', title: `${selectedIds.size} contactos asignados` })
    setSelectedIds(new Set())
    setBulkOwnerOpen(false)
    setBulkOwnerValue('')
  }

  function handleExport() {
    addToast({ type: 'info', title: 'Exportando contactos...', message: `Se exportarán ${selectedIds.size || filtered.length} contactos.` })
    setSelectedIds(new Set())
  }

  const ownerOptions = [{ label: 'Todos los responsables', value: '' }, ...users.map((u) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }))]

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Contactos</h1>
          <span className="badge bg-primary/10 text-primary font-semibold">{contacts.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => addToast({ type: 'info', title: 'Importar contactos', message: 'Función disponible próximamente.' })}
          >
            Importar
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => openForm()}
          >
            Nuevo Contacto
          </Button>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────── */}
      <div className="px-6 py-3 border-b border-gray-100 bg-white flex-shrink-0 space-y-3">
        <div className="flex items-center gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearch}
            placeholder="Buscar por nombre, email, empresa..."
            className="w-72"
          />
          <select
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            className="input-field w-48 text-sm"
          >
            {ownerOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {(filterStage || filterOwner || searchQuery) && (
            <button
              onClick={() => { setSearch(''); setFilterStage(''); setFilterOwner('') }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Limpiar filtros
            </button>
          )}
        </div>
        {/* Lifecycle stage filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {STAGE_FILTER_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setFilterStage(chip.value)}
              className={`filter-chip ${filterStage === chip.value ? 'active' : ''}`}
            >
              {chip.label}
              {chip.value && stageCounts[chip.value] !== undefined && (
                <span className={`ml-1.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${filterStage === chip.value ? 'bg-white/30' : 'bg-gray-100 text-gray-500'}`}>
                  {stageCounts[chip.value] ?? 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────── */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Total Contactos"
            value={contacts.length}
            icon={<Users className="w-5 h-5" />}
            color="primary"
          />
          <StatCard
            title="Leads activos"
            value={(stageCounts['lead'] ?? 0) + (stageCounts['marketing_qualified'] ?? 0) + (stageCounts['sales_qualified'] ?? 0)}
            icon={<Phone className="w-5 h-5" />}
            color="teal"
          />
          <StatCard
            title="Clientes"
            value={stageCounts['customer'] ?? 0}
            icon={<CheckSquare className="w-5 h-5" />}
            color="purple"
          />
          <StatCard
            title="Oportunidades"
            value={stageCounts['opportunity'] ?? 0}
            icon={<Briefcase className="w-5 h-5" />}
            color="orange"
          />
        </div>
      </div>

      {/* ── Bulk Actions Bar ───────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="px-6 py-2.5 bg-primary/5 border-b border-primary/20 flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-medium text-primary">{selectedIds.size} seleccionados</span>
          <div className="flex items-center gap-2 ml-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setBulkDeleteOpen(true)}
            >
              Eliminar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<UserCheck className="w-3.5 h-3.5" />}
              onClick={() => setBulkOwnerOpen(true)}
            >
              Asignar Responsable
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExport}
            >
              Exportar
            </Button>
          </div>
          <button
            className="ml-auto text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            onClick={() => setSelectedIds(new Set())}
          >
            <X className="w-3.5 h-3.5" /> Limpiar selección
          </button>
        </div>
      )}

      {/* ── Table ──────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title="No se encontraron contactos"
            description={searchQuery || filterStage || filterOwner
              ? 'Intenta ajustar los filtros de búsqueda.'
              : 'Agrega tu primer contacto para comenzar.'}
            action={!searchQuery && !filterStage && !filterOwner ? {
              label: 'Nuevo Contacto',
              onClick: () => openForm(),
            } : undefined}
          />
        ) : (
          <table className="w-full min-w-[900px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-gray-100">
                <th className="table-header w-10 pl-6">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-primary transition-colors">
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : someSelected ? (
                      <div className="w-4 h-4 border-2 border-primary rounded bg-primary/20" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="table-header">
                  <SortHeader label="Contacto" field="firstName" sortField={sortField} sortDir={sortDir} onSort={setSort} />
                </th>
                <th className="table-header">
                  <SortHeader label="Email" field="email" sortField={sortField} sortDir={sortDir} onSort={setSort} />
                </th>
                <th className="table-header">Empresa</th>
                <th className="table-header">
                  <SortHeader label="Etapa" field="lifecycleStage" sortField={sortField} sortDir={sortDir} onSort={setSort} />
                </th>
                <th className="table-header">
                  <SortHeader label="Lead Score" field="leadScore" sortField={sortField} sortDir={sortDir} onSort={setSort} />
                </th>
                <th className="table-header">Responsable</th>
                <th className="table-header">
                  <SortHeader label="Última actividad" field="lastActivityAt" sortField={sortField} sortDir={sortDir} onSort={setSort} />
                </th>
                <th className="table-header w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact) => {
                const owner = users.find((u) => u.id === contact.ownerId)
                const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : '—'
                const isSelected = selectedIds.has(contact.id)

                return (
                  <tr
                    key={contact.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/70 transition-colors cursor-pointer group ${isSelected ? 'bg-primary/3' : ''}`}
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                  >
                    {/* Checkbox */}
                    <td className="table-cell w-10 pl-6" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleSelect(contact.id)}
                        className="text-gray-300 hover:text-primary transition-colors"
                      >
                        {isSelected
                          ? <CheckSquare className="w-4 h-4 text-primary" />
                          : <Square className="w-4 h-4" />
                        }
                      </button>
                    </td>

                    {/* Name + Avatar */}
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={`${contact.firstName} ${contact.lastName}`}
                          src={contact.avatarUrl}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {contact.firstName} {contact.lastName}
                          </p>
                          {contact.jobTitle && (
                            <p className="text-xs text-gray-400 truncate">{contact.jobTitle}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="table-cell">
                      <span className="text-sm text-gray-600 truncate block max-w-[180px]">{contact.email}</span>
                    </td>

                    {/* Company */}
                    <td className="table-cell">
                      {contact.companyName ? (
                        <span className="text-sm text-gray-700 font-medium">{contact.companyName}</span>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>

                    {/* Lifecycle Stage */}
                    <td className="table-cell">
                      <Badge className={getLifecycleColor(contact.lifecycleStage)}>
                        {getLifecycleLabel(contact.lifecycleStage)}
                      </Badge>
                    </td>

                    {/* Lead Score */}
                    <td className="table-cell">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <Progress
                          value={contact.leadScore}
                          size="sm"
                          color={contact.leadScore >= 70 ? 'teal' : contact.leadScore >= 40 ? 'primary' : 'yellow'}
                          className="flex-1"
                        />
                        <span className="text-xs font-semibold text-gray-600 w-6 text-right">{contact.leadScore}</span>
                      </div>
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
                        {contact.lastActivityAt ? formatRelativeTime(contact.lastActivityAt) : '—'}
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
                            label: 'Editar',
                            icon: <Edit2 className="w-4 h-4" />,
                            onClick: () => openForm(contact),
                          },
                          {
                            label: 'Enviar Email',
                            icon: <Mail className="w-4 h-4" />,
                            onClick: () => addToast({ type: 'info', title: 'Abrir email', message: contact.email }),
                          },
                          {
                            label: 'Crear Deal',
                            icon: <Briefcase className="w-4 h-4" />,
                            onClick: () => navigate('/deals'),
                          },
                          {
                            label: 'Eliminar',
                            icon: <Trash2 className="w-4 h-4" />,
                            onClick: () => handleDelete(contact),
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
      <ContactFormModal open={isFormOpen} onClose={closeForm} editing={editingContact} />

      <DeleteModal
        open={!!deleteTarget}
        contactName={deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}` : ''}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Bulk delete confirm */}
      <Modal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        title="Eliminar Contactos"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBulkDeleteOpen(false)}>Cancelar</Button>
            <Button variant="danger" onClick={handleBulkDelete}>
              Eliminar {selectedIds.size} contactos
            </Button>
          </>
        }
      >
        <p className="text-gray-600 text-sm">
          ¿Estás seguro de que deseas eliminar{' '}
          <span className="font-semibold text-gray-900">{selectedIds.size} contactos</span>?
          Esta acción no se puede deshacer.
        </p>
      </Modal>

      {/* Bulk assign owner */}
      <Modal
        open={bulkOwnerOpen}
        onClose={() => setBulkOwnerOpen(false)}
        title="Asignar Responsable"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBulkOwnerOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleBulkAssign} disabled={!bulkOwnerValue}>
              Asignar
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-gray-600 text-sm">
            Asignar responsable a {selectedIds.size} contactos seleccionados.
          </p>
          <Select
            label="Responsable"
            value={bulkOwnerValue}
            onChange={(e) => setBulkOwnerValue(e.target.value)}
            options={users.map((u) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }))}
            placeholder="Seleccionar responsable..."
          />
        </div>
      </Modal>
    </div>
  )
}
