import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { CommandPalette } from './CommandPalette'
import { ToastContainer } from './ToastContainer'
import { useUIStore } from '../../store'
import { cn } from '../../utils'

export function Layout() {
  const { sidebarCollapsed, commandPaletteOpen, openCommandPalette, closeCommandPalette } = useUIStore()
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className={cn('flex-1 flex flex-col min-w-0 transition-all duration-300', sidebarCollapsed ? 'ml-16' : 'ml-60')}>
        <TopBar onSearch={() => setPaletteOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ToastContainer />
    </div>
  )
}
