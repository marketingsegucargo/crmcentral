import React, { useState } from 'react'
import { formatRelativeTime, getActivityIcon, cn } from '../../utils'
import { useActivityStore, useUserStore } from '../../store'
import { Activity, ActivityType } from '../../types'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/FormFields'
import { Avatar } from '../ui/Avatar'
import { Phone, Mail, Calendar, FileText, Plus } from 'lucide-react'

const activityColors: Record<string, string> = {
  note: 'bg-yellow-100 text-yellow-600',
  email_sent: 'bg-blue-100 text-blue-600',
  email_received: 'bg-indigo-100 text-indigo-600',
  call: 'bg-green-100 text-green-600',
  meeting: 'bg-purple-100 text-purple-600',
  task_completed: 'bg-teal-100 text-teal-700',
  deal_created: 'bg-primary/10 text-primary',
  deal_won: 'bg-green-100 text-green-700',
  deal_lost: 'bg-red-100 text-red-600',
  deal_stage_changed: 'bg-orange-100 text-orange-600',
  contact_created: 'bg-gray-100 text-gray-600',
  ticket_created: 'bg-red-100 text-red-600',
  ticket_resolved: 'bg-teal-100 text-teal-700',
  email_opened: 'bg-blue-50 text-blue-500',
}

interface ActivityTimelineProps {
  contactId?: string
  dealId?: string
  className?: string
}

export function ActivityTimeline({ contactId, dealId, className }: ActivityTimelineProps) {
  const { activities, addActivity } = useActivityStore()
  const { users, currentUser } = useUserStore()
  const [noteText, setNoteText] = useState('')
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [activeType, setActiveType] = useState<string>('all')

  const relevant = activities
    .filter(a => {
      if (contactId && dealId) return a.associatedContactId === contactId || a.associatedDealId === dealId
      if (contactId) return a.associatedContactId === contactId
      if (dealId) return a.associatedDealId === dealId
      return true
    })
    .filter(a => activeType === 'all' || a.type === activeType)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20)

  const handleAddNote = () => {
    if (!noteText.trim()) return
    addActivity({
      type: 'note',
      title: 'Nota agregada',
      body: noteText,
      ownerId: currentUser.id,
      associatedContactId: contactId,
      associatedDealId: dealId,
    })
    setNoteText('')
    setShowNoteForm(false)
  }

  const getOwnerName = (ownerId: string) => {
    const u = users.find(u => u.id === ownerId)
    return u ? `${u.firstName} ${u.lastName}` : 'Usuario'
  }

  const filters = [
    { id: 'all', label: 'Todo' },
    { id: 'note', label: 'Notas' },
    { id: 'call', label: 'Llamadas' },
    { id: 'email_sent', label: 'Emails' },
    { id: 'meeting', label: 'Reuniones' },
  ]

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Actividad</h3>
        <Button size="sm" variant="ghost" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowNoteForm(!showNoteForm)}>
          Nota
        </Button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 flex-wrap">
        {filters.map(f => (
          <button key={f.id} onClick={() => setActiveType(f.id)}
            className={cn('filter-chip text-xs', activeType === f.id && 'active')}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Quick note */}
      {showNoteForm && (
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 space-y-3">
          <Textarea
            placeholder="Escribe una nota..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="secondary" onClick={() => setShowNoteForm(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleAddNote} disabled={!noteText.trim()}>Guardar nota</Button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-0">
        {relevant.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">Sin actividad registrada</div>
        ) : (
          relevant.map((activity, i) => (
            <div key={activity.id} className="timeline-item">
              {i < relevant.length - 1 && <div className="timeline-line" />}
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0', activityColors[activity.type] || 'bg-gray-100 text-gray-500')}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-800 leading-snug">{activity.title}</p>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{formatRelativeTime(activity.createdAt)}</span>
                </div>
                {activity.body && <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{activity.body}</p>}
                <p className="text-xs text-gray-400 mt-1">{getOwnerName(activity.ownerId)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
