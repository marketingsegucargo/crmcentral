import React, { useState } from 'react'
import {
  Users, GitBranch, Database, Users2, Plug2, Bell, Palette,
  Plus, Edit2, Trash2, Save, Check, X, ChevronDown, ChevronUp,
  GripVertical, Mail, Shield, Key, Globe,
} from 'lucide-react'
import {
  Button, Avatar, Input, Select, Modal, Textarea,
} from '../components/ui'
import { useUserStore, useUIStore, usePipelineStore } from '../store'
import { cn, generateId } from '../utils'
import type { UserRole, PipelineStage } from '../types'

// ─── Sub-nav definition ───────────────────────────────────

type SettingsSection =
  | 'usuarios'
  | 'pipelines'
  | 'propiedades'
  | 'equipos'
  | 'integraciones'
  | 'notificaciones'
  | 'apariencia'

const NAV_ITEMS: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
  { id: 'usuarios', label: 'Usuarios', icon: <Users className="w-4 h-4" /> },
  { id: 'pipelines', label: 'Pipelines', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'propiedades', label: 'Propiedades', icon: <Database className="w-4 h-4" /> },
  { id: 'equipos', label: 'Equipos', icon: <Users2 className="w-4 h-4" /> },
  { id: 'integraciones', label: 'Integraciones', icon: <Plug2 className="w-4 h-4" /> },
  { id: 'notificaciones', label: 'Notificaciones', icon: <Bell className="w-4 h-4" /> },
  { id: 'apariencia', label: 'Apariencia', icon: <Palette className="w-4 h-4" /> },
]

// ─── Role helpers ─────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrador',
  manager: 'Manager',
  rep: 'Sales Rep',
  viewer: 'Viewer',
}

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-red-50 text-red-700',
  admin: 'bg-primary/10 text-primary',
  manager: 'bg-purple-50 text-purple-700',
  rep: 'bg-blue-50 text-blue-700',
  viewer: 'bg-gray-100 text-gray-600',
}

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Administrador', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Sales Rep', value: 'rep' },
  { label: 'Viewer', value: 'viewer' },
]

// ─── Invite User Modal ────────────────────────────────────

interface InviteModalProps {
  open: boolean
  onClose: () => void
}

function InviteModal({ open, onClose }: InviteModalProps) {
  const { addUser } = useUserStore()
  const { addToast } = useUIStore()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'rep' as UserRole,
    title: '',
  })
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  React.useEffect(() => {
    if (open) {
      setForm({ firstName: '', lastName: '', email: '', role: 'rep', title: '' })
      setErrors({})
    }
  }, [open])

  const set = (key: keyof typeof form, val: string) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.firstName.trim()) e.firstName = 'Requerido'
    if (!form.lastName.trim()) e.lastName = 'Requerido'
    if (!form.email.trim()) e.email = 'Email requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    addUser({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      role: form.role,
      title: form.title.trim() || undefined,
      isActive: true,
    })
    addToast({
      type: 'success',
      title: 'Usuario invitado',
      message: `Se envió invitación a ${form.email}`,
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invitar usuario"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>Enviar invitación</Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nombre"
            required
            value={form.firstName}
            onChange={e => set('firstName', e.target.value)}
            error={errors.firstName}
            placeholder="Ana"
          />
          <Input
            label="Apellido"
            required
            value={form.lastName}
            onChange={e => set('lastName', e.target.value)}
            error={errors.lastName}
            placeholder="García"
          />
        </div>
        <Input
          label="Email"
          required
          type="email"
          value={form.email}
          onChange={e => set('email', e.target.value)}
          error={errors.email}
          placeholder="ana@empresa.com"
        />
        <Select
          label="Rol"
          value={form.role}
          onChange={e => set('role', e.target.value as UserRole)}
          options={ROLE_OPTIONS}
        />
        <Input
          label="Cargo (opcional)"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="Sales Manager"
        />
      </div>
    </Modal>
  )
}

// ─── USUARIOS section ─────────────────────────────────────

