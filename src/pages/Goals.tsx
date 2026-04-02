import { useMemo, useState } from 'react'
import { Target, TrendingUp, TrendingDown, Award, Users, DollarSign, Phone, Calendar, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useUserStore, useDealStore, useActivityStore } from '../store'
import { Avatar, Button, Progress } from '../components/ui'
import { formatCurrency, cn } from '../utils'

// ─── Types ────────────────────────────────────────────────
interface Goal {
  id: string
  userId: string
  type: 'revenue' | 'deals_won' | 'calls_made' | 'meetings_booked' | 'new_contacts'
  period: 'quarterly'
  target: number
  current: number
  name: string
  startDate: string
  endDate: string
}

// ─── Mock Goals Data ──────────────────────────────────────
const TEAM_GOALS: Goal[] = [
  { id: 'tg1', userId: 'team', type: 'revenue', period: 'quarterly', target: 1500000, current: 408000, name: 'Ingresos Q2', startDate: '2024-04-01', endDate: '2024-06-30' },
  { id: 'tg2', userId: 'team', type: 'deals_won', period: 'quarterly', target: 20, current: 7, name: 'Deals Ganados Q2', startDate: '2024-04-01', endDate: '2024-06-30' },
  { id: 'tg3', userId: 'team', type: 'new_contacts', period: 'quarterly', target: 150, current: 43, name: 'Nuevos Contactos Q2', startDate: '2024-04-01', endDate: '2024-06-30' },
]

const REP_GOALS: Goal[] = [
  // Carlos u2
  { id: 'rg1', userId: 'u2', type: 'revenue', period: 'quarterly', target: 450000, current: 168000, name: 'Ingresos', startDate: '2024-04-01', endDate: '2024-06-30' },
  { id: 'rg2', userId: 'u2', type: 'calls_made', period: 'quarterly', target: 120, current: 78, name: 'Llamadas', startDate: '2024-04-01', endDate: '2024-06-30' },
  { id: 'rg3', userId: 'u2', type: 'meetings_booked', period: 'quarterly', target: 30, current: 18, name: 'Reuniones', startDate: '2024-04-01', endDate: '2024-06-30' },
  // María u3
  { id: 'rg4', userId: 'u3', type: 'revenue', period: 'quarterly', target: 320000, current: 112000, name: 'Ingresos', startDate: '2024-04-01', endDate: '2024-06-30' },
  { id: 'rg5', userId: 'u3', type: 'calls_made', period: 'quarterly', target: 100, current: 65, name: 'Llamadas', startDate: '2024-04-01', endDate: '2024-06-30' },
  { id: 'rg6', userId: 'u3', type: 'meetings_booked', period: 'quarterly', target: 25, current: 12, name: 'Reuniones', startDate: '2024-04-01', endDate: '2024-06-30' },
  // Jorge u4
  { id: 'rg7', userId: 'u4', type: 'revenue', period: 'quarterly', target: 380000, current: 128000, name: 'Ingresos', startDate: '2024-04-01', endDate: '2024-06-30' },
  { id: 'rg8', userId: 'u4', type: 'calls_made', period: 'quarterly', target: 110, current: 82, name: 'Llamadas', startDate: '2024-04-01', endDate: '2024-06-30' },
  { id: 'rg9', userId: 'u4', type: 'meetings_booked', period: 'quarterly', target: 28, current: 16, name: 'Reuniones', startDate: '2024-04-01', endDate: '2024-06-30' },
  // Laura u5
  { id: 'rg10', userId: 'u5', type: 'revenue', period: 'quarterly', target: 280000, current: 0, name: 'Ingresos', startDate: '2024-04-01', endDate: '2024-06-30' },
  { id: 'rg11', userId: 'u5', type: 'calls_made', period: 'quarterly', target: 90, current: 45, name: 'Llamadas', startDate: '2024-04-01', endDate: '2024-06-30' },
  { id: 'rg12', userId: 'u5', type: 'meetings_booked', period: 'quarterly', target: 20, current: 8, name: 'Reuniones', startDate: '2024-04-01', endDate: '2024-06-30' },
]

const HISTORY = [
  { period: 'Q1 2024', target: 1200000, achieved: 1340000, pct: 112, met: true },
  { period: 'Q4 2023', target: 1100000, achieved: 985000, pct: 90, met: false },
  { period: 'Q3 2023', target: 1000000, achieved: 1120000, pct: 112, met: true },
]

