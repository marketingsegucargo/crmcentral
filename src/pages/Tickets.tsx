import React, { useState, useMemo } from 'react'
import {
  Plus, List, LayoutGrid, MoreHorizontal, Calendar,
  Edit2, Trash2, Eye, AlertCircle, Mail, Phone,
  MessageSquare, Globe, ChevronDown, X, Hash,
  CheckCircle, Clock, Inbox,
} from 'lucide-react'
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, DragOverlay, closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Button, Badge, Modal, Input, Textarea, Select,
  Avatar, SearchInput, Dropdown, EmptyState, Progress,
} from '../components/ui'
import {
  useTicketStore, usePipelineStore, useUserStore, useUIStore,
  useContactStore, useCompanyStore,
} from '../store'
import {
  formatDate, formatRelativeTime, getStatusColor,
  getPriorityColor, isOverdue, cn, generateId,
} from '../utils'
import type { Ticket, TicketPriority } from '../types'

// ─── Constants ────────────────────────────────────────────

const PRIORITY_OPTIONS: { label: string; value: TicketPriority }[] = [
  { label: 'Baja', value: 'low' },
  { label: 'Media', value: 'medium' },
  { label: 'Alta', value: 'high' },
  { label: 'Urgente', value: 'urgent' },
]

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
}

const STATUS_OPTIONS = [
  { label: 'Abierto', value: 'open' },
  { label: 'Pendiente', value: 'pending' },
  { label: 'Resuelto', value: 'resolved' },
  { label: 'Cerrado', value: 'closed' },
]

const SOURCE_OPTIONS = [
  { label: 'Email', value: 'email' },
  { label: 'Chat', value: 'chat' },
  { label: 'Teléfono', value: 'phone' },
  { label: 'Formulario', value: 'form' },
  { label: 'Redes sociales', value: 'social' },
]

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="w-3.5 h-3.5" />,
  chat: <MessageSquare className="w-3.5 h-3.5" />,
  phone: <Phone className="w-3.5 h-3.5" />,
  form: <Globe className="w-3.5 h-3.5" />,
  social: <Globe className="w-3.5 h-3.5" />,
}

// ─── Priority Color Map ───────────────────────────────────

function priorityBorderColor(priority: string): string {
  const map: Record<string, string> = {
    urgent: 'border-l-red-500',
    high: 'border-l-orange-400',
    medium: 'border-l-yellow-400',
    low: 'border-l-green-400',
  }
  return map[priority] ?? 'border-l-gray-300'
}

// ─── Ticket Form Modal ────────────────────────────────────

interface TicketFormData {
  subject: string
  description: string
  priority: string
  stageId: string
  contactId: string
  companyId: string
  source: string
  ownerId: string
  dueDate: string
  tags: string
}

const emptyTicketForm = (): TicketFormData => ({
  subject: '',
  description: '',
  priority: 'medium',
  stageId: '',
  contactId: '',
  companyId: '',
  source: 'email',
  ownerId: '',
  dueDate: '',
  tags: '',
})

interface TicketFormModalProps {
  open: boolean
  onClose: () => void
  editing: Ticket | null
  defaultStageId?: string
}

