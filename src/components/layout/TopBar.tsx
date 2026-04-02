import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Search, Bell, Plus, ChevronDown, User, LogOut, HelpCircle, Settings
} from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Dropdown } from '../ui/Dropdown'
import { useUserStore, useUIStore } from '../../store'
import { cn } from '../../utils'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/contacts': 'Contactos',
  '/companies': 'Empresas',
  '/deals': 'Deals & Pipeline',
  '/tickets': 'Tickets de Soporte',
  '/tasks': 'Tareas',
  '/activities': 'Actividades',
  '/email-marketing': 'Email Marketing',
  '/sequences': 'Secuencias',
  '/reports': 'Reportes',
  '/products': 'Productos',
  '/quotes': 'Cotizaciones',
  '/inbox': 'Bandeja de Entrada',
  '/settings': 'Configuración',
}

interface TopBarProps {
  onSearch: () => void
}

export function TopBar({ onSearch }: TopBarProps) {
  const location = useLocation()
  const { currentUser } = useUserStore()
  const { addToast } = useUIStore()

  const basePath = '/' + location.pathname.split('/')[1]
  const title = PAGE_TITLES[basePath] || 'CRM Central'
  const today = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 capitalize">{title}</h1>
        <p className="text-xs text-gray-400 capitalize hidden sm:block">{today}</p>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={onSearch}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 w-52"
        >
          <Search className="w-4 h-4" />
          <span>Buscar...</span>
          <kbd className="ml-auto text-xs bg-gray-200 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </button>

        {/* Quick Create */}
        <Dropdown
          trigger={
            <button className="btn-primary gap-1.5 py-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Crear</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          }
          items={[
            { label: 'Nuevo Contacto', onClick: () => window.dispatchEvent(new CustomEvent('create-contact')) },
            { label: 'Nueva Empresa', onClick: () => window.dispatchEvent(new CustomEvent('create-company')) },
            { label: 'Nuevo Deal', onClick: () => window.dispatchEvent(new CustomEvent('create-deal')) },
            { label: 'Nueva Tarea', onClick: () => window.dispatchEvent(new CustomEvent('create-task')) },
            { label: 'Nuevo Ticket', onClick: () => window.dispatchEvent(new CustomEvent('create-ticket')) },
          ]}
          align="right"
        />

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal rounded-full" />
        </button>

        {/* User Menu */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Avatar name={`${currentUser.firstName} ${currentUser.lastName}`} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700 leading-tight">{currentUser.firstName}</p>
                <p className="text-xs text-gray-400 leading-tight">{currentUser.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          }
          items={[
            { label: 'Mi Perfil', icon: <User className="w-4 h-4" />, onClick: () => {} },
            { label: 'Configuración', icon: <Settings className="w-4 h-4" />, onClick: () => {} },
            { label: 'Ayuda', icon: <HelpCircle className="w-4 h-4" />, onClick: () => {} },
            { label: 'Cerrar sesión', icon: <LogOut className="w-4 h-4" />, onClick: () => addToast({ type: 'info', title: 'Sesión cerrada' }), danger: true },
          ]}
          align="right"
        />
      </div>
    </div>
  )
}
