import React, { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  DollarSign, Briefcase, Users, TicketIcon, CheckSquare,
  TrendingUp, ArrowRight, Clock, AlertCircle, Star, Plus,
  Phone, Mail, Calendar, Zap,
} from 'lucide-react'
import {
  useContactStore, useDealStore, useTaskStore,
  useActivityStore, usePipelineStore, useUserStore, useTicketStore,
} from '../store'
import { MONTHLY_REVENUE, CONTACT_GROWTH } from '../data'
import { StatCard } from '../components/shared/StatCard'
import { ActivityTimeline } from '../components/shared/ActivityTimeline'
import { Button, Badge, Card, Avatar, Progress, EmptyState } from '../components/ui'
import {
  formatCurrency, formatDate, formatRelativeTime,
  getStatusColor, getLifecycleLabel, cn,
} from '../utils'

// ─── Brand palette ────────────────────────────────────────
const PRIMARY = '#002DA4'
const TEAL = '#2AD4AE'
const NAVY = '#001E5D'
const STAGE_COLORS = ['#6B7280', '#3B82F6', '#8B5CF6', '#F59E0B', TEAL]

// ─── Custom chart tooltip ─────────────────────────────────
function ChartTooltip({ active, payload, label, currency = false }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {currency ? formatCurrency(p.value, 'MXN') : p.value.toLocaleString('es-MX')}
        </p>
      ))}
    </div>
  )
}

