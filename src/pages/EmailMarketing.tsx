import { useState } from 'react'
import { useEmailStore } from '../store'
import {
  Button, Badge, Card, Modal, Input, Textarea, Select,
  EmptyState, Tabs, Progress,
} from '../components/ui'
import { formatDate, cn } from '../utils'
import type { CampaignStatus, EmailCampaign, EmailTemplate } from '../types'

// ─── Constants ────────────────────────────────────────────
const STATUS_FILTER_CHIPS = [
  { label: 'Todas', value: '' },
  { label: 'Borrador', value: 'draft' },
  { label: 'Programada', value: 'scheduled' },
  { label: 'Enviada', value: 'sent' },
]

const CAMPAIGN_STATUS_OPTIONS = [
  { label: 'Borrador', value: 'draft' },
  { label: 'Programada', value: 'scheduled' },
]

const STATUS_BADGE: Record<CampaignStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  draft:     { label: 'Borrador',    variant: 'default' },
  scheduled: { label: 'Programada',  variant: 'warning' },
  sending:   { label: 'Enviando',    variant: 'info' },
  sent:      { label: 'Enviada',     variant: 'success' },
  paused:    { label: 'Pausada',     variant: 'error' },
}

const TEMPLATE_CATEGORIES = [
  { label: 'Onboarding',   value: 'Onboarding' },
  { label: 'Sales',        value: 'Sales' },
  { label: 'Marketing',    value: 'Marketing' },
  { label: 'Support',      value: 'Support' },
  { label: 'Newsletter',   value: 'Newsletter' },
]

const CATEGORY_BADGE_COLOR: Record<string, string> = {
  Onboarding: 'bg-teal-50 text-teal-700 border-teal-100',
  Sales:      'bg-blue-50 text-blue-700 border-blue-100',
  Marketing:  'bg-purple-50 text-purple-700 border-purple-100',
  Support:    'bg-orange-50 text-orange-700 border-orange-100',
  Newsletter: 'bg-indigo-50 text-indigo-700 border-indigo-100',
}

// ─── Helpers ──────────────────────────────────────────────
function safePercent(num: number, denom: number): number {
  if (!denom) return 0
  return Math.round((num / denom) * 100)
}

// ─── Campaign Stats Row ───────────────────────────────────
interface StatsRowProps {
  campaigns: EmailCampaign[]
}

