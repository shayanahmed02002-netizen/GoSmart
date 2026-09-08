import React, { useEffect, useState } from 'react'
import { dataService } from '../../services/dataService'
import Card from '../ui/Card'
import { Badge } from '../ui/Badge'

export default function FunnelsPanel() {
  const [funnels, setFunnels] = useState([])
  useEffect(() => { dataService.getFunnels().then(setFunnels) }, [])
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {funnels.map((f) => {
        const rate = ((f.conversions / f.visitors) * 100).toFixed(1)
        return (
          <Card key={f.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="font-medium text-sm text-ink pr-2">{f.name}</p>
              <Badge color={f.status === 'active' ? '#22A87A' : '#5B6270'} bg={f.status === 'active' ? '#E4F6EF' : '#F0F1F3'}>{f.status}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><p className="font-display font-bold text-base">{f.visitors.toLocaleString()}</p><p className="text-[11px] text-subink">Visitors</p></div>
              <div><p className="font-display font-bold text-base">{f.optIns.toLocaleString()}</p><p className="text-[11px] text-subink">Opt-ins</p></div>
              <div><p className="font-display font-bold text-base text-primary">{rate}%</p><p className="text-[11px] text-subink">Converted</p></div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