// ─── Circular Progress ────────────────────────────────────
function CircularProgress({ pct, color, size = 100 }: { pct: number; color: string; size?: number }) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(pct, 100) / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={10} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
    </svg>
  )
}

// ─── Progress bar color ───────────────────────────────────
function barColor(pct: number) {
  if (pct >= 80) return 'text-emerald-600'
  if (pct >= 50) return 'text-amber-600'
  return 'text-red-500'
}

// ─── Days remaining ───────────────────────────────────────
function daysRemaining(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
}

// ─── Team Goal Card ───────────────────────────────────────
function TeamGoalCard({ goal, color, icon }: { goal: Goal; color: string; icon: React.ReactNode }) {
  const pct = Math.round((goal.current / goal.target) * 100)
  const isRevenue = goal.type === 'revenue'
  const currentLabel = isRevenue ? formatCurrency(goal.current, 'MXN') : goal.current.toLocaleString('es-MX')
  const targetLabel = isRevenue ? formatCurrency(goal.target, 'MXN') : goal.target.toLocaleString('es-MX')

  return (
    <div className="flex flex-col items-center gap-3 p-5">
      <div className="relative">
        <CircularProgress pct={pct} color={color} size={110} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{pct}%</span>
        </div>
      </div>
      <div className="text-center">
        <div className="flex items-center gap-1.5 justify-center mb-1">
          <span style={{ color }} className="opacity-80">{icon}</span>
          <p className="text-sm font-semibold text-gray-800">{goal.name}</p>
        </div>
        <p className="text-xs text-gray-500">{currentLabel} de {targetLabel}</p>
        <p className="text-xs text-gray-400 mt-0.5">{daysRemaining(goal.endDate)} días restantes</p>
      </div>
    </div>
  )
}

