import { useState } from 'react'
import {
  Zap, Play, Pause, Plus, Trash2, Edit2, Users, Mail,
  GitBranch, Clock, CheckCircle, AlertCircle, ChevronRight,
  Phone, Tag, Bell, Globe, ArrowRight, Settings,
} from 'lucide-react'
import { Button, Badge, Modal, Input, Select } from '../components/ui'
import { cn, formatDate } from '../utils'

// ─── Types ────────────────────────────────────────────────
type WorkflowStatus = 'active' | 'inactive' | 'draft'
type WorkflowCategory = 'contact' | 'deal' | 'ticket' | 'company'
type TriggerType =
  | 'contact_created' | 'deal_stage_changed' | 'form_submitted'
  | 'date_reached' | 'property_changed' | 'ticket_created'
  | 'email_opened' | 'page_visited'

type ActionType =
  | 'send_email' | 'create_task' | 'update_property' | 'notify_user'
  | 'add_tag' | 'remove_tag' | 'create_deal' | 'delay'
  | 'webhook' | 'assign_owner'

interface WorkflowAction {
  id: string
  type: ActionType
  label: string
}

interface Workflow {
  id: string
  name: string
  description: string
  status: WorkflowStatus
  category: WorkflowCategory
  trigger: TriggerType
  triggerLabel: string
  actions: WorkflowAction[]
  enrolledCount: number
  completedCount: number
  errorCount: number
  lastRun?: string
  createdAt: string
  updatedAt: string
}

