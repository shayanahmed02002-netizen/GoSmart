import React from 'react'
import { Pencil, Trash2, ChevronUp, ChevronDown, Shuffle, UserCheck, Users } from 'lucide-react'
import { CONDITION_FIELDS, ASSIGNMENT_METHODS } from '../../services/dataService'
import Card from '../ui/Card'
import { Badge } from '../ui/Badge'
import Avatar from '../ui/Avatar'

const METHOD_ICON = { round_robin: Shuffle, least_busy: Users, specific_user: UserCheck }
const AVATAR_COLORS = ['#0EA5A5', '#6D5EF5', '#F5A623', '#EF5A6F', '#2F86EB']

export default function RuleCard({ rule, onToggleActive, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const method = ASSIGNMENT_METHODS.find((m) => m.id === rule.method)
  const MethodIcon = METHOD_ICON[rule.method] || Shuffle

  return (
    <Card className="p-4 flex items-center gap-4">
      <div className="flex flex-col shrink-0">
        <button onClick={onMoveUp} disabled={isFirst} className="p-0.5 text-subink hover:text-ink disabled:opacity-25">
          <ChevronUp size={15} />
        </button>
        <span className="text-xs text-center font-medium text-subink">{rule.priority}</span>
        <button onClick={onMoveDown} disabled={isLast} className="p-0.5 text-subink hover:text-ink disabled:opacity-25">
          <ChevronDown size={15} />
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-ink truncate">{rule.name}</p>
          <Badge color={rule.active ? '#22A87A' : '#5B6270'} bg={rule.active ? '#E4F6EF' : '#F0F1F3'}>
            {rule.active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <p className="text-xs text-subink">
          If{' '}
          {rule.conditions.map((c, i) => {
            const field = CONDITION_FIELDS.find((f) => f.id === c.field)
            return (
              <span key={i}>
                {i > 0 && ' and '}
                <span className="font-medium text-ink">{field?.label}</span> is <span className="font-medium text-ink">{c.value}</span>
              </span>
            )
          })}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 text-xs text-subink" title={method?.description}>
        <MethodIcon size={14} className="text-accent" />
        {method?.label}
      </div>

      <div className="flex -space-x-1.5 shrink-0">
        {rule.assignees.slice(0, 4).map((name, i) => (
          <Avatar key={name} name={name} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} size={26} />
        ))}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onToggleActive(rule)}
          className={`text-xs font-medium px-2.5 py-1.5 rounded-lg ${rule.active ? 'text-warn hover:bg-warn-light' : 'text-won hover:bg-won-light'}`}
        >
          {rule.active ? 'Disable' : 'Enable'}
        </button>
        <button onClick={() => onEdit(rule)} className="p-1.5 rounded-md text-subink hover:text-ink hover:bg-canvas">
          <Pencil size={14} />
        </button>
        <button onClick={() => onDelete(rule)} className="p-1.5 rounded-md text-subink hover:text-danger hover:bg-danger-light">
          <Trash2 size={14} />
        </button>
      </div>
    </Card>
  )
}