function CampaignStatsRow({ campaigns }: StatsRowProps) {
  const sent = campaigns.filter((c) => c.status === 'sent')
  const totalSent = sent.reduce((s, c) => s + c.stats.sent, 0)
  const totalOpened = sent.reduce((s, c) => s + c.stats.opened, 0)
  const totalClicked = sent.reduce((s, c) => s + c.stats.clicked, 0)
  const avgOpen = sent.length ? safePercent(totalOpened, totalSent) : 0
  const avgClick = sent.length ? safePercent(totalClicked, totalSent) : 0
  // Sum all recipient counts across all campaigns as "subscribers"
  const totalSubscribers = campaigns.reduce((s, c) => s + c.stats.delivered, 0)

  const stats = [
    { label: 'Campañas enviadas',   value: sent.length.toString(),         icon: '📨', color: 'text-primary' },
    { label: 'Tasa de apertura',    value: `${avgOpen}%`,                   icon: '👁️', color: 'text-teal-600' },
    { label: 'Tasa de clics',       value: `${avgClick}%`,                  icon: '🔗', color: 'text-indigo-600' },
    { label: 'Total entregados',    value: totalSubscribers.toLocaleString('es-MX'), icon: '📬', color: 'text-gray-700' },
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

// ─── Campaign Detail Stats ────────────────────────────────
function CampaignDetailStats({ campaign }: { campaign: EmailCampaign }) {
  const { stats } = campaign
  const openRate = safePercent(stats.opened, stats.delivered)
  const clickRate = safePercent(stats.clicked, stats.delivered)
  const deliveryRate = safePercent(stats.delivered, stats.sent)
  const unsubRate = safePercent(stats.unsubscribed, stats.delivered)

  return (
    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
      <div>
        <p className="text-xs text-gray-500 mb-1">Apertura</p>
        <p className="text-sm font-semibold text-gray-900">
          {openRate}%{' '}
          <span className="font-normal text-gray-400">({stats.opened} abiertos)</span>
        </p>
        <Progress value={openRate} max={100} className="mt-1" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Clics</p>
        <p className="text-sm font-semibold text-gray-900">
          {clickRate}%{' '}
          <span className="font-normal text-gray-400">({stats.clicked} clics)</span>
        </p>
        <Progress value={clickRate} max={100} className="mt-1" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">Entrega</p>
        <p className="text-sm font-semibold text-teal-600">{deliveryRate}%</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">Bajas</p>
        <p className="text-sm font-semibold text-red-500">{unsubRate}%</p>
      </div>
    </div>
  )
}

// ─── Campaign Card ────────────────────────────────────────
function CampaignCard({ campaign, onDelete }: { campaign: EmailCampaign; onDelete: (id: string) => void }) {
  const statusMeta = STATUS_BADGE[campaign.status] ?? STATUS_BADGE.draft
  const isSent = campaign.status === 'sent'

  return (
    <div className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{campaign.name}</h3>
          <p className="text-xs text-gray-400 truncate mt-0.5">{campaign.subject}</p>
        </div>
        <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
      </div>

      <div className="text-xs text-gray-500 space-y-0.5">
        <p>
          <span className="text-gray-400">De: </span>
          {campaign.fromName} &lt;{campaign.fromEmail}&gt;
        </p>
        {campaign.sentAt && (
          <p>
            <span className="text-gray-400">Enviado: </span>
            {formatDate(campaign.sentAt, 'dd MMM yyyy, HH:mm')}
          </p>
        )}
        {campaign.scheduledAt && campaign.status === 'scheduled' && (
          <p>
            <span className="text-gray-400">Programado: </span>
            {formatDate(campaign.scheduledAt, 'dd MMM yyyy, HH:mm')}
          </p>
        )}
        {isSent && (
          <p>
            <span className="text-gray-400">Enviados: </span>
            <span className="font-medium text-gray-700">{campaign.stats.sent.toLocaleString('es-MX')}</span>
          </p>
        )}
      </div>

      {isSent && <CampaignDetailStats campaign={campaign} />}

      <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
        <button className="text-xs text-primary hover:underline">Ver detalles</button>
        {campaign.status === 'draft' && (
          <button className="text-xs text-teal-600 hover:underline">Editar</button>
        )}
        <button
          onClick={() => onDelete(campaign.id)}
          className="text-xs text-red-400 hover:underline ml-auto"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}

// ─── New Campaign Modal ───────────────────────────────────
function NewCampaignModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addCampaign } = useEmailStore()
  const [form, setForm] = useState({
    name: '',
    subject: '',
    fromName: '',
    fromEmail: '',
    htmlContent: '',
    status: 'draft' as 'draft' | 'scheduled',
    scheduledAt: '',
    recipientCount: '',
  })

  function handleSubmit() {
    if (!form.name.trim() || !form.subject.trim()) return
    addCampaign({
      name: form.name,
      subject: form.subject,
      fromName: form.fromName,
      fromEmail: form.fromEmail,
      htmlContent: form.htmlContent || '<p></p>',
      status: form.status,
      scheduledAt: form.status === 'scheduled' && form.scheduledAt ? form.scheduledAt : undefined,
      recipientCount: parseInt(form.recipientCount || '0', 10),
      stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 },
    })
    setForm({ name: '', subject: '', fromName: '', fromEmail: '', htmlContent: '', status: 'draft', scheduledAt: '', recipientCount: '' })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva campaña" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre de campaña"
            placeholder="Ej: Newsletter Mayo 2024"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Asunto del email"
            placeholder="Ej: Novedades del mes 🚀"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre del remitente"
            placeholder="Ej: CRM Central"
            value={form.fromName}
            onChange={(e) => setForm((f) => ({ ...f, fromName: e.target.value }))}
          />
          <Input
            label="Email del remitente"
            placeholder="Ej: news@crmcentral.com"
            type="email"
            value={form.fromEmail}
            onChange={(e) => setForm((f) => ({ ...f, fromEmail: e.target.value }))}
          />
        </div>
        <Textarea
          label="Contenido HTML"
          placeholder="<h1>Tu contenido aquí</h1>"
          value={form.htmlContent}
          onChange={(e) => setForm((f) => ({ ...f, htmlContent: e.target.value }))}
          rows={5}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Estado"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'draft' | 'scheduled' }))}
            options={CAMPAIGN_STATUS_OPTIONS}
          />
          <Input
            label="Total de destinatarios"
            type="number"
            placeholder="0"
            value={form.recipientCount}
            onChange={(e) => setForm((f) => ({ ...f, recipientCount: e.target.value }))}
          />
        </div>
        {form.status === 'scheduled' && (
          <Input
            label="Fecha y hora de envío"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
          />
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!form.name.trim() || !form.subject.trim()}>
            Crear campaña
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Template Card ────────────────────────────────────────
function TemplateCard({ template, onDelete }: { template: EmailTemplate; onDelete: (id: string) => void }) {
  const catClass = CATEGORY_BADGE_COLOR[template.category] ?? 'bg-gray-50 text-gray-600 border-gray-100'

  return (
    <div className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900">{template.name}</h3>
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', catClass)}>
          {template.category}
        </span>
      </div>
      <p className="text-sm text-gray-500 italic truncate">&quot;{template.subject}&quot;</p>
      <p className="text-xs text-gray-400">
        Creada {formatDate(template.createdAt)} · Actualizada {formatDate(template.updatedAt)}
      </p>
      <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
        <button className="text-xs text-primary hover:underline font-medium">Usar</button>
        <button className="text-xs text-gray-500 hover:underline">Editar</button>
        <button
          onClick={() => onDelete(template.id)}
          className="text-xs text-red-400 hover:underline ml-auto"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}

// ─── New Template Modal ───────────────────────────────────
function NewTemplateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    name: '',
    category: 'Marketing',
    subject: '',
    htmlContent: '',
  })

  function handleSubmit() {
    if (!form.name.trim()) return
    // Templates store is read-only in the current store setup,
    // so we just close and could extend the store later.
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva plantilla" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre de la plantilla"
            placeholder="Ej: Propuesta comercial"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Select
            label="Categoría"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            options={TEMPLATE_CATEGORIES}
          />
        </div>
        <Input
          label="Asunto"
          placeholder="Ej: Propuesta personalizada para {{company}}"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
        />
        <Textarea
          label="Contenido HTML"
          placeholder="<h1>Hola {{firstName}},</h1>"
          value={form.htmlContent}
          onChange={(e) => setForm((f) => ({ ...f, htmlContent: e.target.value }))}
          rows={6}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!form.name.trim()}>
            Crear plantilla
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Campaigns Tab ────────────────────────────────────────
function CampaignsTab() {
  const { campaigns, filterStatus, setFilterStatus, getFiltered, deleteCampaign } = useEmailStore()
  const [modalOpen, setModalOpen] = useState(false)
  const filtered = getFiltered()

  return (
    <div>
      <CampaignStatsRow campaigns={campaigns} />

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTER_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setFilterStatus(chip.value)}
              className={cn(
                'filter-chip',
                filterStatus === chip.value && 'active'
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          + Nueva Campaña
        </Button>
      </div>

      {/* Campaign grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="📨"
          title="Sin campañas"
          description="No hay campañas que coincidan con el filtro."
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Crear primera campaña
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onDelete={deleteCampaign}
            />
          ))}
        </div>
      )}

      <NewCampaignModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

// ─── Templates Tab ────────────────────────────────────────
function TemplatesTab() {
  const { templates } = useEmailStore()
  const [modalOpen, setModalOpen] = useState(false)
  // Local delete state for demo purposes
  const [deleted, setDeleted] = useState<Set<string>>(new Set())
  const visible = templates.filter((t) => !deleted.has(t.id))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{visible.length} plantillas disponibles</p>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          + Nueva Plantilla
        </Button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon="📄"
          title="Sin plantillas"
          description="Crea tu primera plantilla para agilizar tus envíos."
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Crear plantilla
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onDelete={(id) => setDeleted((prev) => new Set([...prev, id]))}
            />
          ))}
        </div>
      )}

      <NewTemplateModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────
export default function EmailMarketing() {
  const [activeTab, setActiveTab] = useState('campaigns')

  const tabs = [
    { id: 'campaigns', label: 'Campañas' },
    { id: 'templates', label: 'Plantillas' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Marketing</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Gestiona campañas y plantillas de email
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      {activeTab === 'campaigns' ? <CampaignsTab /> : <TemplatesTab />}
    </div>
  )
}
