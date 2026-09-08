import React, { useState } from 'react'
import TeamSettings from './TeamSettings'

const TABS = [
  { id: 'team', label: 'Team' },
]

export default function SettingsView() {
  const [tab, setTab] = useState('team')

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-canvas border border-line rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.id ? 'bg-surface text-ink shadow-card' : 'text-subink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'team' && <TeamSettings />}
    </div>
  )
}
