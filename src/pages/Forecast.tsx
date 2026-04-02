import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Target, Award } from 'lucide-react'
import { useDealStore, useUserStore, useCompanyStore } from '../store'
import { Avatar, Badge, Progress } from '../components/ui'
import { formatCurrency, formatDate, cn } from '../utils'

// ─── Constants ────────────────────────────────────────────
const QUARTERS = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024']

const REP_QUOTAS: Record<string, number> = {
  u2: 450000, u3: 320000, u4: 380000, u5: 280000,
}

const MONTHLY_FORECAST = [
  { month: 'Ene', ganado: 120000, comprometido: 85000, mejorCaso: 150000 },
  { month: 'Feb', ganado: 145000, comprometido: 110000, mejorCaso: 180000 },
  { month: 'Mar', ganado: 168000, comprometido: 140000, mejorCaso: 210000 },
  { month: 'Abr', ganado: 95000,  comprometido: 185000, mejorCaso: 290000 },
  { month: 'May', ganado: 0,      comprometido: 210000, mejorCaso: 340000 },
  { month: 'Jun', ganado: 0,      comprometido: 145000, mejorCaso: 280000 },
]

// ─── Helpers ──────────────────────────────────────────────
function attainmentColor(pct: number) {
  if (pct >= 80) return 'text-emerald-600'
  if (pct >= 50) return 'text-amber-600'
  return 'text-red-500'
}

function probColor(prob: number) {
  if (prob >= 75) return 'success'
  if (prob >= 40) return 'warning'
  return 'default'
}

// ─── Custom Tooltip ───────────────────────────────────────
function ForecastTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-100 p-3 text-xs min-w-[160px]">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: p.fill }} />
            <span className="text-gray-500 capitalize">{p.name}</span>
          </div>
          <span className="font-semibold text-gray-800">{formatCurrency(p.value, 'MXN')}</span>
        </div>
      ))}
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────
interface KpiCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  iconBg: string
  trend?: number
}

