import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Building2, TrendingUp, Ticket, CheckSquare,
  Activity, Mail, GitBranch, BarChart3, Package, FileText, Inbox,
  Settings, ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight,
  Star
} from 'lucide-react'
import { cn } from '../../utils'
import { useUIStore } from '../../store'

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  badge?: number
  collapsed: boolean
}

function NavItem({ to, icon, label, badge, collapsed }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer text-sm font-medium group relative',
          isActive
            ? 'bg-primary text-white shadow-sm'
            : 'text-white/70 hover:text-white hover:bg-white/10',
          collapsed && 'justify-center px-2'
        )
      }
    >
      <span className="flex-shrink-0 w-5 h-5">{icon}</span>
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && badge !== undefined && badge > 0 && (
        <span className="px-1.5 py-0.5 bg-teal text-navy-900 text-xs font-bold rounded-full min-w-[18px] text-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          {label}
        </div>
      )}
    </NavLink>
  )
}

interface NavGroupProps {
  label: string
  children: React.ReactNode
  collapsed: boolean
}

function NavGroup({ label, children, collapsed }: NavGroupProps) {
  return (
    <div className="space-y-0.5">
      {!collapsed && (
        <p className="px-3 py-1 text-xs font-semibold text-white/30 uppercase tracking-wider">{label}</p>
      )}
      {collapsed && <div className="h-px bg-white/10 mx-2 my-1" />}
      {children}
    </div>
  )
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <div
      className={cn(
        'fixed left-0 top-0 h-full bg-navy flex flex-col transition-all duration-300 z-30 shadow-xl',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-white/10 flex-shrink-0', sidebarCollapsed && 'justify-center px-2')}>
        {!sidebarCollapsed ? (
          <img src="/segucargo-logo.svg" alt="Segucargo" className="h-8 w-auto object-contain" />
        ) : (
          <img src="/segucargo-symbol.svg" alt="Segucargo" className="h-8 w-8 object-contain" />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        <NavGroup label="Principal" collapsed={sidebarCollapsed}>
          <NavItem to="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" collapsed={sidebarCollapsed} />
        </NavGroup>

        <NavGroup label="CRM" collapsed={sidebarCollapsed}>
          <NavItem to="/contacts" icon={<Users className="w-5 h-5" />} label="Contactos" collapsed={sidebarCollapsed} />
          <NavItem to="/companies" icon={<Building2 className="w-5 h-5" />} label="Empresas" collapsed={sidebarCollapsed} />
          <NavItem to="/deals" icon={<TrendingUp className="w-5 h-5" />} label="Deals" collapsed={sidebarCollapsed} />
          <NavItem to="/tickets" icon={<Ticket className="w-5 h-5" />} label="Tickets" badge={3} collapsed={sidebarCollapsed} />
          <NavItem to="/activities" icon={<Activity className="w-5 h-5" />} label="Actividades" collapsed={sidebarCollapsed} />
          <NavItem to="/tasks" icon={<CheckSquare className="w-5 h-5" />} label="Tareas" badge={5} collapsed={sidebarCollapsed} />
        </NavGroup>

        <NavGroup label="Marketing" collapsed={sidebarCollapsed}>
          <NavItem to="/email-marketing" icon={<Mail className="w-5 h-5" />} label="Email Marketing" collapsed={sidebarCollapsed} />
          <NavItem to="/sequences" icon={<GitBranch className="w-5 h-5" />} label="Secuencias" collapsed={sidebarCollapsed} />
        </NavGroup>

        <NavGroup label="Ventas" collapsed={sidebarCollapsed}>
          <NavItem to="/products" icon={<Package className="w-5 h-5" />} label="Productos" collapsed={sidebarCollapsed} />
          <NavItem to="/quotes" icon={<FileText className="w-5 h-5" />} label="Cotizaciones" collapsed={sidebarCollapsed} />
        </NavGroup>

        <NavGroup label="Comunicación" collapsed={sidebarCollapsed}>
          <NavItem to="/inbox" icon={<Inbox className="w-5 h-5" />} label="Bandeja" badge={6} collapsed={sidebarCollapsed} />
        </NavGroup>

        <NavGroup label="Análisis" collapsed={sidebarCollapsed}>
          <NavItem to="/reports" icon={<BarChart3 className="w-5 h-5" />} label="Reportes" collapsed={sidebarCollapsed} />
        </NavGroup>
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-1 border-t border-white/10 pt-3">
        <NavItem to="/settings" icon={<Settings className="w-5 h-5" />} label="Configuración" collapsed={sidebarCollapsed} />
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all duration-150 text-sm"
        >
          {sidebarCollapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
          {!sidebarCollapsed && <span>Colapsar</span>}
        </button>
      </div>
    </div>
  )
}
