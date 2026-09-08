import React, { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import DashboardView from './components/dashboard/DashboardView'
import CrmView from './components/crm/CrmView'
import CalendarView from './components/calendar/CalendarView'
import ConversationsView from './components/conversations/ConversationsView'
import MarketingView from './components/marketing/MarketingView'
import AutomationView from './components/automation/AutomationView'
import LoginView from './components/auth/LoginView'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)

  const views = {
    dashboard: <DashboardView />,
    crm: <CrmView />,
    calendar: <CalendarView />,
    conversations: <ConversationsView />,
    marketing: <MarketingView />,
    automations: <AutomationView />,
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-canvas">
        <div className="w-8 h-8 border-2 border-line border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <LoginView />
  }

  return (
    <div className="flex h-screen w-full overflow-hidden font-body">
      <Sidebar active={page} onNavigate={setPage} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar page={page} onAdd={() => {}} />
        <main className="flex-1 overflow-y-auto p-6">{views[page]}</main>
      </div>
    </div>
  )
}
