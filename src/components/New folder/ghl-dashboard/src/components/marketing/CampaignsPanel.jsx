import React, { useEffect, useState } from 'react'
import { dataService } from '../../services/dataService'
import Card from '../ui/Card'
import { Badge } from '../ui/Badge'

const STATUS_COLOR = { sent: ['#22A87A', '#E4F6EF'], scheduled: ['#F5A623', '#FDF2DE'], draft: ['#5B6270', '#F0F1F3'] }

export default function CampaignsPanel() {
  const [campaigns, setCampaigns] = useState([])
  useEffect(() => { dataService.getCampaigns().then(setCampaigns) }, [])
  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-subink border-b border-line">
              <th className="px-4 py-2.5 font-medium">Campaign</th>
              <th className="px-4 py-2.5 font-medium">Channel</th>
              <th className="px-4 py-2.5 font-medium">Sent</th>
              <th className="px-4 py-2.5 font-medium hidden sm:table-cell">Opened</th>
              <th className="px-4 py-2.5 font-medium hidden sm:table-cell">Clicked</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const [color, bg] = STATUS_COLOR[c.status] || STATUS_COLOR.draft
              return (
                <tr key={c.id} className="border-b border-line/60 hover:bg-canvas">
                  <td className="px-4 py-2.5 font-medium">{c.name}</td>
                  <td className="px-4 py-2.5 capitalize text-subink">{c.channel}</td>
                  <td className="px-4 py-2.5 text-subink">{c.sent.toLocaleString()}</td>
                  <td className="px-4 py-2.5 hidden sm:table-cell text-subink">{c.opened.toLocaleString()}</td>
                  <td className="px-4 py-2.5 hidden sm:table-cell text-subink">{c.clicked.toLocaleString()}</td>
                  <td className="px-4 py-2.5"><Badge color={color} bg={bg}>{c.status}</Badge></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
