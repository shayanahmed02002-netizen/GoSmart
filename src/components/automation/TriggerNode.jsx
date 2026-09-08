import React from 'react'
import { TRIGGER_TYPES, STAGES } from '../../services/dataService'
import StepIcon from './StepIcon'

const inputCls = 'w-full bg-canvas border border-line rounded-lg px-2.5 py-1.5 text-sm text-ink outline-none focus:border-primary'

export default function TriggerNode({ trigger, onChange }) {
  const current = TRIGGER_TYPES.find((t) => t.id === trigger.type) || TRIGGER_TYPES[0]

  return (
    <div className="bg-accent-light border border-accent/30 rounded-xl2 shadow-card p-3.5 w-80">
      <div className="flex items-center gap-2.5 mb-1">
        <span className="w-7 h-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
          <StepIcon name="Zap" size={15} />
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">Trigger</p>
      </div>

      <select
        className={`${inputCls} mb-1.5 font-medium`}
        value={trigger.type}
        onChange={(e) => onChange({ type: e.target.value, config: {} })}
      >
        {TRIGGER_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
      <p className="text-xs text-subink">{current.description}</p>

      {trigger.type === 'stage_changed' && (
        <select
          className={`${inputCls} mt-2`}
          value={trigger.config?.stage || STAGES[0].id}
          onChange={(e) => onChange({ ...trigger, config: { stage: e.target.value } })}
        >
          {STAGES.map((s) => <option key={s.id} value={s.id}>Moves into "{s.label}"</option>)}
        </select>
      )}
    </div>
  )
}