// ─── Section header helper ────────────────────────────────
function SectionHeader({
  title, action, actionLabel,
}: { title: string; action?: () => void; actionLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-semibold text-gray-900">{title}</h2>
      {action && actionLabel && (
        <button
          onClick={action}
          className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
        >
          {actionLabel} <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

// ─── Greeting helper ──────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

// ─── Dashboard ────────────────────────────────────────────
export default function Dashboard() {
  const { contacts } = useContactStore()
  const { deals } = useDealStore()
  const { tasks, completeTask } = useTaskStore()
  const { activities } = useActivityStore()
  const { pipelines } = usePipelineStore()
  const { currentUser } = useUserStore()
  const { tickets } = useTicketStore()

  // ── Computed stats ─────────────────────────────────────
  const openDeals = useMemo(() => deals.filter(d => d.status === 'open'), [deals])
  const wonDeals  = useMemo(() => deals.filter(d => d.status === 'won'),  [deals])

  // Revenue MTD: sum of won deals closed this month
  const revenueMTD = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return wonDeals
      .filter(d => d.closeDate && new Date(d.closeDate) >= startOfMonth)
      .reduce((sum, d) => sum + d.value, 0)
  }, [wonDeals])

  // Fallback: if no MTD revenue use all-time won
  const totalRevenue = revenueMTD > 0 ? revenueMTD : wonDeals.reduce((s, d) => s + d.value, 0)

  const openDealsValue = useMemo(
    () => openDeals.reduce((s, d) => s + d.value, 0),
    [openDeals]
  )

  const newContactsMTD = useMemo(() => {
    const start = new Date()
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    return contacts.filter(c => new Date(c.createdAt) >= start).length
  }, [contacts])

  const openTickets = useMemo(
    () => tickets.filter(t => t.status === 'open' || t.status === 'pending').length,
    [tickets]
  )

  // Revenue MoM change
  const revenueMoM = useMemo(() => {
    const last = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1]?.revenue ?? 0
    const prev = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 2]?.revenue ?? 1
    return Math.round(((last - prev) / prev) * 100)
  }, [])

  // Deals by stage for default pipeline
  const defaultPipeline = useMemo(
    () => pipelines.find(p => p.isDefault && p.type === 'deals'),
    [pipelines]
  )

  const dealsByStage = useMemo(() => {
    if (!defaultPipeline) return []
    return defaultPipeline.stages.map(stage => ({
      name: stage.name,
      count: openDeals.filter(d => d.stageId === stage.id).length,
      value: openDeals
        .filter(d => d.stageId === stage.id)
        .reduce((sum, d) => sum + d.value, 0),
      color: stage.color,
    }))
  }, [defaultPipeline, openDeals])

  const pipelineTotal = useMemo(
    () => openDeals.reduce((s, d) => s + d.value, 0),
    [openDeals]
  )

  const todayStr = new Date().toISOString().slice(0, 10)
  const tasksDueToday = useMemo(
    () => tasks.filter(t => t.dueDate.startsWith(todayStr) && t.status !== 'completed'),
    [tasks, todayStr]
  )

  const topDeals = useMemo(
    () => [...openDeals].sort((a, b) => b.value - a.value).slice(0, 5),
    [openDeals]
  )

  const recentActivities = useMemo(
    () => [...activities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8),
    [activities]
  )

  const stageBarData = useMemo(
    () => dealsByStage.map(s => ({ name: s.name, Negocios: s.count, Valor: Math.round(s.value / 1000) })),
    [dealsByStage]
  )

  // ── Quick Actions ──────────────────────────────────────
  const quickActions = [
    {
      label: '+ Nuevo Contacto',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-primary text-white hover:bg-primary/90',
      onClick: () => window.dispatchEvent(new CustomEvent('crm:open-new-contact')),
    },
    {
      label: '+ Nuevo Deal',
      icon: <Briefcase className="w-4 h-4" />,
      color: 'bg-teal text-white hover:bg-teal/90',
      onClick: () => window.dispatchEvent(new CustomEvent('crm:open-new-deal')),
    },
    {
      label: '+ Nueva Tarea',
      icon: <CheckSquare className="w-4 h-4" />,
      color: 'bg-purple-600 text-white hover:bg-purple-700',
      onClick: () => window.dispatchEvent(new CustomEvent('crm:open-new-task')),
    },
  ]

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">

      {/* ── Header with greeting ────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👋</span>
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {currentUser.firstName}
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-0.5 ml-9">
            {new Date().toLocaleDateString('es-MX', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {quickActions.map(qa => (
            <button
              key={qa.label}
              onClick={qa.onClick}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm',
                qa.color
              )}
            >
              {qa.icon}
              {qa.label}
            </button>
          ))}
          <Button variant="secondary" icon={<TrendingUp className="w-4 h-4" />} onClick={() => {}}>
            Ver reportes
          </Button>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Ingresos MTD (MXN)"
          value={formatCurrency(totalRevenue, 'MXN')}
          change={revenueMoM}
          changeLabel="vs mes anterior"
          icon={<DollarSign className="w-5 h-5" />}
          color="primary"
        />
        <StatCard
          title="Negocios Abiertos"
          value={`${openDeals.length} deals`}
          change={8}
          changeLabel="este mes"
          icon={<Briefcase className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Nuevos Contactos"
          value={newContactsMTD}
          change={12}
          changeLabel="este mes"
          icon={<Users className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Tickets Abiertos"
          value={openTickets}
          change={openTickets > 5 ? 15 : -5}
          changeLabel="vs semana pasada"
          icon={<TicketIcon className="w-5 h-5" />}
          color="orange"
        />
      </div>

      {/* ── Charts row 1 ───────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Revenue area chart */}
        <div className="xl:col-span-2 card p-5">
          <SectionHeader title="Ingresos Mensuales (MXN)" />
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={MONTHLY_REVENUE} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={PRIMARY} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={TEAL} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
              />
              <RechartsTooltip content={<ChartTooltip currency />} />
              <Area
                type="monotone" dataKey="target" name="Meta"
                stroke={TEAL} strokeWidth={1.5} strokeDasharray="4 4"
                fill="url(#targetGrad)" dot={false}
              />
              <Area
                type="monotone" dataKey="revenue" name="Ingresos"
                stroke={PRIMARY} strokeWidth={2}
                fill="url(#revenueGrad)" dot={false}
                activeDot={{ r: 4, fill: PRIMARY }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 justify-end">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-5 h-0.5 bg-primary rounded inline-block" />
              Ingresos reales
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-5 h-0.5 border-t-2 border-dashed border-teal-500 inline-block" />
              Meta
            </div>
          </div>
        </div>

        {/* Deals by stage bar chart */}
        <div className="card p-5">
          <SectionHeader title="Negocios por Etapa" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={stageBarData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              barSize={14}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <RechartsTooltip content={<ChartTooltip />} />
              <Bar dataKey="Negocios" radius={[4, 4, 0, 0]}>
                {stageBarData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {dealsByStage.map((stage, i) => (
              <div key={stage.name} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: STAGE_COLORS[i % STAGE_COLORS.length] }}
                />
                <span className="text-gray-600 flex-1 truncate">{stage.name}</span>
                <span className="font-medium text-gray-800">{stage.count}</span>
                <span className="text-gray-400">{formatCurrency(stage.value, 'MXN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2 ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Contact growth line chart */}
        <div className="card p-5">
          <SectionHeader title="Crecimiento de Contactos" />
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={CONTACT_GROWTH} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <RechartsTooltip content={<ChartTooltip />} />
              <Line
                type="monotone" dataKey="nuevos" name="Nuevos"
                stroke={TEAL} strokeWidth={2}
                dot={{ r: 3, fill: TEAL, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: TEAL }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-gray-900">{contacts.length}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-500">Este mes</p>
              <p className="text-lg font-bold text-primary">{newContactsMTD}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-500">Últ. semana</p>
              <p className="text-lg font-bold text-teal-600">
                {CONTACT_GROWTH[CONTACT_GROWTH.length - 1]?.nuevos ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Top 5 deals by value */}
        <div className="card p-5">
          <SectionHeader title="Top Negocios" actionLabel="Ver todos" />
          <div className="space-y-3">
            {topDeals.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Sin negocios abiertos</p>
            ) : (
              topDeals.map((deal, i) => {
                const stage = defaultPipeline?.stages.find(s => s.id === deal.stageId)
                return (
                  <div key={deal.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{deal.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {stage && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full font-medium text-white"
                            style={{ backgroundColor: stage.color }}
                          >
                            {stage.name}
                          </span>
                        )}
                        <Progress
                          value={deal.probability}
                          size="sm"
                          color="primary"
                          className="w-16"
                        />
                        <span className="text-xs text-gray-400">{deal.probability}%</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(deal.value, 'MXN')}</p>
                      {deal.closeDate && (
                        <p className="text-xs text-gray-400">{formatDate(deal.closeDate)}</p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Today's tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Tareas de Hoy</h2>
            <Badge className={tasksDueToday.length > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}>
              {tasksDueToday.length} pendientes
            </Badge>
          </div>
          <div className="space-y-2.5">
            {tasksDueToday.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckSquare className="w-8 h-8 text-teal-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">Al día con tus tareas</p>
                <p className="text-xs text-gray-400 mt-0.5">No tienes tareas pendientes para hoy</p>
              </div>
            ) : (
              tasksDueToday.slice(0, 5).map(task => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <button
                    onClick={() => completeTask(task.id)}
                    className="w-4 h-4 rounded border-2 border-gray-300 hover:border-primary mt-0.5 flex-shrink-0 transition-colors"
                    title="Marcar como completada"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 leading-snug">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded-full font-medium',
                        task.priority === 'high'   ? 'bg-red-50 text-red-600' :
                        task.priority === 'normal' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-100 text-gray-500'
                      )}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'normal' ? 'Normal' : 'Baja'}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">{task.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  {task.dueTime && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {task.dueTime}
                    </div>
                  )}
                </div>
              ))
            )}
            {tasksDueToday.length > 5 && (
              <p className="text-xs text-gray-400 text-center pt-1">
                +{tasksDueToday.length - 5} tareas más
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3: Pipeline overview + Recent activity ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Pipeline health */}
        <div className="xl:col-span-1 card p-5">
          <SectionHeader title="Pipeline Principal" />
          <div className="space-y-4">
            {dealsByStage.map((stage, i) => {
              const pct = pipelineTotal > 0 ? Math.round((stage.value / pipelineTotal) * 100) : 0
              return (
                <div key={stage.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: STAGE_COLORS[i % STAGE_COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-900">{formatCurrency(stage.value, 'MXN')}</span>
                      <span className="text-xs text-gray-400 ml-1">({stage.count})</span>
                    </div>
                  </div>
                  <Progress value={pct} size="sm" color={i === 4 ? 'teal' : 'primary'} />
                  <p className="text-xs text-gray-400 mt-0.5 text-right">{pct}% del pipeline</p>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Valor total pipeline</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(pipelineTotal, 'MXN')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Negocios activos</p>
              <p className="text-lg font-bold text-primary">{openDeals.length}</p>
            </div>
          </div>
        </div>

        {/* Recent activity feed */}
        <div className="xl:col-span-2 card p-5">
          <ActivityTimeline />
        </div>
      </div>

    </div>
  )
}
