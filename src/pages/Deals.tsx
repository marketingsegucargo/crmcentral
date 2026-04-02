import React, { useState, useMemo, useCallback } from 'react'
import {
  Plus, List, LayoutGrid, Trophy, X, ChevronDown,
  MoreHorizontal, Calendar, TrendingUp, DollarSign,
  Edit2, Trash2, Eye, AlertCircle, Building2, User,
  ChevronUp, Tag, ArrowUpDown,
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
  useDealStore, usePipelineStore, useUserStore, useUIStore,
  useContactStore, useCompanyStore,
} from '../store'
import {
  formatCurrency, formatDate, formatRelativeTime, getStatusColor,
  getPriorityColor, isOverdue, cn, generateId, LEAD_SOURCES,
} from '../utils'
import type { Deal, DealStatus, Pipeline, PipelineStage } from '../types'

// ─── Constants ────────────────────────────────────────────

const PRIORITY_OPTIONS = [
  { label: 'Baja', value: 'low' },
  { label: 'Media', value: 'medium' },
  { label: 'Alta', value: 'high' },
]

const STATUS_OPTIONS = [
  { label: 'Abierto', value: 'open' },
  { label: 'Ganado', value: 'won' },
  { label: 'Perdido', value: 'lost' },
]

const CURRENCY_OPTIONS = [
  { label: 'MXN – Peso Mexicano', value: 'MXN' },
  { label: 'USD – Dólar', value: 'USD' },
]

// ─── Deal Form ────────────────────────────────────────────

interface DealFormData {
  name: string
  value: string
  currency: string
  pipelineId: string
  stageId: string
  closeDate: string
  probability: string
  priority: string
  source: string
  ownerId: string
  contactIds: string
  companyId: string
  description: string
  tags: string
}

const emptyForm = (): DealFormData => ({
  name: '',
  value: '',
  currency: 'MXN',
  pipelineId: '',
  stageId: '',
  closeDate: '',
  probability: '',
  priority: 'medium',
  source: '',
  ownerId: '',
  contactIds: '',
  companyId: '',
  description: '',
  tags: '',
})

interface DealFormModalProps {
  open: boolean
  onClose: () => void
  editing: Deal | null
  defaultPipelineId?: string
  defaultStageId?: string
}

