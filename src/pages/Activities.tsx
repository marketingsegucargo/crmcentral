import { useState, useMemo } from 'react'
import { useActivityStore, useContactStore, useDealStore, useUserStore } from '../store'
import { Button, Badge, Modal, Input, Textarea, Select, Avatar, EmptyState } from '../components/ui'
import { formatDate, formatRelativeTime, getActivityIcon, cn } from '../utils'
import { isToday, isYesterday, parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ActivityType, Activity } from '../types'

// ─── Constants ────────────────────────────────────────────
const FILTER_CHIPS = [
  { label: 'Todas', value: '' },
  { label: 'Notas', value: 'note' },
  { label: 'Emails', value: 'email_sent' },
  { label: 'Llamadas', value: 'call' },
  { label: 'Reuniones', value: 'meeting' },
  { label: 'Deals', value: 'deal_created' },
  { label: 'Tickets', value: 'ticket_created' },
]

const ACTIVITY_TYPE_OPTIONS = [
  { label: 'Nota', value: 'note' },
  { label: 'Llamada', value: 'call' },
  { label: 'Email enviado', value: 'email_sent' },
  { label: 'Reunión', value: 'meeting' },
]

const TYPE_COLORS: Record<string, string> = {
  note:                'bg-yellow-100 text-yellow-700',
  email_sent:          'bg-blue-100 text-blue-700',
  email_received:      'bg-blue-100 text-blue-700',
  email_opened:        'bg-blue-50 text-blue-500',
  email_clicked:       'bg-blue-50 text-blue-500',
  call:                'bg-green-100 text-green-700',
  meeting:             'bg-purple-100 text-purple-700',
  task_completed:      'bg-teal-100 text-teal-700',
  deal_created:        'bg-indigo-100 text-indigo-700',
  deal_won:            'bg-emerald-100 text-emerald-700',
  deal_lost:           'bg-red-100 text-red-700',
  deal_stage_changed:  'bg-orange-100 text-orange-700',
  contact_created:     'bg-sky-100 text-sky-700',
  company_created:     'bg-cyan-100 text-cyan-700',
  ticket_created:      'bg-rose-100 text-rose-700',
  ticket_resolved:     'bg-teal-100 text-teal-700',
}

const TYPE_LINE_COLORS: Record<string, string> = {
  note:               'border-yellow-300',
  email_sent:         'border-blue-300',
  email_received:     'border-blue-300',
  call:               'border-green-300',
  meeting:            'border-purple-300',
  deal_won:           'border-emerald-300',
  deal_created:       'border-indigo-300',
  ticket_created:     'border-rose-300',
}

function getDateLabel(dateStr: string): string {
  try {
    const d = parseISO(dateStr)
    if (isToday(d)) return 'Hoy'
    if (isYesterday(d)) return 'Ayer'
    return format(d, "EEEE, d 'de' MMMM", { locale: es })
  } catch {
    return dateStr
  }
}

function getDateGroupKey(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'yyyy-MM-dd')
  } catch {
    return dateStr
  }
}

// ─── Stat Card ────────────────────────────────────────────
interface StatCardProps {
  icon: string
  label: string
  count: number
  color: string
}

function StatCard({ icon, label, count, color }: StatCardProps) {
  return (
    <div className={cn('card flex items-center gap-3 p-4', color)}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold leading-none">{count}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ─── Log Activity Modal ───────────────────────────────────
interface LogModalProps {
  open: boolean
  onClose: () => void
}

function LogActivityModal({ open, onClose }: LogModalProps) {
  const { addActivity } = useActivityStore()
  const { contacts } = useContactStore()
  const { deals } = useDealStore()
  const { currentUser } = useUserStore()

  const [form, setForm] = useState({
    type: 'note' as ActivityType,
    title: '',
    body: '',
    contactId: '',
    dealId: '',
  })

  const contactOptions = contacts.map((c) => ({
    label: `${c.firstName} ${c.lastName}`,
    value: c.id,
  }))

  const dealOptions = deals.map((d) => ({
    label: d.name,
    value: d.id,
  }))

  function handleSubmit() {
    if (!form.title.trim()) return
    addActivity({
      type: form.type,
      title: form.title,
      body: form.body || undefined,
      ownerId: currentUser.id,
      associatedContactId: form.contactId || undefined,
      associatedDealId: form.dealId || undefined,
    })
    setForm({ type: 'note', title: '', body: '', contactId: '', dealId: '' })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Registrar actividad" size="md">
      <div className="space-y-4">
        <Select
          label="Tipo de actividad"
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ActivityType }))}
          options={ACTIVITY_TYPE_OPTIONS}
        />
        <Input
          label="Título"
          placeholder="Ej: Llamada con Roberto Guzmán"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <Textarea
          label="Descripción"
          placeholder="Notas sobre esta actividad..."
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          rows={3}
        />
        <Select
          label="Contacto asociado"
          value={form.contactId}
          onChange={(e) => setForm((f) => ({ ...f, contactId: e.target.value }))}
          options={[{ label: 'Sin contacto', value: '' }, ...contactOptions]}
        />
        <Select
          label="Deal asociado"
          value={form.dealId}
          onChange={(e) => setForm((f) => ({ ...f, dealId: e.target.value }))}
          options={[{ label: 'Sin deal', value: '' }, ...dealOptions]}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!form.title.trim()}>
            Registrar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Activity Item ────────────────────────────────────────
