import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CreditCard,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'glass-panel relative flex flex-col transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-60'
        )}
      >
        <div className={cn('flex items-center gap-3 p-4', sidebarCollapsed && 'justify-center')}>
          <div className="from-primary to-accent-cyan shadow-glow-sm flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br">
            <span className="text-lg font-bold text-white">S</span>
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="gradient-text text-xl font-bold">Subby</h1>
              <p className="text-muted-foreground truncate text-xs">Subscription Tracker</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map(({ to, icon: Icon, label }) => {
            const linkContent = (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-foreground'
                      : 'text-muted-foreground hover:bg-glass-surface-hover hover:text-foreground',
                    sidebarCollapsed && 'justify-center px-0'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="bg-primary shadow-glow-sm absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full" />
                    )}
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                        isActive ? 'bg-primary/20' : 'group-hover:bg-glass-surface-hover'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                    </span>
                    {!sidebarCollapsed && <span>{label}</span>}
                  </>
                )}
              </NavLink>
            )

            if (sidebarCollapsed) {
              return (
                <Tooltip key={to}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return linkContent
          })}
        </nav>

        <div className="border-border border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
              'text-muted-foreground hover:text-foreground w-full justify-center gap-2',
              !sidebarCollapsed && 'justify-start px-3'
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