function TicketFormModal({ open, onClose, editing, defaultStageId }: TicketFormModalProps) {
  const { addTicket, updateTicket } = useTicketStore()
  const { pipelines } = usePipelineStore()
  const { users } = useUserStore()
  const { contacts } = useContactStore()
  const { companies } = useCompanyStore()
  const { addToast } = useUIStore()

  const ticketPipeline = pipelines.find((p) => p.type === 'tickets' && p.isDefault)
  const stages = ticketPipeline?.stages.sort((a, b) => a.order - b.order) ?? []

  const [form, setForm] = useState<TicketFormData>(() => {
    if (editing) {
      return {
        subject: editing.subject,
        description: editing.description,
        priority: editing.priority,
        stageId: editing.stageId,
        contactId: editing.contactId ?? '',
        companyId: editing.companyId ?? '',
        source: editing.source,
        ownerId: editing.ownerId,
        dueDate: editing.dueDate ?? '',
        tags: editing.tags.join(', '),
      }
    }
    return {
      ...emptyTicketForm(),
      stageId: defaultStageId ?? stages[0]?.id ?? '',
    }
  })

  const [errors, setErrors] = useState<Partial<Record<keyof TicketFormData, string>>>({})

  const set = (key: keyof TicketFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof TicketFormData, string>> = {}
    if (!form.subject.trim()) errs.subject = 'El asunto es requerido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const payload = {
      subject: form.subject.trim(),
      description: form.description,
      priority: form.priority as TicketPriority,
      status: 'open' as Ticket['status'],
      pipelineId: ticketPipeline?.id ?? '',
      stageId: (form.stageId || stages[0]?.id) ?? '',
      ownerId: form.ownerId || users[0]?.id,
      contactId: form.contactId || undefined,
      companyId: form.companyId || undefined,
      source: form.source as Ticket['source'],
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      dueDate: form.dueDate || undefined,
    }

    if (editing) {
      updateTicket(editing.id, payload)
      addToast({ type: 'success', title: 'Ticket actualizado', message: `"${payload.subject}" actualizado.` })
    } else {
      addTicket(payload)
      addToast({ type: 'success', title: 'Ticket creado', message: `"${payload.subject}" ha sido creado.` })
    }
    onClose()
  }

  const contactOptions = contacts.map((c) => ({
    label: `${c.firstName} ${c.lastName}`,
    value: c.id,
  }))
  const companyOptions = companies.map((c) => ({ label: c.name, value: c.id }))
  const ownerOptions = users.map((u) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar Ticket' : 'Nuevo Ticket'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editing ? 'Guardar cambios' : 'Crear ticket'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Asunto"
          required
          placeholder="Ej. No puedo acceder a mi cuenta"
          value={form.subject}
          onChange={(e) => set('subject', e.target.value)}
          error={errors.subject}
        />

        <Textarea
          label="Descripción"
          placeholder="Describe el problema en detalle..."
          rows={4}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Prioridad"
            options={PRIORITY_OPTIONS}
            value={form.priority}
            onChange={(e) => set('priority', e.target.value)}
          />
          <Select
            label="Etapa"
            options={stages.map((s) => ({ label: s.name, value: s.id }))}
            value={form.stageId}
            onChange={(e) => set('stageId', e.target.value)}
            placeholder="Seleccionar etapa"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Contacto"
            options={contactOptions}
            value={form.contactId}
            onChange={(e) => set('contactId', e.target.value)}
            placeholder="Sin contacto"
          />
          <Select
            label="Empresa"
            options={companyOptions}
            value={form.companyId}
            onChange={(e) => set('companyId', e.target.value)}
            placeholder="Sin empresa"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Canal / Fuente"
            options={SOURCE_OPTIONS}
            value={form.source}
            onChange={(e) => set('source', e.target.value)}
          />
          <Select
            label="Responsable"
            options={ownerOptions}
            value={form.ownerId}
            onChange={(e) => set('ownerId', e.target.value)}
            placeholder="Sin asignar"
          />
        </div>

        <Input
          label="Fecha límite"
          type="date"
          value={form.dueDate}
          onChange={(e) => set('dueDate', e.target.value)}
        />

        <Input
          label="Etiquetas"
          placeholder="bug, billing, onboarding (separadas por coma)"
          value={form.tags}
          onChange={(e) => set('tags', e.target.value)}
          hint="Separa múltiples etiquetas con comas"
        />
      </div>
    </Modal>
  )
}

// ─── Kanban Card ──────────────────────────────────────────

interface TicketKanbanCardProps {
  ticket: Ticket
  isDragging?: boolean
  onOpen: (ticket: Ticket) => void
  onEdit: (ticket: Ticket) => void
  onDelete: (ticket: Ticket) => void
}

