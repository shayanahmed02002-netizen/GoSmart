import React from 'react'
import { LayoutDashboard, Users, GitBranch, Calendar as CalendarIcon, MessageSquare, Megaphone, Zap, Menu } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../context/AuthContext'

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'crm', label: 'CRM', icon: Users },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { id: 'conversations', label: 'Conversations', icon: MessageSquare },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'automations', label: 'Automations', icon: Zap },
]

export default function Sidebar({ active, onNavigate, collapsed, onToggle }) {
  const { user } = useAuth()
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'
  const role = user?.user_metadata?.role || (user?.isDemo ? 'Demo workspace' : 'Team member')

  return (
    <aside
      className={`bg-sidebar text-white/80 flex flex-col shrink-0 transition-all duration-200 ${collapsed ? 'w-[72px]' : 'w-[228px]'}`}
    >
      <div className="flex items-center gap-2 px-4 h-16 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <GitBranch size={16} className="text-white" />
        </div>
        {!collapsed && <span className="font-display font-bold text-white text-[15px] tracking-tight">Pipeline HQ</span>}
      </div>

      <nav className="flex-1 px-2.5 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary/15 text-white' : 'text-white/60 hover:bg-sidebarhover hover:text-white'
                }`}
            >
              <Icon size={18} className={isActive ? 'text-primary' : ''} />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          )
        })}
      </nav>

      <div className="px-2.5 py-4 border-t border-white/10">
        <button onClick={onToggle} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-sidebarhover hover:text-white text-sm">
          <Menu size={18} />
          {!collapsed && <span>Collapse</span>}
        </button>
        <div className="flex items-center gap-2.5 px-3 pt-3">
          <Avatar name={name} color="#0EA5A5" size={30} />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{name}</p>
              <p className="text-white/40 text-xs truncate">{role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
