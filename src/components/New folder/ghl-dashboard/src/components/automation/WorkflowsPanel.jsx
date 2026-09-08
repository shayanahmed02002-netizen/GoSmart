import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { dataService } from '../../services/dataService'
import PrimaryButton from '../ui/PrimaryButton'
import Skeleton from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'
import WorkflowCard from './WorkflowCard'
import WorkflowBuilder from './WorkflowBuilder'

export default function WorkflowsPanel() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [builderTarget, setBuilderTarget] = useState(null) // null = hidden, {} = new, workflow = edit

  const load = () => {
    setLoading(true)
    dataService.getWorkflows().then((res) => {
      setWorkflows(res)
      setLoading(false)
    })
  }

  useEffect(load, [])

  const toggleStatus = async (workflow) => {
    const next = workflow.status === 'active' ? 'paused' : 'active'
    setWorkflows((prev) => prev.map((w) => (w.id === workflow.id ? { ...w, status: next } : w)))
    await dataService.updateWorkflow(workflow.id, { status: next })
  }

  const remove = async (workflow) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== workflow.id))
    await dataService.deleteWorkflow(workflow.id)
  }

  if (builderTarget) {
    return (
      <WorkflowBuilder
        workflow={builderTarget.id ? builderTarget : null}
        onClose={() => setBuilderTarget(null)}
        onSaved={() => { setBuilderTarget(null); load() }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PrimaryButton icon={Plus} onClick={() => setBuilderTarget({})}>Create Workflow</PrimaryButton>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-52 w-full" />)}
        </div>
      )}

      {!loading && workflows.length === 0 && (
        <EmptyState title="No workflows yet" subtitle="Create your first automation to start nurturing leads automatically." />
      )}

      {!loading && workflows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workflows.map((w) => (
            <WorkflowCard
              key={w.id}
              workflow={w}
              onToggleStatus={toggleStatus}
              onEdit={(wf) => setBuilderTarget(wf)}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </div>
  )
}
