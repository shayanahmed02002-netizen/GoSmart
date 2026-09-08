import React from 'react'
import { Search, Bell, Plus } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import UserMenu from './UserMenu'

export const PAGE_META = {
  dashboard: { title: 'Dashboard', subtitle: 'Your business at a glance' },
  crm: { title: 'CRM', subtitle: 'Contacts and pipeline' },
  calendar: { title: 'Calendar', subtitle: 'Appointments and scheduling' },
  conversations: { title: 'Conversations', subtitle: 'All your messages in one inbox' },
  marketing: { title: 'Marketing', subtitle: 'Funnels, campaigns and performance' },
  automations: { title: 'Automations', subtitle: 'Workflows and lead assignment' },
  settings: { title: 'Settings', subtitle: 'Manage your agency workspace' },
}

export default function Topbar({ page, onAdd }) {
  const meta = PAGE_META[page]
  return (
    <header className="h-16 bg-surface border-b border-line flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="font-display font-bold text-lg leading-tight">{meta.title}</h1>
        <p className="text-xs text-subink">{meta.subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 bg-canvas border border-line rounded-lg px-3 py-2 w-64">
          <Search size={15} className="text-subink" />
          <input
            placeholder="Search contacts, deals..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-subink/70"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-canvas">
          <Bell size={18} className="text-subink" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-danger" />
        </button>
        <PrimaryButton icon={Plus} onClick={onAdd}>Add New</PrimaryButton>
        <div className="w-px h-6 bg-line" />
        <UserMenu />
      </div>
    </header>
  )
}
