import React from 'react'
import { STAGES } from '../../services/dataService'

export function Badge({ children, color, bg }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ color, backgroundColor: bg }}
    >
      {children}
    </span>
  )
}

export function StageBadge({ stageId }) {
  const stage = STAGES.find((s) => s.id === stageId) || STAGES[0]
  return <Badge color={stage.color} bg={`${stage.color}1A`}>{stage.label}</Badge>
}

export default Badge
