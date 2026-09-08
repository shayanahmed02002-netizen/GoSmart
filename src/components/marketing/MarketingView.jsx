import React, { useState } from 'react'
import FunnelsPanel from './FunnelsPanel'
import CampaignsPanel from './CampaignsPanel'
import MarketingAnalytics from './MarketingAnalytics'

const TABS = [{ id: 'funnels', label: 'Funnels' }, { id: 'campaigns', label: 'Campaigns' }, { id: 'analytics', label: 'Analytics' }]

export default function MarketingView() {
  const [tab, setTab] = useState('funnels')
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
      {tab === 'funnels' && <FunnelsPanel />}
      {tab === 'campaigns' && <CampaignsPanel />}
      {tab === 'analytics' && <MarketingAnalytics />}
    </div>
  )
}
