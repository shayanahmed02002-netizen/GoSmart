import React from 'react'
import { STAGES } from '../../services/dataService'
import Avatar from '../ui/Avatar'

export default function DealCard({ deal, onDragStart }) {
  const stage = STAGES.find((s) => s.id === deal.stage)
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      className="bg-surface border border-line rounded-lg p-3 mb-2.5 cursor-grab active:cursor-grabbing hover:shadow-card transition-shadow"
      style={{ borderLeft: `3px solid ${stage?.color}` }}
    >
      <p className="text-sm font-medium text-ink mb-1.5 leading-snug">{deal.title}</p>
      <div className="flex items-center justify-between mb-2">
        <span className="font-display font-bold text-sm text-ink">${deal.value.toLocaleString()}</span>
        <Avatar name={deal.contactName} color={deal.avatarColor} size={22} />
      </div>
      <p className="text-xs text-subink">{deal.daysInStage}d in stage · {deal.owner}</p>
    </div>
  )
}