function TicketKanbanCard({ ticket, isDragging, onOpen, onEdit, onDelete }: TicketKanbanCardProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging: isSortDragging,
  } = useSortable({ id: ticket.id })
  const { users } = useUserStore()
  const { contacts } = useContactStore()

  const owner = users.find((u) => u.id === ticket.ownerId)
  const contact = contacts.find((c) => c.id === ticket.contactId)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0.4 : 1,
  }

  const dueDateOverdue = ticket.dueDate && isOverdue(ticket.dueDate) && ticket.status !== 'resolved' && ticket.status !== 'closed'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'kanban-card group cursor-grab active:cursor-grabbing select-none border-l-4',
        priorityBorderColor(ticket.priority),
        isDragging && 'shadow-xl ring-2 ring-primary/30 rotate-1',
      )}
    >
      {/* Header: priority badge + source icon */}
      <div className="flex items-center justify-between mb-2">
        <Badge className={getPriorityColor(ticket.priority)} dot>
          {PRIORITY_LABELS[ticket.priority]}
        </Badge>
        <span className="text-gray-400">
          {SOURCE_ICONS[ticket.source]}
        </span>
      </div>

      {/* Subject */}
      <button
        onClick={(e) => { e.stopPropagation(); onOpen(ticket) }}
        className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors text-left leading-snug w-full line-clamp-2 cursor-pointer"
      >
        {ticket.subject}
      </button>

      {/* Contact */}
      {contact && (
        <p className="text-xs text-gray-500 mt-1.5 truncate">
          {contact.firstName} {contact.lastName}
        </p>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {ticket.dueDate && (
            <div className={cn(
              'flex items-center gap-1 text-xs',
              dueDateOverdue ? 'text-red-500 font-medium' : 'text-gray-400',
            )}>
              <Calendar className="w-3 h-3" />
              {formatDate(ticket.dueDate, 'dd MMM')}
              {dueDateOverdue && <AlertCircle className="w-3 h-3" />}
            </div>
          )}
          {!ticket.dueDate && (
            <span className="text-xs text-gray-400">{formatDate(ticket.createdAt, 'dd MMM')}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {owner && (
            <Avatar
              name={`${owner.firstName} ${owner.lastName}`}
              size="xs"
              src={owner.avatarUrl}
            />
          )}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(ticket) }}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(ticket) }}
              className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Kanban Column ────────────────────────────────────────

interface TicketColumnProps {
  stageId: string
  stageName: string
  stageColor: string
  tickets: Ticket[]
  activeId: string | null
  onOpen: (ticket: Ticket) => void
  onEdit: (ticket: Ticket) => void
  onDelete: (ticket: Ticket) => void
  onAddTicket: (stageId: string) => void
}