interface ActivityItemProps {
  activity: Activity
  contact: { id: string; firstName: string; lastName: string } | undefined
  deal: { id: string; name: string } | undefined
  owner: { id: string; firstName: string; lastName: string } | undefined
  isLast: boolean
}

function ActivityItem({ activity, contact, deal, owner, isLast }: ActivityItemProps) {
  const iconBg = TYPE_COLORS[activity.type] ?? 'bg-gray-100 text-gray-600'
  const lineBorder = TYPE_LINE_COLORS[activity.type] ?? 'border-gray-200'

  return (
    <div className="flex gap-4 relative">
      {/* Timeline line */}
      {!isLast && (
        <div className={cn('absolute left-5 top-10 bottom-0 w-px border-l-2 border-dashed', lineBorder)} />
      )}
      {/* Icon */}
      <div className={cn('flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base z-10', iconBg)}>
        {getActivityIcon(activity.type)}
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0 pb-6">
        <div className="card p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-medium text-gray-900 text-sm leading-snug">{activity.title}</p>
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-gray-400 whitespace-nowrap">
                {formatRelativeTime(activity.createdAt)}
              </p>
              <p className="text-xs text-gray-300 whitespace-nowrap">
                {formatDate(activity.createdAt, 'dd MMM, HH:mm')}
              </p>
            </div>
          </div>

          {activity.body && (
            <p className="text-sm text-gray-600 mt-1 mb-3 leading-relaxed">{activity.body}</p>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 flex-wrap">
              {contact && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                  👤 {contact.firstName} {contact.lastName}
                </span>
              )}
              {deal && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                  💼 {deal.name}
                </span>
              )}
            </div>
            {owner && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Avatar name={`${owner.firstName} ${owner.lastName}`} size="xs" />
                <span className="text-xs text-gray-500">
                  {owner.firstName} {owner.lastName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────
export default function Activities() {
  const { activities, filterType, setFilterType, getFiltered } = useActivityStore()
  const { contacts } = useContactStore()
  const { deals } = useDealStore()
  const { users } = useUserStore()
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = getFiltered()

  // Stats by type
  const stats = useMemo(() => ({
    calls:    activities.filter((a) => a.type === 'call').length,
    emails:   activities.filter((a) => a.type === 'email_sent' || a.type === 'email_received').length,
    meetings: activities.filter((a) => a.type === 'meeting').length,
    notes:    activities.filter((a) => a.type === 'note').length,
  }), [activities])

  // Group by date
  const grouped = useMemo(() => {
    const groups: { key: string; label: string; items: typeof filtered }[] = []
    const map: Record<string, typeof filtered> = {}
    const order: string[] = []

    for (const act of filtered) {
      const key = getDateGroupKey(act.createdAt)
      if (!map[key]) {
        map[key] = []
        order.push(key)
      }
      map[key].push(act)
    }

    for (const key of order) {
      const label = getDateLabel(map[key][0].createdAt)
      groups.push({ key, label, items: map[key] })
    }

    return groups
  }, [filtered])

  // Lookup maps
  const contactMap = useMemo(() =>
    Object.fromEntries(contacts.map((c) => [c.id, c])), [contacts])
  const dealMap = useMemo(() =>
    Object.fromEntries(deals.map((d) => [d.id, d])), [deals])
  const userMap = useMemo(() =>
    Object.fromEntries(users.map((u) => [u.id, u])), [users])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actividades</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activities.length} actividades registradas
          </p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          + Registrar actividad
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Filter chips */}
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.value}
                onClick={() => setFilterType(chip.value)}
                className={cn(
                  'filter-chip',
                  (filterType === chip.value || (!filterType && chip.value === '')) && 'active'
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Timeline */}
          {filtered.length === 0 ? (
            <EmptyState
              icon="📋"
              title="Sin actividades"
              description="No hay actividades que coincidan con el filtro seleccionado."
            />
          ) : (
            <div className="space-y-8">
              {grouped.map((group) => (
                <div key={group.key}>
                  {/* Date header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-gray-100" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">
                      {group.label}
                    </span>
                    <div className="h-px flex-1 bg-gray-100" />
                  </div>

                  {/* Items */}
                  <div>
                    {group.items.map((activity, idx) => (
                      <ActivityItem
                        key={activity.id}
                        activity={activity}
                        contact={activity.associatedContactId ? contactMap[activity.associatedContactId] : undefined}
                        deal={activity.associatedDealId ? dealMap[activity.associatedDealId] : undefined}
                        owner={userMap[activity.ownerId]}
                        isLast={idx === group.items.length - 1}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 space-y-4">
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumen</h3>
            <div className="space-y-3">
              <StatCard icon="📞" label="Llamadas" count={stats.calls} color="bg-white" />
              <StatCard icon="📧" label="Emails" count={stats.emails} color="bg-white" />
              <StatCard icon="📅" label="Reuniones" count={stats.meetings} color="bg-white" />
              <StatCard icon="📝" label="Notas" count={stats.notes} color="bg-white" />
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Total</h3>
            <div className="text-center py-2">
              <p className="text-4xl font-bold text-primary">{activities.length}</p>
              <p className="text-xs text-gray-500 mt-1">actividades registradas</p>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Filtros activos</h3>
            {!filterType ? (
              <p className="text-xs text-gray-400">Mostrando todas las actividades</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                <Badge variant="info">
                  {FILTER_CHIPS.find((c) => c.value === filterType)?.label ?? filterType}
                </Badge>
                <button
                  onClick={() => setFilterType('')}
                  className="text-xs text-gray-400 hover:text-gray-600 underline ml-1"
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      <LogActivityModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
