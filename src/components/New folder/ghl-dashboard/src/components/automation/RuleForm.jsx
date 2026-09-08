import React, { useState } from 'react'
import { CONDITION_FIELDS, ASSIGNMENT_METHODS, OWNERS, dataService } from '../../services/dataService'
import PrimaryButton from '../ui/PrimaryButton'

const inputCls = 'w-full bg-canvas border border-line rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-primary'
const labelCls = 'text-xs font-semibold text-subink uppercase tracking-wide mb-1.5 block'

export default function RuleForm({ rule, onSaved, onCancel }) {
  const isNew = !rule?.id
  const [name, setName] = useState(rule?.name || '')
  const [field, setField] = useState(rule?.conditions?.[0]?.field || CONDITION_FIELDS[0].id)
  const [value, setValue] = useState(rule?.conditions?.[0]?.value || CONDITION_FIELDS[0].values[0])
  const [method, setMethod] = useState(rule?.method || 'round_robin')
  const [assignees, setAssignees] = useState(rule?.assignees || [])
  const [saving, setSaving] = useState(false)

  const fieldDef = CONDITION_FIELDS.find((f) => f.id === field)

  const toggleAssignee = (owner) => {
    setAssignees((prev) => {
      if (method === 'specific_user') return [owner]
      return prev.includes(owner) ? prev.filter((a) => a !== owner) : [...prev, owner]
    })
  }

  const save = async () => {
    if (!name.trim() || assignees.length === 0) return
    setSaving(true)
    const payload = {
      name: name.trim(),
      method,
      active: rule?.active ?? true,
      priority: rule?.priority,
      conditions: [{ field, op: 'equals', value }],
      assignees,
    }
    if (isNew) {
      await dataService.createAssignmentRule(payload)
    } else {
      await dataService.updateAssignmentRule(rule.id, payload)
    }
    setSaving(false)
    onSaved()
  }

  return (
    <div className="space-y-5">
      <div>
        <label className={labelCls}>Rule Name</label>
        <input className={inputCls} placeholder="e.g. Facebook Ads → Sales Pod A" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <label className={labelCls}>Condition</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-subink shrink-0">If</span>
          <select
            className={inputCls}
            value={field}
            onChange={(e) => { setField(e.target.value); setValue(CONDITION_FIELDS.find((f) => f.id === e.target.value).values[0]) }}
          >
            {CONDITION_FIELDS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
          <span className="text-sm text-subink shrink-0">is</span>
          <select className={inputCls} value={value} onChange={(e) => setValue(e.target.value)}>
            {fieldDef.values.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Assignment Method</label>
        <div className="space-y-1.5">
          {ASSIGNMENT_METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => { setMethod(m.id); if (m.id === 'specific_user') setAssignees(assignees.slice(0, 1)) }}
              className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                method === m.id ? 'border-primary bg-primary-light' : 'border-line hover:bg-canvas'
              }`}
            >
              <p className="text-sm font-medium text-ink">{m.label}</p>
              <p className="text-xs text-subink">{m.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>{method === 'specific_user' ? 'Assign To' : 'Eligible Team Members'}</label>
        <div className="flex flex-wrap gap-2">
          {OWNERS.map((owner) => {
            const selected = assignees.includes(owner)
            return (
              <button
                key={owner}
                onClick={() => toggleAssignee(owner)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  selected ? 'border-primary bg-primary text-white' : 'border-line text-subink hover:bg-canvas'
                }`}
              >
                {owner}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <PrimaryButton onClick={save} className={saving || !name.trim() || assignees.length === 0 ? 'opacity-50 pointer-events-none' : ''}>
          {isNew ? 'Create Rule' : 'Save Changes'}
        </PrimaryButton>
        <button onClick={onCancel} className="text-sm font-medium text-subink hover:text-ink px-3.5 py-2 rounded-lg border border-line">
          Cancel
        </button>
      </div>
    </div>
  )
}
