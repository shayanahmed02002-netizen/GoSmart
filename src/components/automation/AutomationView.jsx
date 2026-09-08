import React, { useState } from 'react'
import WorkflowsPanel from './WorkflowsPanel'
import LeadAssignmentPanel from './LeadAssignmentPanel'
import AgentsPanel from './AgentsPanel'

const TABS = [
  { id: 'workflows', label: 'Workflows' },
  { id: 'assignment', label: 'Lead Assignment' },
  { id: 'agents', label: 'AI Agents' },
]

export default function AutomationView() {
  const [tab, setTab] = useState('workflows')
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
      {tab === 'workflows' && <WorkflowsPanel />}
      {tab === 'assignment' && <LeadAssignmentPanel />}
      {tab === 'agents' && <AgentsPanel />}
    </div>
  )
}