// ─── Rep Card ─────────────────────────────────────────────
function RepGoalCard({ userId, goals, rank }: { userId: string; goals: Goal[]; rank: number }) {
  const { users } = useUserStore()
  const user = users.find(u => u.id === userId)
  if (!user) return null

  const revenue = goals.find(g => g.type === 'revenue')
  const calls = goals.find(g => g.type === 'calls_made')
  const meetings = goals.find(g => g.type === 'meetings_booked')

  const avgPct = Math.round(
    [revenue, calls, meetings].filter(Boolean).reduce((s, g) => s + (g!.current / g!.target) * 100, 0) /
    [revenue, calls, meetings].filter(Boolean).length
  )

  const rankColors = ['bg-yellow-100 text-yellow-700', 'bg-gray-100 text-gray-600', 'bg-orange-100 text-orange-700', 'bg-gray-50 text-gray-400']

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0', rankColors[rank] ?? rankColors[3])}>
            {rank + 1}
          </div>
          <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
          <div>
            <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-400">{user.title}</p>
          </div>
        </div>
        <span className={cn('text-sm font-bold px-2 py-0.5 rounded-lg', avgPct >= 80 ? 'bg-emerald-50 text-emerald-700' : avgPct >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600')}>
          {avgPct}%
        </span>
      </div>

      <div className="space-y-3">
        {revenue && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1 text-gray-500"><DollarSign className="w-3 h-3" /> Ingresos</div>
              <span className={cn('font-semibold', barColor(Math.round((revenue.current / revenue.target) * 100)))}>
                {Math.round((revenue.current / revenue.target) * 100)}%
              </span>
            </div>
            <Progress value={revenue.current} max={revenue.target} />
            <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(revenue.current, 'MXN')} / {formatCurrency(revenue.target, 'MXN')}</p>
          </div>
        )}
        {calls && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1 text-gray-500"><Phone className="w-3 h-3" /> Llamadas</div>
              <span className={cn('font-semibold', barColor(Math.round((calls.current / calls.target) * 100)))}>
                {Math.round((calls.current / calls.target) * 100)}%
              </span>
            </div>
            <Progress value={calls.current} max={calls.target} />
            <p className="text-xs text-gray-400 mt-0.5">{calls.current} / {calls.target}</p>
          </div>
        )}
        {meetings && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1 text-gray-500"><Calendar className="w-3 h-3" /> Reuniones</div>
              <span className={cn('font-semibold', barColor(Math.round((meetings.current / meetings.target) * 100)))}>
                {Math.round((meetings.current / meetings.target) * 100)}%
              </span>
            </div>
            <Progress value={meetings.current} max={meetings.target} />
            <p className="text-xs text-gray-400 mt-0.5">{meetings.current} / {meetings.target}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────
export default function Goals() {
  const { users } = useUserStore()
  const { deals } = useDealStore()
  const [historyOpen, setHistoryOpen] = useState(false)
  const [quarter, setQuarter] = useState('Q2 2024')

  // Leaderboard from deals
  const leaderboard = useMemo(() => {
    const repIds = ['u2', 'u3', 'u4', 'u5']
    const quotas: Record<string, number> = { u2: 450000, u3: 320000, u4: 380000, u5: 280000 }
    const callsDone: Record<string, number> = { u2: 78, u3: 65, u4: 82, u5: 45 }

    return repIds.map(uid => {
      const repDeals = deals.filter(d => d.ownerId === uid)
      const won = repDeals.filter(d => d.status === 'won')
      const revenue = won.reduce((s, d) => s + d.value, 0)
      const quota = quotas[uid] ?? 1
      const pct = Math.round((revenue / quota) * 100)
      return { userId: uid, revenue, pct, deals: won.length, calls: callsDone[uid] ?? 0 }
    }).sort((a, b) => b.revenue - a.revenue)
  }, [deals])

  const repIds = ['u2', 'u3', 'u4', 'u5']

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Metas de Ventas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Q2 2024: Abr — Jun · {daysRemaining('2024-06-30')} días restantes</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'].map(q => (
              <button key={q} onClick={() => setQuarter(q)}
                className={cn('text-xs px-3 py-1.5 rounded-md font-medium transition-colors',
                  quarter === q ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                {q}
              </button>
            ))}
          </div>
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>Nueva Meta</Button>
        </div>
      </div>

      {/* Team Goals */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-gray-900">Meta del Equipo — {quarter}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <TeamGoalCard goal={TEAM_GOALS[0]} color="#002DA4" icon={<DollarSign className="w-4 h-4" />} />
          <TeamGoalCard goal={TEAM_GOALS[1]} color="#2AD4AE" icon={<Target className="w-4 h-4" />} />
          <TeamGoalCard goal={TEAM_GOALS[2]} color="#8B5CF6" icon={<Users className="w-4 h-4" />} />
        </div>
      </div>

      {/* Rep Cards + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Metas por Representante</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {repIds.map((uid, idx) => (
              <RepGoalCard key={uid} userId={uid} goals={REP_GOALS.filter(g => g.userId === uid)} rank={idx} />
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-700">Leaderboard</h3>
          </div>
          <div className="space-y-3">
            {leaderboard.map((rep, idx) => {
              const user = users.find(u => u.id === rep.userId)
              if (!user) return null
              const medals = ['🥇', '🥈', '🥉', '']
              const rowBg = idx === 0 ? 'bg-yellow-50 rounded-lg px-2 py-1.5 -mx-2' : 'py-1.5'
              return (
                <div key={rep.userId} className={cn('flex items-center gap-3', rowBg)}>
                  <span className="text-lg w-6 flex-shrink-0 text-center">{medals[idx] ?? `${idx + 1}`}</span>
                  <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-400">{rep.deals} deals · {rep.calls} calls</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-primary">{formatCurrency(rep.revenue, 'MXN')}</p>
                    <p className={cn('text-xs font-semibold', rep.pct >= 80 ? 'text-emerald-600' : rep.pct >= 50 ? 'text-amber-600' : 'text-red-500')}>
                      {rep.pct}% meta
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Historial */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setHistoryOpen(h => !h)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">Historial de Metas Trimestrales</span>
          </div>
          {historyOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {historyOpen && (
          <div className="border-t border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="table-header pl-5">Trimestre</th>
                  <th className="table-header text-right">Meta</th>
                  <th className="table-header text-right">Logrado</th>
                  <th className="table-header text-right">%</th>
                  <th className="table-header text-center pr-5">Estado</th>
                </tr>
              </thead>
              <tbody>
                {HISTORY.map(h => (
                  <tr key={h.period} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="table-cell pl-5 font-medium text-gray-800">{h.period}</td>
                    <td className="table-cell text-right text-gray-600">{formatCurrency(h.target, 'MXN')}</td>
                    <td className="table-cell text-right font-semibold text-gray-900">{formatCurrency(h.achieved, 'MXN')}</td>
                    <td className={cn('table-cell text-right font-bold', h.met ? 'text-emerald-600' : 'text-red-500')}>{h.pct}%</td>
                    <td className="table-cell text-center pr-5">
                      {h.met
                        ? <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">✅ Cumplido</span>
                        : <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">❌ No cumplido</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
