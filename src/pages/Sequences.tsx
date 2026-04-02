import { useState } from 'react'
import { useSequenceStore } from '../store'
import {
  Button, Badge, Modal, Input, Textarea, Select, EmptyState, Progress,
} from '../components/ui'
import { formatDate, cn } from '../utils'
import type { Sequence, SequenceStatus, SequenceStepType } from '../types'

// ─── Constants ────────────────────────────────────────────
const STATUS_META: Record<SequenceStatus, { label: string; variant: 'success' | 'warning' | 'default'; dot: string }> = {
  active:  { label: 'Activa',    variant: 'success', dot: 'bg-emerald-400' },
  paused:  { label: 'Pausada',   variant: 'warning', dot: 'bg-yellow-400' },
  draft:   { label: 'Borrador',  variant: 'default', dot: 'bg-gray-300' },
}

const STEP_ICONS: Record<SequenceStepType, string> = {
  email:     '✉️',
  delay:     '⏱️',
  task:      '✅',
  condition: '🔀',
}

const STEP_COLORS: Record<SequenceStepType, string> = {
  email:     'bg-blue-50 border-blue-200 text-blue-700',
  delay:     'bg-gray-50 border-gray-200 text-gray-600',
  task:      'bg-teal-50 border-teal-200 text-teal-700',
  condition: 'bg-purple-50 border-purple-200 text-purple-700',
}

const STATUS_OPTIONS = [
  { label: 'Activa',   value: 'active' },
  { label: 'Pausada',  value: 'paused' },
  { label: 'Borrador', value: 'draft' },
]

