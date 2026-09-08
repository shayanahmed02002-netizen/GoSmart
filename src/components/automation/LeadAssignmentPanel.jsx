import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { dataService } from '../../services/dataService'
import PrimaryButton from '../ui/PrimaryButton'
import Skeleton from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'
import SlideOver from '../ui/SlideOver'
import RuleCard from './RuleCard'
import RuleForm from './RuleForm'

export default function LeadAssignmentPanel() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [formTarget, setFormTarget] = useState(null) // null = closed, {} = new, rule = edit

  const load = () => {
    setLoading(true)
    dataService.getAssignmentRules().then((res) => {
      setRules(res)
      setLoading(false)
    })
  }

  useEffect(load, [])

  const toggleActive = async (rule) => {
    setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, active: !r.active } : r)))
    await dataService.updateAssignmentRule(rule.id, { active: !rule.active })
  }

  const remove = async (rule) => {
    setRules((prev) => prev.filter((r) => r.id !== rule.id))
    await dataService.deleteAssignmentRule(rule.id)
  }

  const move = async (rule, direction) => {
    const sorted = [...rules].sort((a, b) => a.priority - b.priority)
    const idx = sorted.findIndex((r) => r.id === rule.id)
    const swapIdx = idx + direction
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const other = sorted[swapIdx]
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === rule.id) return { ...r, priority: other.priority }
        if (r.id === other.id) return { ...r, priority: rule.priority }
        return r
      })
    )
    await Promise.all([
      dataService.updateAssignmentRule(rule.id, { priority: other.priority }),
      dataService.updateAssignmentRule(other.id, { priority: rule.priority }),
    ])
  }

  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-subink max-w-md">
          Rules run top to bottom — the first matching rule assigns the lead. Drag priority with the arrows to reorder.
        </p>
        <PrimaryButton icon={Plus} onClick={() => setFormTarget({})}>New Rule</PrimaryButton>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      )}

      {!loading && sortedRules.length === 0 && (
        <EmptyState title="No assignment rules yet" subtitle="Create a rule to automatically route new leads to the right rep." />
      )}

      {!loading && sortedRules.length > 0 && (
        <div className="space-y-3">
          {sortedRules.map((rule, i) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onToggleActive={toggleActive}
              onEdit={(r) => setFormTarget(r)}
              onDelete={remove}
              onMoveUp={() => move(rule, -1)}
              onMoveDown={() => move(rule, 1)}
              isFirst={i === 0}
              isLast={i === sortedRules.length - 1}
            />
          ))}
        </div>
      )}

      <SlideOver open={!!formTarget} onClose={() => setFormTarget(null)} title={formTarget?.id ? 'Edit Rule' : 'New Assignment Rule'}>
        {formTarget && (
          <RuleForm
            rule={formTarget.id ? formTarget : null}
            onSaved={() => { setFormTarget(null); load() }}
            onCancel={() => setFormTarget(null)}
          />
        )}
      </SlideOver>
    </div>
  )
}
