import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { TRIGGER_TYPES, ACTION_TYPES } from '../../services/dataService'
import Card from '../ui/Card'
import { Badge } from '../ui/Badge'
import StepIcon from './StepIcon'

const STATUS_STYLE = {
  active: { color: '#22A87A', bg: '#E4F6EF', label: 'Active' },
  paused: { color: '#F5A623', bg: '#FDF2DE', label: 'Paused' },
  draft: { color: '#5B6270', bg: '#F0F1F3', label: 'Draft' },
}

export default function WorkflowCard({ workflow, onToggleStatus, onEdit, onDelete }) {
  const trigger = TRIGGER_TYPES.find((t) => t.id === workflow.trigger?.type)
  const status = STATUS_STYLE[workflow.status] || STATUS_STYLE.draft
  const rate = workflow.enrolled ? Math.round((workflow.completed / workflow.enrolled) * 100) : 0

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2.5">
        <div>
          <p className="font-medium text-sm text-ink mb-0.5">{workflow.name}</p>
          <p className="text-xs text-subink">Trigger: {trigger?.label || 'Unknown'}</p>
        </div>
        <Badge color={status.color} bg={status.bg}>{status.label}</Badge>
      </div>

      <div className="flex items-center gap-1.5 mb-3.5">
        {workflow.steps.slice(0, 6).map((step) => {
          const action = ACTION_TYPES.find((a) => a.id === step.type)
          return (
            <span
              key={step.id}
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ backgroundColor: `${action?.color}1A`, color: action?.color }}
              title={action?.label}
            >
              <StepIcon name={action?.icon} size={12} />
            </span>
          )
        })}
        {workflow.steps.length === 0 && <span className="text-xs text-subink">No actions yet</span>}
      </div>

      <div className="grid grid-cols-2 gap-2 text-center mb-3.5">
        <div>
          <p className="font-display font-bold text-base">{workflow.enrolled.toLocaleString()}</p>
          <p className="text-[11px] text-subink">Enrolled</p>
        </div>
        <div>
          <p className="font-display font-bold text-base text-primary">{rate}%</p>
          <p className="text-[11px] text-subink">Completed</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-line">
        <button
          onClick={() => onToggleStatus(workflow)}
          className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
            workflow.status === 'active' ? 'text-warn hover:bg-warn-light' : 'text-won hover:bg-won-light'
          }`}
        >
          {workflow.status === 'active' ? 'Pause' : 'Activate'}
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(workflow)} className="p-1.5 rounded-md text-subink hover:text-ink hover:bg-canvas">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(workflow)} className="p-1.5 rounded-md text-subink hover:text-danger hover:bg-danger-light">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </Card>
  )
}
