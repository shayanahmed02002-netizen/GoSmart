import React from 'react'
import { Pencil, Trash2, MessageCircle, FileText } from 'lucide-react'
import Card from '../ui/Card'
import { Badge } from '../ui/Badge'

const STATUS_STYLE = {
  active: { color: '#22A87A', bg: '#E4F6EF', label: 'Active' },
  draft: { color: '#5B6270', bg: '#F0F1F3', label: 'Draft' },
}

export default function AgentCard({ agent, onToggleStatus, onEdit, onTest, onDelete }) {
  const status = STATUS_STYLE[agent.status] || STATUS_STYLE.draft
  const docCount = agent.documents?.length || 0

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2.5">
        <div>
          <p className="font-medium text-sm text-ink mb-0.5">{agent.name}</p>
          <p className="text-xs text-subink line-clamp-2">{agent.description || 'No description yet.'}</p>
        </div>
        <Badge color={status.color} bg={status.bg}>{status.label}</Badge>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-subink mb-3.5">
        <FileText size={13} />
        <span>{docCount} {docCount === 1 ? 'document' : 'documents'} in knowledge base</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center mb-3.5">
        <div>
          <p className="font-display font-bold text-base">{docCount}</p>
          <p className="text-[11px] text-subink">Sources</p>
        </div>
        <div>
          <p className="font-display font-bold text-base text-primary">{(agent.conversationsCount || 0).toLocaleString()}</p>
          <p className="text-[11px] text-subink">Questions Answered</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-line">
        <button
          onClick={() => onToggleStatus(agent)}
          className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
            agent.status === 'active' ? 'text-warn hover:bg-warn-light' : 'text-won hover:bg-won-light'
          }`}
        >
          {agent.status === 'active' ? 'Pause' : 'Activate'}
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => onTest(agent)} className="p-1.5 rounded-md text-subink hover:text-primary hover:bg-canvas" title="Test agent">
            <MessageCircle size={14} />
          </button>
          <button onClick={() => onEdit(agent)} className="p-1.5 rounded-md text-subink hover:text-ink hover:bg-canvas" title="Edit">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(agent)} className="p-1.5 rounded-md text-subink hover:text-danger hover:bg-danger-light" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </Card>
  )
}