// ─── Stats Row ────────────────────────────────────────────
function StatsRow({ sequences }: { sequences: Sequence[] }) {
  const active = sequences.filter((s) => s.status === 'active').length
  const totalEnrolled = sequences.reduce((acc, s) => acc + s.enrolledCount, 0)
  const openRates = sequences.filter((s) => s.openRate != null).map((s) => s.openRate as number)
  const replyRates = sequences.filter((s) => s.replyRate != null).map((s) => s.replyRate as number)
  const avgOpen  = openRates.length  ? Math.round(openRates.reduce((a, b) => a + b, 0) / openRates.length) : 0
  const avgReply = replyRates.length ? Math.round(replyRates.reduce((a, b) => a + b, 0) / replyRates.length) : 0

  const stats = [
    { label: 'Secuencias activas', value: active.toString(),     icon: '▶️', color: 'text-primary' },
    { label: 'Total inscritos',    value: totalEnrolled.toString(), icon: '👥', color: 'text-teal-600' },
    { label: 'Apertura promedio',  value: `${avgOpen}%`,          icon: '👁️', color: 'text-indigo-600' },
    { label: 'Respuesta promedio', value: `${avgReply}%`,         icon: '💬', color: 'text-emerald-600' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="card p-4 flex items-center gap-3">
          <span className="text-2xl">{s.icon}</span>
          <div>
            <p className={cn('text-2xl font-bold leading-none', s.color)}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Sequence Detail Modal ────────────────────────────────
function SequenceDetailModal({
  sequence,
  onClose,
}: {
  sequence: Sequence
  onClose: () => void
}) {
  const statusMeta = STATUS_META[sequence.status]
  const completionRate = sequence.enrolledCount
    ? Math.round((sequence.completedCount / sequence.enrolledCount) * 100)
    : 0

  return (
    <Modal open onClose={onClose} title={sequence.name} size="lg">
      <div className="space-y-5">
        {/* Top badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
          <span className="text-sm text-gray-500">
            {sequence.steps.length} pasos
          </span>
          <span className="text-sm text-gray-500">·</span>
          <span className="text-sm text-gray-500">
            {sequence.enrolledCount} contactos inscritos
          </span>
        </div>

        {sequence.description && (
          <p className="text-sm text-gray-600">{sequence.description}</p>
        )}

        {/* Completion rate */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Tasa de completación</span>
            <span className="text-xs font-semibold text-gray-900">{completionRate}%</span>
          </div>
          <Progress value={completionRate} max={100} />
          <div className="flex justify-between mt-1.5 text-xs text-gray-400">
            <span>{sequence.completedCount} completados</span>
            <span>{sequence.enrolledCount} total</span>
          </div>
        </div>

        {/* Stats mini-row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-blue-700">{sequence.openRate ?? 0}%</p>
            <p className="text-xs text-blue-500">Tasa de apertura</p>
          </div>
          <div className="bg-teal-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-teal-700">{sequence.replyRate ?? 0}%</p>
            <p className="text-xs text-teal-500">Tasa de respuesta</p>
          </div>
        </div>

        {/* Steps flow */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Pasos de la secuencia</h4>
          <div className="space-y-2">
            {sequence.steps.map((step, idx) => {
              const icon  = STEP_ICONS[step.type]
              const color = STEP_COLORS[step.type]

              return (
                <div key={step.id} className="flex items-start gap-3 relative">
                  {/* Connector line */}
                  {idx < sequence.steps.length - 1 && (
                    <div className="absolute left-4 top-9 bottom-0 w-px bg-gray-200 z-0" />
                  )}
                  {/* Step number bubble */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 z-10">
                    {step.order}
                  </div>
                  {/* Step content */}
                  <div className={cn('flex-1 border rounded-lg px-3 py-2 mb-2', color)}>
                    <div className="flex items-center gap-2">
                      <span>{icon}</span>
                      <span className="text-xs font-semibold capitalize">{step.type}</span>
                      {step.delayDays != null && step.type !== 'email' && (
                        <span className="text-xs opacity-70">
                          — esperar {step.delayDays} día{step.delayDays !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {step.subject && (
                      <p className="text-xs mt-0.5 font-medium">{step.subject}</p>
                    )}
                    {step.delayDays != null && step.type === 'email' && step.delayDays > 0 && (
                      <p className="text-xs opacity-60 mt-0.5">Enviar {step.delayDays} día{step.delayDays !== 1 ? 's' : ''} después</p>
                    )}
                    {step.taskTitle && (
                      <p className="text-xs mt-0.5">{step.taskTitle}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          <Button variant="secondary">Editar pasos</Button>
          <Button variant="primary">Inscribir contactos</Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── New Sequence Modal ───────────────────────────────────
function NewSequenceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addSequence } = useSequenceStore()
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'draft' as SequenceStatus,
  })

  function handleSubmit() {
    if (!form.name.trim()) return
    addSequence({
      name: form.name,
      description: form.description || undefined,
      status: form.status,
      steps: [],
      enrolledCount: 0,
      completedCount: 0,
      openRate: 0,
      replyRate: 0,
    })
    setForm({ name: '', description: '', status: 'draft' })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva secuencia" size="md">
      <div className="space-y-4">
        <Input
          label="Nombre"
          placeholder="Ej: Seguimiento post-demo"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <Textarea
          label="Descripción"
          placeholder="¿Qué hace esta secuencia?"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
        />
        <Select
          label="Estado inicial"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as SequenceStatus }))}
          options={STATUS_OPTIONS}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!form.name.trim()}>
            Crear secuencia
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Sequence Card ────────────────────────────────────────
function SequenceCard({
  sequence,
  onSelect,
  onToggle,
  onDuplicate,
  onDelete,
}: {
  sequence: Sequence
  onSelect: (s: Sequence) => void
  onToggle: (id: string, status: SequenceStatus) => void
  onDuplicate: (s: Sequence) => void
  onDelete: (id: string) => void
}) {
  const statusMeta = STATUS_META[sequence.status]
  const completionRate = sequence.enrolledCount
    ? Math.round((sequence.completedCount / sequence.enrolledCount) * 100)
    : 0

  return (
    <div
      className="card p-5 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onSelect(sequence)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{sequence.name}</h3>
          {sequence.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{sequence.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', statusMeta.dot)} />
          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
        </div>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-md p-2">
          <p className="text-sm font-bold text-gray-900">{sequence.steps.length}</p>
          <p className="text-xs text-gray-400">Pasos</p>
        </div>
        <div className="bg-gray-50 rounded-md p-2">
          <p className="text-sm font-bold text-gray-900">{sequence.enrolledCount}</p>
          <p className="text-xs text-gray-400">Inscritos</p>
        </div>
        <div className="bg-gray-50 rounded-md p-2">
          <p className="text-sm font-bold text-gray-900">{completionRate}%</p>
          <p className="text-xs text-gray-400">Completado</p>
        </div>
      </div>

      {/* Completion bar */}
      <div>
        <Progress value={completionRate} max={100} />
      </div>

      {/* Open & reply rates */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>
          <span className="font-semibold text-gray-700">{sequence.openRate ?? 0}%</span> apertura
        </span>
        <span>
          <span className="font-semibold text-gray-700">{sequence.replyRate ?? 0}%</span> respuesta
        </span>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-2 pt-2 border-t border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onSelect(sequence)}
          className="text-xs text-primary hover:underline font-medium"
        >
          Ver detalles
        </button>
        <button
          onClick={() => onToggle(sequence.id, sequence.status === 'active' ? 'paused' : 'active')}
          className={cn(
            'text-xs hover:underline',
            sequence.status === 'active' ? 'text-yellow-600' : 'text-emerald-600'
          )}
        >
          {sequence.status === 'active' ? 'Pausar' : 'Activar'}
        </button>
        <button
          onClick={() => onDuplicate(sequence)}
          className="text-xs text-gray-500 hover:underline"
        >
          Duplicar
        </button>
        <button
          onClick={() => onDelete(sequence.id)}
          className="text-xs text-red-400 hover:underline ml-auto"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────
export default function Sequences() {
  const { sequences, addSequence, updateSequence, deleteSequence } = useSequenceStore()
  const [newModalOpen, setNewModalOpen] = useState(false)
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null)

  function handleToggleStatus(id: string, status: SequenceStatus) {
    updateSequence(id, { status })
  }

  function handleDuplicate(seq: Sequence) {
    addSequence({
      name: `${seq.name} (copia)`,
      description: seq.description,
      status: 'draft',
      steps: seq.steps.map((s) => ({ ...s, sequenceId: '' })),
      enrolledCount: 0,
      completedCount: 0,
      openRate: 0,
      replyRate: 0,
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Secuencias</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {sequences.length} secuencia{sequences.length !== 1 ? 's' : ''} configurada{sequences.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" onClick={() => setNewModalOpen(true)}>
          + Nueva Secuencia
        </Button>
      </div>

      {/* Stats */}
      <StatsRow sequences={sequences} />

      {/* Grid */}
      {sequences.length === 0 ? (
        <EmptyState
          icon="🔄"
          title="Sin secuencias"
          description="Crea tu primera secuencia automatizada para nutrir leads."
          action={
            <Button variant="primary" onClick={() => setNewModalOpen(true)}>
              Crear secuencia
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sequences.map((seq) => (
            <SequenceCard
              key={seq.id}
              sequence={seq}
              onSelect={setSelectedSequence}
              onToggle={handleToggleStatus}
              onDuplicate={handleDuplicate}
              onDelete={deleteSequence}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <NewSequenceModal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
      />

      {selectedSequence && (
        <SequenceDetailModal
          sequence={selectedSequence}
          onClose={() => setSelectedSequence(null)}
        />
      )}
    </div>
  )
}
