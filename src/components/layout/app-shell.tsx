import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-6xl p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
