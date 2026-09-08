import React from 'react'
import { Trash2 } from 'lucide-react'
import { ACTION_TYPES, OWNERS, TAG_POOL, STAGES } from '../../services/dataService'
import StepIcon from './StepIcon'

const inputCls = 'w-full bg-canvas border border-line rounded-lg px-2.5 py-1.5 text-sm text-ink outline-none focus:border-primary'

function ConfigFields({ type, config, onChange }) {
  const set = (patch) => onChange({ ...config, ...patch })

  switch (type) {
    case 'send_sms':
      return (
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          placeholder="Message text..."
          value={config.message || ''}
          onChange={(e) => set({ message: e.target.value })}
        />
      )
    case 'send_email':
      return (
        <div className="space-y-1.5">
          <input className={inputCls} placeholder="Subject line" value={config.subject || ''} onChange={(e) => set({ subject: e.target.value })} />
          <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Email body..." value={config.body || ''} onChange={(e) => set({ body: e.target.value })} />
        </div>
      )
    case 'wait':
      return (
        <div className="flex gap-1.5">
          <input
            type="number"
            min={1}
            className={`${inputCls} w-20`}
            value={config.duration ?? 1}
            onChange={(e) => set({ duration: Number(e.target.value) })}
          />
          <select className={inputCls} value={config.unit || 'hours'} onChange={(e) => set({ unit: e.target.value })}>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
      )
    case 'add_tag':
      return (
        <select className={inputCls} value={config.tag || TAG_POOL[0]} onChange={(e) => set({ tag: e.target.value })}>
          {TAG_POOL.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      )
    case 'assign_owner':
      return (
        <select className={inputCls} value={config.owner || OWNERS[0]} onChange={(e) => set({ owner: e.target.value })}>
          {OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    case 'move_stage':
      return (
        <select className={inputCls} value={config.stage || STAGES[0].id} onChange={(e) => set({ stage: e.target.value })}>
          {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      )
    case 'create_task':
      return (
        <input className={inputCls} placeholder="Task description" value={config.task || ''} onChange={(e) => set({ task: e.target.value })} />
      )
    case 'notify_team':
      return (
        <input className={inputCls} placeholder="Notification message" value={config.message || ''} onChange={(e) => set({ message: e.target.value })} />
      )
    default:
      return null
  }
}

export default function StepNode({ step, onChange, onDelete }) {
  const action = ACTION_TYPES.find((a) => a.id === step.type) || ACTION_TYPES[0]

  return (
    <div className="bg-surface border border-line rounded-xl2 shadow-card p-3.5 w-80">
      <div className="flex items-center gap-2.5 mb-2.5">
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${action.color}1A`, color: action.color }}
        >
          <StepIcon name={action.icon} size={15} />
        </span>
        <p className="text-sm font-semibold text-ink flex-1">{action.label}</p>
        <button onClick={onDelete} className="p-1 rounded-md text-subink hover:text-danger hover:bg-danger-light" title="Remove step">
          <Trash2 size={14} />
        </button>
      </div>
      <ConfigFields type={step.type} config={step.config || {}} onChange={(config) => onChange({ ...step, config })} />
    </div>
  )
}