function DealFormModal({ open, onClose, editing, defaultPipelineId, defaultStageId }: DealFormModalProps) {
  const { addDeal, updateDeal } = useDealStore()
  const { pipelines } = usePipelineStore()
  const { users } = useUserStore()
  const { contacts } = useContactStore()
  const { companies } = useCompanyStore()
  const { addToast } = useUIStore()

  const dealPipelines = pipelines.filter((p) => p.type === 'deals')

  const [form, setForm] = useState<DealFormData>(() => {
    if (editing) {
      return {
        name: editing.name,
        value: String(editing.value),
        currency: editing.currency,
        pipelineId: editing.pipelineId,
        stageId: editing.stageId,
        closeDate: editing.closeDate ?? '',
        probability: String(editing.probability),
        priority: editing.priority,
        source: editing.source ?? '',
        ownerId: editing.ownerId,
        contactIds: editing.contactIds.join(', '),
        companyId: editing.companyId ?? '',
        description: editing.description ?? '',
        tags: editing.tags.join(', '),
      }
    }
    const pid = defaultPipelineId ?? dealPipelines[0]?.id ?? ''
    const stage = defaultStageId ?? dealPipelines.find((p) => p.id === pid)?.stages[0]?.id ?? ''
    return { ...emptyForm(), pipelineId: pid, stageId: stage }
  })

  const [errors, setErrors] = useState<Partial<Record<keyof DealFormData, string>>>({})

  const selectedPipeline = dealPipelines.find((p) => p.id === form.pipelineId)
  const stages = selectedPipeline?.stages.sort((a, b) => a.order - b.order) ?? []

  const set = (key: keyof DealFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  // Auto-fill probability when stage changes
  const handleStageChange = (stageId: string) => {
    const stage = stages.find((s) => s.id === stageId)
    setForm((prev) => ({
      ...prev,
      stageId,
      probability: stage ? String(stage.probability) : prev.probability,
    }))
  }

  // Update stages when pipeline changes
  const handlePipelineChange = (pipelineId: string) => {
    const pipeline = dealPipelines.find((p) => p.id === pipelineId)
    const firstStage = pipeline?.stages.sort((a, b) => a.order - b.order)[0]
    setForm((prev) => ({
      ...prev,
      pipelineId,
      stageId: firstStage?.id ?? '',
      probability: firstStage ? String(firstStage.probability) : prev.probability,
    }))
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof DealFormData, string>> = {}
    if (!form.name.trim()) errs.name = 'El nombre es requerido'
    if (!form.pipelineId) errs.pipelineId = 'Selecciona un pipeline'
    if (!form.stageId) errs.stageId = 'Selecciona una etapa'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const payload = {
      name: form.name.trim(),
      value: parseFloat(form.value) || 0,
      currency: form.currency,
      status: 'open' as DealStatus,
      priority: form.priority as Deal['priority'],
      pipelineId: form.pipelineId,
      stageId: form.stageId,
      ownerId: form.ownerId || users[0]?.id,
      contactIds: form.contactIds.split(',').map((s) => s.trim()).filter(Boolean),
      companyId: form.companyId || undefined,
      closeDate: form.closeDate || undefined,
      probability: parseInt(form.probability) || 0,
      source: (form.source as Deal['source']) || undefined,
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      description: form.description,
      lastActivityAt: new Date().toISOString(),
    }

    if (editing) {
      updateDeal(editing.id, payload)
      addToast({ type: 'success', title: 'Deal actualizado', message: `"${payload.name}" ha sido actualizado.` })
    } else {
      addDeal(payload)
      addToast({ type: 'success', title: 'Deal creado', message: `"${payload.name}" ha sido agregado al pipeline.` })
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
      title={editing ? 'Editar Deal' : 'Nuevo Deal'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editing ? 'Guardar cambios' : 'Crear deal'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Nombre del deal"
          required
          placeholder="Ej. Licencia Enterprise Tecnova"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          error={errors.name}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Valor"
            type="number"
            placeholder="0"
            value={form.value}
            onChange={(e) => set('value', e.target.value)}
          />
          <Select
            label="Moneda"
            options={CURRENCY_OPTIONS}
            value={form.currency}
            onChange={(e) => set('currency', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Pipeline"
            required
            options={dealPipelines.map((p) => ({ label: p.name, value: p.id }))}
            value={form.pipelineId}
            onChange={(e) => handlePipelineChange(e.target.value)}
            error={errors.pipelineId}
            placeholder="Seleccionar pipeline"
          />
          <Select
            label="Etapa"
            required
            options={stages.map((s) => ({ label: s.name, value: s.id }))}
            value={form.stageId}
            onChange={(e) => handleStageChange(e.target.value)}
            error={errors.stageId}
            placeholder="Seleccionar etapa"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Fecha de cierre"
            type="date"
            value={form.closeDate}
            onChange={(e) => set('closeDate', e.target.value)}
          />
          <Input
            label="Probabilidad (%)"
            type="number"
            min="0"
            max="100"
            placeholder="0"
            value={form.probability}
            onChange={(e) => set('probability', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Prioridad"
            options={PRIORITY_OPTIONS}
            value={form.priority}
            onChange={(e) => set('priority', e.target.value)}
          />
          <Select
            label="Fuente"
            options={LEAD_SOURCES}
            value={form.source}
            onChange={(e) => set('source', e.target.value)}
            placeholder="Sin fuente"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Responsable"
            options={ownerOptions}
            value={form.ownerId}
            onChange={(e) => set('ownerId', e.target.value)}
            placeholder="Asignar responsable"
          />
          <Select
            label="Empresa"
            options={companyOptions}
            value={form.companyId}
            onChange={(e) => set('companyId', e.target.value)}
            placeholder="Sin empresa"
          />
        </div>

        <Select
          label="Contacto principal"
          options={contactOptions}
          value={form.contactIds.split(',')[0]?.trim() ?? ''}
          onChange={(e) => set('contactIds', e.target.value)}
          placeholder="Sin contacto"
        />

        <Textarea
          label="Descripción"
          placeholder="Notas internas sobre este deal..."
          rows={3}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />

        <Input
          label="Etiquetas"
          placeholder="enterprise, renewal, upsell (separadas por coma)"
          value={form.tags}
          onChange={(e) => set('tags', e.target.value)}
          hint="Separa múltiples etiquetas con comas"
        />
      </div>
    </Modal>
  )
}

// ─── Deal Detail Drawer ───────────────────────────────────

interface DealDrawerProps {
  deal: Deal | null
  onClose: () => void
  onEdit: (deal: Deal) => void
}

function DealDrawer({ deal, onClose, onEdit }: DealDrawerProps) {
  const { updateDeal, deleteDeal } = useDealStore()
  const { pipelines } = usePipelineStore()
  const { users } = useUserStore()
  const { contacts } = useContactStore()
  const { companies } = useCompanyStore()
  const { addToast } = useUIStore()

  if (!deal) return null

  const pipeline = pipelines.find((p) => p.id === deal.pipelineId)
  const stage = pipeline?.stages.find((s) => s.id === deal.stageId)
  const owner = users.find((u) => u.id === deal.ownerId)
  const dealContacts = contacts.filter((c) => deal.contactIds.includes(c.id))
  const company = companies.find((c) => c.id === deal.companyId)

  const handleMarkWon = () => {
    updateDeal(deal.id, { status: 'won' })
    addToast({ type: 'success', title: '¡Deal ganado!', message: `"${deal.name}" marcado como ganado.` })
    onClose()
  }

  const handleMarkLost = () => {
    updateDeal(deal.id, { status: 'lost' })
    addToast({ type: 'info', title: 'Deal perdido', message: `"${deal.name}" marcado como perdido.` })
    onClose()
  }

  const handleDelete = () => {
    deleteDeal(deal.id)
    addToast({ type: 'info', title: 'Deal eliminado', message: `"${deal.name}" ha sido eliminado.` })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-slide-in-right">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{deal.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {pipeline?.name} · {stage?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Value Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-primary to-navy">
          <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Valor del Deal</p>
          <p className="text-white text-3xl font-bold mt-1">
            {formatCurrency(deal.value, deal.currency)}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <span className={cn('badge text-xs', getPriorityColor(deal.priority))}>
              {deal.priority === 'high' ? 'Alta' : deal.priority === 'medium' ? 'Media' : 'Baja'}
            </span>
            <span className="text-white/70 text-xs">{deal.probability}% probabilidad</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Status Actions */}
          {deal.status === 'open' && (
            <div className="flex gap-2">
              <Button
                variant="teal"
                size="sm"
                className="flex-1"
                icon={<Trophy className="w-3.5 h-3.5" />}
                onClick={handleMarkWon}
              >
                Marcar ganado
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                icon={<X className="w-3.5 h-3.5" />}
                onClick={handleMarkLost}
              >
                Marcar perdido
              </Button>
            </div>
          )}

          {deal.status !== 'open' && (
            <div className={cn('rounded-xl px-4 py-3 text-sm font-medium', getStatusColor(deal.status))}>
              {deal.status === 'won' ? '🏆 Este deal fue ganado' : '❌ Este deal fue perdido'}
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Detalles</h3>
            <div className="space-y-2.5">
              {company && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{company.name}</span>
                </div>
              )}
              {deal.closeDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className={cn('text-sm', isOverdue(deal.closeDate) && deal.status === 'open' ? 'text-red-600 font-medium' : 'text-gray-700')}>
                    Cierre: {formatDate(deal.closeDate)}
                    {isOverdue(deal.closeDate) && deal.status === 'open' && ' · Vencido'}
                  </span>
                </div>
              )}
              {owner && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <Avatar name={`${owner.firstName} ${owner.lastName}`} size="xs" src={owner.avatarUrl} />
                    <span className="text-sm text-gray-700">{owner.firstName} {owner.lastName}</span>
                  </div>
                </div>
              )}
              {deal.source && (
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    {LEAD_SOURCES.find((s) => s.value === deal.source)?.label ?? deal.source}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Probabilidad de cierre</span>
              <span className="text-xs font-semibold text-gray-700">{deal.probability}%</span>
            </div>
            <Progress value={deal.probability} color={deal.probability >= 75 ? 'teal' : deal.probability >= 40 ? 'primary' : 'yellow'} />
          </div>

          {/* Contacts */}
          {dealContacts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Contactos asociados</h3>
              <div className="space-y-2">
                {dealContacts.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 py-1.5">
                    <Avatar name={`${c.firstName} ${c.lastName}`} size="sm" src={c.avatarUrl} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-gray-500">{c.jobTitle ?? c.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {deal.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Etiquetas</h3>
              <div className="flex flex-wrap gap-1.5">
                {deal.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {deal.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Descripción</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{deal.description}</p>
            </div>
          )}

          <div className="pt-2 text-xs text-gray-400">
            Creado {formatRelativeTime(deal.createdAt)}
            {deal.lastActivityAt && ` · Actividad ${formatRelativeTime(deal.lastActivityAt)}`}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-2">
          <Button variant="secondary" size="sm" className="flex-1" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => onEdit(deal)}>
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

// ─── Kanban Card ──────────────────────────────────────────

interface KanbanCardProps {
  deal: Deal
  isDragging?: boolean
  onOpen: (deal: Deal) => void
  onMarkWon: (deal: Deal) => void
  onMarkLost: (deal: Deal) => void
}

function KanbanCard({ deal, isDragging, onOpen, onMarkWon, onMarkLost }: KanbanCardProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging: isSortDragging,
  } = useSortable({ id: deal.id })
  const { users } = useUserStore()
  const { companies } = useCompanyStore()

  const owner = users.find((u) => u.id === deal.ownerId)
  const company = companies.find((c) => c.id === deal.companyId)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0.4 : 1,
  }

  const priorityDot: Record<string, string> = {
    high: 'bg-red-500',
    medium: 'bg-yellow-400',
    low: 'bg-green-400',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'kanban-card group cursor-grab active:cursor-grabbing select-none',
        isDragging && 'shadow-xl ring-2 ring-primary/30 rotate-1',
      )}
    >
      {/* Priority dot + name */}
      <div className="flex items-start gap-2">
        <span className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', priorityDot[deal.priority])} />
        <div className="flex-1 min-w-0">
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(deal) }}
            className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors text-left leading-tight w-full truncate cursor-pointer"
          >
            {deal.name}
          </button>
          {company && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{company.name}</p>
          )}
        </div>
      </div>

      {/* Value */}
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-base font-bold text-gray-900">
          {formatCurrency(deal.value, deal.currency)}
        </span>
        <span className="text-xs text-gray-500 bg-gray-100 rounded-md px-1.5 py-0.5">
          {deal.probability}%
        </span>
      </div>

      {/* Close date */}
      {deal.closeDate && (
        <div className={cn(
          'mt-2 flex items-center gap-1.5 text-xs',
          isOverdue(deal.closeDate) ? 'text-red-500 font-medium' : 'text-gray-400',
        )}>
          <Calendar className="w-3 h-3" />
          {formatDate(deal.closeDate, 'dd MMM yyyy')}
          {isOverdue(deal.closeDate) && <AlertCircle className="w-3 h-3" />}
        </div>
      )}

      {/* Footer: owner + hover actions */}
      <div className="mt-3 flex items-center justify-between">
        {owner ? (
          <Avatar
            name={`${owner.firstName} ${owner.lastName}`}
            size="xs"
            src={owner.avatarUrl}
          />
        ) : <span />}

        {/* Won/Lost on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onMarkWon(deal) }}
            className="p-1 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-600 transition-colors"
            title="Marcar como ganado"
          >
            <Trophy className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMarkLost(deal) }}
            className="p-1 rounded-md bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
            title="Marcar como perdido"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Kanban Column ────────────────────────────────────────

interface KanbanColumnProps {
  stage: PipelineStage
  deals: Deal[]
  onOpen: (deal: Deal) => void
  onMarkWon: (deal: Deal) => void
  onMarkLost: (deal: Deal) => void
  onAddDeal: (stageId: string) => void
  activeId: string | null
}

function KanbanColumn({ stage, deals, onOpen, onMarkWon, onMarkLost, onAddDeal, activeId }: KanbanColumnProps) {
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="kanban-column flex flex-col min-w-[280px] max-w-[280px]">
      {/* Colored top border */}
      <div className="h-1 rounded-t-xl -mt-1 mb-3 -mx-px" style={{ backgroundColor: stage.color }} />

      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800">{stage.name}</h3>
          <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            {deals.length}
          </span>
        </div>
        {deals.length > 0 && (
          <span className="text-xs text-gray-500 font-medium">
            {formatCurrency(totalValue, 'MXN')}
          </span>
        )}
      </div>

      {/* Cards */}
      <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2.5 min-h-[120px]">
          {deals.map((deal) => (
            <KanbanCard
              key={deal.id}
              deal={deal}
              isDragging={activeId === deal.id}
              onOpen={onOpen}
              onMarkWon={onMarkWon}
              onMarkLost={onMarkLost}
            />
          ))}
          {deals.length === 0 && (
            <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
              <p className="text-xs text-gray-400">Sin deals</p>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Add deal */}
      <button
        onClick={() => onAddDeal(stage.id)}
        className="mt-3 w-full flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg px-2 py-2 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Agregar deal
      </button>
    </div>
  )
}

// ─── List View ────────────────────────────────────────────

type SortField = 'name' | 'value' | 'probability' | 'closeDate' | 'createdAt'

interface ListViewProps {
  deals: Deal[]
  onOpen: (deal: Deal) => void
  onEdit: (deal: Deal) => void
}

function ListView({ deals, onOpen, onEdit }: ListViewProps) {
  const { updateDeal, deleteDeal } = useDealStore()
  const { users } = useUserStore()
  const { companies } = useCompanyStore()
  const { pipelines } = usePipelineStore()
  const { addToast } = useUIStore()
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const sorted = useMemo(() => {
    return [...deals].sort((a, b) => {
      let va: string | number = a[sortField] ?? ''
      let vb: string | number = b[sortField] ?? ''
      if (sortField === 'value' || sortField === 'probability') {
        va = Number(va)
        vb = Number(vb)
      }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [deals, sortField, sortDir])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-300 ml-1" />
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-primary ml-1" />
      : <ChevronDown className="w-3 h-3 text-primary ml-1" />
  }

  const handleMarkWon = (deal: Deal) => {
    updateDeal(deal.id, { status: 'won' })
    addToast({ type: 'success', title: '¡Deal ganado!', message: `"${deal.name}" marcado como ganado.` })
  }

  const handleMarkLost = (deal: Deal) => {
    updateDeal(deal.id, { status: 'lost' })
    addToast({ type: 'info', title: 'Deal perdido', message: `"${deal.name}" marcado como perdido.` })
  }

  const handleDelete = (deal: Deal) => {
    deleteDeal(deal.id)
    addToast({ type: 'info', title: 'Deal eliminado', message: `"${deal.name}" eliminado.` })
  }

  if (sorted.length === 0) {
    return <EmptyState icon={<DollarSign className="w-10 h-10" />} title="Sin deals" description="No hay deals que coincidan con los filtros aplicados." />
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="table-header">
                <button className="flex items-center gap-1 hover:text-gray-700" onClick={() => handleSort('name')}>
                  Deal <SortIcon field="name" />
                </button>
              </th>
              <th className="table-header">Empresa</th>
              <th className="table-header">
                <button className="flex items-center gap-1 hover:text-gray-700" onClick={() => handleSort('value')}>
                  Valor <SortIcon field="value" />
                </button>
              </th>
              <th className="table-header">Etapa</th>
              <th className="table-header">
                <button className="flex items-center gap-1 hover:text-gray-700" onClick={() => handleSort('probability')}>
                  Prob. <SortIcon field="probability" />
                </button>
              </th>
              <th className="table-header">
                <button className="flex items-center gap-1 hover:text-gray-700" onClick={() => handleSort('closeDate')}>
                  Cierre <SortIcon field="closeDate" />
                </button>
              </th>
              <th className="table-header">Responsable</th>
              <th className="table-header">Estado</th>
              <th className="table-header"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((deal) => {
              const owner = users.find((u) => u.id === deal.ownerId)
              const company = companies.find((c) => c.id === deal.companyId)
              const pipeline = pipelines.find((p) => p.id === deal.pipelineId)
              const stage = pipeline?.stages.find((s) => s.id === deal.stageId)

              return (
                <tr key={deal.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="table-cell">
                    <button
                      onClick={() => onOpen(deal)}
                      className="font-semibold text-gray-900 hover:text-primary transition-colors text-left max-w-[200px] truncate block"
                    >
                      {deal.name}
                    </button>
                  </td>
                  <td className="table-cell text-gray-600 text-sm">{company?.name ?? '—'}</td>
                  <td className="table-cell font-semibold text-gray-900">
                    {formatCurrency(deal.value, deal.currency)}
                  </td>
                  <td className="table-cell">
                    {stage && (
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: stage.color }}
                      >
                        {stage.name}
                      </span>
                    )}
                  </td>
                  <td className="table-cell min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <Progress value={deal.probability} size="sm" color={deal.probability >= 75 ? 'teal' : 'primary'} />
                      <span className="text-xs text-gray-500 whitespace-nowrap">{deal.probability}%</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    {deal.closeDate ? (
                      <span className={cn('text-sm', isOverdue(deal.closeDate) && deal.status === 'open' ? 'text-red-500 font-medium' : 'text-gray-600')}>
                        {formatDate(deal.closeDate)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="table-cell">
                    {owner && (
                      <div className="flex items-center gap-2">
                        <Avatar name={`${owner.firstName} ${owner.lastName}`} size="xs" src={owner.avatarUrl} />
                        <span className="text-sm text-gray-600 truncate max-w-[80px]">{owner.firstName}</span>
                      </div>
                    )}
                  </td>
                  <td className="table-cell">
                    <Badge className={getStatusColor(deal.status)}>
                      {deal.status === 'won' ? 'Ganado' : deal.status === 'lost' ? 'Perdido' : 'Abierto'}
                    </Badge>
                  </td>
                  <td className="table-cell">
                    <Dropdown
                      trigger={
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      }
                      items={[
                        { label: 'Ver detalle', icon: <Eye className="w-4 h-4" />, onClick: () => onOpen(deal) },
                        { label: 'Editar', icon: <Edit2 className="w-4 h-4" />, onClick: () => onEdit(deal) },
                        ...(deal.status === 'open' ? [
                          { label: 'Marcar ganado', icon: <Trophy className="w-4 h-4" />, onClick: () => handleMarkWon(deal) },
                          { label: 'Marcar perdido', icon: <X className="w-4 h-4" />, onClick: () => handleMarkLost(deal) },
                        ] : []),
                        { label: 'Eliminar', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(deal), danger: true },
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

// ─── Main Deals Page ──────────────────────────────────────

export default function Deals() {
  const {
    deals, activePipelineId, viewMode,
    setActivePipeline, setViewMode,
    searchQuery, setSearch, filterOwner, setFilterOwner,
    updateDeal, getFiltered, getDealsByStage,
    openForm, closeForm, isFormOpen, editingDeal,
  } = useDealStore()
  const { pipelines } = usePipelineStore()
  const { users } = useUserStore()
  const { addToast } = useUIStore()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [defaultStageForNew, setDefaultStageForNew] = useState<string | undefined>()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const dealPipelines = pipelines.filter((p) => p.type === 'deals')
  const activePipeline = dealPipelines.find((p) => p.id === activePipelineId) ?? dealPipelines[0]
  const stages = activePipeline?.stages.sort((a, b) => a.order - b.order) ?? []
  const dealsByStage = getDealsByStage(activePipeline?.id ?? '')

  // Filtered deals for list view
  const filteredDeals = useMemo(() => {
    let list = getFiltered()
    if (filterStatus) list = list.filter((d) => d.status === filterStatus)
    return list
  }, [getFiltered, filterStatus, searchQuery, filterOwner])

  // Total value of open deals
  const openDealsValue = useMemo(
    () => deals.filter((d) => d.status === 'open' && d.pipelineId === activePipeline?.id)
              .reduce((sum, d) => sum + d.value, 0),
    [deals, activePipeline]
  )

  const openDealsCount = deals.filter((d) => d.status === 'open' && d.pipelineId === activePipeline?.id).length

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const dealId = String(active.id)
    const overId = String(over.id)

    // Check if dropped on a stage column (overId is a stage id)
    const targetStage = stages.find((s) => s.id === overId)
    if (targetStage) {
      updateDeal(dealId, { stageId: targetStage.id })
      return
    }

    // Dropped on another card — find that card's stage
    const targetDeal = deals.find((d) => d.id === overId)
    if (targetDeal && targetDeal.stageId !== deals.find((d) => d.id === dealId)?.stageId) {
      updateDeal(dealId, { stageId: targetDeal.stageId })
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const dealId = String(active.id)
    const overId = String(over.id)

    // If over a stage
    const targetStage = stages.find((s) => s.id === overId)
    if (targetStage) {
      const currentDeal = deals.find((d) => d.id === dealId)
      if (currentDeal && currentDeal.stageId !== targetStage.id) {
        updateDeal(dealId, { stageId: targetStage.id })
      }
      return
    }

    // If over another deal
    const targetDeal = deals.find((d) => d.id === overId)
    if (targetDeal) {
      const currentDeal = deals.find((d) => d.id === dealId)
      if (currentDeal && currentDeal.stageId !== targetDeal.stageId) {
        updateDeal(dealId, { stageId: targetDeal.stageId })
      }
    }
  }

  const activeDragDeal = activeId ? deals.find((d) => d.id === activeId) : null

  const handleMarkWon = (deal: Deal) => {
    updateDeal(deal.id, { status: 'won' })
    addToast({ type: 'success', title: '¡Deal ganado! 🏆', message: `"${deal.name}" marcado como ganado.` })
  }

  const handleMarkLost = (deal: Deal) => {
    updateDeal(deal.id, { status: 'lost' })
    addToast({ type: 'info', title: 'Deal perdido', message: `"${deal.name}" marcado como perdido.` })
  }

  const handleAddDeal = (stageId: string) => {
    setDefaultStageForNew(stageId)
    openForm()
  }

  const handleOpenForm = (deal?: Deal) => {
    setDefaultStageForNew(undefined)
    openForm(deal)
  }

  const ownerOptions = [
    { label: 'Todos los responsables', value: '' },
    ...users.map((u) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id })),
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals & Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {openDealsCount} deal{openDealsCount !== 1 ? 's' : ''} abierto{openDealsCount !== 1 ? 's' : ''} ·{' '}
            <span className="font-semibold text-gray-700">{formatCurrency(openDealsValue, 'MXN')}</span> en pipeline
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Pipeline selector */}
          <div className="relative">
            <select
              className="input-field pr-8 text-sm font-medium appearance-none min-w-[180px]"
              value={activePipeline?.id ?? ''}
              onChange={(e) => setActivePipeline(e.target.value)}
            >
              {dealPipelines.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'kanban'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'list'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <List className="w-4 h-4" />
              Lista
            </button>
          </div>

          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenForm()}
          >
            Nuevo Deal
          </Button>
        </div>
      </div>

      {/* List view filters */}
      {viewMode === 'list' && (
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 bg-white flex-shrink-0">
          <SearchInput
            placeholder="Buscar deals..."
            value={searchQuery}
            onChange={(val) => setSearch(val)}
            className="w-64"
          />
          <select
            className="input-field text-sm py-1.5 min-w-[160px]"
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
          >
            {ownerOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
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
          {(searchQuery || filterOwner || filterStatus) && (
            <button
              onClick={() => { setSearch(''); setFilterOwner(''); setFilterStatus('') }}
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
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  deals={dealsByStage[stage.id] ?? []}
                  onOpen={setSelectedDeal}
                  onMarkWon={handleMarkWon}
                  onMarkLost={handleMarkLost}
                  onAddDeal={handleAddDeal}
                  activeId={activeId}
                />
              ))}

              {stages.length === 0 && (
                <EmptyState
                  icon={<LayoutGrid className="w-10 h-10" />}
                  title="Sin etapas"
                  description="Este pipeline no tiene etapas configuradas."
                />
              )}
            </div>

            <DragOverlay>
              {activeDragDeal && (
                <div className="kanban-card shadow-2xl rotate-2 ring-2 ring-primary/40 opacity-95 w-[272px]">
                  <div className="text-sm font-semibold text-gray-800 truncate">{activeDragDeal.name}</div>
                  <div className="text-base font-bold text-gray-900 mt-1.5">
                    {formatCurrency(activeDragDeal.value, activeDragDeal.currency)}
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="px-6 py-5 h-full overflow-y-auto">
            <ListView
              deals={filteredDeals}
              onOpen={setSelectedDeal}
              onEdit={(deal) => openForm(deal)}
            />
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isFormOpen && (
        <DealFormModal
          open={isFormOpen}
          onClose={closeForm}
          editing={editingDeal}
          defaultPipelineId={activePipeline?.id}
          defaultStageId={defaultStageForNew}
        />
      )}

      {/* Deal detail drawer */}
      {selectedDeal && (
        <DealDrawer
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onEdit={(deal) => { setSelectedDeal(null); openForm(deal) }}
        />
      )}
    </div>
  )
}