function KpiCard({ label, value, sub, icon, iconBg, trend }: KpiCardProps) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 mt-1 text-xs font-medium', trend >= 0 ? 'text-emerald-600' : 'text-red-500')}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}% vs trim. anterior
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────
export default function Forecast() {
  const { deals } = useDealStore()
  const { users } = useUserStore()
  const { companies } = useCompanyStore()
  const [quarter, setQuarter] = useState('Q2 2024')

  const userMap = Object.fromEntries(users.map(u => [u.id, u]))
  const companyMap = Object.fromEntries(companies.map(c => [c.id, c]))

  // ── KPIs ──────────────────────────────────────────────
  const kpis = useMemo(() => {
    const open = deals.filter(d => d.status === 'open')
    const won = deals.filter(d => d.status === 'won')
    const pipeline = open.reduce((s, d) => s + d.value, 0)
    const comprometido = open.filter(d => d.probability >= 70).reduce((s, d) => s + d.value, 0)
    const mejorCaso = open.filter(d => d.probability >= 40).reduce((s, d) => s + d.value, 0)
    const cerrado = won.reduce((s, d) => s + d.value, 0)
    return { pipeline, comprometido, mejorCaso, cerrado }
  }, [deals])

  // ── Rep forecast table ─────────────────────────────────
  const repRows = useMemo(() => {
    return Object.entries(REP_QUOTAS).map(([userId, quota]) => {
      const repDeals = deals.filter(d => d.ownerId === userId)
      const comprometido = repDeals.filter(d => d.status === 'open' && d.probability >= 70).reduce((s, d) => s + d.value, 0)
      const mejorCaso = repDeals.filter(d => d.status === 'open' && d.probability >= 40).reduce((s, d) => s + d.value, 0)
      const ganado = repDeals.filter(d => d.status === 'won').reduce((s, d) => s + d.value, 0)
      const attainment = Math.round((ganado / quota) * 100)
      return { userId, quota, comprometido, mejorCaso, ganado, attainment }
    }).filter(r => userMap[r.userId])
  }, [deals, userMap])

  // ── Open deals for pipeline table ─────────────────────
  const openDeals = useMemo(() => {
    return deals
      .filter(d => d.status === 'open')
      .map(d => ({ ...d, weightedValue: Math.round(d.value * d.probability / 100) }))
      .sort((a, b) => new Date(a.closeDate ?? '9999').getTime() - new Date(b.closeDate ?? '9999').getTime())
  }, [deals])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pronóstico de Ventas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Visibilidad del pipeline y proyección de ingresos</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {QUARTERS.map(q => (
            <button key={q} onClick={() => setQuarter(q)}
              className={cn('text-xs px-3 py-1.5 rounded-md font-medium transition-colors',
                quarter === q ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Pipeline Total" value={formatCurrency(kpis.pipeline, 'MXN')}
          sub={`${deals.filter(d => d.status === 'open').length} deals activos`}
          icon={<Briefcase className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" trend={15} />
        <KpiCard label="Comprometido (≥70%)" value={formatCurrency(kpis.comprometido, 'MXN')}
          sub="Alta probabilidad de cierre"
          icon={<Target className="w-5 h-5 text-teal-600" />} iconBg="bg-teal-50" trend={8} />
        <KpiCard label="Mejor Caso (≥40%)" value={formatCurrency(kpis.mejorCaso, 'MXN')}
          sub="Si todo sale bien"
          icon={<TrendingUp className="w-5 h-5 text-indigo-600" />} iconBg="bg-indigo-50" trend={12} />
        <KpiCard label="Cerrado Ganado" value={formatCurrency(kpis.cerrado, 'MXN')}
          sub={`${deals.filter(d => d.status === 'won').length} deals ganados`}
          icon={<Award className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" trend={22} />
      </div>

      {/* Chart + Rep Table */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Monthly forecast chart */}
        <div className="lg:col-span-3 card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Pronóstico Mensual {quarter}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={MONTHLY_FORECAST} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ForecastTooltip />} />
              <Bar dataKey="ganado" name="Ganado" fill="#002DA4" radius={[3, 3, 0, 0]} />
              <Bar dataKey="comprometido" name="Comprometido" fill="#2AD4AE" radius={[3, 3, 0, 0]} />
              <Bar dataKey="mejorCaso" name="Mejor caso" fill="#E2E8F0" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center">
            {[{ label: 'Ganado', color: '#002DA4' }, { label: 'Comprometido', color: '#2AD4AE' }, { label: 'Mejor caso', color: '#E2E8F0' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Rep forecast table */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Por Representante</h3>
          <div className="space-y-4">
            {repRows.map(row => {
              const user = userMap[row.userId]
              if (!user) return null
              return (
                <div key={row.userId}>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-400">Meta: {formatCurrency(row.quota, 'MXN')}</p>
                    </div>
                    <span className={cn('text-sm font-bold', attainmentColor(row.attainment))}>
                      {row.attainment}%
                    </span>
                  </div>
                  <Progress value={row.attainment} max={100}
                    className={row.attainment >= 80 ? 'bg-emerald-100' : row.attainment >= 50 ? 'bg-amber-100' : 'bg-red-100'} />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Ganado: {formatCurrency(row.ganado, 'MXN')}</span>
                    <span>Comp: {formatCurrency(row.comprometido, 'MXN')}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Deals en Pronóstico table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Deals en Pronóstico ({openDeals.length})</h3>
          <span className="text-xs text-gray-400">
            Total ponderado: <span className="font-semibold text-primary">{formatCurrency(openDeals.reduce((s, d) => s + d.weightedValue, 0), 'MXN')}</span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="table-header pl-4">Deal</th>
                <th className="table-header">Empresa</th>
                <th className="table-header">Propietario</th>
                <th className="table-header text-right">Valor</th>
                <th className="table-header text-center">Prob.</th>
                <th className="table-header text-right">Ponderado</th>
                <th className="table-header text-right pr-4">Cierre</th>
              </tr>
            </thead>
            <tbody>
              {openDeals.map(deal => {
                const owner = userMap[deal.ownerId]
                const company = deal.companyId ? companyMap[deal.companyId] : null
                const rowBg = deal.probability >= 75 ? 'hover:bg-emerald-50/30' : deal.probability >= 40 ? 'hover:bg-amber-50/30' : ''
                return (
                  <tr key={deal.id} className={cn('border-b border-gray-50 transition-colors', rowBg)}>
                    <td className="table-cell pl-4">
                      <p className="font-medium text-gray-900 truncate max-w-[160px]">{deal.name}</p>
                    </td>
                    <td className="table-cell">
                      <span className="text-xs text-gray-500">{company?.name ?? '—'}</span>
                    </td>
                    <td className="table-cell">
                      {owner && (
                        <div className="flex items-center gap-1.5">
                          <Avatar name={`${owner.firstName} ${owner.lastName}`} size="xs" />
                          <span className="text-xs text-gray-600">{owner.firstName}</span>
                        </div>
                      )}
                    </td>
                    <td className="table-cell text-right font-semibold text-gray-800">
                      {formatCurrency(deal.value, 'MXN')}
                    </td>
                    <td className="table-cell text-center">
                      <Badge variant={probColor(deal.probability) as any}>{deal.probability}%</Badge>
                    </td>
                    <td className="table-cell text-right font-semibold text-primary">
                      {formatCurrency(deal.weightedValue, 'MXN')}
                    </td>
                    <td className="table-cell text-right pr-4 text-xs text-gray-500">
                      {deal.closeDate ? formatDate(deal.closeDate, 'dd MMM yy') : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50/80 border-t border-gray-200">
                <td colSpan={3} className="table-cell pl-4 font-semibold text-gray-700">Totales</td>
                <td className="table-cell text-right font-bold text-gray-900">
                  {formatCurrency(openDeals.reduce((s, d) => s + d.value, 0), 'MXN')}
                </td>
                <td />
                <td className="table-cell text-right font-bold text-primary">
                  {formatCurrency(openDeals.reduce((s, d) => s + d.weightedValue, 0), 'MXN')}
                </td>
                <td className="pr-4" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
