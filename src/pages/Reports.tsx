import { useMemo, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useDealStore, useActivityStore, useContactStore, useUserStore } from '../store'
import { Avatar } from '../components/ui'
import { formatCurrency, formatPercent, cn } from '../utils'
import { MONTHLY_REVENUE } from '../data'

// ─── Constants ────────────────────────────────────────────
const DATE_RANGES = [
  { label: 'Últimos 7 días',  value: '7d' },
  { label: 'Últimos 30 días', value: '30d' },
  { label: 'Últimos 90 días', value: '90d' },
  { label: 'Este año',        value: 'year' },
]

const PIE_COLORS = [
  '#002DA4', '#2AD4AE', '#6366F1', '#F59E0B',
  '#10B981', '#EF4444', '#8B5CF6', '#EC4899',
]

const LEAD_SOURCE_LABELS: Record<string, string> = {
  organic_search: 'Orgánico',
  paid_ads:       'Anuncios',
  referral:       'Referido',
  social_media:   'Redes sociales',
  email:          'Email',
  event:          'Evento',
  direct:         'Directo',
  other:          'Otro',
}

// ─── Custom Tooltip ───────────────────────────────────────
interface RevenueTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function RevenueTooltip({ active, payload, label }: RevenueTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-100 p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-500 capitalize">{p.name}:</span>
          <span className="font-semibold text-gray-900">{formatCurrency(p.value, 'MXN')}</span>
        </div>
      ))}
    </div>
  )
}

interface GenericTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function GenericTooltip({ active, payload, label }: GenericTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-100 p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-500 capitalize">{p.name}:</span>
          <span className="font-semibold text-gray-900">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: string
  trend?: { value: number; positive: boolean }
  color?: string
}