function TicketColumn({
  stageId, stageName, stageColor, tickets,
  activeId, onOpen, onEdit, onDelete, onAddTicket,
}: TicketColumnProps) {
  return (
    <div className="kanban-column flex flex-col min-w-[280px] max-w-[280px]">
      <div className="h-1 rounded-t-xl -mt-1 mb-3 -mx-px" style={{ backgroundColor: stageColor }} />

      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800">{stageName}</h3>
          <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            {tickets.length}
          </span>
        </div>
      </div>

      <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2.5 min-h-[120px]">
          {tickets.map((ticket) => (
            <TicketKanbanCard
              key={ticket.id}
              ticket={ticket}
              isDragging={activeId === ticket.id}
              onOpen={onOpen}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
          {tickets.length === 0 && (
            <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
              <p className="text-xs text-gray-400">Sin tickets</p>
            </div>
          )}
        </div>
      </SortableContext>

      <button
        onClick={() => onAddTicket(stageId)}
        className="mt-3 w-full flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg px-2 py-2 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Agregar ticket
      </button>
    </div>
  )
}

// ─── List View ────────────────────────────────────────────

interface TicketListViewProps {
  tickets: Ticket[]
  onOpen: (t: Ticket) => void
  onEdit: (t: Ticket) => void
}

function TicketListView({ tickets, onOpen, onEdit }: TicketListViewProps) {
  const { deleteTicket, updateTicket } = useTicketStore()
  const { users } = useUserStore()
  const { contacts } = useContactStore()
  const { companies } = useCompanyStore()
  const { pipelines } = usePipelineStore()
  const { addToast } = useUIStore()

  const ticketPipeline = pipelines.find((p) => p.type === 'tickets')

  const handleDelete = (ticket: Ticket) => {
    deleteTicket(ticket.id)
    addToast({ type: 'info', title: 'Ticket eliminado', message: `"${ticket.subject}" eliminado.` })
  }

  const handleResolve = (ticket: Ticket) => {
    const resolvedStage = ticketPipeline?.stages.find((s) => s.name.toLowerCase().includes('resuelto'))
    updateTicket(ticket.id, {
      status: 'resolved',
      stageId: resolvedStage?.id ?? ticket.stageId,
      closedAt: new Date().toISOString(),
    })
    addToast({ type: 'success', title: 'Ticket resuelto', message: `"${ticket.subject}" marcado como resuelto.` })
  }

  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={<Inbox className="w-10 h-10" />}
        title="Sin tickets"
        description="No hay tickets que coincidan con los filtros aplicados."
      />
    )
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="table-header">#ID</th>
              <th className="table-header">Asunto</th>
              <th className="table-header">Prioridad</th>
              <th className="table-header">Estado</th>
              <th className="table-header">Contacto</th>
              <th className="table-header">Empresa</th>
              <th className="table-header">Canal</th>
              <th className="table-header">Responsable</th>
              <th className="table-header">Creado</th>
              <th className="table-header">Vencimiento</th>
              <th className="table-header"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tickets.map((ticket) => {
              const owner = users.find((u) => u.id === ticket.ownerId)
              const contact = contacts.find((c) => c.id === ticket.contactId)
              const company = companies.find((c) => c.id === ticket.companyId)
              const stage = ticketPipeline?.stages.find((s) => s.id === ticket.stageId)
              const dueDateOverdue = ticket.dueDate && isOverdue(ticket.dueDate) && ticket.status !== 'resolved' && ticket.status !== 'closed'

              return (
                <tr key={ticket.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="table-cell">
                    <span className="text-xs text-gray-400 font-mono">
                      #{ticket.id.slice(0, 6).toUpperCase()}
                    </span>
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => onOpen(ticket)}
                      className="font-medium text-gray-900 hover:text-primary transition-colors text-left max-w-[240px] truncate block text-sm"
                    >
                      {ticket.subject}
                    </button>
                  </td>
                  <td className="table-cell">
                    <Badge className={getPriorityColor(ticket.priority)} dot>
                      {PRIORITY_LABELS[ticket.priority]}
                    </Badge>
                  </td>
                  <td className="table-cell">
                    <Badge className={getStatusColor(ticket.status)}>
                      {STATUS_OPTIONS.find((s) => s.value === ticket.status)?.label ?? ticket.status}
                    </Badge>
                  </td>
                  <td className="table-cell text-sm text-gray-600">
                    {contact ? `${contact.firstName} ${contact.lastName}` : '—'}
                  </td>
                  <td className="table-cell text-sm text-gray-600">
                    {company?.name ?? '—'}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      {SOURCE_ICONS[ticket.source]}
                      <span className="text-xs capitalize">{ticket.source}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    {owner && (
                      <div className="flex items-center gap-2">
                        <Avatar name={`${owner.firstName} ${owner.lastName}`} size="xs" src={owner.avatarUrl} />
                        <span className="text-sm text-gray-600 truncate max-w-[80px]">{owner.firstName}</span>
                      </div>
                    )}
                  </td>
                  <td className="table-cell text-sm text-gray-500">
                    {formatDate(ticket.createdAt, 'dd MMM')}
                  </td>
                  <td className="table-cell">
                    {ticket.dueDate ? (
                      <span className={cn('text-sm', dueDateOverdue ? 'text-red-500 font-semibold' : 'text-gray-600')}>
                        {formatDate(ticket.dueDate)}
                        {dueDateOverdue && ' ⚠'}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <Dropdown
                      trigger={
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      }
                      items={[
                        { label: 'Ver detalle', icon: <Eye className="w-4 h-4" />, onClick: () => onOpen(ticket) },
                        { label: 'Editar', icon: <Edit2 className="w-4 h-4" />, onClick: () => onEdit(ticket) },
                        ...(ticket.status !== 'resolved' ? [
                          { label: 'Marcar resuelto', icon: <CheckCircle className="w-4 h-4" />, onClick: () => handleResolve(ticket) },
                        ] : []),
                        { label: 'Eliminar', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(ticket), danger: true },
                      ]}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Ticket Detail Drawer ─────────────────────────────────

interface TicketDrawerProps {
  ticket: Ticket | null
  onClose: () => void
  onEdit: (ticket: Ticket) => void
}

function TicketDrawer({ ticket, onClose, onEdit }: TicketDrawerProps) {
  const { updateTicket, deleteTicket } = useTicketStore()
  const { pipelines } = usePipelineStore()
  const { users } = useUserStore()
  const { contacts } = useContactStore()
  const { companies } = useCompanyStore()
  const { addToast } = useUIStore()

  if (!ticket) return null

  const ticketPipeline = pipelines.find((p) => p.id === ticket.pipelineId)
  const stage = ticketPipeline?.stages.find((s) => s.id === ticket.stageId)
  const owner = users.find((u) => u.id === ticket.ownerId)
  const contact = contacts.find((c) => c.id === ticket.contactId)
  const company = companies.find((c) => c.id === ticket.companyId)

  const handleResolve = () => {
    const resolvedStage = ticketPipeline?.stages.find((s) => s.name.toLowerCase().includes('resuelto'))
    updateTicket(ticket.id, {
      status: 'resolved',
      stageId: resolvedStage?.id ?? ticket.stageId,
      closedAt: new Date().toISOString(),
    })
    addToast({ type: 'success', title: 'Ticket resuelto', message: `"${ticket.subject}" marcado como resuelto.` })
    onClose()
  }

  const handleDelete = () => {
    deleteTicket(ticket.id)
    addToast({ type: 'info', title: 'Ticket eliminado' })
    onClose()
  }

  const dueDateOverdue = ticket.dueDate && isOverdue(ticket.dueDate) && ticket.status !== 'resolved' && ticket.status !== 'closed'

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-slide-in-right">
        {/* Header */}
        <div
          className="px-6 py-5 border-b border-gray-100 border-l-4"
          style={{ borderLeftColor: (() => {
            const map: Record<string, string> = { urgent: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' }
            return map[ticket.priority] ?? '#6b7280'
          })() }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-400 font-mono">#{ticket.id.slice(0, 6).toUpperCase()}</span>
                <Badge className={getPriorityColor(ticket.priority)} dot>
                  {PRIORITY_LABELS[ticket.priority]}
                </Badge>
                <Badge className={getStatusColor(ticket.status)}>
                  {STATUS_OPTIONS.find((s) => s.value === ticket.status)?.label ?? ticket.status}
                </Badge>
              </div>
              <h2 className="text-base font-semibold text-gray-900 leading-snug">{ticket.subject}</h2>
              {stage && (
                <p className="text-sm text-gray-500 mt-0.5">{stage.name}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-3 p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Resolve action */}
          {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <Button
              variant="teal"
              size="sm"
              className="w-full"
              icon={<CheckCircle className="w-4 h-4" />}
              onClick={handleResolve}
            >
              Marcar como resuelto
            </Button>
          )}

          {ticket.status === 'resolved' && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium bg-teal-50 text-teal-700">
              ✓ Ticket resuelto {ticket.closedAt ? formatDate(ticket.closedAt) : ''}
            </div>
          )}

          {/* Description */}
          {ticket.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Descripción</h3>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3">
                {ticket.description}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Detalles</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {contact && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Contacto</p>
                  <p className="font-medium text-gray-800">{contact.firstName} {contact.lastName}</p>
                </div>
              )}
              {company && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Empresa</p>
                  <p className="font-medium text-gray-800">{company.name}</p>
                </div>
              )}
              {owner && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Responsable</p>
                  <div className="flex items-center gap-1.5">
                    <Avatar name={`${owner.firstName} ${owner.lastName}`} size="xs" src={owner.avatarUrl} />
                    <span className="font-medium text-gray-800">{owner.firstName}</span>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Canal</p>
                <div className="flex items-center gap-1.5 text-gray-700">
                  {SOURCE_ICONS[ticket.source]}
                  <span className="font-medium capitalize">{ticket.source}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Creado</p>
                <p className="font-medium text-gray-800">{formatDate(ticket.createdAt)}</p>
              </div>
              {ticket.dueDate && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Vencimiento</p>
                  <p className={cn('font-medium', dueDateOverdue ? 'text-red-600' : 'text-gray-800')}>
                    {formatDate(ticket.dueDate)}
                    {dueDateOverdue && ' ⚠'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {ticket.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Etiquetas</h3>
              <div className="flex flex-wrap gap-1.5">
                {ticket.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Actualizado {formatRelativeTime(ticket.updatedAt)}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => onEdit(ticket)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Tickets Page ────────────────────────────────────

export default function Tickets() {
  const {
    tickets, viewMode, setViewMode,
    searchQuery, setSearch,
    filterPriority, setFilterPriority,
    filterStatus, setFilterStatus,
    openForm, closeForm, isFormOpen, editingTicket,
    getFiltered, getByStage,
    updateTicket, deleteTicket, moveTicket,
  } = useTicketStore()
  const { pipelines } = usePipelineStore()
  const { addToast } = useUIStore()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [defaultStageForNew, setDefaultStageForNew] = useState<string | undefined>()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const ticketPipeline = pipelines.find((p) => p.type === 'tickets' && p.isDefault)
    ?? pipelines.find((p) => p.type === 'tickets')
  const stages = ticketPipeline?.stages.sort((a, b) => a.order - b.order) ?? []
  const byStage = getByStage()

  const filteredTickets = useMemo(() => getFiltered(), [getFiltered, searchQuery, filterPriority, filterStatus])

  // Stats
  const openCount = tickets.filter((t) => t.status === 'open').length
  const pendingCount = tickets.filter((t) => t.status === 'pending').length
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length
  const urgentCount = tickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed').length

  // DnD
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const ticketId = String(active.id)
    const overId = String(over.id)

    const targetStage = stages.find((s) => s.id === overId)
    if (targetStage) {
      moveTicket(ticketId, targetStage.id)
      return
    }

    const targetTicket = tickets.find((t) => t.id === overId)
    if (targetTicket) {
      const currentTicket = tickets.find((t) => t.id === ticketId)
      if (currentTicket && currentTicket.stageId !== targetTicket.stageId) {
        moveTicket(ticketId, targetTicket.stageId)
      }
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const ticketId = String(active.id)
    const overId = String(over.id)

    const targetStage = stages.find((s) => s.id === overId)
    if (targetStage) {
      const currentTicket = tickets.find((t) => t.id === ticketId)
      if (currentTicket && currentTicket.stageId !== targetStage.id) {
        moveTicket(ticketId, targetStage.id)
      }
      return
    }

    const targetTicket = tickets.find((t) => t.id === overId)
    if (targetTicket) {
      const currentTicket = tickets.find((t) => t.id === ticketId)
      if (currentTicket && currentTicket.stageId !== targetTicket.stageId) {
        moveTicket(ticketId, targetTicket.stageId)
      }
    }
  }

  const activeDragTicket = activeId ? tickets.find((t) => t.id === activeId) : null

  const handleDeleteTicket = (ticket: Ticket) => {
    deleteTicket(ticket.id)
    addToast({ type: 'info', title: 'Ticket eliminado', message: `"${ticket.subject}" eliminado.` })
  }

  const handleAddTicket = (stageId: string) => {
    setDefaultStageForNew(stageId)
    openForm()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets de Soporte</h1>
          <p className="text-sm text-gray-500 mt-0.5">{tickets.length} tickets en total</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'kanban' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <List className="w-4 h-4" />
              Lista
            </button>
          </div>

          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => { setDefaultStageForNew(undefined); openForm() }}
          >
            Nuevo Ticket
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-sm text-gray-600">Abiertos</span>
          <span className="text-sm font-bold text-gray-900">{openCount}</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="text-sm text-gray-600">Pendientes</span>
          <span className="text-sm font-bold text-gray-900">{pendingCount}</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
          <span className="text-sm text-gray-600">Resueltos</span>
          <span className="text-sm font-bold text-gray-900">{resolvedCount}</span>
        </div>
        {urgentCount > 0 && (
          <>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2 px-2.5 py-1 bg-red-50 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-sm font-semibold text-red-600">{urgentCount} urgente{urgentCount !== 1 ? 's' : ''}</span>
            </div>
          </>
        )}
      </div>

      {/* List view filters */}
      {viewMode === 'list' && (
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 bg-white flex-shrink-0">
          <SearchInput
            placeholder="Buscar tickets..."
            value={searchQuery}
            onChange={(val) => setSearch(val)}
            className="w-64"
          />
          <select
            className="input-field text-sm py-1.5 min-w-[140px]"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">Todas las prioridades</option>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <select
            className="input-field text-sm py-1.5 min-w-[140px]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {(searchQuery || filterPriority || filterStatus) && (
            <button
              onClick={() => { setSearch(''); setFilterPriority(''); setFilterStatus('') }}
              className="text-xs text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
          >
            <div className="flex gap-4 h-full overflow-x-auto px-6 py-5">
              {stages.map((stage) => (
                <TicketColumn
                  key={stage.id}
                  stageId={stage.id}
                  stageName={stage.name}
                  stageColor={stage.color}
                  tickets={byStage[stage.id] ?? []}
                  activeId={activeId}
                  onOpen={setSelectedTicket}
                  onEdit={(t) => openForm(t)}
                  onDelete={handleDeleteTicket}
                  onAddTicket={handleAddTicket}
                />
              ))}
              {stages.length === 0 && (
                <EmptyState
                  icon={<LayoutGrid className="w-10 h-10" />}
                  title="Sin etapas"
                  description="No hay pipeline de tickets configurado."
                />
              )}
            </div>

            <DragOverlay>
              {activeDragTicket && (
                <div className={cn('kanban-card shadow-2xl rotate-2 ring-2 ring-primary/40 opacity-95 w-[272px] border-l-4', priorityBorderColor(activeDragTicket.priority))}>
                  <Badge className={getPriorityColor(activeDragTicket.priority)} dot>
                    {PRIORITY_LABELS[activeDragTicket.priority]}
                  </Badge>
                  <div className="text-sm font-semibold text-gray-800 mt-1.5 line-clamp-2">{activeDragTicket.subject}</div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="px-6 py-5 h-full overflow-y-auto">
            <TicketListView
              tickets={filteredTickets}
              onOpen={setSelectedTicket}
              onEdit={(t) => openForm(t)}
            />
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <TicketFormModal
          open={isFormOpen}
          onClose={closeForm}
          editing={editingTicket}
          defaultStageId={defaultStageForNew}
        />
      )}

      {/* Drawer */}
      {selectedTicket && (
        <TicketDrawer
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onEdit={(t) => { setSelectedTicket(null); openForm(t) }}
        />
      )}
    </div>
  )
}
