import React, { useState, useMemo } from 'react'
import {
  Plus, Phone, Mail, Calendar, RefreshCw, MoreHorizontal,
  CheckSquare, Square, Check, Edit2, Trash2, Clock,
  ChevronDown, ChevronRight, AlertCircle, TrendingUp,
  CheckCircle, CalendarDays, ListTodo, User, Briefcase,
  X,
} from 'lucide-react'
import {
  Button, Badge, Modal, Input, Textarea, Select,
  Avatar, Dropdown, EmptyState, Progress,
} from '../components/ui'
import {
  useTaskStore, useUserStore, useUIStore,
  useContactStore, useDealStore,
} from '../store'
import {
  formatDate, formatRelativeTime, formatDateLabel, getStatusColor,
  getPriorityColor, isOverdue, cn, generateId,
} from '../utils'
import type { Task, TaskType, TaskStatus } from '../types'
import { parseISO, isToday, isTomorrow, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'

// ─── Constants ────────────────────────────────────────────

const TASK_TYPE_OPTIONS: { label: string; value: TaskType; icon: React.ReactNode }[] = [
  { label: 'Llamada', value: 'call', icon: <Phone className="w-4 h-4" /> },
  { label: 'Email', value: 'email', icon: <Mail className="w-4 h-4" /> },
  { label: 'Reunión', value: 'meeting', icon: <Calendar className="w-4 h-4" /> },
  { label: 'Seguimiento', value: 'follow_up', icon: <RefreshCw className="w-4 h-4" /> },
  { label: 'Otro', value: 'other', icon: <CheckSquare className="w-4 h-4" /> },
]

const PRIORITY_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Baja', value: 'low' },
  { label: 'Alta', value: 'high' },
]

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  normal: 'Normal',
  high: 'Alta',
}

const TYPE_LABELS: Record<TaskType, string> = {
  call: 'Llamada',
  email: 'Email',
  meeting: 'Reunión',
  follow_up: 'Seguimiento',
  other: 'Otro',
}

function TaskTypeIcon({ type, className }: { type: TaskType; className?: string }) {
  const icons: Record<TaskType, React.ReactNode> = {
    call: <Phone className={cn('w-4 h-4', className)} />,
    email: <Mail className={cn('w-4 h-4', className)} />,
    meeting: <Calendar className={cn('w-4 h-4', className)} />,
    follow_up: <RefreshCw className={cn('w-4 h-4', className)} />,
    other: <CheckSquare className={cn('w-4 h-4', className)} />,
  }
  return <>{icons[type]}</>
}

function typeIconBg(type: TaskType): string {
  const map: Record<TaskType, string> = {
    call: 'bg-blue-50 text-blue-600',
    email: 'bg-purple-50 text-purple-600',
    meeting: 'bg-teal-50 text-teal-600',
    follow_up: 'bg-orange-50 text-orange-600',
    other: 'bg-gray-100 text-gray-600',
  }
  return map[type] ?? 'bg-gray-100 text-gray-600'
}

// ─── Tab type ─────────────────────────────────────────────

type TaskTab = 'all' | 'today' | 'overdue' | 'completed'

// ─── Task Form Modal ──────────────────────────────────────

interface TaskFormData {
  title: string
  type: TaskType
  priority: string
  dueDate: string
  dueTime: string
  ownerId: string
  notes: string
  contactId: string
  dealId: string
}

const emptyTaskForm = (): TaskFormData => ({
  title: '',
  type: 'call',
  priority: 'normal',
  dueDate: new Date().toISOString().split('T')[0],
  dueTime: '',
  ownerId: '',
  notes: '',
  contactId: '',
  dealId: '',
})

interface TaskFormModalProps {
  open: boolean
  onClose: () => void
  editing: Task | null
}

