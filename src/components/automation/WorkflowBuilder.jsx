import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { dataService } from '../../services/dataService'
import PrimaryButton from '../ui/PrimaryButton'
import TriggerNode from './TriggerNode'
import StepNode from './StepNode'
import AddStepMenu from './AddStepMenu'

const blankStep = (type) => ({ id: `tmp_${Math.random().toString(36).slice(2, 9)}`, type, config: {} })

export default function WorkflowBuilder({ workflow, onClose, onSaved }) {
  const isNew = !workflow?.id
  const [name, setName] = useState(workflow?.name || 'Untitled Workflow')
  const [trigger, setTrigger] = useState(workflow?.trigger || { type: 'new_lead', config: {} })
  const [steps, setSteps] = useState(workflow?.steps || [])
  const [saving, setSaving] = useState(false)

  const insertStep = (type, index) => {
    const next = [...steps]
    next.splice(index, 0, blankStep(type))
    setSteps(next)
  }
  const updateStep = (index, updated) => setSteps((prev) => prev.map((s, i) => (i === index ? updated : s)))
  const removeStep = (index) => setSteps((prev) => prev.filter((_, i) => i !== index))

  const save = async (status) => {
    setSaving(true)
    const payload = { name, trigger, steps, status }
    if (isNew) {
      await dataService.createWorkflow(payload)
    } else {
      await dataService.updateWorkflow(workflow.id, payload)
    }
    setSaving(false)
    onSaved()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-subink hover:text-ink">
          <ArrowLeft size={15} /> Back to workflows
        </button>
        <div className="flex items-center gap-2">
          <button
            disabled={saving}
            onClick={() => save('draft')}
            className="text-sm font-medium text-subink hover:text-ink px-3.5 py-2 rounded-lg border border-line disabled:opacity-50"
          >
            Save as Draft
          </button>
          <PrimaryButton onClick={() => save('active')} className={saving ? 'opacity-50 pointer-events-none' : ''}>
            {isNew ? 'Create & Activate' : 'Save & Activate'}
          </PrimaryButton>
        </div>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="font-display font-bold text-xl text-ink bg-transparent outline-none border-b border-transparent focus:border-line pb-1 w-full max-w-md"
      />

      <div className="flex flex-col items-center py-4">
        <TriggerNode trigger={trigger} onChange={setTrigger} />
        <div className="w-px h-6 bg-line" />
        <AddStepMenu onAdd={(type) => insertStep(type, 0)} />
        <div className="w-px h-6 bg-line" />

        {steps.map((step, i) => (
          <React.Fragment key={step.id}>
            <StepNode step={step} onChange={(updated) => updateStep(i, updated)} onDelete={() => removeStep(i)} />
            <div className="w-px h-6 bg-line" />
            <AddStepMenu onAdd={(type) => insertStep(type, i + 1)} />
            <div className="w-px h-6 bg-line" />
          </React.Fragment>
        ))}

        {steps.length === 0 && (
          <p className="text-xs text-subink -mt-2 mb-1">Add your first action to build out this workflow</p>
        )}
      </div>
    </div>
  )
}