// ─── Mock Data ────────────────────────────────────────────
const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: 'wf1', name: 'Bienvenida nuevo lead', description: 'Secuencia de bienvenida para nuevos leads con email y tarea de seguimiento.',
    status: 'active', category: 'contact', trigger: 'contact_created', triggerLabel: 'Contacto creado',
    actions: [
      { id: 'a1', type: 'send_email', label: 'Email bienvenida' },
      { id: 'a2', type: 'delay', label: 'Esperar 2 días' },
      { id: 'a3', type: 'send_email', label: 'Email recursos útiles' },
      { id: 'a4', type: 'create_task', label: 'Llamar si no responde' },
    ],
    enrolledCount: 248, completedCount: 186, errorCount: 3,
    lastRun: '2024-03-22T10:00:00Z', createdAt: '2023-06-01T09:00:00Z', updatedAt: '2024-03-01T09:00:00Z',
  },
  {
    id: 'wf2', name: 'Nurturing leads MQL', description: 'Educa y califica leads que cumplieron criterios de marketing.',
    status: 'active', category: 'contact', trigger: 'property_changed', triggerLabel: 'Propiedad cambiada (lifecycle = MQL)',
    actions: [
      { id: 'b1', type: 'send_email', label: 'Email caso de éxito' },
      { id: 'b2', type: 'delay', label: 'Esperar 3 días' },
      { id: 'b3', type: 'send_email', label: 'Email demo gratuita' },
      { id: 'b4', type: 'add_tag', label: 'Agregar tag "nurturing"' },
      { id: 'b5', type: 'create_task', label: 'Agendar llamada exploratoria' },
    ],
    enrolledCount: 124, completedCount: 89, errorCount: 1,
    lastRun: '2024-03-21T14:00:00Z', createdAt: '2023-08-01T09:00:00Z', updatedAt: '2024-02-15T09:00:00Z',
  },
  {
    id: 'wf3', name: 'Seguimiento post-demo', description: 'Seguimiento automático después de una demo. 3 pasos en 1 semana.',
    status: 'active', category: 'deal', trigger: 'deal_stage_changed', triggerLabel: 'Deal movido a "Demo"',
    actions: [
      { id: 'c1', type: 'send_email', label: 'Gracias por la demo' },
      { id: 'c2', type: 'delay', label: 'Esperar 1 día' },
      { id: 'c3', type: 'send_email', label: 'Recursos y pricing' },
      { id: 'c4', type: 'create_task', label: 'Llamar para resolver dudas' },
    ],
    enrolledCount: 67, completedCount: 54, errorCount: 0,
    lastRun: '2024-03-22T16:00:00Z', createdAt: '2023-09-01T09:00:00Z', updatedAt: '2024-01-20T09:00:00Z',
  },
  {
    id: 'wf4', name: 'Alerta deal sin actividad', description: 'Notifica al rep cuando un deal lleva más de 7 días sin actividad.',
    status: 'active', category: 'deal', trigger: 'date_reached', triggerLabel: '7 días sin actividad en deal',
    actions: [
      { id: 'd1', type: 'notify_user', label: 'Notificar al propietario' },
      { id: 'd2', type: 'create_task', label: 'Tarea de seguimiento urgente' },
    ],
    enrolledCount: 45, completedCount: 45, errorCount: 0,
    lastRun: '2024-03-22T08:00:00Z', createdAt: '2023-10-01T09:00:00Z', updatedAt: '2024-03-10T09:00:00Z',
  },
  {
    id: 'wf5', name: 'Re-engagement 60 días', description: 'Reactiva contactos que no han respondido en 60+ días.',
    status: 'active', category: 'contact', trigger: 'date_reached', triggerLabel: '60 días sin actividad',
    actions: [
      { id: 'e1', type: 'send_email', label: 'Email "te echamos de menos"' },
      { id: 'e2', type: 'delay', label: 'Esperar 5 días' },
      { id: 'e3', type: 'send_email', label: 'Oferta especial' },
      { id: 'e4', type: 'add_tag', label: 'Tag "re-engagement"' },
    ],
    enrolledCount: 312, completedCount: 278, errorCount: 5,
    lastRun: '2024-03-20T09:00:00Z', createdAt: '2023-10-15T09:00:00Z', updatedAt: '2024-02-01T09:00:00Z',
  },
  {
    id: 'wf6', name: 'Onboarding cliente nuevo', description: 'Secuencia completa de onboarding cuando un contacto se convierte en cliente.',
    status: 'active', category: 'contact', trigger: 'property_changed', triggerLabel: 'Lifecycle cambia a "Cliente"',
    actions: [
      { id: 'f1', type: 'send_email', label: 'Email bienvenida cliente' },
      { id: 'f2', type: 'create_task', label: 'Llamada de kickoff' },
      { id: 'f3', type: 'delay', label: 'Esperar 3 días' },
      { id: 'f4', type: 'send_email', label: 'Guía de inicio rápido' },
      { id: 'f5', type: 'delay', label: 'Esperar 7 días' },
      { id: 'f6', type: 'send_email', label: 'Check-in semana 1' },
    ],
    enrolledCount: 38, completedCount: 31, errorCount: 0,
    lastRun: '2024-03-15T09:00:00Z', createdAt: '2023-11-01T09:00:00Z', updatedAt: '2024-03-01T09:00:00Z',
  },
  {
    id: 'wf7', name: 'Asignación automática de leads', description: 'Asigna leads de formularios web según zona geográfica.',
    status: 'active', category: 'contact', trigger: 'form_submitted', triggerLabel: 'Formulario enviado',
    actions: [
      { id: 'g1', type: 'assign_owner', label: 'Asignar propietario por zona' },
      { id: 'g2', type: 'add_tag', label: 'Tag "inbound-form"' },
      { id: 'g3', type: 'create_task', label: 'Contactar en < 1 hora' },
    ],
    enrolledCount: 89, completedCount: 89, errorCount: 2,
    lastRun: '2024-03-22T15:30:00Z', createdAt: '2023-12-01T09:00:00Z', updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'wf8', name: 'Escalación ticket urgente', description: 'Escala tickets urgentes sin respuesta después de 2 horas.',
    status: 'inactive', category: 'ticket', trigger: 'ticket_created', triggerLabel: 'Ticket creado con prioridad "urgente"',
    actions: [
      { id: 'h1', type: 'notify_user', label: 'Notificar al manager' },
      { id: 'h2', type: 'update_property', label: 'Marcar como crítico' },
    ],
    enrolledCount: 12, completedCount: 10, errorCount: 0,
    lastRun: '2024-03-10T09:00:00Z', createdAt: '2024-01-01T09:00:00Z', updatedAt: '2024-02-20T09:00:00Z',
  },
  {
    id: 'wf9', name: 'Alerta renovación contrato', description: 'Notifica 60 días antes del vencimiento del contrato.',
    status: 'draft', category: 'company', trigger: 'date_reached', triggerLabel: '60 días antes de fecha de renovación',
    actions: [
      { id: 'i1', type: 'notify_user', label: 'Alerta al Account Manager' },
      { id: 'i2', type: 'create_task', label: 'Iniciar proceso de renovación' },
    ],
    enrolledCount: 0, completedCount: 0, errorCount: 0,
    createdAt: '2024-03-01T09:00:00Z', updatedAt: '2024-03-22T09:00:00Z',
  },
  {
    id: 'wf10', name: 'Seguimiento propuesta enviada', description: 'Acciones automáticas cuando un contacto abre la propuesta.',
    status: 'active', category: 'deal', trigger: 'email_opened', triggerLabel: 'Email de propuesta abierto',
    actions: [
      { id: 'j1', type: 'notify_user', label: 'Notificar al rep en tiempo real' },
      { id: 'j2', type: 'create_task', label: 'Llamar dentro de 30 min' },
    ],
    enrolledCount: 34, completedCount: 28, errorCount: 1,
    lastRun: '2024-03-21T11:00:00Z', createdAt: '2024-02-01T09:00:00Z', updatedAt: '2024-03-10T09:00:00Z',
  },
]