function UsuariosSection() {
  const { users, currentUser, updateUser, deleteUser } = useUserStore()
  const { addToast } = useUIStore()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<UserRole>('rep')

  const handleEditRole = (userId: string, currentRole: UserRole) => {
    setEditingId(userId)
    setEditRole(currentRole)
  }

  const handleSaveRole = (userId: string) => {
    updateUser(userId, { role: editRole })
    setEditingId(null)
    addToast({ type: 'success', title: 'Rol actualizado' })
  }

  const handleDeactivate = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return
    updateUser(userId, { isActive: !user.isActive })
    addToast({
      type: 'success',
      title: user.isActive ? 'Usuario desactivado' : 'Usuario activado',
    })
  }

  const handleRemove = (userId: string) => {
    deleteUser(userId)
    addToast({ type: 'success', title: 'Usuario eliminado' })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Usuarios</h2>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona los miembros del equipo y sus permisos.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setInviteOpen(true)}
        >
          Invitar usuario
        </Button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="table-header pl-4">Usuario</th>
              <th className="table-header">Email</th>
              <th className="table-header">Rol</th>
              <th className="table-header">Cargo</th>
              <th className="table-header">Equipo</th>
              <th className="table-header">Estado</th>
              <th className="table-header">Último acceso</th>
              <th className="table-header w-24 text-right pr-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                {/* Avatar + Name */}
                <td className="table-cell pl-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {user.firstName} {user.lastName}
                        {user.id === currentUser.id && (
                          <span className="ml-1.5 text-xs font-normal text-gray-400">(tú)</span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="table-cell">
                  <span className="text-xs text-gray-500">{user.email}</span>
                </td>

                {/* Role — inline edit */}
                <td className="table-cell">
                  {editingId === user.id ? (
                    <div className="flex items-center gap-1">
                      <select
                        value={editRole}
                        onChange={e => setEditRole(e.target.value as UserRole)}
                        className="input-field text-xs py-1 w-32"
                        autoFocus
                      >
                        {ROLE_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleSaveRole(user.id)}
                        className="p-1 rounded text-teal-600 hover:bg-teal-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded text-gray-400 hover:bg-gray-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      ROLE_COLORS[user.role]
                    )}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  )}
                </td>

                {/* Title */}
                <td className="table-cell">
                  <span className="text-sm text-gray-600">{user.title ?? '—'}</span>
                </td>

                {/* Team */}
                <td className="table-cell">
                  <span className="text-sm text-gray-400">{user.teamId ?? '—'}</span>
                </td>

                {/* Status */}
                <td className="table-cell">
                  <span className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-medium',
                    user.isActive ? 'text-teal-600' : 'text-gray-400'
                  )}>
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      user.isActive ? 'bg-teal-500' : 'bg-gray-300'
                    )} />
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>

                {/* Last login */}
                <td className="table-cell">
                  <span className="text-xs text-gray-400">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </span>
                </td>

                {/* Actions */}
                <td className="table-cell text-right pr-4">
                  {user.id !== currentUser.id && (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEditRole(user.id, user.role)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors text-xs"
                        title="Editar rol"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeactivate(user.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                        title={user.isActive ? 'Desactivar' : 'Activar'}
                      >
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemove(user.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  )
}

// ─── PIPELINES section ────────────────────────────────────

function PipelinesSection() {
  const { pipelines, updatePipeline } = usePipelineStore()
  const { addToast } = useUIStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingStageId, setEditingStageId] = useState<string | null>(null)
  const [stageName, setStageName] = useState('')

  const handleAddStage = (pipelineId: string) => {
    const pipeline = pipelines.find(p => p.id === pipelineId)
    if (!pipeline) return
    const newStage: PipelineStage = {
      id: generateId(),
      name: 'Nueva etapa',
      probability: 50,
      order: pipeline.stages.length + 1,
      color: '#6366f1',
      pipelineId,
    }
    updatePipeline(pipelineId, { stages: [...pipeline.stages, newStage] })
    addToast({ type: 'success', title: 'Etapa agregada' })
    setEditingStageId(newStage.id)
    setStageName(newStage.name)
  }

  const handleDeleteStage = (pipelineId: string, stageId: string) => {
    const pipeline = pipelines.find(p => p.id === pipelineId)
    if (!pipeline) return
    updatePipeline(pipelineId, {
      stages: pipeline.stages.filter(s => s.id !== stageId),
    })
    addToast({ type: 'success', title: 'Etapa eliminada' })
  }

  const handleSaveStageName = (pipelineId: string, stageId: string) => {
    const pipeline = pipelines.find(p => p.id === pipelineId)
    if (!pipeline || !stageName.trim()) return
    updatePipeline(pipelineId, {
      stages: pipeline.stages.map(s =>
        s.id === stageId ? { ...s, name: stageName.trim() } : s
      ),
    })
    setEditingStageId(null)
    setStageName('')
    addToast({ type: 'success', title: 'Etapa actualizada' })
  }

  const handleProbabilityChange = (pipelineId: string, stageId: string, prob: number) => {
    const pipeline = pipelines.find(p => p.id === pipelineId)
    if (!pipeline) return
    updatePipeline(pipelineId, {
      stages: pipeline.stages.map(s =>
        s.id === stageId ? { ...s, probability: prob } : s
      ),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Pipelines</h2>
        <p className="text-sm text-gray-500 mt-0.5">Configura etapas y probabilidades de cierre.</p>
      </div>

      <div className="space-y-3">
        {pipelines.map(pipeline => {
          const isExpanded = expandedId === pipeline.id

          return (
            <div key={pipeline.id} className="card overflow-hidden">
              {/* Pipeline header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : pipeline.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    pipeline.type === 'deals' ? 'bg-primary/10' : 'bg-teal-50'
                  )}>
                    <GitBranch className={cn(
                      'w-4 h-4',
                      pipeline.type === 'deals' ? 'text-primary' : 'text-teal-600'
                    )} />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{pipeline.name}</span>
                      {pipeline.isDefault && (
                        <span className="text-xs px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded-full font-medium">
                          Predeterminado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {pipeline.type === 'deals' ? 'Ventas' : 'Tickets'} · {pipeline.stages.length} etapas
                    </p>
                  </div>
                </div>
                {isExpanded
                  ? <ChevronUp className="w-4 h-4 text-gray-400" />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />
                }
              </button>

              {/* Stages editor */}
              {isExpanded && (
                <div className="border-t border-gray-100">
                  <div className="px-5 py-3 bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Etapas</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {[...pipeline.stages]
                      .sort((a, b) => a.order - b.order)
                      .map(stage => (
                        <div
                          key={stage.id}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 group transition-colors"
                        >
                          {/* Drag handle (visual only) */}
                          <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 cursor-grab" />

                          {/* Color dot */}
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0 border border-white shadow-sm"
                            style={{ backgroundColor: stage.color }}
                          />

                          {/* Stage name — inline edit */}
                          <div className="flex-1 min-w-0">
                            {editingStageId === stage.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  autoFocus
                                  value={stageName}
                                  onChange={e => setStageName(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleSaveStageName(pipeline.id, stage.id)
                                    if (e.key === 'Escape') { setEditingStageId(null); setStageName('') }
                                  }}
                                  className="input-field text-sm py-1 flex-1"
                                />
                                <button
                                  onClick={() => handleSaveStageName(pipeline.id, stage.id)}
                                  className="p-1 rounded text-teal-600 hover:bg-teal-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => { setEditingStageId(null); setStageName('') }}
                                  className="p-1 rounded text-gray-400 hover:bg-gray-100"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingStageId(stage.id); setStageName(stage.name) }}
                                className="text-sm font-medium text-gray-800 hover:text-primary transition-colors text-left"
                              >
                                {stage.name}
                              </button>
                            )}
                          </div>

                          {/* Probability */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <input
                              type="number"
                              value={stage.probability}
                              min={0}
                              max={100}
                              onChange={e => handleProbabilityChange(
                                pipeline.id,
                                stage.id,
                                Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                              )}
                              className="input-field text-xs py-1 w-16 text-center"
                            />
                            <span className="text-xs text-gray-400">%</span>
                          </div>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteStage(pipeline.id, stage.id)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                  </div>

                  {/* Add stage */}
                  <div className="px-5 py-3 border-t border-gray-100">
                    <button
                      onClick={() => handleAddStage(pipeline.id)}
                      className="flex items-center gap-2 text-sm text-primary hover:text-navy transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar etapa
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── INTEGRACIONES section ────────────────────────────────

const INTEGRATIONS = [
  {
    name: 'Gmail',
    description: 'Envía y recibe emails directamente desde el CRM.',
    icon: <Mail className="w-6 h-6" />,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    connected: false,
  },
  {
    name: 'Outlook',
    description: 'Integra tu correo de Microsoft Outlook.',
    icon: <Mail className="w-6 h-6" />,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    connected: false,
  },
  {
    name: 'Slack',
    description: 'Recibe notificaciones de deals y actividades en Slack.',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.165 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 01-2.52-2.523 2.526 2.526 0 012.52-2.52h6.313A2.527 2.527 0 0124 15.165a2.528 2.528 0 01-2.522 2.523h-6.313z"/>
      </svg>
    ),
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    connected: true,
  },
  {
    name: 'LinkedIn',
    description: 'Enriquece contactos con datos de LinkedIn.',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-700',
    connected: false,
  },
  {
    name: 'Stripe',
    description: 'Gestiona pagos, suscripciones y facturas.',
    icon: <Key className="w-6 h-6" />,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    connected: false,
  },
  {
    name: 'Zapier',
    description: 'Automatiza flujos con más de 3,000 aplicaciones.',
    icon: <Plug2 className="w-6 h-6" />,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    connected: false,
  },
  {
    name: 'Salesforce',
    description: 'Sincronización bidireccional con Salesforce CRM.',
    icon: <Globe className="w-6 h-6" />,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    connected: false,
  },
  {
    name: 'WhatsApp',
    description: 'Gestiona conversaciones de WhatsApp en el inbox.',
    icon: <MessageCircleIcon />,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    connected: true,
  },
  {
    name: 'Google Calendar',
    description: 'Sincroniza reuniones y eventos con Google Calendar.',
    icon: <CalendarIcon />,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    connected: true,
  },
  {
    name: 'Zoom',
    description: 'Crea y gestiona reuniones de Zoom desde el CRM.',
    icon: <CameraIcon />,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    connected: false,
  },
]

function MessageCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375c-.99-1.576-1.516-3.391-1.516-5.26 0-5.445 4.455-9.885 9.942-9.885 2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99-.004 5.444-4.46 9.885-9.935 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411"/>
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
    </svg>
  )
}

function IntegracionesSection() {
  const { addToast } = useUIStore()
  const [connectedSet, setConnectedSet] = useState<Set<string>>(
    new Set(INTEGRATIONS.filter(i => i.connected).map(i => i.name))
  )

  const toggle = (name: string) => {
    const wasConnected = connectedSet.has(name)
    setConnectedSet(prev => {
      const next = new Set(prev)
      if (wasConnected) next.delete(name)
      else next.add(name)
      return next
    })
    addToast({
      type: wasConnected ? 'info' : 'success',
      title: wasConnected ? `${name} desconectado` : `${name} conectado`,
      message: wasConnected
        ? 'La integración fue desconectada.'
        : 'La integración fue conectada exitosamente.',
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Integraciones</h2>
        <p className="text-sm text-gray-500 mt-0.5">Conecta CRM Central con tus herramientas favoritas.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {INTEGRATIONS.map(integ => {
          const isConnected = connectedSet.has(integ.name)
          return (
            <div key={integ.name} className="card p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                  integ.iconBg
                )}>
                  <span className={integ.iconColor}>{integ.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{integ.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{integ.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={isConnected ? 'secondary' : 'primary'}
                      onClick={() => toggle(integ.name)}
                      className="flex-shrink-0"
                    >
                      {isConnected ? 'Desconectar' : 'Conectar'}
                    </Button>
                  </div>
                  {isConnected && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-teal-600 font-medium">
                      <Check className="w-3 h-3" />
                      Conectado
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── PROPIEDADES section ──────────────────────────────────

type PropType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'phone' | 'email' | 'url'
type PropEntity = 'contact' | 'company' | 'deal' | 'ticket'

interface CRMProperty {
  id: string
  name: string
  label: string
  type: PropType
  entity: PropEntity
  isRequired: boolean
  isBuiltIn: boolean
  group: string
  options?: string[]
}

const INITIAL_PROPERTIES: CRMProperty[] = [
  // Contact built-in
  { id: 'p1', name: 'firstName', label: 'Nombre', type: 'text', entity: 'contact', isRequired: true, isBuiltIn: true, group: 'Información básica' },
  { id: 'p2', name: 'lastName', label: 'Apellido', type: 'text', entity: 'contact', isRequired: true, isBuiltIn: true, group: 'Información básica' },
  { id: 'p3', name: 'email', label: 'Email', type: 'email', entity: 'contact', isRequired: true, isBuiltIn: true, group: 'Información básica' },
  { id: 'p4', name: 'phone', label: 'Teléfono', type: 'phone', entity: 'contact', isRequired: false, isBuiltIn: true, group: 'Información básica' },
  { id: 'p5', name: 'jobTitle', label: 'Cargo', type: 'text', entity: 'contact', isRequired: false, isBuiltIn: true, group: 'Información básica' },
  { id: 'p6', name: 'lifecycleStage', label: 'Etapa del ciclo de vida', type: 'select', entity: 'contact', isRequired: false, isBuiltIn: true, group: 'CRM', options: ['subscriber', 'lead', 'marketing_qualified', 'sales_qualified', 'opportunity', 'customer', 'evangelist'] },
  { id: 'p7', name: 'leadScore', label: 'Lead Score', type: 'number', entity: 'contact', isRequired: false, isBuiltIn: true, group: 'CRM' },
  { id: 'p8', name: 'source', label: 'Fuente', type: 'select', entity: 'contact', isRequired: false, isBuiltIn: true, group: 'CRM', options: ['organic_search', 'paid_ads', 'referral', 'social_media', 'email', 'event', 'direct'] },
  // Company built-in
  { id: 'p9', name: 'companyName', label: 'Nombre empresa', type: 'text', entity: 'company', isRequired: true, isBuiltIn: true, group: 'Información básica' },
  { id: 'p10', name: 'domain', label: 'Dominio web', type: 'url', entity: 'company', isRequired: false, isBuiltIn: true, group: 'Información básica' },
  { id: 'p11', name: 'industry', label: 'Industria', type: 'select', entity: 'company', isRequired: false, isBuiltIn: true, group: 'Información básica' },
  { id: 'p12', name: 'annualRevenue', label: 'Ingresos anuales', type: 'number', entity: 'company', isRequired: false, isBuiltIn: true, group: 'Financiero' },
  { id: 'p13', name: 'employeeCount', label: 'N° empleados', type: 'number', entity: 'company', isRequired: false, isBuiltIn: true, group: 'Información básica' },
  // Deal built-in
  { id: 'p14', name: 'dealName', label: 'Nombre del deal', type: 'text', entity: 'deal', isRequired: true, isBuiltIn: true, group: 'Información básica' },
  { id: 'p15', name: 'value', label: 'Valor', type: 'number', entity: 'deal', isRequired: false, isBuiltIn: true, group: 'Financiero' },
  { id: 'p16', name: 'closeDate', label: 'Fecha de cierre', type: 'date', entity: 'deal', isRequired: false, isBuiltIn: true, group: 'CRM' },
  { id: 'p17', name: 'probability', label: 'Probabilidad (%)', type: 'number', entity: 'deal', isRequired: false, isBuiltIn: true, group: 'CRM' },
  // Custom
  { id: 'p18', name: 'linkedinUrl', label: 'LinkedIn URL', type: 'url', entity: 'contact', isRequired: false, isBuiltIn: false, group: 'Redes sociales' },
  { id: 'p19', name: 'birthDate', label: 'Fecha de nacimiento', type: 'date', entity: 'contact', isRequired: false, isBuiltIn: false, group: 'Información básica' },
  { id: 'p20', name: 'preferredLanguage', label: 'Idioma preferido', type: 'select', entity: 'contact', isRequired: false, isBuiltIn: false, group: 'Preferencias', options: ['Español', 'Inglés', 'Portugués', 'Francés'] },
  { id: 'p21', name: 'contractValue', label: 'Valor contrato anual', type: 'number', entity: 'company', isRequired: false, isBuiltIn: false, group: 'Financiero' },
]

const PROP_TYPE_LABELS: Record<PropType, string> = {
  text: 'Texto', number: 'Número', date: 'Fecha', select: 'Lista desplegable',
  checkbox: 'Casilla', phone: 'Teléfono', email: 'Email', url: 'URL',
}

const ENTITY_COLORS: Record<PropEntity, string> = {
  contact: 'bg-blue-50 text-blue-700',
  company: 'bg-purple-50 text-purple-700',
  deal: 'bg-teal-50 text-teal-700',
  ticket: 'bg-orange-50 text-orange-700',
}

const ENTITY_LABELS: Record<PropEntity, string> = {
  contact: 'Contacto', company: 'Empresa', deal: 'Deal', ticket: 'Ticket',
}

function PropiedadesSection() {
  const { addToast } = useUIStore()
  const [properties, setProperties] = useState<CRMProperty[]>(INITIAL_PROPERTIES)
  const [filterEntity, setFilterEntity] = useState<PropEntity | ''>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ label: '', name: '', type: 'text' as PropType, entity: 'contact' as PropEntity, group: '', isRequired: false })

  const filtered = filterEntity ? properties.filter(p => p.entity === filterEntity) : properties

  const handleAdd = () => {
    if (!form.label.trim()) return
    const newProp: CRMProperty = {
      id: generateId(),
      name: form.name || form.label.toLowerCase().replace(/\s+/g, '_'),
      label: form.label,
      type: form.type,
      entity: form.entity,
      isRequired: form.isRequired,
      isBuiltIn: false,
      group: form.group || 'Personalizado',
    }
    setProperties(p => [...p, newProp])
    addToast({ type: 'success', title: 'Propiedad creada', message: `"${form.label}" fue agregada exitosamente.` })
    setModalOpen(false)
    setForm({ label: '', name: '', type: 'text', entity: 'contact', group: '', isRequired: false })
  }

  const handleDelete = (id: string) => {
    const prop = properties.find(p => p.id === id)
    if (prop?.isBuiltIn) return
    setProperties(p => p.filter(x => x.id !== id))
    addToast({ type: 'success', title: 'Propiedad eliminada' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Propiedades personalizadas</h2>
          <p className="text-sm text-gray-500 mt-0.5">Define campos para contactos, empresas, deals y tickets.</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
          Nueva propiedad
        </Button>
      </div>

      {/* Entity filter */}
      <div className="flex items-center gap-2">
        {[{ label: 'Todos', value: '' }, { label: 'Contacto', value: 'contact' }, { label: 'Empresa', value: 'company' }, { label: 'Deal', value: 'deal' }, { label: 'Ticket', value: 'ticket' }].map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilterEntity(opt.value as PropEntity | '')}
            className={cn('filter-chip', filterEntity === opt.value && 'active')}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} propiedades</span>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="table-header pl-4">Etiqueta</th>
              <th className="table-header">Nombre interno</th>
              <th className="table-header">Tipo</th>
              <th className="table-header">Entidad</th>
              <th className="table-header">Grupo</th>
              <th className="table-header">Tipo</th>
              <th className="table-header w-20 text-right pr-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(prop => (
              <tr key={prop.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="table-cell pl-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{prop.label}</span>
                    {prop.isRequired && <span className="text-xs text-red-400">*</span>}
                  </div>
                </td>
                <td className="table-cell">
                  <code className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{prop.name}</code>
                </td>
                <td className="table-cell">
                  <span className="text-xs text-gray-600">{PROP_TYPE_LABELS[prop.type]}</span>
                </td>
                <td className="table-cell">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', ENTITY_COLORS[prop.entity])}>
                    {ENTITY_LABELS[prop.entity]}
                  </span>
                </td>
                <td className="table-cell">
                  <span className="text-xs text-gray-500">{prop.group}</span>
                </td>
                <td className="table-cell">
                  <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', prop.isBuiltIn ? 'bg-gray-100 text-gray-500' : 'bg-primary/10 text-primary')}>
                    {prop.isBuiltIn ? 'Sistema' : 'Personalizado'}
                  </span>
                </td>
                <td className="table-cell text-right pr-4">
                  {!prop.isBuiltIn && (
                    <button
                      onClick={() => handleDelete(prop.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva propiedad" size="sm">
        <div className="space-y-3">
          <Input label="Etiqueta visible" placeholder="Ej: Tamaño de empresa" required value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
          <Input label="Nombre interno (snake_case)" placeholder="Ej: company_size" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tipo de dato" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as PropType }))}
              options={Object.entries(PROP_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
            <Select label="Entidad" value={form.entity} onChange={e => setForm(f => ({ ...f, entity: e.target.value as PropEntity }))}
              options={Object.entries(ENTITY_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
          </div>
          <Input label="Grupo" placeholder="Ej: Información básica" value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isRequired} onChange={e => setForm(f => ({ ...f, isRequired: e.target.checked }))} className="rounded" />
            <span className="text-sm text-gray-700">Campo requerido</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleAdd} disabled={!form.label.trim()}>Crear propiedad</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── EQUIPOS section ──────────────────────────────────────

interface Team {
  id: string
  name: string
  description: string
  color: string
  memberIds: string[]
  managerId: string
}

const INITIAL_TEAMS: Team[] = [
  { id: 't1', name: 'Ventas México', description: 'Equipo principal de ventas para mercado mexicano.', color: '#002DA4', memberIds: ['u2', 'u3', 'u4', 'u5'], managerId: 'u2' },
  { id: 't2', name: 'Customer Success', description: 'Atención al cliente y soporte post-venta.', color: '#2AD4AE', memberIds: ['u4', 'u7'], managerId: 'u4' },
  { id: 't3', name: 'Marketing', description: 'Estrategia de marketing y generación de demanda.', color: '#8B5CF6', memberIds: ['u6', 'u5'], managerId: 'u6' },
]

const TEAM_COLORS = ['#002DA4', '#2AD4AE', '#001E5D', '#7C3AED', '#DC2626', '#059669', '#D97706', '#0891B2']

function EquiposSection() {
  const { users } = useUserStore()
  const { addToast } = useUIStore()
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTeam, setEditTeam] = useState<Team | null>(null)
  const [form, setForm] = useState({ name: '', description: '', color: '#002DA4', managerId: 'u2', memberIds: [] as string[] })

  const userMap = Object.fromEntries(users.map(u => [u.id, u]))

  const openNew = () => {
    setEditTeam(null)
    setForm({ name: '', description: '', color: '#002DA4', managerId: 'u2', memberIds: [] })
    setModalOpen(true)
  }

  const openEdit = (team: Team) => {
    setEditTeam(team)
    setForm({ name: team.name, description: team.description, color: team.color, managerId: team.managerId, memberIds: [...team.memberIds] })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editTeam) {
      setTeams(ts => ts.map(t => t.id === editTeam.id ? { ...t, ...form } : t))
      addToast({ type: 'success', title: 'Equipo actualizado' })
    } else {
      setTeams(ts => [...ts, { id: generateId(), ...form }])
      addToast({ type: 'success', title: 'Equipo creado' })
    }
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    setTeams(ts => ts.filter(t => t.id !== id))
    addToast({ type: 'success', title: 'Equipo eliminado' })
  }

  const toggleMember = (userId: string) => {
    setForm(f => ({
      ...f,
      memberIds: f.memberIds.includes(userId)
        ? f.memberIds.filter(id => id !== userId)
        : [...f.memberIds, userId],
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Equipos</h2>
          <p className="text-sm text-gray-500 mt-0.5">Organiza a los usuarios en equipos y asigna responsabilidades.</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={openNew}>
          Nuevo equipo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map(team => {
          const manager = userMap[team.managerId]
          const members = team.memberIds.map(id => userMap[id]).filter(Boolean)
          return (
            <div key={team.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: team.color }}>
                    {team.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{team.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{team.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(team)} className="p-1.5 rounded text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(team.id)} className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {manager && (
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                  <Avatar name={`${manager.firstName} ${manager.lastName}`} size="xs" />
                  <span>Manager: <span className="font-medium text-gray-700">{manager.firstName} {manager.lastName}</span></span>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-2">{members.length} miembros</p>
                <div className="flex items-center gap-1 flex-wrap">
                  {members.map(m => (
                    <div key={m.id} title={`${m.firstName} ${m.lastName}`}>
                      <Avatar name={`${m.firstName} ${m.lastName}`} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTeam ? 'Editar equipo' : 'Nuevo equipo'} size="sm">
        <div className="space-y-3">
          <Input label="Nombre del equipo" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Ventas Norte" />
          <Textarea label="Descripción" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe el propósito del equipo" rows={2} />
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Color</p>
            <div className="flex gap-2">
              {TEAM_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={cn('w-7 h-7 rounded-lg transition-all', form.color === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'hover:scale-105')}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <Select label="Manager" value={form.managerId} onChange={e => setForm(f => ({ ...f, managerId: e.target.value }))}
            options={users.filter(u => u.isActive).map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))} />
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Miembros</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {users.filter(u => u.isActive).map(u => (
                <label key={u.id} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-gray-50">
                  <input type="checkbox" checked={form.memberIds.includes(u.id)} onChange={() => toggleMember(u.id)} className="rounded" />
                  <Avatar name={`${u.firstName} ${u.lastName}`} size="xs" />
                  <span className="text-sm text-gray-700">{u.firstName} {u.lastName}</span>
                  <span className="text-xs text-gray-400 ml-auto">{u.title}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave} disabled={!form.name.trim()}>{editTeam ? 'Guardar' : 'Crear equipo'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── Notifications section ────────────────────────────────

function NotificacionesSection() {
  const { addToast } = useUIStore()
  const [prefs, setPrefs] = useState({
    dealAssigned: true,
    dealWon: true,
    dealLost: false,
    taskDue: true,
    taskOverdue: true,
    ticketCreated: false,
    ticketResolved: true,
    newContact: false,
    emailOpened: true,
    emailClicked: false,
    emailDigest: true,
    browserNotifications: false,
    smsAlerts: false,
  })

  const toggle = (key: keyof typeof prefs) =>
    setPrefs(p => ({ ...p, [key]: !p[key] }))

  const GROUPS = [
    {
      title: 'Negocios (Deals)',
      items: [
        { key: 'dealAssigned', label: 'Deal asignado a mí' },
        { key: 'dealWon', label: 'Deal ganado' },
        { key: 'dealLost', label: 'Deal perdido' },
      ],
    },
    {
      title: 'Tareas',
      items: [
        { key: 'taskDue', label: 'Tarea próxima a vencer (24h)' },
        { key: 'taskOverdue', label: 'Tarea vencida' },
      ],
    },
    {
      title: 'Tickets & Soporte',
      items: [
        { key: 'ticketCreated', label: 'Nuevo ticket creado' },
        { key: 'ticketResolved', label: 'Ticket resuelto' },
      ],
    },
    {
      title: 'Email Marketing',
      items: [
        { key: 'emailOpened', label: 'Email abierto por contacto' },
        { key: 'emailClicked', label: 'Link en email clickeado' },
        { key: 'emailDigest', label: 'Resumen diario de emails' },
      ],
    },
    {
      title: 'Canales adicionales',
      items: [
        { key: 'browserNotifications', label: 'Notificaciones del navegador' },
        { key: 'smsAlerts', label: 'Alertas por SMS' },
      ],
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Notificaciones</h2>
        <p className="text-sm text-gray-500 mt-0.5">Elige qué eventos quieres recibir en tu bandeja.</p>
      </div>

      {GROUPS.map(group => (
        <div key={group.title} className="card p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">{group.title}</p>
          <div className="space-y-3">
            {group.items.map(item => (
              <label key={item.key} className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {item.label}
                </span>
                <button
                  role="switch"
                  aria-checked={prefs[item.key as keyof typeof prefs]}
                  onClick={() => toggle(item.key as keyof typeof prefs)}
                  className={cn(
                    'relative w-10 h-5 rounded-full transition-colors flex-shrink-0',
                    prefs[item.key as keyof typeof prefs] ? 'bg-primary' : 'bg-gray-200'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                    prefs[item.key as keyof typeof prefs] ? 'translate-x-5' : 'translate-x-0'
                  )} />
                </button>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          icon={<Save className="w-4 h-4" />}
          onClick={() => addToast({ type: 'success', title: 'Preferencias guardadas' })}
        >
          Guardar preferencias
        </Button>
      </div>
    </div>
  )
}

// ─── Apariencia section ───────────────────────────────────

function AparienciaSection() {
  const { addToast } = useUIStore()
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [accentColor, setAccentColor] = useState('#002DA4')

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Apariencia</h2>
        <p className="text-sm text-gray-500 mt-0.5">Personaliza los colores y el tema del workspace.</p>
      </div>

      <div className="card p-5 space-y-5">
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Tema</p>
          <div className="flex gap-3">
            {(['light', 'dark', 'system'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  'flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all capitalize',
                  theme === t
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                )}
              >
                {t === 'light' ? 'Claro' : t === 'dark' ? 'Oscuro' : 'Sistema'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Color de acento</p>
          <div className="flex items-center gap-3">
            {['#002DA4', '#2AD4AE', '#001E5D', '#7C3AED', '#DC2626'].map(c => (
              <button
                key={c}
                onClick={() => setAccentColor(c)}
                className={cn(
                  'w-8 h-8 rounded-lg transition-all',
                  accentColor === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                )}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={accentColor}
              onChange={e => setAccentColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200"
              title="Color personalizado"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button
            variant="primary"
            size="sm"
            icon={<Save className="w-4 h-4" />}
            onClick={() => addToast({ type: 'success', title: 'Apariencia guardada' })}
          >
            Guardar
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Settings layout ──────────────────────────────────────

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('usuarios')

  const renderSection = () => {
    switch (activeSection) {
      case 'usuarios': return <UsuariosSection />
      case 'pipelines': return <PipelinesSection />
      case 'integraciones': return <IntegracionesSection />
      case 'notificaciones': return <NotificacionesSection />
      case 'apariencia': return <AparienciaSection />
      case 'propiedades': return <PropiedadesSection />
      case 'equipos': return <EquiposSection />
      default: return null
    }
  }

  return (
    <div className="flex h-full -m-6 overflow-hidden">
      {/* ── Sub-navigation ────────────────────────── */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-900">Configuración</h1>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                activeSection === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <span className={activeSection === item.id ? 'text-primary' : 'text-gray-400'}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main content ──────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl">
          {renderSection()}
        </div>
      </div>
    </div>
  )
}
