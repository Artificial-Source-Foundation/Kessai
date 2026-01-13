import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'

export function AppShell() {
  return (
    <div className="relative flex h-screen overflow-hidden">
      <div className="glow-blob bg-primary/20 fixed -top-32 -left-32 h-96 w-96" />
      <div className="glow-blob bg-accent-cyan/20 fixed -right-32 -bottom-32 h-96 w-96" />
      <div className="glow-blob bg-primary/10 fixed top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2" />

      <Sidebar />

      <main className="relative flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