// ─── Constants ────────────────────────────────────────────
const CATEGORY_META: Record<WorkflowCategory, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  contact: { label: 'Contacto', color: 'text-blue-600', bg: 'bg-blue-50', icon: <Users className="w-4 h-4" /> },
  deal:    { label: 'Deal',     color: 'text-teal-600', bg: 'bg-teal-50', icon: <GitBranch className="w-4 h-4" /> },
  ticket:  { label: 'Ticket',   color: 'text-orange-600', bg: 'bg-orange-50', icon: <AlertCircle className="w-4 h-4" /> },
  company: { label: 'Empresa',  color: 'text-purple-600', bg: 'bg-purple-50', icon: <Globe className="w-4 h-4" /> },
}

const ACTION_META: Record<ActionType, { icon: React.ReactNode; color: string }> = {
  send_email:      { icon: <Mail className="w-3.5 h-3.5" />,      color: 'text-blue-500 bg-blue-50' },
  create_task:     { icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-teal-500 bg-teal-50' },
  update_property: { icon: <Settings className="w-3.5 h-3.5" />,   color: 'text-gray-500 bg-gray-100' },
  notify_user:     { icon: <Bell className="w-3.5 h-3.5" />,       color: 'text-amber-500 bg-amber-50' },
  add_tag:         { icon: <Tag className="w-3.5 h-3.5" />,        color: 'text-green-500 bg-green-50' },
  remove_tag:      { icon: <Tag className="w-3.5 h-3.5" />,        color: 'text-red-500 bg-red-50' },
  create_deal:     { icon: <GitBranch className="w-3.5 h-3.5" />,  color: 'text-primary bg-primary/10' },
  delay:           { icon: <Clock className="w-3.5 h-3.5" />,      color: 'text-gray-400 bg-gray-50' },
  webhook:         { icon: <Globe className="w-3.5 h-3.5" />,      color: 'text-indigo-500 bg-indigo-50' },
  assign_owner:    { icon: <Users className="w-3.5 h-3.5" />,      color: 'text-purple-500 bg-purple-50' },
}

const TRIGGER_OPTIONS = [
  { value: 'contact_created',   label: 'Contacto creado' },
  { value: 'deal_stage_changed', label: 'Deal cambia de etapa' },
  { value: 'form_submitted',    label: 'Formulario enviado' },
  { value: 'date_reached',      label: 'Fecha alcanzada' },
  { value: 'property_changed',  label: 'Propiedad modificada' },
  { value: 'ticket_created',    label: 'Ticket creado' },
  { value: 'email_opened',      label: 'Email abierto' },
  { value: 'page_visited',      label: 'Página visitada' },
]

// ─── Workflow Row ─────────────────────────────────────────
interface WorkflowRowProps {
  wf: Workflow
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onSelect: (wf: Workflow) => void
}

function WorkflowRow({ wf, onToggle, onDelete, onSelect }: WorkflowRowProps) {
  const cat = CATEGORY_META[wf.category]
  const isActive = wf.status === 'active'
  const successRate = wf.enrolledCount ? Math.round((wf.completedCount / wf.enrolledCount) * 100) : 0

  return (
    <div className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors last:border-0">
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Category icon */}
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', cat.bg)}>
          <span className={cat.color}>{cat.icon}</span>
        </div>

        {/* Name + trigger */}
        <div className="flex-1 min-w-0">
          <button onClick={() => onSelect(wf)} className="text-sm font-semibold text-gray-900 hover:text-primary truncate block text-left">
            {wf.name}
          </button>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Zap className="w-3 h-3 text-amber-400" />
              {wf.triggerLabel}
            </div>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">{wf.actions.length} acciones</span>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-800">{wf.enrolledCount.toLocaleString('es-MX')}</p>
            <p className="text-xs text-gray-400">Inscritos</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-emerald-600">{successRate}%</p>
            <p className="text-xs text-gray-400">Completados</p>
          </div>
          {wf.errorCount > 0 ? (
            <div className="text-center">
              <p className="text-sm font-semibold text-red-500">{wf.errorCount}</p>
              <p className="text-xs text-gray-400">Errores</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-300">—</p>
              <p className="text-xs text-gray-400">Errores</p>
            </div>
          )}
          <div className="text-center min-w-[80px]">
            <p className="text-xs text-gray-500">{wf.lastRun ? formatDate(wf.lastRun, 'dd MMM HH:mm') : '—'}</p>
            <p className="text-xs text-gray-400">Última ejecución</p>
          </div>
        </div>

        {/* Toggle + actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onToggle(wf.id)}
            className={cn('relative w-10 h-5 rounded-full transition-colors',
              isActive ? 'bg-primary' : wf.status === 'draft' ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-200')}
            disabled={wf.status === 'draft'}
            title={wf.status === 'draft' ? 'Activa el flujo primero' : isActive ? 'Desactivar' : 'Activar'}
          >
            <span className={cn('absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
              isActive ? 'translate-x-5' : 'translate-x-0')} />
          </button>
          <Badge variant={isActive ? 'success' : wf.status === 'draft' ? 'default' : 'warning'}>
            {isActive ? 'Activo' : wf.status === 'draft' ? 'Borrador' : 'Inactivo'}
          </Badge>
          <button className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(wf.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Detail Panel ─────────────────────────────────────────
function WorkflowDetail({ wf, onClose }: { wf: Workflow; onClose: () => void }) {
  const cat = CATEGORY_META[wf.category]
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-40 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className={cat.color}>{cat.icon}</span>
          <h3 className="font-semibold text-gray-900 text-sm truncate">{wf.name}</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-lg leading-none">×</button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <p className="text-sm text-gray-600">{wf.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-3 text-center">
            <p className="text-xl font-bold text-primary">{wf.enrolledCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">Inscritos</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-xl font-bold text-emerald-600">{wf.completedCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">Completados</p>
          </div>
          <div className="card p-3 text-center">
            <p className={cn('text-xl font-bold', wf.errorCount > 0 ? 'text-red-500' : 'text-gray-300')}>{wf.errorCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">Errores</p>
          </div>
        </div>

        {/* Trigger */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Disparador</p>
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-sm text-amber-800 font-medium">{wf.triggerLabel}</span>
          </div>
        </div>

        {/* Actions flow */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Flujo de acciones</p>
          <div className="space-y-2">
            {wf.actions.map((action, idx) => {
              const meta = ACTION_META[action.type]
              return (
                <div key={action.id} className="flex items-center gap-2">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', meta.color)}>
                      {meta.icon}
                    </div>
                    {idx < wf.actions.length - 1 && <div className="w-px h-3 bg-gray-200 mt-1" />}
                  </div>
                  <div className="flex-1 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs font-medium text-gray-700">{action.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{action.type.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── New Workflow Modal ───────────────────────────────────
function NewWorkflowModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState<WorkflowCategory | ''>('')
  const [trigger, setTrigger] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const reset = () => { setStep(1); setCategory(''); setTrigger(''); setName(''); setDescription('') }

  const handleClose = () => { reset(); onClose() }

  return (
    <Modal open={open} onClose={handleClose} title="Nueva automatización" size="md">
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">¿A qué entidad aplica este flujo?</p>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(CATEGORY_META) as [WorkflowCategory, typeof CATEGORY_META[WorkflowCategory]][]).map(([key, meta]) => (
              <button key={key} onClick={() => { setCategory(key); setStep(2) }}
                className={cn('p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all hover:border-primary',
                  category === key ? 'border-primary bg-primary/5' : 'border-gray-200')}>
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', meta.bg)}>
                  <span className={meta.color}>{meta.icon}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{meta.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">¿Qué evento dispara este flujo?</p>
          <div className="space-y-2">
            {TRIGGER_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => { setTrigger(opt.value); setStep(3) }}
                className={cn('w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all hover:border-primary hover:bg-primary/5',
                  trigger === opt.value ? 'border-primary bg-primary/5' : 'border-gray-200')}>
                <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-sm text-gray-700">{opt.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setStep(1)}>← Atrás</Button>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <Input label="Nombre de la automatización" required value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Seguimiento post-reunión" />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe el propósito de esta automatización..."
              rows={3} className="input-field w-full resize-none" />
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
            <p><span className="font-medium">Entidad:</span> {category ? CATEGORY_META[category].label : '—'}</p>
            <p><span className="font-medium">Disparador:</span> {TRIGGER_OPTIONS.find(t => t.value === trigger)?.label ?? '—'}</p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}>← Atrás</Button>
            <div className="flex-1" />
            <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
            <Button variant="primary" onClick={handleClose} disabled={!name.trim()}>Crear automatización</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────
export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS)
  const [filterCategory, setFilterCategory] = useState<WorkflowCategory | ''>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Workflow | null>(null)

  const filtered = filterCategory ? workflows.filter(w => w.category === filterCategory) : workflows
  const activeCount = workflows.filter(w => w.status === 'active').length
  const totalEnrolled = workflows.reduce((s, w) => s + w.enrolledCount, 0)
  const totalCompleted = workflows.reduce((s, w) => s + w.completedCount, 0)
  const successRate = totalEnrolled ? Math.round((totalCompleted / totalEnrolled) * 100) : 0

  const handleToggle = (id: string) => {
    setWorkflows(ws => ws.map(w => {
      if (w.id !== id || w.status === 'draft') return w
      return { ...w, status: w.status === 'active' ? 'inactive' : 'active' }
    }))
  }

  const handleDelete = (id: string) => {
    setWorkflows(ws => ws.filter(w => w.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automatizaciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">Crea flujos automáticos para contactos, deals y tickets</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
          Nueva automatización
        </Button>
      </div>

      {/* Active info banner */}
      <div className="flex items-center gap-2 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl text-sm text-primary">
        <Zap className="w-4 h-4 text-primary flex-shrink-0" />
        <span><strong>{totalEnrolled.toLocaleString('es-MX')}</strong> contactos en proceso activo en este momento</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Flujos activos', value: activeCount.toString(), icon: <Play className="w-5 h-5 text-primary" />, bg: 'bg-primary/10' },
          { label: 'Total inscritos', value: totalEnrolled.toLocaleString('es-MX'), icon: <Users className="w-5 h-5 text-teal-600" />, bg: 'bg-teal-50' },
          { label: 'Completados hoy', value: '47', icon: <CheckCircle className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
          { label: 'Tasa de éxito', value: `${successRate}%`, icon: <ArrowRight className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.bg)}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 leading-none">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2">
        {[{ label: 'Todos', value: '' }, { label: 'Contacto', value: 'contact' }, { label: 'Deal', value: 'deal' }, { label: 'Ticket', value: 'ticket' }, { label: 'Empresa', value: 'company' }].map(opt => (
          <button key={opt.value} onClick={() => setFilterCategory(opt.value as WorkflowCategory | '')}
            className={cn('filter-chip', filterCategory === opt.value && 'active')}>
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} automatizaciones</span>
      </div>

      {/* Workflow list */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-3 text-gray-400">
            <Zap className="w-10 h-10" />
            <p className="text-sm">No hay automatizaciones en esta categoría.</p>
          </div>
        ) : (
          filtered.map(wf => (
            <WorkflowRow key={wf.id} wf={wf} onToggle={handleToggle} onDelete={handleDelete} onSelect={setSelected} />
          ))
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setSelected(null)} />
          <WorkflowDetail wf={selected} onClose={() => setSelected(null)} />
        </>
      )}

      <NewWorkflowModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