function TaskFormModal({ open, onClose, editing }: TaskFormModalProps) {
  const { addTask, updateTask } = useTaskStore()
  const { users, currentUser } = useUserStore()
  const { contacts } = useContactStore()
  const { deals } = useDealStore()
  const { addToast } = useUIStore()

  const [form, setForm] = useState<TaskFormData>(() => {
    if (editing) {
      return {
        title: editing.title,
        type: editing.type,
        priority: editing.priority,
        dueDate: editing.dueDate,
        dueTime: editing.dueTime ?? '',
        ownerId: editing.ownerId,
        notes: editing.notes ?? '',
        contactId: editing.associatedContactIds[0] ?? '',
        dealId: editing.associatedDealIds[0] ?? '',
      }
    }
    return { ...emptyTaskForm(), ownerId: currentUser.id }
  })

  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({})

  const set = (key: keyof TaskFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof TaskFormData, string>> = {}
    if (!form.title.trim()) errs.title = 'El título es requerido'
    if (!form.dueDate) errs.dueDate = 'La fecha es requerida'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const payload = {
      title: form.title.trim(),
      type: form.type,
      status: 'not_started' as TaskStatus,
      priority: form.priority as Task['priority'],
      dueDate: form.dueDate,
      dueTime: form.dueTime || undefined,
      ownerId: form.ownerId || currentUser.id,
      notes: form.notes || undefined,
      associatedContactIds: form.contactId ? [form.contactId] : [],
      associatedDealIds: form.dealId ? [form.dealId] : [],
      associatedCompanyIds: [],
    }

    if (editing) {
      updateTask(editing.id, payload)
      addToast({ type: 'success', title: 'Tarea actualizada', message: `"${payload.title}" ha sido actualizada.` })
    } else {
      addTask(payload)
      addToast({ type: 'success', title: 'Tarea creada', message: `"${payload.title}" ha sido agregada.` })
    }
    onClose()
  }

  const contactOptions = contacts.map((c) => ({
    label: `${c.firstName} ${c.lastName}`,
    value: c.id,
  }))

  const dealOptions = deals
    .filter((d) => d.status === 'open')
    .map((d) => ({ label: d.name, value: d.id }))

  const ownerOptions = users.map((u) => ({
    label: `${u.firstName} ${u.lastName}`,
    value: u.id,
  }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar Tarea' : 'Nueva Tarea'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editing ? 'Guardar cambios' : 'Crear tarea'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Título"
          required
          placeholder="Ej. Llamar a Roberto sobre la propuesta"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          error={errors.title}
        />

        {/* Type selector */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Tipo de tarea</label>
          <div className="grid grid-cols-5 gap-2">
            {TASK_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('type', opt.value)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all',
                  form.type === opt.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                {opt.icon}
                <span className="leading-none">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Prioridad"
            options={PRIORITY_OPTIONS}
            value={form.priority}
            onChange={(e) => set('priority', e.target.value)}
          />
          <Select
            label="Responsable"
            options={ownerOptions}
            value={form.ownerId}
            onChange={(e) => set('ownerId', e.target.value)}
            placeholder="Seleccionar"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Fecha de vencimiento"
            required
            type="date"
            value={form.dueDate}
            onChange={(e) => set('dueDate', e.target.value)}
            error={errors.dueDate}
          />
          <Input
            label="Hora (opcional)"
            type="time"
            value={form.dueTime}
            onChange={(e) => set('dueTime', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Contacto asociado"
            options={contactOptions}
            value={form.contactId}
            onChange={(e) => set('contactId', e.target.value)}
            placeholder="Sin contacto"
          />
          <Select
            label="Deal asociado"
            options={dealOptions}
            value={form.dealId}
            onChange={(e) => set('dealId', e.target.value)}
            placeholder="Sin deal"
          />
        </div>

        <Textarea
          label="Notas"
          placeholder="Notas adicionales sobre esta tarea..."
          rows={3}
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>
    </Modal>
  )
}

// ─── Task Row ─────────────────────────────────────────────

interface TaskRowProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

function TaskRow({ task, onEdit, onDelete }: TaskRowProps) {
  const { completeTask, updateTask } = useTaskStore()
  const { users } = useUserStore()
  const { contacts } = useContactStore()
  const { deals } = useDealStore()
  const { addToast } = useUIStore()

  const owner = users.find((u) => u.id === task.ownerId)
  const associatedContacts = contacts.filter((c) => task.associatedContactIds.includes(c.id))
  const associatedDeals = deals.filter((d) => task.associatedDealIds.includes(d.id))

  const isCompleted = task.status === 'completed'
  const taskIsOverdue = !isCompleted && isOverdue(task.dueDate)

  const handleToggleComplete = () => {
    if (isCompleted) {
      updateTask(task.id, { status: 'not_started', completedAt: undefined })
    } else {
      completeTask(task.id)
      addToast({ type: 'success', title: 'Tarea completada', message: `"${task.title}" marcada como completada.` })
    }
  }

  const handleDelete = () => {
    onDelete(task)
    addToast({ type: 'info', title: 'Tarea eliminada', message: `"${task.title}" eliminada.` })
  }

  return (
    <div className={cn(
      'flex items-start gap-3 px-4 py-3 rounded-xl transition-all group',
      isCompleted
        ? 'bg-gray-50/50 opacity-60'
        : taskIsOverdue
          ? 'bg-red-50/30 hover:bg-red-50/50'
          : 'hover:bg-gray-50/80',
    )}>
      {/* Checkbox */}
      <button
        onClick={handleToggleComplete}
        className={cn(
          'mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
          isCompleted
            ? 'bg-teal-500 border-teal-500 text-white'
            : taskIsOverdue
              ? 'border-red-400 hover:bg-red-50'
              : 'border-gray-300 hover:border-primary',
        )}
      >
        {isCompleted && <Check className="w-3 h-3" />}
      </button>

      {/* Type icon */}
      <div className={cn('mt-0.5 p-1.5 rounded-lg flex-shrink-0', typeIconBg(task.type))}>
        <TaskTypeIcon type={task.type} className="w-3.5 h-3.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <span className={cn(
            'text-sm font-medium leading-snug',
            isCompleted ? 'line-through text-gray-400' : taskIsOverdue ? 'text-red-700' : 'text-gray-800',
          )}>
            {task.title}
          </span>

          {/* Priority badge */}
          {task.priority !== 'normal' && !isCompleted && (
            <Badge className={cn(getPriorityColor(task.priority), 'text-xs')}>
              {PRIORITY_LABELS[task.priority]}
            </Badge>
          )}

          {/* Overdue badge */}
          {taskIsOverdue && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-100 px-1.5 py-0.5 rounded-md">
              <AlertCircle className="w-3 h-3" />
              Vencida
            </span>
          )}
        </div>

        {/* Associations */}
        {(associatedContacts.length > 0 || associatedDeals.length > 0) && (
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {associatedContacts.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded-md px-1.5 py-0.5"
              >
                <User className="w-2.5 h-2.5" />
                {c.firstName} {c.lastName}
              </span>
            ))}
            {associatedDeals.map((d) => (
              <span
                key={d.id}
                className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 rounded-md px-1.5 py-0.5"
              >
                <Briefcase className="w-2.5 h-2.5" />
                {d.name}
              </span>
            ))}
          </div>
        )}

        {/* Notes preview */}
        {task.notes && !isCompleted && (
          <p className="text-xs text-gray-400 mt-1 truncate max-w-[400px]">{task.notes}</p>
        )}
      </div>

      {/* Right: time + owner + actions */}
      <div className="flex items-center gap-3 ml-auto flex-shrink-0">
        {/* Due time */}
        {task.dueTime && (
          <div className={cn('flex items-center gap-1 text-xs', taskIsOverdue ? 'text-red-500' : 'text-gray-400')}>
            <Clock className="w-3 h-3" />
            {task.dueTime}
          </div>
        )}

        {/* Owner */}
        {owner && (
          <Avatar name={`${owner.firstName} ${owner.lastName}`} size="xs" src={owner.avatarUrl} />
        )}

        {/* Actions dropdown */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Dropdown
            trigger={
              <button className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            }
            items={[
              { label: 'Editar', icon: <Edit2 className="w-4 h-4" />, onClick: () => onEdit(task) },
              {
                label: isCompleted ? 'Marcar pendiente' : 'Marcar completada',
                icon: <CheckCircle className="w-4 h-4" />,
                onClick: handleToggleComplete,
              },
              { label: 'Eliminar', icon: <Trash2 className="w-4 h-4" />, onClick: handleDelete, danger: true },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Task Group ───────────────────────────────────────────

interface TaskGroupProps {
  label: string
  tasks: Task[]
  isOverdueGroup?: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

function TaskGroup({ label, tasks, isOverdueGroup, onEdit, onDelete }: TaskGroupProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="mb-4">
      {/* Group header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 w-full text-left mb-2 group/header"
      >
        {collapsed
          ? <ChevronRight className="w-4 h-4 text-gray-400" />
          : <ChevronDown className="w-4 h-4 text-gray-400" />}
        <span className={cn(
          'text-sm font-semibold',
          isOverdueGroup ? 'text-red-600' : 'text-gray-700'
        )}>
          {label}
        </span>
        <span className={cn(
          'text-xs font-medium px-1.5 py-0.5 rounded-full ml-1',
          isOverdueGroup ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
        )}>
          {tasks.length}
        </span>
        {isOverdueGroup && (
          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
        )}
      </button>

      {!collapsed && (
        <div className="space-y-1">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Tasks Page ──────────────────────────────────────

export default function Tasks() {
  const {
    tasks, isFormOpen, editingTask,
    openForm, closeForm,
    deleteTask, completeTask,
    getFiltered,
  } = useTaskStore()
  const { users, currentUser } = useUserStore()
  const { addToast } = useUIStore()

  const [activeTab, setActiveTab] = useState<TaskTab>('all')

  // Stats
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

  const pendingTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'deferred')
  const todayTasks = pendingTasks.filter((t) => {
    try { return isToday(parseISO(t.dueDate)) } catch { return false }
  })
  const overdueTasks = pendingTasks.filter((t) => {
    try { return isOverdue(t.dueDate) && !isToday(parseISO(t.dueDate)) } catch { return false }
  })
  const completedThisWeek = tasks.filter((t) => {
    if (t.status !== 'completed' || !t.completedAt) return false
    try {
      return isWithinInterval(parseISO(t.completedAt), { start: weekStart, end: weekEnd })
    } catch { return false }
  })

  // Filtered task list based on active tab
  const tabTasks = useMemo(() => {
    switch (activeTab) {
      case 'today':
        return pendingTasks.filter((t) => {
          try { return isToday(parseISO(t.dueDate)) } catch { return false }
        })
      case 'overdue':
        return pendingTasks.filter((t) => {
          try { return isOverdue(t.dueDate) && !isToday(parseISO(t.dueDate)) } catch { return false }
        })
      case 'completed':
        return tasks.filter((t) => t.status === 'completed')
          .sort((a, b) => new Date(b.completedAt ?? b.updatedAt).getTime() - new Date(a.completedAt ?? a.updatedAt).getTime())
      default:
        return tasks.filter((t) => t.status !== 'completed' && t.status !== 'deferred')
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    }
  }, [tasks, activeTab])

  // Group tasks by date for "all" and "today" tabs
  const groupedTasks = useMemo(() => {
    if (activeTab === 'completed' || activeTab === 'overdue') return null

    const groups: Record<string, Task[]> = {}
    for (const task of tabTasks) {
      const label = formatDateLabel(task.dueDate)
      if (!groups[label]) groups[label] = []
      groups[label].push(task)
    }
    return groups
  }, [tabTasks, activeTab])

  const handleDelete = (task: Task) => {
    deleteTask(task.id)
    addToast({ type: 'info', title: 'Tarea eliminada', message: `"${task.title}" eliminada.` })
  }

  const TABS: { label: string; value: TaskTab; count?: number }[] = [
    { label: 'Todas', value: 'all', count: pendingTasks.length },
    { label: 'Hoy', value: 'today', count: todayTasks.length },
    { label: 'Vencidas', value: 'overdue', count: overdueTasks.length },
    { label: 'Completadas', value: 'completed', count: completedThisWeek.length },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pendingTasks.length} tarea{pendingTasks.length !== 1 ? 's' : ''} pendiente{pendingTasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => openForm()}
        >
          Nueva Tarea
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="bg-blue-50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">Hoy</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{todayTasks.length}</p>
          <p className="text-xs text-blue-500 mt-0.5">tareas para hoy</p>
        </div>

        <div className={cn('rounded-xl px-4 py-3', overdueTasks.length > 0 ? 'bg-red-50' : 'bg-gray-50')}>
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className={cn('w-4 h-4', overdueTasks.length > 0 ? 'text-red-500' : 'text-gray-400')} />
            <span className={cn('text-xs font-medium', overdueTasks.length > 0 ? 'text-red-600' : 'text-gray-500')}>Vencidas</span>
          </div>
          <p className={cn('text-2xl font-bold', overdueTasks.length > 0 ? 'text-red-700' : 'text-gray-600')}>{overdueTasks.length}</p>
          <p className={cn('text-xs mt-0.5', overdueTasks.length > 0 ? 'text-red-400' : 'text-gray-400')}>requieren atención</p>
        </div>

        <div className="bg-teal-50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-medium text-teal-600">Esta semana</span>
          </div>
          <p className="text-2xl font-bold text-teal-700">{completedThisWeek.length}</p>
          <p className="text-xs text-teal-500 mt-0.5">completadas</p>
        </div>

        <div className="bg-gray-50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <ListTodo className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-500">Pendientes</span>
          </div>
          <p className="text-2xl font-bold text-gray-700">{pendingTasks.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">en total</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.value
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100',
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full font-semibold min-w-[20px] text-center',
                activeTab === tab.value
                  ? 'bg-white/25 text-white'
                  : tab.value === 'overdue' && tab.count > 0
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-500',
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {tabTasks.length === 0 ? (
          <EmptyState
            icon={
              activeTab === 'completed'
                ? <CheckCircle className="w-10 h-10" />
                : activeTab === 'overdue'
                  ? <AlertCircle className="w-10 h-10" />
                  : <ListTodo className="w-10 h-10" />
            }
            title={
              activeTab === 'completed'
                ? 'Sin tareas completadas esta semana'
                : activeTab === 'overdue'
                  ? '¡Sin tareas vencidas!'
                  : activeTab === 'today'
                    ? 'Sin tareas para hoy'
                    : 'Sin tareas pendientes'
            }
            description={
              activeTab === 'overdue'
                ? 'Excelente trabajo manteniéndote al día.'
                : 'Crea una nueva tarea para comenzar.'
            }
            action={
              activeTab !== 'completed' && activeTab !== 'overdue'
                ? <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => openForm()}>Nueva tarea</Button>
                : undefined
            }
          />
        ) : (
          <>
            {/* Overdue tab: flat list */}
            {activeTab === 'overdue' && (
              <div className="space-y-1">
                {tabTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onEdit={(t) => openForm(t)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {/* Completed tab: flat list */}
            {activeTab === 'completed' && (
              <div className="space-y-1">
                {tabTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onEdit={(t) => openForm(t)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {/* All / Today tabs: grouped by date */}
            {(activeTab === 'all' || activeTab === 'today') && groupedTasks && (
              <div>
                {Object.entries(groupedTasks).map(([label, groupTasks]) => {
                  const isOverdueGroup = label !== 'Hoy' && label !== 'Mañana' && groupTasks.some((t) => isOverdue(t.dueDate))
                  return (
                    <TaskGroup
                      key={label}
                      label={label}
                      tasks={groupTasks}
                      isOverdueGroup={isOverdueGroup}
                      onEdit={(t) => openForm(t)}
                      onDelete={handleDelete}
                    />
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <TaskFormModal
          open={isFormOpen}
          onClose={closeForm}
          editing={editingTask}
        />
      )}
    </div>
  )
}