function StatCard({ label, value, sub, icon, color = 'text-primary' }: StatCardProps) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={cn('text-3xl flex-shrink-0', color)}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className={cn('text-2xl font-bold leading-none', color)}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────
function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('card p-5', className)}>
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────
export default function Reports() {
  const { deals } = useDealStore()
  const { activities } = useActivityStore()
  const { contacts } = useContactStore()
  const { users } = useUserStore()
  const [dateRange, setDateRange] = useState('30d')

  // ── KPIs ──────────────────────────────────────────────
  const kpis = useMemo(() => {
    const wonDeals = deals.filter((d) => d.status === 'won')
    const lostDeals = deals.filter((d) => d.status === 'lost')
    const closedDeals = [...wonDeals, ...lostDeals]

    const totalRevenue = wonDeals.reduce((sum, d) => sum + d.value, 0)
    const winRate = closedDeals.length
      ? Math.round((wonDeals.length / closedDeals.length) * 100)
      : 0
    const avgDealSize = wonDeals.length
      ? Math.round(totalRevenue / wonDeals.length)
      : 0

    // Avg sales cycle: days from createdAt to updatedAt for won deals
    const avgCycleDays = wonDeals.length
      ? Math.round(
          wonDeals.reduce((sum, d) => {
            const days = (new Date(d.updatedAt).getTime() - new Date(d.createdAt).getTime()) / 86400000
            return sum + days
          }, 0) / wonDeals.length
        )
      : 0

    return { totalRevenue, winRate, avgDealSize, avgCycleDays }
  }, [deals])

  // ── Deals by Stage chart ───────────────────────────────
  const dealsByStage = useMemo(() => {
    const stageMap: Record<string, { name: string; count: number; value: number }> = {}
    for (const deal of deals.filter((d) => d.status === 'open')) {
      if (!stageMap[deal.stageId]) {
        stageMap[deal.stageId] = { name: deal.stageId, count: 0, value: 0 }
      }
      stageMap[deal.stageId].count += 1
      stageMap[deal.stageId].value += deal.value
    }

    // Map known stage names
    const STAGE_NAMES: Record<string, string> = {
      ps1: 'Prospecto',
      ps2: 'Calificado',
      ps3: 'Propuesta',
      ps4: 'Negociación',
      ps5: 'Cierre',
      ps6: 'Discovery',
      ps7: 'Demo',
      ps8: 'Ev. Técnica',
      ps9: 'Prop. Ejecutiva',
      ps10: 'Contrato',
    }

    return Object.values(stageMap).map((s) => ({
      ...s,
      name: STAGE_NAMES[s.name] ?? s.name,
      value: Math.round(s.value / 1000), // show in K
    }))
  }, [deals])

  // ── Contact acquisition by source ─────────────────────
  const sourceData = useMemo(() => {
    const sourceMap: Record<string, number> = {}
    for (const c of contacts) {
      sourceMap[c.source] = (sourceMap[c.source] ?? 0) + 1
    }
    return Object.entries(sourceMap).map(([source, value]) => ({
      name: LEAD_SOURCE_LABELS[source] ?? source,
      value,
    }))
  }, [contacts])

  // ── Activity by type ───────────────────────────────────
  const activityByType = useMemo(() => {
    const map = {
      Llamadas: 0,
      Emails: 0,
      Reuniones: 0,
      Notas: 0,
    }
    for (const a of activities) {
      if (a.type === 'call')                              map.Llamadas++
      if (a.type === 'email_sent' || a.type === 'email_received') map.Emails++
      if (a.type === 'meeting')                           map.Reuniones++
      if (a.type === 'note')                              map.Notas++
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [activities])

  // ── Pipeline Health table ──────────────────────────────
  const pipelineHealth = useMemo(() => {
    const STAGES: Record<string, { pipeline: string; stage: string; prob: number }> = {
      ps1:  { pipeline: 'Pipeline Principal', stage: 'Prospecto',         prob: 10 },
      ps2:  { pipeline: 'Pipeline Principal', stage: 'Calificado',        prob: 25 },
      ps3:  { pipeline: 'Pipeline Principal', stage: 'Propuesta',         prob: 50 },
      ps4:  { pipeline: 'Pipeline Principal', stage: 'Negociación',       prob: 75 },
      ps5:  { pipeline: 'Pipeline Principal', stage: 'Cierre',            prob: 90 },
      ps6:  { pipeline: 'Enterprise Sales',   stage: 'Discovery',         prob: 10 },
      ps7:  { pipeline: 'Enterprise Sales',   stage: 'Demo',              prob: 30 },
      ps8:  { pipeline: 'Enterprise Sales',   stage: 'Ev. Técnica',       prob: 50 },
      ps9:  { pipeline: 'Enterprise Sales',   stage: 'Prop. Ejecutiva',   prob: 70 },
      ps10: { pipeline: 'Enterprise Sales',   stage: 'Contrato',          prob: 90 },
    }

    const rowMap: Record<string, { pipeline: string; stage: string; dealCount: number; totalValue: number; prob: number }> = {}

    for (const deal of deals.filter((d) => d.status === 'open')) {
      const meta = STAGES[deal.stageId]
      if (!meta) continue
      if (!rowMap[deal.stageId]) {
        rowMap[deal.stageId] = { ...meta, dealCount: 0, totalValue: 0 }
      }
      rowMap[deal.stageId].dealCount++
      rowMap[deal.stageId].totalValue += deal.value
    }

    return Object.values(rowMap).sort((a, b) => b.totalValue - a.totalValue)
  }, [deals])

  // ── Top reps ───────────────────────────────────────────
  const topReps = useMemo(() => {
    const repMap: Record<string, { userId: string; dealsWon: number; revenue: number; total: number }> = {}

    for (const deal of deals) {
      if (!repMap[deal.ownerId]) {
        repMap[deal.ownerId] = { userId: deal.ownerId, dealsWon: 0, revenue: 0, total: 0 }
      }
      repMap[deal.ownerId].total++
      if (deal.status === 'won') {
        repMap[deal.ownerId].dealsWon++
        repMap[deal.ownerId].revenue += deal.value
      }
    }

    const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

    return Object.values(repMap)
      .map((r) => ({
        ...r,
        user: userMap[r.userId],
        winRate: r.total ? Math.round((r.dealsWon / r.total) * 100) : 0,
      }))
      .filter((r) => r.user)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
  }, [deals, users])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Visión general de rendimiento del equipo
          </p>
        </div>
        {/* Date range selector */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {DATE_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setDateRange(r.value)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-md font-medium transition-colors',
                dateRange === r.value
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Ingresos totales (ganados)"
          value={formatCurrency(kpis.totalRevenue, 'MXN')}
          sub={`${deals.filter((d) => d.status === 'won').length} deals ganados`}
          icon="💰"
          color="text-primary"
        />
        <StatCard
          label="Tasa de cierre"
          value={`${kpis.winRate}%`}
          sub={`de deals calificados`}
          icon="🎯"
          color="text-teal-600"
        />
        <StatCard
          label="Tamaño promedio de deal"
          value={formatCurrency(kpis.avgDealSize, 'MXN')}
          icon="📊"
          color="text-indigo-600"
        />
        <StatCard
          label="Ciclo de venta promedio"
          value={`${kpis.avgCycleDays} días`}
          sub="desde apertura al cierre"
          icon="⏱️"
          color="text-amber-600"
        />
      </div>

      {/* Charts 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Revenue Trend */}
        <ChartCard title="Tendencia de Ingresos — Real vs Objetivo">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#002DA4" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#002DA4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2AD4AE" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#2AD4AE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="real"
                stroke="#002DA4"
                strokeWidth={2}
                fill="url(#gradRevenue)"
                dot={{ r: 3, fill: '#002DA4' }}
                activeDot={{ r: 5 }}
              />
              <Area
                type="monotone"
                dataKey="target"
                name="objetivo"
                stroke="#2AD4AE"
                strokeWidth={2}
                strokeDasharray="5 3"
                fill="url(#gradTarget)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Deals by Stage */}
        <ChartCard title="Deals por Etapa (Pipeline abierto)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={dealsByStage}
              layout="vertical"
              margin={{ top: 5, right: 30, bottom: 5, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickLine={false}
                axisLine={false}
                width={90}
              />
              <Tooltip
                formatter={(val: number) => [`${val}k MXN`, 'Valor']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="value" name="Valor (K MXN)" fill="#002DA4" radius={[0, 4, 4, 0]}>
                {dealsByStage.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 2 === 0 ? '#002DA4' : '#2AD4AE'}
                    opacity={0.85 - index * 0.05}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. Contact Acquisition by Source */}
        <ChartCard title="Adquisición de Contactos por Fuente">
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sourceData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [val, 'Contactos']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex-1 space-y-1.5">
              {sourceData.map((entry, index) => {
                const total = sourceData.reduce((s, e) => s + e.value, 0)
                const pct = total ? Math.round((entry.value / total) * 100) : 0
                return (
                  <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="text-gray-600 truncate flex-1">{entry.name}</span>
                    <span className="font-semibold text-gray-800">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </ChartCard>

        {/* 4. Activity by Type */}
        <ChartCard title="Actividad por Tipo">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activityByType} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <Tooltip content={<GenericTooltip />} />
              <Bar dataKey="value" name="Actividades" radius={[4, 4, 0, 0]}>
                {activityByType.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pipeline Health Table */}
        <div className="lg:col-span-3 card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Salud del Pipeline</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left pb-2 font-medium">Pipeline</th>
                  <th className="text-left pb-2 font-medium">Etapa</th>
                  <th className="text-right pb-2 font-medium">Deals</th>
                  <th className="text-right pb-2 font-medium">Valor Total</th>
                  <th className="text-right pb-2 font-medium">Prob.</th>
                </tr>
              </thead>
              <tbody>
                {pipelineHealth.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2.5 pr-3">
                      <span className="text-xs text-gray-500 truncate max-w-[120px] block">
                        {row.pipeline}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className="font-medium text-gray-800">{row.stage}</span>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-primary">
                      {row.dealCount}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-gray-800">
                      {formatCurrency(row.totalValue, 'MXN')}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={cn(
                          'text-xs font-semibold px-1.5 py-0.5 rounded',
                          row.prob >= 75 ? 'bg-emerald-50 text-emerald-700' :
                          row.prob >= 50 ? 'bg-blue-50 text-blue-700' :
                          row.prob >= 25 ? 'bg-yellow-50 text-yellow-700' :
                                          'bg-gray-100 text-gray-500'
                        )}
                      >
                        {row.prob}%
                      </span>
                    </td>
                  </tr>
                ))}
                {pipelineHealth.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                      No hay deals abiertos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Reps */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Vendedores</h3>
          <div className="space-y-3">
            {topReps.map((rep, idx) => (
              <div key={rep.userId} className="flex items-center gap-3">
                {/* Rank */}
                <span
                  className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                    idx === 1 ? 'bg-gray-100 text-gray-600' :
                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-50 text-gray-400'
                  )}
                >
                  {idx + 1}
                </span>

                {/* Avatar */}
                <Avatar
                  name={`${rep.user.firstName} ${rep.user.lastName}`}
                  src={rep.user.avatarUrl}
                  size="sm"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {rep.user.firstName} {rep.user.lastName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {rep.dealsWon} ganados · {rep.winRate}% cierre
                  </p>
                </div>

                {/* Revenue */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-primary">
                    {formatCurrency(rep.revenue, 'MXN')}
                  </p>
                  <p className="text-xs text-gray-400">{rep.total} deals</p>
                </div>
              </div>
            ))}

            {topReps.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                Sin datos de vendedores
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
