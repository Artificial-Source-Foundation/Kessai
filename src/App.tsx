import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { AppShell } from '@/components/layout/app-shell'
import { Dashboard } from '@/pages/dashboard'
import { Subscriptions } from '@/pages/subscriptions'
import { CalendarPage } from '@/pages/calendar'
import { SettingsPage } from '@/pages/settings'
import '@/styles/globals.css'

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="subby-theme">
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'hsl(222 47% 11%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'hsl(210 40% 98%)',
          },
        }}
      />
    </ThemeProvider>
  )
}
